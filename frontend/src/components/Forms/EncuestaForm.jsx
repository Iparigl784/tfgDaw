import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toMySQL, toInputDateTime } from '../../utils/formatters';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Formulario de encuesta.
 * Props: initialValues, errors, loading, onSubmit(payload), onCancel
 */
export default function EncuestaForm({
  initialValues,
  errors = {},
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [titulo, setTitulo] = useState(initialValues?.titulo || '');
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion || '');
  const [tipo, setTipo] = useState(initialValues?.tipo || 'generica');
  const [fechaLimite, setFechaLimite] = useState(
    initialValues?.fecha_limite ? toInputDateTime(initialValues.fecha_limite) : ''
  );
  const [opciones, setOpciones] = useState(
    initialValues?.opciones?.length
      ? initialValues.opciones.map((o) => ({
          fecha_inicio: toInputDateTime(o.fecha_inicio),
          fecha_fin: toInputDateTime(o.fecha_fin),
        }))
      : [{ fecha_inicio: '', fecha_fin: '' }]
  );
  const [emails, setEmails] = useState(initialValues?.destinatarios || []);
  const [emailInput, setEmailInput] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const fieldError = (k) => localErrors[k] || errors[k];

  const updateOpcion = (idx, key, value) =>
    setOpciones((prev) => prev.map((o, i) => (i === idx ? { ...o, [key]: value } : o)));
  const addOpcion = () =>
    setOpciones((prev) => [...prev, { fecha_inicio: '', fecha_fin: '' }]);
  const removeOpcion = (idx) =>
    setOpciones((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

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
    if (!descripcion.trim()) e.descripcion = 'La descripción es obligatoria.';
    if (!fechaLimite) e.fecha_limite = 'La fecha límite es obligatoria.';
    else if (new Date(fechaLimite) <= new Date())
      e.fecha_limite = 'La fecha límite debe ser posterior a hoy.';

    opciones.forEach((o, i) => {
      const hasAny = o.fecha_inicio || o.fecha_fin;
      if (hasAny) {
        if (!o.fecha_inicio) e[`opciones.${i}.fecha_inicio`] = 'Fecha de inicio obligatoria.';
        if (!o.fecha_fin) e[`opciones.${i}.fecha_fin`] = 'Fecha de fin obligatoria.';
        else if (o.fecha_inicio && new Date(o.fecha_fin) <= new Date(o.fecha_inicio))
          e[`opciones.${i}.fecha_fin`] = 'Debe ser posterior a la fecha de inicio.';
      }
    });
    setLocalErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const opcionesValidas = opciones
      .filter((o) => o.fecha_inicio && o.fecha_fin)
      .map((o) => ({
        fecha_inicio: toMySQL(o.fecha_inicio),
        fecha_fin: toMySQL(o.fecha_fin),
      }));

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      fecha_limite: toMySQL(fechaLimite),
    };
    if (opcionesValidas.length) payload.opciones = opcionesValidas;
    if (emails.length) payload.destinatarios = emails;

    onSubmit(payload);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="ef-titulo">
          Título *
        </label>
        <input
          id="ef-titulo"
          className={`form-input ${fieldError('titulo') ? 'has-error' : ''}`}
          value={titulo}
          maxLength={255}
          onChange={(e) => setTitulo(e.target.value)}
        />
        {fieldError('titulo') && <span className="form-error">{fieldError('titulo')}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ef-desc">
          Descripción *
        </label>
        <textarea
          id="ef-desc"
          className={`form-textarea ${fieldError('descripcion') ? 'has-error' : ''}`}
          value={descripcion}
          maxLength={500}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        {fieldError('descripcion') && (
          <span className="form-error">{fieldError('descripcion')}</span>
        )}
      </div>

      <div className="row" style={{ gap: 'var(--space-md)', alignItems: 'flex-start' }}>
    

        <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
          <label className="form-label" htmlFor="ef-limite">
            Fecha límite *
          </label>
          <input
            id="ef-limite"
            type="datetime-local"
            className={`form-input ${fieldError('fecha_limite') ? 'has-error' : ''}`}
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
          {fieldError('fecha_limite') && (
            <span className="form-error">{fieldError('fecha_limite')}</span>
          )}
        </div>
      </div>

      <fieldset
        style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}
      >
        <legend className="form-label">Opciones de fecha (para votar)</legend>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)' }}>
          Cada opción es una franja que los participantes podrán votar con «sí» o «no».
        </p>
        <div className="stack">
          {opciones.map((o, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-end', gap: 'var(--space-sm)' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label" htmlFor={`oi-${i}`}>
                  Inicio
                </label>
                <input
                  id={`oi-${i}`}
                  type="datetime-local"
                  className={`form-input ${fieldError(`opciones.${i}.fecha_inicio`) ? 'has-error' : ''}`}
                  value={o.fecha_inicio}
                  onChange={(e) => updateOpcion(i, 'fecha_inicio', e.target.value)}
                />
                {fieldError(`opciones.${i}.fecha_inicio`) && (
                  <span className="form-error">{fieldError(`opciones.${i}.fecha_inicio`)}</span>
                )}
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                <label className="form-label" htmlFor={`of-${i}`}>
                  Fin
                </label>
                <input
                  id={`of-${i}`}
                  type="datetime-local"
                  className={`form-input ${fieldError(`opciones.${i}.fecha_fin`) ? 'has-error' : ''}`}
                  value={o.fecha_fin}
                  onChange={(e) => updateOpcion(i, 'fecha_fin', e.target.value)}
                />
                {fieldError(`opciones.${i}.fecha_fin`) && (
                  <span className="form-error">{fieldError(`opciones.${i}.fecha_fin`)}</span>
                )}
              </div>
              {opciones.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Eliminar opción"
                  onClick={() => removeOpcion(i)}
                >
                  <Icon icon="mdi:trash-can-outline" width="20" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm mt-md" onClick={addOpcion}>
          <Icon icon="mdi:plus" width="18" />
          Añadir opción
        </button>
      </fieldset>

      <fieldset
        style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-md)' }}
      >
        <legend className="form-label">Destinatarios por email</legend>
        <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 'var(--space-sm)' }}>
          Personas que recibirán la encuesta y podrán votar.
        </p>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label" htmlFor="ef-email">
              Email del destinatario
            </label>
            <input
              id="ef-email"
              type="email"
              className={`form-input ${fieldError('emailInput') ? 'has-error' : ''}`}
              value={emailInput}
              placeholder="persona@ejemplo.com"
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
            <Icon icon="mdi:email-plus-outline" width="18" /> Añadir
          </button>
        </div>

        {emails.length > 0 && (
          <ul className="row" style={{ listStyle: 'none', marginTop: 'var(--space-sm)' }}>
            {emails.map((email) => (
              <li key={email}>
                <span className="badge badge-success">
                  {email}
                  <button
                    type="button"
                    aria-label={`Quitar ${email}`}
                    style={{ border: 'none', background: 'none', padding: 0, marginLeft: 4, cursor: 'pointer' }}
                    onClick={() => removeEmail(email)}
                  >
                    <Icon icon="mdi:close" width="14" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar encuesta'}
        </button>
      </div>
    </form>
  );
}
