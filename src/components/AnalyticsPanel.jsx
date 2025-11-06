import React from 'react';
import ThemeChart from './ThemeChart';
import CountUp from 'react-countup';

const AnalyticsPanel = ({ mapData, chartData, filters, setFilters }) => {

  const calculateStats = () => {
    if (!mapData) return { totalReviews: 0, globalSentiment: 0 };

    let totalReviews = 0;
    let totalGoodReviews = 0;

    for (const country in mapData) {
      const reviews = mapData[country].total_reviews;
      const score = mapData[country].score;

      totalReviews += reviews;
      totalGoodReviews += reviews * score;
    }

    const globalSentiment = totalReviews > 0 
      ? Math.round((totalGoodReviews / totalReviews) * 100) 
      : 0;

    return { totalReviews, globalSentiment };
  };

  const stats = calculateStats();

  const activeFilterKey = Object.keys(filters)[0];
  const activeFilterValue = filters[activeFilterKey];

  return (
    <div className="analytics-content">

      {/* Active Filter Display */}
      {activeFilterKey && (
        <div className="filter-display">
          <p>
            Filtering by {activeFilterKey}: <strong>{activeFilterValue}</strong>
          </p>
          <button onClick={() => setFilters({})}>&times; Clear</button>
        </div>
      )}

      {/* === NEW TIME RANGE FILTER === */}
      <div className="form-group" style={{ marginBottom: "15px" }}>
        <label style={{ color: "#ccc", fontSize: "0.9em" }}>Time Range</label>
        <select
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            background: "#3e3e3e",
            color: "#fff",
            border: "1px solid #555"
          }}
          value={filters.timeframe || "all"}
          onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Stat Cards */}
      <div className="stat-card">
        <h3>Total Reviews</h3>
        <p><CountUp end={stats.totalReviews} duration={1.5} /></p>
      </div>

      <div className="stat-card">
        <h3>Global Sentiment</h3>
        <p>
          <CountUp end={stats.globalSentiment} duration={1.5} suffix="%" />
          <span style={{ fontSize: "0.6em", marginLeft: "4px" }}>Positive</span>
        </p>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ThemeChart chartData={chartData} setFilters={setFilters} />
      </div>

    </div>
  );
};

export default AnalyticsPanel;
