import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LiveFeed.css";

const API_BASE = "https://map-my-voice-backend.onrender.com/api";

export default function LiveFeed() {
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get(`${API_BASE}/incidents/`).then(res => {
        setFeeds(res.data.slice(-10).reverse()); // show latest first
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh live
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-feed-box">
      <h3>Live Citizen Voices</h3>
      <div className="live-feed-list">
        {feeds.map((i, idx) => (
          <div key={idx} className="live-feed-item">
            <span className={i.report_type === "Bad" ? "red" : "green"}>●</span>
            <strong>{i.theme}</strong> – "{i.comment || "No additional notes"}"
          </div>
        ))}
      </div>
    </div>
  );
}
