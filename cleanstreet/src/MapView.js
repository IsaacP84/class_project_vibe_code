
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
// Custom icon for trash hotspots
const trashIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/trash.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const TILE_PROVIDERS = [
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
  },
  {
    url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }
];

function MapView({ route }) {
  const [showPredictions, setShowPredictions] = useState(false);
  const mapRef = useRef(null);
  const [tileProviderIndex, setTileProviderIndex] = useState(0);

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


  // Adjustable: number of trash markers to show along the route
  const NUM_TRASH_MARKERS = 8; // Change this value to adjust marker count

  let trashHotspots = [];
  if (route.route && route.route.length > 1 && NUM_TRASH_MARKERS > 1) {
    for (let i = 0; i < NUM_TRASH_MARKERS; i++) {
      const idx = Math.round(i * (route.route.length - 1) / (NUM_TRASH_MARKERS - 1));
      const pt = route.route[idx];
      if (pt && typeof pt[0] === 'number' && typeof pt[1] === 'number') {
        trashHotspots.push({ lat: pt[0], lng: pt[1], type: 'trash' });
      } else if (pt && pt.lat !== undefined && pt.lng !== undefined) {
        trashHotspots.push({ lat: pt.lat, lng: pt.lng, type: 'trash' });
      }
    }
  }

  // Place trash cans so that each is within 512 feet of the route
  // We'll place one trash can at every Nth point along the route, where N is chosen so that spacing is <= 512 ft
  function haversineDistance(lat1, lng1, lat2, lng2) {
    // Returns distance in feet
    const toRad = x => x * Math.PI / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = R * c;
    return meters * 3.28084; // feet
  }

  let trashCans = [];
  const MAX_DIST_FEET = 5280 / 8; 
  if (route.route && route.route.length > 1) {
    let prev = null;
    for (let i = 0; i < route.route.length; i++) {
      const pt = route.route[i];
      let lat, lng;
      if (pt && typeof pt[0] === 'number' && typeof pt[1] === 'number') {
        lat = pt[0]; lng = pt[1];
      } else if (pt && pt.lat !== undefined && pt.lng !== undefined) {
        lat = pt.lat; lng = pt.lng;
      } else {
        continue;
      }
      if (!prev) {
        trashCans.push({ lat, lng, type: 'can' });
        prev = { lat, lng };
      } else {
        const dist = haversineDistance(prev.lat, prev.lng, lat, lng);
        if (dist >= MAX_DIST_FEET) {
          trashCans.push({ lat, lng, type: 'can' });
          prev = { lat, lng };
        }
      }
    }
  }

  const generatePredictions = () => {
    setShowPredictions(true);
  };

  const downloadMap = async () => {
    if (!mapRef.current) return;

    try {
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        backgroundColor: '#fff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${(route.name || 'parade_route').replace(/\s+/g, '_').toLowerCase()}_map.png`;
      link.click();
    } catch (error) {
      console.error('Download failed', error);
      alert('Unable to download the map image right now. Please try again.');
    }
  };

  const handleTileError = () => {
    setTileProviderIndex((currentIndex) => {
      if (currentIndex >= TILE_PROVIDERS.length - 1) {
        return currentIndex;
      }
      return currentIndex + 1;
    });
  };

  const routeCenter = route.route && route.route.length > 0
    ? route.route[Math.floor(route.route.length / 2)]
    : [29.9511, -90.0715];

  const tileProvider = TILE_PROVIDERS[tileProviderIndex];

  return (
    <div className="map-container">
      <div className="card">
        <h2>{route.name || 'Parade Route'} Route</h2>
        <p>{route.date ? `Date: ${route.date}` : 'Date: unknown'} | {route.startTime ? `Start: ${route.startTime}` : 'Start time unknown'}{route.endTime ? ` - End: ${route.endTime}` : ''}</p>
        <p>{route.krewe?.theme ? `Theme: ${route.krewe.theme}` : ''}</p>
        {route.krewe?.website && <p><a href={route.krewe.website} target="_blank" rel="noopener noreferrer">Krewe Website</a></p>}
        {tileProviderIndex > 0 && (
          <p style={{ color: '#8a6d3b', fontSize: '0.9em' }}>
            Primary map tiles were blocked, using backup map provider.
          </p>
        )}
        <button onClick={generatePredictions}>Generate Predictions</button>
        <button onClick={downloadMap}>Download Map</button>
      </div>
      <div ref={mapRef} className="map-snapshot-wrapper">
        <MapContainer center={routeCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            key={tileProvider.url}
            url={tileProvider.url}
            attribution={tileProvider.attribution}
            crossOrigin="anonymous"
            eventHandlers={{
              tileerror: handleTileError
            }}
          />
          <Polyline positions={route.route} color="purple" />
          {showPredictions && trashHotspots.map((point, index) => (
            <Marker key={`trash-${index}`} position={[point.lat, point.lng]} icon={trashIcon}>
              <Popup>Trash Hotspot</Popup>
            </Marker>
          ))}
          {showPredictions && trashCans.map((point, index) => (
            <Marker key={`can-${index}`} position={[point.lat, point.lng]} icon={trashIcon}>
              <Popup>Trash Can</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;