import React from 'react';
import ThemeChart from './ThemeChart';
import CountUp from 'react-countup';

// 1. Receive 'filters' and 'setFilters' as props
const AnalyticsPanel = ({ mapData, chartData, filters, setFilters }) => {
  
  const calculateStats = () => {
    // ... (this function is unchanged)
    if (!mapData) return { totalReviews: 0, globalSentiment: 0 };
    let totalReviews = 0;
    let totalGoodReviews = 0;
    for (const country in mapData) {
      const reviews = mapData[country].total_reviews;
      const score = mapData[country].score;
      totalReviews += reviews;
      totalGoodReviews += reviews * score;
    }
    const globalSentiment = totalReviews > 0 ? (totalGoodReviews / totalReviews) * 100 : 0;
    return { totalReviews, globalSentiment: Math.round(globalSentiment) };
  };

  const stats = calculateStats();
  
  // 2. Check if any filters are active
  const activeFilterKey = Object.keys(filters)[0]; // e.g., 'theme' or 'country'
  const activeFilterValue = filters[activeFilterKey]; // e.g., 'Healthcare' or 'India'

  return (
    <div className="analytics-content">
      
      {/* 3. Add the filter display and clear button */}
      {/* This section will only appear if a filter is active */}
      {activeFilterKey && (
        <div className="filter-display">
          <p>
            Filtering by {activeFilterKey}: <strong>{activeFilterValue}</strong>
          </p>
          {/* By setting filters to an empty object, we clear them */}
          <button onClick={() => setFilters({})}>&times; Clear</button>
        </div>
      )}
      
      <div className="stat-card">
        <h3>Total Reviews</h3>
        <p><CountUp end={stats.totalReviews} duration={1.5} /></p>
      </div>
      <div className="stat-card">
        <h3>Global Sentiment</h3>
        <p>
          <CountUp end={stats.globalSentiment} duration={1.5} suffix="%" /> 
          <span style={{fontSize: "0.6em", marginLeft: "4px"}}>Positive</span>
        </p>
      </div>
      
      <div className="chart-container">
        {/* 4. Pass setFilters down to the chart */}
        <ThemeChart chartData={chartData} setFilters={setFilters} />
      </div>
    </div>
  );
};

export default AnalyticsPanel;

