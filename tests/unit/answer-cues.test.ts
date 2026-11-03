import { describe, it, expect } from 'vitest';
import { publishedQuestions } from '../../src/data/questions';

// 二重監査（Claude Code側, 2026-11-03）: 正答の手がかり（作問上の偏り）の検出。
// 4択で「最も長い選択肢を選ぶ」だけの戦略の得点は、偏りがなければ偶然（約25%）前後になるはず。
// 監査時点では 300/315問（G 285・教養 15）が「正答＝唯一最長の選択肢」で、知識なしで95%前後の得点が取れる状態だった。
// 詳細と問題別一覧: docs/AUDIT_DUAL_CLAUDE_CODE.md, docs/AUDIT_ANSWER_CUES.md
export function longestChoiceScore(qs = publishedQuestions): number {
  const singles = qs.filter((q) => q.type === 'single');
  const hit = singles.filter((q) => {
    const lens = q.choices.map((c) => [...c].length);
    const max = Math.max(...lens);
    return lens[q.answer[0]] === max && lens.filter((x) => x === max).length === 1;
  }).length;
  return hit / singles.length;
}

describe('正答の手がかり（既知の欠陥）', () => {
  // it.fails: 欠陥が残っている間は「通過」と表示される。問題の書き換えで 40% 未満になったらこのテストが赤くなるので、
  // その時点で it.fails を it に変えて恒常的な回帰テストにすること。
  it.fails('「最長の選択肢＝正答」戦略の得点が40%未満である', () => {
    expect(longestChoiceScore()).toBeLessThan(0.4);
  });
});
