export const RANK_CONFIG = Object.freeze({
  S: { label: 'LEGENDARY', color: '#FFD700', glow: 'rgba(255,215,0,0.4)', emoji: '\uD83D\uDC51' },
  A: { label: 'EXCELLENT', color: '#00FF88', glow: 'rgba(0,255,136,0.35)', emoji: '\uD83C\uDF3F' },
  B: { label: 'GOOD JOB', color: '#00E5FF', glow: 'rgba(0,229,255,0.3)', emoji: '\u267B\uFE0F' },
  C: { label: 'KEEP GOING', color: '#FF6B35', glow: 'rgba(255,107,53,0.3)', emoji: '\uD83D\uDCAA' },
});

export const RANK_COLORS = Object.freeze({
  S: RANK_CONFIG.S.color,
  A: RANK_CONFIG.A.color,
  B: RANK_CONFIG.B.color,
  C: RANK_CONFIG.C.color,
});

export function getRankConfig(rank) {
  return RANK_CONFIG[rank] || RANK_CONFIG.C;
}

