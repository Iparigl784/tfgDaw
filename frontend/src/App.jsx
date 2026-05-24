import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import BigLayout from './components/Layout/BigLayout';
import AuthLayout from './components/Layout/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import ConnectionError from './pages/Shared/ConnectionError';
import { setConnectionErrorHandler } from './hooks/useFetch';

import Inicio from './pages/Inicio/Inicio';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Me from './pages/Profile/Me';
import ListUsers from './pages/Users/ListUsers';
import UserEdit from './pages/Users/UserEdit';
import ReunionesList from './pages/Reuniones/List';
import ReunionCreate from './pages/Reuniones/Create';
import ReunionShow from './pages/Reuniones/Show';
import ReunionEdit from './pages/Reuniones/Edit';
import EncuestasList from './pages/Encuestas/List';
import EncuestaShow from './pages/Encuestas/Show';
import EncuestaCreate from './pages/Encuestas/Create';
import EncuestaEdit from './pages/Encuestas/Edit';
import MisReuniones from './pages/Reuniones/MisReuniones';
import MisAsistencias from './pages/Reuniones/MisAsistencias';
import MisEncuestas from './pages/Encuestas/MisEncuestas';
import InvitacionesList from './pages/Invitaciones/List';
import NotFound from './pages/Shared/NotFound';

export default function App() {
  const [connectionError, setConnectionError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setConnectionErrorHandler(() => setConnectionError(true));
    return () => setConnectionErrorHandler(null);
  }, []);

  // Al navegar, ocultamos el error para permitir reintentar.
  useEffect(() => {
    setConnectionError(false);
  }, [location.pathname]);

  if (connectionError) {
    return <ConnectionError onRetry={() => setConnectionError(false)} />;
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<BigLayout />}>
        <Route path="/" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        <Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute adminOnly><ListUsers /></ProtectedRoute>} />
        <Route path="/usuarios/:id" element={<ProtectedRoute adminOnly><UserEdit /></ProtectedRoute>} />
        <Route path="/reuniones" element={<ProtectedRoute><ReunionesList /></ProtectedRoute>} />
        <Route path="/reuniones/create" element={<ProtectedRoute><ReunionCreate /></ProtectedRoute>} />
        <Route path="/reuniones/:id/edit" element={<ProtectedRoute><ReunionEdit /></ProtectedRoute>} />
        <Route path="/reuniones/:id" element={<ProtectedRoute><ReunionShow /></ProtectedRoute>} />
        <Route path="/mis-reuniones" element={<ProtectedRoute><MisReuniones /></ProtectedRoute>} />
        <Route path="/mis-asistencias" element={<ProtectedRoute><MisAsistencias /></ProtectedRoute>} />
        <Route path="/encuestas" element={<ProtectedRoute><EncuestasList /></ProtectedRoute>} />
        <Route path="/encuestas/create" element={<ProtectedRoute><EncuestaCreate /></ProtectedRoute>} />
        <Route path="/encuestas/:id/edit" element={<ProtectedRoute><EncuestaEdit /></ProtectedRoute>} />
        <Route path="/encuestas/:id" element={<ProtectedRoute><EncuestaShow /></ProtectedRoute>} />
        <Route path="/mis-encuestas" element={<ProtectedRoute><MisEncuestas /></ProtectedRoute>} />
        <Route path="/mis-invitaciones" element={<ProtectedRoute><InvitacionesList /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
