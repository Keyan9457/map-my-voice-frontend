import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  GeoJSON,
  useMap,
  useMapEvents,
  Marker,
  Popup,
  LayersControl
} from "react-leaflet";


function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom]);
  return null;
}

function LocationPicker() {
  useMapEvents({
    click(e) {
      window.dispatchEvent(
        new CustomEvent("incident-location-selected", {
          detail: { lat: e.latlng.lat, lng: e.latlng.lng }
        })
      );
    }
  });
  return null;
}

function HeatmapLayer({ incidents }) {
  const map = useMap();
  useEffect(() => {
    if (!incidents || incidents.length === 0) return;

    const points = incidents.map(i => [i.latitude, i.longitude, 0.9]);

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
    }).addTo(map);

    return () => map.removeLayer(heat);
  }, [incidents, map]);

  return null;
}

const MapComponent = ({ location, geoJsonData, mapData, isLoading, setFilters }) => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/incidents/")
      .then(res => setIncidents(res.data))
      .catch(err => console.error("Error fetching incidents:", err));
  }, []);

  const incidentIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
    iconSize: [28, 28],
  });

  const getColor = (score) =>
    score === undefined ? '#808080' :
    score > 0.75 ? '#238b45' :
    score > 0.5  ? '#74c476' :
    score > 0.25 ? '#fe9929' :
    '#d7301f';

  const style = (feature) => {
    const name = feature.properties.name;
    const score = mapData?.[name]?.score;
    return {
      fillColor: getColor(score),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.name;
    const data = mapData?.[name];

    if (data) {
      layer.bindPopup(
        `<strong>${name}</strong><br/>Good Rating: ${Math.round(data.score * 100)}%<br/>Total Reviews: ${data.total_reviews}`
      );
    } else {
      layer.bindPopup(`<strong>${name}</strong><br/>No Data`);
    }

    layer.on({
      click: () => setFilters({ country: name })
    });
  };

  if (isLoading || !geoJsonData) {
    return <div className="loading-overlay"><div className="spinner"></div></div>;
  }

  return (
    <MapContainer center={location.center} zoom={location.zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <ChangeView center={location.center} zoom={location.zoom} />
      <LocationPicker />
      <ZoomControl position="topright" />

      <LayersControl position="topright">

        <LayersControl.BaseLayer checked name="Satellite Imagery">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Review Choropleth">
          <GeoJSON data={geoJsonData} style={style} onEachFeature={onEachFeature} />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Incident Pins">
          <div>
            {incidents.map((p) => (
              <Marker key={p.id} position={[p.latitude, p.longitude]} icon={incidentIcon}>
                <Popup>
                  <strong>{p.theme}</strong><br />
                  {p.report_type}<br />
                  <em>{p.comment}</em>
                </Popup>
              </Marker>
            ))}
          </div>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Incident Density Heatmap">
          <HeatmapLayer incidents={incidents} />
        </LayersControl.Overlay>

      </LayersControl>
    </MapContainer>
  );
};

export default MapComponent;
