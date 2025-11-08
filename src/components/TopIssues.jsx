import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TopIssues.css";

const TopIssues = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const loadIssues = () => {
      axios.get("http://127.0.0.1:8000/api/incidents/")
        .then(res => {
          const sorted = res.data
            .filter(i => i.upvotes > 0) // show only meaningful issues
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 5); // top 5
          setIssues(sorted);
        })
        .catch(err => console.error("Error fetching issues:", err));
    };

    loadIssues();
    const interval = setInterval(loadIssues, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-issues-card">
      <h3>🔥 Top Citizen Issues Today</h3>

      {issues.length === 0 ? (
        <p className="no-issues">No issues trending yet.</p>
      ) : (
        <ul>
          {issues.map((issue, index) => (
            <li key={issue.id}>
              <span className="rank">{index + 1}.</span>
              <span className="theme">{issue.theme} – </span>
              <span className="comment">"{issue.comment || "No description"}"</span>
              <span className="votes">({issue.upvotes} upvotes)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopIssues;
