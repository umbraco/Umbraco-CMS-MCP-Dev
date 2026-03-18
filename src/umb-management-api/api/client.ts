/**
 * Orval mutator — delegates to the SDK's UmbracoManagementClient.
 *
 * Orval cannot resolve npm package paths at generation time,
 * so this local file acts as the mutator target. The generated
 * code imports from here, which delegates to the SDK at runtime.
 */
import { UmbracoManagementClient as sdkClient } from "@umbraco-cms/mcp-server-sdk";

export const UmbracoManagementClient = <T>(
  config: { url: string; method: string; data?: unknown; params?: Record<string, unknown>; headers?: Record<string, string>; [key: string]: unknown },
  options?: { returnFullResponse?: boolean; validateStatus?: (status: number) => boolean; [key: string]: unknown },
): Promise<T> => {
  return sdkClient<T>(config, options);
};

export type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];
