import { test, expect } from '@playwright/test';

// 2026-11-11 全面再設計（単語帳・データ保護・深いリンク）の回帰テスト
test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('単語帳：用語→意味で開始し、裏返して自己評価できる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await expect(page.getByRole('heading', { name: /単語帳/ })).toBeVisible();
  await page.getByRole('button', { name: '用語 → 意味', exact: true }).click();
  await page.getByLabel('シャッフル').uncheck(); // 先頭カードを決定的にする
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  const face = page.locator('.flash-face');
  await expect(face).toBeVisible();
  await expect(face.locator('.card-term')).not.toHaveText(''); // 1枚目は用語面
  await expect(page.getByRole('button', { name: '覚えた' })).toHaveCount(0); // 表面では自己評価できない
  await page.getByRole('button', { name: '答えを見る' }).click();
  await expect(page.getByRole('button', { name: '覚えた' })).toBeVisible();
  await page.getByRole('button', { name: '覚えた' }).click();
  await expect(page.locator('.meta')).toContainText('2／'); // 次のカードへ進む
  const review = await page.evaluate(() => JSON.parse(localStorage.getItem('g-ai-master:state:v1')!).cardReview);
  expect(Object.values(review).some((r) => (r as { lastGrade?: string }).lastGrade === 'known')).toBe(true);
});

test('単語帳：意味→用語では1枚目から意味面で、用語が漏れていない', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await page.getByRole('button', { name: '意味 → 用語', exact: true }).click();
  await page.getByLabel('シャッフル').uncheck();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  const face = page.locator('.flash-face');
  await expect(face).toBeVisible();
  await expect(face.locator('.card-def')).toBeVisible(); // 1枚目から意味面
  await expect(face.locator('.card-term')).toHaveCount(0); // 用語は表示されない（マスクされる）
  await page.getByRole('button', { name: '答えを見る' }).click();
  await expect(face.locator('.card-term')).not.toHaveText(''); // 裏面で用語が明かされる
});

test('単語帳：ブックマークしたカードだけで開始できる', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await page.getByRole('button', { name: '一覧から選ぶ' }).click();
  await page.getByRole('button', { name: /をブックマーク/ }).first().click();
  await page.getByLabel('絞り込み').selectOption('saved');
  await expect(page.getByText(/対象は1枚です/)).toBeVisible();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await expect(page.locator('.meta')).toContainText('1／1枚');
});

test('深いリンク：教材と単語帳へ直接アクセスでき、リロードで維持される', async ({ page }) => {
  await page.goto('/#/lesson/les-g01');
  await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '基礎解説' })).toBeVisible();
  await page.goto('/#/cards');
  await expect(page.getByRole('heading', { name: /単語帳/ })).toBeVisible();
});

test('データ保護：壊れたインポートは拒否され、既存の記録が残る（P0-1回帰）', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  // 先に正規の記録を1件作る
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await page.locator('.choice').first().click();
  // 単一選択は選んだ瞬間に判定される（即時フィードバック）
  await page.getByLabel('主要メニュー').getByRole('button', { name: '設定' }).click();
  await page.getByLabel('記録を読み込む').setInputFiles({
    name: 'broken.json', mimeType: 'application/json',
    buffer: Buffer.from('{"schemaVersion":1,"answers":"broken","settings":{}}'),
  });
  await expect(page.getByText(/読み込めませんでした/)).toBeVisible();
  const n = await page.evaluate(() => JSON.parse(localStorage.getItem('g-ai-master:state:v1')!).answers.length);
  expect(n).toBe(1); // 壊れたファイルで記録は消えていない
});

test('データ保護：保存データが壊れていても自動で初期化されず、退避と復旧の選択肢が出る（P0-2回帰）', async ({ page }) => {
  const broken = '{"schemaVersion":2,"answers":"broken","settings":{"theme":"dark"}}';
  await page.evaluate((raw) => localStorage.setItem('g-ai-master:state:v1', raw), broken);
  await page.reload();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('読み込めませんでした');
  // 元データは退避され、主キーもまだ書き換えられていない
  const backup = await page.evaluate(() => localStorage.getItem('g-ai-master:state:backup'));
  expect(backup).toBe(broken);
  expect(await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'))).toBe(broken);
  await page.getByRole('button', { name: '読み取れる部分だけ復旧する' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  const theme = await page.evaluate(() => JSON.parse(localStorage.getItem('g-ai-master:state:v1')!).settings.theme);
  expect(theme).toBe('dark'); // 読み取れる設定は復旧されている
});

test('フル模試は本番形式のため一時停止できない', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '模試' }).click();
  await page.locator('.card').filter({ has: page.getByRole('heading', { name: 'フル模試' }) }).getByRole('button', { name: '開始' }).click();
  await expect(page.getByText(/残り時間/)).toBeVisible();
  await expect(page.getByText(/回答 0／145問/)).toBeVisible();
  await expect(page.getByRole('button', { name: '一時停止' })).toHaveCount(0);
});

test('教材に図表が表示される', async ({ page }) => {
  await page.goto('/#/lesson/les-g08');
  await expect(page.locator('.viz').first()).toBeVisible();
  await expect(page.locator('main')).toContainText('混同行列');
});

test('単語帳：カードを左右にスワイプすると前後のカードへ移動する', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '単語帳' }).click();
  await page.getByLabel('シャッフル').uncheck();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  const face = page.locator('.flash-face');
  await expect(face).toBeVisible();
  await expect(page.locator('.meta')).toContainText('1／');
  const swipe = (dx: number) => face.evaluate((el, d) => {
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width / 2, clientY: y, bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: r.left + r.width / 2 + d, clientY: y, bubbles: true }));
  }, dx);
  await swipe(-120); // 左スワイプ＝次へ
  await expect(page.locator('.meta')).toContainText('2／');
  await swipe(120); // 右スワイプ＝前へ
  await expect(page.locator('.meta')).toContainText('1／');
});

test('演習：選んだ瞬間に答えと関連図表が表示される（即時フィードバック）', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '演習' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  await page.locator('.choice').first().click();
  await expect(page.getByText(/正解です|不正解です/)).toBeVisible(); // 「回答する」を押さずに判定される
  await expect(page.getByRole('button', { name: '回答する' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '関連図表' })).toBeVisible();
  await expect(page.locator('.viz').first()).toBeVisible();
});

test('フロー図のラベルが狭幅で縦書き状に潰れない（2026-11-11回帰）', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/#/lesson/les-g03');
  await expect(page.locator('.viz-flow .fs b').first()).toBeVisible();
  const heights = await page.evaluate(() => [...document.querySelectorAll('.viz-flow .fs b')].map((el) => (el as HTMLElement).offsetHeight));
  expect(heights.length).toBeGreaterThan(0);
  for (const h of heights) expect(h).toBeLessThan(48); // 1文字幅に潰れると4文字で70px超になる
});

test('教材画面から要点まとめPDFを開ける', async ({ page }) => {
  await page.getByLabel('主要メニュー').getByRole('button', { name: '教材' }).click();
  await expect(page.getByRole('button', { name: '要点まとめPDFを開く' })).toBeVisible();
  const b64 = await page.evaluate(async () => {
    const r = await fetch('pdf64/g-summary.b64');
    return r.ok ? (await r.text()).length : 0;
  });
  expect(b64).toBeGreaterThan(1000000); // 同梱されたPDF（Base64）が取得できる
});
