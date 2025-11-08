import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LiveFeed.css";

export default function LiveFeed() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const loadFeed = () => {
      axios.get("https://map-my-voice-backend.onrender.com/api/latest-reviews/")
        .then(res => setFeed(res.data))
        .catch(err => console.log("Feed error:", err));
    };

    loadFeed();
    const interval = setInterval(loadFeed, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-feed-container">
      <h3 className="feed-title">Live Citizen Voices</h3>

      <div className="feed-scroll">
        {feed.map((item, i) => (
          <div key={i} className="feed-bubble">
            <span className="dot">●</span>
            <strong>{item.theme}</strong> – "{item.comment || "No additional notes"}"
          </div>
        ))}
      </div>
    </div>
  );
}
