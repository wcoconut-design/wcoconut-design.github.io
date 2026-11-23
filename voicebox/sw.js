// Copyright 2026 @w_coconut. All rights reserved.
// VOICE BOX 폰 앱: 인터넷이 없어도 열리게 앱 파일을 저장해 두고, 직접 첨부한 이미지를 보여줍니다.
const VERSION = 'edf1e5f3dc';
// 짧은 주소(/voicebox/)와 예전 주소의 앱이 서로의 저장본을 지우지 않게 이름에 폴더를 붙여요.
const SCOPE_TAG = new URL(self.registration.scope).pathname;
const SHELL = `vb-shell-${VERSION}-${SCOPE_TAG}`;
const IMAGE_CACHE = 'vb-images';
const FILES = ["index.html","app.js","i18n.js","sync-core.js","style.css","style-themes.css","mobile.css","markdown.js","guide.js","export-core.js","model.js","info.js","local-api.js","mobile.js","reviewcard.html","reviewcard-bridge.js","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon.svg"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('vb-shell-') && k !== SHELL && (k.endsWith('-' + SCOPE_TAG) || !k.includes('/'))) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  // 디자인 스타일 글꼴(Google Fonts): 한 번 받으면 저장해 두고 인터넷 없이도 써요.
  // 리뷰카드 창의 글꼴·QR 코드 도구(jsDelivr)도 한 번 받으면 저장해 둬요.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(fontFetch(req));
    return;
  }
  // 판매 사이트 표지: 한 번 본 표지는 저장해 두고 인터넷이 없어도 보여줘요. (최근 5000장까지)
  if (url.origin !== scope.origin && req.destination === 'image' && /^https:$/.test(url.protocol)) {
    e.respondWith(coverFetch(req));
    return;
  }
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const rel = url.pathname.slice(scope.pathname.length);
  // 디자인 스타일용 한국어 글꼴: 고른 사람만 받고, 받은 뒤엔 저장본을 써요.
  if (rel.startsWith('fonts/')) {
    e.respondWith(fontFetch(req));
    return;
  }
  // 직접 첨부한 이미지·리뷰카드
  if (rel.startsWith('images/')) {
    const key = new URL(decodeURI(rel), self.location.origin + '/__vb__/').href;
    e.respondWith(caches.open(IMAGE_CACHE).then(async (c) => (await c.match(key)) || (await c.match(url.href))).then((r) => r || new Response('', { status: 404 })));
    return;
  }
  // 앱 파일: 인터넷이 되면 새 버전을 먼저 받고(3초 넘으면 저장본), 안 되면 저장해 둔 것을 보여줘요.
  e.respondWith((async () => {
    const cache = await caches.open(SHELL);
    const key = rel === '' || rel === 'index.html' ? 'index.html' : rel;
    const cached = () => cache.match(new URL(key, scope).href, { ignoreSearch: true });
    // 주소가 없어져도(404 등) 저장해 둔 앱으로 열리게, 정상 응답일 때만 새 버전을 써요.
    const net = fetch(req, { cache: 'no-cache' }).then((r) => { if (!r.ok) return null; if (FILES.includes(key)) cache.put(new URL(key, scope).href, r.clone()); return r; }).catch(() => null);
    const timeout = new Promise((res) => setTimeout(() => res(null), 3000));
    const first = await Promise.race([net, timeout]);
    return first || (await cached()) || (await net) || new Response('오프라인이에요. Offline.', { status: 503 });
  })());
});

const FONT_CACHE = 'vb-fonts';
async function fontFetch(req) {
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') cache.put(req.url, r.clone()).catch(() => {});
    return r;
  } catch {
    return new Response('', { status: 504 });
  }
}

const COVER_CACHE = 'vb-covers';
const COVER_MAX = 5000;
let trimTimer;
async function coverFetch(req) {
  const cache = await caches.open(COVER_CACHE);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r.ok || r.type === 'opaque') {
      cache.put(req.url, r.clone()).catch(() => {});
      clearTimeout(trimTimer);
      trimTimer = setTimeout(trimCovers, 5000);
    }
    return r;
  } catch {
    return new Response('', { status: 504 });
  }
}
async function trimCovers() {
  const cache = await caches.open(COVER_CACHE);
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - COVER_MAX))) await cache.delete(k);
}
