import './OptionButton.css';

export default function OptionButton({
  letter,
  text,
  state = 'idle',
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`option-btn ${state}`}
      onClick={onClick}
      disabled={disabled}>
      <span className="option-letter">{letter}</span>
      <span className="option-text">{text}</span>
    </button>
  );
}
