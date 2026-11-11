import { describe, it, expect } from 'vitest';
import { parseState, salvageState, defaultState, clampGoal } from '../../src/lib/storage';
import { checkUpdate, compareVersion, BUNDLED_CONTENT_VERSION } from '../../src/lib/update';
import manifest from '../../public/data/manifest.json';

// 二重監査（Claude Code側, 2026-11-03）で追加した回帰テスト。詳細は docs/AUDIT_DUAL_CLAUDE_CODE.md
// 2026-11-11 の再設計で parseState の契約を変更（{state,status,notes} を返し、致命的破損は
// state=null＋status=corrupt、部分復旧は salvageState の責務）。本テストも新契約に追随した。
describe('保存データの型破損からの復旧', () => {
  const base = () => ({ ...defaultState(), answers: [{ questionId: 'q-g01-1', selected: [0], correct: true, at: '2026-11-03T00:00:00.000Z', seconds: 5, firstSeen: true, context: 'practice' }] });
  it('review が null は致命的破損として検出し、部分復旧で回答記録は保持される', () => {
    const raw = JSON.stringify({ ...base(), review: null });
    expect(parseState(raw).status).toBe('corrupt');
    expect(parseState(raw).state).toBeNull();
    const s = salvageState(raw)!;
    expect(s.review).toEqual({});
    expect(s.answers).toHaveLength(1);
  });
  it('exams / bookmarks が配列でない場合は部分復旧で既定値に戻す（他フィールドは保持）', () => {
    const s = salvageState(JSON.stringify({ ...base(), exams: 'x', bookmarks: { a: 1 }, lessonsDone: ['les-g01', 3] }))!;
    expect(s.exams).toEqual([]);
    expect(s.bookmarks).toEqual([]);
    expect(s.lessonsDone).toEqual(['les-g01']);
    expect(s.answers).toHaveLength(1);
  });
  it('設定値が範囲外なら既定値に戻す', () => {
    const s = parseState(JSON.stringify({ ...base(), settings: { theme: 'neon', fontSize: 'xl', density: 'compact', reduceMotion: 'yes', order: 'weak' } })).state!;
    expect(s.settings).toEqual({ theme: 'light', fontSize: 'm', density: 'compact', reduceMotion: false, order: 'weak', startMode: 'g' });
  });
  it('不正な回答レコードだけを除外する', () => {
    const s = parseState(JSON.stringify({ ...base(), answers: [...base().answers, { questionId: 1 }, null] })).state!;
    expect(s.answers).toHaveLength(1);
  });
  it('1日の目標は5〜180分に丸める', () => {
    expect(clampGoal(0)).toBe(5); expect(clampGoal(-3)).toBe(5); expect(clampGoal(999)).toBe(180); expect(clampGoal('20')).toBe(20); expect(clampGoal(30)).toBe(30);
  });
});

describe('教材更新のバージョン比較', () => {
  const fake = (body: unknown, ok = true) => (async () => ({ ok, status: ok ? 200 : 500, json: async () => body })) as unknown as typeof fetch;
  it('数値として比較する（文字列比較の 2026.11.10 < 2026.11.9 を避ける）', () => {
    expect(compareVersion('2026.11.10', '2026.11.9')).toBeGreaterThan(0);
    expect(compareVersion('2026.11.2', '2026.11.2')).toBe(0);
    expect(compareVersion('2026.10.9', '2026.11.0')).toBeLessThan(0);
  });
  it('公開マニフェストが同梱版より古い場合は「新しい版あり」と表示しない', async () => {
    const r = await checkUpdate('2026.11.3', fake({ contentVersion: '2026.11.1', publishedAt: '2026-11-01', syllabusVersion: 'G' }));
    expect(r.status).toBe('up-to-date');
  });
  it('新しい版がある場合は available', async () => {
    const r = await checkUpdate('2026.11.3', fake({ contentVersion: '2026.12.0', publishedAt: '2026-12-01', syllabusVersion: 'G' }));
    expect(r.status).toBe('available');
  });
  it('不正な版番号・取得失敗は failed（旧教材を維持）', async () => {
    expect((await checkUpdate('2026.11.3', fake({ contentVersion: 'latest', publishedAt: 'x', syllabusVersion: 'G' }))).status).toBe('failed');
    expect((await checkUpdate('2026.11.3', fake({}, false))).status).toBe('failed');
    expect((await checkUpdate('2026.11.3', (async () => { throw new Error('offline'); }) as unknown as typeof fetch)).status).toBe('failed');
  });
  it('同梱版・既定状態・公開マニフェストの版が一致している', () => {
    expect(manifest.contentVersion).toBe(BUNDLED_CONTENT_VERSION);
    expect(defaultState().contentVersion).toBe(BUNDLED_CONTENT_VERSION);
  });
});
