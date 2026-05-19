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

Bring your own AI key. No keys bundled in the code. Works with any major provider.

### Quick one-liner

```bash
# Set your key, then generate:
export ANTHROPIC_API_KEY=sk-ant-...   # or OPENAI_API_KEY, GEMINI_API_KEY, etc.
npm run generate-lesson -- --topic "Form Validation" --branch forms --language JavaScript
```

### Supported providers

| Provider | Env Variable | Get a key |
|----------|-------------|-----------|
| **Anthropic** (Claude) | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| **OpenAI** (GPT) | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| **Google** (Gemini) | `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| **DeepSeek** | `DEEPSEEK_API_KEY` | https://platform.deepseek.com/ |
| **OpenRouter** (many models) | `OPENROUTER_API_KEY` | https://openrouter.ai/keys |
| **Groq** (fast + free) | `GROQ_API_KEY` | https://console.groq.com/keys |
| **Generic** | `AI_API_KEY` | Use with `--provider` flag |

### Set your key

```bash
# Windows Command Prompt
set ANTHROPIC_API_KEY=sk-ant-...

# Windows PowerShell
$env:OPENAI_API_KEY="sk-proj-..."

# macOS / Linux
export GEMINI_API_KEY=your-key-here
```

### Generate a lesson

```bash
npm run generate-lesson -- --topic "Form Validation" --branch forms --language JavaScript --deps "forms-input"
```

Auto-detects the provider from your env variable. Use `--provider` to override:

```bash
npm run generate-lesson -- --topic "..." --branch dom --provider openai
```

No key set? Falls back to template generation (works without any API key).

### All options

```
--topic     What the lesson teaches (e.g. "Form Validation")
--branch    Skill tree branch (dom, forms, async, arrays, python)
--language  Programming language (JavaScript, Python)
--deps      Prerequisite lesson IDs, comma-separated
--output    Write to src/data/lessons/[name].json (prints to terminal if omitted)
--provider  Force a specific provider (anthropic, openai, deepseek, openrouter, gemini, groq)
--help      Show all options
```

**Examples:**

```bash
# Print to terminal
npm run generate-lesson -- --topic "Array Methods" --branch arrays --language JavaScript

# Save to file
npm run generate-lesson -- --topic "Async Error Handling" --branch async --language JavaScript --output async-errors-advanced
```

After generating, restart `npm run dev` to see the new lesson in the skill tree.

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
