import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import InputForm from './components/InputForm';
import AnalyticsPanel from './components/AnalyticsPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LiveFeed from "./components/LiveFeed";
import TopIssues from "./components/TopIssues";

function App() {

  const [mapLocation, setMapLocation] = useState({
    center: [20.5937, 78.9629],
    zoom: 5,
  });

  const [mapData, setMapData] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [trustScores, setTrustScores] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchAnalyticsData = (currentFilters = {}) => {
    if (!geoJsonData) setIsLoading(true);

    const params = new URLSearchParams(currentFilters).toString();

    Promise.all([
      axios.get(`https://map-my-voice-backend.onrender.com/api/map-data/?${params}`),
      axios.get(`https://map-my-voice-backend.onrender.com/api/chart-data/?${params}`)
    ])
      .then(([mapRes, chartRes]) => {
        setMapData(mapRes.data);
        setChartData(chartRes.data);
      })
      .catch(err => console.error("Error fetching analytics data:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnalyticsData(filters);
  }, [filters]);

  useEffect(() => {
    axios.get('/countries.json')
      .then((res) => setGeoJsonData(res.data))
      .catch(err => console.error("Error loading GeoJSON:", err));

    fetchAnalyticsData({});
  }, []);

  useEffect(() => {
    axios.get(`https://map-my-voice-backend.onrender.com/api/trust-scores/`)
      .then(res => setTrustScores(res.data))
      .catch(err => console.error("Error loading trust scores:", err));
  }, []);

  const handleLocationChange = (center, zoom) => {
    setMapLocation({ center, zoom });
  };

  const handleReviewSubmit = () => {
    fetchAnalyticsData(filters);
  };

  return (
    <div className="app-layout">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />

      <div className="dashboard-container">

        {/* LEFT PANEL */}
        <div className="panel left-panel">
          <h2>AI Analytics</h2>
          <AnalyticsPanel
            mapData={mapData}
            chartData={chartData}
            filters={filters}
            setFilters={setFilters}
            trustScores={trustScores}
          />
        </div>

        {/* CENTER MAP PANEL */}
        <div className="panel center-panel">
          <MapComponent
            location={mapLocation}
            geoJsonData={geoJsonData}
            mapData={mapData}
            isLoading={isLoading || !geoJsonData}
            setFilters={setFilters}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="panel right-panel">
          <InputForm
            onLocationChange={handleLocationChange}
            onReviewSubmit={handleReviewSubmit}
          />

          {/* ✅ LIVE FEED */}
          <LiveFeed />

          {/* ✅ TOP ISSUES (just added) */}
          <TopIssues />
        </div>

      </div>
    </div>
  );
}

export default App;
