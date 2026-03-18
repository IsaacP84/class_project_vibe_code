import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapView({ route }) {
  const [showPredictions, setShowPredictions] = useState(false);

  // Sample trash hotspots and trash cans
  const trashHotspots = [
    { lat: 29.9561, lng: -90.0765, type: 'trash' },
    { lat: 29.9661, lng: -90.0865, type: 'trash' },
    { lat: 29.9761, lng: -90.0965, type: 'trash' }
  ];

  const trashCans = [
    { lat: 29.9511, lng: -90.0715, type: 'can' },
    { lat: 29.9611, lng: -90.0815, type: 'can' },
    { lat: 29.9711, lng: -90.0915, type: 'can' }
  ];

  const generatePredictions = () => {
    setShowPredictions(true);
  };

  const downloadMap = () => {
    alert('Download feature not implemented yet.');
  };

  return (
    <div className="map-container">
      <div className="card">
        <h2>{route.name} Route</h2>
        <button onClick={generatePredictions}>Generate Predictions</button>
        {showPredictions && <button onClick={downloadMap}>Download Map</button>}
      </div>
      <MapContainer center={[29.9511, -90.0715]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={route.route} color="purple" />
        {showPredictions && trashHotspots.map((point, index) => (
          <Marker key={`trash-${index}`} position={[point.lat, point.lng]}>
            <Popup>Trash Hotspot</Popup>
          </Marker>
        ))}
        {showPredictions && trashCans.map((point, index) => (
          <Marker key={`can-${index}`} position={[point.lat, point.lng]}>
            <Popup>Trash Can</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;