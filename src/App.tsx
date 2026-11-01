import { useEffect, useMemo, useState } from 'react';
import type { AppState, ExamSession, Lesson, Mode, Question } from './types';
import { G_SYLLABUS, LITERACY_SYLLABUS, syllabusById } from './data/syllabus';
import { publishedLessons } from './data/lessons';
import { publishedQuestions } from './data/questions';
import { EXERCISES, MODEL_INFOS } from './data/exercises';
import { loadState, saveState, exportState, defaultState } from './lib/storage';
import { judge, todayStr } from './lib/scoring';
import { nextReview, dueCards } from './lib/review';
import { fieldStats, readiness } from './lib/analysis';
import { checkUpdate } from './lib/update';

type View = 'home' | 'lessons' | 'practice' | 'exam' | 'review' | 'analysis' | 'literacy' | 'settings';
const EXAM_FULL_COUNT = 145;

function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [view, setView] = useState<View>('home');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    const r = saveState(state);
    setSaveErr(r.ok ? '' : `保存に失敗しました：${r.error ?? ''}（容量不足の可能性があります）`);
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.font = state.settings.fontSize;
    document.documentElement.dataset.density = state.settings.density;
    document.documentElement.dataset.motion = state.settings.reduceMotion ? 'reduce' : '';
  }, [state]);

  const upd = (fn: (s: AppState) => AppState) => setState((s) => fn(structuredClone(s)));
  const questions = publishedQuestions;
  const gQuestions = useMemo(() => questions.filter((x) => x.mode === 'g'), [questions]);
  const due = dueCards(state.review);
  const stats = fieldStats(state.answers, questions);
  const ready = readiness(state.answers, state.lessonsDone.filter((id) => publishedLessons.find((l) => l.id === id && l.mode === 'g')), publishedLessons.filter((l) => l.mode === 'g').length);
  const activeExam = state.exams.find((e) => e.status === 'in-progress');

  const recordAnswer = (s: AppState, q: Question, selected: number[], seconds: number, context: 'practice' | 'exam' | 'review') => {
    const correct = judge(selected, q.answer);
    const firstSeen = !s.answers.some((a) => a.questionId === q.id);
    s.answers.push({ questionId: q.id, selected, correct, at: new Date().toISOString(), seconds, firstSeen, context });
    s.review[q.id] = nextReview(s.review[q.id], q.id, correct);
    return correct;
  };

  const nav: { id: View; label: string }[] = [
    { id: 'home', label: 'ホーム' }, { id: 'lessons', label: '教材' }, { id: 'practice', label: '演習' },
    { id: 'exam', label: '模擬試験' }, { id: 'review', label: `復習${due.length ? `（${due.length}）` : ''}` },
    { id: 'analysis', label: '分析' }, { id: 'literacy', label: 'AI教養' }, { id: 'settings', label: '設定・更新' },
  ];

  return (
    <>
      <a href="#main" className="muted">本文へスキップ</a>
      <header className="top"><div className="wrap">
        <div className="top-in">
          <span className="logo">AI総合学習</span>
          <div role="group" aria-label="学習モード">
            <button className={state.mode === 'g' ? 'primary' : ''} aria-pressed={state.mode === 'g'} onClick={() => upd((s) => { s.mode = 'g'; return s; })}>G検定取得</button>{' '}
            <button className={state.mode === 'literacy' ? 'primary' : ''} aria-pressed={state.mode === 'literacy'} onClick={() => { upd((s) => { s.mode = 'literacy'; return s; }); setView('literacy'); }}>AI教養</button>
          </div>
        </div>
        <nav className="main" aria-label="主要メニュー">
          {nav.map((n) => <button key={n.id} aria-current={view === n.id ? 'page' : undefined} onClick={() => setView(n.id)}>{n.label}</button>)}
        </nav>
      </div></header>
      <main id="main" className="wrap">
        {saveErr && <p role="alert" className="bad">{saveErr}</p>}
        {lessonId ? (
          <LessonView lesson={publishedLessons.find((l) => l.id === lessonId)!} done={state.lessonsDone.includes(lessonId)}
            onDone={() => upd((s) => { if (!s.lessonsDone.includes(lessonId)) s.lessonsDone.push(lessonId); return s; })}
            onBack={() => setLessonId(null)} />
        ) : view === 'home' ? (
          <section>
            <h1>{state.mode === 'g' ? 'G検定取得' : 'AI教養'} ダッシュボード</h1>
            <div className="card"><div className="kpi">
              <div>今日の復習<b>{due.length}問</b></div>
              <div>累計回答<b>{state.answers.length}問</b></div>
              <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
              <div>G教材の網羅<b>{pct(ready.coverage)}</b></div>
              <div>学習済み教材<b>{state.lessonsDone.length}件</b></div>
            </div>
            <p className="muted">{ready.note}</p>
            {ready.reached95 && <p className="ok">到達基準（初見95%以上・模試30問以上で95%以上・網羅90%以上）を満たしています。</p>}
            </div>
            {activeExam && <div className="card"><h2>中断中の模擬試験</h2><p>{activeExam.kind}／{activeExam.questionIds.length}問／{activeExam.pauses.length}回中断</p><button className="primary touch" onClick={() => setView('exam')}>再開する</button></div>}
            <div className="card"><h2>弱点分野（正答率の低い順）</h2>
              {stats.length === 0 ? <p className="muted">まだ回答記録がありません。演習から始めましょう。</p> : (
                <ul>{stats.slice(0, 3).map((f) => <li key={f.syllabusId}>{syllabusById(f.syllabusId)?.chapter}：{pct(f.accuracy)}（{f.total}問）</li>)}</ul>)}
            </div>
            <div className="card"><h2>教材の更新情報</h2>
              <p>教材バージョン：{state.contentVersion}{state.lastUpdateCheck ? `／最終確認：${state.lastUpdateCheck.at.slice(0, 10)}（${state.lastUpdateCheck.result}）` : ''}</p>
              <button onClick={() => setView('settings')}>更新を確認する</button>
            </div>
          </section>
        ) : view === 'lessons' ? (
          <LessonsView mode={state.mode} state={state} onOpen={setLessonId} upd={upd} />
        ) : view === 'practice' ? (
          <PracticeView mode={state.mode} questions={questions.filter((x) => x.mode === state.mode)} onAnswer={(q, sel, sec) => { let c = false; upd((s) => { c = recordAnswer(s, q, sel, sec, 'practice'); return s; }); return c; }} />
        ) : view === 'exam' ? (
          <ExamView state={state} gQuestions={gQuestions} upd={upd} recordAnswer={recordAnswer} />
        ) : view === 'review' ? (
          <PracticeView key="review" mode={state.mode} questions={questions.filter((x) => x.mode === state.mode && due.some((d) => d.questionId === x.id))} reviewMode
            onAnswer={(q, sel, sec) => { let c = false; upd((s) => { c = recordAnswer(s, q, sel, sec, 'review'); return s; }); return c; }} />
        ) : view === 'analysis' ? (
          <section><h1>学習分析</h1>
            <div className="card"><div className="kpi">
              <div>全体正答率<b>{pct(ready.overallAccuracy)}</b></div>
              <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
              <div>模試正答率<b>{pct(ready.examAccuracy)}</b></div>
              <div>シラバス網羅<b>{pct(ready.coverage)}</b></div>
            </div><p className="muted">{ready.note} 記録が少ない段階の指標は不確実性が大きいため、傾向として読んでください。</p></div>
            <div className="card"><h2>分野別</h2><table><thead><tr><th>分野</th><th>回答</th><th>正答率</th><th>初見正答率</th></tr></thead>
              <tbody>{stats.map((f) => <tr key={f.syllabusId}><td>{syllabusById(f.syllabusId)?.chapter}</td><td>{f.total}</td><td>{pct(f.accuracy)}</td><td>{pct(f.firstSeenAccuracy)}</td></tr>)}</tbody></table></div>
            <div className="card"><h2>模擬試験の履歴</h2>
              {state.exams.filter((e) => e.status === 'submitted').length === 0 ? <p className="muted">まだ提出済みの模試がありません。</p> :
                <ul>{state.exams.filter((e) => e.status === 'submitted').map((e) => <li key={e.id}>{e.submittedAt?.slice(0, 10)} {e.kind} {e.questionIds.length}問／中断{e.pauses.length}回{e.strict ? '' : '（本番条件とは異なる記録）'}</li>)}</ul>}
            </div>
          </section>
        ) : view === 'literacy' ? (
          <LiteracyView onOpen={setLessonId} state={state} upd={upd} />
        ) : (
          <SettingsView state={state} upd={upd} />
        )}
      </main>
    </>
  );
}

function LessonsView({ mode, state, onOpen, upd }: { mode: Mode; state: AppState; onOpen: (id: string) => void; upd: (fn: (s: AppState) => AppState) => void }) {
  const [q, setQ] = useState('');
  const syllabus = mode === 'g' ? G_SYLLABUS : LITERACY_SYLLABUS;
  const lessons = publishedLessons.filter((l) => l.mode === mode && l.title.includes(q));
  const accByField = new Map<string, number>();
  for (const f of fieldStats(state.answers, publishedQuestions)) if (f.accuracy !== null) accByField.set(f.syllabusId, f.accuracy);
  const ordered = state.settings.order === 'weak'
    ? [...lessons].sort((a, b) => (accByField.get(a.syllabusId) ?? -1) - (accByField.get(b.syllabusId) ?? -1))
    : state.settings.order === 'free'
      ? lessons
      : [...lessons].sort((a, b) => (syllabusById(a.syllabusId)?.order ?? 0) - (syllabusById(b.syllabusId)?.order ?? 0));
  return (
    <section><h1>{mode === 'g' ? 'G検定 教材' : 'AI教養 教材'}</h1>
      <p><label>教材を検索 <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="タイトルで検索" /></label>{' '}
        <label>学習順序 <select value={state.settings.order} onChange={(e) => upd((s) => { s.settings.order = e.target.value as AppState['settings']['order']; return s; })}>
          <option value="syllabus">公式シラバス順</option><option value="recommended">推奨順（前提知識から）</option>
          <option value="weak">弱点優先（分析を参照）</option><option value="free">自由学習</option></select></label></p>
      {syllabus.map((node) => {
        const ls = ordered.filter((l) => l.syllabusId === node.id);
        if (q && ls.length === 0) return null;
        return (
          <div key={node.id} className="card"><h2>{node.chapter}</h2>
            <p className="muted">{node.title}</p>
            {node.prerequisites.length > 0 && <p className="muted">前提：{node.prerequisites.map((p) => syllabusById(p)?.chapter).join('、')}</p>}
            {ls.map((l) => <p key={l.id}><button className="touch" onClick={() => onOpen(l.id)}>{l.title}</button> {state.lessonsDone.includes(l.id) ? <span className="ok">学習済み</span> : ''}</p>)}
            {ls.length === 0 && <p className="muted">教材は今後追加されます。</p>}
          </div>
        );
      })}
    </section>
  );
}

function LessonView({ lesson, done, onDone, onBack }: { lesson: Lesson; done: boolean; onDone: () => void; onBack: () => void }) {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <article><button onClick={onBack}>← 教材一覧へ</button>
      <h1>{lesson.title}</h1>
      <div className="card"><h2>基礎解説</h2>{lesson.basic.map((p, i) => <p key={i}>{p}</p>)}
        <h3>要点</h3><ul>{lesson.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
        <h3>よくある誤解</h3><ul>{lesson.pitfalls.map((k) => <li key={k}>{k}</li>)}</ul></div>
      <div className="card"><button className="touch" aria-expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>詳細解説を{showDetail ? '閉じる' : '開く'}</button>
        {showDetail && lesson.detail.map((p, i) => <p key={i}>{p}</p>)}
        {lesson.advancedNote && <p className="muted">発展内容について：{lesson.advancedNote}</p>}
        <h3>参考資料</h3><ul>{lesson.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
        <p className="muted">教材 v{lesson.version}／最終検証 {lesson.verifiedAt}／再検証目安 {lesson.reviewBy}</p>
        <button className="primary touch" disabled={done} onClick={onDone}>{done ? '学習済み' : '学習済みにする'}</button>
      </div>
    </article>
  );
}

function PracticeView({ questions, onAnswer, reviewMode }: { mode: Mode; questions: Question[]; onAnswer: (q: Question, sel: number[], sec: number) => boolean; reviewMode?: boolean }) {
  const [field, setField] = useState('all');
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [started, setStarted] = useState(Date.now());
  const pool = useMemo(() => questions.filter((x) => field === 'all' || x.syllabusId === field), [questions, field]);
  const q = pool[idx % Math.max(pool.length, 1)];
  const fields = [...new Set(questions.map((x) => x.syllabusId))];
  if (questions.length === 0) return <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1><p className="card">現在、対象の問題はありません。{reviewMode ? '復習期限の問題がない状態です。' : ''}</p></section>;
  const toggle = (i: number) => {
    if (result !== null) return;
    setSel((s) => (q.type === 'multi' ? (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]));
  };
  return (
    <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
      {!reviewMode && <p><label>分野 <select value={field} onChange={(e) => { setField(e.target.value); setIdx(0); setSel([]); setResult(null); }}>
        <option value="all">全分野</option>{fields.map((f) => <option key={f} value={f}>{syllabusById(f)?.chapter}</option>)}</select></label></p>}
      {q && <div className="card" key={q.id}>
        <p className="muted">{syllabusById(q.syllabusId)?.chapter}／難易度{q.difficulty}／{q.type === 'multi' ? '複数選択' : q.type === 'truefalse' ? '正誤判定' : '単一選択'}／{(idx % pool.length) + 1}問目（全{pool.length}問）</p>
        <h2>{q.stem}</h2>
        {q.choices.map((c, i) => (
          <button key={i} className={`choice touch ${sel.includes(i) ? 'sel' : ''} ${result !== null && q.answer.includes(i) ? 'right' : ''} ${result === false && sel.includes(i) && !q.answer.includes(i) ? 'wrong' : ''}`}
            aria-pressed={sel.includes(i)} onClick={() => toggle(i)}>{String.fromCharCode(65 + i)}. {c}</button>
        ))}
        {result === null ? (
          <button className="primary touch" disabled={sel.length === 0} onClick={() => setResult(onAnswer(q, sel, Math.round((Date.now() - started) / 1000)))}>回答する</button>
        ) : (
          <div role="status">
            <p className={result ? 'ok' : 'bad'}>{result ? '正解です。' : '不正解です。'}</p>
            <h3>基礎解説</h3><p>{q.basic}</p>
            <h3>詳細解説</h3><p>{q.detail}</p>
            <h3>選択肢ごとの判定理由</h3>
            <ul>{q.choices.map((c, i) => <li key={i}>{String.fromCharCode(65 + i)}. {c} — {q.choiceReasons[i]}{q.answer.includes(i) ? '（正答）' : ''}</li>)}</ul>
            <p className="muted">出典：{q.sources.map((s) => s.title).join('、')}／最終検証 {q.verifiedAt}</p>
            <button className="primary touch" onClick={() => { setIdx(idx + 1); setSel([]); setResult(null); setStarted(Date.now()); }}>次の問題</button>
          </div>
        )}
      </div>}
    </section>
  );
}

function ExamView({ state, gQuestions, upd, recordAnswer }: { state: AppState; gQuestions: Question[]; upd: (fn: (s: AppState) => AppState) => void; recordAnswer: (s: AppState, q: Question, sel: number[], sec: number, ctx: 'practice' | 'exam' | 'review') => boolean }) {
  const active = state.exams.find((e) => e.status === 'in-progress');
  const [field, setField] = useState('g-03');
  const [count, setCount] = useState(10);
  const [modeKind, setModeKind] = useState<'online' | 'onsite'>('online');
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);

  const start = (kind: ExamSession['kind'], qs: Question[], limitSec: number) => {
    if (qs.length === 0) return;
    const session: ExamSession = {
      id: `exam-${Date.now()}`, kind, mode: 'g', startedAt: new Date().toISOString(), limitSec,
      questionIds: qs.map((x) => x.id), answers: {}, flags: [], current: 0, pauses: [], status: 'in-progress', strict: true,
    };
    upd((s) => { s.exams.push(session); return s; });
  };
  const lastSubmitted = [...state.exams].reverse().find((e) => e.status === 'submitted');
  if (!active) {
    return (
      <section><h1>模擬試験</h1>
        {lastSubmitted && (() => {
          const rqs = lastSubmitted.questionIds.map((id) => gQuestions.find((x) => x.id === id)!).filter(Boolean);
          const correctCount = rqs.filter((x) => judge(lastSubmitted.answers[x.id] ?? [], x.answer)).length;
          return (
            <div className="card"><h2>直近の結果（{lastSubmitted.kind}）</h2>
              <p>正解 {correctCount}／{rqs.length}問（{rqs.length ? Math.round((correctCount / rqs.length) * 100) : 0}%）／中断 {lastSubmitted.pauses.length}回{lastSubmitted.strict ? '' : '（一時停止したため本番条件の完全再現ではありません）'}</p>
              {rqs.map((x, i) => (
                <details key={x.id}><summary>問{i + 1}. {x.stem} — {judge(lastSubmitted.answers[x.id] ?? [], x.answer) ? '正解' : '不正解'}</summary>
                  <p>{x.basic}</p><p>{x.detail}</p>
                  <ul>{x.choices.map((c, ci) => <li key={ci}>{String.fromCharCode(65 + ci)}. {c} — {x.choiceReasons[ci]}{x.answer.includes(ci) ? '（正答）' : ''}</li>)}</ul>
                </details>
              ))}
            </div>
          );
        })()}
        <div className="card"><h2>フル模擬試験</h2>
          {gQuestions.length >= EXAM_FULL_COUNT ? (
            <><p>公式条件（{modeKind === 'online' ? 'オンライン：100分' : '会場：120分'}／{EXAM_FULL_COUNT}問）で実施します。</p>
              <label>受験方式 <select value={modeKind} onChange={(e) => setModeKind(e.target.value as 'online' | 'onsite')}><option value="online">オンライン（100分）</option><option value="onsite">会場（120分）</option></select></label>{' '}
              <button className="primary touch" onClick={() => start('full', shuffle(gQuestions, Date.now()).slice(0, EXAM_FULL_COUNT), modeKind === 'online' ? 6000 : 7200)}>開始</button></>
          ) : (
            <p role="note">現在は利用できません。検証済み問題が{gQuestions.length}問しかなく、公式の{EXAM_FULL_COUNT}問構成を不足分で水増しすることはしません。問題プールが{EXAM_FULL_COUNT}問に達した時点で有効化されます。</p>
          )}
        </div>
        <div className="card"><h2>短縮模擬試験</h2><p>10問／目安15分。提出まで解説は表示されません。</p>
          <button className="primary touch" onClick={() => start('short', shuffle(gQuestions, Date.now() + 7).slice(0, 10), 900)}>開始</button></div>
        <div className="card"><h2>分野別／カスタム模擬試験</h2>
          <p><label>分野 <select value={field} onChange={(e) => setField(e.target.value)}>{G_SYLLABUS.map((s) => <option key={s.id} value={s.id}>{s.chapter}</option>)}</select></label>{' '}
            <label>問題数 <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: 80 }} /></label></p>
          <button className="primary touch" onClick={() => { const qs = shuffle(gQuestions.filter((x) => x.syllabusId === field), Date.now() + 13).slice(0, count); start('field', qs, qs.length * 90); }}>分野別を開始</button>{' '}
          <button className="touch" onClick={() => start('custom', shuffle(gQuestions, Date.now() + 29).slice(0, count), count * 90)}>カスタム（全分野）</button>
          <p className="muted">分野に検証済み問題が不足する場合は、ある分だけで構成します（重複による水増しはしません）。</p>
        </div>
      </section>
    );
  }
  const qs = active.questionIds.map((id) => gQuestions.find((x) => x.id === id)!).filter(Boolean);
  const cur = qs[active.current];
  const paused = active.pauses.some((p) => !p.resumedAt);
  const elapsedBase = (Date.now() - new Date(active.startedAt).getTime()) / 1000;
  const pausedSec = active.pauses.reduce((acc, p) => acc + ((p.resumedAt ? new Date(p.resumedAt).getTime() : Date.now()) - new Date(p.at).getTime()) / 1000, 0);
  const remain = Math.max(0, Math.floor(active.limitSec - (elapsedBase - pausedSec)));
  const answeredCount = Object.keys(active.answers).length;
  return (
    <section><h1>模擬試験（{active.kind}）</h1>
      <div className="card">
        <p>残り時間 <b>{Math.floor(remain / 60)}:{String(remain % 60).padStart(2, '0')}</b>／回答 {answeredCount}／{qs.length}問{paused ? '／一時停止中' : ''}／中断 {active.pauses.length}回</p>
        <div className="bar" aria-hidden="true"><i style={{ width: `${(answeredCount / qs.length) * 100}%` }} /></div>
        {cur && <>
          <h2>問{active.current + 1}. {cur.stem}</h2>
          {cur.choices.map((c, i) => {
            const sel = active.answers[cur.id] ?? [];
            return <button key={i} className={`choice touch ${sel.includes(i) ? 'sel' : ''}`} aria-pressed={sel.includes(i)}
              disabled={paused}
              onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.answers[cur.id] = cur.type === 'multi' ? (sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]) : [i]; return s; })}>
              {String.fromCharCode(65 + i)}. {c}</button>;
          })}
        </>}
        <p>
          <button disabled={active.current === 0} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current -= 1; return s; })}>前へ</button>{' '}
          <button disabled={active.current >= qs.length - 1} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current += 1; return s; })}>次へ</button>{' '}
          <button aria-pressed={cur ? active.flags.includes(cur.id) : false} onClick={() => cur && upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.flags = e.flags.includes(cur.id) ? e.flags.filter((f) => f !== cur.id) : [...e.flags, cur.id]; return s; })}>見直しフラグ</button>{' '}
          {paused
            ? <button className="primary" onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; const p = e.pauses.find((x) => !x.resumedAt); if (p) p.resumedAt = new Date().toISOString(); e.strict = false; return s; })}>再開</button>
            : <button onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.pauses.push({ at: new Date().toISOString() }); e.strict = false; return s; })}>一時停止</button>}{' '}
          <button onClick={() => { if (confirm(`未回答 ${qs.length - answeredCount}問があります。提出しますか？`)) upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.status = 'submitted'; e.submittedAt = new Date().toISOString(); for (const qq of qs) { const sel = e.answers[qq.id]; if (sel && sel.length > 0) recordAnswer(s, qq, sel, 0, 'exam'); } return s; }); }}>提出する</button>
        </p>
        <h3>問題一覧</h3>
        <p>{qs.map((x, i) => <button key={x.id} style={{ margin: 2 }} aria-current={i === active.current} onClick={() => upd((s) => { s.exams.find((e2) => e2.id === active.id)!.current = i; return s; })}>{i + 1}{active.answers[x.id] ? '✓' : ''}{active.flags.includes(x.id) ? '⚑' : ''}</button>)}</p>
      </div>
    </section>
  );
}

function LiteracyView({ onOpen, state, upd }: { onOpen: (id: string) => void; state: AppState; upd: (fn: (s: AppState) => AppState) => void }) {
  const [tab, setTab] = useState<'lessons' | 'exercises' | 'models'>('lessons');
  return (
    <section><h1>AI教養</h1>
      <p role="group" aria-label="AI教養の表示切替">
        <button className={tab === 'lessons' ? 'primary' : ''} onClick={() => setTab('lessons')}>教材</button>{' '}
        <button className={tab === 'exercises' ? 'primary' : ''} onClick={() => setTab('exercises')}>実践演習</button>{' '}
        <button className={tab === 'models' ? 'primary' : ''} onClick={() => setTab('models')}>モデル比較</button></p>
      {tab === 'lessons' && LITERACY_SYLLABUS.map((node) => (
        <div key={node.id} className="card"><h2>{node.chapter}</h2><p className="muted">{node.title}</p>
          {publishedLessons.filter((l) => l.syllabusId === node.id).map((l) => <p key={l.id}><button className="touch" onClick={() => onOpen(l.id)}>{l.title}</button> {state.lessonsDone.includes(l.id) ? <span className="ok">学習済み</span> : ''}</p>)}
        </div>))}
      {tab === 'exercises' && EXERCISES.map((ex) => {
        const checked = state.exerciseChecks[ex.id] ?? [];
        return (
          <div key={ex.id} className="card"><h2>{ex.title}</h2>
            <p>{ex.background}</p><p><b>到達目標：</b>{ex.goal}</p>
            <p><b>制約：</b>{ex.constraints.join('／')}</p>
            <h3>実施手順</h3><ol>{ex.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <h3>評価ルーブリック（自己評価：自動採点ではありません）</h3>
            {ex.rubric.map((r, i) => <p key={r}><label><input type="checkbox" checked={checked.includes(i)} onChange={() => upd((s) => { const cur = s.exerciseChecks[ex.id] ?? []; s.exerciseChecks[ex.id] = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]; return s; })} /> {r}</label></p>)}
            <p><b>模範的な考え方：</b>{ex.modelThinking}</p>
            <p><b>失敗例：</b>{ex.failureExample}</p>
            <p><b>改善例：</b>{ex.improvementExample}</p>
            <p className="muted">達成 {checked.length}／{ex.rubric.length}（自己評価）</p>
          </div>
        );
      })}
      {tab === 'models' && (
        <div className="card"><h2>主要モデルの比較（観点）</h2>
          <p className="muted">性能の絶対的な序列は示しません。料金・機能は変化するため、各サービスの公式ページで確認時点の条件を確認してください。古い情報は比較から外し、版ごとに差し替えます。</p>
          <table><thead><tr><th>サービス</th><th>強み（概要）</th><th>制約</th><th>料金</th><th>プライバシー</th><th>適した用途</th><th>確認日</th></tr></thead>
            <tbody>{MODEL_INFOS.map((m) => <tr key={m.id}><td><a href={m.source.url} target="_blank" rel="noreferrer">{m.name}</a><br /><span className="muted">{m.vendor}</span></td><td>{m.strengths}</td><td>{m.limits}</td><td>{m.pricingNote}</td><td>{m.privacyNote}</td><td>{m.bestFor}</td><td>{m.asOf}</td></tr>)}</tbody></table>
        </div>
      )}
    </section>
  );
}

function SettingsView({ state, upd }: { state: AppState; upd: (fn: (s: AppState) => AppState) => void }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = state.settings;
  return (
    <section><h1>設定・更新</h1>
      <div className="card"><h2>表示設定</h2>
        <p><label>テーマ <select value={set.theme} onChange={(e) => upd((s) => { s.settings.theme = e.target.value as 'light' | 'dark'; return s; })}><option value="light">ライト</option><option value="dark">ダーク</option></select></label>{' '}
          <label>文字サイズ <select value={set.fontSize} onChange={(e) => upd((s) => { s.settings.fontSize = e.target.value as 's' | 'm' | 'l'; return s; })}><option value="s">小</option><option value="m">中</option><option value="l">大</option></select></label>{' '}
          <label>表示密度 <select value={set.density} onChange={(e) => upd((s) => { s.settings.density = e.target.value as 'comfortable' | 'compact'; return s; })}><option value="comfortable">標準</option><option value="compact">コンパクト</option></select></label></p>
        <p><label><input type="checkbox" checked={set.reduceMotion} onChange={(e) => upd((s) => { s.settings.reduceMotion = e.target.checked; return s; })} /> アニメーションを抑制する</label></p>
        <p><label>1日の学習目標（分） <input type="number" min={5} max={180} value={state.dailyGoalMin} onChange={(e) => upd((s) => { s.dailyGoalMin = Number(e.target.value); return s; })} style={{ width: 80 }} /></label></p>
      </div>
      <div className="card"><h2>教材の更新</h2>
        <p>更新ボタンは、公開済みの最新教材マニフェストを取得して現在の版と比較します。教材データそのものの差し替えは、アプリを再読み込みした際に新しい版が読み込まれる形で行われ、学習記録は保持されます。GitHub上での教材の審査・公開は管理者が行う作業で、このアプリからは書き込みを行いません（手順は利用案内を参照）。</p>
        <button className="primary touch" disabled={busy} onClick={async () => { setBusy(true); const r = await checkUpdate(state.contentVersion); setMsg(r.message); if (r.manifest) upd((s) => { s.lastUpdateCheck = { at: new Date().toISOString(), result: r.status }; if (r.status === 'available') s.contentVersion = r.manifest!.contentVersion; return s; }); setBusy(false); }}>教材の更新を確認</button>
        {msg && <p role="status">{msg}</p>}
        <p className="muted">現在の教材バージョン：{state.contentVersion}／シラバス：G2024#6以降適用版（2026-11-02確認）／試験制度：オンライン100分・会場120分、各145問程度（JDLA公式、{todayStr()}時点の表示）</p>
      </div>
      <div className="card"><h2>学習記録の管理</h2>
        <p>学習記録はこの端末のブラウザ内にのみ保存され、外部サーバーには送信されません。ブラウザのデータ削除や端末の故障で記録が失われる可能性があります。</p>
        <p><button onClick={() => { const blob = new Blob([exportState(state)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ai-learning-backup.json'; a.click(); }}>記録をエクスポート（JSON）</button>{' '}
          <button onClick={() => { if (confirm('学習記録をすべて初期化しますか？この操作は元に戻せません。')) upd(() => defaultState()); }}>記録を初期化</button></p>
        <p className="muted">初期化は確認のうえでのみ実行されます。通常の操作や教材更新で記録が初期化されることはありません。</p>
      </div>
    </section>
  );
}
