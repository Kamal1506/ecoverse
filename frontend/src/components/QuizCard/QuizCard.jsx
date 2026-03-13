import { useNavigate } from 'react-router-dom';
import './QuizCard.css';

const DIFFICULTY = (quiz) => {
  const diff = String(quiz?.difficulty || '').toUpperCase();
  if (diff === 'BEGINNER') return { label: 'BEGINNER', color: 'var(--green)' };
  if (diff === 'INTERMEDIATE') return { label: 'INTERMEDIATE', color: 'var(--yellow)' };
  if (diff === 'EXPERT') return { label: 'EXPERT', color: 'var(--red)' };

  const count = quiz?.questionCount || 0;
  if (count <= 5) return { label: 'EASY', color: 'var(--green)' };
  if (count <= 10) return { label: 'MEDIUM', color: 'var(--yellow)' };
  return { label: 'HARD', color: 'var(--red)' };
};

const ICONS = ['🌍','🌿','♻️','💧','☀️','🌊','🦋','🌱','⚡','🔬'];

export default function QuizCard({ quiz }) {
  const navigate   = useNavigate();
  const diff       = DIFFICULTY(quiz);
  const icon       = ICONS[quiz.id % ICONS.length];

  return (
    <div className="quiz-card" onClick={() => navigate(`/quiz/${quiz.id}`)}>

      <div className="qc-top">
        <div className="qc-icon">{icon}</div>
        <div className="qc-diff" style={{ color: diff.color, borderColor: diff.color }}>
          {diff.label}
        </div>
      </div>

      <div className="qc-title">{quiz.title}</div>

      {quiz.description && (
        <div className="qc-desc">{quiz.description}</div>
      )}

      <div className="qc-footer">
        <div className="qc-stat">
          <span className="qc-stat-n">{quiz.questionCount}</span>
          <span className="qc-stat-l">QUESTIONS</span>
        </div>
        <div className="qc-stat">
          <span className="qc-stat-n" style={{ color: 'var(--yellow)' }}>
            {(quiz.xpReward * quiz.questionCount).toLocaleString()}
          </span>
          <span className="qc-stat-l">MAX XP</span>
        </div>
      </div>

      <div className="qc-play-hint">▶ START MISSION</div>
    </div>
  );
}
