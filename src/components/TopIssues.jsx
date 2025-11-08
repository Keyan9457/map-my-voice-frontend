import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TopIssues.css";

const API_BASE = "https://map-my-voice-backend.onrender.com/api";

export default function TopIssues() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const load = () => {
      axios.get(`${API_BASE}/incidents/`).then(res => {
        const sorted = [...res.data]
          .filter(i => i.upvotes > 0)
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 5);
        setIssues(sorted);
      });
    };

    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-issues-box">
      <h3>🔥 Top Citizen Issues Today</h3>
      <ul>
        {issues.length === 0 && <p>No top issues yet.</p>}
        {issues.map((i, idx) => (
          <li key={idx}>
            {idx + 1}) {i.theme} – "{i.comment}" <strong>({i.upvotes} upvotes)</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
