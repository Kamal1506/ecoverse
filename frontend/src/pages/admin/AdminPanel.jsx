import { useState, useEffect } from 'react';
import HUD from '../../components/HUD/HUD';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const EMPTY_QUESTION = {
  questionText: '', optionA: '', optionB: '',
  optionC: '', optionD: '', correctOption: 'A'
};

export default function AdminPanel() {
  const [quizzes, setQuizzes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', xpReward: 100,
    questions: [{ ...EMPTY_QUESTION }]
  });

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // ── Form handlers ────────────────────────────────────────────────────────
  const changeForm = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const changeQuestion = (i, e) => {
    const updated = [...form.questions];
    updated[i] = { ...updated[i], [e.target.name]: e.target.value };
    setForm(f => ({ ...f, questions: updated }));
  };

  const addQuestion = () =>
    setForm(f => ({ ...f, questions: [...f.questions, { ...EMPTY_QUESTION }] }));

  const removeQuestion = (i) => {
    if (form.questions.length === 1) {
      toast.error('A quiz must have at least one question');
      return;
    }
    setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  };

  const resetForm = () => {
    setForm({ title: '', description: '', xpReward: 100, questions: [{ ...EMPTY_QUESTION }] });
    setShowForm(false);
  };

  // ── Submit new quiz ───────────────────────────────────────────────────────
  const submitQuiz = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!form.title.trim()) { toast.error('Quiz title is required'); return; }
    if (form.questions.some(q => !q.questionText.trim())) {
      toast.error('All questions must have question text'); return;
    }
    if (form.questions.some(q =>
      !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()
    )) {
      toast.error('All 4 options must be filled in for every question'); return;
    }

    setSubmitting(true);
    try {
      await api.post('/quizzes', {
        title:       form.title.trim(),
        description: form.description.trim(),
        xpReward:    Number(form.xpReward),
        questions:   form.questions,
      });
      toast.success(`Quiz "${form.title}" created! 🎮`);
      resetForm();
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete quiz ──────────────────────────────────────────────────────────
  const deleteQuiz = async (id, title) => {
    if (!window.confirm(`Delete quiz "${title}"?\n\nThis will also delete all its questions. This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success(`"${title}" deleted`);
      setQuizzes(q => q.filter(qz => qz.id !== id));
    } catch {
      toast.error('Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="admin-wrap">

          {/* ── Header ── */}
          <div className="admin-header">
            <div>
              <div className="section-label">// ADMIN</div>
              <h1 className="admin-title">CONTROL PANEL</h1>
            </div>
            <button
              className={showForm ? 'btn-ghost' : 'btn-primary'}
              onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕ CANCEL' : '+ NEW QUIZ'}
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="admin-stats">
            <div className="admin-stat">
              <div className="admin-stat-n">{quizzes.length}</div>
              <div className="admin-stat-l">Total Quizzes</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-n">
                {quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0)}
              </div>
              <div className="admin-stat-l">Total Questions</div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat-n" style={{ color: 'var(--cyan)' }}>
                {quizzes.reduce((s, q) => s + (q.xpReward * (q.questionCount || 0)), 0).toLocaleString()}
              </div>
              <div className="admin-stat-l">Total XP Pool</div>
            </div>
          </div>

          {/* ── Create Quiz Form ── */}
          {showForm && (
            <div className="admin-form-wrap">
              <div className="section-label">// CREATE NEW QUIZ</div>
              <form className="admin-form" onSubmit={submitQuiz}>

                {/* Quiz info row */}
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">QUIZ TITLE *</label>
                    <input className="form-input" name="title"
                      placeholder="e.g. Plastic Pollution"
                      value={form.title} onChange={changeForm} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">XP PER CORRECT ANSWER</label>
                    <input className="form-input" name="xpReward"
                      type="number" min="10" max="1000"
                      value={form.xpReward} onChange={changeForm} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">DESCRIPTION (optional)</label>
                  <input className="form-input" name="description"
                    placeholder="What is this quiz about?"
                    value={form.description} onChange={changeForm} />
                </div>

                {/* Questions */}
                <div className="section-label" style={{ marginTop: 24 }}>
                  // QUESTIONS ({form.questions.length})
                </div>

                {form.questions.map((q, i) => (
                  <div key={i} className="question-block">
                    <div className="question-block-header">
                      <span className="mono" style={{ fontSize: 11, color: 'var(--green)', letterSpacing: 2 }}>
                        Q{i + 1}
                      </span>
                      {form.questions.length > 1 && (
                        <button type="button" className="q-remove-btn"
                          onClick={() => removeQuestion(i)}>
                          ✕ REMOVE
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">QUESTION TEXT *</label>
                      <input className="form-input" name="questionText"
                        placeholder="Type your question here..."
                        value={q.questionText}
                        onChange={e => changeQuestion(i, e)} />
                    </div>

                    <div className="form-row-2">
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <div key={letter} className="form-group">
                          <label className="form-label">OPTION {letter} *</label>
                          <input className="form-input"
                            name={`option${letter}`}
                            placeholder={`Option ${letter}...`}
                            value={q[`option${letter}`]}
                            onChange={e => changeQuestion(i, e)} />
                        </div>
                      ))}
                    </div>

                    <div className="form-group" style={{ maxWidth: 200 }}>
                      <label className="form-label">CORRECT ANSWER *</label>
                      <select className="form-input form-select"
                        name="correctOption"
                        value={q.correctOption}
                        onChange={e => changeQuestion(i, e)}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))}

                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={addQuestion}>
                    + ADD QUESTION
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? '◈ SAVING...' : '▶ CREATE QUIZ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Quiz Roster Table ── */}
          <div className="section-label" style={{ marginTop: 40 }}>
            // QUIZ ROSTER
          </div>

          {loading ? (
            <div style={{
              padding: '48px 0', color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 3
            }}>
              LOADING...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="admin-empty">
              No quizzes yet — click <strong style={{ color: 'var(--green)' }}>+ NEW QUIZ</strong> above to create your first one.
            </div>
          ) : (
            <div className="admin-table">
              <div className="admin-table-head">
                <div className="atc mono">TITLE</div>
                <div className="atc mono center">QUESTIONS</div>
                <div className="atc mono center">XP / Q</div>
                <div className="atc mono center">TOTAL XP</div>
                <div className="atc mono center">CREATED</div>
                <div className="atc mono center">ACTION</div>
              </div>

              {quizzes.map(quiz => (
                <div key={quiz.id} className="admin-table-row">
                  <div className="atc">
                    <span className="quiz-title-text">{quiz.title}</span>
                  </div>
                  <div className="atc center mono" style={{ color: 'var(--green)' }}>
                    {quiz.questionCount}
                  </div>
                  <div className="atc center mono" style={{ color: 'var(--yellow)' }}>
                    {quiz.xpReward}
                  </div>
                  <div className="atc center mono" style={{ color: 'var(--cyan)' }}>
                    {(quiz.xpReward * quiz.questionCount).toLocaleString()}
                  </div>
                  <div className="atc center" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                  <div className="atc center">
                    <button className="delete-btn"
                      onClick={() => deleteQuiz(quiz.id, quiz.title)}
                      disabled={deletingId === quiz.id}>
                      {deletingId === quiz.id ? '...' : '✕ DELETE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}