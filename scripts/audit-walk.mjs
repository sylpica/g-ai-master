// 監査用ウォークスルー: 現行アプリを実ブラウザで操作し、証跡（JSON＋スクリーンショット）を残す。
// 使い方: node scripts/audit-walk.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4195/g-ai-master/';
const outDir = process.argv[3] ?? 'audit-evidence/before';
fs.mkdirSync(outDir, { recursive: true });
const log = [];
const rec = (entry) => { log.push({ t: new Date().toISOString(), ...entry }); console.log(JSON.stringify(entry)); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ja-JP' });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') rec({ ev: 'console-error', text: m.text().slice(0, 300) }); });
page.on('pageerror', (e) => rec({ ev: 'pageerror', text: String(e).slice(0, 300) }));

const shot = async (name) => { await page.screenshot({ path: `${outDir}/${name}.png` }); };
const metrics = async (label) => {
  const m = await page.evaluate(() => ({
    url: location.href,
    scrollH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    h1: document.querySelector('h1')?.textContent ?? null,
  }));
  rec({ ev: 'metrics', label, ...m });
  return m;
};

// A1: 初回画面（履歴なし・375px）
await page.goto(base, { waitUntil: 'networkidle' });
await metrics('home-initial');
await shot('01-home-375');
const navLabels = await page.locator('nav.main button').allTextContents();
rec({ ev: 'nav', labels: navLabels.map((s) => s.trim()) });
const hasFlashcards = navLabels.some((s) => s.includes('単語'));
rec({ ev: 'check', name: '単語帳への導線が初回画面にあるか', result: hasFlashcards ? 'あり' : 'なし（ナビに単語帳なし）' });

// 教材を開く
await page.getByRole('button', { name: '教材', exact: true }).first().click();
await page.waitForTimeout(300);
await metrics('lessons');
await shot('02-lessons-375');
await page.locator('.lesson-row').first().click();
await page.waitForTimeout(300);
await metrics('lesson-detail');
await shot('03-lesson-detail-375');
const lessonTextLen = await page.locator('main').innerText().then((t) => t.length);
rec({ ev: 'measure', name: '教材詳細の本文文字数（main全体）', value: lessonTextLen });
await page.getByRole('button', { name: '← 教材一覧へ' }).click();
await page.waitForTimeout(200);

// 演習: 1問解く（最初の選択肢）→ 結果表示と履歴
await page.getByRole('button', { name: '演習', exact: true }).first().click();
await page.waitForTimeout(300);
await metrics('practice');
await shot('04-practice-375');
const stem1 = await page.locator('fieldset legend h2').innerText().catch(() => null);
await page.locator('button.choice').first().click();
await page.getByRole('button', { name: '回答する' }).click();
await page.waitForTimeout(400);
const fb = await page.locator('.fb').innerText().catch(() => '');
rec({ ev: 'answer', stem: stem1?.slice(0, 60), feedback: fb.slice(0, 40) });
await shot('05-practice-result-375');
const stored1 = await page.evaluate(() => JSON.parse(localStorage.getItem('g-ai-master:state:v1') ?? '{}'));
rec({ ev: 'storage', answers: stored1.answers?.length, firstAnswer: stored1.answers?.[0] ? { q: stored1.answers[0].questionId, correct: stored1.answers[0].correct, ctx: stored1.answers[0].context } : null });

// リロードするとホームに戻るか（URLが変わらない問題 P1-3）
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const afterReload = await metrics('after-reload-from-practice');
rec({ ev: 'check', name: '演習中にリロード→演習画面を維持できるか', result: afterReload.h1?.includes('ダッシュボード') ? 'ホームに戻った（P1-3再現）' : `維持: ${afterReload.h1}` });

// 復習画面: 保存ボタンがあるか（P1-1）
await page.getByRole('button', { name: /復習/ }).first().click();
await page.waitForTimeout(300);
await metrics('review');
await shot('06-review-375');
const reviewHasBookmark = await page.locator('button.bm').count();
rec({ ev: 'check', name: '復習画面に保存ボタンがあるか', result: reviewHasBookmark ? 'あり' : 'なし（P1-1再現）' });

// AI教養: 教材一覧に検索があるか（P1-4）
await page.getByRole('button', { name: 'AI教養' }).click();
await page.waitForTimeout(300);
await metrics('literacy');
const litSearch = await page.locator('input[type="search"]').count();
rec({ ev: 'check', name: 'AI教養の教材一覧に検索欄があるか', result: litSearch ? 'あり' : 'なし（P1-4再現）' });
await shot('07-literacy-375');

// 設定: インポートに壊れたschema1ファイルを使う（P0-1）※隔離コンテキスト内の操作
await page.getByRole('button', { name: '設定' }).click();
await page.waitForTimeout(300);
const before = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'));
fs.writeFileSync('/tmp/broken-import.json', JSON.stringify({ schemaVersion: 1, answers: 'broken', settings: {} }));
page.on('dialog', async (d) => { rec({ ev: 'dialog', type: d.type(), message: d.message().slice(0, 120) }); await d.accept(); });
await page.locator('input[type="file"]').setInputFiles('/tmp/broken-import.json');
await page.waitForTimeout(600);
const after = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'));
const dataMsg = await page.locator('main').innerText().then((t) => t.match(/読み込[めみ][^\n]*/) ?? '');
rec({ ev: 'check', name: '壊れたschema1 JSONのインポートで既存履歴が守られるか', result: before === after ? '不変（安全）' : '変化した（P0-1再現の疑い）', dataMsg: String(dataMsg).slice(0, 100) });
const afterState = JSON.parse(after ?? '{}');
rec({ ev: 'storage-after-import', answers: afterState.answers?.length ?? null, answersType: typeof afterState.answers });
await shot('08-settings-after-broken-import');

// 幅マトリクス（横はみ出し）
for (const w of [320, 390, 768, 1280]) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  rec({ ev: 'width', width: w, overflowX: m.sw > m.iw + 1 });
}

fs.writeFileSync(`${outDir}/walk-log.json`, JSON.stringify(log, null, 2));
await browser.close();
console.log('DONE', outDir);
