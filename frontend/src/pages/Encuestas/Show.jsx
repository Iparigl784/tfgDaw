import { useEffect, useMemo, useState } from 'react';
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
import { formatFecha, formatFechaHora, labelEstado } from '../../utils/formatters';

export default function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // ---- Encuesta principal ---------------------------------------------------
  const {
    data: encuestaData,
    loading: loadingEncuesta,
    error: errorEncuesta,
    refetch: refetchEncuesta,
  } = useFetch(endpoints.encuesta(id));
  const encuesta = encuestaData?.data ?? encuestaData;

  // ---- Mis votos (LAZY) -----------------------------------------------------
  const {
    data: misVotosData,
    refetch: refetchMisVotos,
    setData: setMisVotosData,
  } = useFetch(endpoints.misVotos(id), { immediate: false, silent: true });
  const misVotos = misVotosData?.data ?? misVotosData ?? [];

  // ---- Resultados (públicos para gestores; silent también) ------------------
  const { data: resultadosData, refetch: refetchResultados } = useFetch(
    endpoints.resultados(id),
    { immediate: false, silent: true }
  );
  const resultados = resultadosData?.resultados || [];

  const [votando, setVotando] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── PERMISOS ──────────────────────────────────────────────────────────────
  const creadorInfo = encuesta?.usuario || encuesta?.creador;

  const esCreador = useMemo(
    () => !!(creadorInfo?.id && user?.id && creadorInfo.id === user.id),
    [creadorInfo?.id, user?.id]
  );

  // ¿Hay destinatarios asignados en la encuesta?
  const tieneDestinatarios = useMemo(
    () => Array.isArray(encuesta?.destinatarios) && encuesta.destinatarios.length > 0,
    [encuesta?.destinatarios]
  );

  // ¿El usuario actual está entre los destinatarios?
  const soyDestinatario = useMemo(
    () =>
      Array.isArray(encuesta?.destinatarios) &&
      encuesta.destinatarios.some((d) => (d.usuario?.id ?? d.user_id) === user?.id),
    [encuesta?.destinatarios, user?.id]
  );

  // ¿Tengo permiso para llamar a /mis-votos?
  const puedeVerMisVotos = esCreador || soyDestinatario;

  // ¿Puedo ver resultados? Creador, admin o destinatario.
  const puedeVerResultados = esCreador || isAdmin || soyDestinatario;

  // Cargar mis-votos cuando proceda (silent → no toast si devuelve 403).
  useEffect(() => {
    if (!encuesta?.id) return;
    if (puedeVerMisVotos) refetchMisVotos();
    else setMisVotosData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encuesta?.id, puedeVerMisVotos]);

  // Cargar resultados: admin/creador/destinatario.
  useEffect(() => {
    if (!encuesta?.id) return;
    if (puedeVerResultados) refetchResultados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encuesta?.id, puedeVerResultados]);

  // Determinar el voto actual del usuario
  const miVoto = useMemo(() => {
    if (!misVotos || misVotos.length === 0) return null;
    return misVotos[misVotos.length - 1];
  }, [misVotos]);

  const opcionVotadaId = miVoto?.opcion_encuesta_id;
  const miRespuesta = miVoto?.respuesta;

  const opciones = useMemo(() => encuesta?.opciones || [], [encuesta, misVotos]);

  if (loadingEncuesta) return <LoadingSpinner label="Cargando encuesta…" />;
  if (errorEncuesta && !errorEncuesta.isConnectionError)
    return <div className="error-banner">No se pudo cargar la encuesta.</div>;
  if (!encuesta) return null;

  // GESTIÓN: admin o creador, salvo que la encuesta esté `cerrada` o `expirada`.
  const cerrada = encuesta.estado === 'cerrada' || encuesta.estado === 'expirada';
  const activa = encuesta.estado === 'activa';
  const puedeGestionar = (esCreador || isAdmin) && !cerrada;

  // ── ELIMINACIÓN (regla 24h) ───────────────────────────────────────────────
  const fechaLimite = encuesta.fecha_limite ? new Date(encuesta.fecha_limite) : null;
  const horasRestantes = fechaLimite
    ? (fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60)
    : null;
  const faltanMenosDe24h = horasRestantes !== null && horasRestantes < 24;
  const puedeEliminar = isAdmin || (esCreador && !faltanMenosDe24h);
  // El bloqueo de eliminar SOLO por la regla de 24h.
  const bloqueoEliminarPor24h = esCreador && !isAdmin && faltanMenosDe24h;

  // VOTO: solo si encuesta activa Y el usuario es destinatario.
  // (El creador NO vota a menos que también esté en destinatarios.)
  const puedeVotar = activa && soyDestinatario;

  const totalVotos = (opcionId) =>
    resultados.find((r) => r.id === opcionId)?.total_votos ?? 0;

  // Votar (permite cambiar voto)
  const votar = async (opcionId, respuesta) => {
    if (!puedeVotar) {
      return;
    }

    setVotando(`${opcionId}-${respuesta}`);
    try {
      await apiRequest(endpoints.votos(id), {
        method: 'POST',
        body: { opcion_encuesta_id: opcionId, respuesta },
      });

      toast.success('Voto registrado correctamente.');

      await Promise.all([refetchMisVotos(), refetchResultados(), refetchEncuesta()]);
    } catch (err) {
      if (err.status === 422) toast.error(err.data?.message || 'No se pudo registrar el voto.');
      else if (err.status === 403) toast.error('No puedes votar en esta encuesta.');
      else if (!err.isConnectionError) toast.error('No se pudo registrar el voto.');
    } finally {
      setVotando(null);
    }
  };

  const cerrarEncuesta = async () => {
    setCerrando(true);
    try {
      await apiRequest(endpoints.encuestaCerrar(id), { method: 'POST' });
      toast.success('Encuesta cerrada correctamente.');
      await refetchEncuesta();
    } catch (err) {
      if (err.status === 400) toast.error(err.data?.message || 'La encuesta ya está cerrada.');
      else if (!err.isConnectionError) toast.error('No se pudo cerrar la encuesta.');
    } finally {
      setCerrando(false);
      setConfirmClose(false);
    }
  };

  const eliminar = async () => {
    setDeleting(true);
    try {
      await apiRequest(endpoints.encuesta(id), { method: 'DELETE' });
      toast.success('Encuesta eliminada correctamente.');
      navigate('/encuestas');
    } catch (err) {
      if (err.status === 403) {
        toast.error(
          err.data?.message ||
            'No tienes permiso para eliminar esta encuesta (puede que falten menos de 24h hasta la fecha límite).'
        );
      } else if (!err.isConnectionError) {
        toast.error('No se pudo eliminar la encuesta.');
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="stack">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/encuestas')}>
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>

      <Card>
        <CardHeader>
          <h1 className="page-title">{encuesta.titulo}</h1>
          <span
            className={`badge ${
              activa ? 'badge-success' : cerrada ? 'badge-info' : 'badge-danger'
            }`}
          >
            {labelEstado(encuesta.estado)}
          </span>
        </CardHeader>
        <CardBody>
          {encuesta.descripcion && <p>{encuesta.descripcion}</p>}
          <span>
            <Icon icon="mdi:clock-outline" /> Fecha límite: {formatFecha(encuesta.fecha_limite)}
          </span>
          {/*
            Información del creador.
          */}
          {creadorInfo && (
            <div className="row" style={{ alignItems: 'center', gap: 'var(--space-xs)' }}>
              <Icon icon="mdi:account-circle" width="22" color="var(--color-primary)" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <strong style={{ fontSize: '0.9rem' }}>Creada por {creadorInfo.name}</strong>
                {creadorInfo.email && (
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    {creadorInfo.email}
                  </span>
                )}
              </div>
            </div>
          )}
          {encuesta.reunion_id && (
            <Link to={`/reuniones/${encuesta.reunion_id}`}>
              <Icon icon="mdi:calendar" /> Ver reunión asociada
            </Link>
          )}
        </CardBody>
        {/*
          Footer de acciones.
          · Cerrada → solo Eliminar (si la regla de 24h lo permite).
          · Activa  → Editar / Cerrar / Eliminar.
          Si NO hay ninguna acción disponible, no se renderiza el footer.
        */}
        {(puedeGestionar || puedeEliminar) && (
          <CardFooter>
            {puedeGestionar && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/encuestas/${id}/edit`)}
              >
                <Icon icon="mdi:pencil" width="16" /> Editar
              </button>
            )}
            {puedeGestionar && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setConfirmClose(true)}
              >
                <Icon icon="mdi:lock-outline" width="16" /> Cerrar encuesta
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

      {/*
        Aviso al creador (no-admin) cuando ya no puede eliminar por la regla
        de las 24h. Solo informativo — el botón ya está oculto arriba.
      */}
      {bloqueoEliminarPor24h && (
        <div
          className="empty-state"
          style={{ borderLeft: '4px solid var(--color-info, #2563eb)' }}
        >
          <Icon icon="mdi:information-outline" />{' '}
          <strong>Esta encuesta ya no puede eliminarse.</strong>
          <p style={{ marginTop: 4, marginBottom: 0 }}>
            Quedan menos de 24 horas hasta la fecha límite. Como creador, ya no
            tienes permiso para borrarla. Si es necesario, contacta con un
            administrador.
          </p>
        </div>
      )}

      {/*
        Avisos contextuales:
         · Gestor + sin destinatarios → tip de cómo añadir.
         · Usuario no gestor + no destinatario → "no puedes votar" (sin revelar lista).
      */}
      {puedeGestionar && !tieneDestinatarios && (
        <div className="empty-state" style={{ borderLeft: '4px solid var(--color-warning, #d97706)' }}>
          <strong>Esta encuesta no tiene destinatarios asignados.</strong>
          <p style={{ marginTop: 4, marginBottom: 0 }}>
            Edita la encuesta para añadir destinatarios y permitir que voten.
          </p>
        </div>
      )}

      {!puedeGestionar && !soyDestinatario && (
        <div className="empty-state">
          No estás en la lista de destinatarios de esta encuesta, por lo que no
          puedes votar.
        </div>
      )}

      {/*
        ─── REUNIÓN ASOCIADA (solo si la encuesta tiene reunion completa) ─────
      */}
      {encuesta.reunion && typeof encuesta.reunion === 'object' && (
        <Card variant="highlight">
          <CardHeader>
            <strong>
              <Icon icon="mdi:calendar-check" /> Reunión asociada
            </strong>
            <span
              className={`badge ${
                encuesta.reunion.estado === 'programada' ? 'badge-success' : 'badge-warning'
              }`}
            >
              {labelEstado(encuesta.reunion.estado)}
            </span>
          </CardHeader>
          <CardBody>
            <strong>{encuesta.reunion.titulo}</strong>
            {encuesta.reunion.fecha_inicio && (
              <span>
                <Icon icon="mdi:calendar-start" /> Inicio:{' '}
                {formatFechaHora(encuesta.reunion.fecha_inicio)}
              </span>
            )}
            {encuesta.reunion.fecha_fin && (
              <span>
                <Icon icon="mdi:calendar-end" /> Fin: {formatFechaHora(encuesta.reunion.fecha_fin)}
              </span>
            )}
            {Array.isArray(encuesta.reunion.asistentes) &&
              encuesta.reunion.asistentes.length > 0 && (
                <span className="text-muted">
                  <Icon icon="mdi:account-multiple-check" /> Asistentes confirmados:{' '}
                  {
                    encuesta.reunion.asistentes.filter(
                      (a) => a.estado === 'confirmado' || a.estado === 'asistido'
                    ).length
                  }
                </span>
              )}
          </CardBody>
          <CardFooter>
            <Link
              to={`/reuniones/${encuesta.reunion.id || encuesta.reunion_id}`}
              className="btn btn-secondary btn-sm"
            >
              Ver reunión completa <Icon icon="mdi:arrow-right" width="16" />
            </Link>
          </CardFooter>
        </Card>
      )}

      <section className="stack">
        <h2 className="page-title" style={{ fontSize: '1.3rem' }}>
          {cerrada ? 'Resultados finales' : 'Opciones'}
        </h2>

        {opciones.length === 0 ? (
          <div className="empty-state">Esta encuesta no tiene opciones de fecha.</div>
        ) : (
          <div className="grid grid-cards">
            {opciones.map((o) => {
              const esMiVoto = o.id === opcionVotadaId;
              const esGanadora = cerrada && o.estado === 'aceptada';
              const esRechazada = cerrada && o.estado === 'rechazada';

              return (
                <Card
                  key={o.id}
                  variant={esGanadora ? 'selected' : esMiVoto ? 'selected' : 'default'}
                  style={esRechazada ? { opacity: 0.6 } : undefined}
                >
                  <CardHeader>
                    <strong>
                      <Icon icon="mdi:calendar-range" /> {formatFechaHora(o.fecha_inicio)}
                    </strong>
                    <div className="row" style={{ gap: 4 }}>
                      {esGanadora && (
                        <span className="badge badge-success">
                          <Icon icon="mdi:trophy" width="13" /> Ganadora
                        </span>
                      )}
                      <span className="badge badge-info">
                        {totalVotos(o.id)} {totalVotos(o.id) === 1 ? 'voto' : 'votos'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <span>Hasta {formatFechaHora(o.fecha_fin)}</span>
                  </CardBody>

                  {/*
                    Botones de votar solo visibles si encuesta ACTIVA.
                    Si cerrada → no se renderizan (solo lectura de resultados).
                  */}
                  {activa && (
                    <CardFooter>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={votando === `${o.id}-si` || !puedeVotar}
                        onClick={() => votar(o.id, 'si')}
                      >
                        <Icon icon="mdi:thumb-up-outline" width="16" />
                        {votando === `${o.id}-si`
                          ? 'Enviando…'
                          : esMiVoto && miRespuesta === 'si'
                          ? 'Tu voto'
                          : 'Sí'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={votando === `${o.id}-no` || !puedeVotar}
                        onClick={() => votar(o.id, 'no')}
                      >
                        <Icon icon="mdi:thumb-down-outline" width="16" />
                        {votando === `${o.id}-no`
                          ? 'Enviando…'
                          : esMiVoto && miRespuesta === 'no'
                          ? 'Tu voto'
                          : 'No'}
                      </button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {cerrada && !puedeVerResultados && (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            <Icon icon="mdi:lock-outline" /> Solo el creador, administradores y
            destinatarios pueden ver los recuentos detallados.
          </p>
        )}
      </section>

      {/*
        ─── DESTINATARIOS (solo si hay) ───────────────────────────────────────
        Lista informativa de quién puede votar la encuesta. Si hay > 3 →
        MiniCarousel cambia a carrusel horizontal automáticamente.
      */}
      {puedeGestionar && tieneDestinatarios && (
        <section className="stack">
          <h2 className="page-title" style={{ fontSize: '1.3rem' }}>
            Destinatarios ({encuesta.destinatarios.length})
          </h2>
          <MiniCarousel
            personas={encuesta.destinatarios.map((d) => ({
              id: d.id,
              name: d.usuario?.name || 'Usuario',
              email: d.usuario?.email,
            }))}
          />
        </section>
      )}

      <ConfirmDialog
        open={confirmClose}
        title="Cerrar encuesta"
        message="Al cerrar la encuesta dejará de admitir votos. ¿Continuar?"
        confirmLabel="Cerrar encuesta"
        loading={cerrando}
        onConfirm={cerrarEncuesta}
        onCancel={() => setConfirmClose(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Eliminar encuesta"
        message="¿Seguro que quieres eliminar esta encuesta? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={eliminar}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
