# CodeLabs

Learn to code by building real stuff — not textbook exercises.

Every lesson teaches a skill you'd actually use on the job. Pixel-art animations set the context. Step-by-step walkthroughs explain every concept in plain English. Automated unit tests verify you got it right.

---

## How to Install & Run

### What you need

- **Node.js** (version 18 or newer) — download from https://nodejs.org/
- A terminal / command prompt

### Steps

```bash
# 1. Download the project
git clone https://github.com/uvwxe/javascript-for-dummies.git
cd javascript-for-dummies

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Other commands

```bash
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview the production build
```

---

## How It Works

1. **Skill Tree** — pick a branch (DOM, Forms, Async, Arrays, Python)
2. **Animation** — a pixel-art scene shows this skill being used in a real job
3. **Lesson** — step-by-step tutorial, every concept explained, no assumed knowledge
4. **Code Editor** — write your solution with guided starter code
5. **Tests** — click "Run Tests". Pass all checks to earn XP and unlock the next lesson

---

## Generate New Lessons (BYOK)

Generate lessons with your own API key. No key bundled — you bring yours.

### Get a key

1. Go to https://console.anthropic.com/ and sign up
2. Create an API key (it starts with `sk-ant-...`)
3. Set it as an environment variable:

```bash
# Windows Command Prompt
set ANTHROPIC_API_KEY=sk-ant-...

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."

# macOS / Linux
export ANTHROPIC_API_KEY=sk-ant-...
```

### Generate a lesson

```bash
# With your API key set, run:
npm run generate-lesson -- --topic "Form Validation" --branch forms --language JavaScript --deps "forms-input"
```

If no API key is set, it uses template generation (less specific but works without a key).

### Options

```
--topic     What the lesson teaches (e.g. "Form Validation")
--branch    Skill tree branch (dom, forms, async, arrays, python)
--language  Programming language (JavaScript, Python)
--deps      Prerequisite lesson IDs, comma-separated
--output    Write to src/data/lessons/[name].json (prints to terminal if omitted)
--help      Show all available options
```

**Examples:**

```bash
# Print to terminal
npm run generate-lesson -- --topic "Array Methods" --branch arrays --language JavaScript

# Save to file
npm run generate-lesson -- --topic "Async Error Handling" --branch async --language JavaScript --output async-errors-advanced
```

After generating, restart the dev server (`npm run dev`) to see the new lesson in the skill tree.

---

## Features

- **Skill tree** — progressive unlocking (must complete prerequisites)
- **Pixel-art animations** — 12 job-context scenes before each lesson
- **Code editor** — in-browser, sandboxed execution
- **Unit-test validation** — type-aware comparison (strings, arrays, promises, elements, etc.)
- **Progress tracking** — XP, streaks, IndexedDB persistence
- **PWA** — installable, works offline
- **15 lessons included** — DOM, Forms, Async, Arrays, Python tracks

## Tech

- Vite + TypeScript
- Plain CSS with custom properties — no Tailwind
- Sora + JetBrains Mono fonts
- No backend — runs entirely in the browser
