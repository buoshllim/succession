# Succession Agent

## 하네스: 승계 심의위원회

**목표:** C-Suite 후보자를 에이전트 이사회가 심의하고 토론한 결과를 웹으로 출력한다.

**실행 방법:** 반드시 `claude --dangerously-skip-permissions` 로 실행할 것. 일반 `claude` 실행 시 tool 승인 중단으로 심의 진행 불가.

**트리거:** "승계 심의", "이사회 열어", "CIO 후보 심의", "succession" 등 C-Suite 후보자 심의 요청 시 `succession-orchestrator` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-14 | 초기 구성 | 전체 | 그릴미 세션 설계 결과 |
