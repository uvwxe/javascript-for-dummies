import '../styles/skill-tree.css';
import type { SkillTree, SkillTreeNode, SkillTreeBranch, UserProgress } from '../types';

function isLessonLocked(node: SkillTreeNode, progress: UserProgress): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) return false;
  return !node.prerequisites.every((id) => progress.completedLessons.includes(id));
}

function isLessonCompleted(nodeId: string, progress: UserProgress): boolean {
  return progress.completedLessons.includes(nodeId);
}

function renderBranchCard(
  branch: SkillTreeBranch,
  index: number,
  progress: UserProgress,
): string {
  const lessonsHtml = branch.lessons
    .map((node) => {
      const completed = isLessonCompleted(node.id, progress);
      const locked = isLessonLocked(node, progress);

      if (completed) {
        return `
          <div class="lesson-row lesson-row--completed">
            <span class="lesson-icon">\u2705</span>
            <div class="lesson-info">
              <span class="lesson-title">${node.title}</span>
              <span class="lesson-desc">${node.description}</span>
            </div>
          </div>`;
      }

      if (locked) {
        return `
          <div class="lesson-row lesson-row--locked">
            <span class="lesson-icon">\uD83D\uDD12</span>
            <div class="lesson-info">
              <span class="lesson-title">Complete prerequisites first</span>
              <span class="lesson-desc">${node.description}</span>
            </div>
          </div>`;
      }

      return `
        <div class="lesson-row lesson-row--available"
          data-lesson-id="${node.id}"
          data-branch-id="${branch.id}"
        >
          <span class="lesson-icon">${node.icon}</span>
          <div class="lesson-info">
            <span class="lesson-title">${node.title}</span>
            <span class="lesson-desc">${node.description}</span>
          </div>
        </div>`;
    })
    .join('');

  return `
    <div class="branch-card stagger-${index + 1}">
      <div class="branch-header">
        <span class="branch-icon">${branch.icon}</span>
        <div class="branch-meta">
          <div class="branch-title-row">
            <h3 class="branch-title">${branch.title}</h3>
            <span class="branch-lang">${branch.language.slice(0, 2).toUpperCase()}</span>
          </div>
          <p class="branch-desc">${branch.description}</p>
        </div>
      </div>
      <div class="branch-lessons">${lessonsHtml}</div>
    </div>`;
}

export default function renderSkillTree(
  container: HTMLElement,
  tree: SkillTree,
  progress: UserProgress,
): void {
  const headerHtml = `
    <div class="tree-header stagger-1">
      <h2 class="tree-title">Skill Tree</h2>
      <p class="tree-subtitle">Pick a branch to start building real skills.</p>
    </div>`;

  const cardsHtml = tree.branches
    .map((branch, i) => renderBranchCard(branch, i, progress))
    .join('');

  container.innerHTML = `<div class="skill-tree">${headerHtml}<div class="branch-grid">${cardsHtml}</div></div>`;

  container.querySelectorAll<HTMLElement>('.lesson-row--available').forEach((row) => {
    row.addEventListener('click', () => {
      const lessonId = row.dataset.lessonId;
      const branchId = row.dataset.branchId;
      if (lessonId && branchId) {
        window.location.hash = `#animation/${lessonId}/${branchId}`;
      }
    });
  });
}
