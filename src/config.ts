import { config as loadEnv } from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { resolve } from "path";

export interface UmbracoAuthConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface UmbracoServerConfig {
  auth: UmbracoAuthConfig;
  includeToolCollections?: string[];
  excludeToolCollections?: string[];
  includeTools?: string[];
  excludeTools?: string[];
  allowedMediaPaths?: string[];
  configSources: {
    clientId: "cli" | "env";
    clientSecret: "cli" | "env";
    baseUrl: "cli" | "env";
    includeToolCollections?: "cli" | "env" | "none";
    excludeToolCollections?: "cli" | "env" | "none";
    includeTools?: "cli" | "env" | "none";
    excludeTools?: "cli" | "env" | "none";
    allowedMediaPaths?: "cli" | "env" | "none";
    envFile: "cli" | "default";
  };
}

function maskSecret(secret: string): string {
  if (!secret || secret.length <= 4) return "****";
  return `****${secret.slice(-4)}`;
}

interface CliArgs {
  "umbraco-client-id"?: string;
  "umbraco-client-secret"?: string;
  "umbraco-base-url"?: string;
  "umbraco-include-tool-collections"?: string;
  "umbraco-exclude-tool-collections"?: string;
  "umbraco-include-tools"?: string;
  "umbraco-exclude-tools"?: string;
  "umbraco-allowed-media-paths"?: string;
  env?: string;
}

export function getServerConfig(isStdioMode: boolean): UmbracoServerConfig {
  // Parse command line arguments
  const argv = yargs(hideBin(process.argv))
    .options({
      "umbraco-client-id": {
        type: "string",
        description: "Umbraco API client ID",
      },
      "umbraco-client-secret": {
        type: "string",
        description: "Umbraco API client secret",
      },
      "umbraco-base-url": {
        type: "string",
        description: "Umbraco base URL (e.g., https://localhost:44391)",
      },
      "umbraco-include-tool-collections": {
        type: "string",
        description: "Comma-separated list of tool collections to include",
      },
      "umbraco-exclude-tool-collections": {
        type: "string",
        description: "Comma-separated list of tool collections to exclude",
      },
      "umbraco-include-tools": {
        type: "string",
        description: "Comma-separated list of tools to include",
      },
      "umbraco-exclude-tools": {
        type: "string",
        description: "Comma-separated list of tools to exclude",
      },
      "umbraco-allowed-media-paths": {
        type: "string",
        description: "Comma-separated list of allowed file system paths for media uploads (security: restricts file path access)",
      },
      env: {
        type: "string",
        description: "Path to custom .env file to load environment variables from",
      },
    })
    .help()
    .version(process.env.NPM_PACKAGE_VERSION ?? "unknown")
    .parseSync() as CliArgs;

  // Load environment variables ASAP from custom path or default
  let envFilePath: string;
  let envFileSource: "cli" | "default";

  if (argv["env"]) {
    envFilePath = resolve(argv["env"]);
    envFileSource = "cli";
  } else {
    envFilePath = resolve(process.cwd(), ".env");
    envFileSource = "default";
  }

  // Override anything auto-loaded from .env if a custom file is provided.
  loadEnv({ path: envFilePath, override: true });

  const auth: UmbracoAuthConfig = {
    clientId: "",
    clientSecret: "",
    baseUrl: "",
  };

  const config: Omit<UmbracoServerConfig, "auth"> = {
    includeToolCollections: undefined,
    excludeToolCollections: undefined,
    includeTools: undefined,
    excludeTools: undefined,
    allowedMediaPaths: undefined,
    configSources: {
      clientId: "env",
      clientSecret: "env",
      baseUrl: "env",
      includeToolCollections: "none",
      excludeToolCollections: "none",
      includeTools: "none",
      excludeTools: "none",
      allowedMediaPaths: "none",
      envFile: envFileSource,
    },
  };

  // Handle UMBRACO_CLIENT_ID
  if (argv["umbraco-client-id"]) {
    auth.clientId = argv["umbraco-client-id"];
    config.configSources.clientId = "cli";
  } else if (process.env.UMBRACO_CLIENT_ID) {
    auth.clientId = process.env.UMBRACO_CLIENT_ID;
    config.configSources.clientId = "env";
  }

  // Handle UMBRACO_CLIENT_SECRET
  if (argv["umbraco-client-secret"]) {
    auth.clientSecret = argv["umbraco-client-secret"];
    config.configSources.clientSecret = "cli";
  } else if (process.env.UMBRACO_CLIENT_SECRET) {
    auth.clientSecret = process.env.UMBRACO_CLIENT_SECRET;
    config.configSources.clientSecret = "env";
  }

  // Handle UMBRACO_BASE_URL
  if (argv["umbraco-base-url"]) {
    auth.baseUrl = argv["umbraco-base-url"];
    config.configSources.baseUrl = "cli";
  } else if (process.env.UMBRACO_BASE_URL) {
    auth.baseUrl = process.env.UMBRACO_BASE_URL;
    config.configSources.baseUrl = "env";
  }

  // Handle UMBRACO_INCLUDE_TOOL_COLLECTIONS
  if (argv["umbraco-include-tool-collections"]) {
    config.includeToolCollections = argv["umbraco-include-tool-collections"]
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    config.configSources.includeToolCollections = "cli";
  } else if (process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS) {
    config.includeToolCollections = process.env.UMBRACO_INCLUDE_TOOL_COLLECTIONS
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    config.configSources.includeToolCollections = "env";
  }

  // Handle UMBRACO_EXCLUDE_TOOL_COLLECTIONS
  if (argv["umbraco-exclude-tool-collections"]) {
    config.excludeToolCollections = argv["umbraco-exclude-tool-collections"]
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    config.configSources.excludeToolCollections = "cli";
  } else if (process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS) {
    config.excludeToolCollections = process.env.UMBRACO_EXCLUDE_TOOL_COLLECTIONS
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    config.configSources.excludeToolCollections = "env";
  }

  // Handle UMBRACO_INCLUDE_TOOLS
  if (argv["umbraco-include-tools"]) {
    config.includeTools = argv["umbraco-include-tools"]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    config.configSources.includeTools = "cli";
  } else if (process.env.UMBRACO_INCLUDE_TOOLS) {
    config.includeTools = process.env.UMBRACO_INCLUDE_TOOLS
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    config.configSources.includeTools = "env";
  }

  // Handle UMBRACO_EXCLUDE_TOOLS
  if (argv["umbraco-exclude-tools"]) {
    config.excludeTools = argv["umbraco-exclude-tools"]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    config.configSources.excludeTools = "cli";
  } else if (process.env.UMBRACO_EXCLUDE_TOOLS) {
    config.excludeTools = process.env.UMBRACO_EXCLUDE_TOOLS
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    config.configSources.excludeTools = "env";
  }

  // Handle UMBRACO_ALLOWED_MEDIA_PATHS
  if (argv["umbraco-allowed-media-paths"]) {
    config.allowedMediaPaths = argv["umbraco-allowed-media-paths"]
      .split(",")
      .map((p) => resolve(p.trim()))
      .filter(Boolean);
    config.configSources.allowedMediaPaths = "cli";
  } else if (process.env.UMBRACO_ALLOWED_MEDIA_PATHS) {
    config.allowedMediaPaths = process.env.UMBRACO_ALLOWED_MEDIA_PATHS
      .split(",")
      .map((p) => resolve(p.trim()))
      .filter(Boolean);
    config.configSources.allowedMediaPaths = "env";
  }

  // Validate configuration
  if (!auth.clientId) {
    console.error(
      "UMBRACO_CLIENT_ID is required (via CLI argument --umbraco-client-id or .env file)",
    );
    process.exit(1);
  }

  if (!auth.clientSecret) {
    console.error(
      "UMBRACO_CLIENT_SECRET is required (via CLI argument --umbraco-client-secret or .env file)",
    );
    process.exit(1);
  }

  if (!auth.baseUrl) {
    console.error(
      "UMBRACO_BASE_URL is required (via CLI argument --umbraco-base-url or .env file)",
    );
    process.exit(1);
  }

  // Log configuration sources
  if (!isStdioMode) {
    console.log("\nUmbraco MCP Configuration:");
    console.log(`- ENV_FILE: ${envFilePath} (source: ${config.configSources.envFile})`);
    console.log(
      `- UMBRACO_CLIENT_ID: ${auth.clientId} (source: ${config.configSources.clientId})`,
    );
    console.log(
      `- UMBRACO_CLIENT_SECRET: ${maskSecret(auth.clientSecret)} (source: ${config.configSources.clientSecret})`,
    );
    console.log(
      `- UMBRACO_BASE_URL: ${auth.baseUrl} (source: ${config.configSources.baseUrl})`,
    );

    if (config.includeToolCollections) {
      console.log(
        `- UMBRACO_INCLUDE_TOOL_COLLECTIONS: ${config.includeToolCollections.join(", ")} (source: ${config.configSources.includeToolCollections})`,
      );
    }

    if (config.excludeToolCollections) {
      console.log(
        `- UMBRACO_EXCLUDE_TOOL_COLLECTIONS: ${config.excludeToolCollections.join(", ")} (source: ${config.configSources.excludeToolCollections})`,
      );
    }

    if (config.includeTools) {
      console.log(
        `- UMBRACO_INCLUDE_TOOLS: ${config.includeTools.join(", ")} (source: ${config.configSources.includeTools})`,
      );
    }

    if (config.excludeTools) {
      console.log(
        `- UMBRACO_EXCLUDE_TOOLS: ${config.excludeTools.join(", ")} (source: ${config.configSources.excludeTools})`,
      );
    }

    if (config.allowedMediaPaths) {
      console.log(
        `- UMBRACO_ALLOWED_MEDIA_PATHS: ${config.allowedMediaPaths.join(", ")} (source: ${config.configSources.allowedMediaPaths})`,
      );
    }

    console.log(); // Empty line for better readability
  }

  return {
    ...config,
    auth,
  };
}
