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
          <input
            type="date"
            class="al-date-input"
            v-model="selectedDate"
            @change="currentPage = 1"
          />
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
          <span class="al-readiness" :class="readinessClass(item.readiness)">{{ item.readiness }}</span>
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
    position: "투자MD",
    positionSlug: "md",
    date: "2026-05-18",
    time: "1500",
    decision: "윤재혁",
    readiness: "🟢 Ready Now",
    readinessScore: 0.885,
    url: "/succession/2026-05-18-1500-md",
  },
  {
    position: "CIO",
    positionSlug: "cio",
    date: "2026-05-18",
    time: "1423",
    decision: "박진우",
    readiness: "🟢 Ready Now",
    readinessScore: 0.83,
    url: "/succession/2026-05-18-1423-cio",
  },
]
// ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15
const selectedPosition = ref('')
const selectedDate     = ref('')
const currentPage      = ref(1)

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

.al-conf { font-size: 12px; font-weight: 700; color: var(--vp-c-text-2); white-space: nowrap; min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
.al-date { font-size: 12px; color: var(--vp-c-text-3); white-space: nowrap; font-variant-numeric: tabular-nums; }

@media (max-width: 480px) {
  .al-row { gap: 7px; padding: 10px 12px; }
  .al-row-decision { display: none; }
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
