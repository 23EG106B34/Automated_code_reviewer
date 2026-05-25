# 🎨 Visual Guide - Automated Code Reviewer UI

## Application Flow

```
                    START
                      ↓
            ┌─────────────────────┐
            │  Paste Code or Try  │
            │      Sample         │
            └──────────┬──────────┘
                       ↓
            ┌─────────────────────┐
            │  Click "Get Review  │
            │   & Feelings"       │
            └──────────┬──────────┘
                       ↓ (Loading...)
            ┌─────────────────────┐
            │   STEP 1: Code      │
            │   Feedback Section  │
            │                     │
            │ • Issues found      │
            │ • Line numbers      │
            │ • How to fix        │
            │ • Fixed code (copy) │
            └──────────┬──────────┘
                       ↓
            ┌─────────────────────┐
            │   STEP 2: How       │
            │   They Feel         │
            │                     │
            │ [😊 or 😐          │
            │  or 😟 or 😫]       │
            │                     │
            │ Headline message    │
            │ Personalized tip    │
            └─────────────────────┘
```

---

## Screen Layout

### Header Section
```
┌────────────────────────────────────────────────┐
│                                                │
│          Review & feelings                     │
│  Paste code → get feedback → see if they're   │
│  satisfied with how you should talk to them   │
│                                                │
└────────────────────────────────────────────────┘
```

### Progress Steps
```
┌──────────────┬──────────────┬──────────────┐
│  1. Paste    │ 2. Read      │ 3. Check     │
│  code        │ feedback     │ emotions     │
└──────────────┴──────────────┴──────────────┘
```

### Input Section
```
┌────────────────────────────────────────────────┐
│ Your name (optional)                           │
├────────────────────────────────────────────────┤
│ [vareshni              ]                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Your code                      [Try sample]    │
├────────────────────────────────────────────────┤
│                                                │
│ functon greet(name) {                          │
│   var msg = "Hello " + name                    │
│   if (name == null) {                          │
│     return msg                                 │
│   }                                            │
│   console.log(msg)                             │
│   return msg                                   │
│ }                                              │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│   [🚀 Get review & feelings]  (if code empty)  │
│   [✓ Get review & feelings]  (if code filled)  │
└────────────────────────────────────────────────┘
```

---

## STEP 1: Code Feedback Display

### Good Code (No Issues)
```
┌────────────────────────────────────────────────┐
│  ✓ Code Feedback                               │
├────────────────────────────────────────────────┤
│  Nice! We did not find obvious problems.       │
│  Your code looks okay.                         │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ (No issues - skip to Step 2)                   │
└────────────────────────────────────────────────┘
```

### Bad Code (With Issues)
```
┌────────────────────────────────────────────────┐
│  ⚠️ Code Feedback                              │
├────────────────────────────────────────────────┤
│  Found 5 things to fix (2 serious).            │
│  Follow the steps below — copy the fixed       │
│  code when done.                               │
└────────────────────────────────────────────────┘

Issues Found:
┌────────────────────────────────────────────────┐
│ Line 1: Typo in keyword                        │
│ Misspelled "function" — the computer will      │
│ not understand this word.                      │
│ Fix: Change it to "function".                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Line 2: Old-style variable                     │
│ "var" behaves oddly in loops and functions.   │
│ Fix: Use "let" or "const" instead.            │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Line 3: Loose comparison                       │
│ Using == can cause surprise bugs...           │
│ Fix: Use === to compare values safely.        │
└────────────────────────────────────────────────┘

Fixed code:
┌────────────────────────────────────────────────┐
│  Fixed code                      [📋 Copy]     │
│  function greet(name) {                        │
│    let msg = "Hello " + name                   │
│    if (name === null) {                        │
│      return msg;                               │
│    }                                           │
│    return msg;                                 │
│  }                                             │
└────────────────────────────────────────────────┘
```

---

## STEP 2: Emotions & Feedback

### Emotion State: 😊 Satisfied
```
┌────────────────────────────────────────────────┐
│  ❤️ Step 2 — How they feel                     │
├────────────────────────────────────────────────┤
│  Code looks fine. You can give normal          │
│  friendly feedback.                            │
│                                                │
│                      😊                        │
│                                                │
│            Satisfied & doing well              │
│  vareshni — This person seems in a good       │
│  place. Normal friendly feedback is fine.     │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ✅ Satisfied enough for normal review   │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ What to do: You can give a regular code│  │
│  │ review — clear and helpful.            │  │
│  └─────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Emotion State: 😐 Okay
```
┌────────────────────────────────────────────────┐
│  ❤️ Step 2 — How they feel                     │
├────────────────────────────────────────────────┤
│  Code looks fine. You can give normal          │
│  friendly feedback.                            │
│                                                │
│                      😐                        │
│                                                │
│          Okay — nothing alarming               │
│  vareshni — They seem fine but not super       │
│  energized. Keep feedback simple.              │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ✅ Satisfied enough for normal review   │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ What to do: Use short comments.         │  │
│  │ Skip tiny nitpicks.                     │  │
│  └─────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Emotion State: 😟 Stressed
```
┌────────────────────────────────────────────────┐
│  ❤️ Step 2 — How they feel                     │
├────────────────────────────────────────────────┤
│  Many issues found — explain fixes gently;    │
│  they may feel overwhelmed.                   │
│                                                │
│                      😟                        │
│                                                │
│       Not satisfied — under stress             │
│  vareshni — They may feel frustrated or        │
│  overwhelmed. Be kind first.                  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ❌ Not satisfied — be extra gentle      │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ What to do: Start with something        │  │
│  │ positive. Only mention must-fix issues. │  │
│  └─────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Emotion State: 😫 Exhausted
```
┌────────────────────────────────────────────────┐
│  ❤️ Step 2 — How they feel                     │
├────────────────────────────────────────────────┤
│  High fatigue detected. They are NOT in a      │
│  good headspace for harsh feedback.            │
│                                                │
│                      😫                        │
│                                                │
│          Very tired — needs rest               │
│  vareshni — High fatigue detected. They are    │
│  NOT in a good headspace for harsh feedback.  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ❌ Not satisfied — be extra gentle      │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ What to do: Postpone non-urgent         │  │
│  │ comments. Say "looks good" when possible│  │
│  └─────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## Color Scheme

### Emotion Colors
```
😊 EMERALD (satisfied)
  Text: #10B981 (emerald-500)
  Background: rgba(16, 185, 129, 0.1)
  Border: rgba(16, 185, 129, 0.4)

😐 INDIGO (okay)
  Text: #818CF8 (indigo-400)
  Background: rgba(129, 140, 248, 0.1)
  Border: rgba(129, 140, 248, 0.3)

😟 AMBER (stressed)
  Text: #FBBF24 (amber-400)
  Background: rgba(251, 191, 36, 0.05)
  Border: rgba(251, 191, 36, 0.4)

😫 ROSE (exhausted)
  Text: #F43F5E (rose-500)
  Background: rgba(244, 63, 94, 0.1)
  Border: rgba(244, 63, 94, 0.4)
```

### Status Colors
```
✅ SUCCESS (emerald-500/20 with emerald-300 text)
  Copy button, "Satisfied" badge

❌ WARNING (rose-500/20 with rose-300 text)
  "Not satisfied" badge

⚠️ INFO (amber-500/5 with amber-100 text)
  Code issues display

✓ CHECK (emerald-500/10 with emerald-100 text)
  Good code summary
```

---

## Button States

### "Get review & feelings" Button
```
NORMAL:   [🚀 Get review & feelings]  (emerald green)
LOADING:  [⏳ Working…]  (spinner, disabled)
ERROR:    [⚠️ Error] + error message  (red/rose)
SUCCESS:  Results displayed  (hidden)
```

### "Try sample" Button
```
NORMAL:   [Try sample]  (secondary)
LOADING:  [⏳ Loading...]  (secondary, disabled)
DONE:     Code appears in textarea
```

### "Copy" Button
```
NORMAL:   [📋 Copy]  (outline)
COPIED:   [✓ Copied]  (outline, briefly)
TIMEOUT:  Back to [📋 Copy]  (after 2 seconds)
```

---

## Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────────┐
│         Header & Instructions           │
├─────────────────────────────────────────┤
│ Name | Code Box | Try Sample            │
│      | [large]  |                       │
│      |          |                       │
├─────────────────────────────────────────┤
│     [Get review & feelings] (full width)│
├─────────────────────────────────────────┤
│  STEP 1         │      STEP 2           │
│  Code Issues    │      Emoji Feedback   │
│  Fixed Code     │      Satisfaction     │
│                 │      Tip              │
└─────────────────────────────────────────┘
```

### Mobile (< 640px)
```
┌──────────────────────┐
│  Header              │
├──────────────────────┤
│ Name Field           │
├──────────────────────┤
│ Code Box             │
│ [Try sample]         │
├──────────────────────┤
│ [Get review...]      │
├──────────────────────┤
│ STEP 1               │
│ Issues              │
│ Fixed Code           │
├──────────────────────┤
│ STEP 2               │
│ [Emoji]              │
│ Feedback             │
└──────────────────────┘
```

---

## Accessibility Features

### Screen Reader Support
```
<span role="img" aria-label="Satisfied: 😊">😊</span>
<div aria-live="polite">Updated emotion state</div>
<button aria-label="Copy fixed code">📋 Copy</button>
```

### Keyboard Navigation
- Tab through all inputs and buttons
- Enter to submit forms
- Space to activate buttons
- Escape to cancel (if modal)

### High Contrast
- All text meets WCAG AA standards
- Color not sole indicator (icons/text used)
- Focus indicators visible
- Error messages in text + color

---

## Error States

### Network Error
```
┌────────────────────────────────────────────┐
│  Network error. Check backend.             │
│  Make sure npm run dev is running.         │
└────────────────────────────────────────────┘
```

### Validation Error
```
┌────────────────────────────────────────────┐
│  Paste your code in the box and            │
│  click Check again.                        │
└────────────────────────────────────────────┘
```

### Loading State
```
         ⏳ Working…
      (with spinner animation)
```

---

## Animations

### Emoji Entry (Spring Animation)
```
Start:     Scale 0.8, Opacity 0
End:       Scale 1.0, Opacity 1
Duration:  ~300ms spring with damping
Effect:    Bouncy entrance
```

### Results Fade In (Motion Animation)
```
Start:     Opacity 0, Y shift +12px
End:       Opacity 1, Y shift 0px
Duration:  ~200ms ease
Effect:    Smooth slide in
```

### Button Hover
```
Background: Slight color shift
Cursor:     pointer
Scale:      Slight grow on active
```

---

End of Visual Guide ✨
