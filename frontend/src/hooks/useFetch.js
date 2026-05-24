import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '../services/api';

// Handlers globales inyectados por AuthContext / App.
let unauthorizedHandler = null;
let connectionErrorHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function setConnectionErrorHandler(fn) {
  connectionErrorHandler = fn;
}

/**
 * Construye query string limpia (sin valores vacíos)
 */
function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      q.append(k, v);
    }
  });
  return q.toString();
}

/**
 * Petición de bajo nivel a la API. Devuelve los datos parseados o lanza un
 * Error con { status, data, errors, isConnectionError }.
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, params, headers = {}, silent = false } = options;

  const token = localStorage.getItem('token');

  let url = `${API_URL}${path}`;

  // Añadir query params
  if (params && Object.keys(params).length > 0) {
    const qs = buildQuery(params);
    if (qs) url += `?${qs}`;
  }

  const fetchOptions = {
    method,
    headers: { Accept: 'application/json', ...headers },
  };

  if (body !== undefined) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  if (token) {
    fetchOptions.headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch {
    if (connectionErrorHandler) connectionErrorHandler();
    const err = new Error('No se pudo conectar con el servidor.');
    err.isConnectionError = true;
    throw err;
  }

  // Parseo seguro del cuerpo.
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (response.ok) {
    return data;
  }

  const error = new Error((data && data.message) || 'Se produjo un error.');
  error.status = response.status;
  error.data = data;

  switch (response.status) {
    case 401:
      if (!silent) toast.error('Tu sesión ha caducado. Inicia sesión de nuevo.');
      if (unauthorizedHandler) unauthorizedHandler();
      break;
    case 403:
      if (!silent) toast.error('No tienes permisos para realizar esta acción.');
      break;
    case 422:
      error.errors = (data && data.errors) || {};
      break;
    default:
      if (response.status >= 500) {
        if (!silent) toast.error('Error interno del servidor.');
      } else if (!silent && data && data.message) {
        toast.error(data.message);
      }
  }

  throw error;
}

export default function useFetch(path, { immediate = true, params, silent = false } = {}) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params || {});

  const execute = useCallback(
    async (overrideParams) => {
      if (!path) return undefined;
      setLoading(true);
      setError(null);

      try {
        const result = await apiRequest(path, {
          params: overrideParams || params,
          silent, // suprime toasts (útil para llamadas que pueden devolver 403 esperado)
        });

        // Si la API devuelve paginación real, tendrá { data, meta, links }
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          setData(result.data);
          setMeta(result.meta);
          setLinks(result.links);
        } else {
          // Respuesta simple (sin paginación)
          setData(result);
          setMeta(null);
          setLinks(null);
        }

        return result;
      } catch (err) {
        setError(err);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, paramsKey]
  );

  useEffect(() => {
    if (immediate && path) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, path]);

  return { data, meta, links, loading, error, refetch: execute, setData };
}