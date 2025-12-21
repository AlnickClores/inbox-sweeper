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
            <div className={styles.emailLeft}>
              <span className={styles.emailIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke="#111827"
                  id="Envelope--Streamline-Mynaui"
                  height="28"
                  width="28"
                >
                  <desc>
                    Envelope Streamline Icon: https://streamlinehq.com
                  </desc>
                  <path
                    d="m2.357 7.714 6.98 4.654c0.963 0.641 1.444 0.962 1.964 1.087a3 3 0 0 0 1.398 0c0.52 -0.125 1.001 -0.446 1.963 -1.087l6.98 -4.654M7.158 19.5h9.686c1.68 0 2.52 0 3.162 -0.327a3 3 0 0 0 1.31 -1.311c0.328 -0.642 0.328 -1.482 0.328 -3.162V9.3c0 -1.68 0 -2.52 -0.327 -3.162a3 3 0 0 0 -1.311 -1.311c-0.642 -0.327 -1.482 -0.327 -3.162 -0.327H7.157c-1.68 0 -2.52 0 -3.162 0.327a3 3 0 0 0 -1.31 1.311c-0.328 0.642 -0.328 1.482 -0.328 3.162v5.4c0 1.68 0 2.52 0.327 3.162a3 3 0 0 0 1.311 1.311c0.642 0.327 1.482 0.327 3.162 0.327"
                    stroke-width="1.5"
                  ></path>
                </svg>
              </span>
              <div className={styles.emailDetails}>
                <p className={styles.emailName}>Name</p>
                <p className={styles.smallText}>{email.email}</p>
              </div>
            </div>
            <div className={styles.emailCount}>
              <span className={styles.emailCountInner}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  height="20"
                  width="20"
                >
                  <g id="moving-fill">
                    <path
                      id="Union"
                      fill="#296cd8"
                      d="M21 6c0.0587 0 0.116 0.00593 0.1719 0.01562 0.0071 0.00124 0.0144 0.00154 0.0215 0.00293 0.0158 0.00311 0.0312 0.00787 0.0468 0.01172 0.017 0.00418 0.0341 0.00763 0.0508 0.0127 0.0491 0.01491 0.096 0.0347 0.1416 0.05664 0.0415 0.01995 0.0821 0.04234 0.1211 0.06836 0.1116 0.0744 0.2074 0.17028 0.2813 0.28223 0.0451 0.06842 0.0798 0.1415 0.1064 0.21679 0.0047 0.01338 0.0105 0.02641 0.0147 0.04004 0.0062 0.02029 0.0107 0.04096 0.0156 0.06152C21.9893 6.84293 22 6.92023 22 7v4c0 0.5523 -0.4477 1 -1 1s-1 -0.4477 -1 -1V9.41406L15.6211 13.793c-1.1715 1.1713 -3.0707 1.1713 -4.2422 0l-1.1719 -1.1719c-0.39044 -0.3903 -1.02354 -0.3903 -1.41403 0L3.95703 17.457c-0.39051 0.3905 -1.02353 0.3905 -1.41406 0s-0.39053 -1.0235 0 -1.414l4.83594 -4.836c1.17153 -1.1713 3.07069 -1.1713 4.24219 0l1.1719 1.1719c0.3905 0.3903 1.0236 0.3903 1.414 0L18.5859 8H17c-0.5523 0 -1 -0.44772 -1 -1s0.4477 -1 1 -1z"
                      stroke-width="1"
                    ></path>
                  </g>
                </svg>
                <p className={styles.largeText}>{email.count}</p>
              </span>
              <p className={styles.smallText}>emails</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmailList;
