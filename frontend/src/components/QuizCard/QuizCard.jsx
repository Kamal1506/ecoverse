import { useNavigate } from 'react-router-dom';
import './QuizCard.css';

const DIFF_MAP = {
  easy:   { label: 'EASY',   cls: 'diff-easy',   min: 0,   max: 5  },
  medium: { label: 'MED',    cls: 'diff-med',    min: 6,   max: 10 },
  hard:   { label: 'HARD',   cls: 'diff-hard',   min: 11,  max: 999 },
};

// Derive difficulty from question count
function getDifficulty(questionCount) {
  if (questionCount <= 5)  return DIFF_MAP.easy;
  if (questionCount <= 10) return DIFF_MAP.medium;
  return DIFF_MAP.hard;
}

const ICONS = ['♻️','🌍','🌿','💨','🌊','🌱','☀️','🦋','🌡️','🏔️'];
function getIcon(id) { return ICONS[id % ICONS.length]; }

export default function QuizCard({ quiz }) {
  const navigate   = useNavigate();
  const difficulty = getDifficulty(quiz.questionCount);

  return (
    <div className="quiz-card" onClick={() => navigate(`/quiz/${quiz.id}`)}>

      {/* Difficulty badge */}
      <span className={`quiz-diff ${difficulty.cls}`}>{difficulty.label}</span>

      {/* Title */}
      <div className="quiz-name">
        {getIcon(quiz.id)} {quiz.title}
      </div>

      {/* Description */}
      {quiz.description && (
        <div className="quiz-desc">{quiz.description}</div>
      )}

      {/* Meta row */}
      <div className="quiz-meta">
        <span>{quiz.questionCount} Questions</span>
        <span className="quiz-xp">⬡ {quiz.xpReward * quiz.questionCount} MAX XP</span>
      </div>

      {/* Hover arrow */}
      <div className="quiz-arrow">▶</div>
    </div>
  );
}