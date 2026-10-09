import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { STORY } from '../src/story.js';
import { SET_PIECES } from '../src/setpieces.js';
import { createMusic } from '../src/music.js';

const pub = (p) => new URL(`../public/${p}`, import.meta.url);

test('every chapter is complete', () => {
  assert.ok(STORY.length >= 3);
  for (const c of STORY) {
    for (const k of ['name', 'kicker', 'title', 'line', 'scene']) assert.ok(c[k], `${c.name}: missing ${k}`);
    assert.equal(c.sky.length, 2);
    assert.ok(c.memories.length >= 3 && c.memories.length <= 5, `${c.name}: needs 3 to 5 memories`);
    assert.ok(SET_PIECES[c.scene], `${c.name}: unknown scene ${c.scene}`);
    assert.ok(createMusic().styles.includes(c.music), `${c.name}: unknown music ${c.music}`);
    for (const m of c.memories) assert.ok(m.t && m.p, `${c.name}: memory missing text`);
  }
});

test('every referenced photo and voice clip exists', () => {
  for (const c of STORY) {
    if (c.voice) { assert.ok(existsSync(pub(c.voice)), c.voice); assert.ok(c.caption, `${c.name}: voice without caption`); }
    for (const m of c.memories) {
      if (m.img && !/^https?:/.test(m.img)) assert.ok(existsSync(pub(m.img)), m.img);
      for (const [label, href] of m.links || []) assert.ok(label && /^https:\/\//.test(href), `${m.t}: bad link ${href}`);
      if (m.voice) assert.ok(existsSync(pub(m.voice)), m.voice);
    }
  }
});

test('no em dashes in visible copy', () => {
  assert.ok(!JSON.stringify(STORY).includes('—'));
});
