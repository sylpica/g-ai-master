import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, CardDirection, CardGrade, ExamSession, Flashcard, Lesson, Mode, Question, SyllabusNode } from './types';
import { G_SYLLABUS, LITERACY_SYLLABUS, PASSPORT_SYLLABUS, SYLLABUS_VERIFIED_AT, PASSPORT_SYLLABUS_VERIFIED_AT, syllabusById } from './data/syllabus';
import { publishedLessons } from './data/lessons';
import { publishedQuestions } from './data/questions';
import { publishedFlashcards } from './data/flashcards';
import { LESSON_VISUAL_IDS } from './data/lessonVisuals';
import { DETAIL_ILLUSTRATIONS, ILLUSTRATIONS } from './data/illustrations';
import { EXERCISES, MODEL_INFOS } from './data/exercises';
import { NEWS_ITEMS, NEWS_LAST_ADDED } from './data/news';
import { loadState, saveState, exportState, defaultState, salvageState, validateImport, clampGoal, BACKUP_KEY } from './lib/storage';
import { judge, todayStr } from './lib/scoring';
import { nextReview, dueCards } from './lib/review';
import { nextCardReview, dueFlashcards, weakCardIds, cardStats } from './lib/cards';
import { fieldStats, readiness, examSessionStats } from './lib/analysis';
import { checkUpdate, BUNDLED_CONTENT_VERSION } from './lib/update';
import { remainingSec as examRemainingSec, effectiveElapsedSec, isPaused } from './lib/exam';
import { mulberry32, randomSeed, shuffled, permutation } from './lib/random';
import { parseHash, routeHash, type Route } from './lib/router';
import { LessonVisuals, TermText, useScrollTop, pct, chapterName } from './components/ui';

const EXAM_FULL_COUNT = 145;
const EXAM_KIND_LABEL: Record<ExamSession['kind'], string> = { full: 'フル', short: '短縮', field: '分野別', custom: 'カスタム' };
const MODE_LABEL: Record<Mode, string> = { g: 'G検定', literacy: 'AI教養', passport: '生成AIパスポート' };
const syllabusFor = (m: Mode) => (m === 'g' ? G_SYLLABUS : m === 'passport' ? PASSPORT_SYLLABUS : LITERACY_SYLLABUS);
/** 要点まとめPDFは配信経路の制約で Base64 テキストとして同梱し、開くときに復元して表示する */
const SUMMARY_PDF_B64: Record<Mode, string> = {
  g: `${import.meta.env.BASE_URL}pdf64/g-summary.b64`,
  passport: `${import.meta.env.BASE_URL}pdf64/passport-summary.b64`,
  literacy: `${import.meta.env.BASE_URL}pdf64/literacy-summary.b64`,
};
/** 同梱イメージ図（Base64）を復元して表示する画像。復元結果はモジュール内でキャッシュする */
const bundledImageCache = new Map<string, Promise<string>>();
const loadBundledImage = (lessonId: string): Promise<string> => {
  const hit = bundledImageCache.get(lessonId);
  if (hit) return hit;
  const p = (async () => {
    // Blob URLは環境により画像として復号できない場合があるため、data URIで渡す
    const text = await (await fetch(`${import.meta.env.BASE_URL}img64/${lessonId}.b64`)).text();
    return `data:image/webp;base64,${text.replace(/\s+/g, '')}`;
  })();
  bundledImageCache.set(lessonId, p);
  return p;
};
function LessonIllustration({ lessonId, variant = 'basic' }: { lessonId: string; variant?: 'basic' | 'detail' }) {
  const meta = variant === 'detail' ? DETAIL_ILLUSTRATIONS[lessonId] : ILLUSTRATIONS[lessonId];
  const fileKey = variant === 'detail' ? `${lessonId}-d` : lessonId;
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (meta) loadBundledImage(fileKey).then((u) => { if (alive) setSrc(u); }).catch(() => undefined);
    return () => { alive = false; };
  }, [lessonId, meta, fileKey]);
  if (!meta) return null;
  return (
    <figure className="lesson-fig">
      {src
        ? <img src={src} alt={meta.alt} width={1152} height={648} />
        : <div className="lesson-fig-ph" role="img" aria-label={meta.alt}>イメージ図を読み込み中…</div>}
      <figcaption>{meta.caption}</figcaption>
    </figure>
  );
}
const openSummaryPdf = async (mode: Mode) => {
  const w = window.open('', '_blank'); // ポップアップブロック回避のため先に空タブを開く
  try {
    const text = await (await fetch(SUMMARY_PDF_B64[mode])).text();
    const bin = atob(text.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    if (w) w.location.href = url; else window.location.href = url;
  } catch { if (w) w.close(); }
};
/** 問題の解説に添える関連図表：その問題の概念に紐づく単語カードの教材の図表を優先し、なければ同章の教材の図表 */
const explanationVisualIdsFor = (q: Question, cap: number): string[] => {
  const card = publishedFlashcards.find((c) => c.conceptId === q.id) ?? publishedFlashcards.find((c) => c.questionIds.includes(q.id));
  const ids: string[] = [];
  if (card?.lessonId) ids.push(...(LESSON_VISUAL_IDS[card.lessonId] ?? []));
  if (ids.length < cap) {
    const lesson = publishedLessons.find((l) => l.syllabusId === q.syllabusId && l.mode === q.mode);
    if (lesson) ids.push(...(LESSON_VISUAL_IDS[lesson.id] ?? []));
  }
  return [...new Set(ids)].slice(0, cap);
};
/** 試験対策モード（模試・到達判定を持つ）かどうか。AI教養のみ演習型で模試を持たない */
const isExamMode = (m: Mode) => m !== 'literacy';
const GRADE_LABEL: Record<CardGrade, string> = { known: '覚えた', fuzzy: 'あいまい', unknown: '覚えていない' };

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const initial = useRef(loadState());
  const [state, setState] = useState<AppState>(initial.current.state);
  const [loadIssue, setLoadIssue] = useState(initial.current.loadIssue);
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const nav = (r: Route) => { const h = routeHash(r); if (window.location.hash === h) setRoute(r); else window.location.hash = h; };

  // 破損データの復旧判断が済むまでは自動保存しない（初期値で上書きして原本を失わないため）
  const protectSave = loadIssue !== null;
  useEffect(() => {
    if (protectSave) return;
    const r = saveState(state);
    setSaveErr(r.ok ? '' : `保存に失敗しました：${r.error ?? ''}（容量不足の可能性があります。記録のエクスポートをおすすめします）`);
  }, [state, protectSave]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.font = state.settings.fontSize;
    document.documentElement.dataset.density = state.settings.density;
    document.documentElement.dataset.motion = state.settings.reduceMotion ? 'reduce' : '';
  }, [state.settings]);
  useEffect(() => {
    if (state.contentVersion !== BUNDLED_CONTENT_VERSION) setState((s) => ({ ...s, contentVersion: BUNDLED_CONTENT_VERSION }));
  }, [state.contentVersion]);

  // 起動時に最初に開くモード（設定）はマウント時に一度だけ適用する。教材・単語帳への深いリンクは、その内容のモードを優先する
  const startModeApplied = useRef(false);
  useEffect(() => {
    if (startModeApplied.current) return;
    startModeApplied.current = true;
    const linked = route.name === 'lesson' ? publishedLessons.find((l) => l.id === (route as { id: string }).id)
      : route.name === 'card' ? publishedFlashcards.find((c) => c.id === (route as { id: string }).id) : undefined;
    const target = linked ? linked.mode : initial.current.state.settings.startMode;
    if (target && target !== initial.current.state.mode) setState((s) => ({ ...s, mode: target }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upd = (fn: (s: AppState) => AppState) => setState((s) => fn(structuredClone(s)));
  const questions = publishedQuestions;
  const modeQuestions = useMemo(() => questions.filter((x) => x.mode === state.mode), [questions, state.mode]);
  const modeQuestionIds = useMemo(() => new Set(modeQuestions.map((x) => x.id)), [modeQuestions]);
  const due = dueCards(state.review).filter((c) => modeQuestionIds.has(c.questionId));
  const modeCards = useMemo(() => publishedFlashcards.filter((c) => c.mode === state.mode), [state.mode]);
  const cardDue = dueFlashcards(state.cardReview).filter((c) => modeCards.some((x) => x.id === c.cardId));
  const modeAnswers = state.answers.filter((a) => modeQuestionIds.has(a.questionId));
  const stats = fieldStats(modeAnswers, questions);
  const modeLessons = publishedLessons.filter((l) => l.mode === state.mode);
  const modeLessonsDone = state.lessonsDone.filter((id) => modeLessons.some((l) => l.id === id));
  const syllabus = syllabusFor(state.mode);
  const ready = readiness(modeAnswers, modeLessonsDone, modeLessons.length, isExamMode(state.mode) ? state.exams.filter((e) => e.mode === state.mode) : [], questions, syllabus.length, Math.min(150, Math.ceil(modeQuestions.length / 2)));
  const examMode = isExamMode(state.mode);
  const activeExam = state.exams.find((e) => e.status === 'in-progress' && e.mode === state.mode);
  useScrollTop([route.name, route.name === 'lesson' || route.name === 'card' ? route.id : '']);

  /** 正誤は judge で同期判定し、UI・記録・復習へ同じ結果を渡す（非同期の状態更新からは結果を取り出さない） */
  const recordAnswer = (q: Question, selected: number[], seconds: number, context: 'practice' | 'exam' | 'review'): boolean => {
    const correct = judge(selected, q.answer);
    upd((s) => {
      const firstSeen = !s.answers.some((a) => a.questionId === q.id);
      s.answers.push({ questionId: q.id, selected, correct, at: new Date().toISOString(), seconds, firstSeen, context });
      s.review[q.id] = nextReview(s.review[q.id], q.id, correct);
      return s;
    });
    return correct;
  };
  const toggleBookmark = (key: string) => upd((s) => { s.bookmarks = s.bookmarks.includes(key) ? s.bookmarks.filter((b) => b !== key) : [...s.bookmarks, key]; return s; });
  const gradeCard = (cardId: string, grade: CardGrade) => upd((s) => { s.cardReview[cardId] = nextCardReview(s.cardReview[cardId], cardId, grade); return s; });
  const setMode = (m: Mode) => { upd((s) => { s.mode = m; return s; }); };
  const openLesson = (id: string) => { const l = publishedLessons.find((x) => x.id === id); if (l && l.mode !== state.mode) setMode(l.mode); nav({ name: 'lesson', id }); };
  const openCard = (id: string) => { const c = publishedFlashcards.find((x) => x.id === id); if (c && c.mode !== state.mode) setMode(c.mode); nav({ name: 'card', id }); };
  const practiceWith = (opts: { field?: string; text?: string; weak?: boolean }) => {
    try {
      if (opts.field) sessionStorage.setItem('g-ai:practiceField', opts.field); else sessionStorage.removeItem('g-ai:practiceField');
      if (opts.text) sessionStorage.setItem('g-ai:practiceText', opts.text); else sessionStorage.removeItem('g-ai:practiceText');
      if (opts.weak) sessionStorage.setItem('g-ai:practiceWeak', '1'); else sessionStorage.removeItem('g-ai:practiceWeak');
      sessionStorage.removeItem(`g-ai:practice-session:${state.mode}:practice`); // 条件を指定して開くときは、前のセットではなく条件選択から始める
    } catch { /* 保存できなくても演習自体は開ける */ }
    nav({ name: 'practice' });
  };

  const navItems: { route: Route; label: string; badge?: number; match: string[] }[] = [
    { route: { name: 'home' }, label: 'ホーム', match: ['home'] },
    { route: examMode ? { name: 'lessons' } : { name: 'literacy' }, label: '教材', match: ['lessons', 'lesson', 'literacy', 'syllabus'] },
    { route: { name: 'cards' }, label: '単語帳', badge: cardDue.length || undefined, match: ['cards', 'card'] },
    { route: { name: 'practice' }, label: '演習', match: ['practice'] },
    ...(examMode ? [{ route: { name: 'exam' } as Route, label: '模試', match: ['exam'] }] : []),
    { route: { name: 'review' }, label: '復習', badge: due.length || undefined, match: ['review'] },
    { route: { name: 'analysis' }, label: '分析', match: ['analysis'] },
    { route: { name: 'settings' }, label: '設定', match: ['settings'] },
  ];
  const lesson = route.name === 'lesson' ? publishedLessons.find((l) => l.id === route.id) : undefined;

  return (
    <>
      <a href="#main" className="skip">本文へスキップ</a>
      <header className="top"><div className="wrap">
        <div className="top-in">
          <span className="logo">AI総合マスター</span>
          <div role="group" aria-label="学習モード" className="seg">
            <button className={state.mode === 'g' ? 'primary' : ''} aria-pressed={state.mode === 'g'} onClick={() => { setMode('g'); nav({ name: 'home' }); }}>G検定取得</button>
            <button className={state.mode === 'passport' ? 'primary' : ''} aria-pressed={state.mode === 'passport'} onClick={() => { setMode('passport'); nav({ name: 'home' }); }}>生成AIパスポート</button>
            <button className={state.mode === 'literacy' ? 'primary' : ''} aria-pressed={state.mode === 'literacy'} onClick={() => { setMode('literacy'); nav({ name: 'home' }); }}>AI教養</button>
          </div>
          <nav className="main" aria-label="主要メニュー" style={{ '--n': navItems.length } as React.CSSProperties}>
            {navItems.map((n) => (
              <button key={n.label} aria-current={n.match.includes(route.name) ? 'page' : undefined}
                aria-label={n.badge ? `${n.label}（${n.badge}件）` : undefined} onClick={() => nav(n.route)}>
                {n.label}{n.badge ? <span className="badge" aria-hidden="true">{n.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </div></header>
      <main id="main" className="wrap">
        {saveErr && <p role="alert" className="bad">{saveErr}</p>}
        {loadIssue && (
          <div className="card" role="alert">
            <h2>保存されていた学習記録を読み込めませんでした</h2>
            <p>{loadIssue.notes.join('／')}。元のデータは消さずに退避しました。下のいずれかを選ぶまで、この画面の変更は保存されません。</p>
            <p className="controls">
              <button onClick={() => download(`ai-learning-corrupt-backup-${todayStr()}.json`, loadIssue.raw)}>退避データをダウンロード</button>
              <button onClick={() => { const s = salvageState(loadIssue.raw); if (s) { setState(s); setLoadIssue(null); } }}>読み取れる部分だけ復旧する</button>
              <button onClick={() => setLoadIssue(null)}>初期状態で始める</button>
            </p>
          </div>
        )}
        {route.name === 'home' && (
          <HomeView examMode={examMode} mode={state.mode} ready={ready} dueCount={due.length} cardDueCount={cardDue.length}
            lessonsDone={modeLessonsDone.length} lessonsTotal={modeLessons.length} answersCount={modeAnswers.length}
            examsSubmitted={state.exams.filter((e) => e.status === 'submitted' && e.mode === state.mode).length} activeExam={activeExam}
            exercisesDone={Object.values(state.exerciseChecks).filter((v) => v.length > 0).length} exercisesTotal={EXERCISES.length}
            answers={state.answers} dailyGoalMin={state.dailyGoalMin} stats={stats} contentVersion={state.contentVersion}
            lastUpdateCheck={state.lastUpdateCheck} nav={nav} />
        )}
        {(route.name === 'lessons' || (route.name === 'literacy' && false)) && (
          <LessonsView mode={state.mode} state={state} onOpen={openLesson} upd={upd} onSyllabus={() => nav({ name: 'syllabus' })} />
        )}
        {route.name === 'lesson' && (lesson ? (
          <LessonView lesson={lesson} state={state} onBack={() => nav(examMode ? { name: 'lessons' } : { name: 'literacy' })}
            onBookmark={() => toggleBookmark(`lesson:${lesson.id}`)}
            onDone={() => upd((s) => { if (!s.lessonsDone.includes(lesson.id)) s.lessonsDone.push(lesson.id); return s; })}
            onOpenCard={openCard} onPracticeChapter={(sid) => practiceWith({ field: sid })} onSyllabus={() => nav({ name: 'syllabus' })} />
        ) : <p className="card">教材が見つかりませんでした。</p>)}
        {route.name === 'syllabus' && <SyllabusView mode={state.mode} state={state} onOpenLesson={openLesson} onOpenCards={() => nav({ name: 'cards' })} onPracticeChapter={(sid) => practiceWith({ field: sid })} />}
        {route.name === 'practice' && (
          <PracticeView key={`practice-${state.mode}`} mode={state.mode} questions={modeQuestions} answers={modeAnswers}
            bookmarks={state.bookmarks} onBookmark={(id) => toggleBookmark(`q:${id}`)}
            onAnswer={(q, sel, sec) => recordAnswer(q, sel, sec, 'practice')}
            prefs={state.practicePrefs} onPrefs={(p) => upd((s) => { s.practicePrefs = p; return s; })}
            onOpenLesson={openLesson} onOpenCard={openCard} />
        )}
        {route.name === 'review' && (
          <PracticeView key={`review-${state.mode}`} mode={state.mode} reviewMode
            questions={modeQuestions.filter((x) => due.some((d) => d.questionId === x.id))}
            answers={modeAnswers} bookmarks={state.bookmarks} onBookmark={(id) => toggleBookmark(`q:${id}`)}
            onAnswer={(q, sel, sec) => recordAnswer(q, sel, sec, 'review')} onPracticeWrong={() => practiceWith({ weak: true })}
            prefs={state.practicePrefs} onPrefs={(p) => upd((s) => { s.practicePrefs = p; return s; })}
            onOpenLesson={openLesson} onOpenCard={openCard} />
        )}
        {(route.name === 'cards' || route.name === 'card') && (
          <FlashcardsView key={`cards-${state.mode}`} mode={state.mode} cards={modeCards} cardReview={state.cardReview}
            bookmarks={state.bookmarks} onBookmark={(id) => toggleBookmark(`card:${id}`)} onGrade={gradeCard}
            direction={state.cardDirection} onDirection={(d) => upd((s) => { s.cardDirection = d; return s; })}
            focusCardId={route.name === 'card' ? route.id : undefined}
            onOpenLesson={openLesson} onPracticeQuestion={(qid) => practiceWith({ text: qid })} />
        )}
        {route.name === 'exam' && (examMode
          ? <ExamView state={state} mode={state.mode} questions={modeQuestions} syllabus={syllabus} upd={upd} onOpenLesson={openLesson} />
          : <p className="card">模擬試験は試験対策モード（G検定／生成AIパスポート）の機能です。</p>)}
        {route.name === 'analysis' && (
          <AnalysisView mode={state.mode} examMode={examMode} ready={ready} stats={stats} exams={state.exams} questions={questions}
            cardReview={state.cardReview} cardsTotal={modeCards.length} nav={nav} onPracticeChapter={(sid) => practiceWith({ field: sid })} />
        )}
        {route.name === 'literacy' && (
          <LiteracyView mode={state.mode} state={state} upd={upd} onOpenLesson={openLesson} onSyllabus={() => nav({ name: 'syllabus' })} />
        )}
        {route.name === 'settings' && <SettingsView state={state} upd={upd} setState={setState} />}
        <footer>本アプリはJDLA（日本ディープラーニング協会）およびGUGA（生成AI活用普及協会）の公式アプリではありません。試験制度とシラバスは各公式ページで最新の情報を確認してください。学習記録はこのブラウザ内にのみ保存されます。</footer>
      </main>
    </>
  );
}

function HomeView(props: {
  examMode: boolean; mode: Mode; ready: ReturnType<typeof readiness>; dueCount: number; cardDueCount: number;
  lessonsDone: number; lessonsTotal: number; answersCount: number; examsSubmitted: number; activeExam?: ExamSession;
  exercisesDone: number; exercisesTotal: number; answers: AppState['answers']; dailyGoalMin: number;
  stats: ReturnType<typeof fieldStats>; contentVersion: string; lastUpdateCheck?: AppState['lastUpdateCheck'];
  nav: (r: Route) => void;
}) {
  const { ready, nav } = props;
  const next = props.activeExam
    ? { title: '中断中の模擬試験があります', body: `${EXAM_KIND_LABEL[props.activeExam.kind]}／${props.activeExam.questionIds.length}問／回答 ${Object.keys(props.activeExam.answers).length}問`, label: '再開する', route: { name: 'exam' } as Route }
    : props.dueCount > 0
      ? { title: `復習が${props.dueCount}問たまっています`, body: '期限の来た問題から解きましょう。', label: '復習をはじめる', route: { name: 'review' } as Route }
      : props.cardDueCount > 0
        ? { title: `単語帳の復習が${props.cardDueCount}枚あります`, body: '期限の来たカードを確認しましょう。', label: '単語帳を開く', route: { name: 'cards' } as Route }
        : props.lessonsDone < props.lessonsTotal
          ? { title: '教材の続きを学びましょう', body: `${MODE_LABEL[props.mode]}の教材 ${props.lessonsDone}／${props.lessonsTotal} 件が学習済みです。`, label: '教材を開く', route: (props.examMode ? { name: 'lessons' } : { name: 'literacy' }) as Route }
          : props.answersCount < 20
            ? { title: '演習でアウトプットしましょう', body: '教材は一通り学習済みです。演習で初見正答率を測りましょう。', label: '演習をはじめる', route: { name: 'practice' } as Route }
            : props.examMode
              ? { title: '模擬試験に挑戦しましょう', body: '本番形式で時間配分と弱点を確認できます。', label: '模擬試験を開く', route: { name: 'exam' } as Route }
              : { title: '実践演習に取り組みましょう', body: '学んだ内容を実際の作業で試し、ルーブリックで自己評価します。', label: '実践演習を開く', route: { name: 'literacy' } as Route };
  const today = todayStr();
  const todays = props.answers.filter((a) => todayStr(new Date(a.at)) === today);
  const min = Math.round(todays.reduce((acc, a) => acc + (a.seconds || 0), 0) / 60);
  return (
    <section className="home">
      <h1>{props.mode === 'g' ? 'G検定取得' : MODE_LABEL[props.mode]} ダッシュボード</h1>
      <div className="card next"><div><h2>{next.title}</h2><p>{next.body}</p></div><button className="primary touch" onClick={() => nav(next.route)}>{next.label}</button></div>
      <ol className="flow" aria-label="学習の流れ">
        <li><button onClick={() => nav(props.examMode ? { name: 'lessons' } : { name: 'literacy' })}><b>教材</b><span>{props.lessonsDone}／{props.lessonsTotal}件</span></button></li>
        <li><button onClick={() => nav({ name: 'cards' })}><b>単語帳</b><span>期限 {props.cardDueCount}枚</span></button></li>
        <li><button onClick={() => nav({ name: 'practice' })}><b>演習</b><span>回答 {props.answersCount}問</span></button></li>
        <li><button onClick={() => nav({ name: 'review' })}><b>復習</b><span>期限 {props.dueCount}問</span></button></li>
        {props.examMode
          ? <li><button onClick={() => nav({ name: 'exam' })}><b>模擬試験</b><span>提出 {props.examsSubmitted}回</span></button></li>
          : <li><button onClick={() => nav({ name: 'literacy' })}><b>実践演習</b><span>{props.exercisesDone}／{props.exercisesTotal}件</span></button></li>}
      </ol>
      <div className="card">
        <div className="kpi">
          <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
          <div>全体正答率<b>{pct(ready.overallAccuracy)}</b></div>
          <div>教材の網羅<b>{pct(ready.coverage)}</b></div>
        </div>
        <div className="today">
          <p>今日 {todays.length}問・約{min}分<span>目標 {props.dailyGoalMin}分</span></p>
          <div className="bar" role="progressbar" aria-valuenow={Math.min(100, Math.round((min / Math.max(props.dailyGoalMin, 1)) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label="今日の学習目標の進捗">
            <i style={{ width: `${Math.min(100, (min / Math.max(props.dailyGoalMin, 1)) * 100)}%` }} /></div>
        </div>
      </div>
      {props.stats.length > 0 && <div className="card"><h2>弱点分野（正答率の低い順）</h2>
        <ul>{props.stats.slice(0, 3).map((f) => <li key={f.syllabusId}>{chapterName(f.syllabusId)}：{pct(f.accuracy)}（{f.total}問）</li>)}</ul>
      </div>}
      <div className="card note">
        {props.examMode && <p className="muted">{ready.note}</p>}
        {props.examMode && (ready.reached
          ? <p className="ok">到達基準（初見の問題数・初見正答率95%以上・章カバー80%以上・模試3回以上で95%以上）を満たしています。</p>
          : <p className="muted">到達まで：{ready.unmet.join('／')}</p>)}
        <p>教材バージョン：{props.contentVersion}{props.lastUpdateCheck ? `／最終確認：${props.lastUpdateCheck.at.slice(0, 10)}（${props.lastUpdateCheck.result}）` : ''}{' '}
          <button onClick={() => nav({ name: 'settings' })}>更新を確認</button></p>
      </div>
    </section>
  );
}

function SyllabusView({ mode, state, onOpenLesson, onOpenCards, onPracticeChapter }: { mode: Mode; state: AppState; onOpenLesson: (id: string) => void; onOpenCards: () => void; onPracticeChapter: (sid: string) => void }) {
  const nodes = syllabusFor(mode);
  return (
    <section><h1>シラバス（{MODE_LABEL[mode]}）</h1>
      <p className="muted small">{mode === 'g' ? `公式シラバス：${SYLLABUS_VERIFIED_AT}確認` : mode === 'passport' ? `公式シラバス（2027年2月試験より適用）：${PASSPORT_SYLLABUS_VERIFIED_AT}確認` : 'AI教養の学習項目'}。章から教材・演習・単語帳へ進めます。</p>
      <div className="stack-list">
        {nodes.map((node) => {
          const lessons = publishedLessons.filter((l) => l.syllabusId === node.id);
          const qCount = publishedQuestions.filter((q) => q.syllabusId === node.id).length;
          const cCount = publishedFlashcards.filter((c) => c.syllabusId === node.id).length;
          return (
            <div key={node.id} className="card">
              <h2>{node.order}. {node.chapter}</h2>
              <p className="small muted" style={{ margin: '2px 0 8px' }}>{node.title}</p>
              <p className="controls">
                {lessons.map((l) => <button key={l.id} onClick={() => onOpenLesson(l.id)}>教材：{l.title}{state.lessonsDone.includes(l.id) ? '（学習済み）' : ''}</button>)}
                <button onClick={() => onPracticeChapter(node.id)}>演習（{qCount}問）</button>
                <button onClick={onOpenCards}>単語帳（{cCount}枚）</button>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LessonsView({ mode, state, onOpen, upd, onSyllabus }: { mode: Mode; state: AppState; onOpen: (id: string) => void; upd: (fn: (s: AppState) => AppState) => void; onSyllabus: () => void }) {
  const [q, setQ] = useState('');
  const [bmOnly, setBmOnly] = useState(false);
  const syllabus = syllabusFor(mode);
  const lessons = publishedLessons.filter((l) => l.mode === mode
    && (!q || l.title.includes(q) || l.keyPoints.some((k) => k.includes(q)) || l.basic.some((p) => p.includes(q)) || l.detail.some((p) => p.includes(q)) || (syllabusById(l.syllabusId)?.chapter.includes(q) ?? false))
    && (!bmOnly || state.bookmarks.includes(`lesson:${l.id}`)));
  const accByField = new Map<string, number>();
  for (const f of fieldStats(state.answers, publishedQuestions)) if (f.accuracy !== null) accByField.set(f.syllabusId, f.accuracy);
  const chapterDone = (id: string) => publishedLessons.filter((l) => l.syllabusId === id).every((l) => state.lessonsDone.includes(l.id));
  const order = state.settings.order;
  const nodes = order === 'weak'
    ? [...syllabus].sort((a, b) => (accByField.get(a.id) ?? 2) - (accByField.get(b.id) ?? 2) || a.order - b.order)
    : order === 'recommended'
      ? [...syllabus].sort((a, b) => Number(chapterDone(a.id)) - Number(chapterDone(b.id)) || a.order - b.order)
      : syllabus;
  return (
    <section><h1>{MODE_LABEL[mode]} 教材</h1>
      <p className="controls"><label>検索 <input type="search" aria-label="教材を検索" value={q} onChange={(e) => setQ(e.target.value)} placeholder="用語・分野" /></label>{' '}
        <label><input type="checkbox" checked={bmOnly} onChange={(e) => setBmOnly(e.target.checked)} /> ブックマークのみ</label>{' '}
        <label>学習順序 <select value={state.settings.order} onChange={(e) => upd((s) => { s.settings.order = e.target.value as AppState['settings']['order']; return s; })}>
          <option value="syllabus">公式シラバス順</option><option value="recommended">推奨順（未学習を前提順に）</option>
          <option value="weak">弱点優先（分析を参照）</option><option value="free">自由学習（前提表示なし）</option></select></label>{' '}
        <button onClick={onSyllabus}>シラバスで見る</button>{' '}
        <button onClick={() => void openSummaryPdf(mode)}>要点まとめPDFを開く</button></p>
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

function LessonView({ lesson, state, onDone, onBack, onBookmark, onOpenCard, onPracticeChapter, onSyllabus }: {
  lesson: Lesson; state: AppState; onDone: () => void; onBack: () => void; onBookmark: () => void;
  onOpenCard: (id: string) => void; onPracticeChapter: (sid: string) => void; onSyllabus: () => void;
}) {
  const done = state.lessonsDone.includes(lesson.id);
  const bookmarked = state.bookmarks.includes(`lesson:${lesson.id}`);
  const chapterCards = publishedFlashcards.filter((c) => c.syllabusId === lesson.syllabusId);
  const termsOf = (chapter: string) => publishedFlashcards.filter((c) => c.syllabusId === chapter).map((c) => ({ term: c.term, cardId: c.id, definition: c.definition }));
  const terms = termsOf(lesson.syllabusId);
  const relatedQuestions = publishedQuestions.filter((q) => q.syllabusId === lesson.syllabusId).length;
  const [tab, setTab] = useState<'key' | 'basic' | 'detail'>('key');
  useEffect(() => { setTab('key'); }, [lesson.id]);
  return (
    <article>
      <p className="controls"><button onClick={onBack}>← 教材一覧へ</button>
        <button aria-pressed={bookmarked} onClick={onBookmark}>{bookmarked ? '★ ブックマーク済み' : '☆ ブックマーク'}</button>
        <button onClick={onSyllabus}>シラバスでの位置</button></p>
      <h1>{lesson.title}</h1>
      <div role="tablist" aria-label="教材の表示" className="seg tabs lesson-tabs">
        {([['key', '要点と図'], ['basic', '解説'], ['detail', '詳細・出典']] as const).map(([k, label]) => (
          <button key={k} role="tab" id={`lesson-tab-${k}`} aria-selected={tab === k} aria-controls="lesson-pane" className={tab === k ? 'primary' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <div id="lesson-pane" role="tabpanel" aria-labelledby={`lesson-tab-${tab}`}>
        {tab === 'key' && (
          <div className="card keypoints">
            <ul>{lesson.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
            <LessonVisuals ids={LESSON_VISUAL_IDS[lesson.id] ?? lesson.visualIds} />
          </div>
        )}
        {tab === 'basic' && (
          <div className="card">
            {lesson.basic.map((p, i) => (
              <React.Fragment key={i}>
                <p><TermText text={p} terms={terms} onOpenCard={onOpenCard} /></p>
                {ILLUSTRATIONS[lesson.id]?.after === i && <LessonIllustration lessonId={lesson.id} />}
              </React.Fragment>
            ))}
            <h3>よくある誤解</h3><ul>{lesson.pitfalls.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
        )}
        {tab === 'detail' && (
          <div className="card">
            {lesson.detail.map((p, i) => (
              <React.Fragment key={i}>
                <p><TermText text={p} terms={terms} onOpenCard={onOpenCard} /></p>
                {DETAIL_ILLUSTRATIONS[lesson.id]?.after === i && <LessonIllustration lessonId={lesson.id} variant="detail" />}
              </React.Fragment>
            ))}
            {lesson.advancedNote && <p className="muted">発展内容について：{lesson.advancedNote}</p>}
            <h3>参考資料</h3><ul>{lesson.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
            <p className="muted small">教材 v{lesson.version}／最終検証 {lesson.verifiedAt}／再検証目安 {lesson.reviewBy}</p>
          </div>
        )}
      </div>
      <div className="card lesson-actions">
        <p className="controls">
          {tab !== 'detail' && <button className="touch" onClick={() => setTab(tab === 'key' ? 'basic' : 'detail')}>{tab === 'key' ? '解説を読む →' : '詳細を読む →'}</button>}
          <button className="primary touch" disabled={done} onClick={onDone}>{done ? '学習済み' : '学習済みにする'}</button>
          <button className="touch" onClick={() => onPracticeChapter(lesson.syllabusId)}>この章の演習（{relatedQuestions}問）</button>
        </p>
        {chapterCards.length > 0 && (
          <details><summary>この章の単語カード（{chapterCards.length}枚）</summary>
            <p className="controls">{chapterCards.map((c) => <button key={c.id} onClick={() => onOpenCard(c.id)}>{c.term}</button>)}</p>
          </details>
        )}
      </div>
    </article>
  );
}

interface PracticeSession {
  ids: string[];
  perms: Record<string, number[]>;
  pos: number;
  answered: Record<string, { selected: number[]; correct: boolean }>;
  shuffleQ: boolean;
  shuffleC: boolean;
  review: boolean;
}

function PracticeView(props: {
  mode: Mode; questions: Question[]; answers: AppState['answers']; reviewMode?: boolean;
  bookmarks: string[]; onBookmark: (id: string) => void;
  onAnswer: (q: Question, sel: number[], sec: number) => boolean;
  prefs: AppState['practicePrefs']; onPrefs: (p: AppState['practicePrefs']) => void;
  onOpenLesson: (id: string) => void; onOpenCard: (id: string) => void; onPracticeWrong?: () => void;
}) {
  const reviewMode = !!props.reviewMode;
  // 復習は開いた時点の期限到来分で固定する（回答で期限が動いても表示中の問題が差し替わらないように）
  const [frozenPool] = useState(props.questions);
  const livePool = reviewMode ? frozenPool : props.questions;
  const storageKey = `g-ai:practice-session:${props.mode}:${reviewMode ? 'review' : 'practice'}`;
  const [field, setField] = useState(() => { try { return sessionStorage.getItem('g-ai:practiceField') ?? 'all'; } catch { return 'all'; } });
  const [text, setText] = useState(() => { try { return sessionStorage.getItem('g-ai:practiceText') ?? ''; } catch { return ''; } });
  const [savedOnly, setSavedOnly] = useState(false);
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [weakOnly, setWeakOnly] = useState(() => { try { return !reviewMode && sessionStorage.getItem('g-ai:practiceWeak') === '1'; } catch { return false; } });
  const [count, setCount] = useState<'all' | 5 | 10 | 20>('all');
  const [shuffleQ, setShuffleQ] = useState(props.prefs.shuffleQuestions);
  const [shuffleC, setShuffleC] = useState(props.prefs.shuffleChoices);
  const [session, setSession] = useState<PracticeSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      const s = JSON.parse(raw) as PracticeSession;
      if (!Array.isArray(s.ids) || s.ids.some((id) => !livePool.some((q) => q.id === id))) return null;
      return s;
    } catch { return null; }
  });
  const [sel, setSel] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const answeringRef = useRef<string | null>(null); // 即時判定の二重記録防止（フックは早期returnより前で宣言する）
  useEffect(() => { try { if (session) sessionStorage.setItem(storageKey, JSON.stringify(session)); else sessionStorage.removeItem(storageKey); } catch { /* 保存できなくても演習は続行できる */ } }, [session, storageKey]);
  useEffect(() => { setSel([]); setStartedAt(Date.now()); }, [session?.pos, session?.ids]);

  const answeredIds = useMemo(() => new Set(props.answers.map((a) => a.questionId)), [props.answers]);
  const wrongIds = useMemo(() => {
    const last = new Map<string, boolean>();
    for (const a of props.answers) last.set(a.questionId, a.correct);
    return new Set([...last.entries()].filter(([, ok]) => !ok).map(([id]) => id));
  }, [props.answers]);
  const pool = useMemo(() => livePool.filter((x) => (field === 'all' || x.syllabusId === field)
    && (!text || [x.id, x.stem, ...x.choices, x.basic, x.detail].some((t) => t.includes(text)))
    && (!savedOnly || props.bookmarks.includes(`q:${x.id}`))
    && (!unansweredOnly || !answeredIds.has(x.id))
    && (!weakOnly || wrongIds.has(x.id))), [livePool, field, text, savedOnly, unansweredOnly, weakOnly, props.bookmarks, answeredIds, wrongIds]);
  const fields = [...new Set(livePool.map((x) => x.syllabusId))];
  const byId = (id: string) => livePool.find((q) => q.id === id) ?? props.questions.find((q) => q.id === id);

  const startSession = (reshuffle = false) => {
    const rng = mulberry32(reshuffle ? randomSeed() : randomSeed());
    const ids = (shuffleQ ? shuffled(pool.map((q) => q.id), rng) : pool.map((q) => q.id)).slice(0, count === 'all' ? undefined : count);
    const perms: Record<string, number[]> = {};
    for (const id of ids) { const q = byId(id)!; perms[id] = shuffleC ? permutation(q.choices.length, rng) : q.choices.map((_, i) => i); }
    setSession({ ids, perms, pos: 0, answered: {}, shuffleQ, shuffleC, review: reviewMode });
    props.onPrefs({ shuffleQuestions: shuffleQ, shuffleChoices: shuffleC });
  };
  const endSession = () => setSession(null);

  if (livePool.length === 0) {
    return (
      <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
        <div className="card">
          <p>{reviewMode ? '今日が期限の復習はありません。' : '現在、対象の問題はありません。'}</p>
          {reviewMode && wrongIds.size > 0 && props.onPracticeWrong && (
            <button className="primary touch" onClick={props.onPracticeWrong}>直近で間違えた{wrongIds.size}問を解き直す</button>
          )}
        </div>
      </section>
    );
  }
  if (!session) {
    return (
      <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
        <div className="card">
          {!reviewMode && <>
            <p className="controls"><label>分野 <select value={field} onChange={(e) => setField(e.target.value)}>
              <option value="all">全分野</option>{fields.map((f) => <option key={f} value={f}>{chapterName(f)}</option>)}</select></label>
              <label>検索 <input type="search" aria-label="問題を検索" value={text} placeholder="用語・キーワード" onChange={(e) => setText(e.target.value)} /></label></p>
            <p className="controls">
              <label><input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} /> 保存した問題のみ</label>
              <label><input type="checkbox" checked={unansweredOnly} onChange={(e) => setUnansweredOnly(e.target.checked)} /> 未回答のみ</label>
              <label><input type="checkbox" checked={weakOnly} onChange={(e) => setWeakOnly(e.target.checked)} /> 直近で間違えた問題</label>
              <label>問題数 <select value={String(count)} onChange={(e) => setCount(e.target.value === 'all' ? 'all' : Number(e.target.value) as 5 | 10 | 20)}>
                <option value="all">全件</option><option value="5">5問</option><option value="10">10問</option><option value="20">20問</option></select></label>
            </p>
          </>}
          <p className="controls">
            <label><input type="checkbox" checked={shuffleQ} onChange={(e) => setShuffleQ(e.target.checked)} /> 出題順シャッフル</label>
            <label><input type="checkbox" checked={shuffleC} onChange={(e) => setShuffleC(e.target.checked)} /> 選択肢シャッフル</label>
          </p>
          <p>{reviewMode ? `期限の来た問題が${pool.length}問あります。` : `対象は${pool.length}問です。`}</p>
          <button className="primary touch" disabled={pool.length === 0} onClick={() => startSession()}>この条件ではじめる</button>
          {pool.length === 0 && <p className="muted" role="status">条件に合う問題がありません。絞り込みを変えてください。</p>}
          <p className="muted small">セッションは開始時点で問題と選択肢の順序を固定します。途中で画面を離れても、同じ端末では続きから再開できます。</p>
        </div>
      </section>
    );
  }
  const q = session.pos < session.ids.length ? byId(session.ids[session.pos]) : undefined;
  const doneCount = Object.keys(session.answered).length;
  const correctCount = Object.values(session.answered).filter((a) => a.correct).length;
  if (!q) {
    return (
      <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
        <div className="card"><h2>このセットを終えました</h2>
          <p>{doneCount}問中 {correctCount}問正解（{doneCount ? Math.round((correctCount / doneCount) * 100) : 0}%）でした。誤答した問題は翌日の復習に入ります。</p>
          <p className="controls">
            <button className="primary touch" onClick={() => { endSession(); }}>条件を変えてもう一度</button>
            <button className="touch" onClick={() => startSession(true)}>同じ条件で再シャッフル</button>
          </p>
        </div>
      </section>
    );
  }
  const perm = session.perms[q.id] ?? q.choices.map((_, i) => i);
  const result = session.answered[q.id];
  const bookmarked = props.bookmarks.includes(`q:${q.id}`);
  const relatedCard = publishedFlashcards.find((c) => c.conceptId === q.id) ?? publishedFlashcards.find((c) => c.questionIds.includes(q.id));
  const relatedLesson = publishedLessons.find((l) => l.syllabusId === q.syllabusId && l.mode === q.mode);
  const explanationVisualIds = explanationVisualIdsFor(q, 2);
  const answerWith = (origSel: number[]) => {
    if (answeringRef.current === q.id) return; // 即時判定の二重記録を防ぐ
    answeringRef.current = q.id;
    const correct = props.onAnswer(q, origSel, Math.max(0, Math.round((Date.now() - startedAt) / 1000)));
    setSession((s) => (s ? { ...s, answered: { ...s.answered, [q.id]: { selected: origSel, correct } } } : s));
  };
  const toggle = (dispIdx: number) => {
    if (result) return;
    if (q.type === 'multi') { setSel((s) => (s.includes(dispIdx) ? s.filter((x) => x !== dispIdx) : [...s, dispIdx])); return; }
    // 単一選択・正誤判定は、選んだ瞬間に答えと解説を表示する
    setSel([dispIdx]);
    answerWith([perm[dispIdx]]);
  };
  const answerNow = () => answerWith(sel.map((d) => perm[d]).sort((a, b) => a - b));
  return (
    <section><h1>{reviewMode ? '今日の復習' : '演習'}</h1>
      <div className="card" key={q.id}>
        <p className="muted meta">{chapterName(q.syllabusId)}／難易度{q.difficulty}{q.type === 'multi' ? '／複数選択' : q.type === 'truefalse' ? '／正誤判定' : ''}
          <span><button type="button" className="bm" aria-pressed={bookmarked} onClick={() => props.onBookmark(q.id)}>{bookmarked ? '★ 保存済み' : '☆ 保存'}</button>{doneCount}／{session.ids.length}問</span></p>
        <div className="bar" role="progressbar" aria-valuenow={Math.round((doneCount / session.ids.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="このセットの進捗" style={{ margin: '0 0 10px' }}><i style={{ width: `${(doneCount / session.ids.length) * 100}%` }} /></div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend><h2 style={{ display: 'inline' }}>{q.stem}</h2></legend>
          {perm.map((origIdx, dispIdx) => (
            <button key={dispIdx} className={`choice touch ${sel.includes(dispIdx) || result?.selected.includes(origIdx) ? 'sel' : ''} ${result && q.answer.includes(origIdx) ? 'right' : ''} ${result && !result.correct && result.selected.includes(origIdx) && !q.answer.includes(origIdx) ? 'wrong' : ''}`}
              aria-pressed={sel.includes(dispIdx) || !!result?.selected.includes(origIdx)} aria-disabled={!!result} onClick={() => toggle(dispIdx)}>
              <span className="ctext">{q.choices[origIdx]}{result && <small className="reason">{q.answer.includes(origIdx) ? '正答：' : ''}{q.choiceReasons[origIdx]}</small>}</span></button>
          ))}</fieldset>
        {!result ? (
          q.type === 'multi' ? <button className="primary touch" disabled={sel.length === 0} onClick={answerNow}>回答する</button> : null
        ) : (
          <div role="status">
            <div className="fb" ref={(el) => { if (el && el.dataset.shown !== q.id) { el.dataset.shown = q.id; el.scrollIntoView({ block: 'nearest' }); } }}>
              <p className={result.correct ? 'ok' : 'bad'}><b>{result.correct ? '正解です。' : '不正解です。'}</b></p>
              <button className="primary touch" onClick={() => setSession((s) => (s ? { ...s, pos: s.pos + 1 } : s))}>{session.pos + 1 >= session.ids.length ? '結果を見る' : '次の問題'}</button>
            </div>
            <h3>基礎解説</h3><p>{q.basic}</p>
            <h3>詳細解説</h3><p>{q.detail}</p>
            {explanationVisualIds.length > 0 && <><h3>関連図表</h3><LessonVisuals ids={explanationVisualIds} /></>}
            <p className="controls">
              <button aria-pressed={bookmarked} onClick={() => props.onBookmark(q.id)}>{bookmarked ? '★ 保存済み' : '☆ この問題を保存'}</button>
              {relatedLesson && <button onClick={() => props.onOpenLesson(relatedLesson.id)}>教材に戻る</button>}
              {relatedCard && <button onClick={() => props.onOpenCard(relatedCard.id)}>単語カード：{relatedCard.term}</button>}
            </p>
            <p className="muted small">出典：{q.sources.map((s) => s.title).join('、')}／最終検証 {q.verifiedAt}</p>
          </div>
        )}
        <p className="controls" style={{ marginTop: 10 }}>
          <button disabled={session.pos === 0} onClick={() => setSession((s) => (s ? { ...s, pos: s.pos - 1 } : s))}>前の問題</button>
          <button onClick={endSession}>セッションを終了</button>
        </p>
      </div>
    </section>
  );
}

interface CardSession {
  ids: string[];
  pos: number;
  flipped: boolean;
  direction: CardDirection;
  graded: Record<string, CardGrade>;
  shuffle: boolean;
}

function maskTerm(text: string, card: Flashcard): string {
  let out = text;
  for (const t of [card.term, ...(card.aliases ?? [])]) {
    if (t) out = out.split(t).join('＿＿＿＿');
  }
  return out;
}

function FlashcardsView(props: {
  mode: Mode; cards: Flashcard[]; cardReview: AppState['cardReview'];
  bookmarks: string[]; onBookmark: (id: string) => void; onGrade: (id: string, g: CardGrade) => void;
  direction: CardDirection; onDirection: (d: CardDirection) => void;
  focusCardId?: string; onOpenLesson: (id: string) => void; onPracticeQuestion: (qid: string) => void;
}) {
  const storageKey = `g-ai:card-session:${props.mode}`;
  const [poolKind, setPoolKind] = useState<'all' | 'chapter' | 'new' | 'weak' | 'due' | 'saved'>('all');
  const [chapter, setChapter] = useState('all');
  const [shuffleOn, setShuffleOn] = useState(true);
  const [browse, setBrowse] = useState(false);
  const swipeRef = useRef<{ x: number; y: number; swiped: boolean }>({ x: 0, y: 0, swiped: false }); // フックは早期returnより前で宣言する
  const [session, setSession] = useState<CardSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      const s = JSON.parse(raw) as CardSession;
      if (!Array.isArray(s.ids) || s.ids.some((id) => !props.cards.some((c) => c.id === id))) return null;
      return s;
    } catch { return null; }
  });
  useEffect(() => { try { if (session) sessionStorage.setItem(storageKey, JSON.stringify(session)); else sessionStorage.removeItem(storageKey); } catch { /* 保存できなくても学習は続行できる */ } }, [session, storageKey]);

  const weak = useMemo(() => weakCardIds(props.cardReview), [props.cardReview]);
  const dueIds = useMemo(() => new Set(dueFlashcards(props.cardReview).map((c) => c.cardId)), [props.cardReview]);
  const pool = useMemo(() => props.cards.filter((c) =>
    poolKind === 'all' ? true
      : poolKind === 'chapter' ? (chapter === 'all' || c.syllabusId === chapter)
        : poolKind === 'new' ? !props.cardReview[c.id]
          : poolKind === 'weak' ? weak.has(c.id)
            : poolKind === 'due' ? dueIds.has(c.id)
              : props.bookmarks.includes(`card:${c.id}`)), [props.cards, poolKind, chapter, props.cardReview, weak, dueIds, props.bookmarks]);
  const chapters = [...new Set(props.cards.map((c) => c.syllabusId))];
  const stats = cardStats(props.cardReview, props.cards.length);

  const start = (ids: string[], fromPos = 0, focusFirst = false) => {
    // シャッフル時に特定のカードを指定された場合は、そのカードを先頭に置いて残りを混ぜる
    const picked = fromPos > 0 || focusFirst ? ids[fromPos] : undefined;
    const ordered = !shuffleOn ? ids
      : picked ? [picked, ...shuffled(ids.filter((id) => id !== picked), mulberry32(randomSeed()))]
        : shuffled(ids, mulberry32(randomSeed()));
    const pos = shuffleOn ? 0 : Math.min(fromPos, Math.max(0, ordered.length - 1));
    setSession({ ids: ordered, pos, flipped: false, direction: props.direction, graded: {}, shuffle: shuffleOn });
  };
  useEffect(() => {
    if (!props.focusCardId) return;
    // 深いリンク：進行中のセッションに対象があればその位置へ、なければ全件から対象を先頭にして開始する
    const inSession = session ? session.ids.indexOf(props.focusCardId) : -1;
    if (session && inSession >= 0) { if (inSession !== session.pos) setSession({ ...session, pos: inSession, flipped: false }); return; }
    const idx = props.cards.findIndex((c) => c.id === props.focusCardId);
    if (idx >= 0) start(props.cards.map((c) => c.id), idx, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focusCardId]);

  if (!session) {
    return (
      <section><h1>単語帳（{MODE_LABEL[props.mode]}）</h1>
        <div className="card">
          <p className="muted" style={{ marginTop: 0 }}>学習済み {stats.studied}／{stats.total}枚・期限到来 {stats.due}枚・苦手 {stats.fuzzy + stats.unknown}枚</p>
          <h2>向き</h2>
          <div role="group" aria-label="カードの向き" className="seg tabs">
            <button className={props.direction === 'term-first' ? 'primary' : ''} aria-pressed={props.direction === 'term-first'} onClick={() => props.onDirection('term-first')}>用語 → 意味</button>
            <button className={props.direction === 'meaning-first' ? 'primary' : ''} aria-pressed={props.direction === 'meaning-first'} onClick={() => props.onDirection('meaning-first')}>意味 → 用語</button>
          </div>
          <h2>範囲</h2>
          <p className="controls">
            <label>絞り込み <select value={poolKind} onChange={(e) => setPoolKind(e.target.value as typeof poolKind)}>
              <option value="all">全件</option><option value="chapter">章別</option><option value="new">未学習</option>
              <option value="weak">苦手</option><option value="due">期限到来</option><option value="saved">ブックマークのみ</option></select></label>
            {poolKind === 'chapter' && <label>章 <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
              <option value="all">全章</option>{chapters.map((f) => <option key={f} value={f}>{chapterName(f)}</option>)}</select></label>}
            <label><input type="checkbox" checked={shuffleOn} onChange={(e) => setShuffleOn(e.target.checked)} /> シャッフル</label>
          </p>
          <p>対象は{pool.length}枚です。</p>
          <p className="controls">
            <button className="primary touch" disabled={pool.length === 0} onClick={() => start(pool.map((c) => c.id))}>この条件ではじめる</button>
            <button className="touch" disabled={!session && pool.length === 0} onClick={() => setBrowse(!browse)} aria-expanded={browse}>一覧から選ぶ</button>
          </p>
          {pool.length === 0 && <p className="muted" role="status">対象のカードがありません。絞り込みを変えてください。</p>}
          {browse && (
            <ul className="card-list">
              {pool.map((c) => (
                <li key={c.id}>
                  <button className="card-row" onClick={() => start(pool.map((x) => x.id), pool.findIndex((x) => x.id === c.id), true)}>
                    <b>{c.term}</b><small>{chapterName(c.syllabusId)}{props.cardReview[c.id]?.lastGrade ? `／${GRADE_LABEL[props.cardReview[c.id].lastGrade!]}` : ''}</small>
                  </button>
                  <button className="bm" aria-pressed={props.bookmarks.includes(`card:${c.id}`)} aria-label={`${c.term}をブックマーク`} onClick={() => props.onBookmark(c.id)}>{props.bookmarks.includes(`card:${c.id}`) ? '★' : '☆'}</button>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">向きと出題順はセッション開始時点で固定されます。途中で画面を離れても、同じ端末では続きから再開できます。</p>
        </div>
      </section>
    );
  }
  const card = session.pos < session.ids.length ? props.cards.find((c) => c.id === session.ids[session.pos]) : undefined;
  const gradedCount = Object.keys(session.graded).length;
  if (!card) {
    const byGrade = (g: CardGrade) => Object.values(session.graded).filter((x) => x === g).length;
    return (
      <section><h1>単語帳（{MODE_LABEL[props.mode]}）</h1>
        <div className="card"><h2>このセットを終えました</h2>
          <p>{gradedCount}枚を確認しました（覚えた {byGrade('known')}／あいまい {byGrade('fuzzy')}／覚えていない {byGrade('unknown')}）。自己評価は復習間隔に反映され、問題演習の正答率とは別に記録されます。</p>
          <p className="controls">
            <button className="primary touch" onClick={() => setSession(null)}>条件を変えてもう一度</button>
            <button className="touch" onClick={() => setSession({ ...session, pos: 0, flipped: false, graded: {} })}>同じ順でもう一周</button>
            <button className="touch" onClick={() => setSession({ ...session, ids: shuffled(session.ids, mulberry32(randomSeed())), pos: 0, flipped: false, graded: {} })}>再シャッフルしてもう一周</button>
          </p>
        </div>
      </section>
    );
  }
  const bookmarked = props.bookmarks.includes(`card:${card.id}`);
  const front = session.direction === 'term-first'
    ? <><span className="card-term">{card.term}</span>{card.aliases?.length ? <span className="card-alias">{card.aliases.join('／')}</span> : null}</>
    : <span className="card-def">{maskTerm(card.reversePrompt ?? card.definition, card)}</span>;
  const back = session.direction === 'term-first'
    ? <><span className="card-def">{card.definition}</span>{card.example && <span className="card-note">例：{card.example}</span>}{card.confusion && <span className="card-note">混同注意：{card.confusion}</span>}</>
    : <><span className="card-term">{card.term}</span>{card.aliases?.length ? <span className="card-alias">{card.aliases.join('／')}</span> : null}<span className="card-def small-def">{card.definition}</span>{card.example && <span className="card-note">例：{card.example}</span>}{card.confusion && <span className="card-note">混同注意：{card.confusion}</span>}</>;
  const goNext = () => setSession((s) => (s && s.pos + 1 < s.ids.length ? { ...s, pos: s.pos + 1, flipped: false } : s));
  const goPrev = () => setSession((s) => (s && s.pos > 0 ? { ...s, pos: s.pos - 1, flipped: false } : s));
  // スワイプで前後のカードへ（左スワイプ=次へ／右スワイプ=前へ）。タップ（裏返し）と誤認しないよう移動量で判定する
  const onFacePointerDown = (e: React.PointerEvent) => { swipeRef.current = { x: e.clientX, y: e.clientY, swiped: false }; };
  const onFacePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - swipeRef.current.x;
    const dy = e.clientY - swipeRef.current.y;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swipeRef.current.swiped = true;
      if (dx < 0) goNext(); else goPrev();
    }
  };
  const flip = () => {
    if (swipeRef.current.swiped) { swipeRef.current.swiped = false; return; } // スワイプ直後のクリックは裏返しにしない
    setSession((s) => (s ? { ...s, flipped: !s.flipped } : s));
  };
  const grade = (g: CardGrade) => {
    props.onGrade(card.id, g);
    setSession((s) => (s ? { ...s, graded: { ...s.graded, [card.id]: g }, pos: s.pos + 1, flipped: false } : s));
  };
  return (
    <section><h1>単語帳（{MODE_LABEL[props.mode]}）</h1>
      <div className="card flashcard">
        <p className="muted meta">{chapterName(card.syllabusId)}／難易度{card.difficulty}／{session.direction === 'term-first' ? '用語 → 意味' : '意味 → 用語'}
          <span><button type="button" className="bm" aria-pressed={bookmarked} onClick={() => props.onBookmark(card.id)}>{bookmarked ? '★ 保存済み' : '☆ 保存'}</button>{session.pos + 1}／{session.ids.length}枚</span></p>
        <div className="bar" role="progressbar" aria-valuenow={Math.round((gradedCount / session.ids.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="単語帳の進捗" style={{ margin: '0 0 10px' }}><i style={{ width: `${(gradedCount / session.ids.length) * 100}%` }} /></div>
        <button type="button" className={`flash-face ${session.flipped ? 'back' : 'front'}`} aria-label={session.flipped ? 'カードの裏面（タップで表面に戻す。左右スワイプで前後のカードへ）' : 'カードの表面（タップで裏返す。左右スワイプで前後のカードへ）'} onClick={flip} onPointerDown={onFacePointerDown} onPointerUp={onFacePointerUp}>
          {session.flipped ? back : front}
          <span className="flash-hint">{session.flipped ? 'タップで戻す／スワイプで移動' : 'タップで裏返す／スワイプで移動'}</span>
        </button>
        {session.flipped ? (
          <p className="controls flash-grades" role="group" aria-label="自己評価">
            <button className="touch" onClick={() => grade('known')}>覚えた</button>
            <button className="touch" onClick={() => grade('fuzzy')}>あいまい</button>
            <button className="touch" onClick={() => grade('unknown')}>覚えていない</button>
          </p>
        ) : (
          <p className="controls flash-grades"><button className="primary touch" onClick={flip}>答えを見る</button></p>
        )}
        <p className="controls flash-nav">
          <button className="touch" disabled={session.pos === 0} onClick={goPrev}>← 前へ</button>
          <button className="touch" disabled={session.pos + 1 >= session.ids.length} onClick={goNext}>次へ →</button>
          <button onClick={() => setSession(null)}>セッションを終了</button>
        </p>
        {session.flipped && (
          <div className="flash-links">
            <p className="controls">
              {card.lessonId && <button onClick={() => props.onOpenLesson(card.lessonId!)}>教材で確認</button>}
              {card.questionIds.slice(0, 2).map((qid) => <button key={qid} onClick={() => props.onPracticeQuestion(qid)}>関連問題を解く</button>)}
            </p>
            {card.detail && <details><summary>補足</summary><p>{card.detail}</p></details>}
            <p className="muted small">出典：{card.sources.map((s) => s.title).join('、')}／最終検証 {card.verifiedAt}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ExamView({ state, mode, questions, syllabus, upd, onOpenLesson }: { state: AppState; mode: Mode; questions: Question[]; syllabus: SyllabusNode[]; upd: (fn: (s: AppState) => AppState) => void; onOpenLesson: (id: string) => void }) {
  const active = state.exams.find((e) => e.status === 'in-progress' && e.mode === mode);
  const fullCount = mode === 'passport' ? 60 : EXAM_FULL_COUNT; // 生成AIパスポートは60問・60分（IBT）、G検定は145問程度
  const [field, setField] = useState(syllabus[2]?.id ?? syllabus[0]?.id ?? '');
  const [count, setCount] = useState(10);
  const [modeKind, setModeKind] = useState<'online' | 'onsite'>('online');
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);

  const start = (kind: ExamSession['kind'], qs: Question[], limitSec: number, n?: number) => {
    if (qs.length === 0) return;
    const rng = mulberry32(randomSeed());
    const picked = shuffled(qs, rng).slice(0, n ?? qs.length);
    const choicePerms: Record<string, number[]> = {};
    for (const q of picked) choicePerms[q.id] = permutation(q.choices.length, rng);
    const session: ExamSession = {
      id: `exam-${Date.now()}`, kind, mode, startedAt: new Date().toISOString(), limitSec,
      questionIds: picked.map((x) => x.id), answers: {}, flags: [], current: 0, pauses: [], status: 'in-progress', strict: true, choicePerms,
    };
    upd((s) => { s.exams.push(session); return s; });
  };
  const lastSubmitted = [...state.exams].reverse().find((e) => e.status === 'submitted' && e.mode === mode);
  const safeCount = Math.min(30, Math.max(1, Math.floor(Number.isFinite(count) ? count : 10) || 10));
  const qs = active ? active.questionIds.map((id) => questions.find((x) => x.id === id)!).filter(Boolean) : [];
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
      // 回答の記録は同じ更新の中で行う（更新関数の中から別の状態更新を呼ぶと記録が失われるため）
      const at = e.submittedAt;
      for (const qq of qs) {
        const sel = e.answers[qq.id];
        if (!sel || sel.length === 0) continue;
        const correct = judge(sel, qq.answer);
        const firstSeen = !s.answers.some((a) => a.questionId === qq.id);
        s.answers.push({ questionId: qq.id, selected: sel, correct, at, seconds: perQ, firstSeen, context: 'exam' });
        s.review[qq.id] = nextReview(s.review[qq.id], qq.id, correct);
      }
      return s;
    });
    if (!auto) return;
  };
  useEffect(() => {
    if (active && active.status === 'in-progress' && remain === 0 && !paused) submitExam(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remain, paused, active?.status]);
  if (!active) {
    return (
      <section><h1>模擬試験</h1>
        <div className="grid exam-start">
          <div className="card"><h2>フル模試</h2>
            {questions.length >= fullCount ? (
              mode === 'passport' ? (
                <><p className="small">{fullCount}問／60分（IBT形式）。本番形式のため一時停止はありません。</p>
                  <p className="controls"><button className="primary touch" onClick={() => start('full', questions, 3600, fullCount)}>開始</button></p></>
              ) : (
                <><p className="small">{fullCount}問／{modeKind === 'online' ? '100分（オンライン形式）' : '120分（会場形式）'}。本番形式のため一時停止はありません。</p>
                  <p className="controls"><label>形式 <select value={modeKind} onChange={(e) => setModeKind(e.target.value as 'online' | 'onsite')}><option value="online">オンライン（100分）</option><option value="onsite">会場（120分）</option></select></label>
                  <button className="primary touch" onClick={() => start('full', questions, modeKind === 'online' ? 6000 : 7200, fullCount)}>開始</button></p></>
              )
            ) : (
              <p role="note">検証済み問題が{questions.length}問のため利用できません（{fullCount}問に達すると有効化）。</p>
            )}
          </div>
          <div className="card"><h2>短縮模試</h2><p className="small">10問／15分（一時停止可・練習条件として記録されます）</p>
            <button className="primary touch" onClick={() => start('short', questions, 900, 10)}>開始</button></div>
          <div className="card"><h2>分野別・カスタム</h2>
            <p className="controls"><label>分野 <select value={field} onChange={(e) => setField(e.target.value)}>{syllabus.map((s) => <option key={s.id} value={s.id}>{s.chapter}</option>)}</select></label>
              <label>問題数 <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} onBlur={() => setCount(safeCount)} style={{ width: 70 }} /></label></p>
            <p className="controls"><button className="primary touch" onClick={() => start('field', questions.filter((x) => x.syllabusId === field), safeCount * 90, safeCount)}>分野別を開始</button>
              <button className="touch" onClick={() => start('custom', questions, safeCount * 90, safeCount)}>カスタム（全分野）</button></p>
          </div>
        </div>
        {lastSubmitted && (() => {
          const rqs = lastSubmitted.questionIds.map((id) => questions.find((x) => x.id === id)!).filter(Boolean);
          const correctCount = rqs.filter((x) => judge(lastSubmitted.answers[x.id] ?? [], x.answer)).length;
          return (
            <div className="card"><h2>直近の結果（{EXAM_KIND_LABEL[lastSubmitted.kind]}）</h2>
              <p>正解 {correctCount}／{rqs.length}問（{rqs.length ? Math.round((correctCount / rqs.length) * 100) : 0}%）／一時停止 {lastSubmitted.pauses.length}回{lastSubmitted.strict ? '' : '（一時停止したため本番条件の完全再現ではありません）'}</p>
              <details className="results"><summary>問題ごとの解説（{rqs.length}問）</summary>
                {rqs.map((x, i) => (
                  <details key={x.id}><summary>問{i + 1}. {judge(lastSubmitted.answers[x.id] ?? [], x.answer) ? '○' : '×'} {x.stem}</summary>
                    <ul>{x.choices.map((c, ci) => <li key={ci}><b>{String.fromCharCode(65 + ci)}.</b> {c}{x.answer.includes(ci) ? '（正答）' : ''}{(lastSubmitted.answers[x.id] ?? []).includes(ci) ? '（あなたの回答）' : ''}<br /><span className="muted small">{x.choiceReasons[ci]}</span></li>)}</ul>
                    <p>{x.basic}</p><p>{x.detail}</p>
                    <LessonVisuals ids={explanationVisualIdsFor(x, 1)} />
                    <p><button onClick={() => { const l = publishedLessons.find((les) => les.syllabusId === x.syllabusId && les.mode === x.mode); if (l) onOpenLesson(l.id); }}>教材で復習する</button></p>
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
  const curPerm = cur ? (active.choicePerms?.[cur.id] ?? cur.choices.map((_, i) => i)) : [];
  return (
    <section><h1>模擬試験（{EXAM_KIND_LABEL[active.kind]}）</h1>
      <div className="card">
        <p>残り時間 <b role="timer" aria-label={`残り${Math.floor(remain / 60)}分${remain % 60}秒`}>{Math.floor(remain / 60)}:{String(remain % 60).padStart(2, '0')}</b>／回答 {answeredCount}／{qs.length}問{paused ? '／一時停止中' : ''}／一時停止 {active.pauses.length}回{active.strict ? '' : '／練習条件'}</p>
        {remain === 0 && <p role="alert" className="bad">制限時間に達したため自動提出します。</p>}
        <div className="bar" aria-hidden="true"><i style={{ width: `${(answeredCount / qs.length) * 100}%` }} /></div>
        {cur && <>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend><h2 style={{ display: 'inline' }}>問{active.current + 1}. {cur.stem}</h2></legend>
            {curPerm.map((origIdx) => {
              const sel = active.answers[cur.id] ?? [];
              return <button key={origIdx} className={`choice touch ${sel.includes(origIdx) ? 'sel' : ''}`} aria-pressed={sel.includes(origIdx)}
                disabled={paused || remain === 0}
                onClick={() => upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; const next = cur.type === 'multi' ? (sel.includes(origIdx) ? sel.filter((x) => x !== origIdx) : [...sel, origIdx]) : [origIdx]; if (next.length) e.answers[cur.id] = next; else delete e.answers[cur.id]; return s; })}>
                <span>{cur.choices[origIdx]}</span></button>;
            })}</fieldset>
        </>}
        <p>
          <button disabled={active.current === 0} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current -= 1; return s; })}>前へ</button>{' '}
          <button disabled={active.current >= qs.length - 1} onClick={() => upd((s) => { s.exams.find((x) => x.id === active.id)!.current += 1; return s; })}>次へ</button>{' '}
          <button aria-pressed={cur ? active.flags.includes(cur.id) : false} onClick={() => cur && upd((s) => { const e = s.exams.find((x) => x.id === active.id)!; e.flags = e.flags.includes(cur.id) ? e.flags.filter((f) => f !== cur.id) : [...e.flags, cur.id]; return s; })}>見直しフラグ</button>{' '}
          {active.kind === 'full' ? null : paused
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

function LiteracyView({ mode, state, upd, onOpenLesson, onSyllabus }: { mode: Mode; state: AppState; upd: (fn: (s: AppState) => AppState) => void; onOpenLesson: (id: string) => void; onSyllabus: () => void }) {
  const [tab, setTab] = useState<'lessons' | 'exercises' | 'models' | 'news'>('lessons');
  return (
    <section><h1>AI教養</h1>
      <div role="group" aria-label="AI教養の表示切替" className="seg tabs">
        {([['lessons', '教材'], ['exercises', '実践演習'], ['models', 'モデル比較'], ['news', 'ニュース']] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? 'primary' : ''} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'lessons' && <LessonsView mode={mode} state={state} onOpen={onOpenLesson} upd={upd} onSyllabus={onSyllabus} />}
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

function AnalysisView({ mode, examMode, ready, stats, exams, questions, cardReview, cardsTotal, nav, onPracticeChapter }: {
  mode: Mode; examMode: boolean; ready: ReturnType<typeof readiness>; stats: ReturnType<typeof fieldStats>;
  exams: ExamSession[]; questions: Question[]; cardReview: AppState['cardReview']; cardsTotal: number;
  nav: (r: Route) => void; onPracticeChapter: (sid: string) => void;
}) {
  const sessions = examSessionStats(exams, questions);
  const cstats = cardStats(cardReview, cardsTotal);
  return (
    <section><h1>学習分析（{MODE_LABEL[mode]}）</h1>
      <div className="card"><div className="kpi">
        <div>全体正答率<b>{pct(ready.overallAccuracy)}</b></div>
        <div>初見正答率<b>{pct(ready.firstSeenAccuracy)}</b></div>
        <div>再挑戦正答率<b>{pct(ready.retryAccuracy)}</b></div>
        {examMode && <div>模試正答率<b>{pct(ready.examAccuracy)}</b></div>}
        <div>教材の網羅<b>{pct(ready.coverage)}</b></div>
      </div></div>
      {examMode && (
        <div className="card"><h2>到達基準の条件</h2>
          <ul>
            <li>初見ユニーク問題：{ready.firstSeenUnique}／{ready.minFirstSeenUnique}問以上</li>
            <li>初見正答率：{pct(ready.firstSeenAccuracy)}（95%以上）</li>
            <li>初見回答のある章：{Math.round(ready.chapterCoverage * 100)}%（80%以上）</li>
            <li>提出済み模試：{ready.examSessions}／3回以上</li>
            <li>模試正答率：{pct(ready.examAccuracy)}（95%以上）</li>
          </ul>
          {ready.reached ? <p className="ok">到達基準を満たしています。</p> : <p className="muted">未達成：{ready.unmet.join('／')}</p>}
        </div>
      )}
      <div className="card"><h2>分野別</h2>{stats.length === 0 ? <p className="muted">まだ回答記録がありません。</p> : <div className="tablewrap"><table className="stack"><thead><tr><th>分野</th><th>回答</th><th>正答率</th><th>初見正答率</th><th></th></tr></thead>
        <tbody>{stats.map((f) => <tr key={f.syllabusId}><td data-label="分野">{chapterName(f.syllabusId)}</td><td data-label="回答">{f.total}</td><td data-label="正答率">{pct(f.accuracy)}</td><td data-label="初見正答率">{pct(f.firstSeenAccuracy)}</td>
          <td><button onClick={() => onPracticeChapter(f.syllabusId)}>この章の演習</button></td></tr>)}</tbody></table></div>}</div>
      {examMode && <div className="card"><h2>模擬試験の履歴</h2>
        {sessions.length === 0 ? <p className="muted">まだ提出済みの模試がありません。</p> :
          <ul>{sessions.map((e) => <li key={e.id}>{e.submittedAt ? todayStr(new Date(e.submittedAt)) : ''} {EXAM_KIND_LABEL[e.kind]} {e.total}問／正解 {e.correct}問（{pct(e.accuracy)}）{e.strict ? '' : '（練習条件）'}</li>)}</ul>}
      </div>}
      <div className="card"><h2>単語帳</h2>
        <p>学習済み {cstats.studied}／{cstats.total}枚・覚えた {cstats.known}・あいまい {cstats.fuzzy}・覚えていない {cstats.unknown}・期限到来 {cstats.due}枚。単語帳の自己評価は、問題演習の正答率とは別に記録されます。</p>
        <p className="controls"><button onClick={() => nav({ name: 'cards' })}>単語帳を開く</button></p>
      </div>
      <div className="card"><h2>解答時間</h2>
        {(() => { const timed = stats; void timed; return null; })()}
        <p className="muted">時間配分の傾向は模試の結果画面で確認できます。</p>
      </div>
      <div className="card note"><p className="muted">{ready.note} 記録が少ない段階の指標は不確実性が大きいため、傾向として読んでください。</p></div>
    </section>
  );
}

function SettingsView({ state, upd, setState }: { state: AppState; upd: (fn: (s: AppState) => AppState) => void; setState: (s: AppState) => void }) {
  const [msg, setMsg] = useState('');
  const [dataMsg, setDataMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [importResult, setImportResult] = useState<ReturnType<typeof validateImport> | null>(null);
  const set = state.settings;
  const validIds = useMemo(() => ({ questions: new Set(publishedQuestions.map((q) => q.id)), cards: new Set(publishedFlashcards.map((c) => c.id)) }), []);
  return (
    <section><h1>設定・更新</h1>
      <div className="card"><h2>表示設定</h2>
        <p><label>テーマ <select value={set.theme} onChange={(e) => upd((s) => { s.settings.theme = e.target.value as 'light' | 'dark'; return s; })}><option value="light">ライト</option><option value="dark">ダーク</option></select></label>{' '}
          <label>文字サイズ <select value={set.fontSize} onChange={(e) => upd((s) => { s.settings.fontSize = e.target.value as 's' | 'm' | 'l'; return s; })}><option value="s">小</option><option value="m">中</option><option value="l">大</option></select></label>{' '}
          <label>表示密度 <select value={set.density} onChange={(e) => upd((s) => { s.settings.density = e.target.value as 'comfortable' | 'compact'; return s; })}><option value="comfortable">標準</option><option value="compact">コンパクト</option></select></label></p>
        <p><label><input type="checkbox" checked={set.reduceMotion} onChange={(e) => upd((s) => { s.settings.reduceMotion = e.target.checked; return s; })} /> アニメーションを抑制する</label></p>
        <p><label>起動時に最初に開くモード <select value={set.startMode} onChange={(e) => upd((s) => { s.settings.startMode = e.target.value as Mode; return s; })}><option value="g">G検定取得</option><option value="passport">生成AIパスポート</option><option value="literacy">AI教養</option></select></label> <span className="muted small">次にアプリを開いた時から適用されます</span></p>
        <p><label>1日の学習目標（分） <input type="number" min={5} max={180} value={state.dailyGoalMin} onChange={(e) => { const v = e.target.valueAsNumber; if (Number.isFinite(v)) upd((s) => { s.dailyGoalMin = clampGoal(v); return s; }); }} style={{ width: 80 }} /></label></p>
      </div>
      <div className="card"><h2>教材の更新</h2>
        <button className="primary touch" disabled={busy} onClick={async () => { setBusy(true); const r = await checkUpdate(BUNDLED_CONTENT_VERSION); setMsg(r.message); upd((s) => { s.lastUpdateCheck = { at: new Date().toISOString(), result: r.status }; return s; }); setBusy(false); }}>教材の更新を確認</button>
        {msg && <p role="status">{msg}</p>}
        <p className="muted">現在の教材：{BUNDLED_CONTENT_VERSION}（このアプリに同梱）／G検定シラバス：G2024#6以降適用版、試験制度：オンライン100分・会場120分、各145問程度（JDLA公式で{SYLLABUS_VERIFIED_AT}確認）／生成AIパスポートシラバス：2027年2月試験より適用版、試験制度：IBT 60分・60問（GUGA公式で2026-11-11確認）。新しい版は再読み込みで反映され、学習記録は保持されます。</p>
      </div>
      <div className="card"><h2>学習記録の管理</h2>
        <p className="controls">
          <button onClick={() => download(`ai-learning-backup-${todayStr()}.json`, exportState(state))}>記録をエクスポート（JSON）</button>
          <label className="filebtn">記録を読み込む<input type="file" accept="application/json,.json" onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (!f) return;
            const text = await f.text();
            
            setImportResult(validateImport(text, validIds));
            setDataMsg('');
          }} /></label>
          <button onClick={() => { if (confirm('学習記録をすべて初期化しますか？この操作は元に戻せません。')) { setState(defaultState()); setDataMsg('学習記録を初期化しました。'); } }}>記録を初期化</button>
        </p>
        {importResult && !importResult.ok && (
          <div role="alert"><p className="bad">読み込めませんでした。現在の記録は変更していません。</p>
            <ul>{importResult.errors.map((er) => <li key={er}>{er}</li>)}</ul>
            <p><button onClick={() => { setImportResult(null); }}>閉じる</button></p></div>
        )}
        {importResult && importResult.ok && importResult.state && importResult.summary && (
          <div className="card">
            <h3>取り込み内容の確認</h3>
            <p>現在の記録（回答 {state.answers.length}件・模試 {state.exams.filter((e) => e.status === 'submitted').length}回）を、次の記録で置き換えますか？</p>
            <div className="tablewrap"><table><thead><tr><th></th><th>現在</th><th>取り込み後</th></tr></thead><tbody>
              <tr><td>回答</td><td>{state.answers.length}件</td><td>{importResult.summary.answers}件</td></tr>
              <tr><td>模試</td><td>{state.exams.length}件</td><td>{importResult.summary.exams}件</td></tr>
              <tr><td>ブックマーク</td><td>{state.bookmarks.length}件</td><td>{importResult.summary.bookmarks}件</td></tr>
              <tr><td>学習済み教材</td><td>{state.lessonsDone.length}件</td><td>{importResult.summary.lessonsDone}件</td></tr>
              <tr><td>復習予定</td><td>{Object.keys(state.review).length}件</td><td>{importResult.summary.reviewCards}件</td></tr>
              <tr><td>単語帳の復習予定</td><td>{Object.keys(state.cardReview).length}件</td><td>{importResult.summary.flashcardsDue}件</td></tr>
            </tbody></table></div>
            <p className="controls">
              <button className="primary touch" onClick={() => {
                try { localStorage.setItem(BACKUP_KEY, exportState(state)); } catch { /* 現在の記録の退避に失敗しても、取り込み自体は可能 */ }
                setState(importResult.state!); setImportResult(null); setDataMsg('学習記録を読み込みました。取り込み前の記録は退避しました。');
              }}>この内容で置き換える</button>
              <button onClick={() => { setImportResult(null); }}>やめる</button>
            </p>
          </div>
        )}
        {dataMsg && <p role="status">{dataMsg}</p>}
        <p className="muted">学習記録はこのブラウザ内にのみ保存され、外部には送信されません。ブラウザのデータ削除や端末の故障で失われるため、定期的なエクスポートをおすすめします。</p>
      </div>
    </section>
  );
}
