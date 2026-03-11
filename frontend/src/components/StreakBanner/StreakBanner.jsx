import './StreakBanner.css';

const FLAME_COLORS = {
  1: '#aaa', 2: '#aaa', 3: '#FF6B35', 7: '#FFD700'
};

export default function StreakBanner({ streak = 0, longest = 0 }) {
  if (streak === 0) return null;

  const color    = streak >= 7 ? '#FFD700' : streak >= 3 ? '#FF6B35' : '#aaa';
  const multiplier = streak >= 7 ? '2x' : streak >= 3 ? '1.5x' : '1x';
  const days = Array.from({ length: Math.min(streak, 7) });

  return (
    <div className="streak-banner" style={{ '--streak-color': color }}>
      <div className="streak-left">
        <span className="streak-flame">{"\uD83D\uDD25"}</span>
        <div>
          <div className="streak-count">{streak} DAY STREAK</div>
          <div className="streak-sub">Longest: {longest} days</div>
        </div>
      </div>
      <div className="streak-dots">
        {days.map((_, i) => (
          <div key={i} className="streak-dot active"
            style={{ background: color, boxShadow: `0 0 8px ${color}88` }} />
        ))}
        {streak < 7 && Array.from({ length: 7 - streak }).map((_, i) => (
          <div key={`e${i}`} className="streak-dot" />
        ))}
      </div>
      <div className="streak-multiplier" style={{ color }}>
        {multiplier} XP
      </div>
    </div>
  );
}
