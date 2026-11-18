import { expect, test, type Page, type TestInfo } from '@playwright/test';

test.use({ viewport: { width: 375, height: 800 } });

const modes = (page: Page) => page.getByRole('group', { name: '学習モード' });
const menu = (page: Page, name: string) => page.getByRole('navigation', { name: '主要メニュー' }).getByRole('button', { name, exact: true });
const heading = (page: Page, name: string) => page.getByRole('heading', { name, exact: true });
const chatgpt = (page: Page) => modes(page).getByRole('button', { name: 'ChatGPT・Codex' });

async function checkMobileLayout(page: Page) {
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const overflow = [...document.querySelectorAll<HTMLElement>('main, .top-in, .top-in button, main button, main summary, .viz, select, fieldset')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > width + 1 ||
          element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1);
      }).map((element) => element.textContent?.trim().slice(0, 85));
    const narrowLabels = [...document.querySelectorAll<HTMLElement>('.viz-flow .fs b, .viz-side > b')]
      .filter((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const lines = range.getClientRects();
        return lines.length > 0 && (lines.length > 3 || element.parentElement!.clientWidth < 85);
      }).map((element) => element.textContent);
    return { width, documentWidth: document.documentElement.scrollWidth, overflow, narrowLabels };
  });
  expect(layout).toEqual({ width: 375, documentWidth: 375, overflow: [], narrowLabels: [] });
}

async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path });
  await info.attach(name, { path, contentType: 'image/png' });
}

test('第４モード・標準教材・演習付き教材と実践記録を375pxで確認する', async ({ page }, info) => {
  await page.goto('./');
  await expect(modes(page).getByRole('button')).toHaveText(['G検定取得', '生成AIパスポート', 'AI教養', 'ChatGPT・Codex']);
  await chatgpt(page).click();
  await expect(heading(page, 'ChatGPT・Codex ダッシュボード')).toBeVisible();
  await expect(menu(page, '模試')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/到達基準|到達まで|模擬試験/);
  await expect(page.locator('main')).toContainText('0／56件');
  await expect(page.locator('main')).toContainText('0／40件');
  await checkMobileLayout(page);
  await capture(page, info, '375px ホーム');

  await page.getByRole('button', { name: /実践演習 0／40件/ }).click();
  await expect(heading(page, 'ChatGPT・Codex 実践演習')).toBeVisible();
  await expect(page.locator('.lesson-row')).toHaveCount(40);
  await menu(page, '教材').click();
  await expect(page).toHaveURL(/#\/lessons$/);
  await expect(heading(page, 'ChatGPT・Codex 教材')).toBeVisible();
  await expect(page.getByRole('group', { name: 'AI教養の表示切替' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '要点まとめPDFを開く' })).toHaveCount(0);
  await checkMobileLayout(page);
  await capture(page, info, '375px 教材一覧');
  await page.getByRole('button', { name: 'シラバスで見る' }).click();
  await expect(heading(page, 'シラバス（ChatGPT・Codex）')).toBeVisible();
  await checkMobileLayout(page);
  await page.getByText('第2章 プロジェクトの効率的な運用を覚えよう', { exact: true }).click();
  await page.getByRole('button', { name: '企画メモから概要文書を作る' }).click();
  await expect(page).toHaveURL(/#\/lesson\/les-cx-08$/);
  await expect(page.locator('.viz')).toHaveCount(2);
  await checkMobileLayout(page);
  await capture(page, info, '375px 教材の図表');
  await page.getByRole('tab', { name: '解説', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('未決事項');
  await page.getByRole('tab', { name: '詳細・出典' }).click();
  await expect(page.getByRole('link', { name: /インプレス/ })).toBeVisible();
  await checkMobileLayout(page);
  await page.getByText('実践演習：交流会の概要を１枚にする').click();
  const check = page.getByRole('checkbox', { name: '定員と料金が一致する' });
  await check.check();
  await expect(page.locator('.ex summary')).toContainText('達成 1／2');
  await checkMobileLayout(page);
  await page.locator('.ex summary').scrollIntoViewIfNeeded();
  await capture(page, info, '375px 実践演習');

  await page.getByRole('button', { name: '学習済みにする' }).click();
  await page.getByRole('button', { name: '☆ ブックマーク' }).click();
  await page.reload();
  await expect(chatgpt(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '学習済み', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '★ ブックマーク済み' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByText('実践演習：交流会の概要を１枚にする').click();
  await expect(check).toBeChecked();
  await page.getByRole('button', { name: '← 教材一覧へ' }).click();
  await expect(page).toHaveURL(/#\/lessons$/);
});

test('演習と単語帳のセッションを375pxで使い、再読込と４モード往復で記録を保つ', async ({ page }, info) => {
  await page.goto('./');
  await menu(page, '演習').click();
  await page.getByLabel('出題順シャッフル').uncheck();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await page.locator('.choice').first().click();
  await expect(page.getByText(/正解です|不正解です/)).toBeVisible();

  await chatgpt(page).click();
  await menu(page, '演習').click();
  await expect(page.getByText('対象は112問です。')).toBeVisible();
  await checkMobileLayout(page);
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await expect(page.locator('.choice')).toHaveCount(4);
  await page.getByRole('button', { name: '議事メモを読み、次回の確認事項の草案を作る' }).click();
  await expect(page.getByText('正解です。', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '関連図表' })).toBeVisible();
  await checkMobileLayout(page);
  await capture(page, info, '375px 問題と回答');
  await page.reload();
  await expect(chatgpt(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('正解です。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '次の問題' }).click();
  await expect(page.locator('.choice')).toHaveCount(4);

  await menu(page, '単語帳').click();
  await expect(page.getByText('対象は90枚です。')).toBeVisible();
  await page.getByLabel('シャッフル', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await expect(page.locator('.card-term')).toHaveText('HTML');
  await page.getByRole('button', { name: '答えを見る' }).click();
  await checkMobileLayout(page);
  await capture(page, info, '375px 単語帳');
  await page.getByRole('button', { name: '覚えた', exact: true }).click();
  await page.reload();
  await expect(page.locator('.card-term')).toHaveText('AIエージェント');

  await menu(page, '分析').click();
  await expect(heading(page, '学習分析（ChatGPT・Codex）')).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/模試|到達度|到達基準/);
  await expect(page.locator('main')).toContainText('学習済み 1／90枚');
  await checkMobileLayout(page);

  await modes(page).getByRole('button', { name: 'AI教養' }).click();
  await expect(heading(page, 'AI教養 ダッシュボード')).toBeVisible();
  await menu(page, '教材').click();
  await expect(page.getByRole('group', { name: 'AI教養の表示切替' })).toBeVisible();
  await modes(page).getByRole('button', { name: '生成AIパスポート' }).click();
  await expect(heading(page, '生成AIパスポート ダッシュボード')).toBeVisible();
  await expect(menu(page, '模試')).toBeVisible();
  await modes(page).getByRole('button', { name: 'G検定取得' }).click();
  await expect(heading(page, 'G検定取得 ダッシュボード')).toBeVisible();
  await expect(menu(page, '模試')).toBeVisible();
  await expect(page.locator('main')).toContainText('回答 1問');
  await chatgpt(page).click();
  await expect(page.locator('main')).toContainText('回答 1問');
  await menu(page, '単語帳').click();
  await expect(page.locator('.card-term')).toHaveText('AIエージェント');
});

test('ChatGPT・Codexを起動モードに設定でき、教材と単語帳の直接リンクが開く', async ({ page, context }) => {
  await page.goto('./');
  await menu(page, '設定').click();
  await expect(page.getByLabel('起動時に最初に開くモード')).toHaveValue('g');
  await page.getByLabel('起動時に最初に開くモード').selectOption('chatgpt');
  await checkMobileLayout(page);
  const newTab = await context.newPage();
  await newTab.goto(page.url().split('#')[0]);
  await expect(heading(newTab, 'ChatGPT・Codex ダッシュボード')).toBeVisible();

  await page.goto('./#/lesson/les-cx-56');
  await expect(heading(page, 'Gitの記録から対象ファイルの版を切り替える')).toBeVisible();
  await page.goto('./#/card/fc-cx-090');
  await expect(page.locator('.card-term')).toHaveText('差分確認と安全な復元');
});


test('375pxで全56教材の図表ラベルが狭く潰れない', async ({ page }) => {
  for (let n = 1; n <= 56; n += 1) {
    const id = `les-cx-${String(n).padStart(2, '0')}`;
    await page.goto(`./#/lesson/${id}`);
    await expect(page.locator('.viz'), id).toHaveCount(2);
    await checkMobileLayout(page);
  }
});
