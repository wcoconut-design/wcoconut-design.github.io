// Copyright 2026 @w_coconut. All rights reserved.
// VOICE BOX 사용법 (설정 → 사용법). 기능이 바뀌면 ko·en·ja 세 벌 모두 같이 고쳐요.
// 글 안의 **굵게**, [폰]·[PC] 표시를 화면에서 꾸며 보여줘요. (en·ja에서도 [폰]/[PC]로 써요. 화면에서 번역됨)
// 한 줄에 한 동작, 60자 안쪽으로. 예외·부연은 tips로.
// quick: 장 맨 위 "처음이라면" 카드 · callout: 강조 상자 · more: 접어 두는 묶음(가끔 쓰는 내용)
// local: true 인 묶음과 '{local}'로 시작하는 줄은 PC 로컬판(노션 연동판)에서만 보여요. (배포용 앱에서는 숨김)
window.VB_GUIDE = {
  ko: [
    {
      id: 'start', title: '처음 시작',
      lead: '들은 여성향 보이스 작품의 별점, 감상, 구매 기록을 모아두는 앱이에요.',
      quick: { h: '처음이라면 이것만', steps: [
        '**홈 화면에 추가**해서 앱으로 열어요.',
        '**영수증 메일**이나 **판매 링크**로 작품을 넣어요.',
        '들은 작품에 **별점, 감상**을 남겨요.',
        '가끔 **설정 → 복원용 백업 받기**를 해 둬요.',
      ] },
      parts: [
        { callout: true, h: '⭐ 추천: 내 서버 만들기 (무료, 약 5분)', steps: [
          '링크나 영수증만 넣으면 **표지, 성우, 발매일이 자동으로** 채워져요.',
          '폰과 PC의 기록을 **동기화**할 수도 있어요.',
          '**설정 → 고급 → 설정 방법 보기**를 따라 하면 돼요.',
          '준비물: **GitHub → Cloudflare** 계정 (이 순서로, 둘 다 무료)',
        ], tips: ['서버가 없어도 앱은 다 쓸 수 있어요. 대신 정보를 직접 입력해야 해요.'] },
        { h: '[폰] 앱으로 설치하기', steps: [
          '**아이폰**: Safari → 공유 버튼 → **홈 화면에 추가**',
          '**안드로이드**: Chrome → 오른쪽 위 ⋮ → **앱 설치**',
          '홈 화면의 **VOICE BOX** 아이콘으로 열어요.',
        ], tips: ['아이폰은 꼭 Safari로 추가해야 인터넷 없이도 열려요.', '아이폰은 홈 화면에 추가하지 않고 Safari로만 쓰면, 한동안 안 열었을 때 기록이 지워질 수 있어요.', '홈 화면 앱을 지우면 기록도 지워져요. 먼저 백업하세요.'] },
        { more: true, h: '[PC] 브라우저에서 설치하기', steps: [
          '**Chrome**이나 **Edge**로 앱 주소를 열어요.',
          '주소창 오른쪽 **모니터 모양 아이콘**을 눌러요.',
          '아이콘이 없으면 **⋮ 메뉴**에서 "설치"가 든 항목을 찾아요.',
          'Mac Safari는 **파일 → Dock에 추가**',
        ], tips: ['기록은 설치한 브라우저 안에 저장돼요.'] },
        { local: true, h: '[PC] 로컬판 실행하기 (노션 연동판)', steps: [
          '[Node.js](https://nodejs.org) **LTS 버전**을 설치해요. (한 번만)',
          '받은 zip을 풀어 **VOICE-BOX** 폴더를 원하는 곳에 둬요.',
          '**Mac**: `VOICE BOX 열기.command` / **Windows**: `VOICE BOX 열기 (Windows).bat` 더블클릭',
          '브라우저가 안 열리면 주소창에 `http://127.0.0.1:8765`',
        ], tips: ['실행하면 뜨는 검은 창은 닫지 마세요. 닫으면 앱이 꺼져요.', 'Mac 경고가 나오면: 시스템 설정 → 개인정보 보호 및 보안 → **그래도 열기**', '새 버전 zip은 같은 폴더에 덮어쓰면 돼요. 기록은 그대로예요.'] },
        { more: true, h: '화면 둘러보기', steps: [
          '**홈**: 최근 산 작품, 오늘의 한 작품, 이번 달 요약',
          '**목록**: 모든 작품. 위쪽 칩으로 골라 봐요.',
          '작품 화면의 성우, 서클, 태그를 누르면 그 작품들만 모여요. 목록 위 **‹ 작품으로**로 돌아와요.',
          '**＋**: 작품 추가 / **통계**: 작품과 지출 / **설정**',
          '목록 위 ⚙ **필터**: 정렬, 성우, 서클, 장르, 여러 개 선택',
          '목록 위 그림 아이콘을 누르면 **표지 가리기**가 켜지고 꺼져요.',
        ], tips: ['[PC] 넓은 화면에서는 메뉴, 목록, 상세가 한 화면에 보여요.', '[PC] 단축키: `/` 검색 / `n` 새 작품 / `↑` `↓` 이동'] },
        { more: true, h: '다른 기기에서 쓰던 기록 옮기기', steps: [
          '쓰던 기기: 설정 → 백업 → **복원용 백업 받기**',
          '새 기기: 처음 화면의 **백업 파일 불러오기**',
        ], tips: ['[폰] 아이폰은 홈 화면 아이콘마다 기록이 따로예요. 아이콘을 새로 추가했다면 이 방법으로 옮겨요.', '두 기기를 계속 같이 쓰려면 "내 서버와 동기화"를 보세요.'] },
      ],
    },
    {
      id: 'add', title: '작품 넣기',
      parts: [
        { h: '영수증 메일로 한 번에 넣기', steps: [
          '**＋** → **🧾 영수증 메일로 한 번에 추가**',
          '구매 메일 본문을 통째로 붙여넣고 **읽기**',
          '작품마다 넣을 곳을 확인하고 **넣기**',
        ], tips: ['읽는 메일: **DLsite / 포케도라** 등의 플랫폼', '**내 서버**가 있으면 표지, 성우까지 자동으로 채워져요.', 'DLsite 말고는 구매일을 직접 넣어요.'] },
        { h: '링크로 한 작품 넣기', steps: [
          '**＋** → 판매 링크를 붙여넣고 **정보 채우기**',
          '채워진 내용을 확인하고 **저장**',
        ], tips: ['**정보 채우기**는 내 서버가 있어야 돼요.', '{local}PC 로컬판은 서버 없이 바로 돼요.', '성우는 이름을 쓰고 Enter'] },
        { more: true, h: '영수증 화면의 선택지', steps: [
          '**이 작품에 넣기**: 앱에 있는 작품에 구매 정보를 넣어요.',
          '**새 음성 작품으로 추가**: 앱에 없는 작품을 새로 만들어요.',
          '**추가 구매로 기록**: 같은 작품을 다른 곳에서 또 샀을 때',
          '**본편에 더하기 (특전)**: 특전만 따로 산 주문',
          '**팩 → 여러 작품에 나누기**: 정가 비율로 나눠요.',
          '**기타 구매 (만화 등)**: 지출에만 들어가요.',
          '**건너뛰기**: 넣지 않아요.',
        ], tips: ['이미 넣은 주문은 두 번 들어가지 않아요.', '잘못 넣었으면 그 주문의 **다시 넣기**로 다시 골라요.'] },
        { more: true, h: '구매 정보와 할인', steps: [
          '정보 수정 → 구매일, 구매처, 정가, 할인가를 넣어요.',
          '쿠폰은 **쿠폰, 이벤트 할인**을 펼쳐서 넣어요.',
          '**최종 구매금**은 자동으로 계산돼요.',
          '묶음 할인 이벤트(예: 3개 999엔)로 샀다면 **+ 같이 산 작품 묶기**로 묶어요. 낸 금액이 작품마다 나눠져요.',
        ] },
        { more: true, h: '작품 소개와 번역', steps: [
          '**일본어 원문** 탭에 판매 페이지 소개글을 붙여넣어요.',
          '**원문에서 정보 찾기**: 작품명, 성우, 발매일을 채워요.',
          '**번역기로 열기 ↗**: 파파고, 구글, ChatGPT가 새 탭으로 열려요.',
        ], tips: ['번역을 복사해서 **한국어 번역** 탭에 붙여넣어요.'] },
      ],
    },
    {
      id: 'record', title: '기록하기',
      parts: [
        { h: '작품 상세에서', steps: [
          '**청취 상태**: 안 들음 / 듣는 중 / 들음',
          '**별점**: 같은 별을 다시 누르면 지워져요.',
          '**내 감상**: 눌러서 바로 써요.',
          '♡ 즐겨찾기 / ⋯ 메뉴: 정보 수정, 숨기기, 수정 이력',
        ], tips: ['바꾼 내용은 바로 저장돼요.'] },
        { h: '리뷰카드', steps: [
          '작품 상세 → **리뷰카드 만들기**',
          '**꾸미기**, **내용**, **표지** 탭에서 카드를 다듬어요.',
          '**이미지로 저장** 또는 **앱에 대표 카드로 저장**',
          '**𝕏**: 카드와 추천 글로 X에 올려요.',
        ], tips: ['X에 올릴 글은 올리기 전에 고칠 수 있어요.', '[PC] X 창이 열리면 Ctrl+V(⌘V)로 이미지를 붙여 넣어요.', '표지 그림의 저작권은 판매처와 제작사에 있어요. 개인 감상을 나누는 데만 써 주세요.'] },
      ],
    },
    {
      id: 'tidy', title: '정리하기',
      parts: [
        { h: '찾기와 고르기', steps: [
          '**검색**: 작품명, 성우, 서클, 태그, 코드, 감상',
          '**여러 개 선택**: 목록 → ⚙ 필터 → 맨 아래 버튼',
          '**폴더**: 목록 칩의 "폴더" / [PC] 왼쪽 "+ 새 폴더"',
        ] },
        { h: '숨기기와 빼기', steps: [
          '**목록에서 숨기기**: 목록에서만 안 보여요.',
          '**통계에서 빼기**: 작품 통계에서만 빠져요.',
          '**기타 구매로 옮기기**: 만화 등. 지출에만 남아요.',
        ] },
        { more: true, h: '설정 → 정리', steps: [
          '**비어 있는 작품 정보 채우기**: 표지, 성우를 한꺼번에 채워요.',
          '**정보 채우기 진단**: 소개가 짧게 오면 어디서 막히는지 봐요.',
          '**중복 작품 합치기**: 같은 코드 작품을 하나로 합쳐요.',
          '**성우와 서클 이름 정리**: 한글 읽기를 한 번에 붙여요.',
          '**쓰지 않는 이미지 정리**: 안 쓰는 이미지를 지워요.',
        ], tips: ['정보 채우기는 내 서버가 있어야 보여요.'] },
        { more: true, h: '설정 → 보기', steps: [
          '**디자인**: 데일리 노트 / 연필 일기장 / 스티커 다이어리. 리뷰카드 화면도 같이 바뀌어요.',
          '**색 테마**: 디자인마다 4가지씩 있어요.',
          '**화면 모드**: 자동 / 라이트 / 다크',
          '**메뉴 언어**, **성우 이름 표시**도 여기서 바꿔요.',
          '디자인이나 색 테마를 바꾸면 앱 아이콘 색도 바뀌어요.',
          '**일반/BL 작품 관리 포함**: 여성향 외의 작품도 관리할 때 켜요. 목록, 통계, 지출에서 나눠 봐요.',
        ], tips: ['[폰] 아이폰 홈 화면 아이콘은 다시 추가해야 새 색이 돼요.'] },
      ],
    },
    {
      id: 'stats', title: '통계',
      parts: [
        { h: '작품 통계와 지출', steps: [
          '**작품**: 성우, 서클, 장르, 연도별로 봐요.',
          '**지출**: 월별, 연도별 지출과 아낀 돈을 봐요.',
          '항목이나 줄을 누르면 그 작품 목록이 나와요. 목록 위 **‹ 통계**로 돌아와요.',
        ], tips: ['지출은 음성 작품만 더해요. 만화 등은 **기타 구매 포함**을 켜요.'] },
      ],
    },
    {
      id: 'backup', title: '백업과 동기화',
      parts: [
        { h: '백업 (설정 → 백업)', steps: [
          '**복원용 백업 받기**: 모든 기록을 파일로 받아요.',
          '**백업에서 복원**: 받아 둔 파일로 되돌리거나 합쳐요.',
          '**내보내기**: 엑셀(보관용) / CSV(다른 앱으로 옮기기) / 감상 모음',
        ], tips: ['백업한 지 30일이 지나면 홈에 알림이 떠요.', '직접 첨부한 그림(표지, 리뷰카드)은 백업 파일에 안 들어가요. 내 서버로 동기화하면 같이 옮겨져요.'] },
        { h: '되돌리기 (설정 → 백업 → 되돌리기)', steps: [
          '**자동 백업**: 하루 한 번 저장돼요. (최근 5개)',
          '**지워지거나 바뀐 작품**: **되살리기**로 돌아와요.',
          '작품 하나만: ⋯ 메뉴 → **수정 이력**',
        ] },
        { more: true, h: '내 서버와 동기화 (설정 → 고급)', steps: [
          '**설정 방법 보기**를 따라 무료 서버를 만들어요.',
          '다른 기기는 **이미 서버가 있어요**에 같은 주소, 열쇠를 넣어요.',
          '**지금 동기화**를 누를 때만 주고받아요.',
        ], tips: ['처음 동기화 전에 백업을 받아 두면 안전해요.', '다른 기기에서 10개 넘게 지워지면 멈추고 물어봐요.'] },
        { more: true, h: '표지 저장과 초기화', steps: [
          '설정 → 정리 → **표지 이 기기에 저장**: 표지가 바로 떠요.',
          '설정 → 백업 맨 아래 **이 기기 초기화**: 이 기기만 비워요.',
          '{local}노션, http 표지는 PC 로컬판에서 동기화하면 폰으로 옮겨져요.',
        ] },
        { local: true, h: '[PC] 노션 연결', steps: [
          '설정 → 노션 연결에 연결키를 넣어요.',
          '노션 내용은 켤 때와 20분마다 가져와요.',
          '앱에서 고친 작품은 **골라서 반영**으로 노션에 써요.',
          '설정 → **이미지 내려받기**로 표지를 PC에 저장해요.',
        ] },
      ],
    },
    {
      id: 'faq', title: '자주 묻는 것',
      parts: [
        { h: '표지가 안 보여요', steps: ['정보 수정에서 다른 이미지를 대표로 고르거나 직접 첨부해요.'] },
        { h: '작품이 사라졌어요', steps: ['목록 위 👁 **숨긴 작품 보기**를 켜 봐요.', '그래도 없으면 설정 → 백업 → **되돌리기**'] },
        { h: '영수증이 안 읽혀요', steps: ['메일 **본문 전체**를 붙여넣었는지 확인해요.', '읽는 메일은 **DLsite / 포케도라** 등의 플랫폼이에요.', '안 읽히는 작품은 **링크로 한 작품씩** 넣어요.'] },
        { h: '서버 열쇠를 잊어버렸어요', steps: ['연결된 다른 기기가 있으면: 설정 → 고급 → **열쇠 복사**', '없으면 새 열쇠로 바꿔요: 설정 방법 보기 → **열쇠 만들기** → 복사', 'Cloudflare → **내 서버 → 설정 → 변수 및 비밀** → **VB_KEY**에 붙여넣고 저장', '앱에 주소와 새 열쇠를 넣으면 끝. 서버의 기록은 그대로예요.'], tips: ['다른 기기에도 새 열쇠를 다시 넣어야 해요.'] },
        { h: '"서버 코드 업데이트" 안내가 떠요', steps: ['설정 → 고급에서 **새 서버 코드 복사**', '**Cloudflare ↗** → 내 서버 → **코드 편집**', '코드를 전부 지우고 붙여넣기 → **배포**'], tips: ['안 바꿔도 앱은 그대로 쓸 수 있어요. **나중에**를 누르면 안내가 숨겨져요.', 'PC에서 하면 더 편해요.'] },
        { h: '기록은 어디에 저장되나요?', steps: ['[폰] 홈 화면 앱 안 / [PC] 설치한 브라우저 안', '{local}PC 로컬판: VOICE-BOX 폴더의 `data`, `images`'], tips: ['내 서버를 쓰면 동기화용 사본이 내 Cloudflare 계정에 있어요.'] },
      ],
    },
    {
      id: 'contact', title: '문의와 버그 신고',
      parts: [
        { h: '그 외 문의나 버그 신고', steps: ['X의 [@w_coconut](https://x.com/w_coconut)로 보내 주세요.'], tips: ['어떤 화면에서 무엇을 눌렀는지, 화면 캡처가 있으면 빨리 고칠 수 있어요.', '쓰는 기기도 알려 주세요. (예: 아이폰 Safari, PC Chrome)', '서버 주소와 열쇠는 보내지 마세요.'] },
      ],
    },
  ],
  en: [
    {
      id: 'start', title: 'Getting started',
      lead: 'An app for keeping ratings, reviews and purchases of the women’s voice works you listen to.',
      quick: { h: 'New here? Just do this', steps: [
        '**Add it to your home screen** and open it as an app.',
        'Add works from **receipt emails** or **store links**.',
        'Leave **ratings and reviews** on what you listen to.',
        'Now and then, **Settings → Save restore backup**.',
      ] },
      parts: [
        { callout: true, h: '⭐ Recommended: make your own server (free, about 5 min)', steps: [
          'Paste a link or receipt and **covers, actors and dates fill in automatically**.',
          'You can also **sync** records between your phone and PC.',
          'Follow **Settings → Advanced → See how to set up**.',
          'You need: **GitHub → Cloudflare** accounts (in this order, both free)',
        ], tips: ['The app works without a server, but you enter info by hand.'] },
        { h: '[폰] Install as an app', steps: [
          '**iPhone**: Safari → Share → **Add to Home Screen**',
          '**Android**: Chrome → ⋮ at the top right → **Install app**',
          'Open it from the **VOICE BOX** icon on your home screen.',
        ], tips: ['On iPhone, add it from Safari so it opens offline.', 'On iPhone, if you only use it in Safari without adding it to the home screen, records may be cleared after a while of not opening it.', 'Deleting the home screen app deletes its records. Back up first.'] },
        { more: true, h: '[PC] Install from the browser', steps: [
          'Open the app address in **Chrome** or **Edge**.',
          'Click the **monitor-shaped icon** at the right of the address bar.',
          'No icon? Find an item with "Install" in the **⋮ menu**.',
          'Mac Safari: **File → Add to Dock**',
        ], tips: ['Records are saved inside the browser you installed it in.'] },
        { more: true, h: 'Finding your way around', steps: [
          '**Home**: recently bought, today’s pick, this month',
          '**List**: all works. Filter with the chips at the top.',
          'Tap an actor, circle or tag on a work to see matching works. **‹ Back to work** above the list takes you back.',
          '**＋**: add a work / **Stats**: works and spending / **Settings**',
          '⚙ **Filter** above the list: sort, actor, circle, genre, select several',
          'Tap the picture icon above the list to turn **cover blur** on or off.',
        ], tips: ['[PC] On a wide screen, menu, list and details appear together.', '[PC] Shortcuts: `/` search / `n` new work / `↑` `↓` move'] },
        { more: true, h: 'Move records from another device', steps: [
          'Old device: Settings → Backup → **Save restore backup**',
          'New device: **Import backup file** on the start screen',
        ], tips: ['[폰] On iPhone, each home screen icon keeps its own records. If you added a new icon, move them this way.', 'To keep using both, see "Your own server and sync".'] },
      ],
    },
    {
      id: 'add', title: 'Adding works',
      parts: [
        { h: 'Add many from receipt emails', steps: [
          '**＋** → **🧾 Add from receipt emails**',
          'Paste the whole email body and tap **Read**.',
          'Check where each work goes and tap **Import**.',
        ], tips: ['Supported: **DLsite**, **Pocket Drama CD** and similar stores', 'With **your own server**, covers and actors fill in too.', 'For stores other than DLsite, enter the purchase date.'] },
        { h: 'Add one work from a link', steps: [
          '**＋** → paste the store link → **Fill in info**',
          'Check what was filled in and **Save**.',
        ], tips: ['**Fill in info** needs your own server.', 'For actors, type a name and press Enter.'] },
        { more: true, h: 'Choices on the receipt screen', steps: [
          '**Add to this work**: adds purchase info to a work in the app.',
          '**Add as new voice work**: creates a new work.',
          '**Record as another purchase**: bought the same work elsewhere.',
          '**Add to the main work (bonus)**: an order for a bonus only.',
          '**Pack → split into several works**: split by list price.',
          '**Other purchase (manga etc.)**: counted only in spending.',
          '**Skip**: not imported.',
        ], tips: ['An order is never imported twice.', 'Made a mistake? Use **Add again** on that order.'] },
        { more: true, h: 'Purchase info and discounts', steps: [
          'Edit info → enter date, store, list price and sale price.',
          'For coupons, open **Coupon / event discount**.',
          'The **final price** is calculated automatically.',
          'Bought in a bundle sale (e.g. 3 for ¥999)? Use **+ Group works bought together**. The total is split across the works.',
        ] },
        { more: true, h: 'Description and translation', steps: [
          'Paste the store description in the **Japanese original** tab.',
          '**Find info in the original**: fills title, actors and date.',
          '**Open in a translator ↗**: opens Papago, Google or ChatGPT.',
        ], tips: ['Copy the result into the **Translation** tab.'] },
      ],
    },
    {
      id: 'record', title: 'Keeping records',
      parts: [
        { h: 'In the work details', steps: [
          '**Status**: Not yet / Listening / Listened',
          '**Rating**: tap the same star again to clear it.',
          '**My review**: tap to write.',
          '♡ Favorite / ⋯ menu: Edit info, Hide, Edit history',
        ], tips: ['Changes are saved right away.'] },
        { h: 'Review cards', steps: [
          'Work details → **Make a review card**',
          'Adjust it in the **Style**, **Content** and **Cover** tabs.',
          '**Save image** or **Save to app**',
          '**𝕏**: posts the card with a ready-made text.',
        ], tips: ['You can edit the post text before posting.', '[PC] When X opens, paste the image with Ctrl+V (⌘V).', 'Cover images belong to the store and the maker. Please use them only to share your own impressions.'] },
      ],
    },
    {
      id: 'tidy', title: 'Tidying up',
      parts: [
        { h: 'Search and select', steps: [
          '**Search**: title, actor, circle, tag, code, review',
          '**Select several**: List → ⚙ Filter → button at the bottom',
          '**Folders**: the "Folders" chip / [PC] "+ New folder" on the left',
        ] },
        { h: 'Hide and exclude', steps: [
          '**Hide from list**: only hidden from the list.',
          '**Exclude from stats**: left out of work stats only.',
          '**Move to other purchases**: manga etc. Kept in spending only.',
        ] },
        { more: true, h: 'Settings → Tidy up', steps: [
          '**Fill in missing work info**: fills covers and actors at once.',
          '**Info fill check**: see where it gets stuck when descriptions come back short.',
          '**Merge duplicates**: merges works with the same code.',
          '**Clean up unused images**: deletes images no longer used.',
        ], tips: ['Fill in missing work info appears when your own server is connected.'] },
        { more: true, h: 'Settings → Display', steps: [
          '**Design**: Daily Note / Pencil Diary / Sticker Diary. The review card screen follows it too.',
          '**Color theme**: four for each design.',
          '**Screen mode**: Auto / Light / Dark',
          '**Menu language** and **actor name display** are here too.',
          'The design and color theme also change the app icon color.',
          '**Include general/BL works**: turn on to also keep works outside women’s. See them separately in the list, stats and spending.',
        ], tips: ['[폰] On iPhone, re-add the home screen icon to get the new color.'] },
      ],
    },
    {
      id: 'stats', title: 'Stats',
      parts: [
        { h: 'Work stats and spending', steps: [
          '**Works**: by actor, circle, genre and year.',
          '**Spending**: by month and year, with money saved.',
          'Tap an item or row to see those works. **‹ Stats** above the list takes you back.',
        ], tips: ['Spending counts voice works only. Turn on **Include other purchases** for manga etc.'] },
      ],
    },
    {
      id: 'backup', title: 'Backup and sync',
      parts: [
        { h: 'Backup (Settings → Backup)', steps: [
          '**Save restore backup**: saves all records as a file.',
          '**Restore from backup**: go back to or merge a saved file.',
          '**Export**: Excel (for keeping) / CSV (to move to other apps) / review collection',
        ], tips: ['A reminder appears on Home 30 days after your last backup.', 'Images you attached yourself (covers, review cards) are not in the backup file. Syncing with your own server moves them too.'] },
        { h: 'Undo (Settings → Backup → Undo)', steps: [
          '**Auto backups**: saved once a day (last 5).',
          '**Deleted or changed works**: bring them back with **Restore**.',
          'For one work: ⋯ menu → **Edit history**',
        ] },
        { more: true, h: 'Your own server and sync (Settings → Advanced)', steps: [
          'Follow **See how to set up** to make a free server.',
          'On other devices, use **I already have a server** with the same address and key.',
          'Records sync only when you tap **Sync now**.',
        ], tips: ['Back up before your first sync to be safe.', 'If more than 10 works were deleted elsewhere, sync stops and asks.'] },
        { more: true, h: 'Saving covers and resetting', steps: [
          'Settings → Tidy up → **Save covers on this device**: covers load instantly.',
          '**Reset this device** at the bottom of Settings → Backup: clears this device only.',
        ] },
      ],
    },
    {
      id: 'faq', title: 'FAQ',
      parts: [
        { h: 'Covers don’t show', steps: ['In Edit info, choose another image as the cover or attach one.'] },
        { h: 'A work disappeared', steps: ['Turn on 👁 **Show hidden works** above the list.', 'Still missing? Settings → Backup → **Undo**'] },
        { h: 'A receipt email can’t be read', steps: ['Make sure you pasted the **whole email body**.', 'Supported emails: **DLsite / Pocket Drama CD** and similar stores', 'If a work isn’t read, add it **from its link** one at a time.'] },
        { h: 'I forgot my server key', steps: ['If another device is still connected: Settings → Advanced → **Copy key**', 'If not, switch to a new key: See how to set up → **Make a key** → Copy', 'Cloudflare → **your server → Settings → Variables and Secrets** → paste it into **VB_KEY** and save', 'Enter the address and new key in the app. Your server records stay as they are.'], tips: ['Enter the new key on your other devices too.'] },
        { h: 'I see "Update server code"', steps: ['Settings → Advanced → **Copy new server code**', '**Cloudflare ↗** → your server → **Edit code**', 'Delete all the code, paste, then **Deploy**'], tips: ['The app keeps working even if you don’t. Tap **Later** to hide the notice.', 'It’s easier on a PC.'] },
        { h: 'Where are my records stored?', steps: ['[폰] Inside the home screen app / [PC] Inside the browser you installed it in'], tips: ['With your own server, a sync copy is kept in your Cloudflare account.'] },
      ],
    },
    {
      id: 'contact', title: 'Questions and bug reports',
      parts: [
        { h: 'Other questions or bug reports', steps: ['Send them to [@w_coconut](https://x.com/w_coconut) on X.'], tips: ['Tell me which screen you were on and what you tapped. A screenshot helps a lot.', 'Also say which device you use (e.g. iPhone Safari, PC Chrome).', 'Never send your server address or key.'] },
      ],
    },
  ],
  ja: [
    {
      id: 'start', title: 'はじめに',
      lead: '聴いた女性向けボイス作品の評価、感想、購入記録をまとめるアプリです。',
      quick: { h: 'はじめての方はこれだけ', steps: [
        '**ホーム画面に追加**して、アプリとして開きます。',
        '**購入メール**か**販売リンク**で作品を追加します。',
        '聴いた作品に**評価、感想**を残します。',
        'ときどき**設定 → 復元用バックアップを保存**をします。',
      ] },
      parts: [
        { callout: true, h: '⭐ おすすめ：自分のサーバーを作る（無料、約5分）', steps: [
          'リンクや購入メールを入れるだけで**表紙、声優、発売日が自動で**入ります。',
          'スマホとPCの記録を**同期**することもできます。',
          '**設定 → 詳細設定 → 設定方法を見る** の通りに進めるだけです。',
          '必要なもの：**GitHub → Cloudflare** のアカウント（この順で、どちらも無料）',
        ], tips: ['サーバーがなくてもアプリは使えますが、情報は手入力になります。'] },
        { h: '[폰] アプリとしてインストール', steps: [
          '**iPhone**：Safari → 共有 → **ホーム画面に追加**',
          '**Android**：Chrome → 右上の ⋮ → **アプリをインストール**',
          'ホーム画面の **VOICE BOX** アイコンから開きます。',
        ], tips: ['iPhone は Safari から追加するとオフラインでも開けます。', 'iPhone でホーム画面に追加せず Safari だけで使うと、しばらく開かないうちに記録が消えることがあります。', 'ホーム画面のアプリを消すと記録も消えます。先にバックアップを。'] },
        { more: true, h: '[PC] ブラウザからインストール', steps: [
          '**Chrome** か **Edge** でアプリのアドレスを開きます。',
          'アドレスバー右の**モニターの形のアイコン**を押します。',
          'アイコンがなければ **⋮ メニュー**で「インストール」を探します。',
          'Mac の Safari は **ファイル → Dockに追加**',
        ], tips: ['記録はインストールしたブラウザの中に保存されます。'] },
        { more: true, h: '画面の見かた', steps: [
          '**ホーム**：最近買った作品、今日の一作、今月のまとめ',
          '**リスト**：すべての作品。上のチップで絞り込みます。',
          '作品画面の声優、サークル、タグを押すと、その作品だけが集まります。一覧の上の**‹ 作品に戻る**で戻れます。',
          '**＋**：作品を追加 / **統計**：作品と支出 / **設定**',
          'リスト上の ⚙ **フィルター**：並べ替え、声優、サークル、ジャンル、複数選択',
          'リスト上の画像アイコンで **表紙を隠す** を切り替えられます。',
        ], tips: ['[PC] 広い画面ではメニュー、リスト、詳細が並んで表示されます。', '[PC] ショートカット：`/` 検索 / `n` 新規 / `↑` `↓` 移動'] },
        { more: true, h: '他の端末の記録を移す', steps: [
          '今までの端末：設定 → バックアップ → **復元用バックアップを保存**',
          '新しい端末：最初の画面の **バックアップを読み込む**',
        ], tips: ['[폰] iPhone はホーム画面のアイコンごとに記録が別々です。アイコンを新しく追加したら、この方法で移します。', '2台を続けて使うなら「自分のサーバーと同期」を見てください。'] },
      ],
    },
    {
      id: 'add', title: '作品を追加する',
      parts: [
        { h: '購入メールからまとめて追加', steps: [
          '**＋** → **🧾 購入メールからまとめて追加**',
          'メール本文を丸ごと貼り付けて **読み込む**',
          '作品ごとに入れ先を確認して **取り込む**',
        ], tips: ['対応：**DLsite / ポケドラ**などのストア', '**自分のサーバー**があれば表紙、声優も自動で入ります。', 'DLsite以外は購入日を入力します。'] },
        { h: 'リンクから1作品を追加', steps: [
          '**＋** → 販売リンクを貼り付けて **情報を取得**',
          '入った内容を確認して **保存**',
        ], tips: ['**情報を取得** には自分のサーバーが必要です。', '声優は名前を入力して Enter'] },
        { more: true, h: '取り込み画面の選択肢', steps: [
          '**この作品に入れる**：アプリにある作品に購入情報を入れます。',
          '**新しい音声作品として追加**：新しく作ります。',
          '**追加購入として記録**：同じ作品を別の場所でも買ったとき',
          '**本編に加える（特典）**：特典だけの注文',
          '**パック → 複数作品に分ける**：定価の比率で分けます。',
          '**その他の購入（マンガなど）**：支出にだけ入ります。',
          '**スキップ**：取り込みません。',
        ], tips: ['同じ注文は二重に入りません。', '間違えたら、その注文の **もう一度入れる** で選び直します。'] },
        { more: true, h: '購入情報と割引', steps: [
          '情報の編集 → 購入日、購入先、定価、セール価格を入れます。',
          'クーポンは **クーポン、イベント割引** を開いて入れます。',
          '**最終購入額** は自動で計算されます。',
          'まとめ買いセール（例: 3本999円）で買ったら **+ 一緒に買った作品をまとめる** でまとめます。支払った金額が作品ごとに分けられます。',
        ] },
        { more: true, h: '作品紹介', steps: [
          '**日本語原文** タブに販売ページの紹介文を貼り付けます。',
          '**原文から情報を探す**：作品名、声優、発売日を入れます。',
        ] },
      ],
    },
    {
      id: 'record', title: '記録する',
      parts: [
        { h: '作品の詳細で', steps: [
          '**視聴状況**：未聴 / 視聴中 / 視聴済み',
          '**評価**：同じ星をもう一度押すと消えます。',
          '**わたしの感想**：押してそのまま書きます。',
          '♡ お気に入り / ⋯ メニュー：情報の編集、非表示、編集履歴',
        ], tips: ['変更はすぐ保存されます。'] },
        { h: 'レビューカード', steps: [
          '作品の詳細 → **レビューカードを作る**',
          '**デザイン**、**内容**、**表紙** タブで整えます。',
          '**画像を保存** か **アプリに保存**',
          '**𝕏**：カードと投稿文でXに投稿します。',
        ], tips: ['投稿文は投稿前に直せます。', '[PC] Xが開いたら Ctrl+V（⌘V）で画像を貼り付けます。', '表紙画像の著作権は販売元、制作元にあります。個人の感想を共有する目的だけで使ってください。'] },
      ],
    },
    {
      id: 'tidy', title: '整理する',
      parts: [
        { h: '検索と選択', steps: [
          '**検索**：作品名、声優、サークル、タグ、コード、感想',
          '**複数選択**：リスト → ⚙ フィルター → 一番下のボタン',
          '**フォルダ**：チップの「フォルダ」 / [PC] 左の「+ 新規フォルダ」',
        ] },
        { h: '非表示と除外', steps: [
          '**リストで非表示**：リストにだけ出ません。',
          '**統計から除外**：作品統計からだけ外れます。',
          '**その他の購入に移す**：マンガなど。支出にだけ残ります。',
        ] },
        { more: true, h: '設定 → 整理', steps: [
          '**空いている作品情報を入力**：表紙、声優をまとめて入力',
          '**情報取得の診断**：紹介が短いとき、どこで止まるか確認',
          '**重複作品をまとめる**：同じコードの作品を1つに',
          '**使っていない画像を整理**：使わない画像を削除',
        ], tips: ['情報の一括入力は、自分のサーバーがあると表示されます。'] },
        { more: true, h: '設定 → 表示', steps: [
          '**デザイン**：デイリーノート / えんぴつ日記 / ステッカー手帳。レビューカードの画面も合わせて変わります。',
          '**カラーテーマ**：デザインごとに4種類。',
          '**画面モード**：自動 / ライト / ダーク',
          '**メニュー言語**、**声優名の表示**もここで変えられます。',
          'デザインやカラーテーマを変えるとアプリのアイコンの色も変わります。',
          '**一般/BL作品も管理**：女性向け以外の作品も管理するときにオンに。一覧、統計、支出で分けて見られます。',
        ], tips: ['[폰] iPhone はホーム画面に追加し直すと新しい色になります。'] },
      ],
    },
    {
      id: 'stats', title: '統計',
      parts: [
        { h: '作品の統計と支出', steps: [
          '**作品**：声優、サークル、ジャンル、年別に見られます。',
          '**支出**：月別、年別の支出と節約額を見られます。',
          '項目や行を押すとその作品の一覧が出ます。一覧の上の**‹ 統計**で戻れます。',
        ], tips: ['支出は音声作品だけを合計します。マンガなどは **その他の購入を含める** をオンに。'] },
      ],
    },
    {
      id: 'backup', title: 'バックアップと同期',
      parts: [
        { h: 'バックアップ（設定 → バックアップ）', steps: [
          '**復元用バックアップを保存**：すべての記録をファイルに保存',
          '**バックアップから復元**：保存したファイルに戻す、統合する',
          '**書き出し**：Excel（保管用）、CSV（他のアプリへ移す）、感想まとめ',
        ], tips: ['前回のバックアップから30日たつとホームにお知らせが出ます。', '自分で添付した画像（表紙、レビューカード）はバックアップファイルに入りません。自分のサーバーで同期すると一緒に移せます。'] },
        { h: '元に戻す（設定 → バックアップ → 元に戻す）', steps: [
          '**自動バックアップ**：1日1回保存されます（最新5件）。',
          '**削除、変更された作品**：**復元** で戻ります。',
          '1作品だけなら：⋯ メニュー → **編集履歴**',
        ] },
        { more: true, h: '自分のサーバーと同期（設定 → 詳細設定）', steps: [
          '**設定方法を見る** に沿って無料のサーバーを作ります。',
          '他の端末は **すでにサーバーがある** に同じアドレス、キーを入れます。',
          '**今すぐ同期** を押したときだけやり取りします。',
        ], tips: ['初めて同期する前にバックアップしておくと安心です。', '他の端末で10件より多く削除されると、止まって確認します。'] },
        { more: true, h: '表紙の保存と初期化', steps: [
          '設定 → 整理 → **表紙をこの端末に保存**：表紙がすぐ表示されます。',
          '設定 → バックアップの一番下 **この端末を初期化**：この端末だけ空にします。',
        ] },
      ],
    },
    {
      id: 'faq', title: 'よくある質問',
      parts: [
        { h: '表紙が表示されない', steps: ['情報の編集で別の画像を表紙にするか、自分で添付します。'] },
        { h: '作品が消えた', steps: ['リスト上の 👁 **非表示の作品を表示** をオンにしてみてください。', 'それでもなければ 設定 → バックアップ → **元に戻す**'] },
        { h: '購入メールが読み込めない', steps: ['メールの **本文全体** を貼り付けたか確認してください。', '対応しているメール：**DLsite / ポケドラ**などのストア', '読み込めない作品は **リンクから1作品ずつ** 追加します。'] },
        { h: 'サーバーのキーを忘れた', steps: ['接続中の別の端末があれば：設定 → 詳細設定 → **キーをコピー**', 'なければ新しいキーに変えます：設定方法を見る → **キーを作る** → コピー', 'Cloudflare → **自分のサーバー → 設定 → 変数とシークレット** → **VB_KEY** に貼り付けて保存', 'アプリにアドレスと新しいキーを入れれば完了。サーバーの記録はそのままです。'], tips: ['ほかの端末にも新しいキーを入れ直してください。'] },
        { h: '「サーバーコードの更新」が出る', steps: ['設定 → 詳細設定 → **新しいサーバーコードをコピー**', '**Cloudflare ↗** → 自分のサーバー → **コードを編集**', 'コードを全部消して貼り付け → **デプロイ**'], tips: ['更新しなくてもアプリはそのまま使えます。**あとで**を押すと案内が隠れます。', 'PC で行うと楽です。'] },
        { h: '記録はどこに保存されますか？', steps: ['[폰] ホーム画面のアプリの中 / [PC] インストールしたブラウザの中'], tips: ['自分のサーバーを使うと、同期用のコピーが自分の Cloudflare アカウントにあります。'] },
      ],
    },
    {
      id: 'contact', title: 'お問い合わせと不具合の報告',
      parts: [
        { h: 'その他のお問い合わせ、不具合の報告', steps: ['X の [@w_coconut](https://x.com/w_coconut) までお送りください。'], tips: ['どの画面で何を押したか、スクリーンショットがあると早く直せます。', '使っている端末も教えてください。（例：iPhone の Safari、PC の Chrome）', 'サーバーのアドレスとキーは送らないでください。'] },
      ],
    },
  ],
};
