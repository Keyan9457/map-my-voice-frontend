import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import InputForm from './components/InputForm';
import AnalyticsPanel from './components/AnalyticsPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // --- STATE ---
  const [mapLocation, setMapLocation] = useState({
    center: [20.5937, 78.9629],
    zoom: 5,
  });
  const [mapData, setMapData] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  
  // 1. Add new state to hold the active filters
  // Example: { theme: 'Healthcare' } or { country: 'India' }
  const [filters, setFilters] = useState({});

  // --- DATA FETCHING ---
  
  // 2. Modify this function to send filters to the API
  const fetchAnalyticsData = (currentFilters) => {
    // We only set loading to true on the very first load
    if (!geoJsonData) {
        setIsLoading(true);
    }

    // Create URL parameters from the filter object
    // Example: { theme: 'Healthcare' } becomes "?theme=Healthcare"
    const params = new URLSearchParams(currentFilters).toString();
    
   Promise.all([
  axios.get(`https://map-my-voice-backend.onrender.com/api/map-data/?${params}`),
  axios.get(`https://map-my-voice-backend.onrender.com/api/chart-data/?${params}`)
])
    .then(([mapDataRes, chartDataRes]) => {
      setMapData(mapDataRes.data);
      setChartData(chartDataRes.data);
    })
    .catch(error => console.error("Error fetching analytics data:", error))
    .finally(() => {
      // Only stop the *initial* loading spinner
      if (isLoading) setIsLoading(false);
    });
  };

  // 3. Add a new useEffect hook
  // This hook watches for changes to the 'filters' state and re-fetches data
  useEffect(() => {
    console.log("Filters changed:", filters);
    fetchAnalyticsData(filters);
  }, [filters]); // Re-run when 'filters' state changes

  // This hook still runs only once to get the map boundaries
  useEffect(() => {
    axios.get('/countries.json')
      .then((res) => setGeoJsonData(res.data))
      .catch(error => console.error("Error fetching GeoJSON:", error));
    // We also call fetchAnalyticsData here for the initial load with no filters
    fetchAnalyticsData({});
  }, []); // Empty array ensures this runs only once on mount

  // --- HANDLERS ---
  
  const handleLocationChange = (center, zoom) => {
    setMapLocation({ center, zoom });
  };
  
  // This function is called by the form after a successful submission
  const handleReviewSubmit = () => {
    // Re-fetch data using the *current* active filters
    fetchAnalyticsData(filters);
  };

  return (
    <div className="app-layout">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
      
      <div className="dashboard-container">
        <div className="panel left-panel">
          <h2>AI Analytics</h2>
          {/* 4. Pass filters and setFilters to the AnalyticsPanel */}
          <AnalyticsPanel 
            mapData={mapData} 
            chartData={chartData}
            filters={filters}
            setFilters={setFilters} 
          />
        </div>

        <div className="panel center-panel">
          {/* 5. Pass setFilters to the MapComponent */}
          <MapComponent 
            location={mapLocation} 
            geoJsonData={geoJsonData}
            mapData={mapData}
            isLoading={isLoading || !geoJsonData}
            setFilters={setFilters} 
          />
        </div>

        <div className="panel right-panel">
          {/* 6. Make sure onReviewSubmit points to our new handler */}
          <InputForm 
            onLocationChange={handleLocationChange} 
            onReviewSubmit={handleReviewSubmit} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;

