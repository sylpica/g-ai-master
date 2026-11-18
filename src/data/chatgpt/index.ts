import { makeCard, makeExercise, makeQuestions } from './model';
import { chapter1, chapter2, chapter3, chapter4 } from './foundations';
import { chapter5, chapter6 } from './work';
import { chapter7, chapter8 } from './applications';
import { CARD_TEXT } from './cards';
import { QUIZZES } from './questions';
import { EXERCISE_TEXT } from './exercises';
import type { Exercise, LessonVisual } from '../../types';

export { CHATGPT_SYLLABUS } from './model';

const content = [...chapter1, ...chapter2, ...chapter3, ...chapter4, ...chapter5, ...chapter6, ...chapter7, ...chapter8];
export const CHATGPT_LESSONS = content.map(({ lesson }) => lesson);
export const CHATGPT_VISUALS: Record<string, LessonVisual> = Object.assign({}, ...content.map(({ visuals }) => visuals));
export const CHATGPT_VISUAL_IDS = Object.fromEntries(CHATGPT_LESSONS.map((lesson) => [lesson.id, lesson.visualIds ?? []]));
export const CHATGPT_QUESTIONS = CHATGPT_LESSONS.flatMap((lesson, i) => makeQuestions(lesson, i + 1, QUIZZES[i + 1]));
export const CHATGPT_CARDS = CARD_TEXT.map((card, i) => makeCard(card, i, CHATGPT_LESSONS[card[0] - 1]));
export const CHATGPT_EXERCISES_BY_LESSON: Record<string, Exercise> = Object.fromEntries(
  CHATGPT_LESSONS.flatMap((lesson, index) => {
    const text = EXERCISE_TEXT[index + 1];
    return text ? [[lesson.id, makeExercise(lesson, text)]] : [];
  }),
);
