# How to Run the Fixed Project

## Prerequisites
Make sure you have:
- Node.js installed
- npm or yarn available

## Step 1: Start the Backend
Open **Terminal 1** and run:
```bash
cd backend
npm install
npm start
```

You should see:
```
Server is running on http://localhost:4000
```

## Step 2: Start the Frontend
Open **Terminal 2** (new window) and run:
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

## Step 3: Open in Browser
Go to: **http://localhost:5173/**

## Step 4: Test with Sample Code

### ✅ Clean Code Test
Paste:
```javascript
const x = 5;
return x;
```
**Result:** Should say "Nice! We did not find obvious problems."

### ❌ Buggy Code Test
Paste:
```javascript
var x = 1 == 2;
console.log(x);
```
**Result:** Should show 3 issues:
1. Old-style variable (var)
2. Loose comparison (==)
3. Debug print (console.log)

And show fixed code:
```javascript
let x = 1 === 2;
```

---

## Troubleshooting

### Backend fails to start
- Delete `backend/node_modules` and `backend/package-lock.json`
- Run `npm install` again

### Frontend shows blank page
- Check browser console for errors (F12)
- Make sure backend is running on port 4000

### Code isn't being detected
- Check that you're pasting code into the text box
- Make sure both servers are running
- Check browser Network tab to see API responses

---

## What Got Fixed ✅

1. **Code detection now works** - detects var, ==, console.log, brackets, quotes, typos
2. **No duplicate messages** - removed the redundant feedback in Step 2
3. **Fixed code displays properly** - shows actual fixes without duplication
4. **5 emotion states working** - 😊 😐 😕 😟 😫

---

**Happy testing! 🚀**
