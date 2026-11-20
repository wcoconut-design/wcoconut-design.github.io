// Copyright 2026 @w_coconut. All rights reserved.
// VOICE BOX ↔ 리뷰카드 메이커 연결
// 카드 메이커(maker.html)는 원본 그대로 두고, VOICE BOX가 열 때만 이 파일을 덧붙입니다.
// 하는 일: ① 작품 정보·감상·표지를 자동으로 채움 ② 만든 카드를 그 작품의 대표 카드로 저장
// ③ 간단 화면: 큰 미리보기 + 탭 3개(꾸미기·내용·표지) + 아래 저장 버튼 2개
(function () {
  'use strict';
  const workId = new URLSearchParams(location.search).get('work');
  if (!workId) return;
  const $ = (id) => document.getElementById(id);
  const extraKey = 'vb_card_' + workId; // 한줄 코멘트·등급·수위는 작품별로 기억
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('voicebox') : null;
  let work = null;

  const api = async (path, opts = {}) => {
    const r = await fetch(path, opts);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || MSG.err);
    return d;
  };
  const say = (msg) => { try { showToast(msg); } catch { alert(msg); } };
  const setInput = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.value = value || '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // ---------- 화면 글자 ----------
  const LANG = (() => { try { return JSON.parse(localStorage.getItem('voicebox.view') || '{}').menuLang || 'ko'; } catch { return 'ko'; } })();
  const MSG = {
    en: { err: 'Something went wrong.', loading: 'Loading…', refill: 'Refill from VOICE BOX', save: 'Save to app', saveTip: 'Shows this card on the work page in VOICE BOX', page: 'Review card', noCover: "Couldn't get the cover. Please upload it yourself.", curCard: 'Current card', makeFail: "Couldn't make the card image.", saving: 'Saving…', reviewDiff: 'The card text differs from your review.\nUpdate your review with the card text?', savedN: 'Saved {n} cards.', saved: 'Card saved.', refillAsk: 'Refill title, cast, circle, tags, review, rating and cover from VOICE BOX?' },
    ja: { err: 'うまくいきませんでした。', loading: '読み込み中…', refill: '作品情報をもう一度入れる', save: 'アプリに保存', saveTip: 'VOICE BOX の作品ページにこのカードが出ます', page: 'レビューカード', noCover: '表紙を取得できませんでした。画像を直接アップロードしてください。', curCard: '今のカード', makeFail: 'カード画像を作れませんでした。', saving: '保存中…', reviewDiff: 'カードの文章が感想と違います。\nカードの文章で感想も更新しますか？', savedN: 'カード({n}枚)を保存しました。', saved: 'カードを保存しました。', refillAsk: 'タイトル・声優・サークル・タグ・感想・評価・表紙を VOICE BOX の内容で入れ直しますか？' },
  }[LANG] || { err: '요청을 처리하지 못했어요.', loading: '불러오는 중…', refill: '작품 정보 다시 채우기', save: '앱에 대표 카드로 저장', saveTip: 'VOICE BOX 작품 상세에 이 카드가 보여요', page: '리뷰카드', noCover: '표지를 가져오지 못했어요. 썸네일은 직접 올려 주세요.', curCard: '지금 대표 카드', makeFail: '카드 이미지를 만들지 못했어요.', saving: '저장 중…', reviewDiff: '카드의 리뷰 글이 VOICE BOX 감상과 달라요.\n카드의 글로 감상도 바꿀까요?', savedN: '대표 카드({n}장)를 저장했어요.', saved: '대표 카드를 저장했어요.', refillAsk: '제목·성우·서클·장르·감상·별점·표지를 VOICE BOX 내용으로 다시 채울까요?' };
  const BACK = { en: 'Back', ja: '戻る' }[LANG] || '돌아가기';
  const isPhoneApp = /reviewcard\.html$/.test(location.pathname);

  // ---------- 앱의 디자인(오피스·감성 일기장·귀여운)과 밝기를 리뷰카드 창에도 맞춰요 (카드 그림 자체는 그대로) ----------
  (function applyAppStyle() {
    let v = {};
    try { v = JSON.parse(localStorage.getItem('voicebox.view') || '{}'); } catch {}
    if (v.theme === 'light' || v.theme === 'dark') { try { setThemeMode(v.theme, false); } catch {} }
    const style = v.style === 'diary' || v.style === 'cute' ? v.style : '';
    if (!style) return;
    document.documentElement.dataset.style = style;
    const tone = (v.tones || {})[style];
    if ((style === 'diary' && ['mint', 'pink', 'lav'].includes(tone)) || (style === 'cute' && ['black', 'soda', 'lav'].includes(tone))) document.documentElement.dataset.tone = tone;
    const base = isPhoneApp ? 'fonts/' : '/app/fonts/';
    const range = 'U+0020-007E,U+00A0-00FF,U+2010-2026,U+2030-2038,U+1100-11FF,U+3130-318F,U+AC00-D7A3';
    const gf = document.createElement('link');
    gf.rel = 'stylesheet';
    gf.href = style === 'diary' ? 'https://fonts.googleapis.com/css2?family=Klee+One:wght@600&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Jua&family=Mochiy+Pop+One&family=Zen+Maru+Gothic:wght@400;700&display=swap';
    document.head.appendChild(gf);
    const st = document.createElement('style');
    st.textContent = `
      @font-face{font-family:'VB Gangwon';src:url('${base}gangwon-edu-all-bold.woff2') format('woff2');font-display:swap;unicode-range:${range}}
      @font-face{font-family:'VB NanumSquareRound';src:url('${base}nanum-square-round-r.woff2') format('woff2');font-weight:100 599;font-display:swap;unicode-range:${range}}
      @font-face{font-family:'VB NanumSquareRound';src:url('${base}nanum-square-round-eb.woff2') format('woff2');font-weight:600 900;font-display:swap;unicode-range:${range}}
      [data-style="diary"][data-theme="light"]{--bg:#F5F5F3;--surface:#FCFCFB;--input:#EEEEEC;--border:#E2E2DF;--text:#3C3C3B;--sub:#7A7A76;--muted:#A3A39E;--accent:#6E6E6A;--active-text:#3C3C3B;--vb-acc:#6E6E6A;--vb-acc-soft:#ECECE9;--vb-save:#BEBEBA;--vb-save-tx:#2E2E2C}
      [data-style="diary"][data-theme="dark"]{--bg:#1A1A19;--surface:#222221;--input:#2E2E2C;--border:#363634;--text:#E9E9E6;--sub:#A3A39E;--muted:#77776F;--accent:#D6D6D2;--active-text:#fff;--vb-acc:#D6D6D2;--vb-acc-soft:#333331;--vb-save:#D6D6D2;--vb-save-tx:#1A1A19}
      [data-style="diary"][data-tone="mint"][data-theme="light"]{--bg:#F1F4F1;--surface:#FBFCFA;--input:#E3EAE5;--border:#D2DCD5;--text:#323A36;--sub:#6E7973;--muted:#98A6A0;--accent:#6A827A;--active-text:#323A36;--vb-acc:#6A827A;--vb-acc-soft:#DCE7E2;--vb-save:#B4C7C0;--vb-save-tx:#26302B}
      [data-style="diary"][data-tone="mint"][data-theme="dark"]{--bg:#18201D;--surface:#1F2825;--input:#2B3632;--border:#33403B;--text:#E5EDE9;--sub:#98A6A0;--muted:#6E7973;--accent:#B4C7C0;--active-text:#fff;--vb-acc:#B4C7C0;--vb-acc-soft:#2C3A35;--vb-save:#B4C7C0;--vb-save-tx:#18201D}
      [data-style="diary"][data-tone="pink"][data-theme="light"]{--bg:#F4F5F6;--surface:#FCFCFD;--input:#EBEEF0;--border:#DCE1E4;--text:#3C3B3E;--sub:#7A8287;--muted:#A3AAAE;--accent:#B07484;--active-text:#3C3B3E;--vb-acc:#B07484;--vb-acc-soft:#F7E8EC;--vb-save:#E2B8C3;--vb-save-tx:#3A2329}
      [data-style="diary"][data-tone="pink"][data-theme="dark"]{--bg:#1B1C1F;--surface:#232428;--input:#2E3035;--border:#383B40;--text:#ECECEF;--sub:#9EA5AA;--muted:#7A8287;--accent:#E3A3B2;--active-text:#fff;--vb-acc:#E3A3B2;--vb-acc-soft:#3A2A30;--vb-save:#E3A3B2;--vb-save-tx:#24161B}
      [data-style="diary"][data-tone="lav"][data-theme="light"]{--bg:#F6F5F8;--surface:#FCFCFD;--input:#ECEAF1;--border:#E1DEE8;--text:#3A3741;--sub:#7E7988;--muted:#A8A3B2;--accent:#7D7598;--active-text:#3A3741;--vb-acc:#7D7598;--vb-acc-soft:#ECE9F3;--vb-save:#C6C0DA;--vb-save-tx:#2D2937}
      [data-style="diary"][data-tone="lav"][data-theme="dark"]{--bg:#1B1A20;--surface:#23222A;--input:#2F2D37;--border:#393641;--text:#ECEAF2;--sub:#A09BAD;--muted:#7E7988;--accent:#CFC9E3;--active-text:#fff;--vb-acc:#CFC9E3;--vb-acc-soft:#34303F;--vb-save:#CFC9E3;--vb-save-tx:#1E1B26}
      [data-style="cute"][data-theme="light"]{--bg:#FFF4F7;--surface:#FFFFFF;--input:#FFE8EF;--border:#F5D3DE;--text:#4A3349;--sub:#8C6F89;--muted:#BBA0B5;--accent:#F0517F;--active-text:#4A3349;--vb-acc:#F0517F;--vb-acc-soft:#FFE2EC;--vb-ink:#4A3349;--vb-save:#F0517F;--vb-save-tx:#fff}
      [data-style="cute"][data-theme="dark"]{--bg:#231A29;--surface:#2D2233;--input:#3D2D44;--border:#4C3854;--text:#FBEAF2;--sub:#BBA0B5;--muted:#8C6F89;--accent:#FF8DB3;--active-text:#fff;--vb-acc:#FF8DB3;--vb-acc-soft:#4A2A3E;--vb-ink:#9A7894;--vb-save:#FF8DB3;--vb-save-tx:#2A1525}
      [data-style="cute"][data-tone="black"][data-theme="light"]{--bg:#F3F3F1;--surface:#FFFFFF;--input:#ECECEA;--border:#DADAD6;--text:#161616;--sub:#6E6E6B;--accent:#161616;--active-text:#161616;--vb-acc:#161616;--vb-acc-soft:#E9E9E6;--vb-ink:#161616;--vb-save:#161616;--vb-save-tx:#fff}
      [data-style="cute"][data-tone="soda"][data-theme="light"]{--bg:#EEF8FB;--surface:#FFFFFF;--input:#DDF1F7;--border:#C6E6EF;--text:#21414F;--sub:#5E7E8C;--accent:#1F9CC4;--active-text:#21414F;--vb-acc:#1F9CC4;--vb-acc-soft:#D8F0F8;--vb-ink:#21414F;--vb-save:#1F9CC4;--vb-save-tx:#fff}
      [data-style="cute"][data-tone="lav"][data-theme="light"]{--bg:#F6F2FD;--surface:#FFFFFF;--input:#ECE4FB;--border:#DCCFF5;--text:#3B2F5C;--sub:#7A6E99;--accent:#8A63DD;--active-text:#3B2F5C;--vb-acc:#8A63DD;--vb-acc-soft:#EDE5FC;--vb-ink:#3B2F5C;--vb-save:#8A63DD;--vb-save-tx:#fff}
      [data-style="cute"][data-tone="black"][data-theme="dark"]{--bg:#141414;--surface:#1E1E1E;--input:#2A2A2A;--border:#3A3A3A;--text:#F2F2F2;--sub:#A0A0A0;--accent:#F2F2F2;--active-text:#F2F2F2;--vb-acc:#F2F2F2;--vb-acc-soft:#2E2E2E;--vb-ink:#BDBDBD;--vb-save:#F2F2F2;--vb-save-tx:#141414}
      [data-style="cute"][data-tone="soda"][data-theme="dark"]{--bg:#10222B;--surface:#172C36;--input:#213B47;--border:#2C4A57;--text:#E4F4FA;--sub:#8FB1BE;--accent:#6FD0F0;--active-text:#E4F4FA;--vb-acc:#6FD0F0;--vb-acc-soft:#183E4C;--vb-ink:#6F95A6;--vb-save:#6FD0F0;--vb-save-tx:#0C2530}
      [data-style="cute"][data-tone="lav"][data-theme="dark"]{--bg:#1C1729;--surface:#251F35;--input:#332A48;--border:#403558;--text:#F0EBFC;--sub:#A79DC6;--accent:#B79CF5;--active-text:#F0EBFC;--vb-acc:#B79CF5;--vb-acc-soft:#3A2E5A;--vb-ink:#8D7CB8;--vb-save:#B79CF5;--vb-save-tx:#1E1534}
      [data-style] body,[data-style] button,[data-style] input,[data-style] textarea,[data-style] select,[data-style] #vbBar{font-synthesis:none}
      [data-style="diary"] body,[data-style="diary"] button,[data-style="diary"] input,[data-style="diary"] textarea,[data-style="diary"] select,[data-style="diary"] #vbBar{font-family:'VB Gangwon','Klee One','Apple SD Gothic Neo',sans-serif!important}
      [data-style="cute"] body,[data-style="cute"] button,[data-style="cute"] input,[data-style="cute"] textarea,[data-style="cute"] select,[data-style="cute"] #vbBar{font-family:'VB NanumSquareRound','Zen Maru Gothic','Apple SD Gothic Neo',sans-serif!important}
      [data-style="cute"] #vbBar .w,[data-style="cute"] .ie-header h2,[data-style="cute"] .vb-tabs button{font-family:'Jua','Mochiy Pop One','VB NanumSquareRound',sans-serif!important}
      [data-style="cute"] body{background-image:radial-gradient(var(--input) 1.6px,transparent 1.7px);background-size:22px 22px}
      [data-style="cute"] #exportBtn,[data-style="cute"] #vbX,[data-style="cute"] .vb-tabs,[data-style="cute"] .vb-ie-hd{border:2px solid var(--vb-ink)!important;border-radius:999px!important;box-shadow:none!important}
      [data-style="cute"] #vbSave,[data-style="cute"] .ie-btn-apply{border:2px solid var(--vb-ink)!important;border-radius:999px!important;box-shadow:2px 2px 0 var(--vb-ink)!important}
      [data-style="cute"] .vb-tabs button{border-radius:999px!important}
      [data-style="cute"] .vb-tabs button.on{background:var(--vb-acc)!important;color:#fff!important}
      [data-style="cute"] .ie-modal{border:2px solid var(--vb-ink)}
      [data-style="diary"] #exportBtn,[data-style="diary"] #vbSave,[data-style="diary"] #vbX{border-radius:4px!important}`;
    document.head.appendChild(st);
  })();
  // 간단 화면: 작품 정보는 VOICE BOX에서 자동으로 채우니 입력칸은 숨기고 디자인만 골라요. (?full=1 이면 원래 메이커 그대로)
  const LITE = !new URLSearchParams(location.search).has('full');
  const tx = {
    ko: { full: '전체 편집 (모든 칸)', simple: '간단 화면으로', more: '더 보기', look: '꾸미기', content: '내용', cover: '표지', seen: '카드에 보일 것', words: '카드 글', textNote: '카드에만 쓰는 제목·글이에요. 앱의 제목은 바뀌지 않아요. 감상은 저장할 때 반영할지 물어봐요.', down: '이미지로 저장', downTip: '사진첩·다운로드 폴더에 그림 파일로 받아요', qr: 'QR 코드 (판매 링크)', colorsMore: '더 보기', colorsLess: '접기', prev: '이전 장', next: '다음 장' },
    en: { full: 'Full editor (all fields)', simple: 'Back to simple view', more: 'More', look: 'Style', content: 'Content', cover: 'Cover', seen: 'Show on card', words: 'Card text', textNote: 'Title and text for this card only. The app title stays the same. You will be asked before your review changes.', down: 'Save image', downTip: 'Download the card as a picture file', qr: 'QR code (store link)', colorsMore: 'More', colorsLess: 'Less', prev: 'Previous page', next: 'Next page' },
    ja: { full: 'フル編集 (すべての項目)', simple: 'かんたん表示に戻る', more: 'その他', look: 'デザイン', content: '内容', cover: '表紙', seen: 'カードに出すもの', words: 'カードの文章', textNote: 'カード用のタイトル・文章です。アプリのタイトルは変わりません。感想は保存時に反映するか確認します。', down: '画像を保存', downTip: 'カードを画像ファイルとして保存します', qr: 'QRコード (販売リンク)', colorsMore: 'もっと見る', colorsLess: '閉じる', prev: '前のページ', next: '次のページ' },
  }[LANG] || null;
  const UIL = {
    ko: { cardLang: '카드 언어', layout: '카드 모양', player: '세로형', classic: '가로형', theme: '테마', thumb: '표지', title: '카드에 쓸 제목', rating: '등급', heart: '수위 · 농도', headline: '한줄 코멘트', review: '리뷰', fontSize: '글씨 크기', color: '글씨 색', reviewer: '작성자', spoiler: '스포일러 주의 표시', date: '작성일 표시', edit: '편집', change: '변경', del: '제거' },
    en: { cardLang: 'Card language', layout: 'Card shape', player: 'Portrait', classic: 'Landscape', theme: 'Theme', thumb: 'Cover', title: 'Title on the card', rating: 'Age rating', heart: 'Heat level', headline: 'One-line comment', review: 'Review', fontSize: 'Text size', color: 'Text color', reviewer: 'Author', spoiler: 'Spoiler warning', date: 'Show date', edit: 'Edit', change: 'Change', del: 'Remove' },
    ja: { cardLang: 'カードの言語', layout: 'カードの形', player: '縦型', classic: '横型', theme: 'テーマ', thumb: '表紙', title: 'カードのタイトル', rating: 'レーティング', heart: '濃さ', headline: 'ひとことコメント', review: 'レビュー', fontSize: '文字サイズ', color: '文字色', reviewer: '作成者', spoiler: 'ネタバレ注意を表示', date: '作成日を表示', edit: '編集', change: '変更', del: '削除' },
  }[LANG] || null;
  function relabel() {
    if (!UIL || !LITE) return;
    const set = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    set('lblLayout', UIL.layout); set('layoutPlayerTxt', UIL.player); set('layoutClassicTxt', UIL.classic);
    set('lblTheme', UIL.theme); set('lblThumb', UIL.thumb); set('lblTitle', UIL.title); set('lblRating', UIL.rating);
    set('lblHeart', UIL.heart); set('lblHeadline', UIL.headline); set('lblReview', UIL.review); set('lblFontSize', UIL.fontSize);
    set('lblColor', UIL.color); set('lblReviewer', UIL.reviewer); set('lblSpoiler', UIL.spoiler); set('lblDate', UIL.date);
    const acts = document.querySelectorAll('#thumbActions .tx');
    [UIL.edit, UIL.change, UIL.del].forEach((t, i) => { if (acts[i]) acts[i].textContent = t; });
    const ex = document.getElementById('exportBtn'); if (ex) ex.textContent = tx.down;
  }
  // 원래 화면으로: 새 탭으로 열렸으면 탭을 닫고, 폰 앱처럼 같은 화면에서 넘어왔으면 그 작품 상세로 돌아가요.
  function goBack() {
    if (window.opener && !window.opener.closed) { window.close(); return; }
    location.href = (isPhoneApp ? './' : '/') + '#open=' + encodeURIComponent(workId);
  }

  // ---------- 위쪽 막대: ‹ 작품 제목 ⋯ ----------
  const bar = document.createElement('div');
  bar.id = 'vbBar';
  bar.innerHTML = `
    <style>
      :root{--vb-acc:#3443C4;--vb-acc-soft:rgba(52,67,196,.1)}
      [data-theme="dark"]{--vb-acc:#8E9BFF;--vb-acc-soft:rgba(142,155,255,.14)}
      #vbBar{position:sticky;top:0;z-index:9999;display:flex;align-items:center;gap:6px;padding:8px 10px;padding-top:max(8px,env(safe-area-inset-top));background:var(--surface);color:var(--text);border-bottom:1px solid var(--border);font:15px/1.4 'Pretendard',-apple-system,system-ui,sans-serif}
      #vbBar button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;border-radius:10px;height:40px;padding:0 10px;white-space:nowrap}
      #vbBar button:hover{background:var(--input)}
      #vbBar .bk{font-size:15px;font-weight:600;padding:0 10px 0 6px}
      #vbBar .bk b{font-size:22px;font-weight:400;margin-right:4px;line-height:1;position:relative;top:1px}
      #vbBar .w{flex:1;min-width:0;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #vbBar .mo{font-size:20px;letter-spacing:1px;width:44px;padding:0}
      #vbBar img{height:36px;border-radius:5px;display:block}
      #vbMenu{position:absolute;right:10px;top:calc(100% - 4px);min-width:220px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 30px var(--shadow);padding:6px;display:flex;flex-direction:column}
      #vbMenu[hidden]{display:none}
      #vbBar #vbMenu button{text-align:left;height:44px;padding:0 12px;font-size:14px}
      body.vb-lite #vbCurrent{display:none}
      /* 아래 저장 버튼 2개 */
      .btn-row #exportBtn{flex:1!important;background:var(--input)!important;color:var(--text);border:1px solid var(--border);font-size:15px;font-weight:600;padding:0;min-height:48px;border-radius:12px}
      .btn-row #vbSave{flex:1.45;border:none;border-radius:12px;background:var(--vb-save,#3443C4);color:var(--vb-save-tx,#fff);font:inherit;font-size:15px;font-weight:700;min-height:48px;padding:0 10px;cursor:pointer}
      .btn-row #vbSave:disabled{opacity:.6;cursor:default}
      .btn-row{gap:8px!important}
      @media (min-width:901px){
        .wrap{height:calc(100vh - var(--vbbar-h,0px))!important}
        #preview{max-height:calc(100vh - var(--vbbar-h,0px) - 90px)!important}
      }
      @media (max-width:900px){
        #vbBar{position:relative}
        .wrap{padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
        .btn-row{padding:10px 16px calc(10px + env(safe-area-inset-bottom))!important}
      }
    </style>
    <button type="button" id="vbBack" class="bk" aria-label="${BACK}"><b>‹</b></button>
    <span class="w" id="vbWork">${MSG.loading}</span>
    <span id="vbCurrent"></span>
    <button type="button" id="vbMore" class="mo" aria-label="${tx.more}" aria-haspopup="menu" aria-expanded="false">⋯</button>
    <div id="vbMenu" role="menu" hidden>
      <button type="button" role="menuitem" id="vbRefill">${MSG.refill}</button>
      <button type="button" role="menuitem" id="vbFull">${LITE ? tx.full : tx.simple}</button>
    </div>`;
  document.body.prepend(bar);
  $('vbBack').onclick = goBack;
  const menu = $('vbMenu');
  const toggleMenu = (open) => { menu.hidden = !open; $('vbMore').setAttribute('aria-expanded', String(open)); };
  $('vbMore').onclick = (e) => { e.stopPropagation(); toggleMenu(menu.hidden); };
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) toggleMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
  $('vbFull').onclick = () => {
    const u = new URL(location.href);
    if (LITE) u.searchParams.set('full', '1'); else u.searchParams.delete('full');
    location.replace(u.toString());
  };
  // 저장 버튼은 아래 막대에 [이미지로 저장] 옆에 둬요.
  const exportBtn = $('exportBtn');
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button'; saveBtn.id = 'vbSave'; saveBtn.textContent = MSG.save; saveBtn.title = MSG.saveTip;
  if (exportBtn) {
    exportBtn.after(saveBtn);
    exportBtn.title = tx.downTip;
    exportBtn.removeAttribute('style');
    exportBtn.textContent = tx.down;
    new MutationObserver(() => { if (exportBtn.textContent !== tx.down) exportBtn.textContent = tx.down; }).observe(exportBtn, { childList: true, characterData: true, subtree: true });
  } else bar.appendChild(saveBtn);
  const setH = () => document.documentElement.style.setProperty('--vbbar-h', bar.offsetHeight + 'px');
  setH(); addEventListener('resize', setH);
  if (LITE) setupLite();

  function setupLite() {
    document.body.classList.add('vb-lite');
    const st = document.createElement('style');
    st.textContent = `
      .vb-lite .topbar, .vb-lite #resetBtn, .vb-lite #themeSelect, .vb-lite .pv-nav-ind { display: none !important; }
      .vb-lite .editor-grid [data-vbtab]:not(.vb-on) { display: none !important; }
      .vb-lite .editor-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
      .vb-lite .editor-grid > * { min-width: 0; }
      .vb-lite .editor { padding: 14px 18px 0; }
      .vb-lite label { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
      .vb-lite .rating-btn { font-size: 13px; padding: 10px 0; border-radius: 10px; }
      .vb-lite .rating-btn.active-none { border: 1.5px solid var(--vb-acc); background: var(--vb-acc-soft); color: var(--vb-acc); }
      .vb-lite .rating-row { gap: 6px; }
      .vb-lite .layout-btn .layout-ico { width: 17px; height: 17px; }
      .vb-lite input[type=text], .vb-lite textarea { font-size: 15px; padding: 10px 12px; border-radius: 10px; }
      .vb-lite input[type=range] { accent-color: var(--vb-acc); }
      /* 탭 */
      .vb-lite .vb-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: var(--input); position: sticky; top: 0; z-index: 6; }
      .vb-lite .vb-tabs button { flex: 1; border: none; background: none; padding: 10px 0; border-radius: 9px; font: inherit; font-size: 15px; color: var(--sub); cursor: pointer; }
      .vb-lite .vb-tabs button.on { background: var(--surface); color: var(--vb-acc); font-weight: 700; box-shadow: 0 1px 3px var(--shadow); }
      .vb-lite .vb-h { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: -6px; }
      .vb-lite .vb-h ~ .vb-h { border-top: 1px solid var(--border); padding-top: 18px; }
      .vb-lite .editor-credit { font-size: 11px; font-weight: 500; padding: 14px 0 6px; }
      .vb-lite .vb-note { font-size: 12.5px; color: var(--sub); line-height: 1.5; margin-top: -10px; }
      /* 켜고 끄는 칸: 이름 왼쪽, 스위치 오른쪽 */
      .vb-lite .check-label { flex-direction: row-reverse; justify-content: space-between; gap: 12px; font-size: 15px; font-weight: 500; color: var(--text); padding: 2px 0; }
      .vb-lite .check-label input[type=checkbox] { appearance: none; -webkit-appearance: none; flex: none; width: 44px; height: 26px; border-radius: 13px; background: var(--muted); position: relative; margin: 0; transition: background .15s; }
      .vb-lite .check-label input[type=checkbox]::before { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .15s; }
      .vb-lite .check-label input[type=checkbox]:checked { background: var(--vb-acc); }
      .vb-lite .check-label input[type=checkbox]:checked::before { transform: translateX(18px); }
      .vb-lite .vb-switches { display: flex; flex-direction: column; gap: 10px; }
      .vb-lite .vb-switches .field { margin: 0; }
      /* 테마 견본 */
      .vb-lite .vb-themes { display: flex; gap: 10px; overflow-x: auto; padding: 4px; margin: -4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; scroll-snap-type: x proximity; }
      .vb-lite .vb-themes::-webkit-scrollbar { display: none; }
      .vb-lite .vb-themes button { position: relative; flex: none; border: none; background: none; padding: 0; cursor: pointer; scroll-snap-align: start; }
      .vb-lite .vb-themes i { display: block; width: 44px; height: 44px; border-radius: 11px; border: 1px solid var(--border); box-sizing: border-box; }
      .vb-lite .vb-themes button.on i { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--vb-acc); }
      .vb-lite .vb-themes .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      .vb-lite #lblTheme[data-name]::after { content: ' · ' attr(data-name); color: var(--vb-acc); }
      @media (min-width: 901px) { .vb-lite .vb-themes { flex-wrap: wrap; overflow: visible; } }
      /* 글씨 색: 처음엔 6개만 */
      .vb-lite .color-grid { gap: 10px; padding: 0; background: none; border: none; align-items: center; }
      .vb-lite .color-swatch { width: 30px; height: 30px; border-radius: 50%; }
      .vb-lite .color-swatch.active { transform: none; border: 2px solid var(--surface); box-shadow: 0 0 0 2px var(--vb-acc); }
      .vb-lite .color-swatch-auto::after { width: 16px; height: 16px; font-size: 11px; }
      .vb-lite .color-grid:not(.vb-all) .color-swatch:nth-child(n+7) { display: none; }
      .vb-lite .vb-colmore { border: none; background: none; color: var(--vb-acc); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; padding: 6px 4px; }
      /* 장 넘기기: 점 */
      .vb-lite .pv-nav { gap: 6px; padding: 2px 0; }
      .vb-lite .pv-nav-btn { width: 36px; height: 36px; border: none; background: none; font-size: 24px; color: var(--sub); }
      .vb-lite .pv-nav-btn:hover { background: var(--input); color: var(--text); }
      .vb-lite .pv-nav-btn:disabled { opacity: .25; background: none; }
      .vb-lite .vb-dots { display: flex; gap: 6px; align-items: center; }
      .vb-lite .vb-dots button { width: 8px; height: 8px; border-radius: 4px; border: none; padding: 0; background: var(--muted); cursor: pointer; transition: width .15s; }
      .vb-lite .vb-dots button.on { width: 20px; background: var(--vb-acc); }
      /* PC: 왼쪽 큰 카드, 오른쪽 설정 */
      @media (min-width: 901px) {
        .vb-lite .layout { grid-template-columns: minmax(0, 1.35fr) minmax(340px, 1fr); }
        .vb-lite .preview-wrap { order: -1; }
        .vb-lite .editor { max-width: 520px; height: auto; max-height: 100%; align-self: start; }
      }
      @media (max-width: 900px) {
        .vb-lite .preview-wrap { top: 0; padding: 8px 0 4px; gap: 2px; }
        .vb-lite #preview { max-height: 32vh; border-radius: 10px; }
        .vb-lite .pv-nav-btn { width: 32px; height: 30px; }
        .vb-lite .vb-tabs { position: static; }
      }
    `;
    document.head.appendChild(st);
    const field = (id) => document.getElementById(id)?.closest('.field');
    const grid = document.querySelector('.editor-grid');
    const end = $('pvOverflow') || grid.querySelector('.btn-row');
    const mk = (cls, tab, html) => { const d = document.createElement('div'); d.className = cls; d.dataset.vbtab = tab; if (html != null) d.innerHTML = html; return d; };

    // 숨길 칸 (작품 정보는 VOICE BOX에서 자동으로 채워요)
    for (const id of ['inCircle', 'inArtist', 'inGenre', 'starSelectRow', 'progressSlider', 'inQR']) { const f = field(id); if (f) f.dataset.vbtab = 'hide'; }

    // 카드 언어 (카드에 찍히는 '스포일러 주의'·등급 글자)
    const langField = mk('field full', 'content', `<label id="vbLblCardLang">${UIL.cardLang}</label><div class="rating-row"><button type="button" class="rating-btn" data-cl="ko">한국어</button><button type="button" class="rating-btn" data-cl="ja">日本語</button></div>`);
    const qrField = mk('field full', 'content', `<label class="check-label"><input type="checkbox" id="vbQrOn"> <span>${tx.qr}</span></label>`);
    const switches = mk('vb-switches', 'content');
    for (const f of [field('chkSpoiler'), field('chkDate'), qrField]) if (f) { delete f.dataset.vbtab; switches.appendChild(f); }

    // 탭별로 순서대로 다시 놓아요 (칸은 그대로 옮기기만 해서 원래 기능은 같아요)
    const order = {
      look: [field('layoutRow'), field('themeSelect'), field('fontSizeSlider'), field('colorGrid')],
      content: [mk('vb-h', 'content', tx.seen), field('ratingRow'), field('heartSelectRow'), switches, langField,
        mk('vb-h', 'content', tx.words), field('inHeadline'), field('inTitle'), field('inReview'), mk('vb-note', 'content', tx.textNote), field('inReviewer')],
      cover: [field('thumbBox')],
    };
    for (const [tab, els] of Object.entries(order)) for (const el of els) if (el) { el.dataset.vbtab = tab; grid.insertBefore(el, end); }
    $('vbQrOn').onchange = (e) => { setQr(e.target.checked); saveExtra({ qrOff: !e.target.checked }); };

    const tabs = document.createElement('div');
    tabs.className = 'vb-tabs'; tabs.setAttribute('role', 'tablist');
    tabs.innerHTML = ['look', 'content', 'cover'].map((k) => `<button type="button" role="tab" data-k="${k}">${tx[k]}</button>`).join('');
    grid.prepend(tabs);
    const show = (k) => {
      tabs.querySelectorAll('button').forEach((b) => { b.classList.toggle('on', b.dataset.k === k); b.setAttribute('aria-selected', String(b.dataset.k === k)); });
      grid.querySelectorAll('[data-vbtab]').forEach((f) => f.classList.toggle('vb-on', f.dataset.vbtab === k));
    };
    tabs.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };

    // 카드 언어는 카드에 찍히는 글자(스포일러 주의·등급)에만 쓰고,
    // 편집 화면(표지 편집 창·안내 문구)은 앱 메뉴 언어를 따라요.
    let cardLang = 'ko';
    const UI_LANG = LANG === 'ja' ? 'ja' : 'ko';
    for (const name of ['drawPage1', 'drawContPage', 'drawClassicCard']) {
      const orig = window[name];
      if (typeof orig !== 'function' || orig.vbWrapped) continue;
      window[name] = function (...args) {
        const prev = currentLang;
        currentLang = cardLang;
        try { return orig.apply(this, args); } finally { currentLang = prev; }
      };
      window[name].vbWrapped = true;
    }
    try { setLanguage(UI_LANG); } catch {}
    const setCardLang = (l) => {
      cardLang = l;
      try { localStorage.setItem('vb_card_lang', l); } catch {}
      langField.querySelectorAll('[data-cl]').forEach((b) => b.classList.toggle('active-none', b.dataset.cl === l));
      try { updateAll(); } catch {}
      relabel();
    };
    langField.onclick = (e) => { const b = e.target.closest('[data-cl]'); if (b) setCardLang(b.dataset.cl); };
    if (typeof window.setLanguage === 'function' && !window.setLanguage.vbWrapped) {
      const orig = window.setLanguage;
      window.setLanguage = function (...args) { const r = orig.apply(this, args); try { relabel(); } catch {} return r; };
      window.setLanguage.vbWrapped = true;
    }

    // 테마: 글자 목록 대신 색 견본
    const themes = document.createElement('div');
    themes.className = 'vb-themes';
    try {
      themes.innerHTML = THEMES.map(([k, t]) => `<button type="button" data-th="${k}" title="${t.name}"><i style="background:linear-gradient(135deg,${t.bg1},${t.bg2})"></i><span class="sr">${t.name}</span></button>`).join('');
    } catch {}
    $('themeSelect')?.after(themes);
    themes.onclick = (e) => {
      const b = e.target.closest('[data-th]'); if (!b) return;
      const s = $('themeSelect'); s.value = b.dataset.th; s.dispatchEvent(new Event('change'));
    };

    // 글씨 색: 6개 + 더 보기
    const cg = $('colorGrid');
    const colMore = document.createElement('button');
    colMore.type = 'button'; colMore.className = 'vb-colmore';
    const setColMore = (all) => { cg.classList.toggle('vb-all', all); colMore.textContent = all ? tx.colorsLess : tx.colorsMore + ' ›'; };
    colMore.onclick = () => setColMore(!cg.classList.contains('vb-all'));
    cg?.appendChild(colMore); setColMore(false);

    // 장 넘기기: ◀ 1/2 ▶ 대신 ‹ ● ○ › , 카드를 옆으로 밀어도 넘어가요
    const nav = $('pvNav');
    const dots = document.createElement('div'); dots.className = 'vb-dots';
    if (nav) {
      const bs = nav.querySelectorAll('.pv-nav-btn');
      if (bs[0]) { bs[0].textContent = '‹'; bs[0].setAttribute('aria-label', tx.prev); }
      if (bs[1]) { bs[1].textContent = '›'; bs[1].setAttribute('aria-label', tx.next); }
      $('pvNavInd')?.after(dots);
    }
    dots.onclick = (e) => { const b = e.target.closest('[data-pg]'); if (!b) return; try { pvPage = +b.dataset.pg; renderPreview(); } catch {} };
    const pv = $('preview');
    let x0 = null;
    pv?.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    pv?.addEventListener('touchend', (e) => {
      if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { try { dx < 0 ? nextPage() : prevPage(); } catch {} }
    }, { passive: true });

    // 화면이 다시 그려질 때 견본·점 표시도 맞춰요
    const sync = () => {
      let key = ''; try { key = state.themeKey; } catch {}
      themes.querySelectorAll('[data-th]').forEach((b) => b.classList.toggle('on', b.dataset.th === key));
      const onB = themes.querySelector('.on');
      if ($('lblTheme')) $('lblTheme').dataset.name = onB ? onB.title : '';
      if (onB && !themes.dataset.scrolled && themes.clientWidth) { themes.dataset.scrolled = '1'; themes.scrollLeft = Math.max(0, onB.offsetLeft - themes.offsetLeft - themes.clientWidth / 2 + 22); }
      if (cg) { const sw = [...cg.querySelectorAll('.color-swatch')]; if (sw.findIndex((s) => s.classList.contains('active')) >= 6) setColMore(true); }
      try {
        const n = pvLayout ? pvLayout.pages.length : 1;
        dots.innerHTML = n > 1 ? Array.from({ length: n }, (_, i) => `<button type="button" data-pg="${i}" class="${i === pvPage ? 'on' : ''}" aria-label="${i + 1} / ${n}"></button>`).join('') : '';
      } catch {}
      if (exportBtn) exportBtn.removeAttribute('style');
    };
    for (const name of ['updateAll', 'renderPreview']) {
      const orig = window[name];
      if (typeof orig !== 'function' || orig.vbWrapped) continue;
      window[name] = function (...args) { const r = orig.apply(this, args); try { sync(); } catch {} return r; };
      window[name].vbWrapped = true;
    }

    let cl = null; try { cl = localStorage.getItem('vb_card_lang'); } catch {}
    setCardLang(cl === 'ko' || cl === 'ja' ? cl : (LANG === 'ja' ? 'ja' : 'ko'));
    const credit = document.querySelector('.editor-credit');
    if (credit) { credit.textContent = 'Review Card design by @w_coconut'; credit.removeAttribute('data-vbtab'); grid.after(credit); }
    show('look');
    sync();
  }


  // ---------- 채우기 ----------
  async function coverFile(src) {
    if (!src) return null;
    // 판매 사이트 이미지는 브라우저 보안상 카드에 그리면 저장이 막혀서, VOICE BOX가 받아서 같은 주소로 넘겨줍니다.
    const url = (src.startsWith('/images/') || src.startsWith('images/')) ? src : 'api/image-proxy?work=' + encodeURIComponent(workId) + '&src=' + encodeURIComponent(src);
    const r = await fetch(url);
    if (!r.ok) return null;
    const blob = await r.blob();
    return new File([blob], 'cover', { type: blob.type || 'image/jpeg' });
  }

  function readExtra() { try { return JSON.parse(localStorage.getItem(extraKey) || '{}'); } catch { return {}; } }
  function saveExtra(patch) { try { localStorage.setItem(extraKey, JSON.stringify({ ...readExtra(), ...patch })); } catch {} }
  function setQr(on) {
    setInput('inQR', on && work ? work.url : '');
    try { state.qrUrl = on && work ? (work.url || '') : ''; updateAll(); } catch {}
  }
  async function fill() {
    work = await api('api/works/' + encodeURIComponent(workId));
    $('vbWork').textContent = work.titleKo || work.title;
    document.title = MSG.page + ' · ' + (work.titleKo || work.title);
    const ex0 = readExtra();
    setInput('inTitle', ex0.cardTitle || work.titleKo || work.title);
    setInput('inArtist', String(work.actor || '').split(',').map((s) => s.trim()).filter(Boolean).join(', '));
    setInput('inCircle', work.circle);
    setInput('inGenre', (work.tags || []).join(' · '));
    setInput('inReview', work.review);
    setInput('inQR', ex0.qrOff ? '' : work.url);
    if ($('vbQrOn')) $('vbQrOn').checked = !ex0.qrOff && !!work.url;
    state.starRating = work.rating ? work.rating + '/5' : '선택안함';
    let extra = {};
    try { extra = JSON.parse(localStorage.getItem(extraKey) || '{}'); } catch {}
    setInput('inHeadline', extra.headline || '');
    if (extra.eroRating) state.eroRating = extra.eroRating;
    if (extra.ageRating) state.ageRating = extra.ageRating;
    // 재생 바 위치: 작품마다 무작위로 정하고 기억해요 (다시 열어도 같은 카드).
    if (typeof extra.progress !== 'number') { extra.progress = Math.round((0.15 + Math.random() * 0.7) * 100) / 100; try { localStorage.setItem(extraKey, JSON.stringify(extra)); } catch {} }
    state.progress = extra.progress;
    if ($('progressSlider')) $('progressSlider').value = extra.progress;
    updateAll();
    showCurrent();
    const f = await coverFile((work.sourceImages || work.images || [])[0]).catch(() => null);
    if (f) loadThumb(f);
    else say(MSG.noCover);
  }

  function showCurrent() {
    const cur = (work.reviewCard || [])[0];
    $('vbCurrent').innerHTML = cur ? `<a href="${cur}" target="_blank" title="${MSG.curCard}"><img src="${cur}" alt="${MSG.curCard}"></a>` : '';
  }

  // ---------- 저장: 카드 메이커의 이미지 저장 과정을 그대로 쓰고, 파일 받기 대신 VOICE BOX로 보냅니다 ----------
  function capture(scale) {
    return new Promise((resolve, reject) => {
      const pages = state.cardLayout === 'classic' ? getClassicLayout().pages.length : getReviewLayout().pages.length;
      const blobs = [];
      const origToBlob = HTMLCanvasElement.prototype.toBlob;
      const origClick = HTMLAnchorElement.prototype.click;
      const hadShare = Object.getOwnPropertyDescriptor(navigator, 'canShare');
      const origToast = window.showToast;
      window.showToast = () => {}; // 메이커의 '파일 다운로드' 안내는 여기선 맞지 않아요
      const restore = () => {
        window.showToast = origToast;
        HTMLCanvasElement.prototype.toBlob = origToBlob;
        HTMLAnchorElement.prototype.click = origClick;
        if (hadShare) Object.defineProperty(navigator, 'canShare', hadShare); else delete navigator.canShare;
      };
      HTMLCanvasElement.prototype.toBlob = function (cb, type, q) {
        return origToBlob.call(this, (b) => { blobs.push(b); cb && cb(b); }, type, q);
      };
      HTMLAnchorElement.prototype.click = function () {
        if (this.download && this.download.startsWith('voice-drama-')) return; // 파일 받기는 건너뜀
        return origClick.call(this);
      };
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
      const started = Date.now();
      const tick = () => {
        if (blobs.length >= pages) { restore(); resolve(blobs.slice(0, pages)); return; }
        if (Date.now() - started > 15000) { restore(); reject(new Error(MSG.makeFail)); return; }
        setTimeout(tick, 150);
      };
      try { exportImage(scale); } catch (e) { restore(); reject(e); return; }
      tick();
    });
  }

  $('vbSave').onclick = async () => {
    const btn = $('vbSave');
    btn.disabled = true; btn.textContent = MSG.saving;
    try {
      const blobs = await capture(2);
      const paths = [];
      for (const b of blobs) {
        const r = await api('api/upload?work=' + encodeURIComponent(workId), { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: b });
        paths.push(r.src);
      }
      const patch = { reviewCard: paths };
      const cardReview = $('inReview').value.trim();
      if (cardReview && cardReview !== (work.review || '').trim()) {
        if (confirm(MSG.reviewDiff)) patch.review = cardReview;
      }
      const t0 = work.titleKo || work.title;
      const ct = $('inTitle').value.trim();
      saveExtra({ headline: $('inHeadline').value, eroRating: state.eroRating, ageRating: state.ageRating, progress: state.progress, cardTitle: ct && ct !== t0 ? ct : '' });
      work = await api('api/works/' + encodeURIComponent(workId), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      channel?.postMessage({ type: 'work', id: workId });
      showCurrent();
      say(paths.length > 1 ? MSG.savedN.replace('{n}', paths.length) : MSG.saved);
      if (isPhoneApp) setTimeout(goBack, 1200); // 폰 앱은 저장하면 작품 화면으로 돌아가요
    } catch (e) {
      say(e.message);
    } finally {
      btn.disabled = false; btn.textContent = MSG.save;
    }
  };
  // ---------- X에 올리기: 카드 이미지 + 추천 글 ----------
  // 폰: 공유 창 → X 선택. PC: 이미지를 복사하고 X 글쓰기 창을 열어요(붙여 넣기).
  const XTS = {
    ko: { btn: 'X에 올리기', making: '카드 이미지를 만드는 중…', title: 'X에 올리기', text: '올릴 글', go: 'X에 올리기', cancel: '취소', hintShare: '공유 창에서 X를 골라요. 글이 빠지면 붙여 넣기만 하면 돼요 (글은 복사해 뒀어요).', hintPc: '이미지를 복사하고 X 글쓰기 창을 열어요. 창이 열리면 Ctrl+V (Mac은 ⌘V)로 이미지를 붙여 넣어요.', hintMany: '카드가 {n}장이면 첫 장만 복사돼요. 나머지는 [이미지로 저장] 후 직접 첨부해요.', copied: '이미지를 복사했어요. X 창에서 붙여 넣어요.', copyFail: '이미지를 복사하지 못했어요. [이미지로 저장] 후 직접 첨부해 주세요.' },
    en: { btn: 'Post to X', making: 'Making the card image…', title: 'Post to X', text: 'Post text', go: 'Post to X', cancel: 'Cancel', hintShare: 'Pick X in the share sheet. If the text is missing, just paste it (it is copied).', hintPc: 'The image is copied and an X post window opens. Paste the image with Ctrl+V (⌘V on Mac).', hintMany: 'Only the first of {n} pages is copied. Save the others with [Save image] and attach them.', copied: 'Image copied. Paste it in the X window.', copyFail: "Couldn't copy the image. Use [Save image] and attach it." },
    ja: { btn: 'Xに投稿', making: 'カード画像を作成中…', title: 'Xに投稿', text: '投稿する文章', go: 'Xに投稿', cancel: 'キャンセル', hintShare: '共有メニューでXを選びます。文章が消えたら貼り付けてください (コピー済み)。', hintPc: '画像をコピーしてXの投稿画面を開きます。Ctrl+V (Macは⌘V) で画像を貼り付けてください。', hintMany: '{n}枚のうち最初の1枚だけコピーされます。残りは[画像を保存]から添付してください。', copied: '画像をコピーしました。Xの画面で貼り付けてください。', copyFail: '画像をコピーできませんでした。[画像を保存]から添付してください。' },
  };
  const XL = XTS[LANG] || XTS.ko;
  const tag = (s) => String(s || '').replace(/[^\p{L}\p{N}_]/gu, '');
  // 성우: "土門熱 도몬 아츠시" → "土門熱" (일본어 원래 이름만)
  const jaName = (s) => {
    const ja = String(s).split(/\s+/).filter((t) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(t) && !/\p{Script=Hangul}/u.test(t)).join('');
    return ja || String(s).trim();
  };
  function postText() {
    const title = ($('inTitle')?.value || work?.titleKo || work?.title || '').trim();
    const stars = work?.rating ? ' ' + '★'.repeat(work.rating) : '';
    const actors = [...new Set(String(work?.actor || '').split(/[,、]/).map((a) => jaName(a)).filter(Boolean))];
    const tags = [work?.store, ...actors.slice(0, 3), 'Review'].map(tag).filter(Boolean);
    return [title + stars, actors.length ? 'CV ' + actors.join(' / ') : '', [...new Set(tags)].map((t) => '#' + t).join(' '), work?.url || ''].filter(Boolean).join('\n');
  }
  const canShareFiles = () => { try { return !!navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'card.png', { type: 'image/png' })] }); } catch { return false; } };

  const xBtn = document.createElement('button');
  xBtn.type = 'button'; xBtn.id = 'vbX'; xBtn.textContent = '𝕏'; xBtn.title = XL.btn; xBtn.setAttribute('aria-label', XL.btn);
  (exportBtn || saveBtn).before(xBtn);
  const xs = document.createElement('style');
  xs.textContent = `
    .btn-row #vbX{flex:none;width:48px;min-height:48px;border-radius:12px;border:1px solid var(--border);background:var(--input);color:var(--text);font-size:20px;font-weight:700;cursor:pointer;padding:0}
    #vbXDlg{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;font:15px/1.5 'Pretendard',-apple-system,system-ui,sans-serif}
    #vbXDlg .bx{background:var(--surface);color:var(--text);width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:18px 18px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;max-height:92vh;overflow:auto}
    @media (min-width:700px){#vbXDlg{align-items:center}#vbXDlg .bx{border-radius:18px}}
    #vbXDlg h3{margin:0;font-size:17px}
    #vbXDlg .th{display:flex;gap:8px;overflow-x:auto}
    #vbXDlg .th img{height:110px;border-radius:8px;border:1px solid var(--border)}
    #vbXDlg label{font-size:13px;font-weight:600;color:var(--sub)}
    #vbXDlg textarea{width:100%;box-sizing:border-box;min-height:120px;font:inherit;font-size:15px;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--input);color:var(--text);resize:vertical}
    #vbXDlg .hint{font-size:12.5px;color:var(--sub);margin:0}
    #vbXDlg .acts{display:flex;gap:8px}
    #vbXDlg .acts button{flex:1;min-height:48px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer}
    #vbXDlg .c{background:var(--input);color:var(--text);border:1px solid var(--border)}
    #vbXDlg .g{flex:1.6!important;background:#000;color:#fff;border:none}
    [data-theme="dark"] #vbXDlg .g{background:#fff;color:#000}`;
  document.head.appendChild(xs);

  xBtn.onclick = async () => {
    if (!work) { say(MSG.loading); return; }
    xBtn.disabled = true;
    say(XL.making);
    let blobs;
    try { blobs = await capture(2); } catch (e) { say(e.message); xBtn.disabled = false; return; }
    xBtn.disabled = false;
    const files = blobs.map((b, i) => new File([b], `review-card${blobs.length > 1 ? '-' + (i + 1) : ''}.png`, { type: 'image/png' }));
    const urls = blobs.map((b) => URL.createObjectURL(b));
    const share = canShareFiles();
    const dlg = document.createElement('div');
    dlg.id = 'vbXDlg';
    dlg.innerHTML = `<div class="bx" role="dialog" aria-modal="true" aria-label="${XL.title}">
      <h3>${XL.title}</h3>
      <div class="th">${urls.map((u) => `<img src="${u}" alt="">`).join('')}</div>
      <label for="vbXText">${XL.text}</label>
      <textarea id="vbXText"></textarea>
      <p class="hint">${share ? XL.hintShare : XL.hintPc + (files.length > 1 ? ' ' + XL.hintMany.replace('{n}', files.length) : '')}</p>
      <div class="acts"><button type="button" class="c">${XL.cancel}</button><button type="button" class="g">𝕏 ${XL.go}</button></div>
    </div>`;
    document.body.appendChild(dlg);
    const ta = dlg.querySelector('textarea');
    ta.value = postText();
    const close = () => { dlg.remove(); urls.forEach((u) => URL.revokeObjectURL(u)); };
    dlg.querySelector('.c').onclick = close;
    dlg.onclick = (e) => { if (e.target === dlg) close(); };
    dlg.querySelector('.g').onclick = async () => {
      const text = ta.value.trim();
      if (share) {
        try { navigator.clipboard?.writeText(text).catch(() => {}); } catch {}
        try { await navigator.share({ files, text }); close(); } catch (e) { if (e && e.name !== 'AbortError') say(e.message); }
        return;
      }
      // PC: 이미지 복사 + X 글쓰기 창
      const win = window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(text), '_blank', 'noopener');
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobs[0] })]);
        say(XL.copied);
      } catch { say(XL.copyFail); }
      if (win !== undefined) close();
    };
  };


  // ---------- 표지 편집창: 폰 화면 정리 (600px 이하에서만, PC 화면은 원래대로) ----------
  // 도구 5개를 한 줄에, 되돌리기는 제목 줄로, 파일로 내려받기·초기화는 ⋯ 메뉴로,
  // 그림은 위에 붙이고 조절 칸·아래 버튼은 그림을 가리지 않게 차례로 놓아요.
  (function setupEditorPhone() {
    const IE = { ko: { undo: '되돌리기', more: '더 보기', down: '파일로 내려받기', reset: '처음 상태로 (초기화)' },
      ja: { undo: '元に戻す', more: 'その他', down: 'ファイルに保存', reset: '最初の状態に戻す（初期化）' } }[LANG === 'ja' ? 'ja' : 'ko'];
    const css = document.createElement('style');
    css.textContent = `
      .vb-ie-hd{display:none}
      @media(max-width:600px){
        .ie-modal{display:flex;flex-direction:column}
        .ie-header{gap:6px;padding:8px 8px 8px 16px;padding-top:calc(8px + env(safe-area-inset-top));border-bottom:1px solid var(--border)}
        .ie-header h2{flex:1;font-size:16px}
        .ie-header h2 svg{display:none}
        .vb-ie-hd{display:inline-flex;align-items:center;gap:4px;height:34px;min-width:34px;justify-content:center;padding:0 10px;border:0;border-radius:10px;background:var(--input);color:var(--text);font-family:inherit;font-size:13px;font-weight:600;line-height:1;cursor:pointer;white-space:nowrap}
        .vb-ie-hd.on{background:var(--vb-acc-soft);color:var(--vb-acc)}
        .ie-close{width:34px;height:34px}
        .ie-toolbar{display:grid!important;grid-template-columns:repeat(5,1fr);gap:4px;padding:6px 8px!important;overflow:visible!important;border-bottom:1px solid var(--border)}
        .ie-toolbar .ie-separator,.ie-toolbar .ie-btn-sm{display:none!important}
        .ie-tool-btn{flex-direction:column;gap:3px;padding:7px 0 6px!important;font-size:11.5px!important;border-radius:12px;min-width:0}
        .ie-tool-btn svg{width:22px;height:22px}
        .ie-tool-btn.active{background:var(--vb-acc-soft);color:var(--vb-acc)}
        .ie-canvas-wrap{order:2;flex:1 1 auto;align-items:flex-start!important;padding:10px!important;overflow:hidden}
        .ie-opts{order:3}
        .ie-footer{order:4}
        .ie-opts.has-content{position:static!important;bottom:auto;flex-shrink:0;max-height:40vh;max-height:40dvh;box-shadow:0 -4px 16px var(--shadow);padding:12px 18px 10px!important}
        .ie-opts.has-content.collapsed{transform:none!important;max-height:28px;overflow:hidden}
        .ie-opts.has-content.ie-opts-sliders{display:flex!important;flex-direction:column;gap:2px!important}
        .ie-opts .ie-mode-toggle{display:grid;grid-template-columns:1fr 1fr;background:var(--input);border-radius:12px;padding:3px;margin-bottom:8px;width:100%}
        .ie-opts .ie-mode-toggle .ie-btn-sm{padding:9px 0;font-size:14px;border-radius:9px;justify-content:center}
        .ie-opts .ie-mode-toggle .ie-btn-sm.active{background:var(--vb-acc);color:#fff}
        .ie-opts .ie-slider-row,.ie-opts-sliders .ie-slider-row{display:grid!important;grid-template-columns:72px minmax(0,1fr) 44px;align-items:center;gap:10px;width:100%;min-height:40px}
        .ie-opts .ie-slider-row label,.ie-opts-sliders .ie-slider-row label{font-size:13.5px!important;font-weight:500;color:var(--text);min-width:0}
        .ie-opts .ie-slider-row input[type=range]{width:100%;height:36px}
        .ie-opts .ie-slider-row span,.ie-opts-sliders .ie-slider-row span{font-size:13px!important;min-width:0;text-align:right}
        .ie-footer{position:static!important;display:grid!important;grid-template-columns:1fr 1.4fr;gap:10px;padding:10px 16px!important;padding-bottom:calc(10px + env(safe-area-inset-bottom))!important;box-shadow:none}
        .ie-footer .ie-btn-save{display:none}
        .ie-foot-right{display:contents}
        .ie-footer .ie-btn{height:50px;border-radius:14px;font-size:16px;justify-content:center}
        .ie-btn-cancel{background:var(--input)!important;color:var(--text)!important}
        .ie-btn-apply{background:var(--vb-acc)!important;color:#fff!important}
        [data-theme="dark"] .ie-btn-apply,[data-theme="dark"] .ie-opts .ie-mode-toggle .ie-btn-sm.active{color:#14173A!important}
        .vb-ie-menu{position:fixed;z-index:10060;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 24px var(--shadow);padding:6px;min-width:200px}
        .vb-ie-menu button{display:block;width:100%;text-align:left;border:0;background:none;color:inherit;font-family:inherit;font-size:15px;line-height:1.3;padding:11px 12px;border-radius:8px;cursor:pointer}
        .vb-ie-menu button+button{border-top:1px solid var(--border);border-radius:0 0 8px 8px}
        .vb-ie-menu .danger{color:#D23B3B}
      }`;
    document.head.appendChild(css);
    const head = document.querySelector('#ieOverlay .ie-header');
    const close = head && head.querySelector('.ie-close');
    if (!head || !close) return;
    const undo = document.createElement('button');
    undo.type = 'button'; undo.className = 'vb-ie-hd'; undo.textContent = '↶ ' + IE.undo;
    undo.onclick = () => window.ieUndo && window.ieUndo();
    const more = document.createElement('button');
    more.type = 'button'; more.className = 'vb-ie-hd'; more.textContent = '⋯'; more.setAttribute('aria-label', IE.more);
    head.insertBefore(undo, close); head.insertBefore(more, close);
    let menu = null;
    const hide = () => { if (menu) { menu.remove(); menu = null; more.classList.remove('on'); } };
    more.onclick = (e) => {
      e.stopPropagation();
      if (menu) return hide();
      menu = document.createElement('div');
      menu.className = 'vb-ie-menu';
      menu.innerHTML = `<button type="button" data-a="down">↓ ${IE.down}</button><button type="button" class="danger" data-a="reset">⟲ ${IE.reset}</button>`;
      const r = more.getBoundingClientRect();
      menu.style.top = (r.bottom + 6) + 'px'; menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
      menu.onclick = (ev) => { const a = ev.target.closest('[data-a]')?.dataset.a; hide(); if (a === 'down') window.ieDownload && window.ieDownload(); if (a === 'reset') window.ieReset && window.ieReset(); };
      document.getElementById('ieOverlay').appendChild(menu);
      more.classList.add('on');
    };
    document.addEventListener('click', (e) => { if (menu && !menu.contains(e.target) && e.target !== more) hide(); }, true);
    // 브러시 굵기도 숫자가 보이게 (원래는 숫자 칸이 없어요)
    const origTool = window.ieTool;
    if (typeof origTool === 'function') {
      window.ieTool = function (...args) {
        const r = origTool.apply(this, args);
        hide();
        document.querySelectorAll('#ieOpts .ie-slider-row').forEach((row) => {
          const inp = row.querySelector('input[type=range]');
          if (!inp || row.querySelector('span')) return;
          const sp = document.createElement('span');
          const upd = () => { sp.textContent = inp.value; };
          upd(); inp.addEventListener('input', upd); row.appendChild(sp);
        });
        return r;
      };
    }
    const origClose = window.closeImageEditor;
    if (typeof origClose === 'function') window.closeImageEditor = function (...a) { hide(); return origClose.apply(this, a); };
  })();

  $('vbRefill').onclick = () => { $('vbMenu').hidden = true; if (confirm(MSG.refillAsk)) fill().catch((e) => say(e.message)); };

  // 카드 메이커가 이전 작업을 불러온 뒤에 채웁니다.
  setTimeout(() => fill().catch((e) => say(e.message)), 50);
})();
