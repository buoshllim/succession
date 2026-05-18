# 출력 파일 작성 가이드

승계 이사회 심의 결과를 PositionDebate 컴포넌트 형식으로 작성한다.

---

## 파일 경로 규칙

```
~/Projects/succession-agent/docs/succession/{YYYY-MM-DD}-{HHMM}-{포지션슬러그}.md
```

- HHMM: KST 기준 실행 시각 4자리 (예: 1423)
- 포지션 슬러그: `cio` / `md` / `caio` / `aidt` / `cso` / `cfo` / `clo` / `ciro` / `chro` / `ciso`
- 예시: `2026-05-18-1423-cio.md`

---

## 컴포넌트 형식

마지막 줄은 반드시 `<PositionDebate v-bind="debate" />`

```vue
<script setup>
const debate = {
  position: "{포지션명}",         // 예: "CIO"
  positionSlug: "{포지션슬러그}", // 예: "cio"
  date: "{YYYY-MM-DD}",
  time: "{HHMM}",                 // 예: "1423"
  phases: [{선택된 국면 번호 배열}], // 예: [1, 3]
  agenda: "{포지션} 후보자 비교 심의",

  // 공통 3축 + 포지션 특화 2축 레이블
  // target-profiles/{slug}.md의 spider_axes에서 로드
  radarAxes: [
    { key: "integrity",   label: "신뢰·원칙" },
    { key: "leadership",  label: "리더십 성숙도" },
    { key: "growth",      label: "성장 궤도" },
    { key: "{축1슬러그}", label: "{축1 한글명}" },
    { key: "{축2슬러그}", label: "{축2 한글명}" },
  ],

  // 후보자 배열 (심의한 모든 후보자)
  candidates: [
    {
      name: "{이름}",
      type: "내부 임원",         // 내부 임원 / 내부 시니어 / 외부 후보
      current: "{현직}",
      readiness: "🟢 Ready Now", // 🟢 Ready Now / 🟡 Ready in 2Y / 🔴 Not Ready
      readinessScore: 0.82,      // 0.00~1.00
      dissension: "10명 중 8명 동방향",
      radar: {
        integrity: 85,
        leadership: 78,
        growth: 90,
        "{축1슬러그}": 72,
        "{축2슬러그}": 68,
      },
      jkComment: "JK 코멘트 2~3문장.",
      strengths: ["강점1", "강점2"],
      concerns: ["우려1"],
    },
    // ... 나머지 후보자들
  ],

  // JK 최종 의결 (포지션 전체 결론)
  finalDecision: "{이름} — 🟢 Ready Now",  // 또는 재심의 권고
  // finalComment: 실제 선임이 아닌 준비도·우선순위 의결임을 명시
  // 예: "{이름}을 {포지션} 즉시 선임 가능한 1순위 후보자로 의결한다."
  // 예: "{이름}을 2년 내 선임 가능한 1순위 후보자로 의결하며, 육성 과제를 부기한다."
  finalComment: "JK 포지션 전체 코멘트 2~3문장. '즉시 선임을 의결한다'가 아니라 '1순위 후보자로 의결한다' 형식.",

  // 이사회 토론 전문 (BoardChat용)
  blocks: [
    { type: "section", label: "── Round 1: 이사 초기 평가 ──" },
    {
      type: "bubble",
      board: "vision-jensen",
      text: "이사 발언... 후보자 전원에 대한 스탠스를 자연어 발언으로 포함. 예: 'A는 🟢 — 이유. B는 🟡 — 짧은 이유. C·D 🟡. E 🔴 — 이유.'",
      // ✅ Round 1 bubble 필수 규칙:
      // 1. 심의에 투표한 이사 전원이 각자 bubble을 가져야 한다 (누락 금지)
      // 2. 각 이사는 심의 대상 후보자 전원(최대 5~6명)에 대해 스탠스를 명시할 것
      // 3. 핵심 논거는 1~2명에 집중, 나머지는 짧게라도 언급
      // ⛔ 특정 이사가 Round 1에 아예 등장하지 않는 것 금지
      // ⛔ 1순위 후보자만 언급하고 나머지를 침묵하는 것 금지
      // ⛔ "[압축]" 등 비표준 요약 포맷 사용 금지 — 반드시 자연어 발언 형태로 작성
    },
    // ... 나머지 이사들 (투표 참여 이사 전원)
    { type: "section", label: "── Round 2: 긴장 쌍 토론 ──" },
    {
      type: "exchange",
      tension: "{긴장 쌍 설명}",
      messages: [
        { speaker: "JK", text: "의장 질문..." },
        { speaker: "Vision·Jensen Huang", board: "vision-jensen", text: "응답..." },
        { speaker: "Integrity·Buffett", board: "integrity-buffett", text: "반론..." },
      ]
    },
    {
      type: "closing",
      text: "JK 최종 클로징..."
    }
  ]
}
</script>

<PositionDebate v-bind="debate" />
```

---

## board 키 규칙

board 키는 `.claude/agents/board-{키}.md` 파일명에서 `board-` 제거한 값:
- `board-vision-jensen.md` → `"vision-jensen"`
- `board-integrity-buffett.md` → `"integrity-buffett"`

---

## ⛔ 허용 필드 / 금지 필드 — 반드시 준수

### bubble 블록
```js
// ✅ 허용 필드만
{ type: "bubble", board: "vision-jensen", text: "...", changed: "up" }

// ⛔ 아래 필드는 절대 사용 금지
// speaker, director, directorLabel, label, body, confidence, weight, stance, id
```

### exchange 블록
```js
// ✅ 허용 필드만
{
  type: "exchange",
  tension: "긴장 쌍 설명",   // ⛔ label, topic, title, phase 금지
  messages: [...]
}
```

### exchange 구조 필수 규칙
```js
// ✅ 반드시 JK 의장 질문으로 시작
messages: [
  { speaker: "JK", text: "의장 질문 — 이 exchange의 긴장 쌍을 설명하고 이사들에게 논쟁을 유도..." },
  { speaker: "Vision·Jensen Huang", board: "vision-jensen", text: "..." },
  // ...
]

// ⛔ JK 없이 이사 발언으로 바로 시작하는 것 금지
// ⛔ exchange 내 이사 메시지에 board: 필드 누락 금지 (JK만 board: 없음)
```

### exchange 내 message 객체
```js
// ✅ JK 메시지 (board: 없음)
{ speaker: "JK", text: "..." }

// ✅ 이사 메시지 — speaker와 board: 모두 필수
{ speaker: "Vision·Jensen Huang",  board: "vision-jensen",     text: "..." }
{ speaker: "Scale·Jeff Bezos",     board: "scale-bezos",       text: "..." }
{ speaker: "Integrity·Buffett",    board: "integrity-buffett",  text: "..." }
{ speaker: "Principles·Dalio",     board: "principles-dalio",   text: "..." }
{ speaker: "Transform·Nadella",    board: "transform-nadella",  text: "..." }
{ speaker: "Innovation·Wood",      board: "innovation-wood",    text: "..." }
{ speaker: "Performance·Welch",    board: "performance-welch",  text: "..." }
{ speaker: "Inversion·Munger",     board: "inversion-munger",   text: "..." }
{ speaker: "Execution·Musk",       board: "execution-musk",     text: "..." }
{ speaker: "Lean·Sandberg",        board: "lean-sandberg",      text: "..." }

// ⛔ 아래 필드명 금지
// director, directorLabel, label, body, confidence, weight, stance
// ⛔ speaker에 board 키값 직접 사용 금지 (예: speaker: "vision-jensen" ❌)
// ⛔ speaker에 "()"형식 사용 금지 (예: speaker: "Jensen (vision)" ❌)
// ⛔ speaker 이름에 공백 포함된 중점 사용 금지 (예: speaker: "Vision · Jensen Huang" ❌)
// ⛔ speaker에 풀 이름 사용 금지 (예: "Integrity·Warren Buffett" ❌, "Inversion·Charlie Munger" ❌)
//    → 반드시 위 10개 canonical 이름 중 정확히 일치하는 것만 사용
// ⛔ 이사 메시지에 board: 필드 누락 금지
```

### closing 블록
```js
// ✅ 허용 필드만
{ type: "closing", text: "JK 클로징..." }

// ⛔ label 필드 금지 (예: label: "JK 최종 의결" ❌)
```

### section 블록 label 형식
```js
// ✅ 허용되는 section 라벨은 정확히 아래 3개뿐 (── 앞뒤 공백 포함)
{ type: "section", label: "── Round 1: 이사 초기 평가 ──" }
{ type: "section", label: "── Round 2: 긴장 쌍 토론 ──" }
{ type: "section", label: "── Round 2 이후 이사 재발언 ──" }

// ⛔ 금지 예시
// "Round 1 — 이사 독립 평가"  ❌
// "Round 1: 이사 초기 평가"   ❌ (── 없음)
// "Phase 1"                   ❌
// "── Round 1 압축 요약 ──"   ❌ (임의 섹션 추가 금지)
// "재발언 — 스탠스 최종 확인" ❌
// 위 3개 외 어떤 이름의 section도 추가 금지
```

### finalDecision 형식
```js
// ✅ 반드시 이름 + 대시 + 준비도 이모지 포함
finalDecision: "박진우 — 🟢 Ready Now"
finalDecision: "홍길동 — 🟡 Ready in 2Y"

// ⛔ 이름만 단독 사용 금지
// finalDecision: "박진우"  ❌
```

### finalComment 형식
```js
// ✅ '1순위 후보자로 의결한다' 형식
finalComment: "...를 {포지션} 1순위 후보자로 의결한다."

// ⛔ '즉시 선임을 의결한다' 표현 금지
```

### blocks 최상위 구조 금지 패턴
```js
// ⛔ blocks 내에 speeches[], phase, title 같은 커스텀 구조 사용 금지
// blocks는 반드시 section / bubble / exchange / closing 타입 객체의 flat 배열이어야 한다
blocks: [
  { type: "section", ... },
  { type: "bubble",  ... },
  { type: "exchange", ... },
  { type: "closing", ... },
]
// ⛔ 아래 구조는 절대 금지
// blocks: [{ phase: 1, title: "...", speeches: [...] }]  ❌
```

---

## board/index.md 카드 구조 — 심의 완료 시 업데이트

심의 완료 후 `docs/succession/board/index.md`의 해당 포지션 카드를 아래 구조로 업데이트한다.

```html
<div class="position-card">
  <!-- ✅ header: readiness-pill 반드시 포함. 빈 div 절대 금지 — 빌드 오류 원인 -->
  <div class="position-card-header">
    <span class="readiness-pill ready-now">🟢 Ready Now</span>
  </div>
  <div class="position-card-name">{포지션명}</div>
  <div class="position-card-role">{역할명}</div>
  <div class="readiness-wrap">
    <div class="readiness-bar" style="flex:1">
      <div class="readiness-bar-fill" style="width:{1순위 readinessScore × 100}%"></div>
    </div>
    <span class="readiness-val">{점수}%</span>
  </div>
  <!-- ✅ 1순위 + 2순위 한 줄. readiness pill은 meta 안에 넣지 않는다 -->
  <div class="position-card-meta">
    <span class="card-date">{YYYY-MM-DD}</span>
    <span class="card-pick"><span class="card-pick-label">1순위</span> {1순위 이름}</span>
    <span class="card-pick-label rank2 {2순위 readiness class}">2순위</span>
    <span class="card-second-name">{2순위 이름}</span>
  </div>
  <div class="position-card-footer">
    <a href="/succession/{YYYY-MM-DD}-{HHMM}-{slug}" class="position-btn">💬 최신 심의</a>
    <a href="/succession/list?position={포지션명}" class="position-btn">📋 전체 이력</a>
  </div>
</div>
```

2순위 readiness class: `ready-now` / `ready-2y` / `not-ready`

---

## 디자인 규칙 — 파일 작성 시 준수

- 심의 MD 파일에 `<style>` 태그, inline style, font-family 지정을 추가하지 않는다.
  모든 스타일은 `custom.css`에서 전역 관리된다.
- `PositionDebate` 컴포넌트의 클래스(`.pd-*`, `.radar-label` 등)에 이미 Pretendard 폰트가 적용되어 있다.
  별도 스타일 override 금지.

---

## config.mts 업데이트 — 금지

개별 심의 페이지를 `/succession/` 사이드바에 추가하지 않는다.
심의 이력 탐색은 `/succession/list` 페이지에서 DebateList 컴포넌트로 제공한다.

---

## git 커밋 규칙

커밋 전 반드시 로컬 빌드 검증 후 커밋한다. 빌드 실패 시 Vercel 배포가 깨진다.

```bash
# 1. 빌드 검증 (오류 없으면 "build complete" 출력)
npm run docs:build

# 2. 커밋 & 푸시
git add docs/succession/ docs/.vitepress/theme/components/DebateList.vue docs/succession/board/index.md && git commit -m "feat: {포지션} {날짜}-{HHMM} 이사회 심의 결과" && git push
```

### ⛔ 빌드 오류 원인 목록

| 원인 | 증상 | 방지법 |
|------|------|--------|
| `position-card-header` 빈 div | "Element is missing end tag" | 카드 구조 템플릿 준수 — header에 readiness-pill 항상 포함 |
| HTML 수정 시 regex 범위 초과 | 의도치 않은 요소 제거 | regex 적용 전 대상 scope 확인 |
