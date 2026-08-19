// Minimal ambient typing for the `cloudflare:workers` virtual module (resolved
// by wrangler at build time, not present in node_modules). Only covers the
// `tracing` export worker.ts uses — the full `@cloudflare/workers-types`
// package isn't a dependency here because it redefines DOM-ish globals
// (Request/Response/fetch/...) that collide with this repo's Node-targeted
// code, which also compiles under this same tsconfig.
declare module "cloudflare:workers" {
  interface CloudflareTracingSpan {
    setAttribute(key: string, value?: boolean | number | string): void;
  }

  export const tracing: {
    enterSpan<T>(name: string, callback: (span: CloudflareTracingSpan) => T): T;
  };
}
