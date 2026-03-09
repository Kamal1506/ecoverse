import { useState, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './CsvUpload.css';

export default function CsvUpload({ onUploadSuccess }) {
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const inputRef                  = useRef();

  // ── File selection ────────────────────────────────────────────────────────
  const handleFile = (selected) => {
    setResult(null);
    setError(null);

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are accepted.');
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const upload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/quizzes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      toast.success(`✓ ${data.quizzesCreated} quiz${data.quizzesCreated !== 1 ? 'zes' : ''} created!`);

      // Tell AdminPanel to refresh the quiz roster
      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Check your CSV format.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="csv-wrap">

      {/* ── Drop Zone ── */}
      {!file && !result && (
        <div
          className={`drop-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="drop-icon">📂</div>
          <div className="drop-title">DROP CSV FILE HERE</div>
          <div className="drop-sub">or click to browse</div>
          <div className="drop-hint">
            Required columns: quizTitle · question · optionA · optionB · optionC · optionD · correctOption
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={onInputChange}
          />
        </div>
      )}

      {/* ── File selected — preview card ── */}
      {file && !result && (
        <div className="file-preview">
          <div className="file-preview-icon">📄</div>
          <div className="file-preview-info">
            <div className="file-name">{file.name}</div>
            <div className="file-size">
              {(file.size / 1024).toFixed(1)} KB · CSV file
            </div>
          </div>
          <div className="file-preview-actions">
            <button className="btn-ghost" onClick={clearFile} disabled={uploading}>
              ✕ REMOVE
            </button>
            <button className="btn-primary" onClick={upload} disabled={uploading}>
              {uploading
                ? <span className="uploading-text">◈ UPLOADING...</span>
                : '▶ UPLOAD NOW'}
            </button>
          </div>
        </div>
      )}

      {/* ── Uploading progress bar ── */}
      {uploading && (
        <div className="upload-progress">
          <div className="upload-progress-bar" />
          <div className="upload-progress-label">PROCESSING CSV...</div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="csv-error">
          <span className="csv-error-icon">⚠</span>
          <div>
            <div className="csv-error-title">UPLOAD FAILED</div>
            <div className="csv-error-msg">{error}</div>
          </div>
          <button className="btn-ghost" onClick={clearFile}>TRY AGAIN</button>
        </div>
      )}

      {/* ── Success result ── */}
      {result && (
        <div className="csv-result">
          <div className="csv-result-header">
            <span className="csv-result-icon">✓</span>
            <span className="csv-result-title">UPLOAD COMPLETE</span>
          </div>

          <div className="csv-result-stats">
            <div className="csv-stat">
              <div className="csv-stat-n">{result.quizzesCreated}</div>
              <div className="csv-stat-l">Quizzes Created</div>
            </div>
            <div className="csv-stat">
              <div className="csv-stat-n">{result.questionsCreated}</div>
              <div className="csv-stat-l">Questions Added</div>
            </div>
            <div className="csv-stat">
              <div className="csv-stat-n" style={{ color: 'var(--text-dim)' }}>
                {result.skippedRows || 0}
              </div>
              <div className="csv-stat-l">Rows Skipped</div>
            </div>
          </div>

          {result.warning && (
            <div className="csv-warning">
              ⚠ {result.warning}
              {result.skippedDuplicates?.length > 0 && (
                <div className="csv-duplicates">
                  Skipped: {result.skippedDuplicates.join(', ')}
                </div>
              )}
            </div>
          )}

          <button className="btn-ghost" style={{ marginTop: 16 }}
            onClick={clearFile}>
            ↑ UPLOAD ANOTHER FILE
          </button>
        </div>
      )}

      {/* ── Format guide ── */}
      <div className="csv-format-guide">
        <div className="section-label" style={{ marginBottom: 12 }}>
          // CSV FORMAT GUIDE
        </div>
        <div className="format-table">
          <div className="format-row format-head">
            {['quizTitle','question','optionA','optionB','optionC','optionD','correctOption']
              .map(h => <div key={h} className="format-cell">{h}</div>)}
          </div>
          <div className="format-row">
            <div className="format-cell ex">Plastic Pollution</div>
            <div className="format-cell ex">What decomposes slowest?</div>
            <div className="format-cell ex">Glass</div>
            <div className="format-cell ex">Plastic bag</div>
            <div className="format-cell ex">Paper</div>
            <div className="format-cell ex">Metal</div>
            <div className="format-cell ex correct">A</div>
          </div>
        </div>
        <div className="format-rules">
          <span>✓ correctOption must be A, B, C, or D</span>
          <span>✓ Same quizTitle groups questions into one quiz</span>
          <span>✓ Max file size: 5MB</span>
          <span>✓ UTF-8 encoding</span>
        </div>
      </div>

    </div>
  );
}