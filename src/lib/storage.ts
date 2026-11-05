import type { AppState, Settings } from '../types';

const KEY = 'g-ai-master:state:v1';

export const defaultSettings: Settings = {
  theme: 'light', fontSize: 'm', density: 'comfortable', reduceMotion: false, order: 'recommended',
};

export function defaultState(): AppState {
  return {
    schemaVersion: 1,
    mode: 'g',
    answers: [],
    lessonsDone: [],
    bookmarks: [],
    review: {},
    exams: [],
    exerciseChecks: {},
    settings: { ...defaultSettings },
    contentVersion: '2026.11.4',
    dailyGoalMin: 20,
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const oneOf = <T extends string>(v: unknown, xs: readonly T[], d: T): T => (xs.includes(v as T) ? (v as T) : d);

/**
 * 保存データの構造検証。壊れたデータでは初期化せず、検証可能な範囲で復旧する（旧状態を勝手に消さない）。
 * フィールド単位で型を確認し、型が壊れたフィールドだけを既定値に戻す（1項目の破損で起動不能にならないようにする）。
 */
export function parseState(raw: string | null): AppState {
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isObj(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.answers) || !isObj(parsed.settings)) {
      return defaultState();
    }
    const d = defaultState();
    const st = parsed.settings;
    const arr = <T>(v: unknown, fallback: T[], ok: (x: unknown) => boolean): T[] => (Array.isArray(v) ? (v.filter(ok) as T[]) : fallback);
    const isStr = (x: unknown) => typeof x === 'string';
    return {
      ...d,
      mode: oneOf(parsed.mode, ['g', 'literacy'] as const, d.mode),
      answers: arr(parsed.answers, d.answers, (a) => isObj(a) && typeof a.questionId === 'string' && Array.isArray(a.selected) && typeof a.correct === 'boolean' && typeof a.at === 'string'),
      lessonsDone: arr(parsed.lessonsDone, d.lessonsDone, isStr),
      bookmarks: arr(parsed.bookmarks, d.bookmarks, isStr),
      review: isObj(parsed.review)
        ? Object.fromEntries(Object.entries(parsed.review).filter(([, c]) => isObj(c) && typeof c.due === 'string' && typeof c.ease === 'number')) as AppState['review']
        : d.review,
      exams: arr(parsed.exams, d.exams, (e) => isObj(e) && typeof e.id === 'string' && Array.isArray(e.questionIds) && isObj(e.answers) && Array.isArray(e.pauses) && Array.isArray(e.flags)),
      exerciseChecks: isObj(parsed.exerciseChecks) ? parsed.exerciseChecks as AppState['exerciseChecks'] : d.exerciseChecks,
      settings: {
        theme: oneOf(st.theme, ['light', 'dark'] as const, defaultSettings.theme),
        fontSize: oneOf(st.fontSize, ['s', 'm', 'l'] as const, defaultSettings.fontSize),
        density: oneOf(st.density, ['comfortable', 'compact'] as const, defaultSettings.density),
        reduceMotion: typeof st.reduceMotion === 'boolean' ? st.reduceMotion : defaultSettings.reduceMotion,
        order: oneOf(st.order, ['syllabus', 'recommended', 'weak', 'free'] as const, defaultSettings.order),
      },
      contentVersion: typeof parsed.contentVersion === 'string' ? parsed.contentVersion : d.contentVersion,
      lastUpdateCheck: isObj(parsed.lastUpdateCheck) && typeof parsed.lastUpdateCheck.at === 'string' ? parsed.lastUpdateCheck as AppState['lastUpdateCheck'] : undefined,
      dailyGoalMin: clampGoal(parsed.dailyGoalMin),
    };
  } catch {
    return defaultState();
  }
}

export function clampGoal(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 20;
  return Math.min(180, Math.max(5, n));
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    const state = parseState(raw);
    // 壊れたデータは上書きせず、復旧用に別キーへ退避してから初期状態で起動する
    if (raw && state.answers.length === 0 && raw !== JSON.stringify(state) && isCorrupt(raw)) {
      try { localStorage.setItem(`${KEY}:backup`, raw); } catch { /* 退避失敗時は何もしない */ }
    }
    return state;
  } catch { return defaultState(); }
}

function isCorrupt(raw: string): boolean {
  try {
    const p = JSON.parse(raw) as Partial<AppState>;
    return !(p.schemaVersion === 1 && Array.isArray(p.answers));
  } catch { return true; }
}

export function saveState(state: AppState): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存に失敗しました' };
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}
