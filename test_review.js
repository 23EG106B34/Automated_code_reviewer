// Test the code review logic
const testCode1 = `var x = 1 == 2;
console.log(x);`;

const testCode2 = `function test() {
  if (x == 5) {
    return x;
  }
}`;

const testCode3 = `let result = true;
return result`;

const testCode4 = `const x = "hello;
const y = 5;`;

// Simple test - count how many errors should be detected
console.log("TEST CODE 1 - should have 2 errors (var, ==, console.log):");
console.log(testCode1);
console.log("\nTEST CODE 2 - should have 1 error (==):");
console.log(testCode2);
console.log("\nTEST CODE 3 - should have 1 warning (missing semicolon):");
console.log(testCode3);
console.log("\nTEST CODE 4 - should have 1 error (missing quote):");
console.log(testCode4);
