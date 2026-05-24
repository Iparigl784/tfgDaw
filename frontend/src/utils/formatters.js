import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

export function formatFechaHora(value) {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format('D MMM YYYY, HH:mm') : '—';
}

export function formatFecha(value) {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format('D MMM YYYY') : '—';
}

/** Distancia relativa: "ejemplo: hace 3 días..." */
export function formatRelativo(value) {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.fromNow() : '—';
}

/** Convierte un valor de <input datetime-local> a ISO para enviar al backend. */
export function toISO(value) {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.toISOString() : null;
}

/** Convierte un ISO del backend al formato que espera <input datetime-local>. */
export function toInputDateTime(value) {
  if (!value) return '';

  // Soporta ISO y MySQL
  const d = dayjs(value, [
    dayjs.ISO_8601,
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DDTHH:mm:ss',
  ]);

  return d.isValid() ? d.format('YYYY-MM-DDTHH:mm') : '';
}

/** Convierte una fecha a formato MySQL: YYYY-MM-DD HH:mm:ss */
export function toMySQL(value) {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : null;
}

/** Inicio del día (00:00:00) en formato MySQL — para el filtro `desde`. */
export function toMySQLDayStart(value) {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.startOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
}

/** Fin del día (23:59:59) en formato MySQL — para el filtro `hasta`. */
export function toMySQLDayEnd(value) {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.endOf('day').format('YYYY-MM-DD HH:mm:ss') : null;
}

const ESTADO_LABELS = {
  // Reuniones
  pendiente_encuesta: 'Pendiente de encuesta',
  programada: 'Programada',
  cancelada: 'Cancelada',
  // Encuestas
  activa: 'Activa',
  cerrada: 'Cerrada',
  // Asistentes
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  asistido: 'Asistió',
  no_asistido: 'No asistió',
  rechazado: 'Rechazado',
};

export function labelEstado(estado) {
  if (!estado) return '—';
  return ESTADO_LABELS[estado] || estado;
}
