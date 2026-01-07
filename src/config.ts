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
  toolModes?: string[];
  includeToolCollections?: string[];
  excludeToolCollections?: string[];
  includeSlices?: string[];
  excludeSlices?: string[];
  includeTools?: string[];
  excludeTools?: string[];
  allowedMediaPaths?: string[];
  readonly?: boolean;
  configSources: {
    clientId: "cli" | "env";
    clientSecret: "cli" | "env";
    baseUrl: "cli" | "env";
    toolModes?: "cli" | "env" | "none";
    includeToolCollections?: "cli" | "env" | "none";
    excludeToolCollections?: "cli" | "env" | "none";
    includeSlices?: "cli" | "env" | "none";
    excludeSlices?: "cli" | "env" | "none";
    includeTools?: "cli" | "env" | "none";
    excludeTools?: "cli" | "env" | "none";
    allowedMediaPaths?: "cli" | "env" | "none";
    readonly?: "cli" | "env" | "none";
    envFile: "cli" | "default";
  };
}

// ============================================================================
// Configuration Field Definitions - Table-Driven Approach
// ============================================================================

type ConfigFieldType = "string" | "boolean" | "csv" | "csv-path";

interface ConfigFieldDefinition {
  name: string;
  envVar: string;
  cliFlag: string;
  type: ConfigFieldType;
  required?: boolean;
  isAuth?: boolean;
  isSecret?: boolean;
}

const CONFIG_FIELDS: ConfigFieldDefinition[] = [
  // Auth fields (required)
  { name: "clientId", envVar: "UMBRACO_CLIENT_ID", cliFlag: "umbraco-client-id", type: "string", required: true, isAuth: true },
  { name: "clientSecret", envVar: "UMBRACO_CLIENT_SECRET", cliFlag: "umbraco-client-secret", type: "string", required: true, isAuth: true, isSecret: true },
  { name: "baseUrl", envVar: "UMBRACO_BASE_URL", cliFlag: "umbraco-base-url", type: "string", required: true, isAuth: true },
  // Optional fields
  { name: "toolModes", envVar: "UMBRACO_TOOL_MODES", cliFlag: "umbraco-tool-modes", type: "csv" },
  { name: "includeToolCollections", envVar: "UMBRACO_INCLUDE_TOOL_COLLECTIONS", cliFlag: "umbraco-include-tool-collections", type: "csv" },
  { name: "excludeToolCollections", envVar: "UMBRACO_EXCLUDE_TOOL_COLLECTIONS", cliFlag: "umbraco-exclude-tool-collections", type: "csv" },
  { name: "includeSlices", envVar: "UMBRACO_INCLUDE_SLICES", cliFlag: "umbraco-include-slices", type: "csv" },
  { name: "excludeSlices", envVar: "UMBRACO_EXCLUDE_SLICES", cliFlag: "umbraco-exclude-slices", type: "csv" },
  { name: "includeTools", envVar: "UMBRACO_INCLUDE_TOOLS", cliFlag: "umbraco-include-tools", type: "csv" },
  { name: "excludeTools", envVar: "UMBRACO_EXCLUDE_TOOLS", cliFlag: "umbraco-exclude-tools", type: "csv" },
  { name: "allowedMediaPaths", envVar: "UMBRACO_ALLOWED_MEDIA_PATHS", cliFlag: "umbraco-allowed-media-paths", type: "csv-path" },
  { name: "readonly", envVar: "UMBRACO_READONLY", cliFlag: "umbraco-readonly", type: "boolean" },
];

// ============================================================================
// Helper Functions
// ============================================================================

function maskSecret(secret: string): string {
  if (!secret || secret.length <= 4) return "****";
  return `****${secret.slice(-4)}`;
}

function parseValue(value: string | boolean | undefined, type: ConfigFieldType, fromCli: boolean): string | string[] | boolean | undefined {
  if (value === undefined) return undefined;

  switch (type) {
    case "string":
      return String(value);
    case "boolean":
      // Original behavior: only set to true if explicitly true, otherwise undefined
      // CLI: yargs returns boolean directly, trust it if truthy
      // ENV: only "true" (case-insensitive) sets the value
      if (fromCli) {
        return value ? true : undefined;
      }
      return String(value).toLowerCase() === "true" ? true : undefined;
    case "csv":
      return String(value).split(",").map(v => v.trim()).filter(Boolean);
    case "csv-path":
      return String(value).split(",").map(p => resolve(p.trim())).filter(Boolean);
    default:
      return String(value);
  }
}

interface ResolveResult {
  value: string | string[] | boolean | undefined;
  source: "cli" | "env" | "none";
}

function resolveConfigField(
  argv: CliArgs,
  field: ConfigFieldDefinition
): ResolveResult {
  const cliKey = field.cliFlag as keyof CliArgs;
  const cliValue = argv[cliKey];
  const envValue = process.env[field.envVar];

  if (cliValue !== undefined) {
    const value = parseValue(cliValue, field.type, true);
    // For boolean fields, undefined means "not set" - fall through to env
    if (value !== undefined) {
      return { value, source: "cli" };
    }
  }

  if (envValue !== undefined) {
    const value = parseValue(envValue, field.type, false);
    if (value !== undefined) {
      return { value, source: "env" };
    }
  }

  return { value: undefined, source: "none" };
}

function formatValueForLog(value: unknown, field: ConfigFieldDefinition): string {
  if (field.isSecret && typeof value === "string") {
    return maskSecret(value);
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

function logConfigField(
  value: unknown,
  source: "cli" | "env" | "none",
  field: ConfigFieldDefinition
): void {
  // Skip fields with no value set (except auth fields which are always logged)
  if (value === undefined && !field.isAuth) return;
  if (value === undefined) return;

  const displayValue = formatValueForLog(value, field);
  console.log(`- ${field.envVar}: ${displayValue} (source: ${source})`);
}

// ============================================================================
// CLI Arguments Interface
// ============================================================================

interface CliArgs {
  "umbraco-client-id"?: string;
  "umbraco-client-secret"?: string;
  "umbraco-base-url"?: string;
  "umbraco-tool-modes"?: string;
  "umbraco-include-tool-collections"?: string;
  "umbraco-exclude-tool-collections"?: string;
  "umbraco-include-slices"?: string;
  "umbraco-exclude-slices"?: string;
  "umbraco-include-tools"?: string;
  "umbraco-exclude-tools"?: string;
  "umbraco-allowed-media-paths"?: string;
  "umbraco-readonly"?: boolean;
  env?: string;
}

// ============================================================================
// Main Configuration Function
// ============================================================================

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
      "umbraco-tool-modes": {
        type: "string",
        description: "Comma-separated list of tool modes (e.g., content,media,editor)",
      },
      "umbraco-include-tool-collections": {
        type: "string",
        description: "Comma-separated list of tool collections to include",
      },
      "umbraco-exclude-tool-collections": {
        type: "string",
        description: "Comma-separated list of tool collections to exclude",
      },
      "umbraco-include-slices": {
        type: "string",
        description: "Comma-separated list of tool slices to include (e.g., create,read,tree)",
      },
      "umbraco-exclude-slices": {
        type: "string",
        description: "Comma-separated list of tool slices to exclude (e.g., delete,recycle-bin)",
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
      "umbraco-readonly": {
        type: "boolean",
        description: "Enable readonly mode - disables all write operations (create, update, delete)",
        default: false,
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

  // Initialize config structures
  const auth: UmbracoAuthConfig = {
    clientId: "",
    clientSecret: "",
    baseUrl: "",
  };

  const configSources: UmbracoServerConfig["configSources"] = {
    clientId: "env",
    clientSecret: "env",
    baseUrl: "env",
    toolModes: "none",
    includeToolCollections: "none",
    excludeToolCollections: "none",
    includeSlices: "none",
    excludeSlices: "none",
    includeTools: "none",
    excludeTools: "none",
    allowedMediaPaths: "none",
    readonly: "none",
    envFile: envFileSource,
  };

  const config: Partial<Omit<UmbracoServerConfig, "auth" | "configSources">> = {};

  // Resolve all config fields using table-driven approach
  const resolvedValues: Record<string, ResolveResult> = {};

  for (const field of CONFIG_FIELDS) {
    const result = resolveConfigField(argv, field);
    resolvedValues[field.name] = result;

    if (result.value !== undefined) {
      if (field.isAuth) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (auth as any)[field.name] = result.value;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any)[field.name] = result.value;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (configSources as any)[field.name] = result.source;
    }
  }

  // Validate required fields
  for (const field of CONFIG_FIELDS.filter(f => f.required)) {
    const result = resolvedValues[field.name];
    if (!result?.value) {
      console.error(
        `${field.envVar} is required (via CLI argument --${field.cliFlag} or .env file)`
      );
      process.exit(1);
    }
  }

  // Log configuration sources
  if (!isStdioMode) {
    console.log("\nUmbraco MCP Configuration:");
    console.log(`- ENV_FILE: ${envFilePath} (source: ${configSources.envFile})`);

    for (const field of CONFIG_FIELDS) {
      const result = resolvedValues[field.name];
      logConfigField(result.value, result.source, field);
    }

    console.log(); // Empty line for better readability
  }

  return {
    ...config,
    auth,
    configSources,
  };
}
