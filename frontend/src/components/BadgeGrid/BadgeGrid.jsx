import './BadgeGrid.css';

const RARITY_COLORS = {
  COMMON: '#5a7a65', RARE: '#00E5FF', EPIC: '#FF6B35', LEGENDARY: '#FFD700'
};

export default function BadgeGrid({ badges = [] }) {
  if (badges.length === 0) return null;
  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <div className="badge-section">
      <div className="section-label">// BADGES ({earned.length}/{badges.length})</div>
      <div className="badge-grid">
        {[...earned, ...locked].map(badge => {
          const color = RARITY_COLORS[badge.rarity] || '#5a7a65';
          return (
            <div key={badge.id}
              className={`badge-card${badge.earned ? ' earned' : ' locked'}`}
              style={{ '--badge-color': color }}
              title={badge.description}>
              <div className="badge-icon">{badge.earned ? badge.icon : '\uD83D\uDD12'}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-rarity" style={{ color }}>{badge.rarity}</div>
              {!badge.earned && (
                <div className="badge-locked-desc">{badge.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}