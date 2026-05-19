import type { TestCase } from '../types';
import { createSandbox } from './code-editor';

interface TestResult {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  error?: string;
}

function compareResult(actual: unknown, expected: unknown, _win: Window | null): boolean {
  const w = _win as Record<string, unknown> | null;
  if (expected === 'string') return typeof actual === 'string';
  if (expected === 'number') return typeof actual === 'number';
  if (expected === 'boolean') return typeof actual === 'boolean';
  if (expected === 'array') return Array.isArray(actual);
  if (expected === 'object') return typeof actual === 'object' && actual !== null && !Array.isArray(actual);
  if (expected === 'element') return actual instanceof ((w?.Element as typeof Element) ?? Element);
  if (expected === 'promise') return actual instanceof ((w?.Promise as typeof Promise) ?? Promise);
  if (expected === 'function') return typeof actual === 'function';

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  if (typeof expected === 'number' && Array.isArray(actual)) {
    return actual.length === expected;
  }

  if (typeof expected === 'boolean') {
    return !!actual === expected;
  }

  return actual === expected;
}

export async function runTests(code: string, testCases: TestCase[]): Promise<TestResult[]> {
  const iframe = createSandbox(code);
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
  });

  const win = iframe.contentWindow;
  const results: TestResult[] = [];

  const fnMatch = code.match(/function\s+(\w+)/);
  const fnName = fnMatch ? fnMatch[1] : '';

  if (!fnName) {
    document.body.removeChild(iframe);
    return testCases.map((tc) => ({
      name: tc.name,
      passed: false,
      expected: tc.expected,
      actual: undefined,
      error: 'No function found in code',
    }));
  }

  for (const tc of testCases) {
    try {
      const fn = (win as unknown as Record<string, unknown>)[fnName];

      if (typeof fn !== 'function') {
        results.push({
          name: tc.name,
          passed: false,
          expected: tc.expected,
          actual: undefined,
          error: `'${fnName}' is not a function`,
        });
        continue;
      }

      const actual = fn.apply(null, tc.input);
      const passed = compareResult(actual, tc.expected, win);

      results.push({ name: tc.name, passed, expected: tc.expected, actual });
    } catch (e) {
      results.push({
        name: tc.name,
        passed: false,
        expected: tc.expected,
        actual: undefined,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  document.body.removeChild(iframe);
  return results;
}

function formatValue(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export function renderResults(container: HTMLElement, results: TestResult[]): boolean {
  const allPassed = results.length > 0 && results.every((r) => r.passed);

  const wrapper = document.createElement('div');
  wrapper.className = 'results-container';

  if (allPassed) {
    const celebration = document.createElement('div');
    celebration.className = 'result-celebration';
    celebration.textContent = 'All Tests Passed!';
    wrapper.appendChild(celebration);
  }

  for (const result of results) {
    const row = document.createElement('div');
    row.className = `result-row ${result.passed ? 'pass' : 'fail'}`;

    const icon = document.createElement('span');
    icon.className = 'result-icon';
    icon.textContent = result.passed ? '\u2705' : '\u274C';

    const detail = document.createElement('div');
    detail.className = 'result-detail';

    const name = document.createElement('div');
    name.className = 'result-name';
    name.textContent = result.name;
    detail.appendChild(name);

    if (!result.passed) {
      const comparison = document.createElement('div');
      comparison.className = 'result-comparison';
      comparison.textContent = `Expected: ${formatValue(result.expected)} \u2014 Got: ${formatValue(result.actual)}`;
      detail.appendChild(comparison);
    }

    if (result.error) {
      const err = document.createElement('div');
      err.className = 'result-error';
      err.textContent = result.error;
      detail.appendChild(err);
    }

    row.appendChild(icon);
    row.appendChild(detail);
    wrapper.appendChild(row);
  }

  container.innerHTML = '';
  container.appendChild(wrapper);

  return allPassed;
}
