import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('初回アクセスとモード切替で状態が失われない', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /G検定取得/ })).toBeVisible();
  await page.getByLabel('学習モード').getByRole('button', { name: 'AI教養', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'AI教養' })).toBeVisible();
  await page.getByLabel('学習モード').getByRole('button', { name: 'G検定取得', exact: true }).click();
  await expect(page.getByRole('heading', { name: /ダッシュボード/ })).toBeVisible();
});

test('教材を開いて学習済みにできる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await page.getByRole('button', { name: /人工知能とは：定義/ }).click();
  await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
  await page.getByRole('button', { name: '詳細解説を開く' }).click();
  await expect(page.getByText(/代表的な古典的問題/)).toBeVisible();
  await page.getByRole('button', { name: '学習済みにする' }).click();
  await expect(page.getByRole('button', { name: '学習済み' })).toBeDisabled();
});

test('演習で回答すると正誤と解説が表示され、記録が復元される', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  const firstChoice = page.locator('.choice').first();
  await firstChoice.click();
  await page.getByRole('button', { name: '回答する' }).click();
  await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
  await expect(page.getByText(/選択肢ごとの判定理由/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/累計回答/)).toBeVisible();
  await expect(page.locator('.kpi')).toContainText('1問');
});

test('短縮模試：開始・一時停止・再開・提出・結果表示', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.getByLabel('主要メニュー').getByRole('button', { name: '模擬試験' }).click();
  await expect(page.locator('.card').filter({ has: page.getByRole('heading', { name: 'フル模擬試験' }) }).getByRole('button', { name: '開始' })).toBeEnabled(); // G300問到達でフル模試が有効
  await page.locator('.card').filter({ has: page.getByRole('heading', { name: '短縮模擬試験' }) }).getByRole('button', { name: '開始' }).click();
  await expect(page.getByText(/残り時間/)).toBeVisible();
  await page.locator('.choice').first().click();
  await page.getByRole('button', { name: '一時停止' }).click();
  await expect(page.getByText(/一時停止中/)).toBeVisible();
  await page.getByRole('button', { name: '再開' }).click();
  await page.getByRole('button', { name: '提出する' }).click();
  await expect(page.getByText(/直近の結果/)).toBeVisible();
});

test('模試の中断は再読み込み後も再開できる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '模擬試験' }).click();
  await page.locator('.card').filter({ has: page.getByRole('heading', { name: '短縮模擬試験' }) }).getByRole('button', { name: '開始' }).click();
  await expect(page.getByText(/残り時間/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/中断中の模擬試験/)).toBeVisible();
});

test('設定変更（テーマ）が保存され復元される', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '設定・更新' }).click();
  await page.locator('select').first().selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('教材の更新確認が結果を表示する', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '設定・更新' }).click();
  await page.getByRole('button', { name: '教材の更新を確認' }).click();
  await expect(page.getByRole('status')).toContainText(/教材は最新です|新しい教材|失敗しました/);
});

test('演習のシャッフルを切り替えて回答できる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  const toggle = page.getByRole('button', { name: /出題順/ });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '再シャッフル' })).toBeVisible();
  await page.locator('.choice').first().click();
  await page.getByRole('button', { name: '回答する' }).click();
  await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
});

test('モバイル幅で横スクロールが発生しない', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow2).toBeLessThanOrEqual(0);
});

test('教材検索とブックマーク絞り込みが使える', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  const search = page.locator('label', { hasText: '教材を検索' }).locator('input');
  await search.fill('畳み込み');
  await expect(page.locator('main')).toContainText('要素技術'); // 本文（基礎・詳細解説）も検索対象であることの確認
  await search.fill('存在しない教材XYZ');
  await expect(page.locator('main')).toContainText('該当する教材がありません');
  await search.fill('');
  await page.getByLabel('ブックマークのみ').check();
  await expect(page.locator('main')).toContainText('該当する教材がありません');
  await page.getByLabel('ブックマークのみ').uncheck();
  await expect(page.locator('main')).toContainText('要素技術');
});

test('AI教養のニュースタブに最新情報が表示される', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('group', { name: '学習モード' }).getByRole('button', { name: 'AI教養' }).click();
  await page.getByRole('button', { name: 'ニュース' }).click();
  await expect(page.locator('main')).toContainText('人工知能基本計画');
  await expect(page.locator('main')).toContainText('超重要');
  await expect(page.locator('main')).toContainText('最終取り込み');
});
