/**
 * シャッフル用の乱数と Fisher–Yates。
 * 旧実装は線形合同法を浮動小数点で計算しており、積が 2^53 を超えて精度が落ち、先頭要素の分布に著しい偏りがあった
 * （300件×10,000シードの実測で最小0回・最大762回、期待平均33.3回）。ここでは整数演算のみの mulberry32 を使う。
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 暗号学的な強さは不要な用途向けに、時刻と乱数を混ぜたシードを作る */
export function randomSeed(): number {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return (buf[0] ^ Date.now()) >>> 0;
  } catch {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }
}

/** Fisher–Yates シャッフル。元の配列は変更しない。結果は元集合と一致し、重複・欠落はない */
export function shuffled<T>(xs: readonly T[], rng: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 0..n-1 の表示順 permutation。display[i] = original[perm[i]] */
export function permutation(n: number, rng: () => number): number[] {
  return shuffled(Array.from({ length: n }, (_, i) => i), rng);
}
