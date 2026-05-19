import '../styles/lesson.css';
import type { Lesson, UserProgress, LessonSection } from '../types';
import { createEditor } from './code-editor';
import { runTests, renderResults } from './test-runner';
import { completeLesson } from '../services/storage';

function renderSection(section: LessonSection): string {
  switch (section.type) {
    case 'heading':
      return `<h3 class="lesson-section-heading">${section.content}</h3>`;
    case 'text':
      return `<p class="lesson-section-text">${section.content}</p>`;
    case 'code':
      return `<pre class="lesson-section-code"><code>${section.content}</code></pre>`;
    case 'tip':
      return `<div class="lesson-section-tip"><strong>\u{1F4A1} Pro Tip</strong><br>${section.content}</div>`;
  }
}

const BRANCH_LABELS: Record<string, string> = {
  dom: 'DOM Basics',
  forms: 'Forms & Input',
  async: 'Async & APIs',
  arrays: 'Arrays & Data',
  python: 'Python Basics',
};

function branchLabel(branch: string): string {
  return BRANCH_LABELS[branch] || branch;
}

function renderHints(hints: string[]): string {
  return `
    <div class="lesson-hints">
      <button class="lesson-hints-btn" id="hints-toggle">Show Hints</button>
      <ol class="lesson-hints-list" id="hints-list" style="display:none">
        ${hints.map((h) => `<li>${h}</li>`).join('')}
      </ol>
    </div>`;
}

export default async function renderLesson(
  container: HTMLElement,
  lesson: Lesson,
  progress: UserProgress,
): Promise<void> {
  const sectionsHtml = lesson.lesson.map(renderSection).join('');
  const hintsHtml = lesson.hints && lesson.hints.length > 0 ? renderHints(lesson.hints) : '';
  const userCode = lesson.starterCode;

  container.innerHTML = `
    <div class="lesson-view">
      <div class="lesson-content">
        <h1 class="lesson-title">${lesson.title}</h1>
        <div class="lesson-meta">${branchLabel(lesson.branch)} \u00B7 ${lesson.language}</div>
        <div class="job-context-card">
          <div class="label">Why this matters:</div>
          <div class="text">${lesson.jobContext}</div>
        </div>
        ${sectionsHtml}
        ${hintsHtml}
      </div>
      <div class="lesson-editor" id="lesson-editor-container"></div>
    </div>`;

  const editorContainer = container.querySelector<HTMLElement>('#lesson-editor-container');
  if (!editorContainer) return;

  const editor = await createEditor(editorContainer, userCode);

  if (lesson.hints && lesson.hints.length > 0) {
    const toggleBtn = container.querySelector<HTMLButtonElement>('#hints-toggle');
    const hintsList = container.querySelector<HTMLElement>('#hints-list');
    if (toggleBtn && hintsList) {
      toggleBtn.addEventListener('click', () => {
        const visible = hintsList.style.display !== 'none';
        hintsList.style.display = visible ? 'none' : 'block';
        toggleBtn.textContent = visible ? 'Show Hints' : 'Hide Hints';
      });
    }
  }

  editor.onRun(async () => {
    const code = editor.getCode();
    const resultsEl = document.createElement('div');
    resultsEl.id = 'test-results';
    const existing = editorContainer.querySelector('#test-results');
    if (existing) existing.remove();
    editorContainer.appendChild(resultsEl);

    const results = await runTests(code, lesson.testCases);
    const allPassed = results.every((r: { passed: boolean }) => r.passed);
    renderResults(resultsEl, results);

    if (allPassed) {
      const updatedProgress = await completeLesson(lesson.id);

      const lessonContent = container.querySelector<HTMLElement>('.lesson-content');
      if (lessonContent) {
        lessonContent.innerHTML = `
          <div class="lesson-complete">
            <h2>\u2705 Lesson Complete!</h2>
            <p>You've mastered <strong>${lesson.title}</strong></p>
            <div class="xp-earned">+100 XP</div>
            <button class="back-btn" id="back-to-tree">Back to Skill Tree</button>
          </div>`;
      }

      const editorPanel = container.querySelector<HTMLElement>('.lesson-editor');
      if (editorPanel) {
        editorPanel.innerHTML = `
          <div class="lesson-complete">
            <p>Total XP: <strong>${updatedProgress.xp}</strong></p>
            <p>Streak: \u{1F525} ${updatedProgress.streak}</p>
          </div>`;
      }

      const backBtn = container.querySelector<HTMLButtonElement>('#back-to-tree');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.hash = '#tree';
        });
      }
    }
  });
}
