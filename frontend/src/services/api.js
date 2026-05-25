// Mapeo de endpoints de la API REST.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(
  /\/$/,
  ''
);

export const endpoints = {
  // Auth (públicos)
  login: '/login',
  register: '/register',

  // Auth (protegidos)
  me: '/me',
  logout: '/logout',

  // Usuarios
  usuarios: '/usuarios',
  usuario: (id) => `/usuarios/${id}`,
  usuarioPassword: (id) => `/usuarios/${id}/password`,
  usuarioRol: (id) => `/usuarios/${id}/rol`,

  // Reuniones
  reuniones: '/reuniones',
  reunion: (id) => `/reuniones/${id}`,
  misReuniones: '/mis-reuniones',
  misAsistencias: '/mis-asistencias',

  // Asistentes
  asistentes: (reunionId) => `/reuniones/${reunionId}/asistentes`,
  asistente: (id) => `/asistentes/${id}`,
  asistenteDestroy: (reunionId, asistenteId) =>
    `/reuniones/${reunionId}/asistentes/${asistenteId}`,
  asistenteConfirmar: (id) => `/asistentes/${id}/confirmar`,
  asistenteRechazar: (id) => `/asistentes/${id}/rechazar`,

  // Encuestas
  encuestas: '/encuestas',
  encuesta: (id) => `/encuestas/${id}`,
  encuestaCerrar: (id) => `/encuestas/${id}/cerrar`,
  misEncuestas: '/mis-encuestas',

  // Opciones de encuesta
  opciones: (encuestaId) => `/encuestas/${encuestaId}/opciones`,

  // Votos / respuestas
  votos: (encuestaId) => `/encuestas/${encuestaId}/votos`,
  misVotos: (encuestaId) => `/encuestas/${encuestaId}/mis-votos`,
  resultados: (encuestaId) => `/encuestas/${encuestaId}/resultados`,

  // Destinatarios
  destinatarios: (encuestaId) => `/encuestas/${encuestaId}/destinatarios`,
  destinatarioDestroy: (encuestaId, destinatarioId) =>
    `/encuestas/${encuestaId}/destinatarios/${destinatarioId}`,

  invitaciones: '/invitaciones',
};

export default endpoints;
