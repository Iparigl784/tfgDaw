/**
 * Rango de fechas (desde / hasta) con <input type="date">.
 * Props: desde, hasta, onChange({ desde, hasta })
 */
export default function DateRange({ desde, hasta, onChange }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="filtro-desde">
          Desde
        </label>
        <input
          id="filtro-desde"
          type="date"
          className="form-input"
          value={desde || ''}
          onChange={(e) => onChange({ desde: e.target.value, hasta })}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="filtro-hasta">
          Hasta
        </label>
        <input
          id="filtro-hasta"
          type="date"
          className="form-input"
          value={hasta || ''}
          onChange={(e) => onChange({ desde, hasta: e.target.value })}
        />
      </div>
    </>
  );
}
