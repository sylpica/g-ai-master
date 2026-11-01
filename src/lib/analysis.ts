import type { AnswerRecord, Question } from '../types';

export interface FieldStat { syllabusId: string; total: number; correct: number; accuracy: number | null; firstSeenTotal: number; firstSeenAccuracy: number | null; }

export function fieldStats(answers: AnswerRecord[], questions: Question[]): FieldStat[] {
  const qmap = new Map(questions.map((q) => [q.id, q]));
  const by = new Map<string, { total: number; correct: number; fs: number; fsc: number }>();
  for (const a of answers) {
    const q = qmap.get(a.questionId);
    if (!q) continue;
    const cur = by.get(q.syllabusId) ?? { total: 0, correct: 0, fs: 0, fsc: 0 };
    cur.total += 1;
    if (a.correct) cur.correct += 1;
    if (a.firstSeen) { cur.fs += 1; if (a.correct) cur.fsc += 1; }
    by.set(q.syllabusId, cur);
  }
  return [...by.entries()].map(([syllabusId, v]) => ({
    syllabusId,
    total: v.total,
    correct: v.correct,
    accuracy: v.total ? v.correct / v.total : null,
    firstSeenTotal: v.fs,
    firstSeenAccuracy: v.fs ? v.fsc / v.fs : null,
  })).sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1));
}

export interface Readiness {
  firstSeenAccuracy: number | null;
  overallAccuracy: number | null;
  examAccuracy: number | null;
  coverage: number; // 0..1 学習済みシラバス項目の割合
  totalAnswers: number;
  /** 到達判定: 複数指標の組合せ。単一模試の結果だけでは到達としない */
  reached95: boolean;
  note: string;
}

export function readiness(answers: AnswerRecord[], lessonsDone: string[], lessonsTotal: number): Readiness {
  const fs = answers.filter((a) => a.firstSeen);
  const exams = answers.filter((a) => a.context === 'exam');
  const acc = (xs: AnswerRecord[]) => (xs.length ? xs.filter((a) => a.correct).length / xs.length : null);
  const firstSeenAccuracy = acc(fs);
  const overallAccuracy = acc(answers);
  const examAccuracy = acc(exams);
  const coverage = lessonsTotal ? lessonsDone.length / lessonsTotal : 0;
  // 到達条件: 初見正答率95%以上 かつ 模試（複数回・30問以上）95%以上 かつ 網羅率90%以上
  const reached95 = (firstSeenAccuracy ?? 0) >= 0.95 && exams.length >= 30 && (examAccuracy ?? 0) >= 0.95 && coverage >= 0.9;
  return {
    firstSeenAccuracy, overallAccuracy, examAccuracy, coverage,
    totalAnswers: answers.length, reached95,
    note: '到達度は教育上の参考指標です。公式試験の合否や得点を保証・換算するものではありません（公式の合格点・得点算出方法は公開されていません）。',
  };
}
