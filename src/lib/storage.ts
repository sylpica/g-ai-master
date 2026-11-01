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
    contentVersion: '2026.11.0',
    dailyGoalMin: 20,
  };
}

/** 保存データの構造検証。壊れたデータでは初期化せず、検証可能な範囲で復旧する（旧状態を勝手に消さない）。 */
export function parseState(raw: string | null): AppState {
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.answers) || typeof parsed.settings !== 'object' || parsed.settings === null) {
      return defaultState();
    }
    return { ...defaultState(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } } as AppState;
  } catch {
    return defaultState();
  }
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
