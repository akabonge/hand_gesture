// Browser smoke test: builds nothing; run `npm run build` first. Serves dist/, then
// 1) plays the ?demo ghost hand and checks it wakes, grabs memories and snaps a chapter,
// 2) walks all chapters in mouse mode, grabbing a memory in each,
// 3) starts camera mode with a fake camera and checks the OLI boot sequence.
// Screenshots go to test-results/. Usage: node test/smoke.mjs [--shots]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const PORT = 5199, BASE = `http://localhost:${PORT}`;
const shots = process.argv.includes('--shots');
await mkdir('test-results', { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));

const fail = (m) => { console.error('FAIL', m); process.exitCode = 1; };
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});
const errors = [];
async function page(url, vp = { width: 1280, height: 720 }) {
  const ctx = await browser.newContext({ viewport: vp, permissions: ['camera', 'microphone'] });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${url}: ${e.message}`));
  // Offline sandboxes can't reach Google's model CDN; the app handles that by falling back to mouse mode.
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g|storage\.googleapis|Failed to fetch/.test(m.text())) errors.push(`${url}: ${m.text()}`); });
  await p.goto(BASE + url);
  return p;
}
const state = (p) => p.evaluate(() => ({ ch: window.__handGesture.S.ch, awake: window.__handGesture.S.awake, collected: window.__handGesture.S.collected, card: document.getElementById('card').classList.contains('show') }));

try {
  let s;
  // 1) Demo (the ghost hand runs on the frame clock, so poll instead of fixed sleeps)
  const d = await page('/?demo');
  const until = async (fn, ms, label) => {
    const end = Date.now() + ms;
    while (Date.now() < end) { const v = await state(d); if (fn(v)) return v; await d.waitForTimeout(250); }
    fail(`demo: ${label} (${JSON.stringify(await state(d))})`);
  };
  await until((v) => v.awake, 20000, 'open palm did not wake chapter 1');
  await until((v) => v.card && v.collected >= 1, 30000, 'no memory grabbed');
  if (shots) await d.screenshot({ path: 'test-results/demo-grab.png' });
  await until((v) => v.ch === 1, 60000, 'snap did not advance to chapter 2');
  await d.close();

  // 2) Mouse walk-through of every chapter
  const m = await page('/');
  await m.click('#btn-mouse');
  await m.waitForTimeout(900);
  const n = await m.evaluate(() => window.__handGesture.STORY.length);
  for (let i = 0; i < n; i++) {
    await m.keyboard.press('KeyW');
    await m.waitForTimeout(2600);
    // Memory orbs must sit below the chapter title, not on top of it.
    const clash = await m.evaluate(() => {
      const { world } = window.__handGesture, t = document.querySelector('#title p').getBoundingClientRect();
      return world.orbs.map((o) => world.screenOf(o)).filter((p) => p.y - 40 < t.bottom && p.x > t.left - 40 && p.x < t.right + 40).length;
    });
    if (clash) fail(`mouse: chapter ${i + 1} has ${clash} memory orb(s) over the title`);
    const pos = await m.evaluate(() => { const { world } = window.__handGesture; const o = world.orbs[0]; return world.screenOf(o); });
    await m.mouse.move(pos.x, pos.y); await m.mouse.down(); await m.waitForTimeout(1300);
    s = await state(m);
    if (!s.card) fail(`mouse: chapter ${i + 1} memory card did not open`);
    const overlap = await m.evaluate(() => {
      const a = document.getElementById('card').getBoundingClientRect(), b = document.querySelector('#title h1').getBoundingClientRect();
      return !(a.bottom < b.top || a.top > b.bottom || a.right < b.left || a.left > b.right);
    });
    if (overlap) fail(`mouse: chapter ${i + 1} placard overlaps the title`);
    if (shots) await m.screenshot({ path: `test-results/chapter-${i + 1}.png` });
    await m.mouse.up();
    await m.keyboard.press('Space');
    await m.waitForTimeout(i === 0 && shots ? 600 : 1200);
    if (i === 0 && shots) { await m.screenshot({ path: 'test-results/titlecard.png' }); await m.waitForTimeout(600); }
  }
  s = await state(m);
  if (s.ch !== 0) fail(`mouse: did not loop back to chapter 1 (ch=${s.ch})`);
  await m.close();

  // 2b) Two-hand spread opens the chapter map; a map click jumps chapters.
  const t2 = await page('/');
  await t2.click('#btn-mouse'); await t2.waitForTimeout(600);
  const opened = await t2.evaluate(async () => {
    const { synthHand } = await import('/src/demo.js');
    const { handleHands, S } = window.__handGesture;
    let now = performance.now();
    S.mode = 'camera';
    handleHands([synthHand(0.45, 0.75), synthHand(0.55, 0.75)], now);
    handleHands([synthHand(0.15, 0.75), synthHand(0.85, 0.75)], now + 400);
    const open = S.mapOpen; S.mode = 'mouse';
    return open;
  });
  if (!opened) fail('two hands: spread did not open the chapter map');
  if (shots) await t2.screenshot({ path: 'test-results/chapter-map.png' });
  await t2.locator('.map-node').nth(4).click();
  await t2.waitForTimeout(1200);
  if ((await state(t2)).ch !== 4) fail('chapter map: clicking chapter 5 did not jump there');
  await t2.close();

  // 2c) Phone: tap to wake, press-and-hold to grab, next button and swipe.
  const pctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const ph2 = await pctx.newPage();
  ph2.on('pageerror', (e) => errors.push(`phone: ${e.message}`));
  await ph2.goto(BASE + '/');
  await ph2.tap('#btn-mouse'); await ph2.waitForTimeout(700);
  await ph2.touchscreen.tap(195, 300); await ph2.waitForTimeout(2600);
  if (!(await state(ph2)).awake) fail('phone: tap did not wake the world');
  const orb = await ph2.evaluate(() => { const { world } = window.__handGesture; return world.screenOf(world.orbs[1]); });
  const cdp = await pctx.newCDPSession(ph2);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', orb.x, orb.y); await ph2.waitForTimeout(1200);
  if (!(await state(ph2)).card) fail('phone: press-and-hold did not open a memory');
  const lay = await ph2.evaluate(() => {
    const r = (q) => document.querySelector(q).getBoundingClientRect();
    const c = r('#card'), t = r('#title h1'), ctl = r('#controls');
    const hit = (a, b) => !(a.bottom < b.top || a.top > b.bottom || a.right < b.left || a.left > b.right);
    return { cardTitle: hit(c, t), cardControls: hit(c, ctl), offscreen: c.right > innerWidth + 1 || c.left < -1, scrollX: document.documentElement.scrollWidth > innerWidth };
  });
  if (lay.cardTitle || lay.cardControls || lay.offscreen || lay.scrollX) fail('phone layout: ' + JSON.stringify(lay));
  if (shots) await ph2.screenshot({ path: 'test-results/phone-card.png' });
  await touch('touchEnd'); await ph2.waitForTimeout(400);
  await ph2.tap('#btn-next'); await ph2.waitForTimeout(1300);
  if ((await state(ph2)).ch !== 1) fail('phone: next button did not advance');
  await touch('touchStart', 320, 520); await touch('touchMove', 200, 525); await touch('touchMove', 80, 530); await touch('touchEnd');
  await ph2.waitForTimeout(1300);
  if ((await state(ph2)).ch !== 2) fail(`phone: swipe did not advance (ch=${(await state(ph2)).ch})`);
  await ph2.tap('#btn-map'); await ph2.waitForTimeout(700);
  if (shots) await ph2.screenshot({ path: 'test-results/phone-map.png' });
  await pctx.close();

  // 3) Camera mode with a fake camera: boot sequence must run and end in a usable state.
  const c = await page('/');
  await c.click('#btn-cam');
  await c.waitForTimeout(1500);
  if (shots) await c.screenshot({ path: 'test-results/boot.png' });
  const boot = await c.locator('#boot-log').innerText();
  if (!/CAMERA/i.test(boot)) fail('camera: boot log missing camera line');
  await c.waitForTimeout(8000);
  const mode = await c.evaluate(() => window.__handGesture.S.mode);
  console.log(`camera mode result: ${mode}; boot log:\n${(await c.locator('#boot-log').innerText()).replace(/\n/g, ' | ')}`);
  await c.close();

  // 4) Phone layout renders
  const ph = await page('/?demo', { width: 390, height: 844 });
  await ph.waitForTimeout(5500);
  if (shots) await ph.screenshot({ path: 'test-results/phone.png' });
  await ph.close();
} catch (e) { fail(e.stack); }

if (errors.length) fail('page errors:\n' + errors.join('\n'));
await browser.close();
server.kill();
console.log(process.exitCode ? 'Smoke test FAILED' : 'Smoke test passed');
