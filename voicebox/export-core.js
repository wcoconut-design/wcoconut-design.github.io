// Copyright 2026 @w_coconut. All rights reserved.
// 내보내기: 엑셀(.xlsx, 보기·보관용), CSV(다른 앱으로 옮기기용), 감상 모음 문서(HTML → 인쇄/PDF)
// lang(ko·en·ja)을 주면 머리글·시트 이름·문서 글이 그 언어로 나와요.
// 아이맥(서버)과 폰 앱(브라우저)이 함께 쓰는 코드예요. 외부 패키지 없이 만듭니다.
// 복원은 JSON 백업으로 하세요.

const STATUS_KO = { '미청취': '안 들음', '청취 중': '듣는 중', '청취 완료': '들음' };
const split = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const notionLink = (w) => (w.notionPageId ? 'https://www.notion.so/' + w.notionPageId.replace(/-/g, '') : '');

// 언어: 앱에서 고른 메뉴 언어(ko·en·ja)로 머리글·시트 이름·문서 글을 바꿔요.
const TX = {
  '코드': ['Code', 'コード'], '제목': ['Title', 'タイトル'], '원제': ['Original title', '原題'], '성우': ['Voice actor', '声優'],
  '서클': ['Circle', 'サークル'], '장르': ['Genre', 'ジャンル'], '발매일': ['Release date', '発売日'], '별점': ['Rating', '評価'],
  '별점 표시': ['Stars', '星'], '청취 상태': ['Status', '視聴状況'], '마지막 청취일': ['Last listened', '最終視聴日'],
  '즐겨찾기': ['Favorite', 'お気に入り'], '숨김': ['Hidden', '非表示'], '폴더': ['Folder', 'フォルダ'], '감상': ['Review', '感想'],
  '구매일': ['Purchase date', '購入日'], '구매처': ['Store', '購入先'], '구분': ['Type', '種類'], '통화': ['Currency', '通貨'],
  '정가': ['List price', '定価'], '구매가': ['Paid', '購入価格'], '판매 링크': ['Store link', '販売ページ'], '노션 링크': ['Notion link', 'Notionリンク'],
  '동인': ['Doujin', '同人'], '상업': ['Commercial', '商業'],
  '안 들음': ['Not yet', '未視聴'], '듣는 중': ['Listening', '視聴中'], '들음': ['Listened', '視聴済み'],
  '작품 목록': ['Works', '作品一覧'], '감상 시트': ['Reviews', '感想'], '통계': ['Stats', '統計'], '지출': ['Spending', '支出'], '요약': ['Summary', 'まとめ'],
  '발매 연도': ['Release year', '発売年'], '작품 수': ['Works', '作品数'], '항목': ['Item', '項目'], '값': ['Value', '値'],
  '내보낸 날짜': ['Exported', '書き出し日'], '작품': ['Works', '作品数'], '들은 작품': ['Listened', '視聴済み'], '별점 준 작품': ['Rated', '評価あり'],
  '평균 별점': ['Average rating', '平均評価'], '감상 쓴 작품': ['With review', '感想あり'], '월': ['Month', '月'],
  '정가 합계': ['List price total', '定価合計'], '아낀 금액': ['Saved', '節約額'],
  '감상 모음': ['Review collection', '感想まとめ'], '인쇄 / PDF로 저장': ['Print / Save as PDF', '印刷・PDFで保存'],
  '최근 들은 순': ['Recently listened', '最近聴いた順'], '별점 순': ['By rating', '評価順'],
  '아직 감상을 쓴 작품이 없어요.': ['No reviews yet.', 'まだ感想がありません。'],
};
const LANGS = { en: 0, ja: 1 };
const fixLang = (lang) => (lang === 'en' || lang === 'ja' ? lang : 'ko');
const t = (lang, ko) => (LANGS[lang] != null && TX[ko] ? TX[ko][LANGS[lang]] : ko);
const LOCALE = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };
// 한국어가 아니면 한국어 제목 대신 원래 제목을 써요(한국어 제목 칸은 한국어 메뉴에서만 써요).
const titleOf = (w, lang) => (lang === 'ko' ? w.titleKo || w.title : w.title || w.titleKo);

// 표로 내보낼 열: [머리글(한국어), 값, 너비, 종류]
const columns = (lang, works = []) => [
  ['코드', (w) => w.code, 12],
  ['제목', (w) => titleOf(w, lang), 50],
  ...(lang === 'ko' ? [['원제', (w) => (w.titleKo ? w.title : ''), 40]] : []),
  ['성우', (w) => split(w.actor).join(', '), 28],
  ['서클', (w) => w.circle, 18],
  ['장르', (w) => w.tags.join(', '), 18],
  ['발매일', (w) => w.date, 11],
  ['별점', (w) => (w.rating ? w.rating : ''), 6, 'number'],
  ['별점 표시', (w) => (w.rating ? '★'.repeat(w.rating) : ''), 10],
  ['청취 상태', (w) => (STATUS_KO[w.status] ? t(lang, STATUS_KO[w.status]) : ''), 9],
  ['마지막 청취일', (w) => w.lastPlayed, 12],
  ['즐겨찾기', (w) => (w.favorite ? '♥' : ''), 8],
  ['숨김', (w) => (w.hidden ? t(lang, '숨김') : ''), 6],
  ['폴더', (w) => w.folder, 12],
  ['감상', (w) => w.review, 60],
  ['구매일', (w) => w.purchaseDate || '', 11],
  ['구매처', (w) => w.store || '', 12],
  ['구분', (w) => (w.workType ? t(lang, w.workType) : ''), 8],
  ['통화', (w) => (w.listPrice != null || w.paidPrice != null ? w.currency || 'JPY' : ''), 6],
  ['정가', (w) => w.listPrice ?? '', 9, 'number'],
  ['구매가', (w) => w.paidPrice ?? '', 9, 'number'],
  ['판매 링크', (w) => w.url, 30],
  // 노션 연결은 PC 로컬판에서만 써요. 노션 링크가 하나도 없으면 칸을 빼요.
  ...(works.some((w) => w.notionPageId) ? [['노션 링크', notionLink, 30]] : []),
];

/* ---------------- CSV ---------------- */
export function toCsv(works, lang) {
  lang = fixLang(lang);
  works = works.filter((w) => !w.entryType); // 기타 구매·포인트 충전은 빼요
  const COLUMNS = columns(lang, works);
  const cell = (v) => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [COLUMNS.map((c) => cell(t(lang, c[0]))).join(',')];
  for (const w of works) lines.push(COLUMNS.map((c) => cell(c[1](w))).join(','));
  // 엑셀에서 한글이 깨지지 않게 BOM을 붙입니다.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/* ---------------- XLSX ---------------- */
const xmlEsc = (s) => String(s ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const colName = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };

// rows: 2차원 배열, 첫 줄은 머리글
function sheetXml(rows, widths, { types = [], wrapCols = [] } = {}) {
  const cols = widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const body = rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => {
    const ref = colName(c) + (r + 1);
    if (r === 0) return `<c r="${ref}" t="inlineStr" s="1"><is><t>${xmlEsc(v)}</t></is></c>`;
    if (v === '' || v == null) return '';
    if (types[c] === 'number' && typeof v === 'number') return `<c r="${ref}" s="3"><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr" s="${wrapCols.includes(c) ? 2 : 0}"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
  }).join('')}</row>`).join('');
  const last = colName(Math.max(0, (rows[0] || []).length - 1)) + Math.max(1, rows.length);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${cols}</cols><sheetData>${body}</sheetData>${rows.length > 1 ? `<autoFilter ref="A1:${last}"/>` : ''}</worksheet>`;
}

function countBy(works, getter) {
  const m = new Map();
  for (const w of works) for (const k of getter(w)) m.set(k, (m.get(k) || 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
}

export function toXlsx(works, compress, lang) {
  lang = fixLang(lang);
  const T = (ko) => t(lang, ko);
  works = works.filter((w) => !w.entryType); // 기타 구매·포인트 충전은 빼요
  const COLUMNS = columns(lang, works);
  const visible = works;
  const allRows = [COLUMNS.map((c) => T(c[0])), ...visible.map((w) => COLUMNS.map((c) => c[1](w)))];
  const types = COLUMNS.map((c) => c[3]);
  const wrap = [COLUMNS.findIndex((c) => c[0] === '감상')];
  const reviewed = visible.filter((w) => w.review).sort((a, b) => (b.lastPlayed || '').localeCompare(a.lastPlayed || ''));
  const revCols = ['제목', '원제', '성우', '서클', '별점 표시', '마지막 청취일', '감상'].filter((n) => COLUMNS.some((c) => c[0] === n));
  const pick = revCols.map((n) => COLUMNS.find((c) => c[0] === n));
  const revRows = [revCols.map(T), ...reviewed.map((w) => pick.map((c) => c[1](w)))];

  // 통계: 성우 / 서클 / 장르 / 발매 연도를 나란히
  const groups = [
    [T('성우'), countBy(visible, (w) => split(w.actor))],
    [T('서클'), countBy(visible, (w) => split(w.circle))],
    [T('장르'), countBy(visible, (w) => w.tags)],
    [T('발매 연도'), countBy(visible, (w) => (w.date ? [w.date.slice(0, 4)] : [])).sort((a, b) => b[0].localeCompare(a[0]))],
  ];
  const statHead = groups.flatMap(([n], i) => [n, T('작품 수'), ...(i < groups.length - 1 ? [''] : [])]);
  const maxLen = Math.max(...groups.map((g) => g[1].length));
  const statRows = [statHead];
  for (let r = 0; r < maxLen; r++) {
    statRows.push(groups.flatMap(([, list], i) => [list[r]?.[0] ?? '', list[r]?.[1] ?? '', ...(i < groups.length - 1 ? [''] : [])]));
  }
  const statTypes = statHead.map((h, i) => (i % 3 === 1 ? 'number' : ''));
  const statWidths = statHead.map((h, i) => (i % 3 === 2 ? 3 : i % 3 === 1 ? 9 : 26));

  const rated = visible.filter((w) => w.rating);
  const summary = [
    [T('항목'), T('값')],
    [T('내보낸 날짜'), new Date().toLocaleString(LOCALE[lang])],
    [T('작품'), visible.length],
    [T('들은 작품'), visible.filter((w) => w.status === '청취 완료' || w.status === '청취 중').length],
    [T('별점 준 작품'), rated.length],
    [T('평균 별점'), rated.length ? Math.round((rated.reduce((a, w) => a + w.rating, 0) / rated.length) * 10) / 10 : ''],
    [T('감상 쓴 작품'), reviewed.length],
    [T('즐겨찾기'), visible.filter((w) => w.favorite).length],
  ];

  // 지출: 월별 · 통화별 합계 (구매가가 없으면 정가로 셈)
  const spendMap = new Map();
  for (const w of visible) {
    const paid = w.paidPrice ?? w.listPrice;
    if (!w.purchaseDate || paid == null) continue;
    const key = w.purchaseDate.slice(0, 7) + '|' + (w.currency || 'JPY');
    const r = spendMap.get(key) || { n: 0, paid: 0, list: 0 };
    r.n++; r.paid += paid; r.list += w.listPrice ?? paid;
    spendMap.set(key, r);
  }
  const spendRows = [['월', '통화', '작품 수', '지출', '정가 합계', '아낀 금액'].map(T),
    ...[...spendMap].sort((a, b) => b[0].localeCompare(a[0])).map(([k, r]) => { const [m, c] = k.split('|'); return [m, c, r.n, Math.round(r.paid * 100) / 100, Math.round(r.list * 100) / 100, Math.round((r.list - r.paid) * 100) / 100]; })];

  const sheets = [
    [T('작품 목록'), sheetXml(allRows, COLUMNS.map((c) => c[2]), { types, wrapCols: wrap })],
    [lang === 'ko' ? '감상' : T('감상 시트'), sheetXml(revRows, pick.map((c) => (c[0] === '감상' ? 80 : c[0] === '제목' ? 40 : c[0] === '원제' ? 30 : c[2])), { wrapCols: [revCols.length - 1] })],
    [T('통계'), sheetXml(statRows, statWidths, { types: statTypes })],
    [T('지출'), sheetXml(spendRows, [10, 7, 9, 12, 12, 12], { types: ['', '', 'number', 'number', 'number', 'number'] })],
    [T('요약'), sheetXml(summary, [16, 24], { types: ['', 'number'] })],
  ];

  const files = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets.map(([name], i) => `<sheet name="${xmlEsc(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${xmlEsc(T('작품 목록'))}'!$A$1:$${colName(COLUMNS.length - 1)}$${allRows.length}</definedName></definedNames>
</workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`],
    ['xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Apple SD Gothic Neo"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Apple SD Gothic Neo"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3443C4"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`],
    ...sheets.map(([, xml], i) => [`xl/worksheets/sheet${i + 1}.xml`, xml]),
  ];
  const enc = new TextEncoder();
  return zip(files.map(([name, text]) => [name, enc.encode(text)]), compress);
}

// 간단한 ZIP 만들기 (xlsx는 ZIP 파일이에요). compress가 없으면 압축 없이 담아요.
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(entries, compress) {
  const parts = [], centrals = [];
  let offset = 0;
  const enc = new TextEncoder();
  for (const [name, data] of entries) {
    const nameBuf = enc.encode(name);
    const comp = compress ? compress(data) : data;
    const method = compress ? 8 : 0;
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true); local.setUint16(8, method, true);
    local.setUint32(14, crc, true); local.setUint32(18, comp.length, true); local.setUint32(22, data.length, true); local.setUint16(26, nameBuf.length, true);
    parts.push(new Uint8Array(local.buffer), nameBuf, comp);
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true); central.setUint16(4, 20, true); central.setUint16(6, 20, true); central.setUint16(8, 0x0800, true); central.setUint16(10, method, true);
    central.setUint32(16, crc, true); central.setUint32(20, comp.length, true); central.setUint32(24, data.length, true); central.setUint16(28, nameBuf.length, true); central.setUint32(42, offset, true);
    centrals.push(new Uint8Array(central.buffer), nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cdSize = centrals.reduce((a, b) => a + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  const all = [...parts, ...centrals, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let o = 0;
  for (const a of all) { out.set(a, o); o += a.length; }
  return out;
}

/* ---------------- 감상 모음 문서 ---------------- */
export function reviewsHtml(works, localize, { order = 'played', lang } = {}) {
  lang = fixLang(lang);
  const T = (ko) => t(lang, ko);
  works = works.filter((w) => !w.entryType); // 기타 구매·포인트 충전은 빼요
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const list = works.filter((w) => w.review).sort(order === 'rating'
    ? (a, b) => b.rating - a.rating || (b.lastPlayed || '').localeCompare(a.lastPlayed || '')
    : (a, b) => (b.lastPlayed || b.updatedAt || '').localeCompare(a.lastPlayed || a.updatedAt || ''));
  const today = new Date().toLocaleDateString(LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' });
  const items = list.map((w) => `
  <article class="item">
    ${w.images[0] ? `<img class="cover" src="${esc(localize(w.images[0]))}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">` : '<div class="cover"></div>'}
    <div class="body">
      <h2>${esc(titleOf(w, lang))}</h2>
      ${lang === 'ko' && w.titleKo && w.title ? `<p class="orig">${esc(w.title)}</p>` : ''}
      <p class="meta">${esc([split(w.actor).join(', '), w.circle, w.date].filter(Boolean).join(' · '))}</p>
      <p class="rec">${w.rating ? `<span class="stars">${'★'.repeat(w.rating)}<span class="off">${'★'.repeat(5 - w.rating)}</span></span>` : ''}${w.lastPlayed ? `<span>${esc(lang === 'en' ? 'Listened ' + w.lastPlayed : lang === 'ja' ? w.lastPlayed + ' 視聴' : w.lastPlayed + ' 들음')}</span>` : ''}${w.tags.length ? `<span>${esc(w.tags.join(', '))}</span>` : ''}</p>
      <div class="review">${esc(w.review)}</div>
    </div>
  </article>`).join('');
  const n = list.length;
  const countTx = lang === 'en' ? `${n} review${n === 1 ? '' : 's'}` : lang === 'ja' ? `感想 ${n}件` : `감상 ${n}개`;
  const worksTx = lang === 'en' ? `${n} work${n === 1 ? '' : 's'}` : lang === 'ja' ? `${n}作品` : `${n}편`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>POCKET VOICE BOX ${T('감상 모음')} · ${esc(today)}</title>
<style>
:root{--ink:#22201C;--muted:#6B655C;--line:#E2DCCF;--accent:#3443C4;--star:#B76E00}
*{box-sizing:border-box}body{margin:0;background:#F6F3EC;color:var(--ink);font-family:${lang === 'ja' ? "'Hiragino Sans','Noto Sans JP'," : ''}'Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif}
.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid var(--line);padding:12px 20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:14px}
.bar button,.bar a{height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--line);background:#fff;font:inherit;cursor:pointer;color:var(--ink);text-decoration:none;display:inline-flex;align-items:center}
.bar .primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.bar .sp{margin-left:auto;color:var(--muted)}
.doc{max-width:820px;margin:0 auto;padding:40px 24px 80px}
.head{border-bottom:2px solid var(--ink);padding-bottom:18px;margin-bottom:12px}
.head h1{font-family:'Nanum Myeongjo','AppleMyungjo','Noto Serif KR',serif;font-size:34px;margin:0 0 6px;letter-spacing:-.01em}
.head p{margin:0;color:var(--muted);font-size:14px}
.item{display:grid;grid-template-columns:120px minmax(0,1fr);gap:22px;padding:26px 0;border-bottom:1px solid var(--line);break-inside:avoid;page-break-inside:avoid}
.cover{width:120px;height:120px;object-fit:cover;border-radius:6px;background:#EAE4D6}
h2{font-family:'Nanum Myeongjo','AppleMyungjo','Noto Serif KR',serif;font-size:19px;line-height:1.45;margin:0 0 4px}
.orig{margin:0 0 6px;color:var(--muted);font-size:12.5px;line-height:1.5}
.meta{margin:0 0 6px;font-size:13px;color:var(--muted)}
.rec{margin:0 0 12px;font-size:13px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap}
.stars{color:var(--star);letter-spacing:1px}.stars .off{color:#D9D2C3}
.review{white-space:pre-wrap;line-height:1.95;font-size:15px}
.empty{color:var(--muted);padding:40px 0;text-align:center}
@media (max-width:560px){.item{grid-template-columns:1fr}.cover{width:100%;height:auto;aspect-ratio:1}}
@media print{body{background:#fff}.bar{display:none}.doc{padding:0;max-width:none}.item{grid-template-columns:90px minmax(0,1fr)}.cover{width:90px;height:90px}@page{margin:16mm}}
</style></head><body>
<div class="bar"><button class="primary" onclick="print()">${T('인쇄 / PDF로 저장')}</button>
<a href="?order=played&amp;lang=${lang}">${T('최근 들은 순')}</a><a href="?order=rating&amp;lang=${lang}">${T('별점 순')}</a><span class="sp">${countTx}</span></div>
<main class="doc"><header class="head"><h1>${T('감상 모음')}</h1><p>POCKET VOICE BOX / ${esc(today)} / ${worksTx}</p></header>
${items || `<p class="empty">${T('아직 감상을 쓴 작품이 없어요.')}</p>`}</main></body></html>`;
}
