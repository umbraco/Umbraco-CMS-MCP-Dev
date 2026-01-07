import { DEFAULT_MODEL, DEFAULT_VERBOSITY } from "./config.js";

// Track test results for summary
let testResults: { name: string; passed: boolean }[] = [];
let startTime: number;
let headerPrinted = false;

// Print header once at start
beforeAll(() => {
  if (DEFAULT_VERBOSITY === "quiet" && !headerPrinted) {
    headerPrinted = true;
    startTime = Date.now();
    console.log(`\uD83E\uDD16 LLM Evaluation Tests (${DEFAULT_MODEL})`);
  }
});

// Track each test result
afterEach(() => {
  if (DEFAULT_VERBOSITY === "quiet") {
    const testState = expect.getState();
    const passed = testState.numPassingAsserts > 0 || !testState.assertionCalls || testState.assertionCalls === testState.numPassingAsserts;
    const testName = testState.currentTestName || "Unknown test";

    // Only track if we haven't already (avoid duplicates)
    if (!testResults.find(r => r.name === testName)) {
      testResults.push({ name: testName, passed });
      const icon = passed ? "\u2705" : "\u274C";
      const status = passed ? "PASSED" : "FAILED";
      console.log(`${icon} ${testName}: ${status}`);
    }
  }
});

// Print summary at end
afterAll(() => {
  if (DEFAULT_VERBOSITY === "quiet") {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    console.log(`\n\uD83D\uDCCA Results: ${passed}/${total} tests passed (${elapsed}s)`);

    // Reset for next test file
    testResults = [];
    headerPrinted = false;
  }
});
