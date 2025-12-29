import styles from "../styles/confirmationmodal.module.css";

interface ConfirmationModalProps {
  selectedEmails: { name: string; email: string }[];
  action: "trash" | "delete" | "unsubscribe" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const actionConfig = {
  trash: {
    title: "Move to Trash",
    message: "You are moving",
    confirmText: "Move to Trash",
  },
  delete: {
    title: "Delete Permanently",
    message: "You are permanently deleting",
    confirmText: "Delete",
  },
  unsubscribe: {
    title: "Unsubscribe",
    message: "You are unsubscribing from",
    confirmText: "Unsubscribe",
  },
};

const ConfirmationModal = ({
  selectedEmails,
  action,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  if (!action) return null;

  const config = actionConfig[action];

  return (
    <>
      <div className={styles.confirmationBackdrop} onClick={onCancel} />

      <div className={`${styles.confirmationModal} ${styles.show}`}>
        <div className={styles.confirmationContent}>
          <div className={styles.confirmationHeader}>
            <h2 className={styles.confirmationTitle}>{config.title}</h2>
            <button className={styles.confirmationClose} onClick={onCancel}>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                id="Cross-2--Streamline-Radix"
                height="20"
                width="20"
              >
                <desc>Cross 2 Streamline Icon: https://streamlinehq.com</desc>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12.567039999999999 4.300341333333334c0.23957333333333333 -0.23951999999999998 0.23957333333333333 -0.6278613333333334 0 -0.8673813333333332 -0.23946666666666666 -0.23951999999999998 -0.62784 -0.23951999999999998 -0.8673066666666667 0L8.000053333333334 7.132608 4.300416 3.43296c-0.23953066666666667 -0.23951999999999998 -0.627872 -0.23951999999999998 -0.867392 0 -0.23951999999999998 0.23951999999999998 -0.23951999999999998 0.6278613333333334 0 0.8673813333333332l3.699648 3.699648 -3.699648 3.6996373333333334c-0.23951999999999998 0.23957333333333333 -0.23951999999999998 0.62784 0 0.8674133333333334 0.23951999999999998 0.23946666666666666 0.6278613333333334 0.23946666666666666 0.867392 0l3.6996373333333334 -3.6996693333333335 3.69968 3.6996693333333335c0.23946666666666666 0.23946666666666666 0.62784 0.23946666666666666 0.8673066666666667 0 0.23957333333333333 -0.23957333333333333 0.23957333333333333 -0.62784 0 -0.8674133333333334L8.867434666666666 7.999989333333334l3.699605333333333 -3.699648Z"
                  fill="#6b7280"
                  stroke-width="1.0667"
                ></path>
              </svg>
            </button>
          </div>
          <p className={styles.confirmationMessage}>
            {config.message} {selectedEmails.length}{" "}
            {selectedEmails.length === 1 ? "email" : "emails"}:
          </p>
        </div>

        <div className={styles.confirmationEmailList}>
          {selectedEmails.map((email) => (
            <div key={email.email} className={styles.confirmationEmailItem}>
              <h4 className={styles.emailName}>{email.name}</h4>
              <p className={styles.emailAddress}>{email.email}</p>
            </div>
          ))}
        </div>

        <div className={styles.confirmationActions}>
          <button onClick={onCancel} className={styles.confirmationCancel}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.confirmationConfirm} ${
              styles[
                `confirm${action.charAt(0).toUpperCase() + action.slice(1)}`
              ]
            }`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
