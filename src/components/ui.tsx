import React, { useEffect } from 'react';
import type { LessonVisual } from '../types';
import { syllabusById } from '../data/syllabus';
import { LESSON_VISUALS } from '../data/lessonVisuals';

export const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

export function Visual({ visual }: { visual: LessonVisual }) {
  return (
    <figure className="viz">
      <figcaption>{visual.title}</figcaption>
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
          <tbody>{visual.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} data-label={visual.columns[j]}>{cell}</td>)}</tr>)}</tbody>
        </table></div>
      )}
      {visual.kind === 'flow' && (
        <ol className="viz-flow">
          {visual.steps.map((s, i) => (
            <li key={i}><div className="fs"><b>{s.label}</b>{s.note && <span>{s.note}</span>}</div>{i < visual.steps.length - 1 && <span className="viz-arrow" aria-hidden="true">→</span>}</li>
          ))}
        </ol>
      )}
      {visual.kind === 'compare' && (
        <div className="viz-compare">
          {[visual.left, visual.right].map((side, i) => (
            <div key={i} className="viz-side"><b>{side.head}</b><ul>{side.points.map((p) => <li key={p}>{p}</li>)}</ul></div>
          ))}
        </div>
      )}
      {visual.kind === 'formula' && (
        <div className="viz-formula">
          <p className="viz-expr">{visual.expr}</p>
          <dl className="kv">{visual.vars.map((v) => <React.Fragment key={v.sym}><dt>{v.sym}</dt><dd>{v.meaning}</dd></React.Fragment>)}</dl>
          {visual.example && <p className="viz-example">{visual.example}</p>}
        </div>
      )}
      {visual.kind === 'timeline' && (
        <ol className="viz-timeline">
          {visual.events.map((e, i) => <li key={i}><div className="te"><b>{e.when}</b><span>{e.label}</span></div></li>)}
        </ol>
      )}
      {visual.caption && <p className="viz-caption">{visual.caption}</p>}
    </figure>
  );
}

export function LessonVisuals({ ids }: { ids?: string[] }) {
  if (!ids?.length) return null;
  return <>{ids.map((id) => (LESSON_VISUALS[id] ? <Visual key={id} visual={LESSON_VISUALS[id]} /> : null))}</>;
}

/** 教材本文の用語タップ：その場で短い定義を開き、単語帳・教材・問題へつなぐ（学習位置は失わない） */
export function TermText({ text, terms, onOpenCard }: { text: string; terms: { term: string; cardId: string; definition: string }[]; onOpenCard: (cardId: string) => void }) {
  const [open, setOpen] = React.useState<string | null>(null);
  if (!terms.length) return <>{text}</>;
  // 最も長い用語から順に1回だけリンク化する（重なりを避ける）
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
  let rest = text;
  const parts: React.ReactNode[] = [];
  let key = 0;
  for (const t of sorted) {
    const idx = rest.indexOf(t.term);
    if (idx < 0) continue;
    if (idx > 0) { parts.push(rest.slice(0, idx)); }
    parts.push(
      <button type="button" key={key++} className="term" aria-expanded={open === t.cardId} onClick={() => setOpen(open === t.cardId ? null : t.cardId)}>{t.term}</button>,
    );
    rest = rest.slice(idx + t.term.length);
    break; // 1段落につき最大1用語（リンクだらけにしない）
  }
  parts.push(rest);
  const active = terms.find((t) => t.cardId === open);
  return (
    <>
      {parts}
      {active && (
        <span className="term-pop" role="note">
          <b>{active.term}</b>：{active.definition}{' '}
          <button type="button" className="term-link" onClick={() => onOpenCard(active.cardId)}>単語帳で開く</button>
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
