export default function Tooltip({ children, text }) {
  return (
    <span className="tooltip-wrap" tabIndex={0}>
      {children}
      <span className="tooltip-bubble" role="tooltip">{text}</span>
    </span>
  );
}
