import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toMySQL, toInputDateTime } from '../../utils/formatters';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Formulario de reunión.
 *
 * Props: initialValues, errors, loading, onSubmit(payload), onCancel
 */
export default function ReunionForm({
  initialValues,
  errors = {},
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [titulo, setTitulo] = useState(initialValues?.titulo || '');
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion || '');
  const [lugar, setLugar] = useState(initialValues?.lugar || '');
  const [fechas, setFechas] = useState(
    initialValues?.fechas?.length
      ? initialValues.fechas.map((f) => ({
          fecha_inicio: toInputDateTime(f.fecha_inicio),
          fecha_fin: toInputDateTime(f.fecha_fin),
        }))
      : [{ fecha_inicio: '', fecha_fin: '' }]
  );

  const [emails, setEmails] = useState(
    initialValues?.destinatarios || initialValues?.asistentes || []
  );
  const [emailInput, setEmailInput] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const fieldError = (k) => localErrors[k] || errors[k];

  const isEncuesta = fechas.length > 1;

  const updateFecha = (idx, key, value) => {
    setFechas((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  };
  const addFecha = () => setFechas((prev) => [...prev, { fecha_inicio: '', fecha_fin: '' }]);
  const removeFecha = (idx) =>
    setFechas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setLocalErrors((e) => ({ ...e, emailInput: 'Email no válido.' }));
      return;
    }
    if (emails.includes(email)) {
      setLocalErrors((e) => ({ ...e, emailInput: 'Ese email ya está en la lista.' }));
      return;
    }
    setEmails((prev) => [...prev, email]);
    setEmailInput('');
    setLocalErrors((e) => ({ ...e, emailInput: undefined }));
  };

  const removeEmail = (email) => setEmails((prev) => prev.filter((x) => x !== email));

  const validate = () => {
    const e = {};
    if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
    const now = Date.now();
    fechas.forEach((f, i) => {
      if (!f.fecha_inicio) e[`fechas.${i}.fecha_inicio`] = 'La fecha de inicio es obligatoria.';
      else if (new Date(f.fecha_inicio).getTime() <= now)
        e[`fechas.${i}.fecha_inicio`] = 'La fecha de inicio debe ser futura.';
      if (!f.fecha_fin) e[`fechas.${i}.fecha_fin`] = 'La fecha de fin es obligatoria.';
      else if (f.fecha_inicio && new Date(f.fecha_fin) <= new Date(f.fecha_inicio))
        e[`fechas.${i}.fecha_fin`] = 'Debe ser posterior a la fecha de inicio.';
    });
    setLocalErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      lugar: lugar.trim() || null,
      fechas: fechas.map((f) => ({
        fecha_inicio: toMySQL(f.fecha_inicio),
        fecha_fin: toMySQL(f.fecha_fin),
      })),
    };
    if (emails.length) {
      if (isEncuesta) {
        payload.destinatarios = emails;
      } else {
        payload.asistentes = emails;
      }
    }
    onSubmit(payload);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="rf-titulo">
          Título *
        </label>
        <input
          id="rf-titulo"
          className={`form-input ${fieldError('titulo') ? 'has-error' : ''}`}
          value={titulo}
          maxLength={150}
          onChange={(e) => setTitulo(e.target.value)}
        />
        {fieldError('titulo') && <span className="form-error">{fieldError('titulo')}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="rf-desc">
          Descripción
        </label>
        <textarea
          id="rf-desc"
          className={`form-textarea ${fieldError('descripcion') ? 'has-error' : ''}`}
          value={descripcion}
          maxLength={200}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        {fieldError('descripcion') && (
          <span className="form-error">{fieldError('descripcion')}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="rf-lugar">
          Lugar
        </label>
        <input
          id="rf-lugar"
          className={`form-input ${fieldError('lugar') ? 'has-error' : ''}`}
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
        />
        {fieldError('lugar') && <span className="form-error">{fieldError('lugar')}</span>}
      </div>

      <fieldset
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
        }}
      >
        <legend className="form-label">Fechas propuestas *</legend>
        <div className="stack">
          {fechas.map((f, i) => (
            <div
              key={i}
              className="row"
              style={{ alignItems: 'flex-end', gap: 'var(--space-sm)' }}
            >
              <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label" htmlFor={`fi-${i}`}>
                  Inicio
                </label>
                <input
                  id={`fi-${i}`}
                  type="datetime-local"
                  className={`form-input ${fieldError(`fechas.${i}.fecha_inicio`) ? 'has-error' : ''}`}
                  value={f.fecha_inicio}
                  onChange={(e) => updateFecha(i, 'fecha_inicio', e.target.value)}
                />
                {fieldError(`fechas.${i}.fecha_inicio`) && (
                  <span className="form-error">{fieldError(`fechas.${i}.fecha_inicio`)}</span>
                )}
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label" htmlFor={`ff-${i}`}>
                  Fin
                </label>
                <input
                  id={`ff-${i}`}
                  type="datetime-local"
                  className={`form-input ${fieldError(`fechas.${i}.fecha_fin`) ? 'has-error' : ''}`}
                  value={f.fecha_fin}
                  onChange={(e) => updateFecha(i, 'fecha_fin', e.target.value)}
                />
                {fieldError(`fechas.${i}.fecha_fin`) && (
                  <span className="form-error">{fieldError(`fechas.${i}.fecha_fin`)}</span>
                )}
              </div>
              {fechas.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Eliminar fecha"
                  onClick={() => removeFecha(i)}
                >
                  <Icon icon="mdi:trash-can-outline" width="20" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-md"
          onClick={addFecha}
        >
          <Icon icon="mdi:plus" width="18" />
          Añadir fecha
        </button>
        <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 'var(--space-sm)' }}>
          {isEncuesta
            ? 'Con varias fechas se creará una encuesta para elegir la definitiva.'
            : 'Reunión simple: una sola fecha, sin encuesta.'}
        </p>
      </fieldset>

      <fieldset
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
        }}
      >
        <legend className="form-label">
          {isEncuesta
            ? 'Añadir destinatarios (reunión con encuesta)'
            : 'Añadir asistentes (reunión simple)'}
        </legend>

        <p
          className="text-muted"
          style={{ fontSize: '0.82rem', marginTop: 0, marginBottom: 'var(--space-sm)' }}
        >
          {isEncuesta
            ? 'Se añadirán como destinatarios de la encuesta para poder votar la fecha.'
            : 'Se les enviará una invitación pendiente. Solo aparecerán como confirmados cuando acepten.'}
        </p>

        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label" htmlFor="rf-email">
              {isEncuesta ? 'Email del destinatario' : 'Email del asistente'}
            </label>
            <input
              id="rf-email"
              type="email"
              className={`form-input ${fieldError('emailInput') ? 'has-error' : ''}`}
              value={emailInput}
              placeholder="persona@ejemplo.com"
              autoComplete="off"
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            {fieldError('emailInput') && (
              <span className="form-error">{fieldError('emailInput')}</span>
            )}
          </div>
          <button type="button" className="btn btn-secondary" onClick={addEmail}>
            <Icon icon="mdi:account-plus" width="18" /> Añadir
          </button>
        </div>

        {emails.length > 0 && (
          <ul
            className="row"
            style={{
              listStyle: 'none',
              marginTop: 'var(--space-sm)',
              padding: 0,
              flexWrap: 'wrap',
              gap: 'var(--space-xs)',
            }}
          >
            {emails.map((email) => (
              <li key={email}>
                <span
                  className="badge badge-success"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Icon icon="mdi:email" width="13" />
                  {email}
                  <button
                    type="button"
                    aria-label={`Quitar ${email}`}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      marginLeft: 2,
                      cursor: 'pointer',
                      color: 'inherit',
                      lineHeight: 1,
                    }}
                    onClick={() => removeEmail(email)}
                  >
                    <Icon icon="mdi:close" width="13" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {Object.keys(errors)
          .filter((k) => k.startsWith('asistentes.') || k.startsWith('destinatarios.'))
          .map((k) => (
            <p key={k} className="form-error" style={{ marginTop: 'var(--space-xs)' }}>
              {errors[k]}
            </p>
          ))}
      </fieldset>

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
          {loading ? 'Guardando…' : 'Guardar reunión'}
        </button>
      </div>
    </form>
  );
}
