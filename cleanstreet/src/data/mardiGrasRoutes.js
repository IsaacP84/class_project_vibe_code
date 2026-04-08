// data/mardiGrasRoutes.js
// This file can be updated with data downloaded from:
// https://portal-nolagis.opendata.arcgis.com/datasets/mardi-gras-routes-1/explore
//
// To update:
// 1. Visit the ArcGIS portal
// 2. Download the data as GeoJSON or CSV
// 3. Transform it to match this format
// 4. Replace the data below

export const mardiGrasRoutesData = [
  // Sample data structure - replace with real data from ArcGIS
  {
    "type": "Feature",
    "properties": {
      "OBJECTID": 1,
      "KREWE_NAME": "Krewe of Bacchus",
      "PARADE_DATE": "2026-02-15",
      "START_TIME": "18:00",
      "END_TIME": "22:00",
      "THEME": "Bacchus Theme 2026",
      "WEBSITE": "https://bacchus.org"
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-90.0715, 29.9511],
        [-90.0815, 29.9611],
        [-90.0915, 29.9711],
        [-90.1015, 29.9811]
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "OBJECTID": 2,
      "KREWE_NAME": "Krewe of Endymion",
      "PARADE_DATE": "2026-02-16",
      "START_TIME": "16:00",
      "END_TIME": "20:00",
      "THEME": "Endymion Theme 2026",
      "WEBSITE": "https://endymion.org"
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-90.0615, 29.9411],
        [-90.0715, 29.9511],
        [-90.0815, 29.9611],
        [-90.0915, 29.9711]
      ]
    }
  }
];

// Function to convert GeoJSON features to our app format
export const convertGeoJSONToRoutes = (geoJsonFeatures) => {
  return geoJsonFeatures.map((feature, index) => {
    const props = feature.properties;
    const geom = feature.geometry;

    // Convert coordinates from [lng, lat] to [lat, lng]
    const route = geom.coordinates.map(coord => [coord[1], coord[0]]);

    return {
      id: props.OBJECTID || index + 1,
      name: props.KREWE_NAME || props.Name || `Route ${index + 1}`,
      route: route,
      date: props.PARADE_DATE || props.Date,
      startTime: props.START_TIME || props.StartTime,
      endTime: props.END_TIME || props.EndTime,
      krewe: {
        name: props.KREWE_NAME || props.Krewe,
        theme: props.THEME || props.Theme,
        website: props.WEBSITE || props.Website
      }
    };
  });
};