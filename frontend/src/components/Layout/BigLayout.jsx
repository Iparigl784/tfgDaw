import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from '../../pages/modules/BigLayout.module.css';

/**
 * Layout principal de la aplicación (rutas con cabecera y pie).
 * Estructura: Navbar + contenido (Outlet) + Footer.
 * Las páginas de autenticación usan AuthLayout (sin cabecera ni pie).
 */
export default function BigLayout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
