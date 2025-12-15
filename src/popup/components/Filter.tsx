import styles from "../styles/filter.module.css";

const Filter = () => {
  return (
    <div className={styles.card}>
      <div className={styles.filterGroup}>
        <label>Order</label>
        <select name="order" className={styles.select}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Date Range</label>
        <select name="dateRange" className={styles.select}>
          <option value="all">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>
    </div>
  );
};

export default Filter;
