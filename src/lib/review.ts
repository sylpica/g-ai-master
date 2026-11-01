import type { ReviewCard } from '../types';
import { addDays, todayStr } from './scoring';

/**
 * 間隔反復（SM-2系の簡略版）。
 * - 正答: 間隔は 1日 → 3日 → 以後は ease（初期2.5、下限1.3）倍に拡大
 * - 誤答: lapseを加算し、翌日に再出題。easeを0.2下げる
 * 「最適」「科学的に保証された効率」とは表現しない。パラメータは本ファイルに明示する。
 */
export const REVIEW_PARAMS = { initialEase: 2.5, minEase: 1.3, easeDeltaWrong: -0.2, easeDeltaEasy: 0.05, firstInterval: 1, secondInterval: 3 };

export function nextReview(prev: ReviewCard | undefined, questionId: string, correct: boolean, today = todayStr()): ReviewCard {
  const base: ReviewCard = prev ?? { questionId, ease: REVIEW_PARAMS.initialEase, intervalDays: 0, due: today, reps: 0, lapses: 0 };
  if (!correct) {
    return {
      ...base,
      ease: Math.max(REVIEW_PARAMS.minEase, base.ease + REVIEW_PARAMS.easeDeltaWrong),
      intervalDays: 1,
      due: addDays(today, 1),
      lapses: base.lapses + 1,
    };
  }
  const reps = base.reps + 1;
  const interval = reps === 1 ? REVIEW_PARAMS.firstInterval : reps === 2 ? REVIEW_PARAMS.secondInterval : Math.max(1, Math.round(base.intervalDays * base.ease));
  return {
    ...base,
    ease: Math.min(3.0, base.ease + REVIEW_PARAMS.easeDeltaEasy),
    intervalDays: interval,
    due: addDays(today, interval),
    reps,
  };
}

export function dueCards(review: Record<string, ReviewCard>, today = todayStr()): ReviewCard[] {
  return Object.values(review).filter((c) => c.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}
