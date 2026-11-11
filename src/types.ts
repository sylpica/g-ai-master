export type Mode = 'g' | 'literacy' | 'passport';
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
  /** 図表ID（src/data/lessonVisuals.ts の LESSON_VISUALS を引く） */
  visualIds?: string[];
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
  /** 問題ごとの選択肢表示順（元のインデックス列）。セッション開始時に凍結する。 */
  choicePerms?: Record<string, number[]>;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 's' | 'm' | 'l';
  density: 'comfortable' | 'compact';
  reduceMotion: boolean;
  order: 'syllabus' | 'recommended' | 'weak' | 'free';
  /** アプリを開いた時に最初に表示するモード */
  startMode: Mode;
}

export interface AppState {
  schemaVersion: 2;
  mode: Mode;
  answers: AnswerRecord[];
  lessonsDone: string[];
  /** lesson:<id> / q:<id> / card:<id> の安定識別子 */
  bookmarks: string[];
  review: Record<string, ReviewCard>;
  exams: ExamSession[];
  exerciseChecks: Record<string, number[]>; // exerciseId -> checked rubric indexes (自己評価)
  settings: Settings;
  contentVersion: string;
  lastUpdateCheck?: { at: string; result: string };
  dailyGoalMin: number;
  /** 単語帳カードの間隔反復（問題の採点履歴とは分離） */
  cardReview: Record<string, CardReview>;
  /** 単語帳の開始向きの前回選択（セッション開始時にスナップショットされる） */
  cardDirection: CardDirection;
  /** 演習の出題順・選択肢順シャッフルの既定（セッション開始時にスナップショットされる） */
  practicePrefs: { shuffleQuestions: boolean; shuffleChoices: boolean };
}

/** 旧スキーマ（v1）。移行と検証フィクスチャのために形を保持する */
export interface AppStateV1 {
  schemaVersion: 1;
  mode: Mode;
  answers: AnswerRecord[];
  lessonsDone: string[];
  bookmarks: string[];
  review: Record<string, ReviewCard>;
  exams: ExamSession[];
  exerciseChecks: Record<string, number[]>;
  settings: Settings;
  contentVersion: string;
  lastUpdateCheck?: { at: string; result: string };
  dailyGoalMin: number;
}

/** 単語帳の1枚。表面＝用語、裏面＝定義。意味→用語では reversePrompt（用語の漏れない説明）を表面にする */
export interface Flashcard {
  id: string; // card-g01-01 形式の安定ID
  mode: Mode;
  syllabusId: string;
  conceptId: string;
  term: string;
  aliases?: string[];
  /** 短い定義（裏面の核） */
  definition: string;
  /** 意味→用語の表面。用語名・略号が答えとして漏れない文章。未指定なら definition を使う */
  reversePrompt?: string;
  detail?: string;
  example?: string;
  confusion?: string;
  lessonId?: string;
  questionIds: string[];
  sources: SourceRef[];
  difficulty: 1 | 2 | 3;
  verifiedAt: string;
}

export type CardDirection = 'term-first' | 'meaning-first';
export type CardGrade = 'known' | 'fuzzy' | 'unknown';

export interface CardReview {
  cardId: string;
  ease: number;
  intervalDays: number;
  due: string; // YYYY-MM-DD
  reps: number;
  lapses: number;
  lastGrade?: CardGrade;
  lastAt?: string;
}

/** 教材の図表。すべてテキストで描画できる構造化データにし、代替テキストを兼ねる */
export type LessonVisual =
  | { kind: 'nest'; title: string; layers: { label: string; note?: string }[]; caption?: string }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; caption?: string }
  | { kind: 'flow'; title: string; steps: { label: string; note?: string }[]; caption?: string }
  | { kind: 'compare'; title: string; left: { head: string; points: string[] }; right: { head: string; points: string[] }; caption?: string }
  | { kind: 'formula'; title: string; expr: string; vars: { sym: string; meaning: string }[]; example?: string; caption?: string }
  | { kind: 'timeline'; title: string; events: { when: string; label: string }[]; caption?: string };
