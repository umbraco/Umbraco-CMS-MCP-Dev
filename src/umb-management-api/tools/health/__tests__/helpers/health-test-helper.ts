import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

export class HealthTestHelper {
  /**
   * Normalizes health check responses for snapshot testing
   */
  static normalizeHealthCheckItems(result: any) {
    return createSnapshotResult(result);
  }

  /**
   * Cleanup method - Health checks don't create persistent data,
   * so this is primarily for consistency with the helper pattern
   */
  static async cleanup(): Promise<void> {
    // Health check tools are read-only operations
    // No persistent data to clean up
  }
}