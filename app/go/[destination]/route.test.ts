/**
 * Test for source normalization logic
 * Run: npx tsx app/go/\[destination\]/route.test.ts
 */

// Simulate the DESTINATIONS config
const DESTINATIONS = {
  bitopro: {
    url: "https://www.bitopro.com/users/sign_up?referrer=7276911675",
    allowedSources: ["fb", "fb_c1", "fb_btn", "fb_dm", "threads", "ig", "linktree", "site", "lp"],
  },
};

function testSourceNormalization() {
  const config = DESTINATIONS.bitopro;
  const testCases = [
    { input: "site", expected: "site" },
    { input: "lp", expected: "lp" },
    { input: "fb", expected: "fb" },
    { input: "fb_c1", expected: "fb_c1" },
    { input: "fb_btn", expected: "fb_btn" },
    { input: "fb_dm", expected: "fb_dm" },
    { input: "threads", expected: "threads" },
    { input: "ig", expected: "ig" },
    { input: "linktree", expected: "linktree" },
    { input: "invalid", expected: "other" },
    { input: "SITE", expected: "other" }, // case sensitive
    { input: "", expected: "other" },
  ];

  console.log("Testing source normalization...\n");
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const normalizedSrc = config.allowedSources.includes(testCase.input)
      ? testCase.input
      : "other";
    
    const status = normalizedSrc === testCase.expected ? "✓ PASS" : "✗ FAIL";
    console.log(`${status}: "${testCase.input}" → "${normalizedSrc}" (expected: "${testCase.expected}")`);
    
    if (normalizedSrc === testCase.expected) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

testSourceNormalization();
