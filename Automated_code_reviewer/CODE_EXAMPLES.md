# Code Examples & Corrections

## Example 1: Beginner Code (Lots of Issues)

### Input:
```javascript
functon calculateAge(birthYear) {
  var currentYear = 2024
  if (birthYear == 2000) {
    console.log("You were born in 2000")
  }
  return currentYear - birthYear
}

calculateAge(1990)
```

### Issues Found:
1. ❌ Line 1: **Typo** - "functon" should be "function"
2. ❌ Line 2: **Old-style variable** - Use "let" instead of "var"
3. ❌ Line 3: **Loose comparison** - Use "===" instead of "=="
4. ⚠️ Line 4: **Debug print** - Remove console.log before shipping

### Fixed Code:
```javascript
function calculateAge(birthYear) {
  let currentYear = 2024
  if (birthYear === 2000) {
    // Year 2000 milestone
  }
  return currentYear - birthYear;
}

calculateAge(1990)
```

### Emotion: 😟 Not Satisfied
- **Headline**: "Not satisfied — under stress"
- **Message**: "They may feel frustrated or overwhelmed. Be kind first."
- **Tip**: "Start with something positive. Only mention must-fix issues."

---

## Example 2: Good Code (No Issues)

### Input:
```javascript
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

const result = add(5, 3);
console.log(result);
```

### Issues Found:
- ✅ None! Code is clean.

### Emotion: 😊 Satisfied
- **Headline**: "Satisfied & doing well"
- **Message**: "This person seems in a good place. Normal friendly feedback is fine."
- **Tip**: "You can give a regular code review — clear and helpful."

---

## Example 3: Medium Code (Few Issues)

### Input:
```javascript
var user = {
  name: "Alice",
  age: 25
}

if (user.age == 25) {
  console.log("User is 25")
}

function getUser() {
  return user
}
```

### Issues Found:
1. ⚠️ Line 1: **Old-style variable** - Use "let" instead of "var"
2. ⚠️ Line 6: **Loose comparison** - Use "===" instead of "=="
3. ⚠️ Line 7: **Debug print** - Remove console.log

### Fixed Code:
```javascript
let user = {
  name: "Alice",
  age: 25
}

if (user.age === 25) {
  // User verification passed
}

function getUser() {
  return user;
}
```

### Emotion: 😐 Okay
- **Headline**: "Okay — nothing alarming"
- **Message**: "They seem fine but not super energized. Keep feedback simple."
- **Tip**: "Use short comments. Skip tiny nitpicks."

---

## Example 4: Bad Error Handling (Critical Issues)

### Input:
```javascript
function fetchData() {
  try {
    const data = JSON.parse(someString)
  } catch (e) {}
  return data
}

eval(userInput)
```

### Issues Found:
1. 🔴 **Empty catch block** - Errors are hidden!
2. 🔴 **Use of eval()** - Security risk! Can run malicious code.
3. ⚠️ **Undefined variable** - `data` might not be defined

### Fixed Code:
```javascript
function fetchData() {
  try {
    const data = JSON.parse(someString);
    return data;
  } catch (e) {
    console.error('Failed to parse data:', e);
    return null;
  }
}

// Instead of eval, use JSON.parse or safe alternatives
const result = JSON.parse(userInput);
```

### Emotion: 😫 Very Tired
- **Headline**: "Very tired — needs rest"
- **Message**: "High fatigue detected. They are NOT in a good headspace for harsh feedback."
- **Tip**: "Postpone non-urgent comments. Say 'looks good' when possible."

---

## Emotion Mapping Reference

### 😊 Satisfied & Doing Well
- **When**: Positive sentiment + Low fatigue + No code issues
- **Review Tone**: Normal, friendly, constructive
- **What to Avoid**: Don't over-explain basics
- **Example**: "Great refactor! I love how you simplified the logic here."

### 😐 Okay — Nothing Alarming
- **When**: Neutral sentiment + Moderate fatigue + Few code issues
- **Review Tone**: Brief, focused, skip nitpicks
- **What to Avoid**: Don't dump 10 comments
- **Example**: "The logic works. Consider using const instead of var (line 5)."

### 😟 Not Satisfied — Under Stress
- **When**: Frustrated sentiment + High fatigue + Several code issues
- **Review Tone**: Empathetic, highlight positives first
- **What to Avoid**: Don't criticize harshly
- **Example**: "I see you're working hard on this. Here are 2 important fixes… (defer style comments)"

### 😫 Very Tired — Needs Rest
- **When**: Burned out sentiment + Critical fatigue + Many code issues
- **Review Tone**: Extremely gentle, minimal feedback
- **What to Avoid**: Don't overload with feedback
- **Example**: "This looks good! (Actually schedule a break for this developer)"

---

## Common Corrections Made by System

| Issue | Bad | Good | Reason |
|-------|-----|------|--------|
| Function typo | `functon` | `function` | Syntax error |
| Variable decl. | `var x` | `let x` | Scope safety |
| Comparison | `x == y` | `x === y` | Type safety |
| Debug code | `console.log()` | Removed | Not for production |
| Error handling | `catch(e){}` | `catch(e){...}` | Prevents silent bugs |
| Unsafe code | `eval()` | Alternative | Security risk |
| Missing semicolon | `return x` | `return x;` | Style consistency |
| Unmatched brackets | `{... [` | `{...}` | Syntax error |

---

## Try These Now!

### Simple: Just styling issues
```javascript
var numbers = [1, 2, 3]
if (numbers.length == 3) {
  console.log("three items")
}
```

### Medium: Mix of style and logic
```javascript
functon calculate(a, b) {
  var result = a + b
  console.log(result)
  return result
}
```

### Complex: Error handling
```javascript
try {
  process(data)
} catch(e) {}
```

Paste any of these into the app and click "Get review & feelings"!
