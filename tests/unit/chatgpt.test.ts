import bookMemo from '../../docs/chatgpt-codex/reading-book.md?raw';
import { describe, expect, it } from 'vitest';
import { CHATGPT_EXERCISES_BY_LESSON } from '../../src/data/chatgpt';
import { publishedLessons } from '../../src/data/lessons';
import { publishedQuestions } from '../../src/data/questions';
import { publishedFlashcards } from '../../src/data/flashcards';
import { ALL_SYLLABUS } from '../../src/data/syllabus';
import { LESSON_VISUALS, LESSON_VISUAL_IDS } from '../../src/data/lessonVisuals';
import { defaultState, parseState } from '../../src/lib/storage';
import type { SourceRef } from '../../src/types';

const chapters = ALL_SYLLABUS.filter((node) => node.mode === 'chatgpt');
const lessons = publishedLessons.filter((lesson) => lesson.mode === 'chatgpt');
const questions = publishedQuestions.filter((question) => question.mode === 'chatgpt');
const cards = publishedFlashcards.filter((card) => card.mode === 'chatgpt');

function assertSources(sources: SourceRef[]) {
  expect(sources.some((source) => source.title.includes('インプレス') && source.url.startsWith('https://book.impress.co.jp/'))).toBe(true);
  expect(sources.some((source) => /^https:\/\/(?:[\w-]+\.)?(?:openai\.com|chatgpt\.com)\//.test(source.url))).toBe(true);
}

describe('ChatGPT・Codexのコンテンツ', () => {
  it('件数と連番IDを維持し、章・教材・演習を対応付ける', () => {
    expect(chapters.map((node) => node.id)).toEqual(Array.from({ length: 8 }, (_, i) => `cx-ch${i + 1}`));
    expect(lessons.map((lesson) => lesson.id)).toEqual(Array.from({ length: 56 }, (_, i) => `les-cx-${String(i + 1).padStart(2, '0')}`));
    expect(questions.map((question) => question.id)).toEqual(Array.from({ length: 112 }, (_, i) => `q-cx-${String(i + 1).padStart(3, '0')}`));
    expect(cards.map((card) => card.id)).toEqual(Array.from({ length: 90 }, (_, i) => `fc-cx-${String(i + 1).padStart(3, '0')}`));
    expect(chapters.map((node) => lessons.filter((lesson) => lesson.syllabusId === node.id).length)).toEqual([5, 8, 5, 5, 11, 11, 7, 4]);
    const promptKeys = ['08', '10', '11', '12', '13', '15', '16', '17', '18', '22', '23',
      ...Array.from({ length: 10 }, (_, i) => String(25 + i)), ...Array.from({ length: 10 }, (_, i) => String(36 + i)),
      '47', '48', '49', '50', '51', '52', '54', '55', '56'];
    expect(Object.keys(CHATGPT_EXERCISES_BY_LESSON)).toEqual(promptKeys.map((num) => `les-cx-${num}`));
    expect(new Set(Object.values(CHATGPT_EXERCISES_BY_LESSON).map((exercise) => exercise.id)).size).toBe(40);
  });

  it('各教材に必須段落と固有図表があり、有料版の前提を明示する', () => {
    const visuals = new Set<string>();
    for (const lesson of lessons) {
      expect(lesson.basic.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.detail.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.detail.some((text) => text.includes('指示例')), lesson.id).toBe(true);
      expect(lesson.keyPoints.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.pitfalls.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(LESSON_VISUAL_IDS[lesson.id], lesson.id).toEqual(lesson.visualIds);
      expect(lesson.visualIds?.length, lesson.id).toBeGreaterThanOrEqual(2);
      for (const id of lesson.visualIds!) {
        expect(LESSON_VISUALS[id], id).toBeDefined();
        expect(visuals.has(id), id).toBe(false);
        visuals.add(id);
      }
      assertSources(lesson.sources);
    }
    for (const n of ['19', '20', '21', '22', '23', '38', '52']) {
      expect(lessons.find((lesson) => lesson.id === `les-cx-${n}`)?.advancedNote).toContain('有料版（ChatGPT Plus）');
    }
  });

  it('演習に教材との対応、手順、自己評価、改善例、出典を持つ', () => {
    for (const [lessonId, exercise] of Object.entries(CHATGPT_EXERCISES_BY_LESSON)) {
      const lesson = lessons.find((item) => item.id === lessonId);
      expect(exercise.syllabusId, exercise.id).toBe(lesson?.syllabusId);
      expect(exercise.id).toBe(lessonId.replace('les-', 'ex-'));
      expect(exercise.mode).toBe('chatgpt');
      expect(exercise.steps.length).toBeGreaterThanOrEqual(3);
      expect(exercise.constraints.length).toBeGreaterThanOrEqual(2);
      expect(exercise.rubric.length).toBeGreaterThanOrEqual(2);
      for (const field of [exercise.background, exercise.goal, exercise.modelThinking, exercise.failureExample, exercise.improvementExample]) {
        expect(field.trim().length, exercise.id).toBeGreaterThan(5);
      }
      assertSources(exercise.sources);
    }
  });

  it('１教材２問で選択肢別理由と基本・詳細解説があり、正答位置が均等', () => {
    const positions = [0, 0, 0, 0];
    for (const lesson of lessons) {
      const pair = questions.filter((question) => question.groupId === lesson.id);
      expect(pair.length, lesson.id).toBe(2);
      for (const question of pair) {
        expect(question.syllabusId).toBe(lesson.syllabusId);
        expect(question.type).toBe('single');
        expect(question.answer).toHaveLength(1);
        expect(question.answer[0]).toBeGreaterThanOrEqual(0);
        expect(question.answer[0]).toBeLessThan(4);
        positions[question.answer[0]] += 1;
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choiceReasons).toHaveLength(4);
        expect(question.choices.every((choice) => Boolean(choice.trim()))).toBe(true);
        expect(question.choiceReasons.every((reason) => Boolean(reason.trim()))).toBe(true);
        expect(question.basic.trim().length).toBeGreaterThan(10);
        expect(question.detail.trim().length).toBeGreaterThan(10);
        assertSources(question.sources);
      }
    }
    expect(positions).toEqual([28, 28, 28, 28]);
  });

  it('用語集７４語と各章の要点２枚を収録する', () => {
    const glossary = bookMemo.split('## 用語集の用語リスト')[1];
    const terms = [...glossary.matchAll(/^\d+\. (.+)$/gm)].map((match) => match[1].trim());
    expect(terms).toHaveLength(74);
    expect(cards.slice(0, 74).map((card) => card.term)).toEqual(terms);
    expect(new Set(cards.map((card) => card.term)).size).toBe(90);
    for (const chapter of chapters) expect(cards.slice(74).filter((card) => card.syllabusId === chapter.id)).toHaveLength(2);
    for (const card of cards) {
      expect(card.example?.trim()).toBeTruthy();
      expect(card.confusion?.trim()).toBeTruthy();
      assertSources(card.sources);
    }
  });

  it('保存キーの既定値と互換性を保ち、新モードと起動設定を読み込める', () => {
    const state = defaultState();
    expect(state.settings.startMode).toBe('g');
    state.mode = 'chatgpt';
    state.settings.startMode = 'chatgpt';
    state.lessonsDone = ['les-g01', 'les-cx-08'];
    state.exerciseChecks = { 'ex-01': [0], 'ex-cx-08': [1] };
    expect(parseState(JSON.stringify(state)).state).toMatchObject(state);
  });
});
