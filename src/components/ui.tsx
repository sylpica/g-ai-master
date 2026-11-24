import React, { useEffect } from 'react';
import type { LessonVisual, Mode } from '../types';
import { syllabusById } from '../data/syllabus';
import { LESSON_VISUALS } from '../data/lessonVisuals';
import { splitTermSegments } from '../lib/terms';

export const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

export function Visual({ visual, onOpenCard, prefer }: { visual: LessonVisual; onOpenCard?: (cardId: string) => void; prefer?: Mode }) {
  const tt = (text: string) => (onOpenCard ? <TermText text={text} onOpenCard={onOpenCard} prefer={prefer} /> : text);
  return (
    <figure className="viz">
      <figcaption>{tt(visual.title)}</figcaption>
      {visual.kind === 'nest' && (
        <div className="viz-nest" role="img" aria-label={`${visual.title}：${visual.layers.map((l) => l.label).join('の中に')}`}>
          {visual.layers.map((l, i) => (
            <div key={i} className="viz-nest-layer" style={{ marginLeft: i * 18 }}>
              <b>{l.label}</b>{l.note && <span>{l.note}</span>}
            </div>
          ))}
        </div>
      )}
      {visual.kind === 'table' && (
        <div className="tablewrap"><table className="stack">
          <thead><tr>{visual.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{visual.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} data-label={visual.columns[j]}>{tt(cell)}</td>)}</tr>)}</tbody>
        </table></div>
      )}
      {visual.kind === 'flow' && (
        <ol className="viz-flow">
          {visual.steps.map((s, i) => (
            <li key={i}><div className="fs"><b>{tt(s.label)}</b>{s.note && <span>{tt(s.note)}</span>}</div>{i < visual.steps.length - 1 && <span className="viz-arrow" aria-hidden="true">→</span>}</li>
          ))}
        </ol>
      )}
      {visual.kind === 'compare' && (
        <div className="viz-compare">
          {[visual.left, visual.right].map((side, i) => (
            <div key={i} className="viz-side"><b>{tt(side.head)}</b><ul>{side.points.map((p) => <li key={p}>{tt(p)}</li>)}</ul></div>
          ))}
        </div>
      )}
      {visual.kind === 'formula' && (
        <div className="viz-formula">
          <p className="viz-expr">{visual.expr}</p>
          <dl className="kv">{visual.vars.map((v) => <React.Fragment key={v.sym}><dt>{v.sym}</dt><dd>{tt(v.meaning)}</dd></React.Fragment>)}</dl>
          {visual.example && <p className="viz-example">{tt(visual.example)}</p>}
        </div>
      )}
      {visual.kind === 'timeline' && (
        <ol className="viz-timeline">
          {visual.events.map((e, i) => <li key={i}><div className="te"><b>{e.when}</b><span>{tt(e.label)}</span></div></li>)}
        </ol>
      )}
      {visual.caption && <p className="viz-caption">{tt(visual.caption)}</p>}
    </figure>
  );
}

export function LessonVisuals({ ids, onOpenCard, prefer }: { ids?: string[]; onOpenCard?: (cardId: string) => void; prefer?: Mode }) {
  if (!ids?.length) return null;
  return <>{ids.map((id) => (LESSON_VISUALS[id] ? <Visual key={id} visual={LESSON_VISUALS[id]} onOpenCard={onOpenCard} prefer={prefer} /> : null))}</>;
}

const TERM_MODE_LABEL: Record<string, string> = { g: 'G検定', passport: '生成AIパスポート', literacy: 'AI教養', chatgpt: 'ChatGPT・Codex' };

/**
 * 本文の用語タップ：全モードの用語集（単語カード）から専門用語をリンク化し、タップでその場に定義を開く。
 * 学習位置は失わず、ポップオーバーから単語帳のカードへも進める。
 * nested=true のときは、選択肢ボタンなど他のボタンの内側でも動くよう span で描画し、クリックの伝播を止める。
 * markOnly=true のときは、用語を視覚的に示すだけでタップ対象にしない。選択肢ボタンの内側では、
 * 用語タップが「選択する」という主操作と競合して誤タップを招くため、定義は解説側の用語タップから開く。
 */
export function TermText({ text, onOpenCard, prefer, nested, markOnly, excludeId }: {
  text: string; onOpenCard: (cardId: string) => void; prefer?: Mode; nested?: boolean; markOnly?: boolean; excludeId?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const segments = React.useMemo(() => splitTermSegments(text, prefer, excludeId), [text, prefer, excludeId]);
  if (!segments.some((s) => s.card)) return <>{text}</>;
  const active = segments.find((s) => s.card && s.card.id === open)?.card;
  const toggle = (cardId: string) => setOpen(open === cardId ? null : cardId);
  return (
    <>
      {segments.map((s, i) => {
        if (!s.card) return <React.Fragment key={i}>{s.text}</React.Fragment>;
        const card = s.card;
        if (markOnly) {
          return <span key={i} className="term term-mark">{s.text}</span>;
        }
        if (nested) {
          return (
            <span key={i} role="button" className="term" aria-expanded={open === card.id}
              onClick={(e) => { e.stopPropagation(); toggle(card.id); }}>{s.text}</span>
          );
        }
        return (
          <button type="button" key={i} className="term" aria-expanded={open === card.id}
            onClick={(e) => { e.stopPropagation(); toggle(card.id); }}>{s.text}</button>
        );
      })}
      {active && (
        <span className="term-pop" role="note">
          <b>{active.term}</b><span className="muted">（{TERM_MODE_LABEL[active.mode]}）</span>：{active.definition}{' '}
          {nested
            ? <span role="button" className="term-link" onClick={(e) => { e.stopPropagation(); onOpenCard(active.id); }}>単語帳で開く</span>
            : <button type="button" className="term-link" onClick={() => onOpenCard(active.id)}>単語帳で開く</button>}
        </span>
      )}
    </>
  );
}

/** 画面遷移時に先頭へ（同じ画面内の操作では呼ばない） */
export function useScrollTop(deps: unknown[]) {
  useEffect(() => { window.scrollTo(0, 0); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export function chapterName(syllabusId: string): string {
  return syllabusById(syllabusId)?.chapter ?? syllabusId;
}
