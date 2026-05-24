export default function LoadingSpinner({ size = 24, label = 'Cargando…', inline = false }) {
  const style = { width: size, height: size };
  if (inline) {
    return <span className="spinner" style={style} role="status" aria-label={label} />;
  }
  return (
    <div className="row" style={{ justifyContent: 'center', padding: 'var(--space-lg)' }}>
      <span className="spinner" style={style} role="status" aria-label={label} />
      {label ? <span className="text-muted">{label}</span> : null}
    </div>
  );
}
