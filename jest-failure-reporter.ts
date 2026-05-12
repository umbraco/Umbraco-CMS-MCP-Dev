import type { AggregatedResult } from "@jest/reporters";
import { writeFileSync, existsSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const OUTPUT_FILE = join(process.cwd(), "test-failures.log");

export default class FailureReporter {
  onRunComplete(_: Set<unknown>, results: AggregatedResult): void {
    const failures: string[] = [];

    for (const suite of results.testResults) {
      if (suite.numFailingTests === 0) continue;

      failures.push(`FAIL ${suite.testFilePath}`);
      for (const test of suite.testResults) {
        if (test.status === "failed") {
          failures.push(`  ● ${test.ancestorTitles.join(" › ")} › ${test.title}`);
          for (const msg of test.failureMessages) {
            const lines = msg.split("\n").slice(0, 5).map((l: string) => `    ${l}`);
            failures.push(lines.join("\n"));
          }
          failures.push("");
        }
      }
    }

    if (failures.length > 0) {
      const summary = [
        `Test Failures — ${new Date().toISOString()}`,
        `${results.numFailedTestSuites} suite(s), ${results.numFailedTests} test(s) failed`,
        "",
        ...failures,
      ].join("\n");

      writeFileSync(OUTPUT_FILE, summary);
      console.error(`\nFailures written to test-failures.log`);
    } else {
      if (existsSync(OUTPUT_FILE)) {
        unlinkSync(OUTPUT_FILE);
      }
    }
  }
}
