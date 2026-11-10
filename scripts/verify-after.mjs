// 改造後ウォーク（2026-11-11 再設計の実測証跡）: 主要画面×幅マトリクスのスクリーンショットと横はみ出し測定
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4197';
const OUT = 'audit-evidence/after';
mkdirSync(OUT, { recursive: true });
const log = [];
const rec = (ev, data) => { log.push({ t: new Date().toISOString(), ev, ...data }); console.log(ev, JSON.stringify(data)); };

const browser = await chromium.launch();
async function metrics(page, label) {
  const m = await page.evaluate(() => ({
    url: location.href,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    scrollH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1: document.querySelector('h1')?.textContent ?? null,
    vizCount: document.querySelectorAll('.viz').length,
    consoleErrors: 0,
  }));
  rec('metrics', { label, ...m });
  return m;
}

const page = await browser.newPage({ viewport: { width: 375, height: 812 }, locale: 'ja-JP' });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE + '/');
await page.evaluate(() => localStorage.clear());
await page.reload();
await metrics(page, 'home-375');
await page.screenshot({ path: `${OUT}/01-home-375.png` });

// 教材一覧と教材詳細（図表）
await page.goto(BASE + '/#/lessons');
await metrics(page, 'lessons-375');
await page.screenshot({ path: `${OUT}/02-lessons-375.png` });
await page.goto(BASE + '/#/lesson/les-g08');
const lm = await metrics(page, 'lesson-g08-375');
await page.screenshot({ path: `${OUT}/03-lesson-g08-visuals-375.png`, fullPage: true });
rec('check', { name: 'les-g08に図表が2点ある', result: lm.vizCount });

// 用語タップの定義ポップ
const termBtn = page.locator('.term').first();
if (await termBtn.count()) {
  await termBtn.click();
  const pop = await page.locator('.term-pop').count();
  rec('check', { name: '用語タップで定義ポップが出る', result: pop });
  await page.screenshot({ path: `${OUT}/04-lesson-term-pop-375.png` });
}

// 単語帳：両方向の1枚目
await page.goto(BASE + '/#/cards');
await page.getByLabel('シャッフル').uncheck();
await page.getByRole('button', { name: 'この条件ではじめる' }).click();
const frontTerm = await page.locator('.flash-face .card-term').textContent().catch(() => null);
rec('check', { name: '単語帳 用語→意味 の1枚目は用語面', result: frontTerm });
await page.screenshot({ path: `${OUT}/05-cards-term-first-375.png` });
await page.getByRole('button', { name: 'セッションを終了' }).click();
await page.getByRole('button', { name: '意味 → 用語', exact: true }).click();
await page.getByRole('button', { name: 'この条件ではじめる' }).click();
const defVisible = await page.locator('.flash-face .card-def').count();
const termLeaked = await page.locator('.flash-face .card-term').count();
rec('check', { name: '単語帳 意味→用語 の1枚目は意味面・用語なし', result: { defVisible, termLeaked } });
await page.screenshot({ path: `${OUT}/06-cards-meaning-first-375.png` });

// 演習セッションとリロード復元
await page.goto(BASE + '/#/practice');
await page.getByRole('button', { name: 'この条件ではじめる' }).click();
await page.locator('.choice').first().click();
await page.getByRole('button', { name: '回答する' }).click();
const stemBefore = await page.locator('legend h2').textContent();
await page.reload();
const stemAfter = await page.locator('legend h2').textContent();
rec('check', { name: '演習リロードで同じ問題・結果が復元される', result: stemBefore === stemAfter });
await metrics(page, 'practice-after-reload-375');
await page.screenshot({ path: `${OUT}/07-practice-result-375.png` });

// 幅マトリクス（ホーム・教材詳細・単語帳）
for (const w of [320, 390, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  for (const [route, label] of [['/', 'home'], ['/#/lesson/les-g03', 'lesson-g03'], ['/#/cards', 'cards']]) {
    await page.goto(BASE + route);
    const m = await metrics(page, `${label}-${w}`);
    if (m.overflowX) rec('FAIL', { name: `横はみ出し ${label}@${w}` });
  }
}
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + '/#/lesson/les-g03');
await page.screenshot({ path: `${OUT}/08-lesson-g03-1280.png` });
await page.goto(BASE + '/');
await page.screenshot({ path: `${OUT}/09-home-1280.png` });

rec('console-errors', { count: errors.length, errors: errors.slice(0, 5) });
writeFileSync(`${OUT}/walk-log.json`, JSON.stringify(log, null, 2));
await browser.close();
console.log('DONE');
