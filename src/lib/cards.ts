import type { CardGrade, CardReview } from '../types';
import { addDays, todayStr } from './scoring';

/**
 * 単語帳カードの間隔反復（問題の採点履歴とは分離した自己評価ベース）。
 * - 覚えた: 間隔は 1日 → 3日 → 以後は ease 倍に拡大
 * - あいまい: 間隔は据え置き〜微増（最大で前回の1.2倍）、ease を少し下げる
 * - 覚えていない: lapse を加算し翌日に再出題、ease を下げる
 */
export const CARD_PARAMS = { initialEase: 2.5, minEase: 1.3, maxEase: 3.0, firstInterval: 1, secondInterval: 3 };

export function nextCardReview(prev: CardReview | undefined, cardId: string, grade: CardGrade, today = todayStr()): CardReview {
  const base: CardReview = prev ?? { cardId, ease: CARD_PARAMS.initialEase, intervalDays: 0, due: today, reps: 0, lapses: 0 };
  const at = new Date().toISOString();
  if (grade === 'unknown') {
    return { ...base, ease: Math.max(CARD_PARAMS.minEase, base.ease - 0.2), intervalDays: 1, due: addDays(today, 1), lapses: base.lapses + 1, lastGrade: grade, lastAt: at };
  }
  if (grade === 'fuzzy') {
    const interval = Math.max(1, Math.round(base.intervalDays * 1.2) || 1);
    return { ...base, ease: Math.max(CARD_PARAMS.minEase, base.ease - 0.05), intervalDays: interval, due: addDays(today, interval), lastGrade: grade, lastAt: at };
  }
  const reps = base.reps + 1;
  const interval = reps === 1 ? CARD_PARAMS.firstInterval : reps === 2 ? CARD_PARAMS.secondInterval : Math.max(1, Math.round(base.intervalDays * base.ease));
  return { ...base, ease: Math.min(CARD_PARAMS.maxEase, base.ease + 0.05), intervalDays: interval, due: addDays(today, interval), reps, lastGrade: grade, lastAt: at };
}

export function dueFlashcards(review: Record<string, CardReview>, today = todayStr()): CardReview[] {
  return Object.values(review).filter((c) => c.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}

/** 苦手カード＝直近の自己評価が「あいまい／覚えていない」か、lapse が複数回あるもの */
export function weakCardIds(review: Record<string, CardReview>): Set<string> {
  return new Set(Object.values(review).filter((c) => c.lastGrade === 'unknown' || c.lastGrade === 'fuzzy' || c.lapses >= 2).map((c) => c.cardId));
}

export interface CardStats { total: number; studied: number; known: number; fuzzy: number; unknown: number; due: number; }

export function cardStats(review: Record<string, CardReview>, totalCards: number, today = todayStr()): CardStats {
  const vs = Object.values(review);
  return {
    total: totalCards,
    studied: vs.length,
    known: vs.filter((c) => c.lastGrade === 'known').length,
    fuzzy: vs.filter((c) => c.lastGrade === 'fuzzy').length,
    unknown: vs.filter((c) => c.lastGrade === 'unknown').length,
    due: vs.filter((c) => c.due <= today).length,
  };
}
