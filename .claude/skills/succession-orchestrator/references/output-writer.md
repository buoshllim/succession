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

  // 국면별 최적 후보 (비교 심의 결과)
  phaseWinner: {
    1: "{이름}",  // 국면 1에서 최적 후보
    3: "{이름}",  // 국면 3에서 최적 후보
  },

  // JK 최종 의결 (포지션 전체 결론)
  finalDecision: "{최종 선발 후보 이름 또는 '재심의 권고'}",
  finalComment: "JK 포지션 전체 코멘트 2~3문장.",

  // 이사회 토론 전문 (BoardChat용)
  blocks: [
    { type: "section", label: "── Round 1: 이사 초기 평가 ──" },
    {
      type: "bubble",
      board: "vision-jensen",
      text: "이사 발언...",
      // 후보자별 스탠스를 발언 안에 포함
    },
    // ... 나머지 이사들
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

## config.mts 업데이트 규칙

심의 파일 작성 후 `docs/.vitepress/config.mts`의 **심의 이력 sidebar items**에 추가한다.

---

## git 커밋 규칙

```
git add docs/succession/ docs/.vitepress/config.mts && git commit -m "feat: {포지션} {날짜}-{HHMM} 이사회 심의 결과" && git push
```
