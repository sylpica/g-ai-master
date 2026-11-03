import React, { useEffect, useMemo, useState } from 'react';
import type { AppState, ExamSession, Lesson, Mode, Question, SyllabusNode } from './types';
import { G_SYLLABUS, LITERACY_SYLLABUS, SYLLABUS_VERIFIED_AT, syllabusById } from './data/syllabus';
import { publishedLessons } from './data/lessons';
import { publishedQuestions } from './data/questions';
import { EXERCISES, MODEL_INFOS } from './data/exercises';
import { NEWS_ITEMS, NEWS_LAST_ADDED } from './data/news';
import { loadState, saveState, exportState, defaultState, parseState, clampGoal } from './lib/storage';
import { judge, todayStr } from './lib/scoring';
import { nextReview, dueCards } from './lib/review';
import { fieldStats, readiness } from './lib/analysis';
import { checkUpdate, BUNDLED_CONTENT_VERSION } from './lib/update';
import { remainingSec as examRemainingSec, effectiveElapsedSec, isPaused } from './lib/exam';

type View = 'home' | 'lessons' | 'practice' | 'exam' | 'review' | 'analysis' | 'literacy' | 'settings';
const EXAM_FULL_COUNT = 145;
const EXAM_KIND_LABEL: Record<ExamSession['kind'], string> = { full: 'フル', short: '短縮', field: '分野別', custom: 'カスタム' };
const MODE_LABEL: Record<Mode, string> = { g: 'G検定', literacy: 'AI教養' };

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

  // 新しい版のアプリ（ビルド）が読み込まれたら、教材バージョン表示を同梱版へ同期する
  useEffect(() => {
    if (state.contentVersion !== BUNDLED_CONTENT_VERSION) {
      setState((s) => ({ ...s, contentVersion: BUNDLED_CONTENT_VERSION }));
    }
  }, [state.contentVersion]);

  const upd = (fn: (s: AppState) => AppState) => setState((s) => fn(structuredClone(s)));
  const questions = publishedQuestions;
  const gQuestions = useMemo(() => questions.filter((x) => x.mode === 'g'), [questions]);
  // 復習・分析・到達度は現在のモードの問題だけで集計する（G検定の到達度にAI教養の回答を混ぜない）
  const modeQuestionIds = useMemo(() => new Set(questions.filter((x) => x.mode === state.mode).map((x) => x.id)), [questions, state.mode]);
  const due = dueCards(state.review).filter((c) => modeQuestionIds.has(c.questionId));
  const modeAnswers = state.answers.filter((a) => modeQuestionIds.has(a.questionId));
  const stats = fieldStats(modeAnswers, questions);
  const modeLessons = publishedLessons.filter((l) => l.mode === state.mode);
  const modeLessonsDone = state.lessonsDone.filter((id) => modeLessons.some((l) => l.id === id));
  const ready = readiness(modeAnswers, modeLessonsDone, modeLessons.length);
  const isG = state.mode === 'g';

  // 画面を切り替えたら先頭から表示する（前画面のスクロール位置が残って本文の途中から始まるのを防ぐ）
  useEffect(() => { window.scrollTo(0, 0); }, [view, lessonId]);
  const activeExam = state.exams.find((e) => e.status === 'in-progress');

  const recordAnswer = (s: AppState, q: Question, selected: number[], seconds: number, context: 'practice' | 'exam' | 'review') => {
    const correct = judge(selected, q.answer);
    const firstSeen = !s.answers.some((a) => a.questionId === q.id);
    s.answers.push({ questionId: q.id, selected, correct, at: new Date().toISOString(), seconds, firstSeen, context });
    s.review[q.id] = nextReview(s.review[q.id], q.id, correct);
    return correct;
  };

  // メニューはモードごとに必要なものだけ。AI教養の教材・実践演習・モデル比較・ニュースは「教材」画面のタブにまとめる
  const lessonsView: View = isG ? 'lessons' : 'literacy';
  const nav: { id: View; label: string; badge?: number }[] = [
    { id: 'home', label: 'ホーム' }, { id: lessonsView, label: '教材' }, { id: 'practice', label: '演習' },
    ...(isG ? [{ id: 'exam' as View, label: '模試' }] : []),
    { id: 'review', label: '復習', badge: due.length }, { id: 'analysis', label: '分析' }, { id: 'settings', label: '設定' },
  ];
  const go = (v: View) => { setLessonId(null); setView(v); };

  return (
    <>
      <a href="#main" className="skip">本文へスキップ</a>
      <header className="top"><div className="wrap">
        <div className="top-in">
          <span className="logo">AI総合学習</span>
          <div role="group" aria-label="学習モード" className="seg">
            <button className={state.mode === 'g' ? 'primary' : ''} aria-pressed={state.mode === 'g'} onClick={() => { upd((s) => { s.mode = 'g'; return s; }); setView('home'); setLessonId(null); }}>G検定取得</button>
            <button className={state.mode === 'literacy' ? 'primary' : ''} aria-pressed={state.mode === 'literacy'} onClick={() => { upd((s) => { s.mode = 'literacy'; return s; }); setView('literacy'); setLessonId(null); }}>AI教養</button>
          </div>
          <nav className="main" aria-label="主要メニュー" style={{ '--n': nav.length } as React.CSSProperties}>
            {nav.map((n) => (
              <button key={n.id} aria-current={!lessonId && (view === n.id || (n.id === lessonsView && (view === 'lessons' || view === 'literacy'))) ? 'page' : undefined}
                aria-label={n.badge ? `${n.label}（${n.badge}件）` : undefined} onClick={() => go(n.id)}>
                {n.label}{n.badge ? <span className="badge" aria-hidden="true">{n.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </div></header>
      <main id="main" className="wrap">
        {saveErr && <p role="alert" className="bad">{saveErr}</p>}
        {lessonId ? (
          <LessonView lesson={publishedLessons.find((l) => l.id === lessonId)!} done={state.lessonsDone.includes(lessonId)}
            bookmarked={state.bookmarks.includes(`lesson:${lessonId}`)}
            onBookmark={() => upd((s) => { const k = `lesson:${lessonId}`; s.bookmarks = s.bookmarks.includes(k) ? s.bookmarks.filter((b) => b !== k) : [...s.bookmarks, k]; return s; })}
            onDone={() => upd((s) => { if (!s.lessonsDone.includes(lessonId)) s.lessonsDone.push(lessonId); return s; })}
            onBack={() => setLessonId(null)} />
        ) : view === 'home' ? (
          <section>
            <h1>{isG ? 'G検定取得' : 'AI教養'} ダッシュボード</h1>
            {activeExam && <div className="card"><h2>中断中の模擬試験</h2><p>{EXAM_KIND_LABEL[activeExam.kind]}／{activeExam.questionIds.length}問／回答 {Object.keys(activeExam.answers).length}問／一時停止 {activeExam.pauses.length}回</p><button className="primary touch" onClick={() => setView('exam')}>再開する</button></div>}
            {(() => {
              const next = due.length > 0
                ? { title: `復習が${due.length}問たまっています`, body: '期限の来た問題から解きましょう。', label: '復習をはじめる', view: 'review' as View }
                : modeLessonsDone.length < modeLessons.length
                  ? { title: '教材の続きを学びましょう', body: `${MODE_LABEL[state.mode]}の教材 ${modeLessonsDone.length}／${modeLessons.length} 件が学習済みです。`, label: '教材を開く', view: (isG ? 'lessons' : 'literacy') as View }
                  : modeAnswers.length < 20
                    ? { title: '演習でアウトプットしましょう', body: '教材は一通り学習済みです。演習で初見正答率を測りましょう。', label: '演習をはじめる', view: 'practice' as View }
                    : isG
                      ? { title: '模擬試験に挑戦しましょう', body: '本番形式で時間配分と弱点を確認できます。', label: '模擬試験を開く', view: 'exam' as View }
                      : { title: '実践演習に取り組みましょう', body: '学んだ内容を実際の作業で試し、ルーブリックで自己評価します。', label: '実践演習を開く', view: 'literacy' as View };
              return <div className="card next"><h2>次にやること：{next.title}</h2><p>{next.body}</p><button className="primary touch" onClick={() => setView(next.view)}>{next.label}</button></div>;
            })()}
            <div className="card">
              <ol className="flow" aria-label="学習の流れ">
                <li><button onClick={() => setView(isG ? 'lessons' : 'literacy')}><b>教材</b><span>学習済み {modeLessonsDone.length}／{modeLessons.length}件</span></button></li>
                <li><button onClick={() => setView('practice')}><b>演習</b><span>累計 {modeAnswers.length}問に回答</span></button></li>
                <li><button onClick={() => setView('review')}><b>復習</b><span>期限の来た問題 {due.length}問</span></button></li>
                {isG
                  ? <li><button onClick={() => setView('exam')}><b>模擬試験</b><span>提出済み {state.exams.filter((e) => e.status === 'submitted').length}回</span></button></li>
                  : <li><button onClick={() => setView('literacy')}><b>実践演習</b><span>自己評価 {Object.values(state.exerciseChecks).filter((v) => v.length > 0).length}／{EXERCISES.length}件</span></button></li>}
              </ol>
              <div className="kpi" style={{ marginTop: 12 }}>
                <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
                <div>全体正答率<b>{pct(ready.overallAccuracy)}</b></div>
                <div>教材の網羅<b>{pct(ready.coverage)}</b></div>
              </div>
            {(() => {
              const today = todayStr();
              const todays = state.answers.filter((a) => todayStr(new Date(a.at)) === today);
              const min = Math.round(todays.reduce((acc, a) => acc + (a.seconds || 0), 0) / 60);
              return <div style={{ marginTop: 12 }}>
                <p style={{ margin: '0 0 6px' }}>今日の学習：{todays.length}問／約{min}分（回答時間からの概算・目標 {state.dailyGoalMin}分）</p>
                <div className="bar" role="progressbar" aria-valuenow={Math.min(100, Math.round((min / Math.max(state.dailyGoalMin, 1)) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label="今日の学習目標の進捗">
                  <i style={{ width: `${Math.min(100, (min / Math.max(state.dailyGoalMin, 1)) * 100)}%` }} /></div>
              </div>;
            })()}
            </div>
            {stats.length > 0 && <div className="card"><h2>弱点分野（正答率の低い順）</h2>
              <ul>{stats.slice(0, 3).map((f) => <li key={f.syllabusId}>{syllabusById(f.syllabusId)?.chapter}：{pct(f.accuracy)}（{f.total}問）</li>)}</ul>
            </div>}
            <div className="card note">
              {isG && <p className="muted">{ready.note}</p>}
              {isG && ready.reached95 && <p className="ok">到達基準（初見95%以上・模試30問以上で95%以上・網羅90%以上）を満たしています。</p>}
              <p>教材バージョン：{state.contentVersion}{state.lastUpdateCheck ? `／最終確認：${state.lastUpdateCheck.at.slice(0, 10)}（${state.lastUpdateCheck.result}）` : ''}{' '}
                <button onClick={() => setView('settings')}>更新を確認</button></p>
            </div>
          </section>
        ) : view === 'lessons' ? (
          <LessonsView mode={state.mode} state={state} onOpen={setLessonId} upd={upd} />
        ) : view === 'practice' ? (
          <PracticeView key={`practice-${state.mode}`} mode={state.mode} questions={questions.filter((x) => x.mode === state.mode)} onAnswer={(q, sel, sec) => { let c = false; upd((s) => { c = recordAnswer(s, q, sel, sec, 'practice'); return s; }); return c; }} />
        ) : view === 'exam' ? (
          <ExamView state={state} gQuestions={gQuestions} upd={upd} recordAnswer={recordAnswer} />
        ) : view === 'review' ? (
          <PracticeView key={`review-${state.mode}`} mode={state.mode} questions={questions.filter((x) => x.mode === state.mode && due.some((d) => d.questionId === x.id))} reviewMode
            onAnswer={(q, sel, sec) => { let c = false; upd((s) => { c = recordAnswer(s, q, sel, sec, 'review'); return s; }); return c; }} />
        ) : view === 'analysis' ? (
          <section><h1>学習分析（{MODE_LABEL[state.mode]}）</h1>
            <div className="card"><div className="kpi">
              <div>全体正答率<b>{pct(ready.overallAccuracy)}</b></div>
              <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
              {isG && <div>模試正答率<b>{pct(ready.examAccuracy)}</b></div>}
              <div>教材の網羅<b>{pct(ready.coverage)}</b></div>
            </div></div>
            <div className="card"><h2>解答時間</h2>
              {(() => { const timed = modeAnswers.filter((a) => a.seconds > 0); const avg = timed.length ? Math.round(timed.reduce((acc, a) => acc + a.seconds, 0) / timed.length) : null;
                return <p>{avg === null ? 'まだ計測できる回答記録がありません。' : `平均 ${avg}秒／問（計測対象 ${timed.length}問）。模試では1問あたりの目安時間と比較して、時間配分の傾向を確認できます。`}</p>; })()}
            </div>
            <div className="card"><h2>分野別</h2>{stats.length === 0 ? <p className="muted">まだ回答記録がありません。</p> : <div className="tablewrap"><table><thead><tr><th>分野</th><th>回答</th><th>正答率</th><th>初見正答率</th></tr></thead>
              <tbody>{stats.map((f) => <tr key={f.syllabusId}><td>{syllabusById(f.syllabusId)?.chapter}</td><td>{f.total}</td><td>{pct(f.accuracy)}</td><td>{pct(f.firstSeenAccuracy)}</td></tr>)}</tbody></table></div>}</div>
            {isG && <div className="card"><h2>模擬試験の履歴</h2>
              {state.exams.filter((e) => e.status === 'submitted').length === 0 ? <p className="muted">まだ提出済みの模試がありません。</p> :
                <ul>{state.exams.filter((e) => e.status === 'submitted').map((e) => <li key={e.id}>{e.submittedAt ? todayStr(new Date(e.submittedAt)) : ''} {EXAM_KIND_LABEL[e.kind]} {e.questionIds.length}問／一時停止{e.pauses.length}回{e.strict ? '' : '（本番条件とは異なる記録）'}</li>)}</ul>}
            </div>}
            <div className="card note"><p className="muted">{ready.note} 記録が少ない段階の指標は不確実性が大きいため、傾向として読んでください。</p></div>
          </section>
        ) : view === 'literacy' ? (
          <LiteracyView onOpen={setLessonId} state={state} upd={upd} />
        ) : (
          <SettingsView state={state} upd={upd} />
        )}
        <footer>本アプリはJDLA（日本ディープラーニング協会）の公式アプリではありません。試験制度とシラバスはJDLA公式ページで最新の情報を確認してください。学習記録はこのブラウザ内にのみ保存されます。</footer>
      </main>
    </>
  );
}

function LessonsView({ mode, state, onOpen, upd }: { mode: Mode; state: AppState; onOpen: (id: string) => void; upd: (fn: (s: AppState) => AppState) => void }) {
  const [q, setQ] = useState('');
  const [bmOnly, setBmOnly] = useState(false);
  const syllabus = mode === 'g' ? G_SYLLABUS : LITERACY_SYLLABUS;
  const lessons = publishedLessons.filter((l) => l.mode === mode
    && (!q || l.title.includes(q) || l.keyPoints.some((k) => k.includes(q)) || l.basic.some((p) => p.includes(q)) || l.detail.some((p) => p.includes(q)) || (syllabusById(l.syllabusId)?.chapter.includes(q) ?? false))
    && (!bmOnly || state.bookmarks.includes(`lesson:${l.id}`)));
  const accByField = new Map<string, number>();
  for (const f of fieldStats(state.answers, publishedQuestions)) if (f.accuracy !== null) accByField.set(f.syllabusId, f.accuracy);
  // 学習順序は章カードの並びに反映する（従来は章内の並び替えだけで、章が1教材のため設定が画面に効いていなかった）
  const chapterDone = (id: string) => publishedLessons.filter((l) => l.syllabusId === id).every((l) => state.lessonsDone.includes(l.id));
  const order = state.settings.order;
  const nodes = order === 'weak'
    // 正答率の低い章を先頭へ。未回答の章は判断材料がないため後ろに置く
    ? [...syllabus].sort((a, b) => (accByField.get(a.id) ?? 2) - (accByField.get(b.id) ?? 2) || a.order - b.order)
    : order === 'recommended'
      // 前提順（シラバス順は前提関係を満たす）のまま、未学習の章を先に出す
      ? [...syllabus].sort((a, b) => Number(chapterDone(a.id)) - Number(chapterDone(b.id)) || a.order - b.order)
      : syllabus;
  return (
    <section><h1>{mode === 'g' ? 'G検定 教材' : 'AI教養 教材'}</h1>
      <p className="controls"><label>検索 <input type="search" aria-label="教材を検索" value={q} onChange={(e) => setQ(e.target.value)} placeholder="用語・分野" /></label>{' '}
        <label><input type="checkbox" checked={bmOnly} onChange={(e) => setBmOnly(e.target.checked)} /> ブックマークのみ</label>{' '}
        <label>学習順序 <select value={state.settings.order} onChange={(e) => upd((s) => { s.settings.order = e.target.value as AppState['settings']['order']; return s; })}>
          <option value="syllabus">公式シラバス順</option><option value="recommended">推奨順（未学習を前提順に）</option>
          <option value="weak">弱点優先（分析を参照）</option><option value="free">自由学習（前提表示なし）</option></select></label></p>
      {lessons.length === 0 && <p className="muted" role="status">該当する教材がありません。検索語や「ブックマークのみ」を変えてお試しください。</p>}
      <LessonList items={nodes.flatMap((node) => lessons.filter((l) => l.syllabusId === node.id).map((l) => ({ lesson: l, node })))}
        state={state} onOpen={onOpen} showPrereq={order === 'recommended'} />
    </section>
  );
}

function LessonList({ items, state, onOpen, showPrereq }: { items: { lesson: Lesson; node: SyllabusNode }[]; state: AppState; onOpen: (id: string) => void; showPrereq?: boolean }) {
  return (
    <ul className="lesson-list">
      {items.map(({ lesson: l, node }) => {
        const done = state.lessonsDone.includes(l.id);
        const bm = state.bookmarks.includes(`lesson:${l.id}`);
        return (
          <li key={l.id}><button className="lesson-row" onClick={() => onOpen(l.id)}>
            <span className="ln" aria-hidden="true">{node.order}</span>
            <span className="lt"><b>{l.title}</b><small>{node.title}</small>
              {showPrereq && node.prerequisites.length > 0 && <small>前提：{node.prerequisites.map((p) => syllabusById(p)?.chapter).join('、')}</small>}</span>
            <span className="lm">{bm && <span aria-label="ブックマーク済み">★</span>}{done && <span className="ok">学習済み</span>}</span>
          </button></li>
        );
      })}
    </ul>
  );
}

function LessonView({ lesson, done, onDone, onBack, bookmarked, onBookmark }: { lesson: Lesson; done: boolean; onDone: () => void; onBack: () => void; bookmarked: boolean; onBookmark: () => void }) {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <article><button onClick={onBack}>← 教材一覧へ</button>{' '}
      <button aria-pressed={bookmarked} onClick={onBookmark}>{bookmarked ? '★ ブックマーク済み' : '☆ ブックマーク'}</button>
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

function PracticeView({ questions: liveQuestions, onAnswer, reviewMode }: { mode: Mode; questions: Question[]; onAnswer: (q: Question, sel: number[], sec: number) => boolean; reviewMode?: boolean }) {
  // 復習は画面を開いた時点の期限到来分で出題範囲を固定する。
  // 回答すると次回期限が先へ移り live の一覧から消えるため、固定しないと解説表示中に別の問題へ差し替わる。
  const [reviewQueue] = useState(liveQuestions);
  const questions = reviewMode ? reviewQueue : liveQuestions;
  const [field, setField] = useState('all');
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [started, setStarted] = useState(Date.now());
  const [round, setRound] = useState<{ answered: string[]; correct: number }>({ answered: [], correct: 0 });
  const [shuffleOn, setShuffleOn] = useState(false);
  const [seed, setSeed] = useState(1);
  const pool = useMemo(() => questions.filter((x) => field === 'all' || x.syllabusId === field), [questions, field]);
  const displayPool = useMemo(() => (shuffleOn ? shuffle(pool, seed) : pool), [pool, shuffleOn, seed]);
  const q = displayPool[idx % Math.max(displayPool.length, 1)];
  const resetRound = () => { setIdx(0); setSel([]); setResult(null); setStarted(Date.now()); setRound({ answered: [], correct: 0 }); };
  const fields = [...new Set(questions.map((x) => x.syllabusId))];
  if (questions.length === 0) return <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1><p className="card">現在、対象の問題はありません。{reviewMode ? '復習期限の問題がない状態です。' : ''}</p></section>;
  const toggle = (i: number) => {
    if (result !== null) return;
    setSel((s) => (q.type === 'multi' ? (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]));
  };
  return (
    <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
      {!reviewMode && <p><label>分野 <select value={field} onChange={(e) => { setField(e.target.value); resetRound(); }}>
        <option value="all">全分野</option>{fields.map((f) => <option key={f} value={f}>{syllabusById(f)?.chapter}</option>)}</select></label>{' '}
        <button type="button" className={shuffleOn ? 'primary' : ''} aria-pressed={shuffleOn} onClick={() => { setShuffleOn(!shuffleOn); if (!shuffleOn) setSeed(Date.now()); resetRound(); }}>出題順：{shuffleOn ? 'シャッフル' : '分野順'}</button>{' '}
        {shuffleOn && <button type="button" onClick={() => { setSeed(Date.now()); resetRound(); }}>再シャッフル</button>}</p>}
      {pool.length > 0 && round.answered.length >= pool.length && result === null ? (
        <div className="card"><h2>この範囲を1周しました</h2>
          <p>{pool.length}問中 {round.correct}問正解（{Math.round((round.correct / pool.length) * 100)}%）でした。誤答した問題は復習リストに入っています。</p>
          <button className="primary touch" onClick={() => { setRound({ answered: [], correct: 0 }); setIdx(0); setSel([]); setStarted(Date.now()); }}>もう1周する</button>
        </div>
      ) : q && <div className="card" key={q.id}>
        <p className="muted meta">{syllabusById(q.syllabusId)?.chapter}／難易度{q.difficulty}{q.type === 'multi' ? '／複数選択' : q.type === 'truefalse' ? '／正誤判定' : ''}<span>{round.answered.length}／{pool.length}問</span></p>
        <div className="bar" role="progressbar" aria-valuenow={pool.length ? Math.round((round.answered.length / pool.length) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="この範囲の進捗" style={{ margin: '0 0 10px' }}><i style={{ width: `${pool.length ? (round.answered.length / pool.length) * 100 : 0}%` }} /></div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend><h2 style={{ display: 'inline' }}>{q.stem}</h2></legend>
        {q.choices.map((c, i) => (
          <button key={i} className={`choice touch ${sel.includes(i) ? 'sel' : ''} ${result !== null && q.answer.includes(i) ? 'right' : ''} ${result === false && sel.includes(i) && !q.answer.includes(i) ? 'wrong' : ''}`}
            aria-pressed={sel.includes(i)} aria-disabled={result !== null} onClick={() => toggle(i)}>
            <span className="ctext">{c}{result !== null && <small className="reason">{q.answer.includes(i) ? '正答：' : ''}{q.choiceReasons[i]}</small>}</span></button>
        ))}</fieldset>
        {result === null ? (
          <button className="primary touch" disabled={sel.length === 0} onClick={() => { const c = onAnswer(q, sel, Math.round((Date.now() - started) / 1000)); setResult(c); setRound((r) => ({ answered: [...r.answered, q.id], correct: r.correct + (c ? 1 : 0) })); }}>回答する</button>
        ) : (
          <div role="status">
            <div className="fb" ref={(el) => { if (el && el.dataset.shown !== q.id) { el.dataset.shown = q.id; el.scrollIntoView({ block: 'nearest' }); } }}>
              <p className={result ? 'ok' : 'bad'}><b>{result ? '正解です。' : '不正解です。'}</b></p>
              <button className="primary touch" onClick={() => { setIdx(idx + 1); setSel([]); setResult(null); setStarted(Date.now()); window.scrollTo(0, 0); }}>次の問題</button>
            </div>
            <h3>基礎解説</h3><p>{q.basic}</p>
            <h3>詳細解説</h3><p>{q.detail}</p>
            <p className="muted small">出典：{q.sources.map((s) => s.title).join('、')}／最終検証 {q.verifiedAt}</p>
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
  // 問題数は 1〜30 に丸める（空欄・負数・巨大値で不正な模試や負の制限時間が作られないようにする）
  const safeCount = Math.min(30, Math.max(1, Math.floor(Number.isFinite(count) ? count : 10) || 10));
  // フックは早期returnより前に置く（Hooksのルール）。activeが無い場合は空で計算する。
  const qs = active ? active.questionIds.map((id) => gQuestions.find((x) => x.id === id)!).filter(Boolean) : [];
  const cur = active ? qs[active.current] : undefined;
  const paused = active ? isPaused(active) : false;
  const remain = active ? examRemainingSec(active, Date.now()) : 0;
  const answeredCount = active ? Object.keys(active.answers).length : 0;
  const submitExam = (auto = false) => {
    if (!active) return;
    upd((s) => {
      const e = s.exams.find((x) => x.id === active.id);
      if (!e || e.status !== 'in-progress') return s;
      e.status = 'submitted';
      e.submittedAt = new Date().toISOString();
      const perQ = Math.max(1, Math.round(effectiveElapsedSec(e, Date.now()) / Math.max(1, Object.keys(e.answers).length)));
      for (const qq of qs) { const sel = e.answers[qq.id]; if (sel && sel.length > 0) recordAnswer(s, qq, sel, perQ, 'exam'); }
      return s;
    });
    if (!auto) return;
  };
  // 時間切れで自動提出する（一時停止中は除く）
  useEffect(() => {
    if (active && active.status === 'in-progress' && remain === 0 && !paused) submitExam(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain, paused, active?.status]);
  if (!active) {
    return (
      <section><h1>模擬試験</h1>
        <div className="grid exam-start">
          <div className="card"><h2>フル模試</h2>
            {gQuestions.length >= EXAM_FULL_COUNT ? (
              <><p className="small">{EXAM_FULL_COUNT}問／{modeKind === 'online' ? '100分（オンライン形式）' : '120分（会場形式）'}</p>
                <p className="controls"><label>形式 <select value={modeKind} onChange={(e) => setModeKind(e.target.value as 'online' | 'onsite')}><option value="online">オンライン（100分）</option><option value="onsite">会場（120分）</option></select></label>
                <button className="primary touch" onClick={() => start('full', shuffle(gQuestions, Date.now()).slice(0, EXAM_FULL_COUNT), modeKind === 'online' ? 6000 : 7200)}>開始</button></p></>
            ) : (
              <p role="note">検証済み問題が{gQuestions.length}問のため利用できません（{EXAM_FULL_COUNT}問に達すると有効化）。</p>
            )}
          </div>
          <div className="card"><h2>短縮模試</h2><p className="small">10問／15分</p>
            <button className="primary touch" onClick={() => start('short', shuffle(gQuestions, Date.now() + 7).slice(0, 10), 900)}>開始</button></div>
          <div className="card"><h2>分野別・カスタム</h2>
            <p className="controls"><label>分野 <select value={field} onChange={(e) => setField(e.target.value)}>{G_SYLLABUS.map((s) => <option key={s.id} value={s.id}>{s.chapter}</option>)}</select></label>
              <label>問題数 <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} onBlur={() => setCount(safeCount)} style={{ width: 70 }} /></label></p>
            <p className="controls"><button className="primary touch" onClick={() => { const qs = shuffle(gQuestions.filter((x) => x.syllabusId === field), Date.now() + 13).slice(0, safeCount); start('field', qs, qs.length * 90); }}>分野別を開始</button>
              <button className="touch" onClick={() => { const qs = shuffle(gQuestions, Date.now() + 29).slice(0, safeCount); start('custom', qs, qs.length * 90); }}>カスタム（全分野）</button></p>
          </div>
        </div>
        {lastSubmitted && (() => {
          const rqs = lastSubmitted.questionIds.map((id) => gQuestions.find((x) => x.id === id)!).filter(Boolean);
          const correctCount = rqs.filter((x) => judge(lastSubmitted.answers[x.id] ?? [], x.answer)).length;
          return (
            <div className="card"><h2>直近の結果（{EXAM_KIND_LABEL[lastSubmitted.kind]}）</h2>
              <p>正解 {correctCount}／{rqs.length}問（{rqs.length ? Math.round((correctCount / rqs.length) * 100) : 0}%）／一時停止 {lastSubmitted.pauses.length}回{lastSubmitted.strict ? '' : '（一時停止したため本番条件の完全再現ではありません）'}</p>
              <details className="results"><summary>問題ごとの解説（{rqs.length}問）</summary>
                {rqs.map((x, i) => (
                  <details key={x.id}><summary>問{i + 1}. {judge(lastSubmitted.answers[x.id] ?? [], x.answer) ? '○' : '×'} {x.stem}</summary>
                    <ul>{x.choices.map((c, ci) => <li key={ci}><b>{String.fromCharCode(65 + ci)}.</b> {c}{x.answer.includes(ci) ? '（正答）' : ''}{(lastSubmitted.answers[x.id] ?? []).includes(ci) ? '（あなたの回答）' : ''}<br /><span className="muted small">{x.choiceReasons[ci]}</span></li>)}</ul>
                    <p>{x.basic}</p><p>{x.detail}</p>
                  </details>
                ))}
              </details>
            </div>
          );
        })()}
        <p className="muted small">解説は提出後に表示されます。一時停止せずにページを閉じても、その間の時間は経過します（本番と同じ扱い）。一時停止した回は本番条件とは区別して記録されます。</p>
      </section>
    );
  }
  return (
    <section><h1>模擬試験（{EXAM_KIND_LABEL[active.kind]}）</h1>
      <div className="card">
        <p>残り時間 <b role="timer" aria-label={`残り${Math.floor(remain / 60)}分${remain % 60}秒`}>{Math.floor(remain / 60)}:{String(remain % 60).padStart(2, '0')}</b>／回答 {answeredCount}／{qs.length}問{paused ? '／一時停止中' : ''}／一時停止 {active.pauses.length}回</p>
        {remain === 0 && <p role="alert" className="bad">制限時間に達したため自動提出します。</p>}
        <div className="bar" aria-hidden="true"><i style={{ width: `${(answeredCount / qs.length) * 100}%` }} /></div>
        {cur && <>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend><h2 style={{ display: 'inline' }}>問{active.current + 1}. {cur.stem}</h2></legend>
          {cur.choices.map((c, i) => {
            const sel = active.answers[cur.id] ?? [];
            return <button key={i} className={`choice touch ${sel.includes(i) ? 'sel' : ''}`} aria-pressed={sel.includes(i)}
              disabled={paused || remain === 0}
              onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; const next = cur.type === 'multi' ? (sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]) : [i]; if (next.length) e.answers[cur.id] = next; else delete e.answers[cur.id]; return s; })}>
              <span>{c}</span></button>;
          })}</fieldset>
        </>}
        <p>
          <button disabled={active.current === 0} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current -= 1; return s; })}>前へ</button>{' '}
          <button disabled={active.current >= qs.length - 1} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current += 1; return s; })}>次へ</button>{' '}
          <button aria-pressed={cur ? active.flags.includes(cur.id) : false} onClick={() => cur && upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.flags = e.flags.includes(cur.id) ? e.flags.filter((f) => f !== cur.id) : [...e.flags, cur.id]; return s; })}>見直しフラグ</button>{' '}
          {paused
            ? <button className="primary" onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; const p = e.pauses.find((x) => !x.resumedAt); if (p) p.resumedAt = new Date().toISOString(); e.strict = false; return s; })}>再開</button>
            : <button onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.pauses.push({ at: new Date().toISOString() }); e.strict = false; return s; })}>一時停止</button>}{' '}
          <button onClick={() => { if (confirm(`未回答 ${qs.length - answeredCount}問があります。提出しますか？`)) submitExam(false); }}>提出する</button>
        </p>
        <details className="qindex" open={qs.length <= 30}>
          <summary>問題一覧（未回答 {qs.length - answeredCount}問／見直し {active.flags.length}問）</summary>
          <div className="qgrid">{qs.map((x, i) => <button key={x.id} aria-current={i === active.current} aria-label={`問${i + 1}${active.answers[x.id] ? ' 回答済み' : ' 未回答'}${active.flags.includes(x.id) ? ' 見直し' : ''}`} className={active.answers[x.id] ? 'done' : ''} onClick={() => upd((s) => { s.exams.find((e2) => e2.id === active.id)!.current = i; return s; })}>{i + 1}{active.flags.includes(x.id) ? '⚑' : ''}</button>)}</div>
        </details>
      </div>
    </section>
  );
}

function LiteracyView({ onOpen, state, upd }: { onOpen: (id: string) => void; state: AppState; upd: (fn: (s: AppState) => AppState) => void }) {
  const [tab, setTab] = useState<'lessons' | 'exercises' | 'models' | 'news'>('lessons');
  return (
    <section><h1>AI教養</h1>
      <div role="group" aria-label="AI教養の表示切替" className="seg tabs">
        {([['lessons', '教材'], ['exercises', '実践演習'], ['models', 'モデル比較'], ['news', 'ニュース']] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? 'primary' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'lessons' && <LessonList items={LITERACY_SYLLABUS.flatMap((node) => publishedLessons.filter((l) => l.syllabusId === node.id).map((l) => ({ lesson: l, node })))} state={state} onOpen={onOpen} />}
      {tab === 'exercises' && <div className="stack-list">{EXERCISES.map((ex) => {
        const checked = state.exerciseChecks[ex.id] ?? [];
        return (
          <details key={ex.id} className="card ex">
            <summary><b>{ex.title}</b><span className="muted">達成 {checked.length}／{ex.rubric.length}</span></summary>
            <p>{ex.background}</p><p><b>到達目標：</b>{ex.goal}</p>
            <p><b>制約：</b>{ex.constraints.join('／')}</p>
            <h3>実施手順</h3><ol>{ex.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <h3>評価ルーブリック（自己評価：自動採点ではありません）</h3>
            {ex.rubric.map((r, i) => <p key={r}><label><input type="checkbox" checked={checked.includes(i)} onChange={() => upd((s) => { const cur = s.exerciseChecks[ex.id] ?? []; s.exerciseChecks[ex.id] = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]; return s; })} /> {r}</label></p>)}
            <p><b>模範的な考え方：</b>{ex.modelThinking}</p>
            <p><b>失敗例：</b>{ex.failureExample}</p>
            <p><b>改善例：</b>{ex.improvementExample}</p>
            <p className="muted small">参考：{ex.sources.map((s) => s.title).join('、')}</p>
          </details>
        );
      })}</div>}
      {tab === 'models' && (
        <div>
          <div className="grid models">{MODEL_INFOS.map((m) => (
            <article key={m.id} className="card">
              <h2><a href={m.source.url} target="_blank" rel="noreferrer">{m.name}</a></h2>
              <p className="muted small">{m.vendor}／{m.asOf} 確認</p>
              <p><b>主なモデル：</b>{m.lineup}</p>
              <p><b>適した用途：</b>{m.bestFor}</p>
              <details><summary>強み・制約・料金・プライバシー</summary>
                <dl className="kv"><dt>強み</dt><dd>{m.strengths}</dd><dt>制約</dt><dd>{m.limits}</dd><dt>料金</dt><dd>{m.pricingNote}</dd><dt>プライバシー</dt><dd>{m.privacyNote}</dd></dl>
              </details>
            </article>
          ))}</div>
          <p className="muted small">比較の評価軸：文章生成／推論／数学／プログラミング／情報検索／長文処理／画像理解／音声処理／マルチモーダル対応／エージェント用途／日本語能力／処理速度／料金／利用制限／プライバシー／セキュリティ／信頼性／用途適性。ベンチマークの数字は評価方法・評価日時・モデルの版を記録し、自タスクでの実測と組み合わせて読みます。性能の絶対的な序列は示しません。料金・機能は変わるため、利用前に各公式ページで確認してください。</p>
        </div>
      )}
      {tab === 'news' && (
        <div className="stack-list">
          {NEWS_ITEMS.map((n, i) => (
            <details key={n.id} className="card news" open={i === 0}>
              <summary><span className="muted small">{n.date}／{n.category}{n.importance === 'major' ? <b className="major">超重要</b> : null}</span><b className="nt">{n.title}</b></summary>
              <p>{n.summary}</p>
              {n.incorporated && <p><b>学習への取り込み：</b>{n.incorporated}</p>}
              <p className="muted small">出典：<a href={n.source.url} target="_blank" rel="noreferrer">{n.source.title}</a></p>
            </details>
          ))}
          <p className="muted small">公式発表・公的機関などの一次情報だけを、3日に1回程度の頻度で確認して追加しています（最終取り込み：{NEWS_LAST_ADDED}）。超重要なものは内容を確認したうえで問題や教材にも取り込みます。</p>
        </div>
      )}
    </section>
  );
}

function SettingsView({ state, upd }: { state: AppState; upd: (fn: (s: AppState) => AppState) => void }) {
  const [msg, setMsg] = useState('');
  const [dataMsg, setDataMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = state.settings;
  return (
    <section><h1>設定・更新</h1>
      <div className="card"><h2>表示設定</h2>
        <p><label>テーマ <select value={set.theme} onChange={(e) => upd((s) => { s.settings.theme = e.target.value as 'light' | 'dark'; return s; })}><option value="light">ライト</option><option value="dark">ダーク</option></select></label>{' '}
          <label>文字サイズ <select value={set.fontSize} onChange={(e) => upd((s) => { s.settings.fontSize = e.target.value as 's' | 'm' | 'l'; return s; })}><option value="s">小</option><option value="m">中</option><option value="l">大</option></select></label>{' '}
          <label>表示密度 <select value={set.density} onChange={(e) => upd((s) => { s.settings.density = e.target.value as 'comfortable' | 'compact'; return s; })}><option value="comfortable">標準</option><option value="compact">コンパクト</option></select></label></p>
        <p><label><input type="checkbox" checked={set.reduceMotion} onChange={(e) => upd((s) => { s.settings.reduceMotion = e.target.checked; return s; })} /> アニメーションを抑制する</label></p>
        <p><label>1日の学習目標（分） <input type="number" min={5} max={180} value={state.dailyGoalMin} onChange={(e) => { const v = e.target.valueAsNumber; if (Number.isFinite(v)) upd((s) => { s.dailyGoalMin = clampGoal(v); return s; }); }} style={{ width: 80 }} /></label></p>
      </div>
      <div className="card"><h2>教材の更新</h2>
        <button className="primary touch" disabled={busy} onClick={async () => { setBusy(true); const r = await checkUpdate(BUNDLED_CONTENT_VERSION); setMsg(r.message); upd((s) => { s.lastUpdateCheck = { at: new Date().toISOString(), result: r.status }; return s; }); setBusy(false); }}>教材の更新を確認</button>
        {msg && <p role="status">{msg}</p>}
        <p className="muted">現在の教材：{BUNDLED_CONTENT_VERSION}（このアプリに同梱）／シラバス：G2024#6以降適用版／試験制度：オンライン100分・会場120分、各145問程度（いずれもJDLA公式で{SYLLABUS_VERIFIED_AT}確認）。新しい版は再読み込みで反映され、学習記録は保持されます。</p>
      </div>
      <div className="card"><h2>学習記録の管理</h2>
        <p><button onClick={() => { const blob = new Blob([exportState(state)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `ai-learning-backup-${todayStr()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>記録をエクスポート（JSON）</button>{' '}
          <label className="filebtn">記録を読み込む<input type="file" accept="application/json,.json" onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (!f) return;
            const text = await f.text();
            const next = parseState(text);
            const valid = (() => { try { const p = JSON.parse(text) as { schemaVersion?: unknown }; return p.schemaVersion === 1; } catch { return false; } })();
            if (!valid) { setDataMsg('読み込めませんでした。このアプリでエクスポートしたJSONファイルを選んでください。現在の記録は変更していません。'); return; }
            if (confirm(`回答 ${next.answers.length}件・模試 ${next.exams.length}件の記録で、現在の記録（回答 ${state.answers.length}件）を置き換えますか？`)) { upd(() => next); setDataMsg('学習記録を読み込みました。'); }
          }} /></label>{' '}
          <button onClick={() => { if (confirm('学習記録をすべて初期化しますか？この操作は元に戻せません。')) upd(() => defaultState()); }}>記録を初期化</button></p>
        {dataMsg && <p role="status">{dataMsg}</p>}
        <p className="muted">学習記録はこのブラウザ内にのみ保存され、外部には送信されません。ブラウザのデータ削除や端末の故障で失われるため、定期的なエクスポートをおすすめします。</p>
      </div>
    </section>
  );
}
