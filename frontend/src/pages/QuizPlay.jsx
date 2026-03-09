import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import OptionButton from '../components/OptionButton/OptionButton';
import { useXpPopups } from '../components/XpPopup/XpPopup';
import '../components/XpPopup/XpPopup.css';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './QuizPlay.css';

const SECONDS_PER_QUESTION = 30;

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateXp } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [answers, setAnswers] = useState({});
  const [sessionXp, setSessionXp] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const answeredRef = useRef(false);
  const optionRef = useRef(null);
  const { spawnXp, PopupLayer } = useXpPopups();

  useEffect(() => {
    const load = async () => {
      try {
        const qRes = await api.get(`/quizzes/${id}/questions`);
        const listRes = await api.get('/quizzes');
        const quiz = listRes.data.find((q) => String(q.id) === String(id));
        if (quiz) setQuizTitle(quiz.title);

        setQuestions(qRes.data);
      } catch {
        toast.error('Failed to load quiz');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleTimeout = useCallback(() => {
    if (answeredRef.current) return;

    answeredRef.current = true;
    setAnswered(true);
    setSelected(null);

    setAnswers((prev) => {
      const q = questions[qIdx];
      if (!q) return prev;
      return { ...prev, [q.id]: '__TIMEOUT__' };
    });

    toast("Time's up!", { icon: '?' });
  }, [questions, qIdx]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    answeredRef.current = false;
    setAnswered(false);
    setSelected(null);
    setTimeLeft(SECONDS_PER_QUESTION);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [qIdx, loading, questions.length, handleTimeout]);

  const handleSelect = (letter) => {
    if (answeredRef.current) return;
    setSelected(letter);
  };

  const handleConfirmAnswer = async () => {
    if (answeredRef.current) return;
    if (!selected) {
      toast('Select an option first');
      return;
    }

    clearInterval(timerRef.current);
    answeredRef.current = true;
    setAnswered(true);

    const q = questions[qIdx];
    const nextAnswers = { ...answers, [q.id]: selected };
    setAnswers(nextAnswers);

    const bonus = Math.floor(50 + (timeLeft / SECONDS_PER_QUESTION) * 30);
    setSessionXp((x) => x + bonus);

    const rect = optionRef.current?.getBoundingClientRect();
    if (rect) spawnXp(bonus, rect.left + rect.width / 2, rect.top + 40);

    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      return;
    }
    await submitAttempt(nextAnswers);
  };

  const handleNext = async () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
    } else {
      await submitAttempt();
    }
  };

  const submitAttempt = async (answersSnapshot = answers) => {
    setSubmitting(true);
    try {
      const answersMap = {};
      Object.entries(answersSnapshot).forEach(([qId, letter]) => {
        if (letter !== '__TIMEOUT__') {
          answersMap[Number(qId)] = letter;
        }
      });

      const { data } = await api.post(`/quizzes/${id}/attempt`, {
        answers: answersMap,
      });

      updateXp(data.xpEarned);
      navigate('/result', { state: { result: data, quizTitle, quizId: id } });
    } catch {
      toast.error('Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <HUD />
        <div className="quiz-loading">
          <div className="quiz-loading-spinner" />
          <span>LOADING MISSION...</span>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <HUD />
        <div className="quiz-loading">
          <span style={{ color: 'var(--red)' }}>This quiz has no questions.</span>
        </div>
      </>
    );
  }

  const q = questions[qIdx];
  const progress = ((qIdx + 1) / questions.length) * 100;
  const isWarn = timeLeft <= 10;

  const options = [
    { letter: 'A', text: q.optionA },
    { letter: 'B', text: q.optionB },
    { letter: 'C', text: q.optionC },
    { letter: 'D', text: q.optionD },
  ];

  return (
    <>
      <HUD />
      <PopupLayer />

      <div className="quiz-play-wrap">
        <div className="quiz-topbar">
          <div className="quiz-progress-wrap">
            <div className="quiz-progress-label">
              <span className="mono" style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>
                {quizTitle}
              </span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)' }}>
                {qIdx + 1} / {questions.length}
              </span>
            </div>
            <div className="quiz-progress-track">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={`quiz-timer${isWarn ? ' warn' : ''}`}>
            {String(timeLeft).padStart(2, '0')}
            <span className="quiz-timer-s">s</span>
          </div>
        </div>

        {sessionXp > 0 && <div className="session-xp">+{sessionXp} XP this session</div>}

        <div className="quiz-q-num">// QUESTION {qIdx + 1}</div>
        <div className="quiz-q-text">{q.questionText}</div>

        <div className="quiz-options" ref={optionRef}>
          {options.map((opt) => (
            <OptionButton
              key={opt.letter}
              letter={opt.letter}
              text={opt.text}
              state={opt.letter === selected ? 'selected' : 'idle'}
              disabled={answered}
              onClick={() => handleSelect(opt.letter)}
            />
          ))}
        </div>

        <div className="quiz-actions">
          {!answered ? (
            <button className="quiz-next-btn" onClick={handleConfirmAnswer} disabled={!selected}>
              SUBMIT ANSWER
            </button>
          ) : (
            <button className="quiz-next-btn" onClick={handleNext} disabled={submitting}>
              {submitting
                ? 'CALCULATING RESULTS...'
                : qIdx + 1 >= questions.length
                  ? 'VIEW RESULTS'
                  : 'NEXT QUESTION'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
