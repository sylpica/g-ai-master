import { test, expect } from '@playwright/test';

// 生成AIパスポートモード（2026-11-11 追加）と起動モード設定の検証
test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('生成AIパスポートモード：ホームとナビがG検定と同じ構成になる', async ({ page }) => {
  await page.getByRole('button', { name: '生成AIパスポート', exact: true }).click();
  await expect(page.getByRole('heading', { name: '生成AIパスポート ダッシュボード' })).toBeVisible();
  const labels = await page.getByLabel('主要メニュー').getByRole('button').allTextContents();
  expect(labels.map((s) => s.replace(/\d+$/, ''))).toEqual(['ホーム', '教材', '単語帳', '演習', '模試', '復習', '分析', '設定']);
});

test('生成AIパスポート：教材・演習・単語帳が使える', async ({ page }) => {
  await page.getByRole('button', { name: '生成AIパスポート', exact: true }).click();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await expect(page.getByText(/les-p|AIの基礎と歴史|生成AI/).first()).toBeVisible();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await expect(page.locator('legend h2')).not.toHaveText('');
  await page.locator('.choice').first().click();
  // 単一選択は選んだ瞬間に判定される（即時フィードバック）
  await expect(page.getByText(/正解です|不正解です/)).toBeVisible();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await expect(page.locator('.flash-face')).toBeVisible();
});

test('生成AIパスポート：フル模試は60問・60分で一時停止できない', async ({ page }) => {
  await page.getByRole('button', { name: '生成AIパスポート', exact: true }).click();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '模試' }).click();
  const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'フル模試' }) });
  await expect(card.getByText(/60問／60分/)).toBeVisible();
  await card.getByRole('button', { name: '開始' }).click();
  await expect(page.getByText(/回答 0／60問/)).toBeVisible();
  await expect(page.getByRole('button', { name: '一時停止' })).toHaveCount(0);
});

test('設定：起動時に最初に開くモードを選ぶと、再読み込みでそのモードが開く', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '設定' }).click();
  await page.getByLabel(/起動時に最初に開くモード/).selectOption('passport');
  await page.reload(); // 画面（設定）は復元されるため、ホームへ移動してモードを確認する
  await page.getByLabel('主要メニュー').getByRole('button', { name: 'ホーム' }).click();
  await expect(page.getByRole('heading', { name: '生成AIパスポート ダッシュボード' })).toBeVisible();
  // 別のモードへ切り替えても、再読み込みすると起動モードに戻る
  await page.getByRole('button', { name: 'AI教養', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'AI教養 ダッシュボード' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '生成AIパスポート ダッシュボード' })).toBeVisible();
});

test('設定：起動モードの既定はG検定', async ({ page }) => {
  await page.reload();
  await expect(page.getByRole('heading', { name: 'G検定取得 ダッシュボード' })).toBeVisible();
});
