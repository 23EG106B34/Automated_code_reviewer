/**
 * Simple code checker — finds common mistakes and suggests plain-English fixes.
 * No setup needed; works on pasted code as text.
 */

export type IssueSeverity = 'error' | 'warning';

export interface CodeIssue {
  id: string;
  line: number;
  severity: IssueSeverity;
  /** Short title anyone can understand */
  title: string;
  /** What went wrong, in simple words */
  problem: string;
  /** What to do about it */
  fix: string;
  /** The bad bit of code (if we can spot it) */
  snippet?: string;
}

export interface CodeReviewResult {
  ok: boolean;
  issueCount: number;
  summary: string;
  issues: CodeIssue[];
  fixedCode: string;
}

let issueCounter = 0;
function nextId() {
  issueCounter += 1;
  return `issue-${issueCounter}`;
}

function addIssue(
  issues: CodeIssue[],
  line: number,
  severity: IssueSeverity,
  title: string,
  problem: string,
  fix: string,
  snippet?: string
) {
  issues.push({ id: nextId(), line, severity, title, problem, fix, snippet });
}

/** True when pasted text has structure typical of source code, not random typing */
function looksLikeCode(source: string): boolean {
  const trimmed = source.trim();
  if (!trimmed) return false;

  const codeSignals = [
    /\b(function|const|let|var|if|else|return|import|export|class|async|await|for|while|switch|case|break|continue|try|catch|throw|new|typeof|void|def|print|from|elif|except|pass|lambda|public|private|static|void|int|string|bool)\b/i,
    /=>/,
    /[{}[\]();=<>+\-*/%&|^~!?:\\]/,
    /\/\/|\/\*|\*\//,
    /<\/?[a-z][^>]*>/i,
    /^\s*#/m,
    /\b\d+(\.\d+)?\b/,
    /['"`][^'"`]*['"`]/,
    /\.\w+\s*\(/,
    /\w+\s*=\s*\w+/,
  ];

  if (codeSignals.some((pattern) => pattern.test(trimmed))) return true;

  const lines = trimmed.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
  if (lines.length > 1) {
    return lines.some((line) => /[{}[\]();=]/.test(line));
  }

  // Single token of only letters (e.g. qswdfegtrh) or plain prose without code symbols
  if (/^[a-zA-Z\s]+$/.test(trimmed)) return false;

  return /[0-9_{}\[\]();.=+\-*/<>]/.test(trimmed);
}

type CodeLanguage = 'javascript' | 'python' | 'generic';

function detectLanguage(source: string): CodeLanguage {
  const text = source.trim();
  const pyScore =
    (text.match(/\b(print|def|elif|except|pass|lambda)\b/gi) ?? []).length +
    (text.match(/\bimport\s+\w+/g) ?? []).length;
  const jsScore =
    (text.match(/\b(function|const|let|var|console\.log|=>)\b/g) ?? []).length +
    (text.match(/\btry\s*\{/g) ?? []).length;

  if (pyScore > jsScore) return 'python';
  if (jsScore > 0) return 'javascript';
  if (/\bprint\s*\(/i.test(text)) return 'python';
  if (/\b[A-Za-z_]\w*\s*=\s*\d/.test(text) && /\(\s*["']/.test(text)) return 'python';
  return 'generic';
}

/** Fix common broken print(...) lines (quotes in the wrong place) */
function fixMalformedPrintLine(line: string): string | null {
  let fixed = line.replace(/\bPRINT\s*\(/g, 'print(');

  // print"(v") — quote between print and (
  const quoteBeforeParen = fixed.match(/^(\s*)print"\s*\(\s*"?([A-Za-z_]\w*)"?\s*\)\s*$/i);
  if (quoteBeforeParen) {
    const [, indent, varName] = quoteBeforeParen;
    return `${indent}print(${varName})`;
  }

  // print(v") — stray quote after the variable
  const quoteAfterVar = fixed.match(/^(\s*)print\s*\(\s*([A-Za-z_]\w*)"\s*\)\s*$/i);
  if (quoteAfterVar) {
    const [, indent, varName] = quoteAfterVar;
    return `${indent}print(${varName})`;
  }

  return null;
}

function hasMisplacedPrintQuotes(line: string): boolean {
  return /\bprint"\s*\(/i.test(line) || /\bprint\s*\(\s*[A-Za-z_]\w*"\s*\)/i.test(line);
}

/** Repair lines with an odd number of double quotes */
function fixUnmatchedDoubleQuotes(line: string): string {
  const malformed = fixMalformedPrintLine(line);
  if (malformed) return malformed;

  const codeLine = codePortionForQuotes(line);
  let doubleCount = 0;
  for (let i = 0; i < codeLine.length; i++) {
    if (codeLine[i] === '"' && codeLine[i - 1] !== '\\') doubleCount++;
  }
  if (doubleCount % 2 === 0) return line;

  let fixed = line.replace(/\bPRINT\s*\(/g, 'print(');

  // print("V,) or print("name, ) → print(V) when inner text looks like a variable
  const brokenPrintVar = fixed.match(/^(\s*)print\s*\(\s*"([A-Za-z_]\w*),?\s*\)\s*$/i);
  if (brokenPrintVar) {
    const [, indent, varName] = brokenPrintVar;
    return `${indent}print(${varName})`;
  }

  // print("text,) → print("text")
  const brokenPrintStr = fixed.match(/^(\s*)print\s*\(\s*"([^"]*),?\s*\)\s*$/i);
  if (brokenPrintStr) {
    const [, indent, text] = brokenPrintStr;
    return `${indent}print("${text.replace(/,+$/, '')}")`;
  }

  // Insert missing " immediately before the closing ) of a call
  const callWithOpenQuote = fixed.match(/^(\s*)(\w+)\s*\(([^)]*"[^")]*)$/);
  if (callWithOpenQuote) {
    const closeIdx = fixed.lastIndexOf(')');
    if (closeIdx > 0) {
      return `${fixed.slice(0, closeIdx)}"${fixed.slice(closeIdx)}`;
    }
  }

  return fixed;
}

/** Repair lines with an odd number of single quotes */
function fixUnmatchedSingleQuotes(line: string): string {
  const codeLine = codePortionForQuotes(line);
  let singleCount = 0;
  for (let i = 0; i < codeLine.length; i++) {
    if (codeLine[i] === "'" && codeLine[i - 1] !== '\\') singleCount++;
  }
  if (singleCount % 2 === 0) return line;

  const closeIdx = line.lastIndexOf(')');
  if (closeIdx > 0 && line.includes("'")) {
    return `${line.slice(0, closeIdx)}'${line.slice(closeIdx)}`;
  }
  return line;
}

/** Strip // comments before counting quotes (avoids false errors in comments) */
function codePortionForQuotes(line: string): string {
  const commentIdx = line.indexOf('//');
  return commentIdx === -1 ? line : line.slice(0, commentIdx);
}

/** Scan pasted code and return friendly issues + auto-fixed version */
export function reviewCode(source: string): CodeReviewResult {
  issueCounter = 0;

  if (!looksLikeCode(source)) {
    const snippet = source.trim().slice(0, 120);
    const issues: CodeIssue[] = [];
    addIssue(
      issues,
      1,
      'error',
      'Not programming code',
      'What you pasted looks like random text or everyday words, not source code the reviewer can check.',
      'Paste real code from your project — for example functions, variables, if/else blocks, or imports.',
      snippet || undefined
    );
    return {
      ok: false,
      issueCount: 1,
      summary: 'This does not look like code. Please paste JavaScript, TypeScript, Python, or similar.',
      issues,
      fixedCode: '',
    };
  }

  const language = detectLanguage(source);
  const lines = source.split('\n');
  const issues: CodeIssue[] = [];
  let fixedLines = [...lines];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // Start with original line, apply all fixes sequentially
    let currentFixed = line;

    if (language === 'python') {
      currentFixed = currentFixed.replace(/\bPRINT\s*\(/g, 'print(');

      const malformedPrint = fixMalformedPrintLine(currentFixed);
      if (malformedPrint) {
        addIssue(
          issues,
          lineNum,
          'error',
          'Quotes in the wrong place',
          'The quotation marks around print are not valid Python — variables go inside parentheses without extra quotes.',
          'Use print(name) instead of print"(name") or print(name").',
          trimmed
        );
        currentFixed = malformedPrint;
        fixedLines[index] = currentFixed;
        return;
      }

      // v=9 → v = 9
      const tightAssign = /^(\s*)([A-Za-z_]\w*)\s*=\s*([^=\n]+)$/.exec(currentFixed);
      if (tightAssign && !/[=<>!]=/.test(currentFixed) && !/\s=\s/.test(currentFixed)) {
        const [, indent, name, value] = tightAssign;
        addIssue(
          issues,
          lineNum,
          'warning',
          'Missing spaces around =',
          'Python style puts spaces around the = sign.',
          'Write it like name = value.',
          trimmed
        );
        currentFixed = `${indent}${name} = ${value.trimEnd()}`;
      }

      // print(" ", v) or print(" ",v) → print(v)
      if (/print\s*\(\s*["'][\s]*["']\s*,/.test(currentFixed)) {
        addIssue(
          issues,
          lineNum,
          'warning',
          'Confusing print',
          'Printing a blank or space string before a value is usually a mistake.',
          'Use print(value) or an f-string like print(f"{value}").',
          trimmed
        );
        currentFixed = currentFixed.replace(
          /print\s*\(\s*["'][\s]*["']\s*,\s*([^)]+)\)/,
          'print($1)'
        );
      }

      // Single-letter names (except common i, x in loops)
      const shortVar = /^(\s*)([a-z])\s*=/.exec(currentFixed);
      if (shortVar && !['i', 'j', 'k', 'x', 'y', 'n'].includes(shortVar[2])) {
        addIssue(
          issues,
          lineNum,
          'warning',
          'Hard-to-read variable name',
          'One-letter names make code harder to understand later.',
          'Use a descriptive name like value, count, or total.',
          trimmed
        );
      }

      fixedLines[index] = currentFixed;
      return;
    }

    // Loose == instead of ===
    if (/[^=!<>]==[^=]/.test(currentFixed)) {
      addIssue(
        issues,
        lineNum,
        'warning',
        'Loose comparison',
        'Using == can cause surprise bugs when types differ.',
        'Use === to compare values safely.',
        trimmed
      );
      currentFixed = currentFixed.replace(/([^=!<>])==([^=])/g, '$1===$2');
    }

    // var is outdated
    if (/\bvar\s+\w+/.test(currentFixed)) {
      addIssue(
        issues,
        lineNum,
        'warning',
        'Old-style variable',
        '"var" behaves oddly in loops and functions.',
        'Use "let" or "const" instead.',
        trimmed
      );
      currentFixed = currentFixed.replace(/\bvar\b/g, 'let');
    }

    // console.log left in
    if (/console\.log\s*\(/.test(currentFixed)) {
      addIssue(
        issues,
        lineNum,
        'warning',
        'Debug print left in',
        'console.log is for testing — remove before sharing code.',
        'Delete this line or comment it out.',
        trimmed
      );
      currentFixed = '';
    }

    // Empty catch — swallows errors
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(currentFixed)) {
      addIssue(
        issues,
        lineNum,
        'error',
        'Error hidden',
        'Empty catch blocks hide mistakes and make debugging hard.',
        'Log the error or show a friendly message to the user.',
        trimmed
      );
      currentFixed = currentFixed.replace(
        /catch\s*\(([^)]*)\)\s*\{\s*\}/,
        'catch ($1) { console.error($1); }'
      );
    }

    // eval is dangerous
    if (/\beval\s*\(/.test(currentFixed)) {
      addIssue(
        issues,
        lineNum,
        'error',
        'Unsafe eval',
        'eval() can run harmful code from strings.',
        'Avoid eval — use JSON.parse or normal logic instead.',
        trimmed
      );
    }

    // Missing semicolon on simple return lines (style)
    if (currentFixed && /^\s*return\s+[^;{}\n]+$/.test(currentFixed) && !currentFixed.trim().endsWith(';')) {
      addIssue(
        issues,
        lineNum,
        'warning',
        'Missing semicolon',
        'Some styles want a semicolon at the end of the line.',
        'Add a ; at the end of the return line.',
        currentFixed.trim()
      );
      currentFixed = currentFixed.trimEnd() + ';';
    }

    fixedLines[index] = currentFixed;
  });

  // Bracket balance
  const open = (source.match(/[\{\[\(]/g) ?? []).length;
  const close = (source.match(/[\}\]\)]/g) ?? []).length;
  if (open !== close) {
    const diff = open - close;
    const missingOrExtra = diff > 0 ? `${diff} closing bracket(s) missing` : `${Math.abs(diff)} extra closing bracket(s)`;
    addIssue(
      issues,
      1,
      'error',
      'Brackets do not match',
      `${missingOrExtra}. Some { } ( ) or [ ] are not balanced.`,
      'Count opening and closing brackets — each opener needs exactly one closer.',
      undefined
    );
  }

  // Quote/String quote balance (only check in strings, not comments)
  let inString = false;
  let stringChar = '';
  const quotes = source.split('\n').map((line) => {
    const codeLine = language === 'python' ? line : codePortionForQuotes(line);
    let singleCount = 0;
    let doubleCount = 0;
    for (let i = 0; i < codeLine.length; i++) {
      const char = codeLine[i];
      if (char === "'" && codeLine[i - 1] !== '\\') singleCount++;
      if (char === '"' && codeLine[i - 1] !== '\\') doubleCount++;
    }
    return { singleCount, doubleCount };
  });

  lines.forEach((line, idx) => {
    if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('#')) return;
    if (!hasMisplacedPrintQuotes(line)) return;
    const originalLine = fixedLines[idx] ?? line;
    const repaired = fixMalformedPrintLine(originalLine);
    if (repaired && repaired !== originalLine) {
      const alreadyReported = issues.some(
        (i) => i.line === idx + 1 && i.title === 'Quotes in the wrong place'
      );
      if (!alreadyReported) {
        addIssue(
          issues,
          idx + 1,
          'error',
          'Quotes in the wrong place',
          'The quotation marks around print are not valid Python — variables go inside parentheses without extra quotes.',
          'Use print(name) instead of print"(name") or print(name").',
          line.trim()
        );
      }
      fixedLines[idx] = repaired;
    }
  });

  quotes.forEach((lineQuotes, idx) => {
    const originalLine = fixedLines[idx] ?? lines[idx] ?? '';
    if (lineQuotes.singleCount % 2 !== 0) {
      addIssue(
        issues,
        idx + 1,
        'error',
        'Unmatched single quote',
        "Missing closing single quote (') on this line.",
        "Add a closing single quote or check string boundaries.",
        originalLine.trim() || undefined
      );
      const repaired = fixUnmatchedSingleQuotes(originalLine);
      if (repaired !== originalLine) fixedLines[idx] = repaired;
    }
    if (lineQuotes.doubleCount % 2 !== 0) {
      addIssue(
        issues,
        idx + 1,
        'error',
        'Unmatched double quote',
        'Missing closing double quote (") on this line.',
        'Add a closing double quote or check string boundaries.',
        originalLine.trim() || undefined
      );
      const repaired = fixUnmatchedDoubleQuotes(originalLine);
      if (repaired !== originalLine) fixedLines[idx] = repaired;
    }
  });

  // Common typos
  const typos: [RegExp, string, string][] = [
    [/\bfuncton\b/g, 'function', 'Misspelled "function"'],
    [/\bretun\b/g, 'return', 'Misspelled "return"'],
    [/\bconsol\.log\b/g, 'console.log', 'Misspelled "console.log"'],
    [/\bundefiend\b/g, 'undefined', 'Misspelled "undefined"'],
    [/\bimprot\b/g, 'import', 'Misspelled "import"'],
  ];

  typos.forEach(([pattern, replacement, label]) => {
    fixedLines.forEach((line, index) => {
      if (line && pattern.test(line)) {
        pattern.lastIndex = 0;
        addIssue(
          issues,
          index + 1,
          'error',
          'Typo in keyword',
          `${label} — the computer will not understand this word.`,
          `Change it to "${replacement}".`,
          line.trim()
        );
        fixedLines[index] = line.replace(pattern, replacement);
      }
    });
  });

  const fixedCode = fixedLines.join('\n').trimEnd();
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const issueCount = issues.length;

  let summary: string;
  if (issueCount === 0) {
    summary = 'Nice! We did not find obvious problems. Your code looks okay.';
  } else if (errorCount > 0) {
    summary = `Found ${issueCount} thing${issueCount > 1 ? 's' : ''} to fix (${errorCount} critical). Follow the steps below to see fixes.`;
  } else {
    summary = `Found ${issueCount} small suggestion${issueCount > 1 ? 's' : ''}. Your code can run, but these tweaks help.`;
  }

  return {
    ok: errorCount === 0,
    issueCount,
    summary,
    issues,
    fixedCode: fixedCode || source.trim(),
  };
}
