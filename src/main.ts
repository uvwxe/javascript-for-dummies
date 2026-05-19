import './styles/global.css';
import type { AppState, UserProgress } from './types';
import type { SkillTree, Lesson } from './types';
import { router } from './services/router';
import { getProgress } from './services/storage';
import { loadSkillTree, loadLessonById } from './services/lessons';
import renderNav from './components/nav';
import renderSkillTree from './components/skill-tree';
import renderLesson from './components/lesson-view';
import renderAnimation from './components/pixel-anim';

const app = document.getElementById('app')!;

let progress: UserProgress | null = null;
let tree: SkillTree | null = null;
let currentState: AppState = { page: 'tree', currentLessonId: null, currentBranch: null };

function getPageContainer(): HTMLElement {
  const existing = app.querySelector<HTMLElement>('.page-content');
  if (existing) return existing;
  const el = document.createElement('div');
  el.className = 'page-content';
  app.appendChild(el);
  return el;
}

function getNavContainer(): HTMLElement {
  const existing = app.querySelector<HTMLElement>('.nav-container');
  if (existing) return existing;
  const el = document.createElement('div');
  el.className = 'nav-container';
  app.insertBefore(el, app.firstChild);
  return el;
}

async function renderTree(): Promise<void> {
  progress = await getProgress();
  if (!tree) {
    tree = await loadSkillTree();
  }
  const container = getPageContainer();
  renderNav(getNavContainer(), currentState, progress!);
  renderSkillTree(container, tree, progress!);
}

async function renderAnimationPage(): Promise<void> {
  const { currentLessonId } = currentState;
  if (!currentLessonId) {
    window.location.hash = '#tree';
    return;
  }

  progress = await getProgress();
  renderNav(getNavContainer(), currentState, progress!);

  const lesson = await loadLessonById(currentLessonId);
  if (!lesson) {
    window.location.hash = '#tree';
    return;
  }

  const container = getPageContainer();
  container.innerHTML = '';

  renderAnimation(container, lesson.animation, () => {
    window.location.hash = `#lesson/${currentLessonId}`;
  });
}

async function renderLessonPage(): Promise<void> {
  const { currentLessonId } = currentState;
  if (!currentLessonId) {
    window.location.hash = '#tree';
    return;
  }

  progress = await getProgress();
  renderNav(getNavContainer(), currentState, progress!);

  const lesson = await loadLessonById(currentLessonId);
  if (!lesson) {
    window.location.hash = '#tree';
    return;
  }

  const container = getPageContainer();
  container.innerHTML = '';

  await renderLesson(container, lesson, progress!);
}

async function handleRoute(state: AppState): Promise<void> {
  currentState = state;

  switch (state.page) {
    case 'tree':
      await renderTree();
      break;
    case 'animation':
      await renderAnimationPage();
      break;
    case 'lesson':
      await renderLessonPage();
      break;
  }
}

function showLoading(): void {
  const container = getPageContainer();
  container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading CodeLabs...</p></div>`;
}

function showError(msg: string): void {
  const container = getPageContainer();
  container.innerHTML = `<div class="error-state"><span class="error-icon">⚠️</span><h3>Something went wrong</h3><p>${msg}</p><button class="retry-btn" onclick="location.reload()">Retry</button></div>`;
}

async function init(): Promise<void> {
  showLoading();
  try {
    progress = await getProgress();
    tree = await loadSkillTree();
  } catch {
    showError('Failed to load lessons. Make sure the dev server is running.');
    return;
  }

  router.subscribe((state: AppState) => {
    handleRoute(state);
  });

  handleRoute(router.getState());
}

init();
