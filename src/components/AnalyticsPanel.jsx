import React from "react";
import "./Form.css";
import './AnalyticsPanel.css';

const AnalyticsPanel = ({ mapData, chartData, filters, setFilters }) => {

  const totalReviews = chartData?.total_reviews ?? 0;
  const positivePercent = chartData?.positive_percent ?? 0;

  return (
    <div className="analytics-panel">

      {/* Review Summary */}
      <div className="stat-card">
        <h3>Total Reviews</h3>
        <p className="stat-value">{totalReviews}</p>
      </div>

      <div className="stat-card">
        <h3>Total Reviews</h3>
        <p>{mapData ? mapData.total_reviews : 0}</p>
      </div>


      {/* Time Filter */}
      <div className="filter-group">
        <label>Sentiment Time Range</label>
        <select
          value={filters.timeframe || ""}
          onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
        >
          <option value="">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

    </div>
  );
};

export default AnalyticsPanel;
