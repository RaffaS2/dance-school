// frontend/app/Login/Login.tsx
import Link from 'next/link'
import styles from './LoginModule.module.css' // Usando como CSS Module para evitar conflitos
import EntArtesLogo from '../Images/EntArtesLogo.png'

export default function Login() {
  return (
    <div className={styles.loginRoot}>

      {/* Círculos decorativos em tons pastéis/suaves */}
      <div className={styles.decorativeCircle} style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(212, 83, 126, 0.03)' }} />
      <div className={styles.decorativeCircle} style={{ width: 400, height: 400, bottom: -150, right: -150, background: 'rgba(127, 119, 221, 0.03)' }} />

      <div className={styles.logoArea}>
        <img 
            src={EntArtesLogo.src}
            className={styles.logoSymbol}
            width={380} // Ajustado para não dominar a tela toda mas ser visível
            height={380}
        />
      </div>

      <div className={styles.loginCard}>
        <h2 className={styles.formTitle}>Bem-vindo/a</h2>
        <p className={styles.formSubtitle}>Acede à tua conta para continuar</p>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email</label>
          <input className={styles.fieldInput} type="email" placeholder="o.teu@email.com" />
        </div>

        <div className={styles.fieldGroup} style={{ marginBottom: '0.4rem' }}>
          <label className={styles.fieldLabel}>Palavra-passe</label>
          <input className={styles.fieldInput} type="password" placeholder="••••••••" />
        </div>

        <a href="#" className={styles.forgotLink}>Esqueceste a palavra-passe?</a>

        <button className={styles.btnLogin}>Entrar</button>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>ou</span>
          <div className={styles.dividerLine} />
        </div>

        <p className={styles.registerRow}>
          Ainda não tens conta?{' '}
          <Link href="/register" className={styles.registerLink}>
            Regista-te aqui
          </Link>
        </p>
      </div>
    </div>
  )
}