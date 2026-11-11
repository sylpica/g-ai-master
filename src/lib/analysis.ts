import type { AnswerRecord, ExamSession, Question } from '../types';
import { judge } from './scoring';

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

export interface ExamSessionStat {
  id: string;
  kind: ExamSession['kind'];
  submittedAt?: string;
  total: number;
  correct: number;
  accuracy: number | null;
  strict: boolean;
}

/** 模試は「回答件数」ではなく提出済みセッション単位で集計する（旧実装は回答レコード数で数えていた） */
export function examSessionStats(exams: ExamSession[], questions: Question[]): ExamSessionStat[] {
  const qmap = new Map(questions.map((q) => [q.id, q]));
  return exams.filter((e) => e.status === 'submitted').map((e) => {
    let total = 0; let correct = 0;
    for (const qid of e.questionIds) {
      const q = qmap.get(qid);
      if (!q) continue;
      total += 1;
      if (judge(e.answers[qid] ?? [], q.answer)) correct += 1;
    }
    return { id: e.id, kind: e.kind, submittedAt: e.submittedAt, total, correct, accuracy: total ? correct / total : null, strict: e.strict };
  });
}

export interface Readiness {
  firstSeenAccuracy: number | null;
  overallAccuracy: number | null;
  retryAccuracy: number | null;
  examAccuracy: number | null;
  /** 提出済み模試セッション数（回答件数ではない） */
  examSessions: number;
  /** 初見で回答したユニーク問題数 */
  firstSeenUnique: number;
  /** 到達条件として適用された初見ユニーク問題数の下限（モードの問題総数で調整される） */
  minFirstSeenUnique: number;
  /** 初見回答のある章の割合 */
  chapterCoverage: number;
  /** 教材の学習済み割合（知識理解の証明としては扱わない・参考表示用） */
  coverage: number;
  totalAnswers: number;
  reached: boolean;
  /** 到達に不足している条件（透明性のため列挙する） */
  unmet: string[];
  note: string;
}

/**
 * 到達基準の複合条件（2026-11-11 再定義）:
 * 1. 初見ユニーク問題が下限以上（母数の不足した初見率は判定に使わない）
 * 2. 初見正答率が95%以上
 * 3. 初見回答が全章の80%以上に行き渡っている（易しい章だけの偏りを防ぐ）
 * 4. 提出済み模試が3回以上あり、模試全体の正答率が95%以上
 * ラインは95%を維持する（ユーザーの指示）。到達可能性は、教材で学んだ内容から
 * 公正に解ける高品質な問題を十分な数そろえることで担保する（監査で盲検再解答を行う）。
 * 模試1回・初見1問・易しい章だけでは到達しない構造も維持する。
 * 教材の学習済みチェックは条件に含めない（理解の証明ではないため）。
 */
export const READINESS_RULES = { minFirstSeenUnique: 150, minChapterCoverage: 0.8, minExamSessions: 3, target: 0.95 };

export function readiness(answers: AnswerRecord[], lessonsDone: string[], lessonsTotal: number, exams: ExamSession[] = [], questions: Question[] = [], totalChapters = 0, minFirstSeenUnique: number = READINESS_RULES.minFirstSeenUnique): Readiness {
  const acc = (xs: AnswerRecord[]) => (xs.length ? xs.filter((a) => a.correct).length / xs.length : null);
  const fs = answers.filter((a) => a.firstSeen);
  const retries = answers.filter((a) => !a.firstSeen);
  const examAnswers = answers.filter((a) => a.context === 'exam');
  const firstSeenAccuracy = acc(fs);
  const overallAccuracy = acc(answers);
  const retryAccuracy = acc(retries);
  const examAccuracy = acc(examAnswers);
  const sessions = examSessionStats(exams, questions);
  const firstSeenUnique = new Set(fs.map((a) => a.questionId)).size;
  const qmap = new Map(questions.map((q) => [q.id, q]));
  const fsChapters = new Set(fs.map((a) => qmap.get(a.questionId)?.syllabusId).filter(Boolean));
  const chapterCoverage = totalChapters ? fsChapters.size / totalChapters : 0;
  const coverage = lessonsTotal ? lessonsDone.length / lessonsTotal : 0;
  const unmet: string[] = [];
  if (firstSeenUnique < minFirstSeenUnique) unmet.push(`初見問題が${firstSeenUnique}問（${minFirstSeenUnique}問以上が必要）`);
  if ((firstSeenAccuracy ?? 0) < READINESS_RULES.target) unmet.push(`初見正答率が${firstSeenAccuracy === null ? '未計測' : `${Math.round(firstSeenAccuracy * 100)}%`}（${Math.round(READINESS_RULES.target * 100)}%以上が必要）`);
  if (chapterCoverage < READINESS_RULES.minChapterCoverage) unmet.push(`初見回答のある章が${Math.round(chapterCoverage * 100)}%（80%以上が必要）`);
  if (sessions.length < READINESS_RULES.minExamSessions) unmet.push(`提出済み模試が${sessions.length}回（${READINESS_RULES.minExamSessions}回以上が必要）`);
  if ((examAccuracy ?? 0) < READINESS_RULES.target) unmet.push(`模試の正答率が${examAccuracy === null ? '未計測' : `${Math.round(examAccuracy * 100)}%`}（${Math.round(READINESS_RULES.target * 100)}%以上が必要）`);
  return {
    firstSeenAccuracy, overallAccuracy, retryAccuracy, examAccuracy,
    examSessions: sessions.length, firstSeenUnique, minFirstSeenUnique, chapterCoverage, coverage,
    totalAnswers: answers.length,
    reached: unmet.length === 0,
    unmet,
    note: '到達度は教育上の参考指標です。公式試験の合否や得点を保証・換算するものではありません（公式の合格点・得点算出方法は公開されていません）。',
  };
}
