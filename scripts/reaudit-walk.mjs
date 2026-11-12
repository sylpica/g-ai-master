// 独立再監査（2026-11-12）の実ブラウザ操作スクリプト。使い方: node scripts/reaudit-walk.mjs <baseURL> <出力先> <データJSON>
// データJSONは publishedQuestions / publishedFlashcards / publishedLessons を {q,c,l} で書き出したもの。
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const data = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const qById = Object.fromEntries(data.q.map((q) => [q.id, q]));
const log = []; const findings = [];
const rec = (e) => { log.push({ t: new Date().toISOString(), ...e }); };
const find = (id, sev, text, extra = {}) => { findings.push({ id, sev, text, ...extra }); console.log('FINDING', sev, id, text, JSON.stringify(extra).slice(0, 400)); };
const browser = await chromium.launch();
const mk = async (w = 375, h = 812, opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'ja-JP', hasTouch: w < 800, ...opts });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') { rec({ ev: 'console-' + m.type(), text: m.text().slice(0, 300), url: page.url() }); if (m.type() === 'error') console.log('CONSOLE-ERR', m.text().slice(0, 200)); } });
  page.on('pageerror', (e) => { rec({ ev: 'pageerror', text: String(e).slice(0, 300), url: page.url() }); console.log('PAGEERROR', String(e).slice(0, 300)); });
  page.on('requestfailed', (r) => rec({ ev: 'requestfailed', url: r.url() }));
  return { ctx, page };
};
const layout = (page) => page.evaluate(() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const de = document.documentElement;
  const clipped = []; const small = []; const offscreen = [];
  for (const el of document.querySelectorAll('main *, header *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if ((cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1) clipped.push((el.className || el.tagName) + ':' + (el.textContent || '').slice(0, 30));
    if (r.right > vw + 1 || r.left < -1) offscreen.push((el.className || el.tagName) + ':' + Math.round(r.left) + '-' + Math.round(r.right) + ':' + (el.textContent || '').slice(0, 20));
    if ((el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SELECT' || (el.tagName === 'INPUT')) && (r.height < 40 || r.width < 40)) small.push(el.tagName + ':' + Math.round(r.width) + 'x' + Math.round(r.height) + ':' + (el.textContent || el.getAttribute('aria-label') || el.type || '').slice(0, 16));
  }
  const nav = document.querySelector('nav.main'); const nr = nav?.getBoundingClientRect();
  const fontMin = Math.min(...[...document.querySelectorAll('main *')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize)));
  return { url: location.hash, h1: document.querySelector('h1')?.textContent ?? null, scrollH: de.scrollHeight, vh, screens: +(de.scrollHeight / vh).toFixed(2), overflowX: de.scrollWidth - vw, clipped: clipped.slice(0, 8), offscreen: offscreen.slice(0, 8), small: [...new Set(small)].slice(0, 14), smallN: small.length, navRect: nr ? [Math.round(nr.left), Math.round(nr.top), Math.round(nr.width), Math.round(nr.height)] : null, chars: document.querySelector('main').innerText.length, fontMin };
});
const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('g-ai-master:state:v1') || 'null'));
const sess = (page, k) => page.evaluate((k) => JSON.parse(sessionStorage.getItem(k) || 'null'), k);
const navTo = async (page, label) => { await page.locator('nav.main button', { hasText: new RegExp('^' + label) }).first().click(); await page.waitForTimeout(150); };
const modeBtn = { g: 'G検定取得', passport: '生成AIパスポート', literacy: 'AI教養' };

// ===== 1. 全画面×3モード 375px レイアウト実測
{
  const { ctx, page } = await mk();
  await page.goto(base, { waitUntil: 'networkidle' });
  for (const m of ['g', 'passport', 'literacy']) {
    await page.getByRole('button', { name: modeBtn[m], exact: true }).click(); await page.waitForTimeout(150);
    const labels = (await page.locator('nav.main button').allTextContents()).map((s) => s.trim());
    rec({ ev: 'nav', mode: m, labels });
    for (const label of labels) {
      await navTo(page, label);
      const L = await layout(page); rec({ ev: 'layout', mode: m, label, ...L });
      await page.screenshot({ path: `${out}/375-${m}-${label}.png` });
      console.log(m, label, JSON.stringify({ h1: L.h1, screens: L.screens, ox: L.overflowX, clipped: L.clipped, off: L.offscreen, smallN: L.smallN, small: L.small, chars: L.chars, fontMin: L.fontMin }));
    }
  }
  // lesson page
  await page.getByRole('button', { name: modeBtn.g, exact: true }).click(); await navTo(page, '教材'); await page.locator('.lesson-row').first().click(); await page.waitForTimeout(600);
  const L = await layout(page); rec({ ev: 'layout', label: 'lesson', ...L }); console.log('lesson', JSON.stringify(L));
  await page.screenshot({ path: `${out}/375-g-lesson.png` }); await page.screenshot({ path: `${out}/375-g-lesson-full.png`, fullPage: true });
  await ctx.close();
}
// ===== 2. 演習：正答/誤答を実データで選び、UI・履歴・復習を同一IDで照合
{
  const { ctx, page } = await mk();
  await page.goto(base + '#/practice', { waitUntil: 'networkidle' });
  const L0 = await layout(page); await page.screenshot({ path: `${out}/practice-start.png` });
  await page.getByRole('button', { name: 'この条件ではじめる' }).click(); await page.waitForTimeout(200);
  const key = 'g-ai:practice-session:g:practice';
  let s = await sess(page, key);
  rec({ ev: 'practice-session', n: s.ids.length, first: s.ids.slice(0, 5), shuffleQ: s.shuffleQ, shuffleC: s.shuffleC });
  console.log('practice session', s.ids.length, s.ids.slice(0, 5), s.shuffleQ, s.shuffleC);
  let mismatch = 0;
  for (let i = 0; i < 12; i++) {
    s = await sess(page, key); const qid = s.ids[s.pos]; const q = qById[qid]; const perm = s.perms[qid];
    const stem = await page.locator('fieldset legend h2').innerText();
    if (stem !== q.stem) { mismatch++; find('PRAC-STEM', 'High', '表示中の問題文がセッションのIDと不一致', { qid }); }
    const wantCorrect = i % 3 !== 2;
    const orig = wantCorrect ? q.answer[0] : [0, 1, 2, 3].find((x) => !q.answer.includes(x) && x < q.choices.length);
    const disp = perm.indexOf(orig);
    const txt = await page.locator('button.choice').nth(disp).locator('.ctext').innerText();
    if (!txt.startsWith(q.choices[orig])) find('PRAC-PERM', 'High', '選択肢の表示位置がpermと不一致', { qid });
    if (i === 0) { await page.locator('button.choice').nth(disp).dblclick(); } else await page.locator('button.choice').nth(disp).click();
    await page.waitForTimeout(120);
    const fb = await page.locator('.fb b').innerText();
    if ((fb.includes('正解です') && !fb.includes('不正解')) !== wantCorrect) find('PRAC-JUDGE', 'Critical', '正誤表示が期待と不一致', { qid, fb, wantCorrect });
    const st = await state(page); const recs = st.answers.filter((a) => a.questionId === qid);
    if (recs.length !== 1) find('PRAC-DUP', 'High', '回答記録が1件でない', { qid, n: recs.length });
    else if (recs[0].correct !== wantCorrect || recs[0].selected[0] !== orig) find('PRAC-REC', 'Critical', '記録と回答が不一致', { qid, rec: recs[0] });
    if (!st.review[qid]) find('PRAC-REV', 'High', '復習カード未登録', { qid });
    if (i === 1) { const Lr = await layout(page); await page.screenshot({ path: `${out}/practice-answered.png` }); console.log('practice answered layout', JSON.stringify({ screens: Lr.screens, ox: Lr.overflowX, small: Lr.small }));
      const nb = await page.locator('.fb button').boundingBox(); console.log('next button box', JSON.stringify(nb)); rec({ ev: 'next-btn-box', nb }); }
    if (i === 3) { // bookmark during session
      await page.locator('button.bm').first().click(); await page.waitForTimeout(80);
      const st2 = await state(page); if (!st2.bookmarks.includes('q:' + qid)) find('PRAC-BM', 'High', '保存が反映されない', { qid });
      const stem2 = await page.locator('fieldset legend h2').innerText(); if (stem2 !== q.stem) find('PRAC-BM-SWAP', 'High', '保存操作で問題が差し替わった', { qid });
    }
    if (i === 5) { await page.reload({ waitUntil: 'networkidle' }); const stem3 = await page.locator('fieldset legend h2').innerText().catch(() => null); if (stem3 !== q.stem) find('PRAC-RELOAD', 'High', 'リロードで演習位置が失われた', { qid, stem3 });
      const fb3 = await page.locator('.fb b').innerText().catch(() => null); if (!fb3) find('PRAC-RELOAD-FB', 'Medium', 'リロード後に回答済み表示が消えた', { qid }); }
    await page.locator('.fb button').click(); await page.waitForTimeout(80);
  }
  // back to previous question: result persists?
  await page.getByRole('button', { name: '前の問題' }).click(); await page.waitForTimeout(100);
  const fbPrev = await page.locator('.fb b').innerText().catch(() => null); if (!fbPrev) find('PRAC-PREV', 'Medium', '前の問題へ戻ると回答結果が表示されない');
  const stA = await state(page); console.log('answers after practice', stA.answers.length, 'firstSeen', stA.answers.filter((a) => a.firstSeen).length);
  // browser back from practice mid-session, then forward
  await page.goBack(); await page.waitForTimeout(200); rec({ ev: 'back', hash: await page.evaluate(() => location.hash) }); console.log('after back hash', await page.evaluate(() => location.hash));
  await page.goForward(); await page.waitForTimeout(200);
  const stemF = await page.locator('fieldset legend h2').innerText().catch(() => null); if (!stemF) find('PRAC-FWD', 'Medium', '戻る→進むで演習セッションが失われた');
  // end session; saved only
  await page.getByRole('button', { name: 'セッションを終了' }).click(); await page.waitForTimeout(100);
  await page.getByLabel('保存した問題のみ').check(); await page.waitForTimeout(100);
  const tgt = await page.locator('main .card p', { hasText: '対象は' }).innerText(); console.log('saved-only pool:', tgt);
  await page.getByRole('button', { name: 'この条件ではじめる' }).click(); await page.waitForTimeout(150);
  // unbookmark while in saved-only session
  const stemS = await page.locator('fieldset legend h2').innerText();
  await page.locator('button.bm').first().click(); await page.waitForTimeout(150);
  const stemS2 = await page.locator('fieldset legend h2').innerText().catch(() => null);
  if (stemS2 !== stemS) find('PRAC-SAVED-UNBM', 'High', '保存のみ中に保存解除すると問題が消える/差し替わる', { stemS, stemS2 });
  await page.locator('button.choice').first().click(); await page.waitForTimeout(100);
  await page.locator('.fb button').click(); await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/practice-done.png` });
  console.log('done screen text:', (await page.locator('main .card').first().innerText()).slice(0, 200));
  // review screen
  await navTo(page, '復習'); await page.waitForTimeout(200);
  console.log('review:', (await page.locator('main').innerText()).slice(0, 300).replace(/\n/g, ' | '));
  await page.screenshot({ path: `${out}/review-start.png` });
  // analysis
  await navTo(page, '分析'); await page.waitForTimeout(200); await page.screenshot({ path: `${out}/analysis-after.png`, fullPage: true });
  console.log('analysis:', (await page.locator('main').innerText()).slice(0, 900).replace(/\n/g, ' | '));
  await ctx.close();
}
// ===== 3. シャッフル：再開始ごとの先頭・集合不変
{
  const { ctx, page } = await mk();
  await page.goto(base + '#/practice', { waitUntil: 'networkidle' });
  const key = 'g-ai:practice-session:g:practice'; const firsts = []; let bad = 0;
  for (let i = 0; i < 40; i++) {
    await page.getByRole('button', { name: 'この条件ではじめる' }).click();
    const s = await sess(page, key); firsts.push(s.ids[0]);
    if (new Set(s.ids).size !== s.ids.length || s.ids.length !== 600) bad++;
    for (const id of s.ids.slice(0, 20)) { const p = s.perms[id]; if ([...p].sort().join() !== qById[id].choices.map((_, i) => i).join()) bad++; }
    await page.getByRole('button', { name: 'セッションを終了' }).click();
  }
  console.log('shuffle distinct firsts', new Set(firsts).size, '/40 bad', bad);
  rec({ ev: 'shuffle', distinctFirst: new Set(firsts).size, of: 40, bad });
  if (new Set(firsts).size < 30) find('SHUF', 'High', 'シャッフルの先頭が偏る', { distinct: new Set(firsts).size });
  await ctx.close();
}
const cById = Object.fromEntries(data.c.map((c) => [c.id, c]));
// ===== 4. 単語帳
{
  const { ctx, page } = await mk();
  await page.goto(base + '#/cards', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '意味 → 用語' }).click();
  await page.getByRole('button', { name: 'この条件ではじめる' }).click(); await page.waitForTimeout(150);
  const key = 'g-ai:card-session:g';
  let s = await sess(page, key); console.log('card session', s.ids.length, s.direction, s.flipped, s.ids.slice(0, 3));
  for (let i = 0; i < 6; i++) {
    s = await sess(page, key); const c = cById[s.ids[s.pos]];
    const face = await page.locator('.flash-face').innerText();
    if (face.includes(c.term)) find('CARD-LEAK', 'High', '意味→用語の表面に用語が出ている', { id: c.id });
    if (!face.includes((c.reversePrompt ?? c.definition).slice(0, 12))) find('CARD-FRONT', 'Critical', '意味→用語で1枚目が意味面でない', { id: c.id, face: face.slice(0, 60) });
    if (i === 0) { const L = await layout(page); await page.screenshot({ path: `${out}/card-front-meaning.png` }); console.log('card front layout', JSON.stringify({ screens: L.screens, small: L.small, clipped: L.clipped })); }
    if (i === 1) { await page.locator('.flash-face').focus(); await page.keyboard.press('Enter'); } else if (i === 2) { await page.locator('.flash-face').focus(); await page.keyboard.press('Space'); } else await page.locator('.flash-face').click();
    await page.waitForTimeout(100);
    const back = await page.locator('.flash-face').innerText();
    if (!back.includes(c.term)) find('CARD-BACK', 'High', '裏返しても用語が出ない', { id: c.id });
    if (i === 0) { const L = await layout(page); await page.screenshot({ path: `${out}/card-back-meaning.png` }); console.log('card back layout', JSON.stringify({ screens: L.screens, small: L.small }));
      await page.reload({ waitUntil: 'networkidle' }); const b2 = await page.locator('.flash-face').innerText(); if (!b2.includes(c.term)) find('CARD-RELOAD', 'Medium', 'リロードで反転状態が失われた'); }
    if (i === 3) { await page.locator('button.bm').first().click(); await page.waitForTimeout(80); const st = await state(page); if (!st.bookmarks.includes('card:' + c.id)) find('CARD-BM', 'High', 'カード保存が反映されない'); const b3 = await page.locator('.flash-face').innerText(); if (!b3.includes(c.term)) find('CARD-BM-SWAP', 'High', '保存でカードが変わった'); }
    await page.getByRole('button', { name: ['覚えた', 'あいまい', '覚えていない'][i % 3], exact: true }).click(); await page.waitForTimeout(100);
  }
  const st = await state(page); console.log('cardReview', Object.keys(st.cardReview).length, 'answers', st.answers.length, JSON.stringify(Object.values(st.cardReview)[1]));
  if (st.answers.length) find('CARD-MIX', 'High', '単語帳の自己評価が問題の回答履歴に混入');
  // prev → still unflipped & correct face
  await page.getByRole('button', { name: '← 前へ' }).click(); await page.waitForTimeout(80);
  // change direction mid-session possible? end then list pick with shuffle ON
  await page.getByRole('button', { name: 'セッションを終了' }).click(); await page.waitForTimeout(80);
  await page.getByRole('button', { name: '一覧から選ぶ' }).click(); await page.waitForTimeout(100);
  const rows = page.locator('.card-row'); const n = await rows.count(); const pickTerm = await rows.nth(7).locator('b').innerText();
  const Ll = await layout(page); console.log('card list layout', JSON.stringify({ screens: Ll.screens, small: Ll.small, n }));
  await rows.nth(7).click(); await page.waitForTimeout(150);
  await page.locator('.flash-face').click(); const shown = await page.locator('.flash-face').innerText();
  if (!shown.includes(pickTerm)) find('CARD-PICK', 'High', '一覧から選んだカードと違うカードが開く（シャッフルON時）', { pickTerm, shown: shown.slice(0, 40) });
  await page.getByRole('button', { name: 'セッションを終了' }).click();
  // saved only
  await page.locator('select').first().selectOption('saved'); await page.waitForTimeout(80);
  console.log('saved pool:', await page.locator('main .card p', { hasText: '対象は' }).innerText());
  await page.getByRole('button', { name: 'この条件ではじめる' }).click(); await page.waitForTimeout(100);
  await page.locator('button.bm').first().click(); await page.waitForTimeout(100); // unbookmark during saved session
  if (!(await page.locator('.flash-face').count())) find('CARD-SAVED-UNBM', 'High', '保存のみ中の保存解除でカードが消えた');
  await page.locator('.flash-face').click(); await page.getByRole('button', { name: '覚えた', exact: true }).click(); await page.waitForTimeout(100);
  console.log('card done:', (await page.locator('main .card').first().innerText()).replace(/\n/g, ' | ').slice(0, 300)); await page.screenshot({ path: `${out}/card-done.png` });
  await ctx.close();
}
// deep link to card with existing session / without
{
  const { ctx, page } = await mk();
  const target = data.c.filter((c) => c.mode === 'passport')[20];
  await page.goto(base + '#/card/' + target.id, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const face = await page.locator('.flash-face').innerText().catch(() => null);
  console.log('deep card', target.id, target.term, '=>', face && face.slice(0, 40), 'mode', (await state(page))?.mode);
  if (!face || !face.includes(target.term)) find('DEEP-CARD', 'High', 'カードの深いリンクで対象カードが表示されない', { target: target.term, face: face && face.slice(0, 40) });
  const t2 = data.c.filter((c) => c.mode === 'passport')[30];
  await page.evaluate((h) => { location.hash = h; }, '#/card/' + t2.id); await page.waitForTimeout(300);
  const f2 = await page.locator('.flash-face').innerText().catch(() => null);
  if (!f2 || !f2.includes(t2.term)) find('DEEP-CARD2', 'High', 'セッション中に別カードの深いリンクへ移動しても対象が表示されない', { target: t2.term, face: f2 && f2.slice(0, 40) });
  // lesson -> term tap -> card
  await page.goto(base + '#/lesson/les-g01', { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
  const termBtn = page.locator('article button.term, article .term').first();
  console.log('term buttons in lesson:', await page.locator('article .term').count(), await page.locator('article button').allTextContents().then((a) => a.slice(0, 12)));
  await page.goto(base + '#/lesson/nonexistent', { waitUntil: 'networkidle' }); console.log('unknown lesson:', (await page.locator('main').innerText()).slice(0, 60));
  await page.goto(base + '#/zzz', { waitUntil: 'networkidle' }); console.log('unknown route h1:', await page.locator('h1').innerText());
  await ctx.close();
}
// ===== 5. 模試
{
  const { ctx, page } = await mk();
  page.on('dialog', (d) => { console.log('DIALOG', d.message()); d.accept(); });
  await page.goto(base + '#/exam', { waitUntil: 'networkidle' });
  await page.locator('.card', { hasText: '短縮模試' }).getByRole('button', { name: '開始' }).click(); await page.waitForTimeout(200);
  let st = await state(page); let ex = st.exams[0];
  const L = await layout(page); await page.screenshot({ path: `${out}/exam-q.png` }); console.log('exam layout', JSON.stringify({ screens: L.screens, small: L.small, clipped: L.clipped }));
  const expected = {};
  for (let i = 0; i < 6; i++) {
    st = await state(page); ex = st.exams[0]; const qid = ex.questionIds[ex.current]; const q = qById[qid]; const perm = ex.choicePerms[qid];
    const stem = await page.locator('fieldset legend h2').innerText(); if (!stem.includes(q.stem)) find('EXAM-STEM', 'High', '模試の表示問題がIDと不一致');
    const want = i % 2 === 0; const orig = want ? q.answer[0] : [0, 1, 2, 3].find((x) => !q.answer.includes(x));
    await page.locator('button.choice').nth(perm.indexOf(orig)).click(); await page.waitForTimeout(60);
    if (i === 1) { await page.locator('button.choice').nth(perm.indexOf(q.answer[0])).click(); await page.waitForTimeout(60); expected[qid] = true; } else expected[qid] = want;
    if (await page.locator('.fb, main .ok, main .bad, .right, .wrong').count()) find('EXAM-HINT', 'High', '模試中に正誤が表示される');
    if (i === 2) { await page.reload({ waitUntil: 'networkidle' }); const s2 = await page.locator('fieldset legend h2').innerText().catch(() => ''); if (!s2.includes(q.stem)) find('EXAM-RELOAD', 'High', 'リロードで模試位置が失われた'); }
    await page.getByRole('button', { name: '次へ' }).first().click(); await page.waitForTimeout(60);
  }
  await page.getByRole('button', { name: '提出する' }).first().dblclick().catch((e) => console.log('dbl', String(e).slice(0, 80)));
  await page.waitForTimeout(400);
  st = await state(page); ex = st.exams[0];
  const exAns = st.answers.filter((a) => a.context === 'exam');
  console.log('exam status', ex.status, 'answers recorded', exAns.length, 'expected', Object.keys(expected).length, 'exams', st.exams.length);
  if (exAns.length !== Object.keys(expected).length) find('EXAM-REC', 'Critical', '模試提出後の回答記録数が回答数と不一致', { got: exAns.length, want: Object.keys(expected).length });
  for (const a of exAns) if (expected[a.questionId] !== a.correct) find('EXAM-JUDGE', 'Critical', '模試の正誤記録が不一致', { a });
  await page.screenshot({ path: `${out}/exam-result.png`, fullPage: true });
  console.log('result:', (await page.locator('main').innerText()).replace(/\n/g, ' | ').slice(0, 600));
  await page.locator('.card', { hasText: '短縮模試' }).getByRole('button', { name: '開始' }).click(); await page.waitForTimeout(200);
  await page.locator('button.choice').first().click(); await page.waitForTimeout(100);
  await page.evaluate(() => { const k = 'g-ai-master:state:v1'; const s = JSON.parse(localStorage.getItem(k)); const e = s.exams.find((x) => x.status === 'in-progress'); e.startedAt = new Date(Date.now() - 3600e3).toISOString(); localStorage.setItem(k, JSON.stringify(s)); });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  st = await state(page); console.log('timeout exam statuses', st.exams.map((e) => e.status), 'exam answers', st.answers.filter((a) => a.context === 'exam').length);
  if (st.exams[1].status !== 'submitted') find('EXAM-TIMEOUT', 'High', '時間切れで自動提出されない');
  if (st.answers.filter((a) => a.context === 'exam').length !== Object.keys(expected).length + 1) find('EXAM-TIMEOUT-REC', 'High', '時間切れ提出の回答記録数が不正', { n: st.answers.filter((a) => a.context === 'exam').length });
  await navTo(page, '分析'); console.log('analysis:', (await page.locator('main').innerText()).replace(/\n/g, ' | ').slice(0, 700));
  await navTo(page, '模試'); await page.locator('.card', { hasText: 'フル模試' }).getByRole('button', { name: '開始' }).click(); await page.waitForTimeout(300);
  st = await state(page); const fx = st.exams[st.exams.length - 1]; console.log('full exam', fx.questionIds.length, fx.limitSec, 'uniq', new Set(fx.questionIds).size, 'buttons', (await page.locator('main button:not(.choice)').allTextContents()).slice(0, 8).join('/'));
  const byCh = {}; for (const id of fx.questionIds) { const c = qById[id].syllabusId; byCh[c] = (byCh[c] || 0) + 1; } console.log('full exam chapter dist', JSON.stringify(byCh));
  const Lf = await layout(page); await page.screenshot({ path: `${out}/exam-full.png`, fullPage: true }); console.log('full exam layout', JSON.stringify({ screens: Lf.screens, small: Lf.small.slice(0, 6), smallN: Lf.smallN }));
  await ctx.close();
}
// ===== 6. データ保護
{
  const { ctx, page } = await mk();
  page.on('dialog', (d) => { console.log('DIALOG', d.message().slice(0, 80)); d.accept(); });
  await page.goto(base + '#/practice', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'この条件ではじめる' }).click(); await page.locator('button.choice').first().click(); await page.waitForTimeout(150);
  await navTo(page, '設定'); await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/settings.png`, fullPage: true });
  console.log('settings text:', (await page.locator('main').innerText()).replace(/\n/g, ' | ').slice(0, 900));
  const before = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'));
  const cases = { broken1: '{"schemaVersion":1,"answers":"broken","settings":{}}', notjson: '{{{', empty: '', arr: '[]', future: '{"schemaVersion":99}', badid: JSON.stringify({ ...JSON.parse(before), answers: [{ questionId: 'nope', selected: [9], correct: true, at: 'x', seconds: -1, firstSeen: true, context: 'practice' }] }), huge: '{"schemaVersion":2,"pad":"' + 'x'.repeat(6e6) + '"}' };
  const input = page.locator('input[type=file]');
  for (const [name, body] of Object.entries(cases)) {
    await input.setInputFiles({ name: name + '.json', mimeType: 'application/json', buffer: Buffer.from(body) }); await page.waitForTimeout(250);
    const after = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'));
    const msg = (await page.locator('main [role=status], main [role=alert], main .bad').allInnerTexts()).join(' / ').slice(0, 200);
    console.log('import', name, 'unchanged', after === before, '|', msg.replace(/\n/g, ' '));
    if (after !== before) find('IMPORT-' + name, 'Critical', '不正ファイルで保存データが変化', { name });
  }
  const v1 = fs.readFileSync('/home/user/g-ai-master/tests/fixtures/state-v1.json', 'utf8');
  await input.setInputFiles({ name: 'v1.json', mimeType: 'application/json', buffer: Buffer.from(v1) }); await page.waitForTimeout(250);
  const txt = (await page.locator('main').innerText()).replace(/\n/g, ' | ');
  console.log('v1 preview:', txt.slice(txt.indexOf('学習記録'), txt.indexOf('学習記録') + 700));
  await page.screenshot({ path: `${out}/import-preview.png`, fullPage: true });
  await ctx.close();
}
for (const [name, raw] of Object.entries({ notjson: '{oops', broken: '{"schemaVersion":1,"answers":"broken","settings":{}}', nullv: 'null' })) {
  const { ctx, page } = await mk();
  await page.addInitScript(([raw]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('g-ai-master:state:v1', raw); sessionStorage.setItem('seeded', '1'); } }, [raw]);
  await page.goto(base, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const cur = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1'));
  const alert = await page.locator('main [role=alert]').first().innerText().catch(() => '');
  console.log('boot', name, 'preserved', cur === raw, '|', alert.slice(0, 90).replace(/\n/g, ' '));
  if (cur !== raw) find('BOOT-' + name, 'Critical', '破損データが起動時に上書きされた', { cur: (cur || '').slice(0, 60) });
  await navTo(page, '演習'); await page.waitForTimeout(200);
  const cur2 = await page.evaluate(() => localStorage.getItem('g-ai-master:state:v1')); if (cur2 !== raw) find('BOOT2-' + name, 'Critical', '破損データが操作後に上書きされた');
  if (name === 'notjson') await page.screenshot({ path: `${out}/boot-corrupt.png` });
  await ctx.close();
}
// ===== 7. 幅マトリクス
for (const w of [320, 390, 430, 768, 1024, 1440]) {
  const { ctx, page } = await mk(w, w < 800 ? 700 : 800);
  await page.goto(base, { waitUntil: 'networkidle' });
  for (const h of ['#/', '#/lessons', '#/lesson/les-g05', '#/cards', '#/practice', '#/exam', '#/analysis', '#/settings', '#/syllabus']) {
    await page.evaluate((h) => { location.hash = h; }, h); await page.waitForTimeout(h.includes('lesson/') ? 500 : 150);
    const L = await layout(page);
    const wrapNav = await page.evaluate(() => [...document.querySelectorAll('nav.main button, header .seg button')].filter((b) => { const r = document.createRange(); r.selectNodeContents(b); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size > 1; }).map((b) => b.textContent));
    const cut = await page.evaluate(() => [...document.querySelectorAll('header button')].filter((b) => b.getBoundingClientRect().right > innerWidth + 0.5).map((b) => b.textContent));
    console.log(w, h, JSON.stringify({ screens: L.screens, ox: L.overflowX, clipped: L.clipped, off: L.offscreen.slice(0, 3), wrapNav, cut }));
    if (h === '#/' || h === '#/lesson/les-g05') await page.screenshot({ path: `${out}/w${w}-${h.replace(/[#\/]/g, '_')}.png` });
  }
  await ctx.close();
}
// ===== 8. AI教養タブ・復習（期限到来）・文字大／ダーク・キーボード・オフライン
{
  const { ctx, page } = await mk();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'AI教養', exact: true }).click(); await navTo(page, '教材');
  for (const t of ['教材', '実践演習', 'モデル比較', 'ニュース']) {
    await page.locator('main .seg.tabs button', { hasText: t }).first().click(); await page.waitForTimeout(150);
    const L = await layout(page); await page.screenshot({ path: `${out}/lit-${t}.png` });
    console.log('literacy', t, JSON.stringify({ screens: L.screens, ox: L.overflowX, clipped: L.clipped, off: L.offscreen, chars: L.chars }));
  }
  await ctx.close();
}
{ // 復習：誤答を作り、復習期限を今日に動かして復習フローを通す
  const { ctx, page } = await mk();
  await page.goto(base + '#/practice', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  const key = 'g-ai:practice-session:g:practice';
  for (let i = 0; i < 4; i++) { const s = await sess(page, key); const q = qById[s.ids[s.pos]]; const wrong = [0, 1, 2, 3].find((x) => !q.answer.includes(x)); await page.locator('button.choice').nth(s.perms[q.id].indexOf(wrong)).click(); await page.locator('.fb button').click(); }
  await page.evaluate(() => { const k = 'g-ai-master:state:v1'; const s = JSON.parse(localStorage.getItem(k)); for (const c of Object.values(s.review)) c.due = '2026-01-01'; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(base + '#/review', { waitUntil: 'networkidle' }); await page.reload({ waitUntil: 'networkidle' });
  console.log('review start:', (await page.locator('main .card').first().innerText()).replace(/\n/g, ' | ').slice(0, 200));
  const badge = await page.locator('nav.main button', { hasText: '復習' }).innerText(); console.log('review badge:', badge.replace(/\n/g, ' '));
  await page.getByRole('button', { name: 'この条件ではじめる' }).click();
  const rkey = 'g-ai:practice-session:g:review';
  for (let i = 0; i < 4; i++) {
    const s = await sess(page, rkey); const q = qById[s.ids[s.pos]];
    await page.locator('button.choice').nth(s.perms[q.id].indexOf(q.answer[0])).click(); await page.waitForTimeout(100);
    const stem = await page.locator('fieldset legend h2').innerText(); if (stem !== q.stem) find('REV-SWAP', 'High', '復習で回答後に問題が差し替わった');
    const fb = await page.locator('.fb b').innerText(); if (fb !== '正解です。') find('REV-JUDGE', 'Critical', '復習の正誤が不一致', { fb });
    if (i === 0) { await page.locator('button.bm').first().click(); const st = await state(page); if (!st.bookmarks.includes('q:' + q.id)) find('REV-BM', 'High', '復習中に保存できない'); }
    await page.locator('.fb button').click();
  }
  const st = await state(page); console.log('review answers', st.answers.filter((a) => a.context === 'review').length, 'due now', Object.values(st.review).filter((c) => c.due <= '2026-11-12').length, 'firstSeen', st.answers.filter((a) => a.firstSeen).length);
  console.log('review done:', (await page.locator('main .card').first().innerText()).replace(/\n/g, ' | ').slice(0, 160));
  await ctx.close();
}
{ // 文字大＋ダーク＋コンパクト 375px
  const { ctx, page } = await mk();
  await page.addInitScript(() => { if (!localStorage.getItem('g-ai-master:state:v1')) sessionStorage.setItem('x', '1'); });
  await page.goto(base + '#/settings', { waitUntil: 'networkidle' });
  const sels = page.locator('main select'); console.log('settings selects', await sels.count());
  await page.getByLabel(/テーマ/).selectOption({ label: 'ダーク' }); await page.getByLabel(/文字サイズ/).selectOption({ label: '大' });
  for (const h of ['#/', '#/cards', '#/practice', '#/lesson/les-g05', '#/exam']) {
    await page.evaluate((h) => { location.hash = h; }, h); await page.waitForTimeout(400);
    const L = await layout(page);
    const wrapNav = await page.evaluate(() => [...document.querySelectorAll('nav.main button, header .seg button')].filter((b) => { const r = document.createRange(); r.selectNodeContents(b); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size > 1; }).map((b) => b.textContent));
    console.log('dark+large', h, JSON.stringify({ screens: L.screens, ox: L.overflowX, clipped: L.clipped, off: L.offscreen, wrapNav }));
    await page.screenshot({ path: `${out}/dark-large-${h.replace(/[#\/]/g, '_')}.png` });
  }
  // contrast sample
  const contrast = await page.evaluate(() => { const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }; const bg = getComputedStyle(document.body).backgroundColor; const out = {}; for (const sel of ['body', '.muted', 'nav.main button', 'button.primary']) { const el = document.querySelector(sel); if (!el) continue; const cs = getComputedStyle(el); const b = sel === 'button.primary' ? cs.backgroundColor : bg; const a = lum(cs.color), c = lum(b); out[sel] = +((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05)).toFixed(2); } return out; });
  console.log('dark contrast', JSON.stringify(contrast));
  await ctx.close();
}
{ // キーボード操作（1024px）：Tabで単語帳を開始し、Enter/Spaceで反転
  const { ctx, page } = await mk(1024, 800);
  await page.goto(base + '#/cards', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'この条件ではじめる' }).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  await page.locator('.flash-face').focus(); await page.keyboard.press('Space'); await page.waitForTimeout(100);
  const flipped = await page.locator('.flash-face.back').count(); const focusVisible = await page.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return el.className + '|' + cs.outlineStyle + '|' + cs.outlineWidth; });
  console.log('keyboard flip', flipped, 'focus', focusVisible);
  if (!flipped) find('KB-FLIP', 'High', 'キーボードでカードを反転できない');
  await ctx.close();
}
{ // オフライン：Service Workerの有無と、遮断後の再読み込み
  const { ctx, page } = await mk();
  await page.goto(base, { waitUntil: 'networkidle' });
  const sw = await page.evaluate(async () => ('serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : -1));
  await ctx.setOffline(true);
  await navTo(page, '演習'); const inApp = await page.locator('h1').innerText();
  const reload = await page.reload({ waitUntil: 'domcontentloaded' }).then(() => 'loaded').catch((e) => 'failed:' + String(e).slice(0, 60));
  console.log('offline: sw registrations', sw, '| in-app nav', inApp, '| reload', reload);
  await ctx.close();
}
fs.writeFileSync(`${out}/log.json`, JSON.stringify({ findings, log }, null, 1));
await browser.close();
console.log('FINDINGS', findings.length);
