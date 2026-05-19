import { AppState, Page } from '../types';

type Listener = (state: AppState) => void;

class Router {
  private state: AppState = { page: 'tree', currentLessonId: null, currentBranch: null };
  private listeners: Listener[] = [];

  constructor() {
    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();
  }

  getState(): AppState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  navigate(page: Page, lessonId?: string, branch?: string) {
    const parts: string[] = [page];
    if (lessonId) parts.push(lessonId);
    if (branch) parts.push(branch);
    window.location.hash = '#' + parts.join('/');
  }

  private handleHash() {
    const hash = window.location.hash.slice(1) || 'tree';
    const parts = hash.split('/');
    const page = parts[0] as Page;
    const currentLessonId = parts[1] || null;
    const currentBranch = parts[2] || null;

    this.state = { page, currentLessonId, currentBranch };
    this.listeners.forEach(fn => fn(this.state));
  }
}

export const router = new Router();
