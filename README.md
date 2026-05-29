# 🌸 goo-todo

> 설치도, 계정도, 서버도 필요 없는 **귀여운 모바일 할일 앱**

[![HTML](https://img.shields.io/badge/HTML-단일파일-ff8fab?style=flat-square&logo=html5&logoColor=white)](./index.html)
[![저장방식](https://img.shields.io/badge/저장-localStorage-b5ead7?style=flat-square)](./index.html)
[![라이센스](https://img.shields.io/badge/License-MIT-c7b8ea?style=flat-square)](./LICENSE)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| ✅ 할일 추가 | 입력 후 `+` 버튼 또는 Enter |
| 📅 완료일시 기록 | 체크 시 완료한 날짜·시각 자동 메모 |
| 🗂 필터 탭 | 전체 / 진행중 / 완료 탭으로 목록 분류 |
| 📊 통계 | 전체·완료·남은 개수 헤더에 실시간 표시 |
| 💾 로컬 저장 | `localStorage` — 새로고침해도 데이터 유지, 계정 불필요 |
| 📱 모바일 최적화 | 터치 친화적 UI, 파스텔 디자인 |
| 🛡 XSS 방어 | 사용자 입력 HTML 이스케이프 처리 |

---

## 🚀 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/revfactory/goo-todo.git
cd goo-todo

# index.html을 브라우저로 열기 (서버 불필요)
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

또는 `index.html` 파일을 다운로드해서 브라우저로 바로 열어도 됩니다.

---

## 📖 사용법

### 할일 추가
입력창에 텍스트를 입력하고 `+` 버튼을 누르거나 **Enter** 키를 누릅니다.

### 완료 체크
체크박스를 누르면 할일이 완료 처리되고, **완료 일시가 자동으로 기록**됩니다.  
다시 체크하면 완료가 취소됩니다.

### 필터
상단의 탭으로 목록을 필터링합니다:
- **전체** — 모든 할일
- **진행중** — 완료하지 않은 항목
- **완료** — 완료된 항목

### 완료 항목 정리
하단의 `✨ 완료된 항목 지우기` 버튼으로 완료된 항목을 한번에 삭제합니다.

---

## 🗂 파일 구조

```
goo-todo/
├── index.html      # 앱 전체 (HTML + CSS + JS 단일 파일)
├── TUTORIAL.md     # 웹 개발 학습 튜토리얼
└── README.md       # 이 파일
```

---

## 💾 데이터 저장 방식

브라우저의 `localStorage`를 사용합니다.

- **저장 위치**: 접속한 기기의 브라우저 내부
- **서버 전송 없음**: 데이터가 외부로 나가지 않습니다
- **계정 불필요**: 로그인 없이 바로 사용
- **유지 기간**: 브라우저 데이터를 직접 삭제하기 전까지 영구 보존
- **주의**: 다른 기기나 다른 브라우저에서는 데이터가 공유되지 않습니다

---

## 📚 튜토리얼

이 앱이 어떻게 만들어졌는지 단계별로 설명하는 학습 자료가 포함되어 있습니다.

👉 **[TUTORIAL.md](./TUTORIAL.md)** 에서 확인하세요.

다루는 내용:
- HTML/CSS/JS 단일 파일 웹앱 구조
- `localStorage` 데이터 저장·불러오기
- 상태(State)와 렌더링 분리 패턴
- XSS 공격과 입력값 이스케이프
- 모바일 우선 CSS 설계
- 커스텀 체크박스 구현
- 연습 문제 3단계 (쉬움 / 중간 / 어려움)

---

## 🌐 브라우저 지원

| 브라우저 | 지원 여부 |
|----------|----------|
| Chrome 80+ | ✅ |
| Firefox 75+ | ✅ |
| Safari 14+ | ✅ |
| Edge 80+ | ✅ |
| IE 11 | ❌ (`localStorage`, `const`, 화살표 함수 미지원) |

---

## 📄 라이센스

MIT License — 자유롭게 사용·수정·배포할 수 있습니다.
