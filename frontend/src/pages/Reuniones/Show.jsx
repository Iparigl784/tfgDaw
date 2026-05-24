import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import useFetch, { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import MiniCarousel from '../../components/Common/MiniCarousel';
import { formatFechaHora, labelEstado } from '../../utils/formatters';
import styles from './Show.module.css';

const ESTADOS_NO_EDITABLES = ['pendiente_encuesta', 'cancelada', 'realizada'];
const ESTADOS_BLOQUEO_ASISTENTES = ['cancelada', 'realizada'];

/**
 * Badge según estado del asistente. Es PURAMENTE INFORMATIVO en esta vista;
 * la acción de confirmar/rechazar se hace desde /mis-invitaciones.
 */
const asistenteBadge = (estado) => {
  if (estado === 'confirmado' || estado === 'asistido') return 'badge-success';
  if (estado === 'no_asistido' || estado === 'rechazado') return 'badge-danger';
  return 'badge-warning';
};

export default function ReunionShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data, loading, error, refetch } = useFetch(endpoints.reunion(id));
  const reunion = data?.data ?? data;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingSpinner label="Cargando reunión…" />;
  if (error && !error.isConnectionError)
    return <div className="error-banner">No se pudo cargar la reunión.</div>;
  if (!reunion) return null;

  const creadorInfo = reunion.usuario || reunion.creador;
  const esCreador = creadorInfo?.id === user?.id;
  const puedeGestionar = esCreador || isAdmin;

  const noEditable = ESTADOS_NO_EDITABLES.includes(reunion.estado);
  const noEliminarAsistentes = ESTADOS_BLOQUEO_ASISTENTES.includes(reunion.estado);
  const reunionRealizada = reunion.estado === 'realizada';
  const reunionPendienteEncuesta = reunion.estado === 'pendiente_encuesta';
  const reunionCancelada = reunion.estado === 'cancelada';

  const puedeEditar = puedeGestionar && !noEditable;
  const puedeEliminar = isAdmin || (esCreador && !reunionRealizada && !reunionPendienteEncuesta);
  const bloqueoEliminarPorRealizada = esCreador && !isAdmin && reunionRealizada;

  const tieneEncuesta = !!reunion.encuesta;

  // Destinatarios solo tiene sentido si hay encuesta.
  const destinatarios = tieneEncuesta ? reunion.encuesta?.destinatarios || [] : [];
  const asistentes = reunion.asistentes || [];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiRequest(endpoints.reunion(id), { method: 'DELETE' });
      toast.success('Reunión eliminada correctamente.');
      navigate('/reuniones');
    } catch (err) {
      if (err.status === 403) {
        toast.error(
          err.data?.message ||
            'No tienes permiso para eliminar esta reunión (puede que ya esté realizada).'
        );
      } else if (!err.isConnectionError) {
        toast.error('No se pudo eliminar la reunión.');
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  /**
   * Eliminar asistente. Solo disponible para creador/admin
   */
  const eliminarAsistente = async (asistenteId) => {
    try {
      await apiRequest(endpoints.asistenteDestroy(id, asistenteId), { method: 'DELETE' });
      toast.success('Asistente eliminado.');
      refetch();
    } catch (err) {
      if (!err.isConnectionError) toast.error('No se pudo eliminar el asistente.');
    }
  };

  return (
    <div className="stack">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/reuniones')}>
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>

      {/* Ficha principal de la reunión */}
      <Card>
        <CardHeader>
          <h1 className="page-title">{reunion.titulo}</h1>
          <span className={`badge ${reunion.estado === 'cancelada' ? 'badge-danger' : 'badge-success'}`}>
            {labelEstado(reunion.estado)}
          </span>
        </CardHeader>
        <CardBody>
          {reunion.descripcion && <p>{reunion.descripcion}</p>}
          {reunion.lugar && (
            <span>
              <Icon icon="mdi:map-marker-outline" /> {reunion.lugar}
            </span>
          )}
          <span>
            <Icon icon="mdi:calendar-start" /> Inicio: {formatFechaHora(reunion.fecha_inicio)}
          </span>
          <span>
            <Icon icon="mdi:calendar-end" /> Fin: {formatFechaHora(reunion.fecha_fin)}
          </span>
          {creadorInfo && (
            <div className={styles.creador}>
              <Icon icon="mdi:account-circle" width="22" color="var(--color-primary)" />
              <div className={styles.creadorInfo}>
                <strong>Organiza {creadorInfo.name}</strong>
                {creadorInfo.email && <span>{creadorInfo.email}</span>}
              </div>
            </div>
          )}
        </CardBody>
        {(puedeEditar || puedeEliminar) && (
          <CardFooter>
            {puedeEditar && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/reuniones/${id}/edit`)}
              >
                <Icon icon="mdi:pencil" width="16" /> Editar
              </button>
            )}
            {puedeEliminar && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Icon icon="mdi:trash-can-outline" width="16" /> Eliminar
              </button>
            )}
          </CardFooter>
        )}
      </Card>

      {(reunionCancelada || reunionRealizada) && (
        <div className={styles.aviso}>
          <Icon icon="mdi:information-outline" width="22" />
          <div>
            <strong>
              Esta reunión ya no puede modificarse porque está {labelEstado(reunion.estado)}.
            </strong>
          </div>
        </div>
      )}

      {bloqueoEliminarPorRealizada && (
        <div className={styles.aviso}>
          <Icon icon="mdi:information-outline" width="22" />
          <div>
            <strong>Esta reunión ya se ha realizado.</strong>
            <p>
              Las reuniones marcadas como realizadas no se pueden eliminar.
              Si necesitas borrarla, contacta con un administrador.
            </p>
          </div>
        </div>
      )}

      {/* Encuesta asociada (solo si la reunión es multi-fecha) */}
      {tieneEncuesta && (
        <Card variant="highlight">
          <CardHeader>
            <strong>
              <Icon icon="mdi:poll" /> Encuesta asociada
            </strong>
            <span className="badge">{labelEstado(reunion.encuesta.estado)}</span>
          </CardHeader>
          <CardBody>{reunion.encuesta.titulo}</CardBody>
          <CardFooter>
            <Link to={`/encuestas/${reunion.encuesta.id}`} className="btn btn-secondary btn-sm">
              Ver encuesta
            </Link>
          </CardFooter>
        </Card>
      )}

      {/*
        ─── DESTINATARIOS (solo si hay encuesta) ──────────────────────────────
        Lista compacta. Si hay > 3, MiniCarousel cambia automáticamente a
        carrusel horizontal con scroll-snap. No hay acciones aquí.
      */}
      {tieneEncuesta && (
        <section className="stack">
          <h2 className="page-title" style={{ fontSize: '1.3rem' }}>
            Destinatarios de la encuesta ({destinatarios.length})
          </h2>

          {destinatarios.length === 0 ? (
            <div className="empty-state">
              La encuesta no tiene destinatarios asignados todavía.
            </div>
          ) : (
            <MiniCarousel
              personas={destinatarios.map((d) => ({
                id: d.id,
                name: d.usuario?.name || 'Usuario',
                email: d.usuario?.email,
              }))}
            />
          )}
        </section>
      )}

      {/*
        ─── ASISTENTES ─────────────────────────────────
        Compactos con avatar + nombre + estado. Si hay > 3 → carrusel.
      */}
      <section className="stack">
        <h2 className="page-title" style={{ fontSize: '1.3rem' }}>
          Asistentes ({asistentes.length})
        </h2>

        {asistentes.length === 0 ? (
          <div className="empty-state">
            {tieneEncuesta
              ? 'Aún no hay asistentes. Se crearán cuando se cierre la encuesta con la fecha ganadora.'
              : 'Aún no hay asistentes para esta reunión.'}
          </div>
        ) : (
          <MiniCarousel
            personas={asistentes.map((a) => ({
              id: a.id,
              name: a.usuario?.name || a.nombre || 'Invitado',
              email: a.usuario?.email || a.email,
              estado: a.estado,
              badgeClass: asistenteBadge(a.estado),
              onDelete:
                puedeGestionar && !noEliminarAsistentes
                  ? () => eliminarAsistente(a.id)
                  : undefined,
            }))}
            estadoLabel={labelEstado}
          />
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Eliminar reunión"
        message="¿Seguro que quieres eliminar esta reunión? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
