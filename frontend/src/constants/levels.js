export const LEVEL_COLORS = Object.freeze({
  6: '#FFD700',
  5: '#FF6B35',
  4: '#00E5FF',
  3: '#00FF88',
  2: '#A0FFB0',
  1: '#5a7a65',
});

export const XP_THRESHOLDS = Object.freeze([0, 500, 1200, 2500, 4500, 7000]);

export function xpToNextLevel(xp, level) {
  if (level >= 6) return 100;
  const next = XP_THRESHOLDS[level];
  const curr = XP_THRESHOLDS[level - 1];
  return Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100));
}

