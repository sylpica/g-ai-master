import { describe, it, expect } from 'vitest';
import { judge, addDays } from '../../src/lib/scoring';
import { nextReview, dueCards, REVIEW_PARAMS } from '../../src/lib/review';
import { fieldStats, readiness } from '../../src/lib/analysis';
import { parseState, defaultState } from '../../src/lib/storage';
import { isValidManifest } from '../../src/lib/update';
import { publishedQuestions } from '../../src/data/questions';


describe('judge', () => {
  it('単一選択', () => { expect(judge([1], [1])).toBe(true); expect(judge([0], [1])).toBe(false); });
  it('複数選択は集合一致のみ正答', () => { expect(judge([2, 0], [0, 2])).toBe(true); expect(judge([0], [0, 2])).toBe(false); });
});

describe('review (間隔反復)', () => {
  it('正答で間隔が伸びる', () => {
    const c1 = nextReview(undefined, 'q1', true, '2026-11-02');
    expect(c1.intervalDays).toBe(REVIEW_PARAMS.firstInterval);
    expect(c1.due).toBe('2026-11-03');
    const c2 = nextReview(c1, 'q1', true, '2026-11-03');
    expect(c2.intervalDays).toBe(REVIEW_PARAMS.secondInterval);
    const c3 = nextReview(c2, 'q1', true, '2026-11-06');
    expect(c3.intervalDays).toBeGreaterThan(REVIEW_PARAMS.secondInterval);
  });
  it('誤答で翌日・ease低下・lapse加算', () => {
    const c = nextReview(undefined, 'q1', false, '2026-11-02');
    expect(c.due).toBe('2026-11-03');
    expect(c.lapses).toBe(1);
    expect(c.ease).toBeLessThan(REVIEW_PARAMS.initialEase);
    expect(c.ease).toBeGreaterThanOrEqual(REVIEW_PARAMS.minEase);
  });
  it('期限到来カードの抽出', () => {
    const a = nextReview(undefined, 'q1', true, '2026-11-01');
    const b = nextReview(undefined, 'q2', true, '2026-11-02');
    expect(dueCards({ q1: a, q2: b }, '2026-11-02').map((x) => x.questionId)).toEqual(['q1']);
  });
});

describe('analysis', () => {
  const qs = publishedQuestions.slice(0, 4);
  it('分野別集計', () => {
    const st = fieldStats([
      { questionId: qs[0].id, selected: qs[0].answer, correct: true, at: '2026-11-02T00:00:00Z', seconds: 10, firstSeen: true, context: 'practice' },
      { questionId: qs[0].id, selected: [], correct: false, at: '2026-11-02T01:00:00Z', seconds: 10, firstSeen: false, context: 'practice' },
    ], qs);
    expect(st[0].total).toBe(2);
    expect(st[0].accuracy).toBe(0.5);
    expect(st[0].firstSeenAccuracy).toBe(1);
  });
  it('到達判定は単一条件では成立しない', () => {
    const r = readiness([
      { questionId: qs[0].id, selected: qs[0].answer, correct: true, at: '2026-11-02T00:00:00Z', seconds: 1, firstSeen: true, context: 'exam' },
    ], [], 0, [], publishedQuestions, 10);
    expect(r.reached).toBe(false);
    expect(r.note).toContain('保証');
  });
});

describe('storage', () => {
  it('壊れたデータは corrupt として検出し、既定状態では上書きしない（例外を投げない）', () => {
    expect(parseState('{broken').status).toBe('corrupt');
    expect(parseState('{broken').state).toBeNull();
    expect(parseState(null).status).toBe('empty');
    expect(parseState(null).state).not.toBeNull();
    expect(parseState(JSON.stringify({ schemaVersion: 99 })).status).toBe('unsupported');
    expect(parseState(JSON.stringify({ schemaVersion: 99 })).state).toBeNull();
  });
  it('既定状態はスキーマ2', () => { expect(defaultState().schemaVersion).toBe(2); });
});

describe('update manifest', () => {
  it('形式検証', () => {
    expect(isValidManifest({ contentVersion: '1', publishedAt: '2026-11-02', syllabusVersion: 'G' })).toBe(true);
    expect(isValidManifest({ contentVersion: 1 })).toBe(false);
    expect(isValidManifest(null)).toBe(false);
  });
});

describe('dates', () => {
  it('addDays', () => { expect(addDays('2026-01-31', 1)).toBe('2026-02-01'); });
});

describe('exam time', () => {
  it('一時停止時間は残り時間から差し引かれない', async () => {
    const { remainingSec, effectiveElapsedSec } = await import('../../src/lib/exam');
    const base = {
      id: 'e1', kind: 'short' as const, mode: 'g' as const, startedAt: '2026-11-02T00:00:00.000Z', limitSec: 900,
      questionIds: [], answers: {}, flags: [], current: 0, status: 'in-progress' as const, strict: false,
      pauses: [{ at: '2026-11-02T00:01:00.000Z', resumedAt: '2026-11-02T00:03:00.000Z' }],
    };
    const now = new Date('2026-11-02T00:05:00.000Z').getTime();
    expect(effectiveElapsedSec(base, now)).toBe(180);
    expect(remainingSec(base, now)).toBe(720);
  });
  it('停止中は時間が進まない', async () => {
    const { remainingSec } = await import('../../src/lib/exam');
    const base = {
      id: 'e1', kind: 'short' as const, mode: 'g' as const, startedAt: '2026-11-02T00:00:00.000Z', limitSec: 900,
      questionIds: [], answers: {}, flags: [], current: 0, status: 'in-progress' as const, strict: false,
      pauses: [{ at: '2026-11-02T00:01:00.000Z' }],
    };
    expect(remainingSec(base, new Date('2026-11-02T01:00:00.000Z').getTime())).toBe(840);
  });
});

describe('checkUpdate', () => {
  it('取得失敗・形式不正では failed を返し例外を投げない', async () => {
    const { checkUpdate } = await import('../../src/lib/update');
    const ng = (async () => { throw new Error('net'); }) as unknown as typeof fetch;
    expect((await checkUpdate('2026.11.0', ng)).status).toBe('failed');
    const bad = (async () => ({ ok: true, json: async () => ({ x: 1 }) })) as unknown as typeof fetch;
    expect((await checkUpdate('2026.11.0', bad)).status).toBe('failed');
    const same = (async () => ({ ok: true, json: async () => ({ contentVersion: '2026.11.0', publishedAt: '2026-11-02', syllabusVersion: 'G' }) })) as unknown as typeof fetch;
    expect((await checkUpdate('2026.11.0', same)).status).toBe('up-to-date');
    const newer = (async () => ({ ok: true, json: async () => ({ contentVersion: '2026.12.0', publishedAt: '2026-12-01', syllabusVersion: 'G' }) })) as unknown as typeof fetch;
    expect((await checkUpdate('2026.11.0', newer)).status).toBe('available');
  });
});
