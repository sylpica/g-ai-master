import { describe, it, expect } from 'vitest';
import { publishedQuestions } from '../../src/data/questions';
import type { Question } from '../../src/types';

// 二重監査（Claude Code側, 2026-11-03）: 正答の手がかり（作問上の偏り）の検出。
// 監査開始時点では 300/315問が「正答＝唯一最長の選択肢」で、最長の選択肢を選ぶだけで約95%正答できた。
// 誤答選択肢を全問書き換えた後の回帰テスト。詳細: docs/AUDIT_DUAL_CLAUDE_CODE.md, docs/AUDIT_ANSWER_CUES.md
const len = (s: string) => [...s].length;
const singles = (qs: Question[]) => qs.filter((q) => q.type === 'single');

/** 「最も長い選択肢を選ぶ」戦略の得点（同じ長さなら先頭を選ぶ） */
export function longestChoiceScore(qs = publishedQuestions): number {
  const s = singles(qs);
  return s.filter((q) => { const l = q.choices.map(len); return l.indexOf(Math.max(...l)) === q.answer[0]; }).length / s.length;
}
/** 「最も短い選択肢を選ぶ」戦略の得点（書き換えで逆向きの手がかりを作っていないかの確認） */
export function shortestChoiceScore(qs = publishedQuestions): number {
  const s = singles(qs);
  return s.filter((q) => { const l = q.choices.map(len); return l.indexOf(Math.min(...l)) === q.answer[0]; }).length / s.length;
}
// 「絶対値」「できるだけ」「どれだけ」「1つだけ」などの非断定の用法は除外する
const ABSOLUTE = /(?<!でき|どれ|1つ|これ|それ)(必ず|常に|のみ|一切|全く|決して|だけ)|(?<![「」])すべて(?!の」)/;
export function absoluteWordRates(qs = publishedQuestions): { correct: number; wrong: number } {
  let c = 0; let w = 0; let nw = 0; const s = singles(qs);
  for (const q of s) q.choices.forEach((x, i) => { if (i === q.answer[0]) { if (ABSOLUTE.test(x)) c++; } else { nw++; if (ABSOLUTE.test(x)) w++; } });
  return { correct: c / s.length, wrong: w / nw };
}

describe('正答の手がかり（作問上の偏り）', () => {
  it('「最長の選択肢＝正答」戦略の得点が偶然の水準（約25%）を大きく超えない', () => {
    expect(longestChoiceScore()).toBeLessThan(0.3);
  });
  it('「最短の選択肢＝正答」戦略の得点も偶然の水準を大きく超えない', () => {
    expect(shortestChoiceScore()).toBeLessThan(0.3);
  });
  it('どの章でも「最長＝正答」戦略が4割に届かない', () => {
    const chapters = [...new Set(publishedQuestions.filter((q) => q.mode === 'g').map((q) => q.syllabusId))];
    for (const ch of chapters) expect(longestChoiceScore(publishedQuestions.filter((q) => q.syllabusId === ch)), ch).toBeLessThan(0.4);
  });
  it('断定語（必ず・常に・のみ等）が誤答側に偏りすぎていない', () => {
    const r = absoluteWordRates();
    expect(r.wrong - r.correct).toBeLessThan(0.15);
  });
});
