export type Mode = 'g' | 'literacy';
export type PublishStatus = 'published' | 'draft' | 'review' | 'suspended' | 'deprecated';

export interface SourceRef { title: string; url: string; }

export interface SyllabusNode {
  id: string;
  mode: Mode;
  /** 大分野 */
  area: string;
  /** 中分野（章） */
  chapter: string;
  title: string;
  order: number;
  prerequisites: string[];
}

export interface Lesson {
  id: string;
  mode: Mode;
  syllabusId: string;
  title: string;
  basic: string[];
  detail: string[];
  keyPoints: string[];
  pitfalls: string[];
  /** 発展内容（試験範囲外）を含む場合に明示 */
  advancedNote?: string;
  sources: SourceRef[];
  version: number;
  status: PublishStatus;
  createdAt: string;
  verifiedAt: string;
  reviewBy: string;
}

export type QuestionType = 'single' | 'multi' | 'truefalse';

export interface Question {
  id: string;
  mode: Mode;
  syllabusId: string;
  conceptId: string;
  groupId: string;
  type: QuestionType;
  stem: string;
  choices: string[];
  answer: number[];
  difficulty: 1 | 2 | 3;
  basic: string;
  detail: string;
  choiceReasons: string[];
  sources: SourceRef[];
  version: number;
  status: PublishStatus;
  createdAt: string;
  verifiedAt: string;
}

export interface Exercise {
  id: string;
  mode: Mode;
  syllabusId: string;
  title: string;
  background: string;
  goal: string;
  constraints: string[];
  steps: string[];
  rubric: string[];
  modelThinking: string;
  failureExample: string;
  improvementExample: string;
  sources: SourceRef[];
  version: number;
  status: PublishStatus;
  verifiedAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  vendor: string;
  asOf: string;
  /** 確認日時点の主なモデル・提供形態（一次情報で確認できたものだけ） */
  lineup: string;
  source: SourceRef;
  strengths: string;
  limits: string;
  pricingNote: string;
  privacyNote: string;
  bestFor: string;
}

export type NewsCategory = 'モデル' | 'サービス動向' | '制度・政策' | '研究' | 'セキュリティ' | '試験情報';

export interface NewsItem {
  id: string;
  /** 発表・公表日（YYYY-MM-DD）。発表日が特定できない日程情報などは、一次情報で内容を確認した日 */
  date: string;
  title: string;
  /** 何が起きたか＋学習上の意味。一次情報で確認できる範囲だけを書く */
  summary: string;
  category: NewsCategory;
  /** major = 超重要（クイズや教材へ取り込みを検討する水準） */
  importance: 'normal' | 'major';
  source: SourceRef;
  /** このアプリへ取り込んだ日（YYYY-MM-DD） */
  addedAt: string;
  /** 超重要ニュースを他メニューへ取り込んだ内容（例: 問題を追加） */
  incorporated?: string;
}

export interface AnswerRecord {
  questionId: string;
  selected: number[];
  correct: boolean;
  at: string;
  seconds: number;
  firstSeen: boolean;
  context: 'practice' | 'exam' | 'review';
}

export interface ReviewCard {
  questionId: string;
  ease: number;
  intervalDays: number;
  due: string; // YYYY-MM-DD
  reps: number;
  lapses: number;
}

export interface ExamSession {
  id: string;
  kind: 'full' | 'short' | 'field' | 'custom';
  mode: Mode;
  startedAt: string;
  limitSec: number;
  questionIds: string[];
  answers: Record<string, number[]>;
  flags: string[];
  current: number;
  pauses: { at: string; resumedAt?: string }[];
  status: 'in-progress' | 'submitted';
  submittedAt?: string;
  strict: boolean;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 's' | 'm' | 'l';
  density: 'comfortable' | 'compact';
  reduceMotion: boolean;
  order: 'syllabus' | 'recommended' | 'weak' | 'free';
}

export interface AppState {
  schemaVersion: 1;
  mode: Mode;
  answers: AnswerRecord[];
  lessonsDone: string[];
  bookmarks: string[];
  review: Record<string, ReviewCard>;
  exams: ExamSession[];
  exerciseChecks: Record<string, number[]>; // exerciseId -> checked rubric indexes (自己評価)
  settings: Settings;
  contentVersion: string;
  lastUpdateCheck?: { at: string; result: string };
  dailyGoalMin: number;
}
