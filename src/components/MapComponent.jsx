import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This helper component flies the map to a new location
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom]);
  return null;
}

// 1. Accept 'setFilters' as a prop
const MapComponent = ({ location, geoJsonData, mapData, isLoading, setFilters }) => {

  // Function to determine the color of a country based on its review score
  const getColor = (score) => {
    if (score === undefined) return '#808080'; // Gray
    return score > 0.75 ? '#238b45' : // Dark Green
           score > 0.5  ? '#74c476' : // Light Green
           score > 0.25 ? '#fe9929' : // Orange
                          '#d7301f';   // Red
  };

  // Function that styles each individual country feature
  const style = (feature) => {
    const countryName = feature.properties.name;
    const countryData = mapData ? mapData[countryName] : undefined;
    const score = countryData ? countryData.score : undefined;
    return { 
      fillColor: getColor(score), 
      weight: 1, 
      opacity: 1, 
      color: 'white', 
      dashArray: '3', 
      fillOpacity: 0.7 
    };
  };

  // Function to highlight a country on hover
  const highlightFeature = (e) => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#FFFFFF',
      dashArray: '',
      fillOpacity: 0.8,
    });
    layer.bringToFront();
  };

  // Function to reset the highlight on mouse out
  const resetHighlight = (e, feature) => {
    // We must pass the feature to the style function
    e.target.setStyle(style(feature));
  };

  // 2. This function now handles popups, hover, AND click events
  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.name;
    const countryData = mapData ? mapData[countryName] : null;

    // Bind popup
    if (countryData) {
      layer.bindPopup(`<strong>${countryName}</strong><br/>Overall Rating: ${Math.round(countryData.score * 100)}% Good<br/>Total Reviews: ${countryData.total_reviews}`);
    } else {
      layer.bindPopup(`<strong>${countryName}</strong><br/>No review data available.`);
    }

    // Add event listeners
    layer.on({
      mouseover: highlightFeature,
      mouseout: (e) => resetHighlight(e, feature),
      // 3. Add the click handler to filter by country
      click: () => {
        setFilters({ country: countryName });
      }
    });
  };

  // Show the loading spinner
  if (isLoading || !geoJsonData) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <MapContainer 
      center={location.center} 
      zoom={location.zoom} 
      style={{ height: '100%', width: '100%' }} 
      zoomControl={false}
      className="map-container"
    >
      <ChangeView center={location.center} zoom={location.zoom} />
      <ZoomControl position="topright" />
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer checked name="Satellite Imagery">
          <TileLayer 
            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        </LayersControl.BaseLayer>
        
        <LayersControl.Overlay name="Review Data (Choropleth)">
          {/* We must add a key here. When mapData changes, the key changes, forcing React to re-render the GeoJSON layer */}
          {geoJsonData && mapData && (
            <GeoJSON 
              data={geoJsonData} 
              style={style} 
              onEachFeature={onEachFeature}
              key={JSON.stringify(mapData)} // This key forces re-render on data change
            />
          )}
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default MapComponent;

