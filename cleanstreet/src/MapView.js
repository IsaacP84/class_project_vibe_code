import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapView({ route }) {
  const [showPredictions, setShowPredictions] = useState(false);

  // Early return if route is not provided or invalid
  if (!route || !route.route || !Array.isArray(route.route)) {
    return (
      <div className="map-container">
        <div className="card">
          <h2>Error: Invalid Route Data</h2>
          <p>The route data is not available or is in an invalid format.</p>
        </div>
      </div>
    );
  }

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

  const routeCenter = route.route && route.route.length > 0
    ? route.route[Math.floor(route.route.length / 2)]
    : [29.9511, -90.0715];

  return (
    <div className="map-container">
      <div className="card">
        <h2>{route.name || 'Parade Route'} Route</h2>
        <p>{route.date ? `Date: ${route.date}` : 'Date: unknown'} | {route.startTime ? `Start: ${route.startTime}` : 'Start time unknown'}{route.endTime ? ` - End: ${route.endTime}` : ''}</p>
        <p>{route.krewe?.theme ? `Theme: ${route.krewe.theme}` : ''}</p>
        {route.krewe?.website && <p><a href={route.krewe.website} target="_blank" rel="noopener noreferrer">Krewe Website</a></p>}
        <button onClick={generatePredictions}>Generate Predictions</button>
        {showPredictions && <button onClick={downloadMap}>Download Map</button>}
      </div>
      <MapContainer center={routeCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
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