import { describe, expect, it } from 'vitest';
import { cardForLabel, splitTermSegments } from '../../src/lib/terms';
import { defaultState, parseState } from '../../src/lib/storage';
import { publishedFlashcards } from '../../src/data/flashcards';

describe('用語タップの分割（splitTermSegments）', () => {
  it('専門用語を最長一致でリンク化し、部分一致で分割しない', () => {
    // 「埋め込み」（パスポート）より長い「埋め込み表現」（教養）が優先される
    const segs = splitTermSegments('埋め込み表現は単語をベクトルに変換する。強化学習は試行錯誤で学ぶ。', 'g');
    const linked = segs.filter((s) => s.card);
    expect(linked.map((s) => s.text)).toEqual(['埋め込み表現', '強化学習']);
    // リンク化されなかった部分も含め、連結すると元の文に戻る
    expect(segs.map((s) => s.text).join('')).toBe('埋め込み表現は単語をベクトルに変換する。強化学習は試行錯誤で学ぶ。');
  });

  it('同じ表記は1つの断片の中で最初の出現だけをリンク化する', () => {
    const segs = splitTermSegments('強化学習と強化学習の応用', 'g');
    expect(segs.filter((s) => s.card)).toHaveLength(1);
    expect(segs.map((s) => s.text).join('')).toBe('強化学習と強化学習の応用');
  });

  it('英数字の単語の途中では一致させない', () => {
    const segs = splitTermSegments('PRAGMATICな姿勢とRAGの活用', 'passport');
    const linked = segs.filter((s) => s.card).map((s) => s.text);
    expect(linked).toEqual(['RAG']);
  });

  it('用語本体として一致するカードを、別名として一致するカードより優先する', () => {
    // 「壁打ち」は card-p05-06（ブレインストーミング）の別名でもあるが、専用カード card-p05-52 を出す
    expect(cardForLabel('壁打ち', 'passport')?.id).toBe('card-p05-52');
    expect(cardForLabel('壁打ち')?.id).toBe('card-p05-52');
  });

  it('同じ表記が複数モードにある場合は prefer のモードのカードを優先する', () => {
    expect(cardForLabel('ファインチューニング', 'passport')?.mode).toBe('passport');
    expect(cardForLabel('ファインチューニング', 'g')?.mode).toBe('g');
    const segs = splitTermSegments('ファインチューニングを行う', 'passport');
    expect(segs.find((s) => s.card)?.card?.mode).toBe('passport');
  });

  it('用語が含まれない文はそのまま返す', () => {
    const segs = splitTermSegments('今日は良い天気です。');
    expect(segs).toEqual([{ text: '今日は良い天気です。' }]);
  });

  it('リンク先はすべて実在する単語カードである', () => {
    const ids = new Set(publishedFlashcards.map((c) => c.id));
    const segs = splitTermSegments('強化学習と転移学習、拡散モデルとTransformerを学ぶ。', 'g');
    for (const s of segs) if (s.card) expect(ids.has(s.card.id)).toBe(true);
    expect(segs.filter((s) => s.card).length).toBeGreaterThanOrEqual(4);
  });
});

describe('全統合モードの保存互換', () => {
  it('mode と startMode に all を保存・復元できる', () => {
    const state = defaultState();
    state.mode = 'all';
    state.settings.startMode = 'all';
    const restored = parseState(JSON.stringify(state)).state!;
    expect(restored.mode).toBe('all');
    expect(restored.settings.startMode).toBe('all');
  });

  it('未知のモード値は既定値に落ちる', () => {
    const state = defaultState();
    const raw = JSON.parse(JSON.stringify(state));
    raw.mode = 'unknown-mode';
    raw.settings.startMode = 'unknown-mode';
    const restored = parseState(JSON.stringify(raw)).state!;
    expect(restored.mode).toBe('g');
    expect(restored.settings.startMode).toBe('g');
  });
});
