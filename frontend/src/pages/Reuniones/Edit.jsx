import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import useFetch, { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toMySQL, toInputDateTime, labelEstado } from '../../utils/formatters';
import styles from './Show.module.css';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ESTADOS_NO_EDITABLES = ['pendiente_encuesta', 'cancelada', 'realizada'];

/**
 * Edición de reunión.
 */
export default function ReunionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data, loading, error, refetch } = useFetch(endpoints.reunion(id));
  const reunion = data?.data ?? data;

  // Usuarios para resolver email→user_id.
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

  // Estado del form principal (PUT)
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [savingForm, setSavingForm] = useState(false);

  // Form "añadir asistente" (POST)
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Init una sola vez
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!reunion || initialized) return;
    setTitulo(reunion.titulo || '');
    setDescripcion(reunion.descripcion || '');
    setLugar(reunion.lugar || '');
    setFechaInicio(reunion.fecha_inicio ? toInputDateTime(reunion.fecha_inicio) : '');
    setFechaFin(reunion.fecha_fin ? toInputDateTime(reunion.fecha_fin) : '');
    setInitialized(true);
  }, [reunion, initialized]);

  if (loading) return <LoadingSpinner label="Cargando reunión…" />;
  if (error && !error.isConnectionError)
    return <div className="error-banner">No se pudo cargar la reunión.</div>;
  if (!reunion) return null;

  const creadorInfo = reunion.usuario || reunion.creador;
  const esCreador = creadorInfo?.id === user?.id;
  const tienePermiso = esCreador || isAdmin;

  const noEditable = ESTADOS_NO_EDITABLES.includes(reunion.estado);

  if (!tienePermiso) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="error-banner">No tienes permiso para editar esta reunión.</div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/reuniones/${id}`)}
        >
          <Icon icon="mdi:arrow-left" width="18" /> Volver al detalle
        </button>
      </div>
    );
  }

  if (noEditable) {
    return (
      <div className="stack" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className={styles.aviso}>
          <Icon icon="mdi:information-outline" width="22" />
          <div>
            <strong>
              Esta reunión no puede modificarse porque está {labelEstado(reunion.estado)}.
            </strong>
            <p>
              Para volver al detalle pulsa el botón inferior.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/reuniones/${id}`)}
        >
          <Icon icon="mdi:arrow-left" width="18" /> Volver al detalle
        </button>
      </div>
    );
  }


  // ── Submit PUT ────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setFormErrors({});

    const e = {};
    if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
    if (!fechaInicio) e.fecha_inicio = 'La fecha de inicio es obligatoria.';
    if (!fechaFin) e.fecha_fin = 'La fecha de fin es obligatoria.';
    if (fechaInicio && fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
      e.fecha_fin = 'Debe ser posterior a la fecha de inicio.';
    }
    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      lugar: lugar.trim() || null,
      fechas: [
        {
          fecha_inicio: toMySQL(fechaInicio),
          fecha_fin: toMySQL(fechaFin),
        },
      ],
    };

    setSavingForm(true);
    try {
      await apiRequest(endpoints.reunion(id), { method: 'PUT', body: payload });
      toast.success('Reunión actualizada correctamente.');
      navigate(`/reuniones/${id}`);
    } catch (err) {
      if (err.status === 422) {
        setFormErrors(
          Object.fromEntries(
            Object.entries(err.errors || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        );
        toast.error('Revisa los campos del formulario.');
      } else if (err.status === 403) {
        toast.error('No tienes permiso para editar esta reunión.');
      } else if (!err.isConnectionError) {
        toast.error('No se pudo actualizar la reunión.');
      }
    } finally {
      setSavingForm(false);
    }
  };

  // ── Añadir asistente: POST /reuniones/{id}/asistentes ─────────────────────
  const handleAddAsistente = async (ev) => {
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
      await apiRequest(endpoints.asistentes(id), {
        method: 'POST',
        body: { email: u.email },
      });
      toast.success(`${u.name} añadido a la reunión.`);
      setNuevoEmail('');
      refetch();
    } catch (err) {
      if (err.status === 422)
        setAddError(err.data?.message || 'No se pudo añadir el asistente.');
      else if (err.status === 403) toast.error('No tienes permiso.');
      else if (!err.isConnectionError) toast.error('No se pudo añadir el asistente.');
    } finally {
      setAdding(false);
    }
  };

  const asistentes = reunion.asistentes || [];

  return (
    <div className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(`/reuniones/${id}`)}
      >
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>
      <h1 className="page-title">Editar reunión</h1>

      {/* ─── FORM PRINCIPAL (PUT) ──────────────────────────────────────── */}
      <Card>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="re-titulo">
              Título *
            </label>
            <input
              id="re-titulo"
              className={`form-input ${formErrors.titulo ? 'has-error' : ''}`}
              value={titulo}
              maxLength={150}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {formErrors.titulo && <span className="form-error">{formErrors.titulo}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="re-desc">
              Descripción
            </label>
            <textarea
              id="re-desc"
              className={`form-textarea ${formErrors.descripcion ? 'has-error' : ''}`}
              value={descripcion}
              maxLength={200}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            {formErrors.descripcion && (
              <span className="form-error">{formErrors.descripcion}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="re-lugar">
              Lugar
            </label>
            <input
              id="re-lugar"
              className="form-input"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
            />
          </div>

          <div className="row" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label" htmlFor="re-fi">
                Inicio *
              </label>
              <input
                id="re-fi"
                type="datetime-local"
                className={`form-input ${formErrors.fecha_inicio ? 'has-error' : ''}`}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              {formErrors.fecha_inicio && (
                <span className="form-error">{formErrors.fecha_inicio}</span>
              )}
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label" htmlFor="re-ff">
                Fin *
              </label>
              <input
                id="re-ff"
                type="datetime-local"
                className={`form-input ${formErrors.fecha_fin ? 'has-error' : ''}`}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
              {formErrors.fecha_fin && (
                <span className="form-error">{formErrors.fecha_fin}</span>
              )}
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/reuniones/${id}`)}
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

      {/* ─── ASISTENTES ACTUALES (READ-ONLY) ───────────────────────────── */}
      <Card>
        <CardHeader>
          <strong>
            <Icon icon="mdi:account-multiple" /> Asistentes actuales (
            {asistentes.length})
          </strong>
        </CardHeader>
        <CardBody>
          <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
            Solo se pueden AÑADIR asistentes. Los existentes no se pueden eliminar
            ni modificar desde aquí (esto evita romper confirmaciones ya emitidas).
          </p>
          {asistentes.length === 0 ? (
            <p className="empty-state" style={{ margin: 0 }}>
              Aún no hay asistentes.
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
              {asistentes.map((a) => {
                const cls =
                  a.estado === 'confirmado' || a.estado === 'asistido'
                    ? 'badge-success'
                    : a.estado === 'no_asistido' || a.estado === 'rechazado'
                    ? 'badge-danger'
                    : 'badge-warning';
                return (
                  <li key={a.id}>
                    <span
                      className={`badge ${cls}`}
                      title={a.usuario?.email || a.email}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Icon icon="mdi:account" width="13" />
                      {a.usuario?.name || a.nombre || 'Invitado'} ·{' '}
                      {labelEstado(a.estado)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* ─── AÑADIR NUEVO ASISTENTE (POST) ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <strong>
            <Icon icon="mdi:account-plus" /> Añadir asistente
          </strong>
        </CardHeader>
        <CardBody>
          <form className="form" onSubmit={handleAddAsistente} noValidate>
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                <label className="form-label" htmlFor="re-newasis">
                  Email del nuevo asistente
                </label>
                <input
                  id="re-newasis"
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
