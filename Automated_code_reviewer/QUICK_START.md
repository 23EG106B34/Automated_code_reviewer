# QUICK START - Automated Code Reviewer

## ⚡ Get Running in 30 Seconds

```bash
cd "c:\Users\SHREE VARSHINI\Downloads\Automated_code_reviewer\Automated_code_reviewer"
npm install:all
npm run dev
```

Then open: **http://localhost:5173**

---

## 🎯 How to Use

### 1. Paste Code or Click "Try Sample"
```javascript
// Paste any JavaScript code with bugs
var x = 1 == 2  // Issues: var, loose comparison
console.log(x)  // Debug left in
```

### 2. Click "Get review & feelings"
System will analyze your code and developer mood

### 3. See Results

**Step 1 - Code Feedback**:
- What's wrong (with line numbers)
- How to fix it (plain English)
- Fixed code (ready to copy)

**Step 2 - How They Feel** (with emoji):
- 😊 Happy → Normal review
- 😐 Okay → Keep it brief  
- 😟 Stressed → Be extra kind
- 😫 Exhausted → Postpone if possible

---

## ✅ What Works Now

✅ Paste code → Get feedback  
✅ See 4 emotion states with emojis (😊 😐 😟 😫)  
✅ Copy fixed code  
✅ Try sample code  
✅ Proper error messages  

---

## 📊 Sample Output

**Input**:
```javascript
functon test() {
  var x = 5
  if (x == 5) console.log("hi")
}
```

**Output**:

**CODE FEEDBACK**:
- Line 1: Typo "functon" → "function"
- Line 2: Use "let" instead of "var"  
- Line 3: Use "===" instead of "=="
- Line 3: Remove console.log

**EMOTION**: 😐 Okay — nothing alarming  
**Tip**: "Use short comments. Skip tiny nitpicks."

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Backend not running. Check terminal for errors |
| "Network error" | Restart: `npm run dev` |
| Emojis not showing | Clear browser cache (Ctrl+Shift+Delete) |
| Port already in use | Kill process on 4000: `netstat -ano \| findstr :4000` |

---

For detailed guide, see `WORKING_GUIDE.md`
