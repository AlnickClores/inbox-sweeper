import Filter from "./Filter";
import type { CachedMessage } from "../types/type";
import styles from "../styles/emails.module.css";

interface EmailListProps {
  cachedEmails: CachedMessage[];
}

const EmailList = ({ cachedEmails }: EmailListProps) => {
  return (
    <div>
      <Filter />

      <div className={styles.emailList}>
        {cachedEmails.map((email) => (
          <button key={email.id} className={styles.emailItem}>
            <p>{email.from}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmailList;
