import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import OptionButton from '../components/OptionButton/OptionButton';
import { useXpPopups } from '../components/XpPopup/XpPopup';
import '../components/XpPopup/XpPopup.css';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './QuizPlay.css';

const SECONDS = 30;

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
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [answers, setAnswers] = useState({});
  const [sessionXp, setSessionXp] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  const timerRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const answeredRef = useRef(false);
  const optionRef = useRef(null);
  const { spawnXp, PopupLayer } = useXpPopups();

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, listRes] = await Promise.all([api.get(`/quizzes/${id}/questions`), api.get('/quizzes')]);
        setQuestions(qRes.data);
        const quiz = listRes.data.find((q) => String(q.id) === String(id));
        if (quiz) setQuizTitle(quiz.title);
      } catch {
        toast.error('Failed to load quiz');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitAttempt = async (answersSource = answers) => {
    setSubmitting(true);
    try {
      const answersMap = {};
      Object.entries(answersSource).forEach(([qId, letter]) => {
        if (letter !== '__TIMEOUT__') answersMap[Number(qId)] = letter;
      });
      const { data } = await api.post(`/quizzes/${id}/attempt`, { answers: answersMap });
      updateXp(data.xpEarned);
      navigate('/result', { state: { result: data, quizTitle } });
    } catch {
      toast.error('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const scheduleAdvance = (nextAnswers, delayMs) => {
    clearTimeout(advanceTimerRef.current);
    setAutoAdvancing(true);
    const isLast = qIdx + 1 >= questions.length;
    advanceTimerRef.current = setTimeout(async () => {
      setAutoAdvancing(false);
      if (isLast) {
        await submitAttempt(nextAnswers);
      } else {
        setQIdx((i) => i + 1);
      }
    }, delayMs);
  };

  const handleTimeout = () => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswered(true);
    setSelected(null);
    const q = questions[qIdx];
    let nextAnswers = answers;
    if (q) {
      setAnswers((prev) => {
        nextAnswers = { ...prev, [q.id]: '__TIMEOUT__' };
        return nextAnswers;
      });
    }
    toast("\u23F1 Time's up!", { icon: '\u23F1' });
    scheduleAdvance(nextAnswers, 450);
  };

  useEffect(() => {
    if (loading || questions.length === 0) return;

    answeredRef.current = false;
    setAnswered(false);
    setSelected(null);
    setHintUsed(false);
    setShowHint(false);
    setTimeLeft(SECONDS);
    setAutoAdvancing(false);

    clearInterval(timerRef.current);
    clearTimeout(advanceTimerRef.current);
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
  }, [qIdx, loading]);

  const handleSelect = (letter) => {
    if (answeredRef.current) return;
    setSelected(letter);
  };

  const handleSubmitAnswer = () => {
    if (answeredRef.current) return;
    if (!selected) return;

    clearInterval(timerRef.current);
    answeredRef.current = true;
    setAnswered(true);

    const q = questions[qIdx];
    let nextAnswers = answers;
    setAnswers((prev) => {
      nextAnswers = { ...prev, [q.id]: selected };
      return nextAnswers;
    });

    const bonus = Math.floor((50 + (timeLeft / SECONDS) * 30) * (hintUsed ? 0.5 : 1));
    setSessionXp((x) => x + bonus);
    const rect = optionRef.current?.getBoundingClientRect();
    if (rect) spawnXp(bonus, rect.left + rect.width / 2, rect.top + 40);

    scheduleAdvance(nextAnswers, 350);
  };

  const useHint = () => {
    if (hintUsed || answered) return;
    setHintUsed(true);
    setShowHint(true);
    toast('\uD83D\uDCA1 Hint used \u2014 XP halved for this question', { icon: '\uD83D\uDCA1' });
  };

  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  if (loading)
    return (
      <>
        <HUD />
        <div className="quiz-loading">
          <div className="quiz-loading-spinner" />
          <span>LOADING MISSION...</span>
        </div>
      </>
    );

  if (questions.length === 0)
    return (
      <>
        <HUD />
        <div className="quiz-loading">
          <span style={{ color: 'var(--red)' }}>No questions found.</span>
        </div>
      </>
    );

  const q = questions[qIdx];
  const progress = ((qIdx + 1) / questions.length) * 100;
  const isWarn = timeLeft <= 10;

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

        {sessionXp > 0 && (
          <div className="session-xp">
            {'\u29E1'} +{sessionXp} XP this session
          </div>
        )}

        <div className="quiz-q-num">// QUESTION {qIdx + 1}</div>
        <div className="quiz-q-text">{q.questionText}</div>

        {q.hint && !answered && (
          <div className="hint-row">
            {!showHint ? (
              <button className="hint-btn" onClick={useHint}>
                {'\uD83D\uDCA1'} USE HINT <span style={{ color: 'var(--yellow)', marginLeft: 6 }}>(-50% XP)</span>
              </button>
            ) : (
              <div className="hint-box">
                {'\uD83D\uDCA1'} {q.hint}
              </div>
            )}
          </div>
        )}

        <div className="quiz-options" ref={optionRef}>
          {[{ l: 'A', t: q.optionA }, { l: 'B', t: q.optionB }, { l: 'C', t: q.optionC }, { l: 'D', t: q.optionD }].map(
            (opt) => (
              <OptionButton
                key={opt.l}
                letter={opt.l}
                text={opt.t}
                state={opt.l === selected ? 'selected' : 'idle'}
                disabled={answered || autoAdvancing || submitting}
                onClick={() => handleSelect(opt.l)}
              />
            )
          )}
        </div>

        <div className="quiz-feedback-row">
          <div className="quiz-feedback-left">
            <div className={`quiz-feedback ${answered ? 'ok' : 'pending'}`}>
              {answered
                ? selected
                  ? `\u2713 Answer submitted \u2014 ${selected} selected`
                  : `\u23F1 Time's up \u2014 no answer submitted`
                : selected
                  ? `Selected: ${selected} (click SUBMIT)`
                  : 'Select an option, then click SUBMIT'}
            </div>
          </div>

          <div className="quiz-feedback-actions">
            <button
              className="quiz-submit-btn"
              onClick={handleSubmitAnswer}
              disabled={!selected || answered || autoAdvancing || submitting}>
              {autoAdvancing ? '...' : 'SUBMIT'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
