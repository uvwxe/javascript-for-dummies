export interface TestCase {
  name: string;
  input: unknown[];
  expected: unknown;
}

export interface Lesson {
  id: string;
  title: string;
  language: string;
  branch: string;
  prerequisites: string[];
  jobContext: string;
  animation: string;
  lesson: LessonSection[];
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
}

export interface LessonSection {
  type: 'text' | 'code' | 'tip' | 'heading';
  content: string;
}

export interface SkillTreeNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  prerequisites: string[];
}

export interface SkillTree {
  branches: SkillTreeBranch[];
}

export interface SkillTreeBranch {
  id: string;
  title: string;
  description: string;
  language: string;
  icon: string;
  lessons: SkillTreeNode[];
}

export interface UserProgress {
  completedLessons: string[];
  completedAt: Record<string, number>;
  streak: number;
  lastActive: number;
  xp: number;
}

export type Page = 'tree' | 'animation' | 'lesson';

export interface AppState {
  page: Page;
  currentLessonId: string | null;
  currentBranch: string | null;
}
