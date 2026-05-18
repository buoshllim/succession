import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Succession Agent',
  description: 'AI 이사회 기반 C-Suite 승계 심의 기록',
  lang: 'ko-KR',
  appearance: true,
  themeConfig: {
    nav: [
      {
        text: '심의 이력',
        items: [
          { text: '전체 심의 이력 →', link: '/succession/list' },
        ]
      },
      {
        text: '에이전트 이사회',
        items: [
          { text: '🏛️ 이사회 현황', link: '/succession/board/' },
          { text: '👥 이사회 멤버', link: '/succession/members/' },
          { text: '📐 운영 철학과 기준', link: '/succession/board/principles' },
        ]
      },
    ],
    sidebar: {
      '/succession/': [
        {
          text: '심의 이력',
          items: [
            { text: '전체 심의 이력 →', link: '/succession/list' },
          ]
        }
      ],
      '/succession/board/principles': [
        {
          text: '에이전트 이사회',
          items: [
            { text: '🏛️ 이사회 현황', link: '/succession/board/' },
            { text: '👥 이사회 멤버', link: '/succession/members/' },
            { text: '📐 운영 철학과 기준', link: '/succession/board/principles' },
          ]
        },
        {
          text: '이사회 의장',
          items: [
            { text: 'JK (CEO)', link: '/succession/members/jk' },
          ]
        },
        {
          text: '에이전트 이사 (10인)',
          items: [
            { text: 'Jensen Huang', link: '/succession/members/vision-jensen' },
            { text: 'Jeff Bezos', link: '/succession/members/scale-bezos' },
            { text: 'Warren Buffett', link: '/succession/members/integrity-buffett' },
            { text: 'Ray Dalio', link: '/succession/members/principles-dalio' },
            { text: 'Satya Nadella', link: '/succession/members/transform-nadella' },
            { text: 'Cathie Wood', link: '/succession/members/innovation-wood' },
            { text: 'Jack Welch', link: '/succession/members/performance-welch' },
            { text: 'Charlie Munger', link: '/succession/members/inversion-munger' },
            { text: 'Elon Musk', link: '/succession/members/execution-musk' },
            { text: 'Sheryl Sandberg', link: '/succession/members/lean-sandberg' },
          ]
        }
      ],
      '/succession/board/': [
        {
          text: '에이전트 이사회',
          items: [
            { text: '🏛️ 이사회 현황', link: '/succession/board/' },
            { text: '👥 이사회 멤버', link: '/succession/members/' },
            { text: '📐 운영 철학과 기준', link: '/succession/board/principles' },
          ]
        },
        {
          text: '포지션별 이사회 기록',
          items: [
            { text: 'CIO', link: '/succession/debate/cio' },
            { text: '투자MD', link: '/succession/debate/md' },
            { text: 'AI혁신담당', link: '/succession/debate/caio' },
            { text: 'AI/DT담당', link: '/succession/debate/aidt' },
            { text: '정보보호담당', link: '/succession/debate/ciso' },
            { text: '전략담당', link: '/succession/debate/cso' },
            { text: '재무담당', link: '/succession/debate/cfo' },
            { text: '법무담당', link: '/succession/debate/clo' },
            { text: 'IR담당', link: '/succession/debate/ciro' },
            { text: 'HR담당', link: '/succession/debate/chro' },
          ]
        }
      ],
      '/succession/debate/': [
        {
          text: '에이전트 이사회',
          items: [
            { text: '🏛️ 이사회 현황', link: '/succession/board/' },
            { text: '👥 이사회 멤버', link: '/succession/members/' },
            { text: '📐 운영 철학과 기준', link: '/succession/board/principles' },
          ]
        },
        {
          text: '포지션별 이사회 기록',
          items: [
            { text: 'CIO', link: '/succession/debate/cio' },
            { text: '투자MD', link: '/succession/debate/md' },
            { text: 'AI혁신담당', link: '/succession/debate/caio' },
            { text: 'AI/DT담당', link: '/succession/debate/aidt' },
            { text: '정보보호담당', link: '/succession/debate/ciso' },
            { text: '전략담당', link: '/succession/debate/cso' },
            { text: '재무담당', link: '/succession/debate/cfo' },
            { text: '법무담당', link: '/succession/debate/clo' },
            { text: 'IR담당', link: '/succession/debate/ciro' },
            { text: 'HR담당', link: '/succession/debate/chro' },
          ]
        }
      ],
      '/succession/members/': [
        {
          text: '에이전트 이사회',
          items: [
            { text: '🏛️ 이사회 현황', link: '/succession/board/' },
            { text: '👥 이사회 멤버', link: '/succession/members/' },
            { text: '📐 운영 철학과 기준', link: '/succession/board/principles' },
          ]
        },
        {
          text: '이사회 의장',
          items: [
            { text: 'JK (CEO)', link: '/succession/members/jk' },
          ]
        },
        {
          text: '에이전트 이사 (10인)',
          items: [
            { text: 'Jensen Huang', link: '/succession/members/vision-jensen' },
            { text: 'Jeff Bezos', link: '/succession/members/scale-bezos' },
            { text: 'Warren Buffett', link: '/succession/members/integrity-buffett' },
            { text: 'Ray Dalio', link: '/succession/members/principles-dalio' },
            { text: 'Satya Nadella', link: '/succession/members/transform-nadella' },
            { text: 'Cathie Wood', link: '/succession/members/innovation-wood' },
            { text: 'Jack Welch', link: '/succession/members/performance-welch' },
            { text: 'Charlie Munger', link: '/succession/members/inversion-munger' },
            { text: 'Elon Musk', link: '/succession/members/execution-musk' },
            { text: 'Sheryl Sandberg', link: '/succession/members/lean-sandberg' },
          ]
        }
      ]
    },
    aside: false,
    socialLinks: [],
    footer: {
      copyright: '© 2026 Succession Agent · Powered by S'
    }
  }
})
