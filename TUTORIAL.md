# 🌸 귀여운 할일 앱으로 배우는 웹 개발 튜토리얼

> **대상 수준:** 중급 (HTML/CSS/JS 기초 문법을 알고, 간단한 DOM 조작을 해본 적 있는 학생)  
> **소요 시간:** 약 2~3시간  
> **완성물:** 모바일 친화적인 할일 앱 (설치 없이 브라우저에서 바로 실행)

---

## 🎯 학습 목표

이 튜토리얼을 마치면 다음을 할 수 있습니다:

1. **HTML + CSS + JS를 하나의 파일**에 담아 설치 없이 동작하는 웹앱을 만들 수 있다
2. **localStorage**로 새로고침해도 데이터가 사라지지 않게 저장할 수 있다
3. **XSS 공격**이 무엇인지 이해하고 사용자 입력을 안전하게 처리할 수 있다

---

## 📦 Step 1 — 뼈대 만들기: HTML 구조

### 개념: 웹앱의 3층 구조

웹앱을 집에 비유하면:
- **HTML** = 뼈대 (방의 위치와 크기)
- **CSS** = 인테리어 (색, 모양, 크기)
- **JS** = 전기/수도 (동작, 반응)

이 세 가지를 **파일 하나에** 모두 넣을 수 있습니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <!-- 📱 모바일 화면 크기에 맞게 조정하는 핵심 태그 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>나의 할일</title>
  <style>
    /* 여기에 CSS */
  </style>
</head>
<body>

  <h1>할일 목록</h1>

  <!-- 입력창 -->
  <input id="new-todo" type="text" placeholder="할일 입력..." />
  <button id="add-btn">추가</button>

  <!-- 목록이 여기 들어갑니다 -->
  <ul id="todo-list"></ul>

  <script>
    // 여기에 JavaScript
  </script>
</body>
</html>
```

> 💡 **`<meta name="viewport">`가 왜 중요한가?**  
> 이 태그가 없으면 모바일 브라우저가 페이지를 데스크톱 크기(980px)로 렌더링한 뒤 축소해서 보여줍니다. 글씨가 개미만해집니다. 이 태그 한 줄로 모바일에 딱 맞게 표시됩니다.

---

## 💾 Step 2 — localStorage: 새로고침해도 살아남는 데이터

### 개념: 브라우저 속 작은 서랍

`localStorage`는 브라우저가 각 사이트마다 제공하는 **작은 서랍**입니다.  
서버도, 계정도 필요 없이 **이 기기의 이 브라우저**에 데이터를 보관합니다.

| 특징 | 설명 |
|------|------|
| 용량 | 약 5MB |
| 유지 기간 | 직접 지우거나 브라우저 데이터 삭제 전까지 영구 |
| 접근 범위 | 같은 도메인(또는 파일)만 |
| 저장 형식 | 문자열만 저장 가능 |

### 최소 예제: 데이터 저장하고 불러오기

```javascript
// ── 저장하기 ──
// localStorage는 문자열만 저장합니다.
// 배열/객체는 JSON.stringify()로 문자열로 변환해야 합니다.
const 할일목록 = [
  { id: 1, text: '밥 먹기', done: false },
  { id: 2, text: '공부하기', done: true }
];
localStorage.setItem('my-todos', JSON.stringify(할일목록));

// ── 불러오기 ──
// 저장된 문자열을 다시 배열/객체로 변환합니다.
const 저장된문자열 = localStorage.getItem('my-todos');
const 불러온목록 = JSON.parse(저장된문자열);
console.log(불러온목록); // [{id:1, text:'밥 먹기', done:false}, ...]

// ── 없을 때 대비 ──
// 처음 실행 시엔 저장된 데이터가 없어서 null이 반환됩니다.
const 안전하게불러오기 = JSON.parse(localStorage.getItem('my-todos')) || [];
//                                                                      ↑
//                              null이면 빈 배열을 기본값으로 사용합니다
```

### 단계적 확장: 함수로 감싸기

매번 `JSON.stringify` / `JSON.parse`를 쓰면 번거롭습니다. 함수로 묶으면 편합니다.

```javascript
const STORAGE_KEY = 'my-todos'; // 키 이름을 상수로 관리 (오타 방지)

function 저장(목록) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(목록));
}

function 불러오기() {
  try {
    // JSON.parse는 잘못된 데이터가 있으면 오류를 던집니다.
    // try-catch로 감싸면 앱이 멈추지 않습니다.
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return []; // 파싱 실패 시 빈 배열 반환
  }
}

let 할일목록 = 불러오기(); // 앱 시작 시 저장된 데이터 복원
```

---

## ✅ Step 3 — 할일 추가/완료/삭제 로직

### 개념: 상태(State)와 렌더링(Rendering)을 분리하기

초보자가 자주 하는 실수는 **화면을 직접 수정**하는 것입니다.

```javascript
// ❌ 나쁜 방법: 화면(DOM)을 직접 수정
document.getElementById('list').innerHTML += '<li>새 할일</li>';
// 문제: 데이터와 화면이 따로 놀기 시작합니다. 데이터가 어디있는지 모릅니다.
```

더 좋은 방법은 **데이터를 먼저 바꾸고, 화면은 데이터를 보고 다시 그리는** 것입니다.

```javascript
// ✅ 좋은 방법: 데이터(상태) 변경 → 화면 다시 그리기
let 할일목록 = []; // 진실의 원천(source of truth)은 이 배열 하나

function 할일추가(텍스트) {
  텍스트 = 텍스트.trim(); // 앞뒤 공백 제거
  if (!텍스트) return;   // 빈 입력 무시

  // 1. 데이터 변경
  할일목록.unshift({     // unshift = 맨 앞에 추가 (최신 항목이 위에)
    id: Date.now(),      // 고유 ID로 타임스탬프 활용
    text: 텍스트,
    createdAt: new Date().toISOString(), // 생성 시각 ISO 형식으로 저장
    doneAt: null         // 완료 시각 (완료 전엔 null)
  });

  // 2. 저장
  저장(할일목록);

  // 3. 화면 다시 그리기
  화면그리기();
}

function 완료토글(id, 완료여부) {
  // map으로 해당 항목만 변경한 새 배열 생성 (원본 직접 변경 X)
  할일목록 = 할일목록.map(항목 =>
    항목.id === id
      ? { ...항목, doneAt: 완료여부 ? new Date().toISOString() : null }
      : 항목
  );
  저장(할일목록);
  화면그리기();
}

function 할일삭제(id) {
  할일목록 = 할일목록.filter(항목 => 항목.id !== id);
  저장(할일목록);
  화면그리기();
}
```

> 💡 **왜 `...항목` (스프레드 연산자)를 쓰나요?**  
> 객체를 직접 수정하면(`항목.doneAt = ...`) 원본이 바뀝니다.  
> `{ ...항목, doneAt: 값 }`은 항목을 **복사**한 뒤 `doneAt`만 바꾼 새 객체를 만듭니다.  
> 이렇게 하면 데이터 흐름이 예측 가능해집니다.

---

## 🎨 Step 4 — 화면 그리기 함수

```javascript
function 화면그리기() {
  const 목록컨테이너 = document.getElementById('todo-list');
  목록컨테이너.innerHTML = ''; // 기존 목록 초기화

  if (할일목록.length === 0) {
    목록컨테이너.innerHTML = '<p>할일이 없어요! 🌷</p>';
    return;
  }

  할일목록.forEach(항목 => {
    const 카드 = document.createElement('div');
    카드.className = 항목.doneAt ? 'todo-card done' : 'todo-card';

    // ⚠️ 사용자 입력(항목.text)을 innerHTML에 넣을 땐 반드시 이스케이프!
    // (다음 Step에서 자세히 설명합니다)
    카드.innerHTML = `
      <input type="checkbox" ${항목.doneAt ? 'checked' : ''} />
      <span>${안전하게변환(항목.text)}</span>
      ${항목.doneAt ? `<small>완료: ${날짜포맷(항목.doneAt)}</small>` : ''}
      <button class="del-btn">삭제</button>
    `;

    // 이벤트는 innerHTML 후에 붙입니다
    카드.querySelector('input[type=checkbox]').addEventListener('change', e => {
      완료토글(항목.id, e.target.checked);
    });
    카드.querySelector('.del-btn').addEventListener('click', () => {
      할일삭제(항목.id);
    });

    목록컨테이너.appendChild(카드);
  });
}

// 날짜를 읽기 좋게 변환
function 날짜포맷(isoString) {
  const 날짜 = new Date(isoString);
  const 두자리 = n => String(n).padStart(2, '0'); // 9 → '09'
  return `${날짜.getFullYear()}.${두자리(날짜.getMonth() + 1)}.${두자리(날짜.getDate())} `
       + `${두자리(날짜.getHours())}:${두자리(날짜.getMinutes())}`;
}
```

---

## 🛡️ Step 5 — XSS 방어: 사용자 입력은 믿지 마세요

### 개념: XSS(크로스 사이트 스크립팅) 공격

사용자가 할일 입력창에 이렇게 입력하면 어떻게 될까요?

```
<img src="x" onerror="alert('해킹!')">
```

이걸 아무 처리 없이 `innerHTML`에 넣으면:

```javascript
// ❌ 위험한 코드
카드.innerHTML = `<span>${항목.text}</span>`;
// 결과: <span><img src="x" onerror="alert('해킹!')"></span>
// → 이미지 로딩 실패 시 onerror 스크립트가 실행됩니다!
```

악의적인 사용자가 이를 이용해 **다른 사용자의 정보를 훔치거나** 앱을 망가뜨릴 수 있습니다.

### 해결책: HTML 특수문자를 이스케이프

```javascript
function 안전하게변환(문자열) {
  // HTML에서 특별한 의미를 갖는 문자를 무해한 표현으로 바꿉니다.
  return 문자열
    .replace(/&/g, '&amp;')   // & → &amp;  (가장 먼저!)
    .replace(/</g, '&lt;')    // < → &lt;   (태그 시작 차단)
    .replace(/>/g, '&gt;')    // > → &gt;   (태그 끝 차단)
    .replace(/"/g, '&quot;')  // " → &quot; (속성값 탈출 차단)
    .replace(/'/g, '&#x27;'); // ' → &#x27; (속성값 탈출 차단)
}

// 이제 안전합니다:
// 입력: <img src="x" onerror="alert('해킹!')">
// 출력: &lt;img src=&quot;x&quot; onerror=&quot;alert(&#x27;해킹!&#x27;)&quot;&gt;
// 화면에는 태그가 실행되지 않고 그대로 텍스트로 표시됩니다.
```

> 💡 **`textContent`를 쓰면 이스케이프가 필요 없습니다**  
> `element.textContent = 사용자입력` — 브라우저가 HTML로 해석하지 않고 순수 텍스트로 취급합니다.  
> `innerHTML`을 쓸 때만 이스케이프가 필요합니다.

---

## 📱 Step 6 — 모바일 우선 CSS 핵심 패턴

### 개념: 모바일 우선(Mobile First) 설계

모바일 우선이란 **기본 스타일을 모바일용으로 작성**하고, 화면이 넓어질 때만 추가 스타일을 덮어쓰는 방식입니다.

```css
/* 기본값 = 모바일 스타일 */
.container {
  padding: 16px;       /* 손가락으로 탭하기 편한 여백 */
  max-width: 100%;
}

/* 태블릿/데스크톱: 화면이 520px 이상일 때만 적용 */
@media (min-width: 520px) {
  .container {
    max-width: 480px;  /* 너무 넓어지지 않도록 제한 */
    margin: 0 auto;    /* 가운데 정렬 */
  }
}
```

### 터치 친화적인 버튼 크기

```css
/* 손가락으로 누르기 편하려면 최소 44x44px 권장 (Apple HIG 기준) */
button {
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;  /* 둥글게 */
  cursor: pointer;
}

/* 누를 때 시각적 피드백 */
button:active {
  transform: scale(0.93);
}
```

### 커스텀 체크박스 만들기

브라우저 기본 체크박스는 스타일을 바꾸기 어렵습니다. 숨기고 CSS로 새로 그립니다.

```html
<label class="checkbox-wrap">
  <!-- 실제 체크박스는 숨깁니다 (접근성을 위해 완전히 삭제하지 않고 숨김) -->
  <input type="checkbox" />
  <!-- 대신 이 span을 체크박스처럼 꾸밉니다 -->
  <span class="custom-box"></span>
</label>
```

```css
.checkbox-wrap {
  position: relative;
  width: 28px;
  height: 28px;
  display: inline-block;
}

/* 실제 체크박스를 투명하게 + 클릭 가능하게 위에 올려둡니다 */
.checkbox-wrap input[type="checkbox"] {
  position: absolute;
  opacity: 0;           /* 투명하게 */
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;           /* 클릭 이벤트를 받을 수 있도록 위에 */
}

/* 커스텀 체크박스 모양 */
.custom-box {
  width: 28px;
  height: 28px;
  border: 2.5px solid #ffb3c6;
  border-radius: 8px;
  background: white;
  pointer-events: none; /* 클릭 이벤트는 위의 input이 받습니다 */
}

/* 체크됐을 때 스타일 — input:checked 다음 형제(+) 선택 */
.checkbox-wrap input:checked + .custom-box {
  background: #b5ead7;
  border-color: transparent;
}

/* 체크 표시 (✓) */
.checkbox-wrap input:checked + .custom-box::after {
  content: '✓';
  color: white;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
```

---

## ⚠️ 흔한 실수 모음

### 실수 1: 이벤트를 반복문 안에서 잘못 바인딩

```javascript
// ❌ 잘못된 방법
for (let i = 0; i < 할일목록.length; i++) {
  document.querySelectorAll('.del-btn')[i].onclick = function() {
    할일삭제(할일목록[i].id); // i가 루프 종료 후 최댓값으로 고정됩니다!
  };
}

// ✅ 올바른 방법: forEach와 클로저 활용
할일목록.forEach(항목 => {
  const 버튼 = document.createElement('button');
  버튼.addEventListener('click', () => {
    할일삭제(항목.id); // 항목은 각 반복마다 올바르게 캡처됩니다
  });
});
```

### 실수 2: 렌더링 후 이벤트 연결을 빠뜨림

```javascript
// ❌ 잘못된 방법: innerHTML 설정 전에 이벤트를 붙임
const 카드 = document.createElement('div');
카드.querySelector('.del-btn').addEventListener('click', ...); // null 오류!
카드.innerHTML = `<button class="del-btn">삭제</button>`;     // 이 줄이 먼저여야 합니다

// ✅ 올바른 방법: innerHTML 후에 이벤트 연결
카드.innerHTML = `<button class="del-btn">삭제</button>`;
카드.querySelector('.del-btn').addEventListener('click', ...); // OK
```

### 실수 3: localStorage에 객체를 그대로 저장

```javascript
// ❌ 잘못된 방법
localStorage.setItem('todos', 할일목록); // "[object Object]" 문자열이 저장됩니다

// ✅ 올바른 방법
localStorage.setItem('todos', JSON.stringify(할일목록)); // 올바른 JSON 저장
```

---

## 🏋️ 연습 문제

### 🟢 쉬움: 할일 개수 표시

헤더에 "전체 N개 / 완료 M개" 형식으로 현재 할일 현황을 표시해보세요.

**힌트:**
```javascript
const 전체 = 할일목록.length;
const 완료 = 할일목록.filter(항목 => 항목.doneAt).length;
// 이 값을 화면 어딘가에 표시하면 됩니다
```

---

### 🟡 중간: 수정 기능 추가

할일 텍스트를 더블클릭하면 수정할 수 있게 해보세요.

**힌트:**
- `dblclick` 이벤트 사용
- 텍스트 `<span>`을 `<input>`으로 교체
- Enter 키 또는 포커스 잃을 때(`blur`) 저장

```javascript
텍스트요소.addEventListener('dblclick', () => {
  const 입력 = document.createElement('input');
  입력.value = 항목.text;
  텍스트요소.replaceWith(입력);
  입력.focus();

  입력.addEventListener('blur', () => {
    // 수정 완료 처리
  });
});
```

---

### 🔴 어려움: 드래그로 순서 바꾸기

할일 카드를 드래그해서 순서를 바꿀 수 있게 해보세요.

**힌트:**
- `draggable="true"` 속성과 `dragstart`, `dragover`, `drop` 이벤트 사용
- 드래그한 항목의 인덱스를 기억했다가 드롭 위치와 교환

```javascript
카드.draggable = true;

카드.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text/plain', 항목.id);
});

카드.addEventListener('dragover', e => {
  e.preventDefault(); // 드롭을 허용하려면 기본 동작을 막아야 합니다
});

카드.addEventListener('drop', e => {
  const 드래그한ID = Number(e.dataTransfer.getData('text/plain'));
  // 두 항목의 위치를 바꾸는 로직을 구현해보세요
});
```

---

## 📚 더 배워볼 것

| 주제 | 키워드 |
|------|--------|
| 앱처럼 설치 가능하게 | PWA (Progressive Web App), Web App Manifest |
| 여러 기기 간 동기화 | Firebase Realtime Database, Supabase |
| 더 체계적인 상태 관리 | React useState, Zustand |
| 애니메이션 개선 | CSS `@keyframes`, Web Animations API |
| 접근성(장애인 지원) | WAI-ARIA, `role`, `aria-label` |

---

> 🌸 **완성 축하해요!**  
> 서버도, 계정도, 설치도 없이 브라우저 하나로 동작하는 나만의 앱을 만들었습니다.  
> 연습 문제를 풀며 더 발전시켜 보세요!
