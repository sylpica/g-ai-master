import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('全統合モード：全モードの教材・問題・単語帳を横断できる', async ({ page }) => {
  await page.getByLabel('学習モード').getByRole('button', { name: '全統合', exact: true }).click();
  await expect(page.getByRole('heading', { name: /全統合 ダッシュボード/ })).toBeVisible();
  // 演習は全954問が対象になる
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await expect(page.getByText('対象は954問です。')).toBeVisible();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  // 問題のメタ情報に出典モードが表示される
  await expect(page.locator('.meta').first()).toContainText(/G検定|生成AIパスポート|AI教養|ChatGPT・Codex/);
  await page.getByRole('button', { name: 'セッションを終了' }).click();
  // 単語帳は全489枚が対象になる
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await expect(page.getByRole('heading', { name: /単語帳（全統合）/ })).toBeVisible();
  await expect(page.getByText(/学習済み 0／489枚/)).toBeVisible();
  // 教材一覧にはモード名付きで全モードの教材が並ぶ
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await expect(page.getByText(/ChatGPT・Codex：/).first()).toBeVisible();
  await expect(page.getByText(/G検定：/).first()).toBeVisible();
});

test('全統合モードでも教材リンクで個別モードへ切り替わらない', async ({ page }) => {
  await page.getByLabel('学習モード').getByRole('button', { name: '全統合', exact: true }).click();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await page.getByRole('button', { name: /人工知能とは：定義/ }).click();
  await expect(page.getByRole('heading', { name: /人工知能とは/ })).toBeVisible();
  await page.getByRole('button', { name: '← 教材一覧へ' }).click();
  // 一覧に戻っても全統合のまま（見出しが全統合 教材）
  await expect(page.getByRole('heading', { name: /全統合 教材/ })).toBeVisible();
});

test('教材の専門用語をタップすると定義が開き、単語帳へ進める', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await page.getByRole('button', { name: /人工知能とは：定義/ }).click();
  await page.getByRole('tab', { name: '解説', exact: true }).click();
  const term = page.getByRole('tabpanel').locator('button.term').first();
  await expect(term).toBeVisible();
  await term.click();
  const pop = page.getByRole('tabpanel').locator('.term-pop').first();
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('単語帳で開く');
  await pop.getByRole('button', { name: '単語帳で開く' }).click();
  await expect(page.getByRole('heading', { name: /単語帳/ })).toBeVisible();
});

test('演習の問題文と解説の専門用語をタップすると定義が開く', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  // 出題順はランダムなので、解説に用語ボタン（button.term）が出る問題まで最大6問進む
  // （選択肢内の用語は span.term で描画されるため、button.term は問題文・解説側の用語だけを指す）
  let found = false;
  for (let i = 0; i < 6 && !found; i++) {
    await page.locator('.choice').first().click();
    await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
    if (await page.locator('button.term').count()) {
      found = true;
      break;
    }
    await page.getByRole('button', { name: '次の問題' }).click();
  }
  expect(found).toBe(true);
  await page.locator('button.term').first().click();
  await expect(page.locator('.term-pop').first()).toBeVisible();
});
