#!/usr/bin/env node

/**
 * Creates an Umbraco API user with client credentials for CI/CD.
 *
 * Flow:
 * 1. Login as admin (cookie-based)
 * 2. Get bearer token via Swagger OAuth client + PKCE
 * 3. Create API-type user
 * 4. Set client credentials
 *
 * Based on check-api-user.ts from @umbraco-cms/mcp-server-sdk.
 *
 * Usage:
 *   node infrastructure/ci/create-api-user.mjs [baseUrl] [adminEmail] [adminPassword]
 *
 * Defaults:
 *   baseUrl:       http://localhost:56472
 *   adminEmail:    admin@admin.com
 *   adminPassword: 1234567890
 */

import { createHash, randomBytes } from "node:crypto";

const BASE_URL = process.argv[2] || "http://localhost:56472";
const ADMIN_EMAIL = process.argv[3] || "admin@admin.com";
const ADMIN_PASSWORD = process.argv[4] || "1234567890";

const CLIENT_ID = "umbraco-back-office-mcp";
const CLIENT_SECRET = "1234567890";
const ADMIN_GROUP_KEY = "e5e7f6c8-7f9c-4b5b-8d5d-9e1e5a4f7e4d";
const SWAGGER_CLIENT_ID = "umbraco-swagger";

const TOKEN_PATH = "/umbraco/management/api/v1/security/back-office/token";
const LOGIN_PATH = "/umbraco/management/api/v1/security/back-office/login";
const AUTHORIZE_PATH = "/umbraco/management/api/v1/security/back-office/authorize";
const USER_PATH = "/umbraco/management/api/v1/user";

// ---- Helpers ----

function extractCookies(response) {
  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  if (setCookieHeaders.length === 0) return undefined;
  return setCookieHeaders.map((c) => c.split(";")[0]).join("; ");
}

// ---- Step 1: Check if API user already exists ----

async function checkExisting() {
  try {
    const res = await fetch(`${BASE_URL}${TOKEN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- Step 2: Login as admin ----

async function adminLogin() {
  const res = await fetch(`${BASE_URL}${LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    signal: AbortSignal.timeout(10_000),
    redirect: "manual",
  });

  if (!res.ok) {
    throw new Error(`Admin login failed: HTTP ${res.status}`);
  }

  const cookies = extractCookies(res);
  if (!cookies) {
    throw new Error("No auth cookie returned from admin login");
  }
  return cookies;
}

// ---- Step 3: Get bearer token via PKCE ----

async function getBearerToken(cookies) {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const redirectUri = `${BASE_URL}/umbraco/swagger/oauth2-redirect.html`;

  const authorizeUrl = new URL(`${BASE_URL}${AUTHORIZE_PATH}`);
  authorizeUrl.searchParams.set("client_id", SWAGGER_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const authRes = await fetch(authorizeUrl.toString(), {
    headers: { Cookie: cookies },
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });

  const location = authRes.headers.get("location");
  if (!location) {
    throw new Error("No redirect from authorize endpoint");
  }

  const authCode = new URL(location, BASE_URL).searchParams.get("code");
  if (!authCode) {
    throw new Error("No auth code in redirect URL");
  }

  const tokenRes = await fetch(`${BASE_URL}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: SWAGGER_CLIENT_ID,
      code: authCode,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: HTTP ${tokenRes.status}`);
  }

  const data = await tokenRes.json();
  if (!data.access_token) {
    throw new Error("No access_token in token response");
  }
  return data.access_token;
}

// ---- Step 4: Create API user ----

async function createApiUser(bearerToken) {
  const res = await fetch(`${BASE_URL}${USER_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      email: "mcp-api@localhost",
      userName: "mcp-api@localhost",
      name: "MCP API User",
      kind: "Api",
      userGroupIds: [{ id: ADMIN_GROUP_KEY }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      `Failed to create API user: ${body?.detail || body?.title || `HTTP ${res.status}`}`
    );
  }

  const location = res.headers.get("location");
  const userId = location?.split("/").pop();
  if (!userId) {
    throw new Error("Could not extract user ID from Location header");
  }
  return userId;
}

// ---- Step 5: Set client credentials ----

async function setClientCredentials(bearerToken, userId) {
  const res = await fetch(
    `${BASE_URL}${USER_PATH}/${userId}/client-credentials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      }),
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      `Failed to set credentials: ${body?.detail || body?.title || `HTTP ${res.status}`}`
    );
  }
}

// ---- Step 6: Get user details ----

async function getUserDetails(bearerToken, userId) {
  const res = await fetch(`${BASE_URL}${USER_PATH}/${userId}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to get user details: HTTP ${res.status}`);
  }
  return await res.json();
}

// ---- Main ----

async function main() {
  console.log(`Creating API user on ${BASE_URL}...`);

  // Check if already exists
  if (await checkExisting()) {
    console.log("API user already exists — skipping creation");
    process.exit(0);
  }

  // Login as admin
  console.log("  Logging in as admin...");
  const cookies = await adminLogin();

  // Get bearer token
  console.log("  Getting bearer token via PKCE...");
  const bearerToken = await getBearerToken(cookies);

  // Create user
  console.log("  Creating API user...");
  const userId = await createApiUser(bearerToken);
  console.log(`  User created: ${userId}`);

  // Set credentials
  console.log("  Setting client credentials...");
  await setClientCredentials(bearerToken, userId);

  // Verify auth works
  console.log("  Verifying auth...");
  if (!await checkExisting()) {
    throw new Error("API user was created but auth verification failed");
  }

  // Verify user details and sections
  console.log("  Checking user details...");
  const userDetails = await getUserDetails(bearerToken, userId);
  console.log(`  User sections: ${JSON.stringify(userDetails.allowedSections || [])}`);
  console.log(`  User groups: ${JSON.stringify((userDetails.userGroupIds || []).map(g => g.id))}`);
  console.log("API user created and verified successfully");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
