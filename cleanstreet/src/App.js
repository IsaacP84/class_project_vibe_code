import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import { fetchParadeRoutes, fallbackRoutes } from './services/paradeRoutes';
import './App.css';

const getDisplayYear = (dateValue) => {
  if (dateValue === null || dateValue === undefined) return null;

  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
  }

  if (typeof dateValue === 'string') {
    const match = dateValue.match(/\b(20\d{2})\b/);
    if (match) return match[1];

    const parsed = Date.parse(dateValue);
    if (!Number.isNaN(parsed)) {
      return String(new Date(parsed).getFullYear());
    }

    return dateValue;
  }

  return null;
};

function App() {
  const [currentView, setCurrentView] = useState('routes');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [paradeRoutes, setParadeRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch parade routes from ArcGIS API
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const routes = await fetchParadeRoutes();
        setParadeRoutes(routes);
      } catch (err) {
        console.error('Failed to load parade routes:', err);
        setError(err.message);
        // Use fallback data
        setParadeRoutes(fallbackRoutes);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const selectRoute = (route) => {
    setSelectedRoute(route);
    setCurrentView('map');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>ClearTheStreet</h1>
        <p>Eliminate garbage pileup after Mardi Gras</p>
      </header>
      {currentView === 'routes' && (
        <div className="card">
          <h2>Select a Parade Route</h2>

          {loading && <p>Loading parade routes...</p>}

          {error && (
            <div style={{ color: 'red', margin: '10px 0' }}>
              <p>Warning: Using sample data - {error}</p>
            </div>
          )}

          {!loading && paradeRoutes.length === 0 && (
            <p>No parade routes found yet. Please refresh or try again later.</p>
          )}

          {!loading && paradeRoutes.length > 0 && (
            <ul>
              {paradeRoutes.map(route => (
                <li key={route.id} onClick={() => selectRoute(route)}>
                  <strong>{route.name}</strong>
                  {getDisplayYear(route.date) && <span style={{ fontSize: '0.8em', color: '#666' }}>
                    {' '}(Year: {getDisplayYear(route.date)})
                  </span>}
                  <div style={{ fontSize: '0.8em', color: '#555' }}>
                    {route.startTime || 'Start unknown'} - {route.endTime || 'End unknown'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {currentView === 'map' && selectedRoute && (
        <div>
          <button onClick={() => setCurrentView('routes')}>Back</button>
          <MapView route={selectedRoute} />
        </div>
      )}
    </div>
  );
}

export default App;
