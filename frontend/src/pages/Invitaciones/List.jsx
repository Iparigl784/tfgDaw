import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import useFetch, { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Card from '../../components/UI/Card';
import EncuestaInvCard from '../../components/Invitaciones/EncuestaInvCard';
import ReunionInvCard from '../../components/Invitaciones/ReunionInvCard';
import CarouselContainer from '../../components/Invitaciones/CarouselContainer';

/**
 * Mis invitaciones
 */
export default function InvitacionesList() {
  const { data, loading, error, refetch } = useFetch(endpoints.invitaciones);

  // Tolerar respuesta paginada o array plano
  const items = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  // Filtros:
  const encuestasPendientes = useMemo(
    () => items.filter((i) => i.tipo === 'encuesta' && i.ha_votado === false),
    [items]
  );
  const reunionesPendientes = useMemo(
    () => items.filter((i) => i.tipo === 'reunion' && i.estado === 'pendiente'),
    [items]
  );

  // Mapa asistente_id → estado en curso ('confirmar'|'rechazar'|undefined).
  // Permite deshabilitar botones por-tarjeta sin bloquear toda la lista.
  const [respondiendo, setRespondiendo] = useState({});

  /**
   * Confirmar o rechazar invitación a reunión.
   */
  const responder = async (asistenteId, accion) => {
    if (!asistenteId) {
      toast.error('Falta el identificador del asistente.');
      return;
    }
    setRespondiendo((s) => ({ ...s, [asistenteId]: accion }));
    try {
      await apiRequest(
        accion === 'confirmar'
          ? endpoints.asistenteConfirmar(asistenteId)
          : endpoints.asistenteRechazar(asistenteId),
        { method: 'POST' }
      );
      toast.success(
        accion === 'confirmar' ? 'Asistencia confirmada.' : 'Has rechazado la invitación.'
      );
      // Refrescar → la card desaparecerá automáticamente porque su estado
      // dejará de ser 'pendiente'.
      refetch();
    } catch (err) {
      if (err.status === 403)
        toast.error('No tienes permiso para responder esta invitación.');
      else if (!err.isConnectionError)
        toast.error('No se pudo registrar tu respuesta.');
    } finally {
      setRespondiendo((s) => {
        const next = { ...s };
        delete next[asistenteId];
        return next;
      });
    }
  };

  if (loading) return <LoadingSpinner label="Cargando invitaciones…" />;

  if (error && !error.isConnectionError) {
    return <div className="error-banner">No se pudieron cargar tus invitaciones.</div>;
  }

  const totalPendientes = encuestasPendientes.length + reunionesPendientes.length;

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Mis invitaciones</h1>
      </div>

      {totalPendientes === 0 && (
        <div className="empty-state">
          <Icon icon="mdi:email-check-outline" width="28" />
          <p style={{ margin: 0 }}>No tienes invitaciones pendientes.</p>
        </div>
      )}

      {/* ─── Sección Encuestas ─────────────────────────────────────────────── */}
      <section className="stack">
        <h2 className="page-title" style={{ fontSize: '1.25rem' }}>
          <Icon icon="mdi:poll" /> Encuestas por votar ({encuestasPendientes.length})
        </h2>

        {encuestasPendientes.length === 0 ? (
          <Card variant="outlined">
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              No tienes encuestas pendientes de votar.
            </p>
          </Card>
        ) : (
          <CarouselContainer
            items={encuestasPendientes}
            renderItem={(inv) => (
              <EncuestaInvCard key={`enc-${inv.id}-${inv.recurso_id}`} inv={inv} />
            )}
          />
        )}
      </section>

      {/* ─── Sección Reuniones ─────────────────────────────────────────────── */}
      <section className="stack">
        <h2 className="page-title" style={{ fontSize: '1.25rem' }}>
          <Icon icon="mdi:calendar-account" /> Reuniones por confirmar ({reunionesPendientes.length})
        </h2>

        {reunionesPendientes.length === 0 ? (
          <Card variant="outlined">
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              No tienes reuniones pendientes de confirmar.
            </p>
          </Card>
        ) : (
          <CarouselContainer
            items={reunionesPendientes}
            renderItem={(inv) => (
              <ReunionInvCard
                key={`reu-${inv.id}-${inv.recurso_id}`}
                inv={inv}
                enProgreso={respondiendo[inv.asistente_id]}
                onResponder={(accion) => responder(inv.asistente_id, accion)}
              />
            )}
          />
        )}
      </section>
    </div>
  );
}
