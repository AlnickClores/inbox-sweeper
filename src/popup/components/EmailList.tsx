import Filter from "./Filter";
import SeeMoreBtn from "./SeeMoreBtn";
import { EmailListSkeleton } from "./EmailListSkeleton";
import type { CachedMessage } from "../types/type";
import styles from "../styles/emails.module.css";

interface EmailListProps {
  cachedEmails: CachedMessage[];
  loadMore: () => void;
  order: "asc" | "desc";
  onOrderChange: (value: "asc" | "desc") => void;
  handleSelectEmail: (email: string, messageIds: string[]) => void;
  selectedEmails: string[];
  isScanning: boolean;
}

const EmailList = ({
  cachedEmails,
  loadMore,
  order,
  onOrderChange,
  handleSelectEmail,
  selectedEmails,
  isScanning,
}: EmailListProps) => {
  return (
    <div>
      {isScanning ? (
        <EmailListSkeleton />
      ) : (
        <>
          {" "}
          <Filter order={order} onOrderChange={onOrderChange} />
          <div className={styles.emailList}>
            {cachedEmails.map((email) => {
              const isChecked = selectedEmails.includes(email.email);
              return (
                <div
                  key={email.email}
                  className={styles.emailItem}
                  onClick={() =>
                    handleSelectEmail(email.email, email.messageIds)
                  }
                >
                  <div className={styles.emailLeft}>
                    <div className={styles.checkbox}>
                      {isChecked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 16 16"
                          id="Check--Streamline-Core-Remix"
                          height="16"
                          width="16"
                        >
                          <desc>
                            Check Streamline Icon: https://streamlinehq.com
                          </desc>
                          <g id="Free Remix/Interface Essential/check--check-form-validation-checkmark-success-add-addition-tick">
                            <path
                              id="Vector 3969"
                              stroke="#243cc4ff"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2.5"
                              d="m0.7142857142857142 10.428571428571429 3.5386742857142854 3.082057142857143c0.4867885714285714 0.424 1.2278857142857142 0.36091428571428574 1.6360342857142856 -0.1392L15.285714285714285 1.857142857142857"
                            ></path>
                          </g>
                        </svg>
                      )}
                    </div>
                    <div className={styles.emailDetails}>
                      <p className={styles.emailName}>{email.name}</p>
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
                </div>
              );
            })}
          </div>
          <SeeMoreBtn loadMore={loadMore} />
        </>
      )}
    </div>
  );
};

export default EmailList;
