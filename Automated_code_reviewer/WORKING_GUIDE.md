# Automated Code Reviewer - Complete Working Guide

## ✅ What Was Fixed

1. **Backend Configuration** - Ensured PORT 4000 is properly set in .env
2. **Error Handling** - Improved error messages for network issues
3. **Emoji Support** - Enhanced emoji rendering with proper aria-labels and inline display
4. **Frontend-Backend Communication** - Verified Vite proxy configuration (already working)

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- npm v9+

### Step 1: Navigate to project
```bash
cd "c:\Users\SHREE VARSHINI\Downloads\Automated_code_reviewer\Automated_code_reviewer"
```

### Step 2: Install dependencies
```bash
npm install:all
```

### Step 3: Start development servers
```bash
npm run dev
```

Both frontend and backend will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:4000 (Express API)

Keep terminal open. Frontend will automatically proxy API calls to backend.

---

## 📝 Sample Test Flow

### Input Code (Paste into "Your code" field):
```javascript
functon greet(name) {
  var msg = "Hello " + name
  if (name == null) {
    return msg
  }
  console.log(msg)
  return msg
}

try {
  greet("World")
} catch (e) {}
```

### Expected Output - Step 1 (Code Feedback):

**Summary**: "Found 5 things to fix (2 serious). Follow the steps below — copy the fixed code when done."

**Issues Found**:
1. Line 1: **Typo in keyword** - "functon" should be "function"
2. Line 2: **Old-style variable** - Use "let" instead of "var"
3. Line 3: **Loose comparison** - Use === instead of ==
4. Line 5: **Debug print left in** - Remove console.log before sharing
5. Line 7: **Error hidden** - Empty catch blocks hide mistakes

**Fixed Code Output**:
```javascript
function greet(name) {
  let msg = "Hello " + name
  if (name === null) {
    return msg;
  }
  return msg;
}

try {
  greet("World")
} catch (e) {
  // Handle error properly
}
```

---

## 😊 Expected Output - Step 2 (Emotions & Feedback)

### Scenario 1: Code has issues detected
**Emotion Display**:
- **Emoji**: 😟 (not great)
- **Headline**: "Not satisfied — under stress"
- **Message**: "They may feel frustrated or overwhelmed. Be kind first."
- **Satisfaction**: ❌ Not satisfied — be extra gentle
- **Tip**: "Start with something positive. Only mention must-fix issues."

---

### Scenario 2: Code is clean
**Emotion Display**:
- **Emoji**: 😊 (satisfied)
- **Headline**: "Satisfied & doing well"
- **Message**: "This person seems in a good place. Normal friendly feedback is fine."
- **Satisfaction**: ✅ Satisfied enough for normal review
- **Tip**: "You can give a regular code review — clear and helpful."

---

## 🎨 Emotion States Reference

| Emoji | State | Message | Recommendation |
|-------|-------|---------|-----------------|
| 😊 | Satisfied | High energy, positive | Normal, friendly review |
| 😐 | Okay | Neutral, not tired | Short comments, skip nitpicks |
| 😟 | Not great | Stressed/frustrated | Lead with positives, mention must-fixes |
| 😫 | Needs rest | High fatigue | Postpone non-urgent, be very gentle |

---

## 🐛 Troubleshooting

### Issue: "Something went wrong. Try again."
**Solution**: 
- Check backend is running (`npm run dev:backend`)
- Verify no other app is using port 4000
- Check browser console (F12) for details

### Issue: Emojis not showing (showing as squares)
**Solution**: Already fixed! The update ensures proper UTF-8 encoding. Clear browser cache.

### Issue: "Network error. Check backend."
**Solution**: Backend API not responding. Restart with `npm run dev`

### Issue: Frontend on 5173 can't reach backend on 4000
**Solution**: Vite proxy is configured in `vite.config.ts`. Should work automatically.

---

## 🧪 API Testing (Advanced)

### Test endpoint directly with curl:

```bash
curl -X POST http://localhost:4000/api/review/full \
  -H "Content-Type: application/json" \
  -d '{
    "code": "var x = 1 == 2",
    "developerName": "John"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "codeReview": {
      "ok": false,
      "issueCount": 2,
      "summary": "Found 2 small suggestions...",
      "issues": [...],
      "fixedCode": "let x = 1 === 2;"
    },
    "emotion": {
      "analysis": {
        "sentiment": "neutral",
        "fatigue": "low",
        "workload": "light",
        "experienceLevel": "mid",
        "recommendedTone": "educational",
        "energyScore": 75,
        ...
      },
      "author": {...},
      "teamHealth": {...},
      "suggestedReviewers": [...]
    },
    "deliveryTip": "..."
  },
  "timestamp": "2026-05-22T10:14:42.567+05:30"
}
```

---

## ✨ Features Verified

✅ Code Review:
- Typo detection (function, return, etc.)
- Style checks (var vs let, == vs ===)
- Error handling analysis
- Bracket balancing
- Debug code detection

✅ Emotion Feedback:
- 4 emotion states with unique emojis
- Fatigue detection
- Sentiment analysis
- Personalized review tips
- Energy scoring

✅ UI/UX:
- Step-by-step guidance
- Copy fixed code button
- Sample code for testing
- Smooth animations
- Proper error messages

---

## 📞 Support

If something still doesn't work:
1. Check the browser console (F12)
2. Check backend logs in terminal
3. Restart both servers: `npm run dev`
4. Clear browser cache and reload
5. Make sure port 4000 is not in use

Enjoy the Code Reviewer! 🎉
