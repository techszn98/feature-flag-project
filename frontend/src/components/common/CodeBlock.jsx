import CopyButton from "./CopyButton.jsx";

export default function CodeBlock({ code, label = "Example" }) {
  return (
    <div className="code-block-shell">
      <div className="code-block-toolbar">
        <span>{label}</span>
        <CopyButton value={code} label={`Copy ${label.toLowerCase()}`} />
      </div>
      <pre className="code-block" tabIndex={0} aria-label={label}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
