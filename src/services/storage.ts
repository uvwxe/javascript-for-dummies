import { UserProgress } from '../types';

const DB_NAME = 'codelabs';
const DB_VERSION = 1;
const STORE_NAME = 'progress';
const KEY = 'user-progress';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function defaultProgress(): UserProgress {
  return {
    completedLessons: [],
    completedAt: {},
    streak: 0,
    lastActive: Date.now(),
    xp: 0
  };
}

export async function getProgress(): Promise<UserProgress> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const raw = await new Promise<unknown>((resolve, reject) => {
      const req = store.get(KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();

    if (raw && typeof raw === 'object') {
      const p = raw as Record<string, unknown>;
      const now = Date.now();
      const storedLast = typeof p.lastActive === 'number' ? p.lastActive : now;
      let streak = typeof p.streak === 'number' ? p.streak : 0;

      if (!isSameDay(storedLast, now)) {
        if (isYesterday(storedLast, now)) streak += 1;
        else streak = 1;
        // Persist new lastActive immediately to prevent double-count
        const updated: UserProgress = {
          completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
          completedAt: typeof p.completedAt === 'object' ? p.completedAt as Record<string, number> : {},
          streak,
          lastActive: now,
          xp: typeof p.xp === 'number' ? p.xp : 0
        };
        await saveProgress(updated);
        return updated;
      }

      return {
        completedLessons: Array.isArray(p.completedLessons) ? p.completedLessons : [],
        completedAt: typeof p.completedAt === 'object' ? p.completedAt as Record<string, number> : {},
        streak,
        lastActive: now,
        xp: typeof p.xp === 'number' ? p.xp : 0
      };
    }
    return defaultProgress();
  } catch {
    return defaultProgress();
  }
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a), db = new Date(b);
  return da.getDate() === db.getDate() && da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
}

function isYesterday(stored: number, now: number): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(stored, yesterday.getTime());
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(progress, KEY);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Silently fail — progress isn't critical
  }
}

export async function completeLesson(lessonId: string): Promise<UserProgress> {
  const progress = await getProgress();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.completedAt[lessonId] = Date.now();
    progress.xp += 100;
  }
  progress.lastActive = Date.now();
  await saveProgress(progress);
  return progress;
}
