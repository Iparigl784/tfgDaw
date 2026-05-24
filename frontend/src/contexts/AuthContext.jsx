import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiRequest, setUnauthorizedHandler } from '../hooks/useFetch';
import endpoints from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // GET /me — carga el usuario autenticado.
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      return null;
    }
    try {
      const res = await apiRequest(endpoints.me, { silent: true });
      const me = res?.data ?? res;
      setUser(me);
      return me;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  // Registra el handler de 401 para que useFetch pueda cerrar sesión.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Carga inicial del usuario si hay token.
  useEffect(() => {
    let active = true;
    (async () => {
      if (localStorage.getItem('token')) {
        await refreshUser();
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      const res = await apiRequest(endpoints.login, {
        method: 'POST',
        body: { email, password },
        silent: true,
      });
      const newToken = res?.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      const me = await refreshUser();
      return me;
    },
    [refreshUser]
  );

  const register = useCallback(async (payload) => {
    const res = await apiRequest(endpoints.register, {
      method: 'POST',
      body: payload,
      silent: true,
    });
    if (res?.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
    }
    const me = res?.data ?? null;
    if (me) setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest(endpoints.logout, { method: 'POST', silent: true });
    } catch {
      // Aunque falle en el servidor, limpiamos la sesión local.
    }
    clearSession();
    toast.success('Sesión cerrada correctamente.');
  }, [clearSession]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    isAdmin: user?.rol === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

export default AuthContext;
