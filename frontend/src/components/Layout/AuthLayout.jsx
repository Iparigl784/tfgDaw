import { Outlet } from 'react-router-dom';
import styles from '../../pages/modules/AuthLayout.module.css';

/**
 * Layout para autenticación (login / registro).
 * No incluye Navbar ni Footer: solo centra el contenido en pantalla.
 */
export default function AuthLayout() {
  return (
    <div className={styles.shell}>
      <Outlet />
    </div>
  );
}
