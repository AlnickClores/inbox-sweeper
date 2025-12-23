import styles from "../styles/emails.module.css";

interface ShowMoreProps {
  loadMore: () => void;
}

const SeeMoreBtn = ({ loadMore }: ShowMoreProps) => {
  return (
    <button onClick={loadMore} className={styles.seeMoreBtn}>
      Show 10 More
    </button>
  );
};

export default SeeMoreBtn;
