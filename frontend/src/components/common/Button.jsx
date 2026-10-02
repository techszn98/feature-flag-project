export default function Button({
  children,
  className = "",
  loading = false,
  ...props
}) {
  return (
    <button
      className={`button ${className}`}
      {...props}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <span className="button-spinner" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
}