import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const browserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(existsSync);
const server = process.env.PLAYWRIGHT_BASE_URL ? null : await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'error' });
if (server) await server.listen();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ headless: true, ...(browserPath ? { executablePath: browserPath } : {}) });
const errors = [];
await mkdir('artifacts', { recursive: true });

function trackErrors(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
}
async function ready(page) {
  await page.waitForFunction(() => window.__TAOTAO__ && document.querySelector('#app.is-ready'), null, { timeout: 45000 });
  await page.locator('#loading-screen').waitFor({ state: 'hidden' });
}
const state = page => page.evaluate(() => window.__TAOTAO__.state());
const advance = (page, seconds) => page.evaluate(seconds => window.__TAOTAO__.advance(seconds), seconds);
async function choose(page, toy) {
  await page.locator('#toy-box').click();
  await page.locator(`[data-filter="全部"]`).click();
  await page.locator(`[data-toy="${toy}"]`).click();
}
async function arrive(page, toy) {
  for (let i = 0; i < 160; i++) {
    const current = await state(page);
    if (current.mode === 'playing' && current.toy === toy) return current;
    await advance(page, .3);
  }
  throw new Error(`Taotao never arrived at ${toy}: ${JSON.stringify(await state(page))}`);
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  trackErrors(page);
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await ready(page);
  await page.screenshot({ path: 'artifacts/desktop.png' });
  assert.equal(await page.locator('canvas').count(), 1);
  const routes = await page.evaluate(() => window.__TAOTAO__.routes());
  assert.equal(routes.length, 64);
  assert.deepEqual(routes.filter(route => !route.reachable || !route.clear), []);
  console.log('✓ Scene initialized without WebGL errors; all 64 toy routes are reachable and clear.');

  await page.locator('#pause').click();
  const paused = await state(page);
  await page.waitForTimeout(350);
  assert.equal((await state(page)).time, paused.time);
  assert.deepEqual((await state(page)).position, paused.position);
  await page.locator('#zoom-in').click();
  assert.ok((await state(page)).zoom > 1);
  await page.locator('#zoom-out').click();
  assert.ok(Math.abs((await state(page)).zoom - 1) < .001);
  const beforeDrag = (await state(page)).camera;
  await page.mouse.move(860, 575);
  await page.mouse.down(); await page.mouse.move(1040, 590, { steps: 12 }); await page.mouse.up();
  assert.notDeepEqual((await state(page)).camera, beforeDrag);
  await page.locator('#reset').click();
  await page.waitForFunction(() => {
    const s = window.__TAOTAO__.state();
    return Math.abs(s.zoom - 1) < .001 && s.camera.every((n, i) => Math.abs(n - [13, 13.5, 16][i]) < .02);
  });
  await page.locator('#character-focus').click();
  await page.waitForFunction(() => window.__TAOTAO__.state().zoom > 1.8);
  assert.equal((await state(page)).following, true);
  await page.screenshot({ path: 'artifacts/taotao-close.png' });
  await page.locator('#reset').click();
  await page.waitForFunction(() => Math.abs(window.__TAOTAO__.state().zoom - 1) < .001);
  await page.locator('#night').click();
  assert.equal((await state(page)).night, true);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'artifacts/night.png' });
  await page.locator('#night').click();
  await page.locator('#sound').click();
  await page.waitForFunction(() => window.__TAOTAO__.state().sound);
  await page.locator('#sound').click();
  assert.equal((await state(page)).sound, false);
  console.log('✓ Pause freezes the simulation; zoom, orbit, reset, close follow, night and audio controls work.');

  await page.locator('#toy-box').click();
  assert.equal(await page.locator('.toy-card').count(), 8);
  await page.locator('[data-filter="慢时光"]').click();
  assert.equal(await page.locator('.toy-card').count(), 2);
  await page.locator('[data-filter="动起来"]').click();
  assert.equal(await page.locator('.toy-card').count(), 3);
  await page.locator('[data-filter="全部"]').click();
  await page.screenshot({ path: 'artifacts/toybox.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#toy-dialog').evaluate(dialog => dialog.open), false);

  // Click the actual rendered ball to test raycasting, not only catalog buttons.
  const ballPoint = await page.evaluate(() => window.__TAOTAO__.projectToy('ball'));
  await page.mouse.click(ballPoint.x, ballPoint.y);
  assert.equal((await state(page)).toy, 'ball');
  assert.equal((await state(page)).running, true);
  await arrive(page, 'ball');
  await advance(page, 2);

  const movingToys = ['books', 'blocks', 'music', 'rings', 'train', 'rocker'];
  for (const toy of movingToys) {
    await choose(page, toy);
    await arrive(page, toy);
    const transformsBefore = await page.evaluate(id => window.__TAOTAO__.toyTransforms(id), toy);
    await advance(page, 3.1);
    const playing = await state(page);
    assert.equal(playing.toy, toy);
    assert.equal(playing.mode, 'playing');
    assert.ok(playing.progress > .1 && Number.isFinite(playing.arm));
    const transformsAfter = await page.evaluate(id => window.__TAOTAO__.toyTransforms(id), toy);
    assert.notDeepEqual(transformsAfter, transformsBefore, `${toy} has no visible model response`);
    if (toy === 'music') await page.screenshot({ path: 'artifacts/music.png' });
  }
  console.log('✓ Raycast selection, catalog filters, all floor activities and synchronized toy responses work.');

  await choose(page, 'castle');
  assert.equal((await state(page)).queued, 'castle', 'The rocker should finish before changing toys');
  await arrive(page, 'castle');
  await advance(page, 6);
  const climbing = await state(page);
  assert.ok(climbing.position[1] > .6, 'The character should really leave floor level');
  await choose(page, 'ball');
  assert.equal((await state(page)).toy, 'castle');
  assert.equal((await state(page)).queued, 'ball');
  await advance(page, 5);
  const onPlatform = await state(page);
  assert.ok(onPlatform.position[1] > 1.5, 'The character should be on the raised platform');
  await page.screenshot({ path: 'artifacts/castle.png' });
  await advance(page, 5);
  const sliding = await state(page);
  assert.ok(sliding.position[1] < onPlatform.position[1], 'The slide should lower the character');
  await page.screenshot({ path: 'artifacts/slide.png' });
  await arrive(page, 'ball');
  assert.ok(Math.abs((await state(page)).position[1] - .19) < .01);
  assert.equal((await state(page)).visits.length, 8);
  await page.locator('#journal-open').click();
  assert.ok(await page.locator('.journal-entry').count() >= 8);
  await page.keyboard.press('Escape');
  console.log('✓ Castle climb, bridge crossing, slide, safe activity queuing and daily discovery journal work.');

  await page.locator('#world-viewport').focus();
  await page.keyboard.press('Space');
  assert.equal((await state(page)).running, false);
  await page.keyboard.press('Space');
  assert.equal((await state(page)).running, true);
  await page.reload({ waitUntil: 'networkidle' });
  await ready(page);
  assert.equal((await state(page)).visits.length, 8, 'Today’s discoveries should survive a reload');
  if (server) {
    await page.evaluate(() => { window.__oldTaotao = window.__TAOTAO__; });
    server.ws.send({ type: 'update', updates: [{ type: 'js-update', path: '/src/main.ts', acceptedPath: '/src/main.ts', timestamp: Date.now() }] });
    await page.waitForFunction(() => window.__TAOTAO__ && window.__TAOTAO__ !== window.__oldTaotao, null, { timeout: 45000 });
    assert.equal(await page.locator('canvas').count(), 1, 'HMR must dispose the old renderer');
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 1280);
  assert.ok(await page.locator('#pause').isVisible());
  console.log('✓ Keyboard shortcuts, persistence, 720p layout and Vite hot replacement work.');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  trackErrors(mobile);
  await mobile.goto(baseURL, { waitUntil: 'networkidle' }); await ready(mobile);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth), 390);
  await mobile.screenshot({ path: 'artifacts/mobile.png' });
  const cdp = await mobile.context().newCDPSession(mobile);
  const initialMobileCamera = (await state(mobile)).camera;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 430 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 250, y: 450 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(180);
  assert.notDeepEqual((await state(mobile)).camera, initialMobileCamera);
  const initialZoom = (await state(mobile)).zoom;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 145, y: 430, id: 1 }, { x: 225, y: 430, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 105, y: 430, id: 1 }, { x: 265, y: 430, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.ok((await state(mobile)).zoom > initialZoom);
  await mobile.locator('#toy-box').tap();
  await mobile.locator('[data-toy="books"]').tap();
  assert.equal((await state(mobile)).toy, 'books');
  console.log('✓ Mobile layout, one-finger orbit, two-finger zoom and touch toy selection work.');

  const reduced = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  trackErrors(reduced);
  await reduced.goto(baseURL, { waitUntil: 'networkidle' }); await ready(reduced);
  assert.equal((await state(reduced)).running, false, 'Respect reduced motion on first load');
  await reduced.locator('#pause').click();
  assert.equal((await state(reduced)).running, true);
  assert.deepEqual(errors, [], 'Browser should not report application or WebGL errors');
  console.log('✓ Reduced-motion preference is respected. No browser errors.');
  console.log('All end-to-end checks passed. Screenshots saved in artifacts/.');
} catch (error) {
  for (const [index, page] of browser.contexts().flatMap(context => context.pages()).entries()) {
    await page.screenshot({ path: `artifacts/failure-${index}.png` }).catch(() => {});
    console.error('Last browser state:', await state(page).catch(() => null));
  }
  console.error('Browser errors:', errors);
  throw error;
} finally {
  await browser.close();
  await server?.close();
}
