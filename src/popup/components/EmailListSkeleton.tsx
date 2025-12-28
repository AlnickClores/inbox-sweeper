import styles from "../styles/emailSkeleton.module.css";

export const EmailSkeleton = () => {
  return (
    <div className={styles.skeletonRow}>
      <div className={`${styles.checkbox} ${styles.pulse}`} />

      <div className={styles.content}>
        <div className={`${styles.lineSmall} ${styles.pulse}`} />
        <div className={`${styles.lineMedium} ${styles.pulse}`} />
      </div>

      <div className={styles.count}>
        <div className={`${styles.countLarge} ${styles.pulse}`} />
        <div className={`${styles.countSmall} ${styles.pulse}`} />
      </div>
    </div>
  );
};

export const EmailListSkeleton = () => {
  return (
    <div className={styles.list}>
      {Array.from({ length: 10 }).map((_, i) => (
        <EmailSkeleton key={i} />
      ))}
    </div>
  );
};
