export default function StatusBadge({ enabled, children }) {
  const status = enabled ? "enabled" : "disabled";
  return (
    <span className={`status-badge ${status}`}>
      <i aria-hidden="true" />
      {children ?? (enabled ? "Enabled" : "Disabled")}
    </span>
  );
}
