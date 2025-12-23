import styles from "../styles/filter.module.css";

interface FilterProps {
  order: "asc" | "desc";
  onOrderChange: (value: "asc" | "desc") => void;
}

const Filter = ({ order, onOrderChange }: FilterProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.filterGroup}>
        <label>Order</label>
        <select
          name="order"
          value={order}
          onChange={(e) => onOrderChange(e.target.value as "asc" | "desc")}
          className={styles.select}
        >
          <option value="desc">Highest</option>
          <option value="asc">Lowest</option>
        </select>
      </div>

      {/* <div className={styles.filterGroup}>
        <label>Date Range</label>
        <select name="dateRange" className={styles.select}>
          <option value="all">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div> */}
    </div>
  );
};

export default Filter;
