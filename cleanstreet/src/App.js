import React, { useState } from 'react';
import MapView from './MapView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('location');
  const [location, setLocation] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Sample parade routes with coordinates (New Orleans area)
  const paradeRoutes = [
    {
      id: 1,
      name: 'Krewe of Bacchus',
      route: [
        [29.9511, -90.0715],
        [29.9611, -90.0815],
        [29.9711, -90.0915],
        [29.9811, -90.1015]
      ]
    },
    {
      id: 2,
      name: 'Krewe of Endymion',
      route: [
        [29.9411, -90.0615],
        [29.9511, -90.0715],
        [29.9611, -90.0815],
        [29.9711, -90.0915]
      ]
    },
    {
      id: 3,
      name: 'Krewe of Zulu',
      route: [
        [29.9311, -90.0515],
        [29.9411, -90.0615],
        [29.9511, -90.0715],
        [29.9611, -90.0815]
      ]
    }
  ];

  const handleLocationSubmit = () => {
    if (location) {
      setCurrentView('routes');
    }
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
    setCurrentView('map');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>CleanStreet</h1>
        <p>Eliminate garbage pileup after Mardi Gras</p>
      </header>
      {currentView === 'location' && (
        <div className="card">
          <h2>Enter Your Location</h2>
          <input
            type="text"
            placeholder="Enter zip code or allow location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button onClick={handleLocationSubmit}>Submit</button>
        </div>
      )}
      {currentView === 'routes' && (
        <div className="card">
          <h2>Select a Parade Route</h2>
          <button onClick={() => setCurrentView('location')}>Back</button>
          <ul>
            {paradeRoutes.map(route => (
              <li key={route.id} onClick={() => selectRoute(route)}>
                {route.name}
              </li>
            ))}
          </ul>
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
