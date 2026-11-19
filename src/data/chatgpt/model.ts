import { mulberry32, shuffled } from '../../lib/random';
import type { Exercise, Flashcard, Lesson, LessonVisual, Question, SourceRef, SyllabusNode } from '../../types';

const BOOK: SourceRef = {
  title: 'インプレス『できるChatGPT Work&Codex 仕事を自走させるAIエージェント実践術』',
  url: 'https://book.impress.co.jp/books/1126101075',
};

export const OFFICIAL = {
  work: { title: 'OpenAI Help Center — ChatGPT Work and Codex', url: 'https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex' },
  prompt: { title: 'OpenAI Help Center — プロンプトの書き方', url: 'https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt' },
  project: { title: 'OpenAI Help Center — ChatGPTのプロジェクト', url: 'https://help.openai.com/en/articles/10169521-projects-in-chatgpt' },
  files: { title: 'OpenAI Help Center — ファイルのアップロード', url: 'https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt' },
  data: { title: 'OpenAI Help Center — ChatGPTでのデータ分析', url: 'https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt' },
  security: { title: 'OpenAI — エージェントの承認とセキュリティ', url: 'https://developers.openai.com/codex/agent-approvals-security' },
  parallel: { title: 'OpenAI — サブエージェント', url: 'https://developers.openai.com/codex/multi-agent' },
  download: { title: 'OpenAI — ChatGPT公式ダウンロード', url: 'https://openai.com/chatgpt/download/' },
  pricing: { title: 'OpenAI — ChatGPTプランと料金', url: 'https://openai.com/chatgpt/pricing/' },
  policy: { title: 'OpenAI — 利用ポリシー', url: 'https://openai.com/policies/usage-policies/' },
  plugins: { title: 'OpenAI Help Center — ChatGPTのプラグイン', url: 'https://help.openai.com/en/articles/20001256-plugins-in-chatgpt' },
  apps: { title: 'OpenAI Help Center — ChatGPTの接続済みアプリ', url: 'https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt' },
  skills: { title: 'OpenAI Help Center — ChatGPTのスキル', url: 'https://help.openai.com/en/articles/20001066-skills-in-chatgpt' },
  sites: { title: 'OpenAI — ChatGPT Sites', url: 'https://chatgpt.com/features/sites/' },
  codex: { title: 'OpenAI — Codexドキュメント', url: 'https://developers.openai.com/codex/' },
} satisfies Record<string, SourceRef>;

export const VERIFIED = '2026-11-19';
const metadata = { mode: 'chatgpt', version: 1, status: 'published', verifiedAt: VERIFIED } as const;
const numbered = (prefix: string, n: number, width: number) => prefix + String(n).padStart(width, '0');
export const lessonId = (n: number) => numbered('les-cx-', n, 2);
const answerPositions = shuffled(Array.from({ length: 112 }, (_, i) => i % 4), mulberry32(20261116));
const questionId = (n: number) => numbered('q-cx-', n, 3);

export const CHAPTERS = [
  'ChatGPT Workとは',
  'プロジェクトの効率的な運用を覚えよう',
  'ChatGPT Workに仕事を任せるには',
  'プラグインとスキルを使いこなすには',
  '資料から判断材料を抽出するには',
  'スライドやダッシュボードを生成するには',
  'AIエージェントを学びや暮らしに役立てるには',
  'Codexでバイブコーディングに挑戦するには',
];
const lastLessons = [5, 13, 18, 23, 34, 45, 52, 56];
export const CHATGPT_SYLLABUS: SyllabusNode[] = CHAPTERS.map((title, i) => ({
  id: `cx-ch${i + 1}`, mode: 'chatgpt', order: i + 1, chapter: `第${i + 1}章`,
  area: i < 3 ? '基本編' : '活用編', title, prerequisites: [],
}));
export const chapterOf = (n: number) => CHATGPT_SYLLABUS[lastLessons.findIndex((last) => n <= last)].id;
const paidInBook = new Set([19, 20, 21, 22, 23, 38, 52]);

type LessonText = Pick<Lesson, 'title' | 'basic' | 'detail' | 'keyPoints' | 'pitfalls'>;
type Box = [label: string, note: string];

export function makeLesson(n: number, source: keyof typeof OFFICIAL, text: LessonText,
  flow: [title: string, ...steps: Box[]], checks: [title: string, left: Box, right: Box],
) {
  const id = lessonId(n);
  const visualIds = [`${id}-flow`, `${id}-checks`];
  const [flowTitle, ...steps] = flow;
  const [checksTitle, [leftLabel, leftNote], [rightLabel, rightNote]] = checks;
  const lesson: Lesson = {
    ...metadata, id, syllabusId: chapterOf(n), ...text, visualIds,
    sources: [BOOK, OFFICIAL[source]], createdAt: VERIFIED, reviewBy: '2027-05-19',
    ...(paidInBook.has(n) && {
      advancedNote: '書籍ではこの機能を有料版（ChatGPT Plus）で扱います。現在の利用可否はプラン、接続先、組織設定によって変わります。この教材と演習の自己評価は契約なしで利用できます。',
    }),
  };
  const visuals: Record<string, LessonVisual> = {
    [visualIds[0]]: { kind: 'flow', title: flowTitle, steps: steps.map(([label, note]) => ({ label, note })) },
    [visualIds[1]]: { kind: 'compare', title: checksTitle,
      left: { head: leftLabel, points: [leftNote] }, right: { head: rightLabel, points: [rightNote] } },
  };
  return { lesson, visuals };
}

export function makeExercise(lesson: Lesson, text: Pick<Exercise,
  'title' | 'background' | 'goal' | 'constraints' | 'steps' | 'rubric' | 'modelThinking' | 'failureExample' | 'improvementExample'
>): Exercise {
  return { ...metadata, id: lesson.id.replace('les-', 'ex-'), syllabusId: lesson.syllabusId, sources: lesson.sources, ...text };
}

type Choice = [text: string, reason: string];
export type Quiz = [stem: string, basic: string, detail: string, correct: Choice, ...distractors: [Choice, Choice, Choice]];

export function makeQuestions(lesson: Lesson, n: number, pair: [Quiz, Quiz]): Question[] {
  return pair.map(([stem, basic, detail, correct, ...distractors], i) => {
    const order = (n - 1) * 2 + i;
    const answer = answerPositions[order];
    const choices = [...distractors];
    choices.splice(answer, 0, correct);
    const id = questionId(order + 1);
    return {
      ...metadata, id, syllabusId: lesson.syllabusId, conceptId: id, groupId: lesson.id, type: 'single',
      stem, choices: choices.map(([text]) => text), answer: [answer], difficulty: i === 0 ? 1 : 2,
      basic, detail, choiceReasons: choices.map(([, reason]) => reason), sources: lesson.sources, createdAt: VERIFIED,
    };
  });
}

export type CardText = [lesson: number, term: string, definition: string, example: string, confusion: string];
export function makeCard([n, term, definition, example, confusion]: CardText, i: number, lesson: Lesson): Flashcard {
  const id = numbered('fc-cx-', i + 1, 3);
  return {
    id, conceptId: id, mode: 'chatgpt', lessonId: lesson.id, syllabusId: lesson.syllabusId, difficulty: 1,
    questionIds: [questionId(2 * n - 1), questionId(2 * n)], sources: lesson.sources, verifiedAt: VERIFIED,
    term, definition, reversePrompt: definition, example, confusion,
  };
}

// レッスン原稿の順序を揃え、公開データでは各項目を名前付きで参照する。
export function lessonText(title: string, basic: LessonText['basic'], detail: LessonText['detail'],
  keyPoints: LessonText['keyPoints'], pitfalls: LessonText['pitfalls']): LessonText {
  return { title, basic, detail, keyPoints, pitfalls };
}
