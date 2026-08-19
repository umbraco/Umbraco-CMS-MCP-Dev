// Minimal ambient typing for the `cloudflare:workers` virtual module (resolved
// by wrangler at build time, not present in node_modules). Only covers the
// `tracing` export worker.ts uses — the full `@cloudflare/workers-types`
// package isn't a dependency here because it redefines DOM-ish globals
// (Request/Response/fetch/...) that collide with this repo's Node-targeted
// code, which also compiles under this same tsconfig.
//
// The `import(...)` type query (rather than a top-level `import`) is
// deliberate: a top-level import/export would make TypeScript treat this
// file as a module, and `declare module "cloudflare:workers"` in a module
// file only *augments* an existing module rather than declaring a new
// ambient one — silently leaving the import in worker.ts unresolved.
declare module "cloudflare:workers" {
  export const tracing: import("@umbraco-cms/mcp-hosted").CloudflareTracing;
}
