<template>
  <div class="wb-wrap">

    <!-- ── 국면 선택 ── -->
    <div class="wb-phase-section">
      <div class="wb-section-label">비즈니스 국면 <span class="wb-section-hint">(멀티 셀렉트 가능)</span></div>
      <div class="wb-phase-tabs">
        <button
          v-for="p in PHASES" :key="p.id"
          class="wb-phase-btn"
          :class="{ active: phases.includes(p.id) }"
          :style="phases.includes(p.id) ? { background: p.color, borderColor: p.color } : {}"
          @click="togglePhase(p.id)"
        >{{ p.label }}</button>
      </div>
      <div class="wb-phase-divider"></div>
      <div v-for="p in activePhases" :key="p.id" class="wb-phase-desc">
        <span class="wb-phase-badge" :style="{ background: p.color + '22', color: p.color }">
          {{ p.label }}
        </span>
        <span class="wb-phase-text">{{ p.desc }}</span>
      </div>
    </div>

    <!-- ── 포지션 탭 ── -->
    <div class="wb-pos-tabs-wrap">
    <div class="wb-pos-tabs">
      <button
        v-for="p in POSITIONS" :key="p.id"
        class="wb-pos-btn"
        :class="{ active: position === p.id }"
        @click="position = p.id"
      >{{ p.label }}</button>
    </div>
    </div>

    <!-- ── 포지션 내용 ── -->
    <div class="wb-pos-panel">
      <div class="wb-pos-header">
        <span class="wb-pos-title">{{ currentPosition.label }}</span>
        <span class="wb-pos-focus">{{ currentPosition.focus }}</span>
      </div>

      <!-- 이사별 가중치 바 -->
      <div class="wb-bars">
        <TransitionGroup name="wb-bar" tag="div" class="wb-bars-inner">
          <div
            v-for="item in sortedBoards"
            :key="item.key"
            class="wb-bar-row"
            :class="{ inactive: item.weight === 0, top3: item.rank <= 3 && item.weight > 0 }"
          >
            <div class="wb-bar-label">
              <img :src="`/board/${item.key}.png`" class="wb-avatar" :alt="item.name" />
              <span class="wb-name">{{ item.name }}</span>
              <span v-if="item.rank <= 3 && item.weight > 0" class="wb-rank-badge">{{ item.isTied ? '공동 ' : '' }}핵심 {{ item.rank }}</span>
            </div>
            <div class="wb-bar-track">
              <div
                class="wb-bar-fill"
                :style="{ width: item.weight > 0 ? (item.weight / maxWeight * 100) + '%' : '0%',
                          background: item.weight === 0 ? '#CBD5E1' : item.rank <= 3 ? item.color : item.color + '55' }"
              ></div>
            </div>
            <div class="wb-bar-value" :class="{ zero: item.weight === 0 }">
              <span v-if="item.delta !== 0" class="wb-delta" :class="item.delta > 0 ? 'up' : 'down'">
                ({{ item.delta > 0 ? '▲' : '▼' }}{{ Math.abs(item.delta * 100).toFixed(0) }})
              </span>
              <span>{{ item.weight > 0 ? (item.weight * 100).toFixed(0) + '%' : '—' }}</span>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- ── 국면 조정 요약 ── -->
    <div v-if="adjustChips.length" class="wb-phase-adjust wb-phase-adjust--bottom">
      <span v-for="chip in adjustChips" :key="chip.key" class="wb-adjust-chip" :class="chip.delta > 0 ? 'up' : 'down'">
        {{ BOARD_NAMES[chip.key] }} {{ chip.delta > 0 ? '▲' : '▼' }}{{ Math.abs(chip.delta * 100).toFixed(0) }}%p
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const phases   = ref<string[]>(['supercycle'])   // 멀티셀렉트
const position = ref('CIO')

const PHASES = [
  {
    id: 'supercycle', label: 'AI·반도체 슈퍼사이클', color: '#047857',
    desc: 'HBM·AI 투자 집행, SK하이닉스 NAV 극대화 구간. AI 비전과 실행력을 우선시한다.',
    adjust: { 'vision-jensen': +0.03, 'innovation-wood': +0.02, 'execution-musk': +0.02, 'principles-dalio': -0.02, 'performance-welch': -0.02, 'lean-sandberg': -0.02 }
  },
  {
    id: 'nav-resolve', label: 'NAV 할인 해소기', color: '#2563EB',
    desc: 'Korea Discount 정책 + 주주환원 공약 집행 구간. 재무·법무·IR 역량을 우선시한다.',
    adjust: { 'integrity-buffett': +0.03, 'inversion-munger': +0.02, 'principles-dalio': +0.02, 'vision-jensen': -0.02, 'innovation-wood': -0.02, 'execution-musk': -0.02 }
  },
  {
    id: 'portfolio', label: '포트폴리오 재편기', color: '#D97706',
    desc: '비핵심 자산(11번가 등) 정리, AI 포트폴리오 집중 구간. 전략·M&A 역량을 우선시한다.',
    adjust: { 'scale-bezos': +0.03, 'transform-nadella': +0.02, 'inversion-munger': +0.02, 'innovation-wood': -0.02, 'vision-jensen': -0.02, 'execution-musk': -0.02 }
  },
  {
    id: 'new-invest', label: '신규 투자 개척기', color: '#7C3AED',
    desc: '적극적인 딜 소싱, 해외 AI 투자 확대 구간. 투자·혁신 역량을 우선시한다.',
    adjust: { 'innovation-wood': +0.03, 'vision-jensen': +0.02, 'execution-musk': +0.02, 'performance-welch': -0.02, 'integrity-buffett': -0.02, 'lean-sandberg': -0.02 }
  },
  {
    id: 'downcycle', label: '다운사이클 대응기', color: '#DC2626',
    desc: '반도체 사이클 전환 시 리스크 관리, 유동성 방어 구간. 원칙·역발상 역량을 우선시한다.',
    adjust: { 'principles-dalio': +0.03, 'inversion-munger': +0.02, 'integrity-buffett': +0.02, 'innovation-wood': -0.03, 'execution-musk': -0.02, 'vision-jensen': -0.02 }
  },
]

const POSITIONS = [
  { id: 'CIO',  label: 'CIO', focus: 'AI 기반 투자 의사결정 · 투자 인프라 · 리스크 관리' },
  { id: 'MD',   label: '투자MD',            focus: '직접 투자 실행 · 포트폴리오 운용 · 딜소싱 · 밸류에이션' },
  { id: 'CAIO', label: 'AI혁신담당',           focus: 'AI 전략 수립 · AI 조직 구축 · 기술-비즈니스 연결' },
  { id: 'AIDT', label: 'AI/DT담당',            focus: 'AI/DT 실행 · 내부 시스템 혁신 · 데이터 전략' },
  { id: 'CISO', label: '정보보호담당',          focus: '사이버 보안 · 정보 보호 체계 · 보안 리스크 관리' },
  { id: 'CSO',  label: '전략담당',             focus: '중장기 전략 · 시장 분석 · M&A · 신사업' },
  { id: 'CFO',  label: '재무담당',             focus: '재무 전략 · 자본 배분 · 투자자 관계' },
  { id: 'CLO',  label: '법무담당',             focus: '법무 리스크 · 컴플라이언스 · 지배구조' },
  { id: 'CIRO', label: 'IR담당',               focus: 'IR 전략 · 투자자 관계 · ESG 공시 · 자본시장 커뮤니케이션' },
  { id: 'CHRO', label: 'HR담당',               focus: '인재 전략 · 조직 문화 · 리더십 개발' },
]

const BASE_WEIGHTS: Record<string, Record<string, number>> = {
  //                         CIO   MD    CFO   CAIO  AIDT  CISO  CHRO  CSO   CLO   CIRO  (각 열 합 = 1.00)
  'vision-jensen':      { CIO:0.22, MD:0.15, CFO:0.00, CAIO:0.24, AIDT:0.21, CISO:0.05, CHRO:0.02, CSO:0.18, CLO:0.00, CIRO:0.05 },
  'scale-bezos':        { CIO:0.18, MD:0.12, CFO:0.12, CAIO:0.10, AIDT:0.12, CISO:0.09, CHRO:0.06, CSO:0.20, CLO:0.02, CIRO:0.20 },
  'integrity-buffett':  { CIO:0.17, MD:0.22, CFO:0.29, CAIO:0.04, AIDT:0.04, CISO:0.16, CHRO:0.11, CSO:0.10, CLO:0.17, CIRO:0.25 },
  'principles-dalio':   { CIO:0.15, MD:0.18, CFO:0.24, CAIO:0.07, AIDT:0.06, CISO:0.27, CHRO:0.09, CSO:0.15, CLO:0.32, CIRO:0.15 },
  'transform-nadella':  { CIO:0.10, MD:0.05, CFO:0.06, CAIO:0.12, AIDT:0.15, CISO:0.05, CHRO:0.25, CSO:0.07, CLO:0.06, CIRO:0.07 },
  'innovation-wood':    { CIO:0.12, MD:0.08, CFO:0.00, CAIO:0.15, AIDT:0.12, CISO:0.00, CHRO:0.00, CSO:0.15, CLO:0.00, CIRO:0.08 },
  'performance-welch':  { CIO:0.05, MD:0.10, CFO:0.08, CAIO:0.04, AIDT:0.04, CISO:0.11, CHRO:0.20, CSO:0.02, CLO:0.08, CIRO:0.05 },
  'inversion-munger':   { CIO:0.01, MD:0.10, CFO:0.18, CAIO:0.02, AIDT:0.04, CISO:0.24, CHRO:0.04, CSO:0.03, CLO:0.29, CIRO:0.08 },
  'execution-musk':     { CIO:0.00, MD:0.00, CFO:0.00, CAIO:0.18, AIDT:0.17, CISO:0.00, CHRO:0.00, CSO:0.05, CLO:0.00, CIRO:0.00 },
  'lean-sandberg':      { CIO:0.00, MD:0.00, CFO:0.03, CAIO:0.04, AIDT:0.05, CISO:0.03, CHRO:0.23, CSO:0.05, CLO:0.06, CIRO:0.07 },
}

const BOARD_META: Record<string, { name: string; color: string }> = {
  'vision-jensen':      { name: 'Vision · Jensen',   color: '#76B900' },
  'scale-bezos':        { name: 'Scale · Bezos',      color: '#FF9900' },
  'integrity-buffett':  { name: 'Integrity · Buffett', color: '#2563EB' },
  'principles-dalio':   { name: 'Principles · Dalio', color: '#475569' },
  'transform-nadella':  { name: 'Transform · Nadella', color: '#00A4EF' },
  'innovation-wood':    { name: 'Innovation · Wood',   color: '#7C3AED' },
  'performance-welch':  { name: 'Performance · Welch', color: '#059669' },
  'inversion-munger': { name: 'Inversion · Munger', color: '#D97706' },
  'execution-musk':     { name: 'Execution · Musk',   color: '#DC2626' },
  'lean-sandberg':      { name: 'Lean · Sandberg',     color: '#14B8A6' },
}

const BOARD_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(BOARD_META).map(([k, v]) => [k, v.name])
)

// 선택된 모든 국면의 조정값을 합산
const combinedAdjust = computed(() => {
  const result: Record<string, number> = {}
  for (const pid of phases.value) {
    const p = PHASES.find(x => x.id === pid)
    if (!p) continue
    for (const [key, val] of Object.entries(p.adjust)) {
      result[key] = (result[key] ?? 0) + (val as number)
    }
  }
  return result
})

const activePhases    = computed(() => PHASES.filter(p => phases.value.includes(p.id)))

// 조정 chips: 0 제외, ▲ 내림차순 → ▼ 오름차순
const adjustChips = computed(() =>
  Object.entries(combinedAdjust.value)
    .filter(([, v]) => Math.round(Math.abs(v) * 100) > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key, delta]) => ({ key, delta }))
)
const currentPosition = computed(() => POSITIONS.find(p => p.id === position.value)!)

function togglePhase(id: string) {
  const idx = phases.value.indexOf(id)
  if (idx === -1) {
    phases.value = [...phases.value, id]
  } else if (phases.value.length > 1) {
    phases.value = phases.value.filter(x => x !== id)
  }
  // 최소 1개 선택 유지
}

function adjustedWeight(key: string, pos: string): number {
  const base  = BASE_WEIGHTS[key]?.[pos] ?? 0
  const delta = combinedAdjust.value[key] ?? 0
  return Math.max(0, base + (base > 0 ? delta : 0))
}

const sortedBoards = computed(() => {
  const pos = position.value
  const items = Object.keys(BASE_WEIGHTS).map(key => {
    const w     = adjustedWeight(key, pos)
    const base  = BASE_WEIGHTS[key]?.[pos] ?? 0
    const delta = w - base
    return {
      key,
      name:    BOARD_META[key].name,
      color:   BOARD_META[key].color,
      weight:  w,
      delta:   Math.abs(delta) > 0.001 ? delta : 0,
      rank:    0,
      isTied:  false,
    }
  })
  items.sort((a, b) => b.weight - a.weight)
  // 공동 순위 처리: 동점이면 같은 순위 부여 (standard competition ranking)
  items.forEach((item, i) => {
    if (item.weight === 0) {
      item.rank = 99
    } else if (i === 0 || item.weight !== items[i - 1].weight) {
      item.rank = i + 1
    } else {
      item.rank = items[i - 1].rank
    }
  })
  // 공동 순위 여부 체크
  const rankCounts: Record<number, number> = {}
  items.forEach(item => { if (item.rank < 99) rankCounts[item.rank] = (rankCounts[item.rank] || 0) + 1 })
  items.forEach(item => { item.isTied = item.rank < 99 && (rankCounts[item.rank] ?? 1) > 1 })
  return items
})

const maxWeight = computed(() =>
  Math.max(...sortedBoards.value.map(i => i.weight), 0.01)
)

</script>

<style scoped>
.wb-wrap {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}

/* ── 국면 섹션 ── */
.wb-phase-section {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}
.wb-section-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.wb-section-hint {
  font-size: 10px;
  font-weight: 400;
  color: var(--vp-c-text-3);
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.75;
}
.wb-phase-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.wb-phase-btn {
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.wb-phase-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.wb-phase-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.wb-phase-desc {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.wb-phase-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.wb-phase-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.wb-phase-divider {
  border-top: 1px solid var(--vp-c-divider);
  margin: 10px 0 8px;
}

.wb-phase-adjust {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}
.wb-phase-adjust--bottom {
  margin-top: 0;
  padding: 20px 24px 20px;
  border-top: 1px solid var(--vp-c-divider);
  gap: 8px;
}
.wb-adjust-chip {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.wb-adjust-chip.up   { background: #DCFCE7; color: #166534; }
.wb-adjust-chip.down { background: #FEE2E2; color: #991B1B; }

/* ── 포지션 탭 ── */
.wb-pos-tabs-wrap {
  position: relative;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}
.wb-pos-tabs-wrap::after {
  content: '›';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, var(--vp-c-bg) 70%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 18px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}
.wb-pos-tabs {
  display: flex;
  padding: 12px 16px 0;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.wb-pos-tabs::-webkit-scrollbar { display: none; }
.wb-pos-btn {
  padding: 5px 9px;
  border-radius: 8px 8px 0 0;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid transparent;
  border-bottom: none;
  background: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.wb-pos-btn:hover { color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); }
.wb-pos-btn.active {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-divider);
  border-bottom-color: var(--vp-c-bg-soft);
  margin-bottom: -1px;
}

/* ── 포지션 패널 ── */
.wb-pos-panel { padding: 20px 24px 24px; }
.wb-pos-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wb-pos-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.wb-pos-focus {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* ── 바 차트 ── */
.wb-bars-inner { display: flex; flex-direction: column; gap: 10px; }
.wb-bar-row {
  display: grid;
  grid-template-columns: 200px 1fr 68px;
  align-items: center;
  gap: 12px;
  transition: opacity 0.3s ease;
}
.wb-bar-row.inactive { opacity: 0.3; }
.wb-bar-row.top3 .wb-name { font-weight: 600; color: var(--vp-c-text-1); }

.wb-bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.wb-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid var(--vp-c-divider);
}
.wb-name {
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wb-rank-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  white-space: nowrap;
  flex-shrink: 0;
}

.wb-bar-track {
  height: 8px;
  background: var(--vp-c-divider);
  border-radius: 4px;
  overflow: hidden;
}
.wb-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
}

.wb-bar-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}
.wb-bar-value.zero { color: var(--vp-c-text-3); font-weight: 400; }
.wb-delta { font-size: 10px; font-weight: 700; }
.wb-delta.up   { color: #166534; }
.wb-delta.down { color: #991B1B; }

/* ── TransitionGroup 애니메이션 ── */
.wb-bar-move        { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.wb-bar-enter-active { transition: all 0.4s ease; }
.wb-bar-leave-active { transition: all 0.3s ease; position: absolute; }
.wb-bar-enter-from, .wb-bar-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── 모바일 ── */
@media (max-width: 640px) {
  .wb-bar-row { grid-template-columns: 140px 1fr 52px; gap: 8px; }
  .wb-name { font-size: 11px; }
  .wb-rank-badge { display: none; }
  .wb-pos-btn { padding: 5px 10px; font-size: 11px; }
}
</style>
