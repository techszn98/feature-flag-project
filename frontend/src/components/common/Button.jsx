export default function Button({
  children,
  className = "",
  loading = false,
  ...props
}) {
  return (
    <button
      className={`button ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="button-spinner" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
}
