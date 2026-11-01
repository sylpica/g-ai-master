/** 正誤判定。複数選択は集合の完全一致でのみ正答とする。 */
export function judge(selected: number[], answer: number[]): boolean {
  if (selected.length !== answer.length) return false;
  const s = [...selected].sort((a, b) => a - b);
  const a = [...answer].sort((x, y) => x - y);
  return s.every((v, i) => v === a[i]);
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayStr(d);
}
