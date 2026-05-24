import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import useFetch, { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toMySQL, toInputDateTime } from '../../utils/formatters';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Edición de encuesta
 *
 */
export default function EncuestaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data, loading, error, refetch } = useFetch(endpoints.encuesta(id));
  const encuesta = data?.data ?? data;

  // Cargar usuarios para resolver emails → user_id antes de POST destinatario.
  const { data: usuariosRaw } = useFetch(endpoints.usuarios, {
    params: { per_page: 100 },
    silent: true,
  });
  const usuarios = useMemo(() => {
    if (Array.isArray(usuariosRaw)) return usuariosRaw;
    if (Array.isArray(usuariosRaw?.data)) return usuariosRaw.data;
    return [];
  }, [usuariosRaw]);

  const emailToUser = useMemo(() => {
    const m = new Map();
    usuarios.forEach((u) => u.email && m.set(u.email.toLowerCase(), u));
    return m;
  }, [usuarios]);

  // ── Estado del formulario principal (PUT) ─────────────────────────────────
  // Inicializamos cuando llega la encuesta. Para "reset" si se navega entre
  // encuestas distintas con el mismo componente, ver useEffect debajo.
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('generica');
  const [fechaLimite, setFechaLimite] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [savingForm, setSavingForm] = useState(false);

  // ── Estado del formulario "Añadir destinatario" (POST) ────────────────────
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Cuando llegan los datos por primera vez, rellenamos el formulario.
  // Una sola vez (guard `initialized`): si después refetcheamos para refrescar
  // los destinatarios, NO sobreescribimos los cambios que el usuario está
  // haciendo en los campos del form principal.
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!encuesta || initialized) return;
    setTitulo(encuesta.titulo || '');
    setDescripcion(encuesta.descripcion || '');
    setTipo(encuesta.tipo || 'generica');
    setFechaLimite(encuesta.fecha_limite ? toInputDateTime(encuesta.fecha_limite) : '');
    setOpciones(
      Array.isArray(encuesta.opciones)
        ? encuesta.opciones.map((o) => ({
            id: o.id,
            fecha_inicio: toInputDateTime(o.fecha_inicio),
            fecha_fin: toInputDateTime(o.fecha_fin),
          }))
        : []
    );
    setInitialized(true);
  }, [encuesta, initialized]);

  if (loading) return <LoadingSpinner label="Cargando encuesta…" />;
  if (error && !error.isConnectionError)
    return <div className="error-banner">No se pudo cargar la encuesta.</div>;
  if (!encuesta) return null;

  const creadorInfo = encuesta.usuario || encuesta.creador;
  const esCreador = creadorInfo?.id === user?.id;
  const puedeEditar = esCreador || isAdmin;
  const cerrada = encuesta.estado === 'cerrada';

  if (!puedeEditar) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="error-banner">No tienes permiso para editar esta encuesta.</div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/encuestas/${id}`)}
        >
          <Icon icon="mdi:arrow-left" width="18" /> Volver al detalle
        </button>
      </div>
    );
  }

  if (cerrada) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div
          className="empty-state"
          style={{ borderLeft: '4px solid var(--color-warning, #d97706)' }}
        >
          <strong>La encuesta está cerrada.</strong>
          <p style={{ marginTop: 4, marginBottom: 0 }}>
            No se puede editar ni añadir destinatarios. Solo es posible consultar
            o eliminar la encuesta desde el detalle.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/encuestas/${id}`)}
        >
          <Icon icon="mdi:arrow-left" width="18" /> Volver al detalle
        </button>
      </div>
    );
  }

  // ── Helpers de opciones ───────────────────────────────────────────────────
  const updateOpcion = (idx, key, value) =>
    setOpciones((prev) => prev.map((o, i) => (i === idx ? { ...o, [key]: value } : o)));
  const addOpcion = () =>
    setOpciones((prev) => [...prev, { fecha_inicio: '', fecha_fin: '' }]);
  const removeOpcion = (idx) =>
    setOpciones((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  // ── Submit principal: PUT /encuestas/{id} SIN destinatarios ───────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setFormErrors({});

    const e = {};
    if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
    if (!descripcion.trim()) e.descripcion = 'La descripción es obligatoria.';
    if (!fechaLimite) e.fecha_limite = 'La fecha límite es obligatoria.';
    opciones.forEach((o, i) => {
      const hasAny = o.fecha_inicio || o.fecha_fin;
      if (hasAny) {
        if (!o.fecha_inicio) e[`opciones.${i}.fecha_inicio`] = 'Fecha de inicio obligatoria.';
        if (!o.fecha_fin) e[`opciones.${i}.fecha_fin`] = 'Fecha de fin obligatoria.';
        else if (o.fecha_inicio && new Date(o.fecha_fin) <= new Date(o.fecha_inicio))
          e[`opciones.${i}.fecha_fin`] = 'Debe ser posterior a la fecha de inicio.';
      }
    });
    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      fecha_limite: toMySQL(fechaLimite),
    };
    const opcionesValidas = opciones
      .filter((o) => o.fecha_inicio && o.fecha_fin)
      .map((o) => ({
        fecha_inicio: toMySQL(o.fecha_inicio),
        fecha_fin: toMySQL(o.fecha_fin),
      }));
    if (opcionesValidas.length) payload.opciones = opcionesValidas;

    setSavingForm(true);
    try {
      await apiRequest(endpoints.encuesta(id), { method: 'PUT', body: payload });
      toast.success('Encuesta actualizada correctamente.');
      navigate(`/encuestas/${id}`);
    } catch (err) {
      if (err.status === 422) {
        setFormErrors(
          Object.fromEntries(
            Object.entries(err.errors || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        );
        toast.error('Revisa los campos del formulario.');
      } else if (err.status === 403) {
        toast.error('No tienes permiso para editar esta encuesta.');
      } else if (!err.isConnectionError) {
        toast.error('No se pudo actualizar la encuesta.');
      }
    } finally {
      setSavingForm(false);
    }
  };

  // ── Añadir destinatario: POST /encuestas/{id}/destinatarios ──────────────
  const handleAddDestinatario = async (ev) => {
    ev.preventDefault();
    setAddError('');

    const email = nuevoEmail.trim().toLowerCase();
    if (!email) {
      setAddError('Introduce un email.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setAddError('Email no válido.');
      return;
    }

    const u = emailToUser.get(email);
    if (!u) {
      setAddError('Ese email no corresponde a ningún usuario registrado.');
      return;
    }

    setAdding(true);
    try {
      await apiRequest(endpoints.destinatarios(id), {
        method: 'POST',
        body: { email: u.email },
      });
      toast.success(`${u.name} añadido a la encuesta.`);
      setNuevoEmail('');
      refetch(); // recargar para que aparezca en la lista de destinatarios
    } catch (err) {
      if (err.status === 422)
        setAddError(err.data?.message || 'No se pudo añadir el destinatario.');
      else if (err.status === 403) toast.error('No tienes permiso.');
      else if (!err.isConnectionError) toast.error('No se pudo añadir el destinatario.');
    } finally {
      setAdding(false);
    }
  };

  const destinatarios = encuesta.destinatarios || [];

  return (
    <div className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(`/encuestas/${id}`)}
      >
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>
      <h1 className="page-title">Editar encuesta</h1>

      {/* ─── FORM PRINCIPAL (PUT) ──────────────────────────────────────── */}
      <Card>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="ee-titulo">
              Título *
            </label>
            <input
              id="ee-titulo"
              className={`form-input ${formErrors.titulo ? 'has-error' : ''}`}
              value={titulo}
              maxLength={255}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {formErrors.titulo && <span className="form-error">{formErrors.titulo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ee-desc">
              Descripción *
            </label>
            <textarea
              id="ee-desc"
              className={`form-textarea ${formErrors.descripcion ? 'has-error' : ''}`}
              value={descripcion}
              maxLength={500}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            {formErrors.descripcion && (
              <span className="form-error">{formErrors.descripcion}</span>
            )}
          </div>

          <div className="row" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label" htmlFor="ee-fecha">
                Fecha límite *
              </label>
              <input
                id="ee-fecha"
                type="datetime-local"
                className={`form-input ${formErrors.fecha_limite ? 'has-error' : ''}`}
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
              {formErrors.fecha_limite && (
                <span className="form-error">{formErrors.fecha_limite}</span>
              )}
            </div>
          </div>

          <fieldset
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-md)',
            }}
          >
            <legend className="form-label">Opciones de fecha</legend>
            <div className="stack">
              {opciones.map((o, i) => (
                <div
                  key={o.id ?? i}
                  className="row"
                  style={{ alignItems: 'flex-end', gap: 'var(--space-sm)' }}
                >
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label className="form-label" htmlFor={`ee-oi-${i}`}>
                      Inicio
                    </label>
                    <input
                      id={`ee-oi-${i}`}
                      type="datetime-local"
                      className={`form-input ${
                        formErrors[`opciones.${i}.fecha_inicio`] ? 'has-error' : ''
                      }`}
                      value={o.fecha_inicio}
                      onChange={(e) => updateOpcion(i, 'fecha_inicio', e.target.value)}
                    />
                    {formErrors[`opciones.${i}.fecha_inicio`] && (
                      <span className="form-error">
                        {formErrors[`opciones.${i}.fecha_inicio`]}
                      </span>
                    )}
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label className="form-label" htmlFor={`ee-of-${i}`}>
                      Fin
                    </label>
                    <input
                      id={`ee-of-${i}`}
                      type="datetime-local"
                      className={`form-input ${
                        formErrors[`opciones.${i}.fecha_fin`] ? 'has-error' : ''
                      }`}
                      value={o.fecha_fin}
                      onChange={(e) => updateOpcion(i, 'fecha_fin', e.target.value)}
                    />
                    {formErrors[`opciones.${i}.fecha_fin`] && (
                      <span className="form-error">
                        {formErrors[`opciones.${i}.fecha_fin`]}
                      </span>
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
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-md"
              onClick={addOpcion}
            >
              <Icon icon="mdi:plus" width="18" /> Añadir opción
            </button>
          </fieldset>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/encuestas/${id}`)}
              disabled={savingForm}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingForm}>
              {savingForm ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Card>

      {/* ─── DESTINATARIOS ACTUALES (READ-ONLY) ────────────────────────── */}
      <Card>
        <CardHeader>
          <strong>
            <Icon icon="mdi:account-multiple" /> Destinatarios actuales (
            {destinatarios.length})
          </strong>
        </CardHeader>
        <CardBody>
          <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
            Solo se pueden AÑADIR destinatarios. Los existentes no se pueden eliminar
            ni modificar desde aquí (esto evita romper votos ya emitidos).
          </p>

          {destinatarios.length === 0 ? (
            <p className="empty-state" style={{ margin: 0 }}>
              Aún no hay destinatarios.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)',
              }}
            >
              {destinatarios.map((d) => (
                <li key={d.id}>
                  <span
                    className="badge badge-success"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Icon icon="mdi:account-check" width="13" />
                    {d.usuario?.name || d.usuario?.email || 'Usuario'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* ─── AÑADIR NUEVO DESTINATARIO (POST) ──────────────────────────── */}
      <Card>
        <CardHeader>
          <strong>
            <Icon icon="mdi:account-plus" /> Añadir destinatario
          </strong>
        </CardHeader>
        <CardBody>
          <form className="form" onSubmit={handleAddDestinatario} noValidate>
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                <label className="form-label" htmlFor="ee-newdest">
                  Email del nuevo destinatario
                </label>
                <input
                  id="ee-newdest"
                  type="email"
                  className={`form-input ${addError ? 'has-error' : ''}`}
                  value={nuevoEmail}
                  placeholder="persona@ejemplo.com"
                  autoComplete="off"
                  onChange={(e) => {
                    setNuevoEmail(e.target.value);
                    setAddError('');
                  }}
                />
                {addError && <span className="form-error">{addError}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={adding}>
                {adding ? (
                  'Añadiendo…'
                ) : (
                  <>
                    <Icon icon="mdi:plus" width="18" /> Añadir
                  </>
                )}
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
