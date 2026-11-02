import { describe, it, expect } from 'vitest';
import { QUESTIONS, publishedQuestions } from '../../src/data/questions';
import { LESSONS, publishedLessons } from '../../src/data/lessons';
import { EXERCISES } from '../../src/data/exercises';
import { ALL_SYLLABUS, syllabusById } from '../../src/data/syllabus';

const norm = (s: string) => s.replace(/\s+/g, '').replace(/[。、，,．.「」『』（）()]/g, '').toLowerCase();

describe('教材データの完全性', () => {
  it('問題IDが一意', () => {
    expect(new Set(QUESTIONS.map((x) => x.id)).size).toBe(QUESTIONS.length);
  });
  it('全問題が必須項目を満たす', () => {
    for (const q of publishedQuestions) {
      expect(q.choices.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.answer.length, q.id).toBeGreaterThanOrEqual(1);
      for (const a of q.answer) expect(a, q.id).toBeLessThan(q.choices.length);
      expect(q.choiceReasons.length, q.id).toBe(q.choices.length);
      expect(q.basic.length, q.id).toBeGreaterThan(10);
      expect(q.detail.length, q.id).toBeGreaterThan(10);
      expect(q.sources.length, q.id).toBeGreaterThanOrEqual(1);
      for (const s of q.sources) expect(s.url, q.id).toMatch(/^https:\/\//);
      expect(syllabusById(q.syllabusId), q.id).toBeDefined();
      expect(syllabusById(q.syllabusId)?.mode, q.id).toBe(q.mode);
      if (q.type === 'single' || q.type === 'truefalse') expect(q.answer.length, q.id).toBe(1);
    }
  });
  it('問題文の完全重複がない', () => {
    const seen = new Map<string, string>();
    for (const q of QUESTIONS) {
      const k = norm(q.stem);
      expect(seen.has(k), `stem duplicate: ${q.id} vs ${seen.get(k)}`).toBe(false);
      seen.set(k, q.id);
    }
  });
  it('選択肢の並び替えだけの重複（同一選択肢集合＋同一問題文の正規化一致）がない', () => {
    const seen = new Map<string, string>();
    for (const q of QUESTIONS) {
      const k = `${norm(q.stem)}|${[...q.choices].map(norm).sort().join('|')}`;
      expect(seen.has(k), `choice-set duplicate: ${q.id}`).toBe(false);
      seen.set(k, q.id);
    }
  });
  it('各Gシラバス章に教材と問題がある（網羅の最低条件）', () => {
    for (const node of ALL_SYLLABUS.filter((s) => s.mode === 'g')) {
      expect(publishedLessons.some((l) => l.syllabusId === node.id), `lesson missing: ${node.id}`).toBe(true);
      expect(publishedQuestions.some((x) => x.syllabusId === node.id), `question missing: ${node.id}`).toBe(true);
    }
  });
  it('各教養分野に教材と問題または演習がある', () => {
    for (const node of ALL_SYLLABUS.filter((s) => s.mode === 'literacy')) {
      const has = publishedLessons.some((l) => l.syllabusId === node.id)
        && (publishedQuestions.some((x) => x.syllabusId === node.id) || EXERCISES.some((e) => e.syllabusId === node.id));
      expect(has, `literacy coverage missing: ${node.id}`).toBe(true);
    }
  });
  it('教材の必須項目と出典', () => {
    for (const l of publishedLessons) {
      expect(l.basic.length, l.id).toBeGreaterThanOrEqual(1);
      expect(l.detail.length, l.id).toBeGreaterThanOrEqual(1);
      expect(l.keyPoints.length, l.id).toBeGreaterThanOrEqual(1);
      expect(l.sources.length, l.id).toBeGreaterThanOrEqual(1);
      expect(syllabusById(l.syllabusId)?.mode, l.id).toBe(l.mode);
    }
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });
  it('演習にルーブリックと失敗例・改善例がある（自己評価と自動評価を混同しない）', () => {
    for (const e of EXERCISES) {
      expect(e.sources.length, e.id).toBeGreaterThanOrEqual(1);
      for (const s of e.sources) expect(s.url, e.id).toMatch(/^https:\/\//);
      expect(e.rubric.length, e.id).toBeGreaterThanOrEqual(3);
      expect(e.failureExample.length, e.id).toBeGreaterThan(5);
      expect(e.improvementExample.length, e.id).toBeGreaterThan(5);
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(3);
    }
  });
  it('正答位置が極端に偏っていない（作問位置の偏りの検出）', () => {
    const singles = publishedQuestions.filter((x) => x.type === 'single');
    for (let pos = 0; pos < 4; pos++) {
      const n = singles.filter((x) => x.answer[0] === pos).length;
      expect(n / singles.length, `position ${pos} share`).toBeLessThan(0.45);
      expect(n, `position ${pos} count`).toBeGreaterThan(0);
    }
  });
});

describe('出典の裏付け（二重監査）', () => {
  it('公開問題は原則2件以上の出典を持つ（一次情報が単独で存在しない標準フロー問題3件のみ例外として明示）', () => {
    const EXCEPTIONS = ['q-g06-11', 'q-g06-20', 'q-g06-21']; // 音声処理フロー: JDLAシラバス＋内容監査で照合済み。docs/AUDIT_DUAL_MUSE.md に記録
    for (const q of QUESTIONS.filter((x) => x.status === 'published')) {
      if (EXCEPTIONS.includes(q.id)) { expect(q.sources.length).toBeGreaterThanOrEqual(1); continue; }
      expect(q.sources.length, q.id).toBeGreaterThanOrEqual(2);
    }
  });
  it('失効した内閣府PDF（aistrategy2019.pdf）を出典に含まない', () => {
    for (const q of QUESTIONS) for (const s of q.sources) expect(s.url).not.toContain('aistrategy2019');
    for (const l of LESSONS) for (const s of l.sources) expect(s.url).not.toContain('aistrategy2019');
  });
  it('全教材が2件以上の出典を持つ', () => {
    for (const l of LESSONS.filter((x) => x.status === 'published')) expect(l.sources.length, l.id).toBeGreaterThanOrEqual(2);
  });
});

describe('ニュースデータ', () => {
  it('必須項目・日付形式・https出典・ID一意・新しい順', async () => {
    const { NEWS_ITEMS } = await import('../../src/data/news');
    expect(NEWS_ITEMS.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const n of NEWS_ITEMS) {
      expect(n.title.length).toBeGreaterThan(0);
      expect(n.summary.length).toBeGreaterThan(20);
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(n.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(n.source.url).toMatch(/^https:\/\//);
      expect(ids.has(n.id)).toBe(false); ids.add(n.id);
    }
    const dates = NEWS_ITEMS.map((n) => n.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
