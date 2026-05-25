#!/usr/bin/env node

/**
 * Quick test to verify fixed code is actually correct
 * Run: node test_fixed_code.js
 */

// Test cases with expected fixes
const testCases = [
  {
    name: "Multiple issues: var + == + console.log",
    input: `var x = 1 == 2;
console.log(x);`,
    expectedFixed: `let x = 1 === 2;`,
    description: "Should fix var, ==, and remove console.log"
  },
  {
    name: "Only var",
    input: `var count = 0;`,
    expectedFixed: `let count = 0;`,
    description: "Should change var to let"
  },
  {
    name: "Only loose comparison",
    input: `if (x == 5) { return true; }`,
    expectedFixed: `if (x === 5) { return true; }`,
    description: "Should change == to ==="
  },
  {
    name: "Typo: functon",
    input: `functon add(a, b) {
  return a + b;
}`,
    expectedFixed: `function add(a, b) {
  return a + b;
}`,
    description: "Should fix functon to function"
  },
  {
    name: "Typo: retun",
    input: `function test() {
  retun 42;
}`,
    expectedFixed: `function test() {
  return 42;
}`,
    description: "Should fix retun to return"
  },
  {
    name: "Clean code",
    input: `const x = 5;
return x;`,
    expectedFixed: `const x = 5;
return x;`,
    description: "Should not change clean code (or add semicolon)"
  }
];

console.log("FIXED CODE TEST SUITE");
console.log("====================\n");

testCases.forEach((test, idx) => {
  console.log(`Test ${idx + 1}: ${test.name}`);
  console.log(`Input:\n${test.input}`);
  console.log(`\nExpected fixed output:\n${test.expectedFixed}`);
  console.log(`\nDescription: ${test.description}`);
  console.log("---\n");
});

console.log("\n⚠️  MANUAL VERIFICATION NEEDED:");
console.log("1. Copy each input code");
console.log("2. Paste in the app");
console.log("3. Click 'Review Code'");
console.log("4. Copy the 'Fixed Code'");
console.log("5. Paste it back for another review");
console.log("6. It should show NO ERRORS (or very few)");
console.log("\nIf re-review shows same errors, the fix is not working!");
