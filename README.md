# CodeLabs

Learn to code by building real stuff — not textbook exercises.

Every lesson teaches you a skill you'd actually use in a job, with pixel-art animations setting the context, step-by-step walkthroughs for beginners, and automated unit tests to verify you got it right.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## How It Works

1. **Skill Tree** — pick a branch (DOM, Forms, Async, Arrays, Python)
2. **Animation** — watch a tiny pixel-art scene showing this skill in a real job context
3. **Lesson** — step-by-step tutorial explaining every concept in plain English
4. **Code Editor** — write your solution with guided starter code
5 **Tests** — click "Run Tests", pass all checks to earn XP

## Features

- 🎮 Skill tree with progressive unlocking (must complete prerequisites)
- 🎬 Pixel-art animations before each lesson
- ✏️ In-browser code editor with sandboxed execution
- ✅ Unit-test validation (hidden test cases, type-aware comparison)
- 📊 XP + streak tracking (IndexedDB persistence)
- 📱 PWA — installable, works offline
- 🤖 AI lesson generation: `npm run generate-lesson -- --topic "..." --branch "..." --language "JavaScript"`

## Tech

- Vite + TypeScript
- Plain CSS with custom properties (no Tailwind)
- Sora + JetBrains Mono
- No backend — runs entirely in the browser

## Generate New Lessons

```bash
npm run generate-lesson -- --topic "Building a Modal" --branch "dom" --language "JavaScript" --deps "dom-events,dom-modify"
```

Uses template generation by default. Set `ANTHROPIC_API_KEY` for AI-powered generation with Claude.
