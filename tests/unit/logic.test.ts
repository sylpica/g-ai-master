import { describe, it, expect } from 'vitest';
import { judge, addDays } from '../../src/lib/scoring';
import { nextReview, dueCards, REVIEW_PARAMS } from '../../src/lib/review';
import { fieldStats, readiness } from '../../src/lib/analysis';
import { parseState, defaultState } from '../../src/lib/storage';
import { isValidManifest } from '../../src/lib/update';
import { publishedQuestions } from '../../src/data/questions';
import { publishedLessons } from '../../src/data/lessons';

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
    ], publishedLessons.filter((l) => l.mode === 'g').map((l) => l.id), publishedLessons.filter((l) => l.mode === 'g').length);
    expect(r.reached95).toBe(false);
    expect(r.note).toContain('保証');
  });
});

describe('storage', () => {
  it('壊れたデータでは既定状態を返す（例外を投げない）', () => {
    expect(parseState('{broken').answers).toEqual([]);
    expect(parseState(null).schemaVersion).toBe(1);
    expect(parseState(JSON.stringify({ schemaVersion: 99 })).schemaVersion).toBe(1);
  });
  it('既定状態はスキーマ1', () => { expect(defaultState().schemaVersion).toBe(1); });
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
