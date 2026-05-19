import '../styles/nav.css';
import type { AppState, UserProgress } from '../types';

export default function renderNav(
  container: HTMLElement,
  state: AppState,
  progress: UserProgress,
): void {
  container.innerHTML = `
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-left">
          ${state.page !== 'tree'
            ? `<button class="nav-back" onclick="window.location.hash='#tree'">\u2190</button>`
            : '<span class="nav-logo">CodeLabs</span>'}
        </div>
        <div class="nav-stats">
          <span class="nav-xp">${progress.xp} XP</span>
          <span class="nav-streak">\uD83D\uDD25 ${progress.streak}</span>
        </div>
      </div>
    </nav>`;
}
