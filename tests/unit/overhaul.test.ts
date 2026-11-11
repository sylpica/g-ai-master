import { describe, it, expect } from 'vitest';
import { parseState, salvageState, validateImport, defaultState, exportState } from '../../src/lib/storage';
import { mulberry32, shuffled, permutation } from '../../src/lib/random';
import { nextCardReview, dueFlashcards, weakCardIds, CARD_PARAMS } from '../../src/lib/cards';
import { readiness, examSessionStats } from '../../src/lib/analysis';
import { FLASHCARDS } from '../../src/data/flashcards';
import { publishedQuestions } from '../../src/data/questions';
import { publishedLessons } from '../../src/data/lessons';
import { G_SYLLABUS, LITERACY_SYLLABUS, PASSPORT_SYLLABUS } from '../../src/data/syllabus';
import fixtureV1 from '../fixtures/state-v1.json';
import type { AnswerRecord, ExamSession } from '../../src/types';

// 2026-11-11 全面再設計（単語帳新設・データ保護・到達判定再定義）の回帰テスト

describe('スキーマ移行 v1→v2（無損失）', () => {
  const raw = JSON.stringify(fixtureV1);
  it('v1フィクスチャが migrated になり、全レコードが保持される', () => {
    const r = parseState(raw);
    expect(r.status).toBe('migrated');
    const s = r.state!;
    expect(s.schemaVersion).toBe(2);
    expect(s.answers).toHaveLength(2);
    expect(s.exams).toHaveLength(1);
    expect(s.bookmarks).toEqual(['lesson:les-g01', 'q:q-g03-2']);
    expect(s.review['q-g03-2'].lapses).toBe(1);
    expect(s.lessonsDone).toEqual(['les-g01']);
    expect(s.settings.theme).toBe('dark');
    expect(s.dailyGoalMin).toBe(30);
    expect(s.cardReview).toEqual({});
    expect(s.cardDirection).toBe('term-first');
    expect(s.practicePrefs).toEqual({ shuffleQuestions: true, shuffleChoices: true });
  });
  it('移行後の状態は export→parse で往復しても同一', () => {
    const s = parseState(raw).state!;
    const again = parseState(exportState(s));
    expect(again.status).toBe('ok');
    expect(again.state).toEqual(s);
  });
});

describe('インポートの厳格検証（P0-1回帰）', () => {
  const validIds = { questions: new Set(publishedQuestions.map((q) => q.id)), cards: new Set(FLASHCARDS.map((c) => c.id)) };
  it('answers が文字列の壊れたJSONは拒否し、現在の記録を守る', () => {
    const r = validateImport('{"schemaVersion":1,"answers":"broken","settings":{}}', validIds);
    expect(r.ok).toBe(false);
    expect(r.state).toBeUndefined();
    expect(r.errors.length).toBeGreaterThan(0);
  });
  it('JSONとして読めない入力は拒否する', () => {
    expect(validateImport('{broken', validIds).ok).toBe(false);
    expect(validateImport('[]', validIds).ok).toBe(false);
    expect(validateImport('"text"', validIds).ok).toBe(false);
  });
  it('実在しない問題IDを含む記録は拒否する', () => {
    const bad = JSON.stringify({ schemaVersion: 2, answers: [{ questionId: 'q-nope-999', selected: [0], correct: true, at: '2026-11-01T00:00:00.000Z', seconds: 5, firstSeen: true, context: 'practice' }] });
    expect(validateImport(bad, validIds).ok).toBe(false);
  });
  it('正常なv1バックアップは移行して取り込める', () => {
    const raw = JSON.stringify(fixtureV1);
    const r = validateImport(raw, validIds);
    expect(r.ok).toBe(true);
    expect(r.state!.schemaVersion).toBe(2);
    expect(r.summary!.answers).toBe(2);
  });
  it('未知のスキーマ版は拒否する', () => {
    expect(validateImport(JSON.stringify({ schemaVersion: 99, answers: [] }), validIds).ok).toBe(false);
  });
});

describe('シャッフルの品質（P0-4回帰）', () => {
  it('permutation は常に全順列（重複・欠落なし）', () => {
    for (let n = 0; n <= 12; n++) {
      for (let seed = 1; seed <= 200; seed++) {
        const p = permutation(n, mulberry32(seed));
        expect([...p].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
      }
    }
  });
  it('先頭位置の分布に大きな偏りがない（300要素×10000シード）', () => {
    const counts = new Array(300).fill(0);
    for (let seed = 1; seed <= 10000; seed++) {
      const first = shuffled(Array.from({ length: 300 }, (_, i) => i), mulberry32(seed))[0];
      counts[first]++;
    }
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    // 期待平均33.3回。旧LCG実装では最小0回・最大762回だった
    expect(min).toBeGreaterThan(10);
    expect(max).toBeLessThan(70);
  });
  it('同じシードでは同じ結果（決定的）', () => {
    expect(shuffled([1, 2, 3, 4, 5], mulberry32(42))).toEqual(shuffled([1, 2, 3, 4, 5], mulberry32(42)));
  });
});

describe('単語帳の間隔反復', () => {
  it('覚えた→1日後、次は3日後、その後はease倍で伸びる', () => {
    const c1 = nextCardReview(undefined, 'card-g01-01', 'known', '2026-11-11');
    expect(c1.intervalDays).toBe(CARD_PARAMS.firstInterval);
    expect(c1.due).toBe('2026-11-12');
    const c2 = nextCardReview(c1, 'card-g01-01', 'known', '2026-11-12');
    expect(c2.intervalDays).toBe(CARD_PARAMS.secondInterval);
    const c3 = nextCardReview(c2, 'card-g01-01', 'known', '2026-11-15');
    expect(c3.intervalDays).toBeGreaterThan(CARD_PARAMS.secondInterval);
  });
  it('覚えていない→翌日・ease低下・lapse加算', () => {
    const c = nextCardReview(undefined, 'card-g01-01', 'unknown', '2026-11-11');
    expect(c.due).toBe('2026-11-12');
    expect(c.lapses).toBe(1);
    expect(c.ease).toBeLessThan(CARD_PARAMS.initialEase);
    expect(c.lastGrade).toBe('unknown');
  });
  it('期限到来と苦手カードの抽出', () => {
    const a = nextCardReview(undefined, 'card-g01-01', 'known', '2026-11-10');
    const b = nextCardReview(undefined, 'card-g01-02', 'unknown', '2026-11-10');
    const review = { 'card-g01-01': a, 'card-g01-02': b };
    expect(dueFlashcards(review, '2026-11-11').map((x) => x.cardId).sort()).toEqual(['card-g01-01', 'card-g01-02']);
    expect([...weakCardIds(review)]).toEqual(['card-g01-02']);
  });
});

describe('単語帳データの整合性', () => {
  it('IDは一意で、参照先（問題・教材・章）がすべて実在する', () => {
    const ids = FLASHCARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const qids = new Set(publishedQuestions.map((q) => q.id));
    const lids = new Set(publishedLessons.map((l) => l.id));
    const chapters = new Set([...G_SYLLABUS, ...LITERACY_SYLLABUS, ...PASSPORT_SYLLABUS].map((s) => s.id));
    for (const c of FLASHCARDS) {
      expect(lids.has(c.lessonId ?? ''), c.id).toBe(true);
      expect(chapters.has(c.syllabusId), c.id).toBe(true);
      for (const q of c.questionIds) expect(qids.has(q), `${c.id}→${q}`).toBe(true);
      expect(c.definition.length).toBeGreaterThan(0);
      expect((c.reversePrompt ?? '').length).toBeGreaterThan(0);
      expect(c.verifiedAt).toBe('2026-11-11');
    }
  });
  it('裏面スタート用の reversePrompt に用語・略称が漏れていない', () => {
    for (const c of FLASHCARDS) {
      const rp = (c.reversePrompt ?? '').toLowerCase();
      expect(rp.includes(c.term.toLowerCase()), `${c.id}: ${c.term}`).toBe(false);
      for (const a of c.aliases ?? []) expect(rp.includes(a.toLowerCase()), `${c.id}: ${a}`).toBe(false);
    }
  });
  it('全モードの全章にカードがある', () => {
    for (const s of [...G_SYLLABUS, ...LITERACY_SYLLABUS, ...PASSPORT_SYLLABUS]) {
      expect(FLASHCARDS.some((c) => c.syllabusId === s.id), s.id).toBe(true);
    }
  });
});

describe('到達判定の反例（P1-2回帰、95%ライン維持）', () => {
  const gq = publishedQuestions.filter((q) => q.mode === 'g');
  const mkAnswer = (q: (typeof gq)[number], correct = true, context: AnswerRecord['context'] = 'practice'): AnswerRecord => ({
    questionId: q.id, selected: q.answer, correct, at: '2026-11-10T00:00:00.000Z', seconds: 30, firstSeen: true, context,
  });
  const mkExam = (qs: (typeof gq)[number][], id: string): ExamSession => ({
    id, kind: 'full', mode: 'g', startedAt: '2026-11-10T00:00:00.000Z', limitSec: 6000,
    questionIds: qs.map((q) => q.id), answers: Object.fromEntries(qs.map((q) => [q.id, q.answer])),
    flags: [], current: 0, pauses: [], status: 'submitted', submittedAt: '2026-11-10T01:00:00.000Z', strict: true,
  });
  it('初見1問正解だけでは到達しない', () => {
    const r = readiness([mkAnswer(gq[0])], [], 0, [], publishedQuestions, 10);
    expect(r.reached).toBe(false);
    expect(r.unmet.length).toBeGreaterThan(0);
  });
  it('模試1回だけでは到達しない（回答レコード数では数えない）', () => {
    const examQs = gq.slice(0, 30);
    const answers = examQs.map((q) => mkAnswer(q, true, 'exam'));
    const r = readiness(answers, [], 0, [mkExam(examQs, 'e1')], publishedQuestions, 10);
    expect(r.examSessions).toBe(1);
    expect(r.reached).toBe(false);
  });
  it('易しい1章だけの初見では章カバーで弾かれる', () => {
    const oneChapter = gq.filter((q) => q.syllabusId === 'g-01');
    const answers = oneChapter.map((q) => mkAnswer(q));
    const exams = [mkExam(oneChapter.slice(0, 10), 'e1'), mkExam(oneChapter.slice(10, 20), 'e2'), mkExam(oneChapter.slice(20, 30), 'e3')];
    const examAnswers = exams.flatMap((e) => e.questionIds.map((id) => mkAnswer(gq.find((q) => q.id === id)!, true, 'exam')));
    const r = readiness([...answers, ...examAnswers], [], 0, exams, publishedQuestions, 10);
    expect(r.chapterCoverage).toBeLessThan(0.8);
    expect(r.reached).toBe(false);
  });
  it('全条件を満たせば到達する', () => {
    const answers = gq.slice(0, 200).map((q) => mkAnswer(q));
    const exams = [mkExam(gq.slice(0, 30), 'e1'), mkExam(gq.slice(30, 60), 'e2'), mkExam(gq.slice(60, 90), 'e3')];
    const examAnswers = exams.flatMap((e) => e.questionIds.map((id) => mkAnswer(gq.find((q) => q.id === id)!, true, 'exam')));
    const r = readiness([...answers, ...examAnswers], [], 0, exams, publishedQuestions, 10);
    expect(r.firstSeenUnique).toBeGreaterThanOrEqual(150);
    expect(r.chapterCoverage).toBeGreaterThanOrEqual(0.8);
    expect(r.reached).toBe(true);
  });
  it('95%ライン：正答率96%では到達でき、94%では到達しない', () => {
    const build = (practiceCorrect: number, examCorrectPer: number) => {
      const practice = gq.slice(0, 200).map((q, i) => mkAnswer(q, i < practiceCorrect));
      const exams = [mkExam(gq.slice(0, 30), 'e1'), mkExam(gq.slice(30, 60), 'e2'), mkExam(gq.slice(60, 90), 'e3')];
      const examAnswers = exams.flatMap((e) => e.questionIds.map((id, i) => mkAnswer(gq.find((q) => q.id === id)!, i < examCorrectPer, 'exam')));
      return readiness([...practice, ...examAnswers], [], 0, exams, publishedQuestions, 10);
    };
    const ok = build(193, 29); // 初見 (193+87)/290≒96.6%・模試 87/90≒96.7%
    expect(ok.firstSeenUnique).toBeGreaterThanOrEqual(150);
    expect(ok.reached).toBe(true);
    const ng = build(186, 28); // 初見 (186+84)/290≒93.1%・模試 84/90≒93.3%
    expect(ng.reached).toBe(false);
  });
  it('未提出の模試はセッション数に数えない', () => {
    const e = mkExam(gq.slice(0, 10), 'e-open');
    e.status = 'in-progress';
    expect(examSessionStats([e], publishedQuestions)).toHaveLength(0);
  });
});

describe('破損時の保護（P0-2回帰）', () => {
  it('設定だけ壊れた状態は corrupt になり、既定状態で自動上書きされない', () => {
    const broken = JSON.stringify({ schemaVersion: 2, answers: 'broken' });
    const r = parseState(broken);
    expect(r.status).toBe('corrupt');
    expect(r.state).toBeNull();
  });
  it('部分復旧は正常なレコードを残し、壊れた部分だけ既定値にする', () => {
    const s = salvageState(JSON.stringify({ schemaVersion: 2, answers: 'broken', bookmarks: ['q:q-g01-1'] }))!;
    expect(s.answers).toEqual([]);
    expect(s.bookmarks).toEqual(['q:q-g01-1']);
    expect(s.schemaVersion).toBe(2);
  });
  it('既定状態は空の学習記録を持つ', () => {
    const d = defaultState();
    expect(d.answers).toEqual([]);
    expect(d.cardReview).toEqual({});
  });
});
