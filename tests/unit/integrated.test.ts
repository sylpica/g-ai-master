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

  it('excludeId で指定したカード自身はリンク化しない（単語帳の裏面で自分自身へ飛ばない）', () => {
    const self = cardForLabel('強化学習', 'g');
    expect(self).toBeDefined();
    const segs = splitTermSegments('強化学習は試行錯誤で学ぶ。転移学習にも使う。', 'g', self!.id);
    expect(segs.filter((s) => s.card?.id === self!.id)).toEqual([]);
    // 他の用語は通常どおりリンク化される
    expect(segs.some((s) => s.card && s.card.id !== self!.id)).toBe(true);
    // 除外しても、同じ表記の別モードのカードがあればそちらにリンクする
    const ft = cardForLabel('ファインチューニング', 'g');
    const segs2 = splitTermSegments('ファインチューニングを行う', 'g', ft!.id);
    const linked = segs2.find((s) => s.card);
    expect(linked).toBeDefined();
    expect(linked!.card!.id).not.toBe(ft!.id);
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

import { isAsciiTerm } from '../../src/lib/cards';
import { PASSPORT_INDEX_TERMS } from '../../src/data/passportIndexCards';

describe('英字のみフィルタ（isAsciiTerm）', () => {
  it('英字略称・英名だけを通し、日本語を含む用語を除く', () => {
    expect(isAsciiTerm('API')).toBe(true);
    expect(isAsciiTerm('ISO/IEC 27001')).toBe(true);
    expect(isAsciiTerm('Top-p')).toBe(true);
    expect(isAsciiTerm('EU AI Act')).toBe(true);
    expect(isAsciiTerm('Few-Shotプロンプティング')).toBe(false);
    expect(isAsciiTerm('強化学習')).toBe(false);
    expect(isAsciiTerm('')).toBe(false);
    expect(isAsciiTerm('123')).toBe(false);
  });

  it('全モードに英字カードが存在する', () => {
    for (const m of ['g', 'passport', 'literacy', 'chatgpt']) {
      expect(publishedFlashcards.some((cd) => cd.mode === m && isAsciiTerm(cd.term)), m).toBe(true);
    }
  });
});

describe('パスポート公式テキスト索引（アルファベット欄）の収録', () => {
  it('索引の見出し語がすべて単語帳の用語か別名に存在する', () => {
    const have = new Set<string>();
    for (const cd of publishedFlashcards.filter((x) => x.mode === 'passport')) {
      have.add(cd.term.toLowerCase());
      for (const a of cd.aliases ?? []) have.add(a.toLowerCase());
    }
    for (const t of PASSPORT_INDEX_TERMS) expect(have.has(t.toLowerCase()), t).toBe(true);
  });

  it('パスポートの英字カードは49枚（索引追加で拡充）', () => {
    expect(publishedFlashcards.filter((cd) => cd.mode === 'passport' && isAsciiTerm(cd.term))).toHaveLength(49);
  });
});
