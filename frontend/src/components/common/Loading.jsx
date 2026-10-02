export default function Loading({ label = "Loading your workspace" }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-mark" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
