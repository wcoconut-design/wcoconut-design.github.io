// Copyright 2026 @w_coconut. All rights reserved.
// 판매 페이지 링크로 작품 정보를 채웁니다. (DLsite 위주, 다른 사이트는 제목·이미지만)
// 사이트 구조가 바뀌면 일부 항목이 비어 올 수 있어서, 결과는 항상 편집 화면에서 확인합니다.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const decode = (s) => String(s || '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const text = (html) => decode(String(html || '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ''))
  .split('\n').map((l) => l.replace(/[ \t]+$/g, '')).join('\n')
  .replace(/\n{3,}/g, '\n\n').trim();
const meta = (html, prop) => decode((html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)`, 'i')) || [])[1] || '');

// from 위치의 태그와 짝이 맞는 닫는 태그까지의 HTML
export function balancedBlock(html, from) {
  const tag = (html.slice(from).match(/^<([a-z0-9]+)/i) || [])[1];
  if (!tag) return '';
  const re = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi');
  re.lastIndex = from;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[2]) continue; // <div/> 같은 자체 닫힘
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(html.indexOf('>', from) + 1, m.index);
  }
  return html.slice(from, from + 30000); // 짝을 못 찾으면 앞부분만
}

// DLsite 새 페이지(2026년 가을~): "作品内容" 제목 아래 c-productInfo__inner 안에
// c-productContent 묶음(소제목 + 글)이 이어져요. 글이 없는 묶음(그림만)은 건너뛰어요.
export function newLayoutPromo(html) {
  const h2 = html.search(/<h2[^>]*>(?:\s|<!--[^>]*-->)*作品内容/);
  if (h2 < 0) return '';
  const at = html.indexOf('c-productInfo__inner', h2);
  if (at < 0) return '';
  // 글 속 줄바꿈은 <br>로 되어 있어요. 소스의 줄바꿈 문자는 화면에 안 보이니 지워서 빈 줄이 겹치지 않게 해요.
  const inner = balancedBlock(html, html.lastIndexOf('<', at)).replace(/\r?\n/g, '');
  const parts = [];
  const re = /<section[^>]*class=["'][^"']*\bc-productContent\b[^"']*["']/g;
  let m;
  while ((m = re.exec(inner))) {
    const sec = balancedBlock(inner, m.index);
    const head = text((sec.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || [])[1]);
    const bodies = [];
    const tr = /<div[^>]*class=["'][^"']*\bc-productContent__text\b[^"']*["']/g;
    let t;
    while ((t = tr.exec(sec))) { const b = text(balancedBlock(sec, t.index)); if (b) bodies.push(b); }
    if (bodies.length) parts.push([head, ...bodies].filter(Boolean).join('\n'));
  }
  return parts.length ? parts.join('\n\n') : text(inner);
}

// 설명 밖의 사이트 문구가 섞여 들어와도 걸러냅니다.
const CUT_AT = ['同一シリーズ作品', 'サークル作品一覧', '同一声優作品', 'この作品を買った人は', '最近チェックした作品', 'ユーザーレビュー', '販売作品', 'PAGE TOP', '作品をもっと見る'];
export function cleanPromo(s) {
  const lines = String(s || '').split('\n').map((l) => l.trim());
  const out = [];
  for (const l of lines) {
    if (CUT_AT.includes(l)) break;
    if (/\{\{|\}\}|=>|^\[\s*\]$|^[{}()]+$/.test(l)) continue; // 화면 코드 조각
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// 내 서버가 대신 받아도 되는 판매 사이트 (열쇠가 있어도 다른 사이트는 받지 않아요)
export const FETCH_OK = /(^|\.)dlsite\.com$|pokedora|stellaworth|animate/i;
// 앱으로 보낼 때 페이지를 가볍게: 스크립트·스타일·그림 코드·주석을 빼요. (정보 골라내기에는 안 쓰는 부분)
export const slimHtml = (html) => String(html || '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '')
  .replace(/<svg\b[\s\S]*?<\/svg>/gi, '').replace(/<!--(?!\[|\])[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n');
export async function get(url, headers = {}) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'ja,ko;q=0.8', Cookie: 'adultchecked=1; locale=ja-jp', ...headers },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error('판매 페이지가 응답하지 않았어요 (' + r.status + ').');
  return r;
}

// DLsite 작품 종류 코드 → 이름 (영수증 가져오기에서 음성 작품만 고르려고)
const KIND = { SOU: '음성', MUS: '음악', MNG: '만화', WBT: '만화', SCM: '만화', ICG: 'CG', DNV: '노벨', NRE: '노벨', KSV: '노벨', ADV: '게임', RPG: '게임', ACN: '게임', SLN: '게임', STG: '게임', PZL: '게임', QIZ: '게임', TBL: '게임', DGT: '게임', ETC: '기타', MOV: '동영상', TOL: '툴', IMT: '소재', AMT: '소재', PBC: '소재' };
// fetcher: 판매 페이지를 받는 방법. PC·서버는 직접 받고(get), 폰 앱은 내 서버의 /fetch로 받아요.
// 이렇게 하면 페이지에서 정보를 골라내는 일은 앱이 해서, 판매 사이트 모양이 바뀌어도 앱 업데이트만으로 고쳐져요.
export async function fetchInfo(link, { quick = false, fetcher = get } = {}) {
  let url;
  try { url = new URL(link); } catch { throw new Error('링크 형식을 확인해 주세요.'); }
  if (!/^https?:$/.test(url.protocol)) throw new Error('링크 형식을 확인해 주세요.');
  const code = (link.match(/(?:RJ|BJ|VJ)\d{6,}/i) || [''])[0].toUpperCase();
  const out = { url: link, code, title: '', circle: '', actor: '', date: '', images: [], promo: '', store: '', listPrice: null, currency: '' };
  const h = url.hostname;
  out.store = /dlsite\.com$/.test(h) ? 'DLsite' : /pokedora/.test(h) ? '포케도라' : /stellaworth/.test(h) ? '스텔라워스' : /animate/.test(h) ? '애니메이트' : '';
  if (out.store) out.currency = 'JPY';
  // 동인/상업: DLsite 작품 코드(RJ=동인, VJ·BJ=상업)와 매장 주소로 짐작
  const floor = (link.match(/dlsite\.com\/([a-z-]+)\//i) || [])[1]?.toLowerCase() || '';
  out.workType = /^RJ/.test(code) ? '동인' : /^(VJ|BJ)/.test(code) ? '상업'
    : /^(maniax|girls|bl|home)$/.test(floor) ? '동인' : /(^pro$|-pro$|^soft$|^books$|-drama$)/.test(floor) ? '상업' : '';

  if (/(^|\.)dlsite\.com$/.test(url.hostname) && code) {
    // 1) 작품 정보 JSON: 서클·성우·발매일·표지·가격이 들어 있어요.
    try {
      const arr = await (await fetcher(`https://www.dlsite.com/maniax/api/=/product.json?workno=${code}`)).json();
      const d = Array.isArray(arr) ? arr[0] : null;
      if (d) {
        out.title = d.work_name || '';
        out.circle = d.maker_name || '';
        out.date = (d.regist_date || '').slice(0, 10);
        const voices = (d.creaters?.voice_by || []).map((x) => x.name).filter(Boolean);
        if (voices.length) out.actor = voices.join(', ');
        const price = Number(d.official_price || d.price || 0);
        if (price > 0) out.listPrice = price;
        const img = d.image_main?.url || d.work_image || '';
        if (img) out.images.push(img.startsWith('//') ? 'https:' + img : img);
        if (d.intro_s) out.promoShort = String(d.intro_s).trim();
        if (d.work_type) { out.workKindCode = d.work_type; out.workKind = KIND[d.work_type] || '기타'; }
      }
    } catch {}
    // 빠른 조회(영수증 가져오기): 종류·정가만 필요해서 판매 페이지는 읽지 않아요.
    if (quick && out.title) { delete out.promoShort; return out; }
    // 2) 예전 방식 (위가 비었을 때)
    if (!out.title) {
      try {
        const j = await (await fetcher(`https://www.dlsite.com/maniax/product/info/ajax?product_id=${code}&cdn_cache_min=1`)).json();
        const d = j[code];
        if (d) {
          out.title = d.work_name || '';
          out.circle ||= d.maker_name || '';
          out.date = (d.regist_date || '').slice(0, 10);
          const price = Number(d.official_price || d.price || 0);
          if (price > 0) out.listPrice = price;
          if (d.work_image) out.images.push(d.work_image.startsWith('//') ? 'https:' + d.work_image : d.work_image);
          if (d.work_type && !out.workKind) { out.workKindCode = d.work_type; out.workKind = KIND[d.work_type] || '기타'; }
          if (quick) { delete out.promoShort; return out; }
        }
      } catch {}
    }
    // 폰용 주소(…-touch)는 PC용 판매 페이지로 바꿔서 읽어요.
    link = link.replace(/dlsite\.com\/([a-z]+)-touch\//, 'dlsite.com/$1/');
  }
  let html = '';
  try { html = await (await fetcher(link)).text(); } catch (e) { if (!out.title) throw e; }
  out.title ||= text((html.match(/<h1[^>]*id=["']work_name["'][^>]*>([\s\S]*?)<\/h1>/i) || [])[1]) || meta(html, 'og:title');
  out.circle ||= text((html.match(/class=["']maker_name["'][^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
  const row = (label) => {
    const m = html.match(new RegExp(`<th[^>]*>\\s*${label}\\s*</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`, 'i'));
    return m ? text(m[1]).replace(/\s*\n\s*/g, ' ').trim() : '';
  };
  out.actor ||= row('声優') || row('CV');
  if (!out.date) {
    const m = row('販売日').match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (m) out.date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }
  const og = meta(html, 'og:image');
  if (og && !out.images.length) out.images.push(og);
  // 작품 설명 영역: 설명 div의 시작부터 짝이 맞는 </div>까지만 잘라냅니다.
  const start = html.search(/itemprop=["']description["']/i);
  if (start >= 0) out.promo = cleanPromo(text(balancedBlock(html, html.lastIndexOf('<', start))));
  if (!out.promo) out.promo = cleanPromo(newLayoutPromo(html)); // 새 페이지 모양
  const og2 = meta(html, 'og:description');
  out.promo ||= out.promoShort || (/ダウンロードショップ|DLsite/.test(og2) && out.store === 'DLsite' ? '' : og2);
  delete out.promoShort;
  out.actor = out.actor.replace(/\s*\/\s*/g, ', ');
  return out;
}

// 진단: 판매 페이지를 어떻게 받았는지와 소개글을 어디까지 찾았는지 보여줘요. (PC 로컬판 /api/debug-info?url=…)
export async function debugInfo(link) {
  const page = link.replace(/dlsite\.com\/([a-z]+)-touch\//, 'dlsite.com/$1/');
  let r, html = '';
  try { r = await get(page); html = await r.text(); } catch (e) { return { where: 'PC', page, error: String(e?.cause?.code || e?.message || e) }; }
  const at = (re) => { const i = html.search(re); return i < 0 ? -1 : i; };
  const start = at(/itemprop=["']description["']/i);
  const fresh = start >= 0 ? '' : newLayoutPromo(html);
  const block = start >= 0 ? text(balancedBlock(html, html.lastIndexOf('<', start))) : fresh;
  const info = await fetchInfo(link).catch((e) => ({ error: e.message }));
  const promo = info.promo || '';
  return {
    where: 'PC', page, status: r.status, hasDesc: start >= 0 || !!fresh, layout: start >= 0 ? 'old' : fresh ? 'new' : 'unknown', finalUrl: r.url, length: html.length,
    title: text((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]).slice(0, 80),
    ageCheck: /年齢認証|adult_check|are you over 18/i.test(html),
    marks: { itempropDescription: start, work_parts: at(/work_parts/), work_outline: at(/work_outline/), workDescription: at(/work_description|product-description|work-description/i), 作品内容: at(/作品内容/) },
    descBlockLength: block.length,
    descBlockEnd: block.slice(-120),
    promoLength: promo.length,
    promoStart: promo.slice(0, 80),
    promoEnd: promo.slice(-80),
  };
}
