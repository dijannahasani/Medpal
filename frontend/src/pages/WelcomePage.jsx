import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/WelcomePage.module.css';

export default function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // In development keep the welcome page visible so devs can click Kyçu / Regjistrohu.
    // In production, if a token+user exist, redirect to the user's dashboard automatically.
    if (import.meta.env.DEV) return; // don't redirect during `npm run dev`

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Redirect to appropriate dashboard based on user role
        navigate(`/${userData.role}`);
      } catch (error) {
        // If user data is corrupted, clear it
        localStorage.clear();
      }
    }
  }, [navigate]);
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mirësevini në <span className={styles.highlight}>MedPal</span></h1>
        <p>Platformë digjitale për menaxhimin e shëndetit për Klinikë, Mjekë dhe Pacientë.</p>
      </header>

      <main className={styles.main}>
        <section className={styles.infoSection}>
          <div className={styles.card}>
            <h2>🏥 Për Klinikën</h2>
            <p>Menaxhoni mjekët dhe terminet në një sistem të thjeshtë dhe efikas.</p>
          </div>
          <div className={styles.card}>
            <h2>👩‍⚕️ Për Mjekët</h2>
            <p>Shihni oraret, pacientët dhe historikun shëndetësor me lehtësi.</p>
          </div>
          <div className={styles.card}>
            <h2>🧑‍🤝‍🧑 Për Pacientët</h2>
            <p>Rezervoni termine, ndiqni medikamentet dhe komunikoni me mjekun tuaj.</p>
          </div>
        </section>

        <section className={styles.authButtons}>
          <Link to="/login" className={styles.btnPrimary}>Kyçu</Link>
          <Link to="/register" className={styles.btnSecondary}>Regjistrohu</Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} MedPal. Të gjitha të drejtat të rezervuara.</p>
      </footer>
    </div>
  );
}
