/**
 * Select de estado reutilizable.
 * Props: value, onChange(value), options [{ value, label }], id, label
 */
export default function StateSelect({
  value,
  onChange,
  options = [],
  id = 'estado',
  label = 'Estado',
}) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="form-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
