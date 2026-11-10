import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ja-JP' });
const page = await ctx.newPage();
// settingsだけ壊れた実データ相当（回答・ブックマークは正常）を仕込む
const seed = JSON.stringify({ schemaVersion: 1, mode: 'g', answers: [{ questionId: 'q-g01-1', selected: [0], correct: true, at: '2026-11-01T00:00:00.000Z', seconds: 30, firstSeen: true, context: 'practice' }], lessonsDone: ['les-g01'], bookmarks: ['q:q-g01-1'], review: {}, exams: [], exerciseChecks: {}, settings: 'broken', contentVersion: '2026.11.5', dailyGoalMin: 20 });
await page.goto('http://localhost:4195/', { waitUntil: 'domcontentloaded' });
await page.evaluate((v) => localStorage.setItem('g-ai-master:state:v1', v), seed);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const after = await page.evaluate(() => ({ main: localStorage.getItem('g-ai-master:state:v1'), backup: localStorage.getItem('g-ai-master:state:v1:backup') }));
const parsed = JSON.parse(after.main ?? '{}');
console.log(JSON.stringify({ seedKept: after.main === seed, answersAfter: parsed.answers?.length, bookmarksAfter: parsed.bookmarks, backupExists: !!after.backup, alertShown: await page.locator('[role="alert"]').count() }, null, 1));
await browser.close();
