import * as fs from 'node:fs';
import * as path from 'node:path';

interface CliArgs {
  topic: string;
  branch: string;
  language: string;
  deps: string;
  output?: string;
}

function parseArgs(): CliArgs {
  const args: Record<string, string> = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = process.argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }

  const topic = args.topic || 'DOM Selectors';
  const branch = args.branch || 'dom';
  const language = args.language || 'JavaScript';
  const deps = args.deps || '';

  return { topic, branch, language, deps, output: args.output };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateId(args: CliArgs): string {
  if (args.output) return args.output.replace('.json', '');
  const deps = args.deps ? args.deps.split(',')[0].trim() : '';
  return deps || `${args.branch}-${slugify(args.topic)}`;
}

interface TestCase {
  name: string;
  input: unknown[];
  expected: unknown;
}

interface LessonSection {
  type: 'text' | 'code' | 'tip' | 'heading';
  content: string;
}

interface Lesson {
  id: string;
  language: string;
  title: string;
  branch: string;
  prerequisites: string[];
  jobContext: string;
  animation: string;
  lesson: LessonSection[];
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
}

function getJobContext(topic: string, branch: string): string {
  const contexts: Record<string, string> = {
    dom: "Every frontend job starts here — you can't build anything if you can't find elements on the page. This is day-1-on-the-job knowledge.",
    forms: "Every app that takes user data — signups, search bars, settings pages — starts with form inputs. This is the bridge between user and app.",
    async: "Real apps fetch data. Every company has APIs. Knowing how to talk to them is what makes you a professional developer, not just a page maker.",
    arrays: "In production code, you're rarely working with one piece of data — you're processing lists. Array methods are the most-used tools in any codebase.",
    python: "Python powers data science, AI/ML, backend services, and automation at companies like Google, Netflix, and NASA. It's the most versatile language in production today.",
  };

  for (const [key, ctx] of Object.entries(contexts)) {
    if (branch.includes(key) || key.includes(branch)) return ctx;
  }

  return `Real-world developers use ${topic} every day. This skill appears in nearly every production codebase.`;
}

function getAnimationScene(args: CliArgs): string {
  const sceneMap: Record<string, string> = {
    dom: 'dom-selectors-scene',
    forms: 'forms-input-scene',
    async: 'async-fetch-scene',
    arrays: 'arrays-map-scene',
    python: 'dom-selectors-scene',
  };

  for (const [key, scene] of Object.entries(sceneMap)) {
    if (args.branch.includes(key) || key.includes(args.branch)) return scene;
  }

  return 'dom-selectors-scene';
}

function generateSections(topic: string, language: string): LessonSection[] {
  const isPython = language.toLowerCase() === 'python';
  const varExample = isPython ? "name = 'World'" : "const name = 'World';";
  const fnExample = isPython ? 'def get_value():\n    return 42' : 'function getValue() {\n  return 42;\n}';

  const sections: LessonSection[] = [
    { type: 'heading', content: 'What You\'ll Learn' },
    {
      type: 'text',
      content: `You'll learn the fundamentals of ${topic} in ${language}. This is a core skill used in production applications every day.`,
    },
    { type: 'heading', content: 'Core Concept' },
    {
      type: 'text',
      content: `${topic} is about understanding how to write clean, correct code that solves real problems. Here's the basic pattern:`,
    },
    {
      type: 'code',
      content: `${fnExample}\n\n// ${topic} in ${language}`,
    },
    {
      type: 'tip',
      content: `In production ${language} code, always think about edge cases and error handling. Write code that fails gracefully.`,
    },
    { type: 'heading', content: 'Your Task' },
    {
      type: 'text',
      content: `Write a function that demonstrates your understanding of ${topic}. The tests below will validate your solution.`,
    },
  ];

  return sections;
}

function generateStarterCode(topic: string, branch: string, language: string): string {
  const isPython = language.toLowerCase() === 'python';

  if (isPython) {
    if (branch === 'python' || topic.toLowerCase().includes('variable')) {
      return `# Create variables of different types
# Write a function called get_values() that returns a list [number, string, boolean]

def get_values():
    # Return a list with: a number, a string, and a boolean
    pass
`;
    }
    if (topic.toLowerCase().includes('function')) {
      return `# Write a function called add_numbers(a, b) that returns their sum
# Also write get_greeting(name) that returns "Hello, {name}!"

def add_numbers(a, b):
    pass

def get_greeting(name):
    pass
`;
    }
    if (topic.toLowerCase().includes('loop') || topic.toLowerCase().includes('list')) {
      return `# Write a function called sum_list(numbers) that returns the sum of all numbers
# Write count_positive(numbers) that returns how many numbers are > 0

def sum_list(numbers):
    pass

def count_positive(numbers):
    pass
`;
    }
    return `# Write a function that demonstrates ${topic}

def solve():
    pass
`;
  }

  if (branch === 'dom') {
    return `function handle${slugify(topic).replace(/-/g, '_')}() {\n  // Find the target element\n  // Manipulate it\n  // Return the result\n  \n}\n`;
  }
  if (branch === 'forms') {
    return `function getFormData() {\n  // Read input values\n  // Return the collected data\n  \n}\n`;
  }
  if (branch === 'arrays') {
    return `function transformData(data) {\n  // Transform the input array\n  // Return the transformed result\n  \n}\n`;
  }
  if (branch === 'async') {
    return `async function fetchData() {\n  // Fetch data from an endpoint\n  // Handle errors\n  // Return the data\n  \n}\n`;
  }

  return `function do${topic.replace(/\s+/g, '')}() {\n  // Implement ${topic}\n  \n}\n`;
}

function generateTestCases(topic: string, branch: string, language: string): TestCase[] {
  const isPython = language.toLowerCase() === 'python';

  if (isPython) {
    if (branch === 'python' || topic.toLowerCase().includes('variable')) {
      return [
        { name: 'returns a list', input: [], expected: 'array' },
        { name: 'has three elements', input: [], expected: 3 },
        { name: 'first element is a number', input: [], expected: 'number' },
        { name: 'second is a string', input: [], expected: 'string' },
        { name: 'third is a boolean', input: [], expected: 'boolean' },
      ];
    }
    if (topic.toLowerCase().includes('function')) {
      return [
        { name: 'has add_numbers function', input: [], expected: 'function' },
        { name: 'add_numbers adds correctly', input: [3, 7], expected: 10 },
        { name: 'add_numbers handles negatives', input: [-2, 5], expected: 3 },
        { name: 'get_greeting returns greeting', input: ['Alice'], expected: 'Hello, Alice!' },
      ];
    }
    if (topic.toLowerCase().includes('loop') || topic.toLowerCase().includes('list')) {
      return [
        { name: 'sum_list sums correctly', input: [[1, 2, 3, 4, 5]], expected: 15 },
        { name: 'sum_list handles empty', input: [[]], expected: 0 },
        { name: 'count_positive works', input: [[-1, 0, 5, -3, 10]], expected: 2 },
        { name: 'count_positive handles all negative', input: [[-1, -2, -3]], expected: 0 },
      ];
    }
  }

  if (branch === 'dom') {
    return [
      { name: 'returns a string', input: [], expected: 'string' },
      { name: 'returns the correct value', input: [], expected: 'Welcome to CodeLabs' },
      { name: 'function exists and is callable', input: [], expected: 'function' },
    ];
  }
  if (branch === 'forms') {
    return [
      { name: 'returns an object', input: [], expected: 'object' },
      { name: 'has expected properties', input: [], expected: true },
      { name: 'function handles empty input', input: [], expected: 'object' },
    ];
  }
  if (branch === 'arrays') {
    return [
      { name: 'returns an array', input: [[1, 2, 3]], expected: 'array' },
      { name: 'transforms data correctly', input: [[1, 2, 3]], expected: [2, 4, 6] },
      { name: 'handles empty array', input: [[]], expected: [] },
    ];
  }
  if (branch === 'async') {
    return [
      { name: 'returns a promise', input: [], expected: 'promise' },
      { name: 'resolves to expected data', input: [], expected: true },
      { name: 'throws on error', input: [], expected: true },
    ];
  }

  return [
    { name: 'returns a string', input: [], expected: 'string' },
    { name: 'function exists', input: [], expected: 'function' },
  ];
}

function generateHints(topic: string, branch: string, language: string): string[] {
  const isPython = language.toLowerCase() === 'python';

  if (isPython) {
    return [
      'Use def to define a function',
      'Return values with the return keyword',
      'Remember to call your function correctly',
    ];
  }

  if (branch === 'dom') return ['Use document.getElementById(...)', 'Elements have a .textContent property'];
  if (branch === 'forms') return ['Use .value to read input content', 'Return an object with the collected values'];
  if (branch === 'arrays') return ['Use .map() to transform arrays', 'The callback receives each element'];
  if (branch === 'async') return ['Use await with fetch()', 'Wrap in try/catch for error handling'];

  return ['Read the instructions carefully', 'Check the test cases for hints'];
}

function generateLesson(args: CliArgs): Lesson {
  const depsList = args.deps ? args.deps.split(',').map((d) => d.trim()).filter(Boolean) : [];
  const id = generateId(args);

  return {
    id,
    language: args.language,
    title: args.topic,
    branch: args.branch,
    prerequisites: depsList,
    jobContext: getJobContext(args.topic, args.branch),
    animation: getAnimationScene(args),
    lesson: generateSections(args.topic, args.language),
    starterCode: generateStarterCode(args.topic, args.branch, args.language),
    testCases: generateTestCases(args.topic, args.branch, args.language),
    hints: generateHints(args.topic, args.branch, args.language),
  };
}

function formatValue(val: unknown): string {
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${val}"`;
  if (Array.isArray(val)) return `[${val.map(formatValue).join(', ')}]`;
  return String(val);
}

function formatTestCases(cases: TestCase[]): string {
  return cases
    .map((tc) => {
      const inputStr = tc.input.length > 0 ? tc.input.map(formatValue).join(', ') : 'no args';
      const expectedStr = formatValue(tc.expected);
      return `        ${tc.name.padEnd(28)} input: ${inputStr.padEnd(20)} expected: ${expectedStr}`;
    })
    .join('\n');
}

function printLesson(lesson: Lesson): void {
  console.log(`\n  ${'='.repeat(60)}`);
  console.log(`  CodeLabs Lesson: ${lesson.title}`);
  console.log(`  ${'='.repeat(60)}`);
  console.log(`  ID:           ${lesson.id}`);
  console.log(`  Language:     ${lesson.language}`);
  console.log(`  Branch:       ${lesson.branch}`);
  console.log(`  Prerequisites: ${lesson.prerequisites.join(', ') || 'none'}`);
  console.log(`  Animation:    ${lesson.animation}`);
  console.log(`\n  Job Context:`);
  console.log(`    ${lesson.jobContext}`);
  console.log(`\n  Lesson Sections: ${lesson.lesson.length}`);
  lesson.lesson.forEach((s) => {
    console.log(`    [${s.type}] ${s.content.slice(0, 60)}${s.content.length > 60 ? '...' : ''}`);
  });
  console.log(`\n  Starter Code:`);
  lesson.starterCode.split('\n').forEach((line) => console.log(`    │ ${line}`));
  console.log(`\n  Test Cases:`);
  console.log(formatTestCases(lesson.testCases));
  console.log(`\n  Hints:`);
  lesson.hints.forEach((h, i) => console.log(`    ${i + 1}. ${h}`));
  console.log();
}

// ── Anthropic API generation ──────────────────────────────────────────

const SYSTEM_PROMPT = `You are a coding education content generator for CodeLabs.
You MUST output valid JSON only — no markdown, no explanation, no code fences.
Generate a single lesson object with this exact TypeScript structure:

{
  "id": string,
  "language": string,
  "title": string,
  "branch": string,
  "prerequisites": string[],
  "jobContext": string,
  "animation": string,
  "lesson": { type: "heading"|"text"|"code"|"tip", content: string }[],
  "starterCode": string,
  "testCases": { name: string, input: unknown[], expected: unknown }[],
  "hints": string[]
}

Rules:
- The lesson should teach ONE specific coding skill
- starterCode must be valid syntax in the target language with placeholders
- testCases must have 3-6 tests with specific expected values (strings, numbers, booleans, arrays)
- jobContext must explain why this skill matters in real jobs (1-2 sentences)
- lesson array should have 4-8 sections mixing headings, text, code, and tip types
- hints should be 2-4 specific, actionable tips
- The "expected" field in testCases can be a literal value (string, number, boolean) OR an empty array []
  OR one of these type-check strings: "string", "number", "boolean", "array", "object", "element", "promise", "function"`;

async function generateWithClaude(args: CliArgs): Promise<Lesson> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const depsList = args.deps ? args.deps.split(',').map((d) => d.trim()).filter(Boolean) : [];
  const scene = getAnimationScene(args);

  const userPrompt = `Generate a CodeLabs lesson:
- Topic: ${args.topic}
- Language: ${args.language}
- Branch ID: ${args.branch}
- Prerequisites (lesson IDs): [${depsList.join(', ')}]
- Animation scene ID: ${scene}

Make it practical, job-relevant, and engaging. Include realistic test cases.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };

  const text = data.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Claude response');

  const lesson = JSON.parse(jsonMatch[0]) as Lesson;
  return lesson;
}

// ── Help ───────────────────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
  CodeLabs Lesson Generator

  USAGE:
    npm run generate-lesson -- [options]

  OPTIONS:
    --topic     What the lesson teaches (e.g. "Form Validation")
    --branch    Skill tree branch (dom, forms, async, arrays, python)
    --language  Programming language (JavaScript, Python)
    --deps      Prerequisite lesson IDs, comma-separated (e.g. "forms-input")
    --output    Output filename (without path, written to src/data/lessons/)
    --help      Show this help message

  EXAMPLES:
    npm run generate-lesson -- --topic "Form Validation" --branch forms --language JavaScript --deps "forms-input"
    npm run generate-lesson -- --topic "Map & Filter" --branch arrays --language JavaScript --deps "arrays-map"
    npm run generate-lesson -- --help

  BYOK (AI-Powered Generation):
    1. Get an Anthropic API key at https://console.anthropic.com/
    2. Set it as an environment variable:
       Windows:   set ANTHROPIC_API_KEY=sk-ant-...
       PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-..."
       macOS/Linux: export ANTHROPIC_API_KEY=sk-ant-...
    3. Run the same command — it'll use Claude instead of templates.
       Falls back to templates if the API call fails.

  OUTPUT:
    By default, prints the lesson JSON to stdout.
    Use --output to write to src/data/lessons/[name].json
`);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  const depsList = args.deps ? args.deps.split(',').map((d) => d.trim()).filter(Boolean) : [];
  const prerequisites = depsList;

  let lesson: Lesson;

  // Try Claude first if API key is available
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\n  Using Anthropic API for generation...\n');
    try {
      lesson = await generateWithClaude(args);
      console.log('  Generated via Claude API.');
    } catch (err) {
      console.log(`  Claude API failed: ${err instanceof Error ? err.message : err}`);
      console.log('  Falling back to template-based generation...\n');
      lesson = generateLesson(args);
    }
  } else {
    console.log('\n  Using template-based generation (set ANTHROPIC_API_KEY for AI generation)\n');
    lesson = generateLesson(args);
  }

  // Override prerequisites and animation from CLI args
  lesson.prerequisites = prerequisites;
  lesson.animation = getAnimationScene(args);

  printLesson(lesson);

  if (args.output) {
    const outDir = path.resolve(process.cwd(), 'src', 'data', 'lessons');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path.join(outDir, `${args.output.replace('.json', '')}.json`);
    fs.writeFileSync(outFile, JSON.stringify([lesson], null, 2) + '\n', 'utf-8');
    console.log(`  Written to: ${outFile}\n`);
  } else {
    console.log(JSON.stringify([lesson], null, 2));
  }
}

main().catch((err) => {
  console.error('Error generating lesson:', err);
  process.exit(1);
});
