import styles from "../styles/navbar.module.css";

const Navbar = ({ handleLogout }: { handleLogout: () => void }) => {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <span className={styles.logo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke="#ffffff"
            id="Envelope--Streamline-Mynaui"
            height="24"
            width="24"
          >
            <desc>Envelope Streamline Icon: https://streamlinehq.com</desc>
            <path
              d="m2.357 7.714 6.98 4.654c0.963 0.641 1.444 0.962 1.964 1.087a3 3 0 0 0 1.398 0c0.52 -0.125 1.001 -0.446 1.963 -1.087l6.98 -4.654M7.158 19.5h9.686c1.68 0 2.52 0 3.162 -0.327a3 3 0 0 0 1.31 -1.311c0.328 -0.642 0.328 -1.482 0.328 -3.162V9.3c0 -1.68 0 -2.52 -0.327 -3.162a3 3 0 0 0 -1.311 -1.311c-0.642 -0.327 -1.482 -0.327 -3.162 -0.327H7.157c-1.68 0 -2.52 0 -3.162 0.327a3 3 0 0 0 -1.31 1.311c-0.328 0.642 -0.328 1.482 -0.328 3.162v5.4c0 1.68 0 2.52 0.327 3.162a3 3 0 0 0 1.311 1.311c0.642 0.327 1.482 0.327 3.162 0.327"
              stroke-width="1.5"
            ></path>
          </svg>
        </span>
        <h1 className={styles.title}>SweepBox</h1>
      </div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke="#6b7280"
          id="Logout--Streamline-Mynaui"
          height="20"
          width="20"
        >
          <desc>Logout Streamline Icon: https://streamlinehq.com</desc>
          <path
            d="M13.496 21H6.5c-1.105 0 -2 -1.151 -2 -2.571V5.57c0 -1.419 0.895 -2.57 2 -2.57h7M16 15.5l3.5 -3.5L16 8.5m-6.5 3.496h10"
            stroke-width="1.5"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default Navbar;
