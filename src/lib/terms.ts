import { publishedFlashcards } from '../data/flashcards';
import type { Flashcard, Mode } from '../types';

/**
 * 用語タップのための索引と分割ロジック。
 * - 索引は全モードの単語カード（用語＋別名）から作る。用語集の拡充がそのままリンク対象の拡充になる。
 * - 同じ表記が複数モードのカードにある場合は、表示中コンテンツのモード（prefer）のカードを優先する。
 * - 短い英字略称（2文字以下、例: AI）は本文の至る所に現れて誤リンクになるため、別名としては索引に入れない
 *   （用語本体がその表記の場合は除く）。
 */
const cardsByLabel = new Map<string, Flashcard[]>();
for (const card of publishedFlashcards) {
  const labels = [card.term, ...(card.aliases ?? [])];
  for (const label of labels) {
    if (!label || label.length < 2) continue;
    const asciiCore = label.replace(/[^A-Za-z0-9]/g, '');
    if (label !== card.term && /^[A-Za-z0-9 ]+$/.test(label) && asciiCore.length <= 2) continue;
    const arr = cardsByLabel.get(label) ?? [];
    if (!arr.some((c) => c.id === card.id)) arr.push(card);
    cardsByLabel.set(label, arr);
  }
}
const labelsByFirstChar = new Map<string, string[]>();
for (const label of cardsByLabel.keys()) {
  const arr = labelsByFirstChar.get(label[0]) ?? [];
  arr.push(label);
  labelsByFirstChar.set(label[0], arr);
}
for (const arr of labelsByFirstChar.values()) arr.sort((a, b) => b.length - a.length);

const isAsciiAlnum = (ch: string | undefined) => ch !== undefined && /[A-Za-z0-9]/.test(ch);

/**
 * 表記に一致するカードの優先順位：用語本体として一致するカードを別名として一致するカードより優先し、
 * その中では表示中モード（prefer）のカードを優先する（例：「壁打ち」はブレインストーミングの別名でもあるが、
 * 専用の「壁打ち」カードを出す）。
 */
function pickCard(label: string, prefer?: Mode): Flashcard | undefined {
  const cards = cardsByLabel.get(label);
  if (!cards) return undefined;
  const isTerm = (c: Flashcard) => c.term === label;
  return cards.find((c) => isTerm(c) && c.mode === prefer)
    ?? cards.find(isTerm)
    ?? cards.find((c) => c.mode === prefer)
    ?? cards[0];
}

export interface TermSegment {
  text: string;
  /** 用語としてリンク化された断片のときだけ入る */
  card?: Flashcard;
  /** 実際に一致した表記（用語本体とは限らず別名の場合もある） */
  label?: string;
}

/**
 * 本文を用語と通常テキストに分割する。1つの断片（段落）の中では、同じ表記は最初の出現だけをリンク化する
 * （リンクだらけにして読みにくくしないため）。長い表記を優先し、英数字の単語の途中では一致させない。
 */
export function splitTermSegments(text: string, prefer?: Mode): TermSegment[] {
  const segments: TermSegment[] = [];
  const linked = new Set<string>();
  let plain = '';
  let i = 0;
  const flush = () => { if (plain) { segments.push({ text: plain }); plain = ''; } };
  while (i < text.length) {
    const candidates = labelsByFirstChar.get(text[i]);
    let matched: { label: string; card: Flashcard } | null = null;
    if (candidates) {
      for (const label of candidates) {
        if (linked.has(label)) continue;
        if (!text.startsWith(label, i)) continue;
        // 英数字で始まる/終わる表記は、単語の途中（前後が英数字）では一致させない
        if (isAsciiAlnum(label[0]) && isAsciiAlnum(text[i - 1])) continue;
        if (isAsciiAlnum(label[label.length - 1]) && isAsciiAlnum(text[i + label.length])) continue;
        matched = { label, card: pickCard(label, prefer)! };
        break;
      }
    }
    if (matched) {
      flush();
      segments.push({ text: matched.label, card: matched.card, label: matched.label });
      linked.add(matched.label);
      i += matched.label.length;
    } else {
      plain += text[i];
      i += 1;
    }
  }
  flush();
  return segments;
}

/** 用語表記からカードを引く（テスト・検証用） */
export function cardForLabel(label: string, prefer?: Mode): Flashcard | undefined {
  return pickCard(label, prefer);
}

export const TERM_LABEL_COUNT = cardsByLabel.size;
