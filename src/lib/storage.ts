import type { AppState, AppStateV1, Settings, AnswerRecord, ReviewCard, ExamSession, CardReview } from '../types';

/**
 * 学習記録の保存・検証・移行。
 * 設計原則（2026-11-11 再設計）:
 * - 読み込みに失敗しても、既存データを初期値で自動上書きしない。原文は退避キーへ保存し、利用者へ明示する。
 * - インポートは厳格検証を通ったものだけを、プレビュー確認のうえで原子的に反映する。不正なファイルは1ビットも書き込まない。
 * - 検証は「構造（致命的）」と「レコード単位（落として件数を報告）」を分ける。
 */
export const STORAGE_KEY = 'g-ai-master:state:v1'; // 保存キーは互換のため据え置く（中身の版は schemaVersion で管理）
export const BACKUP_KEY = 'g-ai-master:state:backup';
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export const defaultSettings: Settings = {
  theme: 'light', fontSize: 'm', density: 'comfortable', reduceMotion: false, order: 'recommended', startMode: 'g',
};

export function defaultState(): AppState {
  return {
    schemaVersion: 2,
    mode: 'g',
    answers: [],
    lessonsDone: [],
    bookmarks: [],
    review: {},
    exams: [],
    exerciseChecks: {},
    settings: { ...defaultSettings },
    contentVersion: '2026.11.13',
    dailyGoalMin: 20,
    cardReview: {},
    cardDirection: 'term-first',
    practicePrefs: { shuffleQuestions: true, shuffleChoices: true },
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string' && x.length > 0;
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isIntIn = (x: unknown, min: number, max: number): x is number => isNum(x) && Number.isInteger(x) && x >= min && x <= max;
const oneOf = <T extends string>(v: unknown, xs: readonly T[], d: T): T => (xs.includes(v as T) ? (v as T) : d);
const isDateStr = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(new Date(`${x}T00:00:00`).getTime());
const isIsoStr = (x: unknown): x is string => typeof x === 'string' && x.length >= 10 && !Number.isNaN(Date.parse(x));

export function clampGoal(v: unknown): number {
  const n = isNum(v) ? Math.round(v) : 20;
  return Math.min(180, Math.max(5, n));
}

const CONTEXTS = ['practice', 'exam', 'review'] as const;
const EXAM_KINDS = ['full', 'short', 'field', 'custom'] as const;
const GRADES = ['known', 'fuzzy', 'unknown'] as const;

export function isValidAnswer(a: unknown): a is AnswerRecord {
  return isObj(a) && isStr(a.questionId)
    && Array.isArray(a.selected) && a.selected.length <= 16 && a.selected.every((n) => isIntIn(n, 0, 15)) && new Set(a.selected).size === a.selected.length
    && typeof a.correct === 'boolean' && isIsoStr(a.at) && isNum(a.seconds) && a.seconds >= 0 && a.seconds <= 86400
    && typeof a.firstSeen === 'boolean' && CONTEXTS.includes(a.context as typeof CONTEXTS[number]);
}

export function isValidReviewCard(c: unknown): c is ReviewCard {
  return isObj(c) && isStr(c.questionId) && isNum(c.ease) && c.ease >= 1 && c.ease <= 4
    && isIntIn(c.intervalDays, 0, 3650) && isDateStr(c.due) && isIntIn(c.reps, 0, 100000) && isIntIn(c.lapses, 0, 100000);
}

export function isValidCardReview(c: unknown): c is CardReview {
  return isObj(c) && isStr(c.cardId) && isNum(c.ease) && c.ease >= 1 && c.ease <= 4
    && isIntIn(c.intervalDays, 0, 3650) && isDateStr(c.due) && isIntIn(c.reps, 0, 100000) && isIntIn(c.lapses, 0, 100000)
    && (c.lastGrade === undefined || GRADES.includes(c.lastGrade as typeof GRADES[number]))
    && (c.lastAt === undefined || isIsoStr(c.lastAt));
}

export function isValidExam(e: unknown): e is ExamSession {
  if (!isObj(e) || !isStr(e.id) || !EXAM_KINDS.includes(e.kind as typeof EXAM_KINDS[number]) || !(e.mode === 'g' || e.mode === 'literacy' || e.mode === 'passport')) return false;
  if (!isIsoStr(e.startedAt) || !isIntIn(e.limitSec, 30, 86400)) return false;
  if (!Array.isArray(e.questionIds) || e.questionIds.length > 1000 || !e.questionIds.every(isStr) || new Set(e.questionIds).size !== e.questionIds.length) return false;
  if (!isObj(e.answers) || !Object.values(e.answers).every((v) => Array.isArray(v) && v.length <= 16 && v.every((n) => isIntIn(n, 0, 15)))) return false;
  if (!Array.isArray(e.flags) || !e.flags.every(isStr)) return false;
  if (!isIntIn(e.current, 0, Math.max(0, e.questionIds.length))) return false;
  if (!Array.isArray(e.pauses) || !e.pauses.every((p) => isObj(p) && isIsoStr(p.at) && (p.resumedAt === undefined || isIsoStr(p.resumedAt)))) return false;
  if (!(e.status === 'in-progress' || e.status === 'submitted')) return false;
  if (e.submittedAt !== undefined && !isIsoStr(e.submittedAt)) return false;
  return typeof e.strict === 'boolean';
}

function parseSettings(st: Record<string, unknown>): Settings {
  return {
    theme: oneOf(st.theme, ['light', 'dark'] as const, defaultSettings.theme),
    fontSize: oneOf(st.fontSize, ['s', 'm', 'l'] as const, defaultSettings.fontSize),
    density: oneOf(st.density, ['comfortable', 'compact'] as const, defaultSettings.density),
    reduceMotion: typeof st.reduceMotion === 'boolean' ? st.reduceMotion : defaultSettings.reduceMotion,
    order: oneOf(st.order, ['syllabus', 'recommended', 'weak', 'free'] as const, defaultSettings.order),
    startMode: oneOf(st.startMode, ['g', 'literacy', 'passport'] as const, defaultSettings.startMode),
  };
}

export interface ParseOutcome {
  state: AppState | null;
  status: 'ok' | 'empty' | 'migrated' | 'corrupt' | 'unsupported';
  /** レコード単位で落とした件数などの注記 */
  notes: string[];
}

/** 構造が致命的に壊れているかを判定する（設定・回答配列など、土台が無いものは復旧不能として扱う） */
function hasFatalShape(p: Record<string, unknown>): boolean {
  return !Array.isArray(p.answers) || !isObj(p.settings) || !Array.isArray(p.bookmarks) || !Array.isArray(p.lessonsDone)
    || !isObj(p.review) || !Array.isArray(p.exams) || !isObj(p.exerciseChecks);
}

function buildState(p: Record<string, unknown>, notes: string[]): AppState {
  const d = defaultState();
  const filter = <T>(v: unknown, ok: (x: unknown) => x is T, label: string): T[] => {
    if (!Array.isArray(v)) return [];
    const kept = v.filter(ok);
    if (kept.length !== v.length) notes.push(`${label}：${v.length - kept.length}件の不正なレコードを除外しました`);
    return kept as T[];
  };
  const filterMap = <T>(v: unknown, ok: (x: unknown) => x is T, label: string): Record<string, T> => {
    if (!isObj(v)) return {};
    const out: Record<string, T> = {};
    let dropped = 0;
    for (const [k, val] of Object.entries(v)) { if (ok(val)) out[k] = val as T; else dropped += 1; }
    if (dropped) notes.push(`${label}：${dropped}件の不正なレコードを除外しました`);
    return out;
  };
  const cardReviewRaw = isObj(p.cardReview) ? p.cardReview : {};
  return {
    schemaVersion: 2,
    mode: oneOf(p.mode, ['g', 'literacy', 'passport'] as const, d.mode),
    answers: filter(p.answers, isValidAnswer, '回答記録'),
    lessonsDone: Array.isArray(p.lessonsDone) ? [...new Set(p.lessonsDone.filter(isStr))] : [],
    bookmarks: Array.isArray(p.bookmarks) ? [...new Set(p.bookmarks.filter(isStr))] : [],
    review: filterMap(p.review, isValidReviewCard, '復習予定'),
    exams: filter(p.exams, isValidExam, '模試記録'),
    exerciseChecks: isObj(p.exerciseChecks)
      ? Object.fromEntries(Object.entries(p.exerciseChecks).filter(([, v]) => Array.isArray(v) && v.every((n) => isIntIn(n, 0, 50))).map(([k, v]) => [k, [...new Set(v as number[])]]))
      : {},
    settings: parseSettings(p.settings as Record<string, unknown>),
    contentVersion: typeof p.contentVersion === 'string' ? p.contentVersion : d.contentVersion,
    lastUpdateCheck: isObj(p.lastUpdateCheck) && isIsoStr(p.lastUpdateCheck.at) && typeof p.lastUpdateCheck.result === 'string'
      ? (p.lastUpdateCheck as AppState['lastUpdateCheck']) : undefined,
    dailyGoalMin: clampGoal(p.dailyGoalMin),
    cardReview: filterMap(cardReviewRaw, isValidCardReview, '単語帳の復習予定'),
    cardDirection: oneOf(p.cardDirection, ['term-first', 'meaning-first'] as const, d.cardDirection),
    practicePrefs: isObj(p.practicePrefs)
      ? { shuffleQuestions: typeof p.practicePrefs.shuffleQuestions === 'boolean' ? p.practicePrefs.shuffleQuestions : true, shuffleChoices: typeof p.practicePrefs.shuffleChoices === 'boolean' ? p.practicePrefs.shuffleChoices : true }
      : d.practicePrefs,
  };
}

/** v1→v2 移行。v1の全フィールドを引き継ぎ、v2で増えた分は既定値で補う（無損失） */
export function migrateV1toV2(v1: AppStateV1): AppState {
  return { ...v1, schemaVersion: 2, cardReview: {}, cardDirection: 'term-first', practicePrefs: { shuffleQuestions: true, shuffleChoices: true } };
}

export function parseState(raw: string | null): ParseOutcome {
  if (!raw) return { state: defaultState(), status: 'empty', notes: [] };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return { state: null, status: 'corrupt', notes: ['JSONとして読み取れませんでした'] }; }
  if (!isObj(parsed)) return { state: null, status: 'corrupt', notes: ['保存データの形式が不正です'] };
  if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) {
    return { state: null, status: 'unsupported', notes: [`未対応のスキーマ版です（${String(parsed.schemaVersion)}）`] };
  }
  if (hasFatalShape(parsed)) return { state: null, status: 'corrupt', notes: ['保存データの必須項目が壊れています'] };
  const notes: string[] = [];
  const state = buildState(parsed, notes);
  return { state, status: parsed.schemaVersion === 1 ? 'migrated' : 'ok', notes };
}

/** 破損データからの部分的復旧：構造が壊れていても、検証を通るレコードだけを拾う（利用者が選んだ場合のみ使う） */
export function salvageState(raw: string): AppState | null {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!isObj(parsed)) return null;
  const patched: Record<string, unknown> = {
    ...parsed,
    answers: Array.isArray(parsed.answers) ? parsed.answers : [],
    settings: isObj(parsed.settings) ? parsed.settings : { ...defaultSettings },
    bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    lessonsDone: Array.isArray(parsed.lessonsDone) ? parsed.lessonsDone : [],
    review: isObj(parsed.review) ? parsed.review : {},
    exams: Array.isArray(parsed.exams) ? parsed.exams : [],
    exerciseChecks: isObj(parsed.exerciseChecks) ? parsed.exerciseChecks : {},
  };
  const notes: string[] = [];
  return buildState(patched, notes);
}

export interface LoadedState {
  state: AppState;
  /** 起動時に保存データを使えなかった場合の情報。null でなければ自動保存は止め、利用者の判断を待つ */
  loadIssue: { kind: 'corrupt' | 'unsupported'; raw: string; notes: string[] } | null;
  migrated: boolean;
}

export function loadState(storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): LoadedState {
  let raw: string | null = null;
  try { raw = storage.getItem(STORAGE_KEY); } catch { raw = null; }
  const out = parseState(raw);
  if (out.state) {
    if (out.status === 'migrated' && raw) {
      // 移行前の原文を退避してから、移行済み状態での起動を許可する
      try { storage.setItem(BACKUP_KEY, raw); } catch { /* 退避できなくても移行自体は無損失なので続行 */ }
    }
    return { state: out.state, loadIssue: null, migrated: out.status === 'migrated' };
  }
  // 使えないデータは退避し、初期状態で起動するが、自動保存は呼び出し側で止める（loadIssue が解消されるまで上書きしない）
  if (raw) { try { storage.setItem(BACKUP_KEY, raw); } catch { /* 退避失敗時も原文はそのまま残る */ } }
  return { state: defaultState(), loadIssue: { kind: out.status === 'unsupported' ? 'unsupported' : 'corrupt', raw: raw ?? '', notes: out.notes }, migrated: false };
}

export function saveState(state: AppState, storage: Pick<Storage, 'setItem'> = localStorage): { ok: boolean; error?: string } {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存に失敗しました' };
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export interface ImportResult {
  ok: boolean;
  state?: AppState;
  errors: string[];
  summary?: { answers: number; exams: number; bookmarks: number; lessonsDone: number; reviewCards: number; flashcardsDue: number };
}

/**
 * インポート用JSONの厳格検証。1件でも不正なレコードがあれば全体を拒否する（部分取り込みで履歴を壊さない）。
 * validIds を渡すと、存在しない問題・カードIDへの参照も拒否する。
 */
export function validateImport(text: string, validIds?: { questions: Set<string>; cards: Set<string> }): ImportResult {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) return { ok: false, errors: [`ファイルが大きすぎます（上限 ${MAX_IMPORT_BYTES / 1024 / 1024}MB）`] };
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, errors: ['JSONとして読み取れませんでした'] }; }
  if (!isObj(parsed)) return { ok: false, errors: ['ファイルの形式が不正です'] };
  if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) return { ok: false, errors: ['このアプリでエクスポートしたJSONではありません（スキーマ版が未対応です）'] };
  if (hasFatalShape(parsed)) return { ok: false, errors: ['必須項目が壊れているため取り込めません'] };
  const errors: string[] = [];
  const checkArr = <T>(v: unknown, ok: (x: unknown) => x is T, label: string) => {
    if (!Array.isArray(v)) { errors.push(`${label}の形式が不正です`); return; }
    const bad = v.filter((x) => !ok(x)).length;
    if (bad) errors.push(`${label}に不正なレコードが${bad}件あります`);
  };
  checkArr(parsed.answers, isValidAnswer, '回答記録');
  checkArr(parsed.exams, isValidExam, '模試記録');
  if (!Array.isArray(parsed.bookmarks) || !parsed.bookmarks.every(isStr)) errors.push('ブックマークの形式が不正です');
  if (!Array.isArray(parsed.lessonsDone) || !parsed.lessonsDone.every(isStr)) errors.push('学習済み教材の形式が不正です');
  if (isObj(parsed.review) && Object.values(parsed.review).some((c) => !isValidReviewCard(c))) errors.push('復習予定に不正なレコードがあります');
  if (parsed.schemaVersion === 2 && isObj(parsed.cardReview) && Object.values(parsed.cardReview).some((c) => !isValidCardReview(c))) errors.push('単語帳の復習予定に不正なレコードがあります');
  if (validIds) {
    const badQ = (parsed.answers as AnswerRecord[]).filter((a) => isValidAnswer(a) && !validIds.questions.has(a.questionId)).length;
    if (badQ) errors.push(`現在の問題集に存在しない問題への回答が${badQ}件あります`);
    if (Array.isArray(parsed.bookmarks)) {
      const badB = parsed.bookmarks.filter((b) => typeof b === 'string' && b.startsWith('card:') && !validIds.cards.has(b.slice(5))).length;
      if (badB) errors.push(`存在しない単語カードへのブックマークが${badB}件あります`);
    }
  }
  if (errors.length) return { ok: false, errors };
  const notes: string[] = [];
  const state = buildState(parsed, notes);
  return {
    ok: true, state, errors: [],
    summary: {
      answers: state.answers.length, exams: state.exams.length, bookmarks: state.bookmarks.length,
      lessonsDone: state.lessonsDone.length, reviewCards: Object.keys(state.review).length, flashcardsDue: Object.keys(state.cardReview).length,
    },
  };
}
