<template>
  <div class="al-wrap">

    <!-- 포지션 필터 칩 -->
    <div class="al-filter-section">
      <div class="al-chips">
        <button
          v-for="chip in positionChips"
          :key="chip.id"
          :class="['al-chip', { active: selectedPosition === chip.id }]"
          @click="selectPosition(chip.id)"
        >{{ chip.label }}</button>
      </div>
      <div class="al-filter-row">
        <div class="al-date-wrap">
          <button
            :class="['al-date-all', { active: !selectedDate }]"
            @click="selectedDate = ''; currentPage = 1"
          >전체 날짜</button>
          <div class="cal-toggle-wrap">
            <button class="cal-toggle-btn" @click="calOpen = !calOpen">
              {{ selectedDate || '날짜 선택' }}
              <span class="cal-arrow">{{ calOpen ? '▲' : '▼' }}</span>
            </button>
            <div v-if="calOpen" class="cal-popup">
              <div class="cal-nav">
                <button class="cal-nav-btn" @click="calPrevMonth">‹</button>
                <span class="cal-title">{{ calYear }}년 {{ calMonth + 1 }}월</span>
                <button class="cal-nav-btn" @click="calNextMonth">›</button>
              </div>
              <div class="cal-grid">
                <div v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow">{{ d }}</div>
                <div
                  v-for="cell in calCells"
                  :key="cell.key"
                  :class="['cal-cell', {
                    'cal-empty': !cell.day,
                    'cal-has': cell.hasDebate,
                    'cal-none': cell.day && !cell.hasDebate,
                    'cal-selected': selectedDate === cell.dateStr,
                  }]"
                  @click="cell.hasDebate && selectDate(cell.dateStr)"
                >{{ cell.day || '' }}</div>
              </div>
            </div>
          </div>
        </div>
        <span class="al-count">{{ filteredItems.length }}건</span>
      </div>
    </div>

    <!-- 빈 결과 -->
    <div v-if="!pagedItems.length" class="al-state">해당 조건의 심의 기록이 없습니다.</div>

    <!-- 리스트 -->
    <div v-else class="al-list">
      <a
        v-for="item in pagedItems"
        :key="item.url"
        :href="item.url"
        class="al-row"
      >
        <span class="al-row-name">{{ item.position }}</span>
        <span class="al-row-decision"><span class="al-decision-label">1순위 후보자</span> {{ item.decision }}</span>
        <div class="al-right">
          <span class="al-dist">
            <span class="dist-pill dist-g">🟢 Now: {{ item.dist.g }}</span>
            <span class="dist-pill dist-y">🟡 in 2Y: {{ item.dist.y }}</span>
            <span class="dist-pill dist-r">🔴 Not: {{ item.dist.r }}</span>
          </span>
          <span class="al-conf">{{ Math.round(item.readinessScore * 100) }}%</span>
          <span class="al-date">{{ item.date }} {{ item.time.slice(0,2) }}:{{ item.time.slice(2) }}</span>
        </div>
      </a>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="al-pager">
      <button class="al-pager-btn" :disabled="currentPage <= 1" @click="currentPage--">‹ 이전</button>
      <span class="al-pager-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="al-pager-btn" :disabled="currentPage >= totalPages" @click="currentPage++">다음 ›</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'

const POSITIONS = [
  { id: '',     label: '전체' },
  { id: 'CIO',     label: 'CIO' },
  { id: '투자MD',  label: '투자MD' },
  { id: 'AI혁신담당', label: 'AI혁신담당' },
  { id: 'AI/DT담당', label: 'AI/DT담당' },
  { id: '전략담당', label: '전략담당' },
  { id: '재무담당', label: '재무담당' },
  { id: '법무담당', label: '법무담당' },
  { id: 'IR담당',  label: 'IR담당' },
  { id: 'HR담당',  label: 'HR담당' },
  { id: '정보보호담당', label: '정보보호담당' },
]

// ── 심의 데이터 (심의 완료 시 SKILL이 여기에 추가) ──────────────
const ALL_ITEMS = [
  {
    position: "HR담당",
    positionSlug: "chro",
    date: "2026-05-20",
    time: "1630",
    decision: "손민수",
    readiness: "🟢 Ready Now",
    readinessScore: 0.97,
    dist: { g: 1, y: 2, r: 2 },
    url: "/succession/2026-05-20-1630-chro",
  },
  {
    position: "투자MD",
    positionSlug: "md",
    date: "2026-05-20",
    time: "0240",
    decision: "윤재혁",
    readiness: "🟢 Ready Now",
    readinessScore: 1.00,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-20-0240-md",
  },
  {
    position: "HR담당",
    positionSlug: "chro",
    date: "2026-05-20",
    time: "0109",
    decision: "손민수",
    readiness: "🟢 Ready Now",
    readinessScore: 0.97,
    dist: { g: 1, y: 2, r: 2 },
    url: "/succession/2026-05-20-0109-chro",
  },
  {
    position: "정보보호담당",
    positionSlug: "ciso",
    date: "2026-05-18",
    time: "1550",
    decision: "문성호",
    readiness: "🟢 Ready Now",
    readinessScore: 0.87,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-18-1550-ciso",
  },
  {
    position: "HR담당",
    positionSlug: "chro",
    date: "2026-05-18",
    time: "1545",
    decision: "손민수",
    readiness: "🟢 Ready Now",
    readinessScore: 0.88,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-18-1545-chro",
  },
  {
    position: "IR담당",
    positionSlug: "ciro",
    date: "2026-05-18",
    time: "1540",
    decision: "엄태윤",
    readiness: "🟢 Ready Now",
    readinessScore: 0.88,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-18-1540-ciro",
  },
  {
    position: "법무담당",
    positionSlug: "clo",
    date: "2026-05-18",
    time: "1535",
    decision: "허준영",
    readiness: "🟢 Ready Now",
    readinessScore: 0.88,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-18-1535-clo",
  },
  {
    position: "재무담당",
    positionSlug: "cfo",
    date: "2026-05-18",
    time: "1530",
    decision: "심재원",
    readiness: "🟢 Ready Now",
    readinessScore: 0.875,
    dist: { g: 2, y: 2, r: 1 },
    url: "/succession/2026-05-18-1530-cfo",
  },
  {
    position: "전략담당",
    positionSlug: "cso",
    date: "2026-05-18",
    time: "1525",
    decision: "고은서",
    readiness: "🟢 Ready Now",
    readinessScore: 0.95,
    dist: { g: 1, y: 1, r: 3 },
    url: "/succession/2026-05-18-1525-cso",
  },
  {
    position: "AI/DT담당",
    positionSlug: "aidt",
    date: "2026-05-18",
    time: "1520",
    decision: "장민호",
    readiness: "🟢 Ready Now",
    readinessScore: 0.97,
    dist: { g: 2, y: 2, r: 1 },
    url: "/succession/2026-05-18-1520-aidt",
  },
  {
    position: "AI혁신담당",
    positionSlug: "caio",
    date: "2026-05-18",
    time: "1515",
    decision: "오현우",
    readiness: "🟢 Ready Now",
    readinessScore: 0.82,
    dist: { g: 2, y: 2, r: 2 },
    url: "/succession/2026-05-18-1515-caio",
  },
  {
    position: "투자MD",
    positionSlug: "md",
    date: "2026-05-18",
    time: "1500",
    decision: "윤재혁",
    readiness: "🟢 Ready Now",
    readinessScore: 0.885,
    dist: { g: 2, y: 2, r: 1 },
    url: "/succession/2026-05-18-1500-md",
  },
  {
    position: "CIO",
    positionSlug: "cio",
    date: "2026-05-19",
    time: "1835",
    decision: "정혜원",
    readiness: "🟢 Ready Now",
    readinessScore: 0.865,
    dist: { g: 1, y: 2, r: 2 },
    url: "/succession/2026-05-19-1835-cio",
  },
  {
    position: "CIO",
    positionSlug: "cio",
    date: "2026-05-18",
    time: "1423",
    decision: "박진우",
    readiness: "🟢 Ready Now",
    readinessScore: 0.83,
    dist: { g: 1, y: 3, r: 1 },
    url: "/succession/2026-05-18-1423-cio",
  },
]
// ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15
const selectedPosition = ref('')
const selectedDate     = ref('')
const currentPage      = ref(1)

// ── 커스텀 캘린더 ─────────────────────────────────────────────────
const debateDateSet = new Set(ALL_ITEMS.map(i => i.date))

const now = new Date()
const calYear  = ref(now.getFullYear())
const calMonth = ref(now.getMonth())   // 0-based
const calOpen  = ref(false)

function calPrevMonth() {
  if (calMonth.value === 0) { calYear.value--; calMonth.value = 11 }
  else calMonth.value--
}
function calNextMonth() {
  if (calMonth.value === 11) { calYear.value++; calMonth.value = 0 }
  else calMonth.value++
}

const calCells = computed(() => {
  const y = calYear.value
  const m = calMonth.value
  const firstDow = new Date(y, m, 1).getDay()   // 0=일
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push({ key: `e${i}`, day: 0 })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ key: dateStr, day: d, dateStr, hasDebate: debateDateSet.has(dateStr) })
  }
  return cells
})

function selectDate(dateStr) {
  selectedDate.value = dateStr
  currentPage.value = 1
  calOpen.value = false
}

// 달력 외부 클릭 시 닫기
function onDocClick(e) {
  if (!e.target.closest('.cal-toggle-wrap')) calOpen.value = false
}
onMounted(() => {
  if (typeof document !== 'undefined') document.addEventListener('click', onDocClick)
})
// ─────────────────────────────────────────────────────────────────

const vpRoute = useRoute()
const positionChips = POSITIONS

function selectPosition(id) {
  selectedPosition.value = id
  currentPage.value = 1
}

function applyQueryFilter() {
  if (typeof window === 'undefined') return
  const p = new URLSearchParams(window.location.search).get('position') ?? ''
  selectedPosition.value = POSITIONS.some(pos => pos.id === p) ? p : ''
  currentPage.value = 1
}

// VitePress의 route.path는 페이지 전환 시 반응적으로 변경됨
// URL 업데이트(history.pushState)는 컴포넌트 마운트 전에 완료되므로
// watch가 발화할 때 window.location.search는 이미 새 쿼리를 담고 있음
watch(() => vpRoute.path, applyQueryFilter, { immediate: true })
onMounted(applyQueryFilter)

function readinessClass(r) {
  if (r.includes('Ready Now')) return 'pill-ready-now'
  if (r.includes('2Y'))        return 'pill-ready-2y'
  return 'pill-not-ready'
}

const filteredItems = computed(() =>
  ALL_ITEMS.filter(item => {
    if (selectedPosition.value && item.position !== selectedPosition.value) return false
    if (selectedDate.value     && item.date     !== selectedDate.value)     return false
    return true
  }).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)))

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredItems.value.slice(start, start + PAGE_SIZE)
})
</script>

<style scoped>
.al-wrap { margin: 24px 0 40px; }

.al-filter-section { margin-bottom: 20px; }
.al-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.al-chip {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.al-chip:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.al-chip.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }

.al-filter-row { display: flex; align-items: center; gap: 10px; }
.al-date-wrap { display: flex; align-items: center; gap: 8px; }
.al-date-input {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.al-date-input:focus { border-color: var(--vp-c-brand-1); }
.al-date-all {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.al-date-all:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.al-date-all.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }
.al-count { font-size: 12px; color: var(--vp-c-text-3); margin-left: auto; }

/* ── 커스텀 캘린더 ─────────────────────────────────────────── */
.cal-toggle-wrap { position: relative; }
.cal-toggle-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.cal-toggle-btn:hover { border-color: var(--vp-c-brand-1); }
.cal-arrow { font-size: 10px; color: var(--vp-c-text-3); }
.cal-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 12px;
  min-width: 224px;
}
.cal-nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.cal-title { font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); }
.cal-nav-btn {
  background: none; border: none; cursor: pointer;
  color: var(--vp-c-text-2); font-size: 16px; padding: 2px 6px;
  border-radius: 4px;
}
.cal-nav-btn:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.cal-dow {
  text-align: center; font-size: 11px; font-weight: 600;
  color: var(--vp-c-text-3); padding: 4px 0;
}
.cal-cell {
  text-align: center; font-size: 12px;
  padding: 5px 2px; border-radius: 6px;
  line-height: 1;
}
.cal-empty { background: none; }
.cal-has {
  color: var(--vp-c-text-1);
  font-weight: 700;
  cursor: pointer;
}
.cal-has:hover { background: var(--vp-c-bg-soft); }
.cal-none {
  color: var(--vp-c-text-3);
  cursor: default;
}
.cal-selected {
  background: var(--vp-c-brand-1) !important;
  color: #fff !important;
}
/* ──────────────────────────────────────────────────────────── */

.al-state { padding: 48px 0; text-align: center; color: var(--vp-c-text-3); font-size: 14px; }

.al-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.al-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  text-decoration: none !important;
  transition: all 0.16s ease;
}
.al-row:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 10px rgba(0,100,255,0.07);
  background: var(--vp-c-bg-soft);
}
.al-row-name { font-size: 14px; font-weight: 700; color: var(--vp-c-text-1); white-space: nowrap; min-width: 80px; }
.al-row-decision { font-size: 13px; color: var(--vp-c-text-1); white-space: nowrap; }
.al-decision-label { color: var(--vp-c-text-3); font-size: 12px; margin-right: 2px; }
.al-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }

.al-readiness {
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  padding: 2px 10px;
  white-space: nowrap;
}
.pill-ready-now { background: rgba(34,197,94,0.1); color: #16A34A; }
.pill-ready-2y  { background: rgba(245,158,11,0.1); color: #D97706; }
.pill-not-ready { background: rgba(239,68,68,0.1);  color: #DC2626; }

.al-dist { display: flex; align-items: center; gap: 4px; }
.dist-pill { font-size: 11px; font-weight: 600; border-radius: 999px; padding: 2px 8px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.dist-g { background: rgba(34,197,94,0.12); color: #16A34A; }
.dist-y { background: rgba(245,158,11,0.12); color: #D97706; }
.dist-r { background: rgba(239,68,68,0.12); color: #DC2626; }

.al-conf { font-size: 12px; font-weight: 700; color: var(--vp-c-text-2); white-space: nowrap; min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
.al-date { font-size: 12px; color: var(--vp-c-text-3); white-space: nowrap; font-variant-numeric: tabular-nums; }

@media (max-width: 480px) {
  .al-row { gap: 7px; padding: 10px 12px; }
  .al-row-decision { display: none; }
  .al-dist { display: none; }
  .al-date { display: none; }
}

.al-pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
.al-pager-btn {
  padding: 7px 18px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.al-pager-btn:disabled { opacity: 0.35; cursor: default; }
.al-pager-btn:not(:disabled):hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.al-pager-info { font-size: 13px; color: var(--vp-c-text-2); }
</style>
