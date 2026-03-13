import { useState, useEffect, useRef, useCallback } from 'react';
import HUD from '../components/HUD/HUD';
import './WaterGame.css';

// Connection sides index: 0=top, 1=right, 2=bottom, 3=left
// Each pipe type has 4 rotation states, each with [top,right,bottom,left] connections
const PIPE_CONN = {
  I: [[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]],   // straight
  L: [[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,0,0]],   // elbow
  T: [[1,1,1,0],[1,1,0,1],[0,1,1,1],[1,0,1,1]],   // T-junction
  S: [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],   // source (connects all)
  H: [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],   // home (connects all)
  E: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],   // empty
};

const LEVELS = [
  { label:'EASY', cols:4, rows:4,
    grid:[
      [{t:'S',r:0,f:true}, {t:'I',r:1,f:false},{t:'L',r:1,f:false},{t:'H',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'L',r:0,f:false},{t:'L',r:3,f:false},{t:'E',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'H',r:0,f:true}, {t:'E',r:0,f:true}, {t:'E',r:0,f:true}],
    ]
  },
  { label:'MEDIUM', cols:5, rows:5,
    grid:[
      [{t:'S',r:0,f:true}, {t:'I',r:1,f:false},{t:'T',r:0,f:false},{t:'I',r:1,f:false},{t:'H',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}, {t:'E',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'L',r:0,f:false},{t:'T',r:2,f:false},{t:'L',r:1,f:false},{t:'E',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'H',r:0,f:true}, {t:'E',r:0,f:true}, {t:'H',r:0,f:true}, {t:'E',r:0,f:true}],
    ]
  },
  { label:'HARD', cols:6, rows:6,
    grid:[
      [{t:'S',r:0,f:true}, {t:'I',r:1,f:false},{t:'T',r:0,f:false},{t:'I',r:1,f:false},{t:'L',r:1,f:false},{t:'H',r:0,f:true}],
      [{t:'E',r:0,f:true}, {t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'E',r:0,f:true}],
      [{t:'L',r:0,f:false},{t:'I',r:1,f:false},{t:'T',r:1,f:false},{t:'L',r:0,f:false},{t:'L',r:3,f:false},{t:'E',r:0,f:true}],
      [{t:'I',r:0,f:false},{t:'E',r:0,f:true}, {t:'I',r:0,f:false},{t:'I',r:0,f:false},{t:'E',r:0,f:true}, {t:'E',r:0,f:true}],
      [{t:'T',r:3,f:false},{t:'I',r:1,f:false},{t:'T',r:2,f:false},{t:'L',r:2,f:false},{t:'E',r:0,f:true}, {t:'E',r:0,f:true}],
      [{t:'H',r:0,f:true}, {t:'E',r:0,f:true}, {t:'H',r:0,f:true}, {t:'E',r:0,f:true}, {t:'E',r:0,f:true},{t:'H',r:0,f:true}],
    ]
  },
];

const CELL = 74;
const D = [[-1,0],[0,1],[1,0],[0,-1]]; // top right bottom left

function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

function floodFill(grid, rows, cols) {
  const lit = Array.from({length:rows}, () => Array(cols).fill(false));
  let sr=0, sc=0;
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++)
    if (grid[r][c].t === 'S') { sr=r; sc=c; }
  const q = [[sr,sc]];
  lit[sr][sc] = true;
  while (q.length) {
    const [r,c] = q.shift();
    for (let s=0; s<4; s++) {
      if (!PIPE_CONN[grid[r][c].t][grid[r][c].r][s]) continue;
      const nr=r+D[s][0], nc=c+D[s][1];
      if (nr<0||nr>=rows||nc<0||nc>=cols) continue;
      if (lit[nr][nc]) continue;
      const opp = (s+2)%4;
      if (PIPE_CONN[grid[nr][nc].t][grid[nr][nc].r][opp]) {
        lit[nr][nc]=true; q.push([nr,nc]);
      }
    }
  }
  return lit;
}

export default function WaterGame() {
  const [lvlIdx,  setLvlIdx]  = useState(0);
  const [grid,    setGrid]    = useState(() => deepCopy(LEVELS[0].grid));
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const canvasRef = useRef(null);

  const lvl = LEVELS[lvlIdx];
  const lit = floodFill(grid, lvl.rows, lvl.cols);

  const totalHomes     = lvl.grid.flat().filter(c=>c.t==='H').length;
  const connectedHomes = (() => {
    let n=0;
    for(let r=0;r<lvl.rows;r++) for(let c=0;c<lvl.cols;c++)
      if(grid[r][c].t==='H' && lit[r][c]) n++;
    return n;
  })();

  const score = Math.max(0, 100 - moves * 5);

  useEffect(() => {
    if (connectedHomes === totalHomes && totalHomes > 0 && !won) {
      setTimeout(() => setWon(true), 300);
    }
  }, [connectedHomes, totalHomes, won]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const PAD = 12;
    const W = PAD*2 + lvl.cols*CELL;
    const H = PAD*2 + lvl.rows*CELL;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,255,136,0.06)';
    ctx.lineWidth = 0.5;
    for(let r=0;r<=lvl.rows;r++){
      ctx.beginPath();ctx.moveTo(PAD,PAD+r*CELL);ctx.lineTo(PAD+lvl.cols*CELL,PAD+r*CELL);ctx.stroke();
    }
    for(let c=0;c<=lvl.cols;c++){
      ctx.beginPath();ctx.moveTo(PAD+c*CELL,PAD);ctx.lineTo(PAD+c*CELL,PAD+lvl.rows*CELL);ctx.stroke();
    }

    for(let r=0;r<lvl.rows;r++) {
      for(let c=0;c<lvl.cols;c++) {
        const cell = grid[r][c];
        if(cell.t==='E') continue;
        const x=PAD+c*CELL, y=PAD+r*CELL;
        const cx=x+CELL/2, cy=y+CELL/2;
        const isLit = lit[r][c];
        const conn = PIPE_CONN[cell.t][cell.r];

        // Cell bg
        if(cell.t==='S'){
          ctx.fillStyle='rgba(255,215,0,0.08)';
        } else if(cell.t==='H'){
          ctx.fillStyle=isLit?'rgba(0,255,136,0.10)':'rgba(255,80,80,0.06)';
        } else {
          ctx.fillStyle=isLit?'rgba(0,229,255,0.06)':'rgba(255,255,255,0.02)';
        }
        ctx.beginPath();ctx.roundRect(x+2,y+2,CELL-4,CELL-4,4);ctx.fill();

        // Pipes
        const pipeColor = isLit ? '#00E5FF' : '#1a3a4a';
        const W_PIPE = 9;
        ctx.strokeStyle = pipeColor;
        ctx.lineWidth = W_PIPE;
        ctx.lineCap = 'round';
        const ends = [[cx,y+2],[x+CELL-2,cy],[cx,y+CELL-2],[x+2,cy]];
        for(let s=0;s<4;s++){
          if(!conn[s]) continue;
          ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ends[s][0],ends[s][1]);ctx.stroke();
        }

        // Center node
        ctx.fillStyle = isLit ? '#00E5FF' : '#1a3a4a';
        ctx.beginPath();ctx.arc(cx,cy,W_PIPE/2,0,Math.PI*2);ctx.fill();

        // Glow on lit pipes
        if(isLit && cell.t!=='E'){
          ctx.strokeStyle='rgba(0,229,255,0.15)';
          ctx.lineWidth=W_PIPE+6;
          for(let s=0;s<4;s++){
            if(!conn[s]) continue;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ends[s][0],ends[s][1]);ctx.stroke();
          }
        }

        // Icons
        ctx.font = '20px serif';
        ctx.textAlign='center';ctx.textBaseline='middle';
        if(cell.t==='S') ctx.fillText('💧',cx,cy);
        else if(cell.t==='H') ctx.fillText(isLit?'🏠':'🏚️',cx,cy);
      }
    }
  }, [grid, lit, lvl]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = (e) => {
    if (won) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const PAD=12;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleX;
    const c = Math.floor((mx - PAD) / CELL);
    const r = Math.floor((my - PAD) / CELL);
    if(r<0||r>=lvl.rows||c<0||c>=lvl.cols) return;
    const cell = grid[r][c];
    if(cell.f || cell.t==='E') return;
    const newGrid = deepCopy(grid);
    newGrid[r][c].r = (newGrid[r][c].r + 1) % 4;
    setGrid(newGrid);
    setMoves(m => m+1);
  };

  const loadLevel = (n) => {
    setLvlIdx(n);
    setGrid(deepCopy(LEVELS[n].grid));
    setMoves(0);
    setWon(false);
  };

  const reset = () => loadLevel(lvlIdx);

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="ww-wrap">

          <div className="ww-header">
            <div className="section-label">// MINI GAME</div>
            <h1 className="ww-title">💧 PIPELINE PUZZLE</h1>
            <p className="ww-sub">Click pipes to rotate them and connect all homes to the water source.</p>
          </div>

          {/* Level selector */}
          <div className="ww-levels">
            {LEVELS.map((l, i) => (
              <button key={i}
                className={`ww-level-btn${lvlIdx===i ? ' active' : ''}`}
                onClick={() => loadLevel(i)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="ww-stats">
            <div className="ww-stat">
              <div className="ww-stat-n">{moves}</div>
              <div className="ww-stat-l">ROTATIONS</div>
            </div>
            <div className="ww-stat">
              <div className="ww-stat-n" style={{ color:'var(--yellow)' }}>{score}</div>
              <div className="ww-stat-l">SCORE</div>
            </div>
            <div className="ww-stat">
              <div className="ww-stat-n" style={{ color: connectedHomes===totalHomes?'var(--green)':'var(--cyan)' }}>
                {connectedHomes}/{totalHomes}
              </div>
              <div className="ww-stat-l">HOMES CONNECTED</div>
            </div>
          </div>

          {/* Win message */}
          {won && (
            <div className="ww-win">
              <div className="ww-win-emoji">💧</div>
              <div className="ww-win-title">
                {score >= 80 ? 'PERFECT FLOW!' : score >= 50 ? 'WATER SAVED!' : 'MISSION COMPLETE!'}
              </div>
              <div className="ww-win-sub">
                All {totalHomes} homes connected in {moves} rotations — score: {score}
              </div>
              <div className="ww-win-btns">
                {lvlIdx < LEVELS.length - 1 && (
                  <button className="btn-primary" onClick={() => loadLevel(lvlIdx+1)}>
                    NEXT LEVEL ▶
                  </button>
                )}
                <button className="btn-ghost" onClick={reset}>RETRY</button>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="ww-canvas-wrap">
            <canvas ref={canvasRef} className="ww-canvas" onClick={handleClick} />
          </div>

          <p className="ww-hint">
            💡 Click any pipe to rotate 90°. Source 💧 and homes 🏠/🏚️ are fixed.
          </p>

          <div style={{ textAlign:'center' }}>
            <button className="btn-ghost" onClick={reset}>RESET LEVEL</button>
          </div>

        </div>
      </div>
    </>
  );
}