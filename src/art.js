/* Original illustrations generated as SVG (no copyrighted posters or characters):
   a cinema marquee for movie memories and a soccer ball. Returned as data: URLs for <img>. */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function marquee(lines, accent = '#f2b84b') {
  const W = 600, H = 340, n = lines.length, bulbs = [];
  for (let x = 24; x <= W - 24; x += 24) bulbs.push([x, 18], [x, H - 18]);
  for (let y = 42; y <= H - 42; y += 24) bulbs.push([18, y], [W - 18, y]);
  const rowH = (H - 130) / n;
  const rows = lines.map((l, i) => {
    const y = 120 + rowH * i + rowH / 2;
    return `<rect x="52" y="${y - rowH / 2 + 6}" width="${W - 104}" height="${rowH - 12}" rx="4" fill="#fffaf0"/>
      <text x="${W / 2}" y="${y + 9}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(30, 560 / Math.max(14, l.length) * 1.5)}" letter-spacing="2" fill="#141018" font-weight="700">${esc(l.toUpperCase())}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
    <defs><radialGradient id="b"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="${accent}"/></radialGradient></defs>
    <rect width="${W}" height="${H}" rx="14" fill="#1a0f22"/>
    <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="10" fill="none" stroke="${accent}" stroke-width="3"/>
    ${bulbs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="url(#b)"/>`).join('')}
    <text x="${W / 2}" y="86" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="40" fill="${accent}">Now showing</text>
    ${rows}
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function soccerBall(accent = '#c8ff7a') {
  // Classic truncated-icosahedron look: a central pentagon ringed by panels, on a night pitch.
  const pent = (cx, cy, r, rot = -90) => Array.from({ length: 5 }, (_, k) => { const a = (rot + k * 72) * Math.PI / 180; return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`; }).join(' ');
  const cx = 300, cy = 165, R = 120;
  const outer = Array.from({ length: 5 }, (_, k) => { const a = (-90 + 36 + k * 72) * Math.PI / 180; return [cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86]; });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340">
    <rect width="600" height="340" rx="14" fill="#0b2a17"/>
    <path d="M0 250 H600 M300 230 V340 M80 340 L120 250 M520 340 L480 250" stroke="${accent}" stroke-opacity=".35" stroke-width="3" fill="none"/>
    <ellipse cx="${cx}" cy="300" rx="110" ry="14" fill="#000" opacity=".35"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#fbfbf7" stroke="#141414" stroke-width="4"/>
    <polygon points="${pent(cx, cy, 38)}" fill="#141414"/>
    ${outer.map(([x, y], k) => `<polygon points="${pent(x, y, 30, -90 + 36 + k * 72 + 180)}" fill="#141414"/><line x1="${cx + (x - cx) * 0.36}" y1="${cy + (y - cy) * 0.36}" x2="${cx + (x - cx) * 0.7}" y2="${cy + (y - cy) * 0.7}" stroke="#141414" stroke-width="4"/>`).join('')}
    <circle cx="${cx - 40}" cy="${cy - 45}" r="34" fill="#fff" opacity=".35"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/** Resolve a memory's picture: a photo path, or generated art. */
export function memoryImage(m, accent) {
  if (m.img) return m.img;
  if (m.marquee) return marquee(m.marquee, accent);
  if (m.art === 'soccer') return soccerBall(accent);
  return null;
}
