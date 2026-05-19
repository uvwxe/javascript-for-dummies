import { Lesson, SkillTree } from '../types';

const cache = new Map<string, Lesson[]>();

export async function loadLessons(file: string): Promise<Lesson[]> {
  if (cache.has(file)) return cache.get(file)!;

  const res = await fetch(`/src/data/lessons/${file}.json`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  const lessons: Lesson[] = await res.json();
  cache.set(file, lessons);
  return lessons;
}

export async function loadLessonById(id: string): Promise<Lesson | null> {
  const index = await loadLessonIndex();

  for (const file of index.lessons) {
    const lessons = await loadLessons(file);
    const found = lessons.find(l => l.id === id);
    if (found) return found;
  }
  return null;
}

export async function loadSkillTree(): Promise<SkillTree> {
  const res = await fetch('/src/data/skill-tree.json');
  return res.json();
}

interface LessonIndex {
  lessons: string[];
}

let indexCache: LessonIndex | null = null;

async function loadLessonIndex(): Promise<LessonIndex> {
  if (indexCache) return indexCache;
  const res = await fetch('/src/data/lessons/index.json');
  indexCache = await res.json();
  return indexCache!;
}
