import type { ExamSession } from '../types';

/** 一時停止時間を除いた実経過秒数 */
export function effectiveElapsedSec(exam: ExamSession, nowMs: number): number {
  const started = new Date(exam.startedAt).getTime();
  const paused = exam.pauses.reduce((acc, p) => {
    const from = new Date(p.at).getTime();
    const to = p.resumedAt ? new Date(p.resumedAt).getTime() : nowMs;
    return acc + Math.max(0, (to - from) / 1000);
  }, 0);
  return Math.max(0, (nowMs - started) / 1000 - paused);
}

export function remainingSec(exam: ExamSession, nowMs: number): number {
  return Math.max(0, Math.floor(exam.limitSec - effectiveElapsedSec(exam, nowMs)));
}

export function isPaused(exam: ExamSession): boolean {
  return exam.pauses.some((p) => !p.resumedAt);
}
