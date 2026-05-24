import { useState } from 'react';

/**
 * Formulario reutilizable de usuario (nombre / email).
 * Props: initialValues, errors (por campo), loading, onSubmit(values), onCancel
 */
export default function UserForm({
  initialValues = { name: '', email: '' },
  errors = {},
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [localErrors, setLocalErrors] = useState({});

  const fieldError = (k) => localErrors[k] || errors[k];

  const validate = () => {
    const e = {};
    if (!values.name?.trim()) e.name = 'El nombre es obligatorio.';
    if (!values.email?.trim()) e.email = 'El email es obligatorio.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      e.email = 'El formato del email no es válido.';
    setLocalErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({ name: values.name.trim(), email: values.email.trim() });
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="uf-name">
          Nombre
        </label>
        <input
          id="uf-name"
          className={`form-input ${fieldError('name') ? 'has-error' : ''}`}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
        />
        {fieldError('name') && <span className="form-error">{fieldError('name')}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="uf-email">
          Email
        </label>
        <input
          id="uf-email"
          type="email"
          className={`form-input ${fieldError('email') ? 'has-error' : ''}`}
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        {fieldError('email') && <span className="form-error">{fieldError('email')}</span>}
      </div>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
