import { useState, useRef, useEffect } from 'react';
import HUD from '../components/HUD/HUD';
import './WasteGame.css';

const ITEMS = [
  { id:1,  name:'Plastic bottle',   icon:'🧴', bin:'recyclable' },
  { id:2,  name:'Banana peel',      icon:'🍌', bin:'organic' },
  { id:3,  name:'Glass bottle',     icon:'🍶', bin:'recyclable' },
  { id:4,  name:'Newspaper',        icon:'📰', bin:'recyclable' },
  { id:5,  name:'Battery',          icon:'🔋', bin:'hazardous' },
  { id:6,  name:'Apple core',       icon:'🍎', bin:'organic' },
  { id:7,  name:'Paint can',        icon:'🪣', bin:'hazardous' },
  { id:8,  name:'Styrofoam cup',    icon:'☕', bin:'landfill' },
  { id:9,  name:'Cardboard box',    icon:'📦', bin:'recyclable' },
  { id:10, name:'Cigarette butt',   icon:'🚬', bin:'landfill' },
  { id:11, name:'Medicine bottle',  icon:'💊', bin:'hazardous' },
  { id:12, name:'Grass clippings',  icon:'🌿', bin:'organic' },
];

const BINS = [
  { id:'recyclable', label:'Recyclable', icon:'♻️',
    color:'rgba(0,229,255,0.08)', border:'rgba(0,229,255,0.35)', text:'var(--cyan)' },
  { id:'organic',    label:'Organic',    icon:'🌱',
    color:'rgba(0,255,136,0.08)', border:'rgba(0,255,136,0.35)', text:'var(--green)' },
  { id:'hazardous',  label:'Hazardous',  icon:'⚠️',
    color:'rgba(255,215,0,0.08)',  border:'rgba(255,215,0,0.35)',  text:'var(--yellow)' },
  { id:'landfill',   label:'Landfill',   icon:'🗑️',
    color:'rgba(160,160,160,0.08)',border:'rgba(160,160,160,0.3)', text:'#aaa' },
];

const BIN_FACTS = {
  recyclable: 'Recyclables get processed into new products, saving raw materials and energy.',
  organic:    'Organic waste becomes compost — natural fertiliser that enriches soil.',
  hazardous:  'Hazardous items need special disposal to prevent soil and water contamination.',
  landfill:   'Landfill items cannot be recycled or composted and are buried underground.',
};

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WasteGame() {
  const [items,      setItems]      = useState(() => shuffle(ITEMS));
  const [placements, setPlacements] = useState({});
  const [selected,   setSelected]   = useState(null);
  const [correct,    setCorrect]     = useState(0);
  const [wrong,      setWrong]       = useState(0);
  const [feedback,   setFeedback]    = useState(null); // { msg, type }
  const [done,       setDone]        = useState(false);
  const [overBin,    setOverBin]     = useState(null);
  const dragId = useRef(null);
  const fbTimer = useRef(null);

  const remaining = items.filter(i => !placements[i.id]);
  const placed    = (binId) => items.filter(i => placements[i.id]?.binId === binId);

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    clearTimeout(fbTimer.current);
    fbTimer.current = setTimeout(() => setFeedback(null), 2200);
  };

  const place = (itemId, binId) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || placements[itemId]) return;
    const isCorrect = item.bin === binId;
    const newPlacements = { ...placements, [itemId]: { binId, correct: isCorrect } };
    setPlacements(newPlacements);
    setSelected(null);
    if (isCorrect) {
      setCorrect(c => c + 1);
      showFeedback(`✓ Correct! ${item.icon} ${item.name} → ${binId}`, 'good');
    } else {
      setWrong(w => w + 1);
      showFeedback(`✗ Wrong! ${item.icon} belongs in ${item.bin}`, 'bad');
    }
    if (Object.keys(newPlacements).length === ITEMS.length) {
      setTimeout(() => setDone(true), 600);
    }
  };

  const reset = () => {
    setItems(shuffle(ITEMS));
    setPlacements({});
    setSelected(null);
    setCorrect(0);
    setWrong(0);
    setFeedback(null);
    setDone(false);
    setOverBin(null);
  };

  const pct = Math.round((correct / ITEMS.length) * 100);

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="wg-wrap">

          {/* Header */}
          <div className="wg-header">
            <div className="section-label">// MINI GAME</div>
            <h1 className="wg-title">♻️ WASTE SORTER</h1>
            <p className="wg-sub">Drag items to the correct bin — or tap an item, then tap a bin.</p>
          </div>

          {/* Stats */}
          <div className="wg-stats">
            <div className="wg-stat">
              <div className="wg-stat-n" style={{ color:'var(--green)' }}>{correct}</div>
              <div className="wg-stat-l">CORRECT</div>
            </div>
            <div className="wg-stat">
              <div className="wg-stat-n" style={{ color:'var(--red)' }}>{wrong}</div>
              <div className="wg-stat-l">WRONG</div>
            </div>
            <div className="wg-stat">
              <div className="wg-stat-n">{remaining.length}</div>
              <div className="wg-stat-l">REMAINING</div>
            </div>
          </div>

          {/* Feedback bar */}
          <div className={`wg-feedback${feedback ? ' show ' + feedback.type : ''}`}>
            {feedback?.msg || ''}
          </div>

          {/* Items pile */}
          {!done && (
            <div className="wg-pile">
              <div className="section-label" style={{ marginBottom:12 }}>// ITEMS TO SORT</div>
              <div className="wg-items">
                {remaining.map(item => (
                  <div
                    key={item.id}
                    className={`wg-item${selected === item.id ? ' wg-selected' : ''}`}
                    draggable
                    onDragStart={() => { dragId.current = item.id; }}
                    onDragEnd={() => { dragId.current = null; }}
                    onClick={() => setSelected(selected === item.id ? null : item.id)}
                  >
                    <span className="wg-item-icon">{item.icon}</span>
                    <span className="wg-item-name">{item.name}</span>
                  </div>
                ))}
                {remaining.length === 0 && (
                  <div className="wg-pile-empty">All items sorted!</div>
                )}
              </div>
            </div>
          )}

          {/* Bins */}
          <div className="wg-bins">
            {BINS.map(bin => (
              <div
                key={bin.id}
                className={`wg-bin${overBin === bin.id ? ' wg-bin-over' : ''}`}
                style={{
                  background: bin.color,
                  borderColor: overBin === bin.id ? bin.text : bin.border,
                }}
                onDragOver={e => { e.preventDefault(); setOverBin(bin.id); }}
                onDragLeave={() => setOverBin(null)}
                onDrop={e => {
                  e.preventDefault();
                  setOverBin(null);
                  if (dragId.current) place(dragId.current, bin.id);
                }}
                onClick={() => { if (selected) place(selected, bin.id); }}
              >
                <div className="wg-bin-title" style={{ color: bin.text }}>
                  <span>{bin.icon}</span> {bin.label}
                </div>
                <div className="wg-bin-items">
                  {placed(bin.id).map(item => (
                    <div
                      key={item.id}
                      className={`wg-chip${placements[item.id]?.correct ? ' wg-chip-ok' : ' wg-chip-err'}`}
                    >
                      {item.icon} {item.name}
                    </div>
                  ))}
                </div>
                {!done && (
                  <div className="wg-bin-fact">{BIN_FACTS[bin.id]}</div>
                )}
              </div>
            ))}
          </div>

          {/* Result */}
          {done && (
            <div className="wg-result">
              <div className="wg-result-emoji">
                {pct === 100 ? '🌍' : pct >= 75 ? '♻️' : pct >= 50 ? '🌱' : '📚'}
              </div>
              <div className="wg-result-title">
                {pct === 100 ? 'PERFECT SORT!'
                  : pct >= 75 ? 'GREAT JOB!'
                  : pct >= 50 ? 'GOOD EFFORT!'
                  : 'KEEP PRACTISING!'}
              </div>
              <div className="wg-result-score">
                {correct} / {ITEMS.length} correct — {pct}% accuracy
              </div>
              <button className="btn-primary" onClick={reset}>PLAY AGAIN</button>
            </div>
          )}

          {!done && (
            <div style={{ textAlign:'center', marginTop:24 }}>
              <button className="btn-ghost" onClick={reset}>RESET</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}