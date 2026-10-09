// Builds a static site into dist/: copies the app, vendors pinned libraries from
// node_modules (served from our own domain), and caches the hand-tracking model.
import { cp, mkdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const dist = path.join(root, 'dist');
const nm = path.join(root, 'node_modules');
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });

await mkdir(path.join(dist, 'vendor/tasks-vision'), { recursive: true });
await cp(path.join(nm, 'three/build/three.module.js'), path.join(dist, 'vendor/three.module.js'));
await cp(path.join(nm, '@mediapipe/tasks-vision/vision_bundle.mjs'), path.join(dist, 'vendor/tasks-vision/vision_bundle.mjs'));
await cp(path.join(nm, '@mediapipe/tasks-vision/wasm'), path.join(dist, 'vendor/tasks-vision/wasm'), { recursive: true });

// Hand model (~7.5 MB): cached in .cache/ so rebuilds are fast. If the download fails,
// the app falls back to loading it from Google's CDN at runtime.
const cache = path.join(root, '.cache/hand_landmarker.task');
if (!existsSync(cache)) {
  try {
    const res = await fetch(MODEL_URL, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mkdir(path.dirname(cache), { recursive: true });
    await writeFile(cache, Buffer.from(await res.arrayBuffer()));
  } catch (e) {
    console.warn(`! Could not download the hand model (${e.message}). The site will load it from Google's CDN instead.`);
  }
}
if (existsSync(cache)) {
  await mkdir(path.join(dist, 'models'), { recursive: true });
  await cp(cache, path.join(dist, 'models/hand_landmarker.task'));
}
const size = existsSync(path.join(dist, 'models/hand_landmarker.task')) ? (await stat(path.join(dist, 'models/hand_landmarker.task'))).size : 0;
console.log(`Built dist/ (model ${size ? (size / 1e6).toFixed(1) + ' MB, self-hosted' : 'remote'})`);
