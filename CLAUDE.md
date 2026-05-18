# Succession Agent

## 하네스: 승계 심의위원회

**목표:** C-Suite 후보자를 에이전트 이사회가 심의하고 토론한 결과를 웹으로 출력한다.

**트리거:** "승계 심의", "이사회 열어", "CIO 후보 심의", "succession" 등 C-Suite 후보자 심의 요청 시 `succession-orchestrator` 스킬을 사용하라.

---

## 디자인 규칙

### 폰트
- 전체 폰트: Pretendard (custom.css `--vp-font-family-base`로 body에 적용)
- **한국어가 포함된 모든 UI 요소에 `font-family: var(--vp-font-family-mono)` 적용 금지**
  - `var(--vp-font-family-mono)`는 JetBrains Mono이며 한국어 글리프가 없어 브라우저 기본 폰트로 fallback됨
  - 잘못 적용된 요소: 섹션 타이틀, 후보자 유형 뱃지, 이름 버튼, 레이더 차트 레이블, 준비도 수치, 동방향 텍스트
- 숫자 정렬이 필요한 경우: `font-variant-numeric: tabular-nums`만 사용
- SVG `<text>` 요소는 CSS 상속이 안 되므로 `font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif` 명시

### board/index.md 카드 날짜 형식
`{YYYY-MM-DD}, 1순위 : {후보자명}` — 쉼표와 콜론 사용

---

## 변경 이력
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-14 | 초기 구성 | 전체 | 그릴미 세션 설계 결과 |
| 2026-05-18 | 폰트 규칙 추가 | custom.css | 한국어 요소에 mono 폰트 적용으로 폰트 깨짐 |
