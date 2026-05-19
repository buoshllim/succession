---
name: succession-orchestrator
description: 승계 이사회 오케스트레이터. "승계 심의", "이사회 열어", "CIO 후보 심의해줘", "succession", "후보자 평가", "다시 실행", "재심의" 등의 요청이 오면 반드시 이 스킬을 사용하라. 에이전트 이사 10명 병렬 평가 → 에이전트 팀 실시간 토론 → JK 최종 선언 → 웹 퍼블리시 전체 워크플로우를 담당한다.
---

# 승계 이사회 오케스트레이터

## 운영 원칙

- **기본 트리거: 포지션 단위** — "CIO 심의해줘"처럼 포지션만 지정. 해당 포지션의 모든 등록 후보자를 자동 로드해 동시에 비교 심의한다.
- **단독 심의**: 후보자 1명만 등록된 경우. 준비도 평가만.
- **비교 심의 = 개별 준비도 평가 + 최적 후보 선발 동시 수행**: 각 후보자의 Ready Now/2Y/Not Ready를 구하고, 선택된 국면에서 누가 가장 적합한지 결론을 낸다.
- **출력 정책**: 심의별 독립 파일 신규 생성 — `docs/succession/{YYYY-MM-DD}-{HHMM}-{포지션슬러그}.md`. 누적됨.
- **데이터 최소주의**: 실명 + 현직 + 핵심 경력만 있어도 진행. 부족한 정보는 이사들이 확신도↓로 표현.

> ⚠️ **후보자 호칭 표준**: 이사 발언·토론·최종 선언 전체에서 후보자는 반드시 **실명**으로 호칭한다. Alpha/Beta/Gamma 등 코드명 사용 절대 금지.

---

## 실행 모드 판단

스킬 트리거 시 가장 먼저 컨텍스트를 확인한다:

- `_workspace/` 존재 + 부분 수정 요청 → **부분 재실행**
- `_workspace/` 존재 + 새 입력 → `_workspace/` → `_workspace_prev/` 이동 후 **새 실행**
- `_workspace/` 미존재 → **초기 실행**

---

## Phase 0: 컨텍스트 로드 + 후보자 데이터 수집

### 0-0. 비즈니스 국면 확인 (필수 — 심의 시작 전 반드시 물어본다)

사용자에게 아래 형식으로 질문한다:

```
현재 어떤 비즈니스 국면에서 심의를 진행하나요? 복수 선택 가능합니다.

1. AI·반도체 슈퍼사이클 — HBM·AI 투자 집행, NAV 극대화 구간
2. NAV 할인 해소기 — Korea Discount 정책 + 주주환원 공약 집행
3. 포트폴리오 재편기 — 비핵심 자산 정리, AI 포트폴리오 집중
4. 신규 투자 개척기 — VC 딜소싱, 해외 AI 투자 확대
5. 다운사이클 대응기 — 반도체 사이클 전환 시 리스크 관리

해당하는 번호를 모두 알려주세요. (예: 1, 3)
```

사용자가 응답하면 선택된 국면을 기록하고 다음 단계로 진행한다.

### 0-1. Knowledge 파일 읽기

| 파일 | 목적 |
|------|------|
| `knowledge/leadership-philosophy.md` | 이사회 운영 철학·준비도 계산 기준 |
| `knowledge/position-rules.md` | 포지션별 역량 기준·이사 가중치 테이블 + 선택된 국면 조정값 |
| `knowledge/candidates/{후보자명}.md` | 후보자별 프로파일 |
| `knowledge/target-profiles/{포지션슬러그}.md` | 포지션별 이상적 후보 기준 (필수 역량·딜브레이커) |

**포지션명 → 슬러그 매핑:**

| 포지션명 (트리거·candidates role) | 슬러그 (파일명) |
|----------------------------------|----------------|
| CIO | cio |
| 투자MD | md |
| AI혁신담당 | caio |
| AI/DT담당 | aidt |
| 전략담당 | cso |
| 재무담당 | cfo |
| 법무담당 | clo |
| IR담당 | ciro |
| HR담당 | chro |
| 정보보호담당 | ciso |

### 0-2. 후보자 프로파일 확인 및 생성

**파일이 있는 경우:** `knowledge/candidates/{후보자명}.md` 읽기

**포지션 단위 트리거 시:** `knowledge/candidates/` 내 모든 파일을 스캔 → frontmatter의 `positions[].role == {포지션} && positions[].status == active` 인 파일만 로드. 후보자가 0명이면 사용자에게 "등록된 후보자가 없습니다" 알림.

status 값:
- `active` — 현재 심의 대상 (로드 대상)
- `inactive` — 고려 중단 (스킵)
- `placed` — 선임 완료 (스킵)

**파일이 없는 경우:** 사용자가 제공한 자유 텍스트를 파싱해서 아래 형식으로 파일 생성:

```markdown
# {후보자명} — {포지션} 후보자

> 후보자 유형: 내부 임원 / 계열사 / 외부
> 데이터 품질: 높음 / 중간 / 낮음

## 기본 정보
- **현직**: {직함 · 재직기간}
- **추천인**: (있는 경우)

## 핵심 경력
| 기간 | 역할 | 주요 성과 |
|------|------|---------|
| ... | ... | ... |

## 강점
- ...

## 우려
- ...

## 심의 이력
없음 (최초 등록)
```

데이터 품질 가드레일:
- 현직 + 경력 1개 이상이면 진행 (낮음으로 기록)
- 코드명만 있으면 → 사용자에게 최소 정보 요청

---

## Phase 1: 이사 병렬 독립 평가 (Round 1)

**실행 모드: Agent tool 병렬 spawn 필수**

`Agent` 도구로 각 이사 에이전트를 병렬 spawn. 독립 컨텍스트에서 소울 파일을 읽고 평가 생성.

⚠️ **인라인 시뮬레이션 절대 금지**: 오케스트레이터가 이사 발언을 직접 생성하는 방식은 사용하지 않는다. Rate limit·컨텍스트 제약이 발생해도 인라인으로 우회하지 말고, 가중치 우선순위에 따라 순차 처리한다.

`knowledge/position-rules.md`에서 해당 포지션의 가중치를 확인한다.
가중치 0.00인 이사는 Phase 1에서 제외한다.

선택된 국면의 조정값을 BASE_WEIGHTS에 합산한 **최종 가중치**로 이사 영향력을 계산한다.

이사 에이전트 목록 (`.claude/agents/board-{key}.md`):
```
board-vision-jensen
board-scale-bezos
board-integrity-buffett
board-principles-dalio
board-transform-nadella
board-innovation-wood
board-performance-welch
board-inversion-munger
board-execution-musk      ← 가중치 0.00이면 제외
board-lean-sandberg
```

각 에이전트에게 전달:
- 후보자 프로파일
- `knowledge/leadership-philosophy.md` 요약
- 포지션 정보 + 이 이사의 최종 가중치
- 선택된 비즈니스 국면

각 에이전트 출력 — **반드시 아래 품질 기준을 충족해야 한다:**
- 스탠스(🟢/🟡/🔴) + 확신도 명시
- **자신의 고유 투자 철학·관점에서** 후보자를 평가 (3~5문장, 단순 요약 금지)
- 다른 후보자와 명시적 비교 포함 (왜 이 후보인가, 왜 저 후보가 아닌가)
- 선택된 비즈니스 국면이 판단에 어떻게 영향을 미쳤는지 언급

타임아웃: 에이전트별 120초. 초과 시 "의견 없음" 처리.

**비교 심의 모드 (복수 후보자):** 각 이사는 후보자별로 스탠스를 제시하고, 국면별 최적 후보 의견을 포함한다.

---

## Phase 1.5: Round 1 출력 압축 (컨텍스트 폭발 방지)

**반드시 Phase 2 진입 전에 실행한다.**

각 이사의 Round 1 출력을 아래 형식으로 압축한다:

```
{이사명}: {스탠스 이모지} {확신도} — {핵심 근거 1문장}
```

규칙:
- 이사당 80토큰 이하로 압축
- 이후 에이전트 호출에는 이 compact summary만 전달
- 원본은 오케스트레이터 로컬 변수로만 보관 — Phase 4 작성 시에만 참조

---

## Phase 2: 이사회 실시간 토론 (Round 2)

**실행 모드: 에이전트 팀 (하네스)**

### 2-1. 팀 구성

**Step 1 — 팀 생성** (`members` 파라미터 없음):
```
TeamCreate(
  team_name="succession-board",
  description="{포지션명} 승계 이사회 토론"
)
```

**Step 2 — 팀원 개별 소환** (Agent 호출 시 `team_name` 지정으로 자동 합류):
```
Agent(subagent_type="ceo-jk",           team_name="succession-board", name="jk",     ...)
Agent(subagent_type="board-vision-jensen", team_name="succession-board", name="jensen", ...)
# ... 가중치 0.00 제외한 활성 이사 전원
```

> ⚠️ `TeamCreate`의 실제 파라미터는 `team_name`, `description`, `agent_type`만 존재한다. `members=` 형식은 지원되지 않으며, 팀원은 반드시 Agent 도구로 개별 소환해야 한다.

> **Phase 1 → Phase 2 컨텍스트 연결**: Phase 2 이사는 Phase 1에서 독립 실행된 서브에이전트와 별개의 새 인스턴스다. 자신의 Phase 1 발언을 직접 기억하지 못하므로, spawn 시 **Phase 1.5 compact summary를 초기 컨텍스트로 반드시 전달**해야 한다. JK도 동일하게 compact summary를 받아 시작한다.

### 2-2. 쟁점 식별

Phase 1.5 compact summary 기준 → 스탠스 거리 + 가중치 합으로 **최대 4개** 쟁점 식별

쟁점 우선순위:
1. 고가중치 이사 간 충돌
2. 준비도 반대 의견 (🟢 vs 🔴)
3. 중간 확신도 이사 — 토론으로 스탠스 변화 가능성 높음

### 2-3. 토론 진행

> **팀 메시지 전달 방식**: 팀원(이사)의 응답은 오케스트레이터(JK)에게 자동 전달된다. 이사가 별도로 `SendMessage`를 호출할 필요 없다. JK만 `SendMessage`로 이사에게 메시지를 보내면 된다.

각 쟁점마다:
1. JK(의장)가 `SendMessage`로 쟁점 A에게 B의 논거를 전달하며 반박 요청
2. A가 응답 (구체적 반론, 3~4문장)
3. B가 재반론 (A의 논거에 직접 반응)
4. **JK가 중재 개입** — 논점을 좁히거나 절충 방향 제시
5. **방관자 이사 1명 지목** — 논점과 가장 관련성 높은 이사에게 의견 요청 (새 관점 투입)
6. 쟁점 이사 중 1명이 스탠스 변경 가능 (조건부 동의 포함)

각 exchange는 **최소 6~8개 messages**를 포함해야 한다.

### 2-4. Round 2 스탠스 확정

토론 결과 반영 → 각 이사 최종 스탠스 확정
전달 컨텍스트: compact summary + 본인 관련 토론 내용만

---

## Phase 2.5: Round 2 이후 이사 재발언

**Round 2 토론을 지켜본 이사 6~7명이 추가 발언한다.** (bubble 형식)

JK가 `SendMessage`로 각 이사에게 Round 2 토론 요약을 전달하며 재발언을 요청한다. 발언하지 않은 이사를 우선 지목한다.

재발언 규칙:
- Round 2 토론에서 제기된 논점에 반응하는 내용 포함 (단순 반복 금지)
- 일부 이사는 스탠스 변경 가능 (`changed: 'up'` 또는 `changed: 'down'`)
- 스탠스 변경 시 반드시 변경 이유 명시
- 발언하지 않은 이사 우선 지목, 재발언 시에도 자신의 고유 관점 유지
- 2~3문장으로 간결하게 (Round 1보다 짧게)

---

## Phase 3: 집계 및 JK 최종 선언

### 3-1. 이사 가중 투표 집계

```
raw_score = Σ(이사 스탠스 점수 × 최종가중치)
준비도   = (raw_score + 1) / 2 → % 표기
동방향   = 최종 스탠스 동일 이사 수 (N/활성 이사 수)
```

스탠스 점수: 🟢 Ready Now = +1, 🟡 Ready in 2Y = 0, 🔴 Not Ready = -1

**비교 심의:** 후보자별로 각각 집계. 국면별 최적 후보도 도출.

### 3-2. JK 최종 선언

`ceo-jk` 에이전트 호출.

전달 내용:
- Phase 1.5 compact summary
- Phase 2 토론 핵심 쟁점 요약
- 3-1 집계 결과
- 선택된 비즈니스 국면

JK는 5단계 필터 적용 → 최종 준비도 확정 + 의장 코멘트 (2~3문장)

**3-3. JK 축별 점수 산출 (스파이더 차트용)**

JK가 각 후보자에 대해 아래 5개 차원 0~100 점수를 직접 산출한다:

- **공통 3축**: `integrity` (신뢰·원칙) / `leadership` (리더십 성숙도) / `growth` (성장 궤도)
- **포지션 특화 2축**: `knowledge/target-profiles/{포지션슬러그}.md`의 `spider_axes` 필드에서 로드

산출 기준: 이사 발언, 토론 쟁점, 후보자 프로파일을 종합해 JK 관점에서 판단. 점수는 소수 없이 정수로.

출력 형식 (후보자마다):
```
radar: { integrity: 82, leadership: 75, growth: 88, {축1슬러그}: 70, {축2슬러그}: 65 }
```

---

## Phase 4: 출력 파일 작성

**`references/output-writer.md`를 반드시 읽고 그 형식을 따른다.**

출력 파일 작성 시 Phase 1.5 compact summary와 Phase 2 토론 내역(오케스트레이터 컨텍스트)을 함께 참조한다.

### 출력 정책
- 파일 위치: `docs/succession/{YYYY-MM-DD}-{HHMM}-{포지션슬러그}.md` **신규 생성** (누적됨)
- 포맷: Vue 컴포넌트 형식, 마지막 줄 `<PositionDebate v-bind="debate" />`

### 출력 포맷: PositionDebate 컴포넌트

`references/output-writer.md`의 컴포넌트 형식 참고. blocks 배열은 **반드시 아래 순서로** 구성한다:

```
1. { type: "section", label: "── Round 1: 이사 초기 평가 ──" }
   → 활성 이사 전원 bubble (스탠스 포함, 각 3~5문장)

2. { type: "section", label: "── Round 2: 핵심 쟁점 대결 ──" }
   → exchange (쟁점별, messages 6~8개 이상, JK 중재 포함)

3. { type: "section", label: "── Round 2 이후 이사 재발언 ──" }
   → bubble 6~7명 (Round 2 논점 반응, 일부 changed 포함)

4. { type: "closing", text: "..." }
   → JK 최종 정리 + 1순위 후보자 의결 선언
```

**비교 심의:** candidates 배열에 후보자 전원 포함 (readiness, readinessScore, radar 스코어, jkComment).

---

## Phase 5: 배포

### 5-1. DebateList.vue ALL_ITEMS 배열 업데이트

`docs/.vitepress/theme/components/DebateList.vue`의 `ALL_ITEMS` 배열 맨 앞에 새 항목 추가:

```js
{
  position: "{포지션명}",
  positionSlug: "{슬러그}",
  date: "{YYYY-MM-DD}",
  time: "{HHMM}",
  decision: "{1순위 후보자명}",
  readiness: "🟢 Ready Now",  // 또는 🟡 Ready in 2Y / 🔴 Not Ready
  readinessScore: 0.83,
  dist: { g: {🟢 Ready Now 후보자 수}, y: {🟡 Ready in 2Y 후보자 수}, r: {🔴 Not Ready 후보자 수} },
  url: "/succession/{YYYY-MM-DD}-{HHMM}-{슬러그}",
},
```

> `dist`는 candidates 배열의 readiness 분포를 집계한다. 전체 후보군의 역량 분포를 리스트 카드에 표시하는 데 사용된다. 계산: `g` = 🟢 Ready Now 후보자 수, `y` = 🟡 Ready in 2Y 후보자 수, `r` = 🔴 Not Ready 후보자 수 (candidates 배열에서 직접 집계).

### 5-2. docs/succession/board/index.md 업데이트

해당 포지션 카드를 심의 결과로 갱신:
- `readiness-pill`: pending → ready-now / ready-2y / not-ready
- `readiness-bar-fill width`: 0% → {readinessScore × 100}%
- `readiness-val`: — → {준비도}%
- `position-card-date`: 심의 기록 없음 → `{YYYY-MM-DD}, 1순위 : {후보자명}`
- 최신 심의 링크: `#` → `/succession/{파일명}`

### 5-3. docs/.vitepress/config.mts — 수정 금지

**개별 심의 페이지 링크를 `/succession/` 사이드바에 추가하지 않는다.**
심의 이력 탐색은 전체 심의 이력 페이지(`/succession/list`)에서만 제공한다.
config.mts는 건드리지 않는다.

### 5-4. Git 커밋 및 배포

커밋 전 반드시 빌드 검증 후 진행한다. 빌드 실패 시 Vercel 배포가 깨진다.

```bash
# 1. 빌드 검증
npm run docs:build

# 2. 성공 확인 후 커밋 & 푸시
git add docs/succession/ docs/.vitepress/theme/components/DebateList.vue docs/succession/board/index.md && git commit -m "feat: {포지션} {날짜}-{HHMM} 이사회 심의 결과" && git push
```

---

## 트리거 예시

```
# 포지션 단위 심의 (기본) — 등록된 CIO 후보 전원 비교
"CIO 심의해줘"
"CIO 이사회 열어"
"CFO 후보들 심의해줘"

# 단독 심의 — 특정 후보 1인 준비도 평가
"손민수 단독 심의해줘"

# 프로파일 생성 + 심의
"CIO 심의해줘. 김철수 후보도 추가해.
현직: SK텔레콤 AI사업본부장, 8년차
경력: AI 서비스 3개 런칭, 연매출 800억 달성
강점: 실행력, 기술-비즈니스 연결
우려: 투자 판단 경험 없음"
```
