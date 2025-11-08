import React from "react";

const TrustScorePanel = ({ trustScores, setFilters }) => {
  if (!trustScores || trustScores.length === 0) {
    return <p style={{ opacity: 0.6 }}>No trust score data yet.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>District Trust Scores</h3>
      {trustScores.map((item, index) => (
        <div 
          key={index}
          className="trust-item"
          onClick={() => setFilters({ district: item.district })}
        >
          <strong>{item.district}, {item.state}</strong>
          <span style={{ float: "right" }}>{item.stars} ⭐</span>
        </div>
      ))}
    </div>
  );
};

export default TrustScorePanel;
