import styles from "../admin.module.css";

export default function Page() {
  return (
    <>
      <h1 className={styles.h1}>İçerik Fabrikası</h1>
      <section className={styles.card}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>∅</div>
          <p className={styles.muted}>Bu modül FAZ_3 step 3.6 kapsamında eklenecek.</p>
        </div>
      </section>
    </>
  );
}
