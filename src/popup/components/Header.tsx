import styles from "../styles/header.module.css";

const Header = ({
  name,
  handleScanInbox,
  isScanning,
}: {
  name: string;
  handleScanInbox: () => void;
  isScanning: boolean;
}) => {
  return (
    <div className={styles.headerContainer}>
      <div>
        <h1 className={styles.greeting}>
          {new Date().getHours() < 12
            ? "Good morning"
            : new Date().getHours() < 18
            ? "Good afternoon"
            : "Good evening"}
          , {name}
        </h1>
        <p className={styles.description}>
          Click scan to analyze your inbox and find your top email senders.
        </p>
      </div>
      <button
        className={`${styles.scanButton} ${isScanning ? styles.scanning : ""}`}
        onClick={handleScanInbox}
        disabled={isScanning}
      >
        <svg
          className={isScanning ? styles.spin : ""}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          stroke-linecap="round"
          stroke-linejoin="round"
          id="Scan--Streamline-Lucide"
          height="16"
          width="16"
        >
          <desc>Scan Streamline Icon: https://streamlinehq.com</desc>
          <path d="M3 7V5a2 2 0 0 1 2 -2h2" stroke-width="2"></path>
          <path d="M17 3h2a2 2 0 0 1 2 2v2" stroke-width="2"></path>
          <path d="M21 17v2a2 2 0 0 1 -2 2h-2" stroke-width="2"></path>
          <path d="M7 21H5a2 2 0 0 1 -2 -2v-2" stroke-width="2"></path>
        </svg>{" "}
        {isScanning ? "Scanning..." : "Scan Inbox"}
      </button>
    </div>
  );
};

export default Header;
