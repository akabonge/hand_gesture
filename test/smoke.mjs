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
    const pos = await m.evaluate(() => { const { world } = window.__handGesture; const o = world.orbs[0]; return world.screenOf(o); });
    await m.mouse.move(pos.x, pos.y); await m.mouse.down(); await m.waitForTimeout(1300);
    s = await state(m);
    if (!s.card) fail(`mouse: chapter ${i + 1} memory card did not open`);
    if (shots) await m.screenshot({ path: `test-results/chapter-${i + 1}.png` });
    await m.mouse.up();
    await m.keyboard.press('Space');
    await m.waitForTimeout(i === 0 && shots ? 600 : 1200);
    if (i === 0 && shots) { await m.screenshot({ path: 'test-results/titlecard.png' }); await m.waitForTimeout(600); }
  }
  s = await state(m);
  if (s.ch !== 0) fail(`mouse: did not loop back to chapter 1 (ch=${s.ch})`);
  await m.close();

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
