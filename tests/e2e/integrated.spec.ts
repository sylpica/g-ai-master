import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('全統合モード：全モードの教材・問題・単語帳を横断できる', async ({ page }) => {
  await page.getByLabel('学習モード').getByRole('button', { name: '全統合', exact: true }).click();
  await expect(page.getByRole('heading', { name: /全統合 ダッシュボード/ })).toBeVisible();
  // 演習は全998問が対象になる
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await expect(page.getByText('対象は998問です。')).toBeVisible();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  // 問題のメタ情報に出典モードが表示される
  await expect(page.locator('.meta').first()).toContainText(/G検定|生成AIパスポート|AI教養|ChatGPT・Codex/);
  await page.getByRole('button', { name: 'セッションを終了' }).click();
  // 単語帳は全696枚が対象になる（2026-11-24 パスポート索引の英字カード28枚＋日本語カード179枚を追加）
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await expect(page.getByRole('heading', { name: /単語帳（全統合）/ })).toBeVisible();
  await expect(page.getByText(/学習済み 0／696枚/)).toBeVisible();
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

test('教材一覧の章説明にも用語リンクがあり、タップしても教材は開かない', async ({ page }) => {
  await page.getByLabel('学習モード').getByRole('button', { name: '生成AIパスポート', exact: true }).click();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  const term = page.locator('.lesson-row small .term').first();
  await expect(term).toBeVisible();
  await term.click();
  await expect(page.locator('.lesson-row .term-pop').first()).toBeVisible();
  // 教材詳細へは遷移していない（一覧の見出しのまま）
  await expect(page.getByRole('heading', { name: /教材/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: '← 教材一覧へ' })).toHaveCount(0);
});

test('教材の図表（表のセル）の用語をタップすると定義が開く', async ({ page }) => {
  await page.getByLabel('学習モード').getByRole('button', { name: '生成AIパスポート', exact: true }).click();
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await page.getByRole('button', { name: /生成AIの実践と活用事例/ }).click();
  const cellTerm = page.locator('.viz td .term', { hasText: 'Few-Shot' }).first();
  await expect(cellTerm).toBeVisible();
  await cellTerm.click();
  await expect(page.locator('.viz .term-pop').first()).toBeVisible();
  await expect(page.locator('.viz .term-pop').first()).toContainText('Few-Shot');
});

test('単語帳の裏面の用語をタップすると定義が開き、カードは裏返らない', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  let found = false;
  for (let i = 0; i < 8 && !found; i++) {
    await page.locator('.flash-face').click();
    await expect(page.getByRole('button', { name: '覚えた', exact: true })).toBeVisible();
    if (await page.locator('.flash-face .term').count()) { found = true; break; }
    await page.getByRole('button', { name: '覚えた', exact: true }).click();
  }
  expect(found).toBe(true);
  await page.locator('.flash-face .term').first().click();
  await expect(page.locator('.flash-face .term-pop').first()).toBeVisible();
  // 用語タップでカードが表面に戻っていない（自己評価ボタンが見えたまま）
  await expect(page.getByRole('button', { name: '覚えた', exact: true })).toBeVisible();
});

test('演習の選択肢：用語に余計な空白が出ず、回答後は用語をタップできる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  let verified = false;
  for (let i = 0; i < 8 && !verified; i++) {
    // 回答前：選択肢のテキストはブロック表示で、用語マークが横幅いっぱいに伸びていない
    const ctextDisplay = await page.locator('.choice .ctext').first().evaluate((el) => getComputedStyle(el).display);
    expect(ctextDisplay).toBe('block');
    const mark = page.locator('.choice .term-mark').first();
    if (await mark.count()) {
      const widths = await mark.evaluate((el) => ({ mark: el.getBoundingClientRect().width, choice: el.closest('.choice')!.getBoundingClientRect().width }));
      expect(widths.mark).toBeLessThan(widths.choice * 0.9);
    }
    await page.locator('.choice').first().click();
    const answerBtn = page.getByRole('button', { name: '回答する' });
    if (await answerBtn.count()) await answerBtn.click();
    await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
    // 回答後：選択肢・理由内の用語がタップ可能になり、押しても結果表示は変わらない
    const term = page.locator('.choice .term[role="button"]').first();
    if (await term.count()) {
      // 親ボタンが aria-disabled のため Playwright の actionability が「無効」と判定するが、
      // 実ブラウザでは span のクリックは通常どおり届く（force はその実挙動どおりに発火させる）
      await term.click({ force: true });
      await expect(page.locator('.choice .term-pop').first()).toBeVisible();
      await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
      verified = true;
      break;
    }
    await page.getByRole('button', { name: '次の問題' }).click();
  }
  expect(verified).toBe(true);
});
