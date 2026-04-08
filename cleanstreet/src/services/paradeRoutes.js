// services/paradeRoutes.js
import { mardiGrasRoutesData, convertGeoJSONToRoutes } from '../data/mardiGrasRoutes';

// Alternative endpoints to try for Mardi Gras routes data
const ALTERNATIVE_ENDPOINTS = [
  'https://maps.nola.gov/server/rest/services/SpecialEvents/Special_Events/MapServer/3/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson',
  'https://maps.nola.gov/server/rest/services/SpecialEvents/Special_Events/MapServer/3/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json',
  'https://opendata.arcgis.com/datasets/mardi-gras-routes-1.geojson',
  'https://services.arcgis.com/NG6rvFq4c5Hj8BNM/ArcGIS/rest/services/Mardi_Gras_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson',
  'https://services.arcgis.com/NG6rvFq4c5Hj8BNM/arcgis/rest/services/Mardi_Gras_Routes/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=json',
  // Additional fallback route file from open data portal (works if canonical endpoint fails)
  'https://opendata.arcgis.com/datasets/2cd6d8c4fbd243cba087c74b11de9ca4_0.geojson'
];

const AVAILABLE_ZIP_CODES = [
  '70112', '70113', '70115', '70117', '70118', '70119', '70122', '70124', '70130', '70131'
];

export const getAvailableZipCodes = () => AVAILABLE_ZIP_CODES;

const extractFeatures = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.features)) return data.features;
  if (Array.isArray(data.data)) return data.data;
  if (data.features && Array.isArray(data.features.features)) return data.features.features;
  if (Array.isArray(data.value)) return data.value;
  return [];
};

const normalizeCoordinate = (coord) => {
  if (!coord || coord.length < 2) return null;
  const [lng, lat] = coord;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return [lat, lng];
};

const extractRouteCoordinates = (geometry) => {
  if (!geometry) return [];

  if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.map(normalizeCoordinate).filter(Boolean);
  }

  if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates
      .flatMap(line => Array.isArray(line) ? line.map(normalizeCoordinate).filter(Boolean) : [])
      .filter(Boolean);
  }

  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates
      .flatMap(ring => Array.isArray(ring) ? ring.map(normalizeCoordinate).filter(Boolean) : [])
      .filter(Boolean);
  }

  if (Array.isArray(geometry.paths)) {
    return geometry.paths
      .flatMap(path => Array.isArray(path) ? path.map(normalizeCoordinate).filter(Boolean) : [])
      .filter(Boolean);
  }

  if (Array.isArray(geometry.rings)) {
    return geometry.rings
      .flatMap(ring => Array.isArray(ring) ? ring.map(normalizeCoordinate).filter(Boolean) : [])
      .filter(Boolean);
  }

  if (Array.isArray(geometry.coordinates)) {
    if (Array.isArray(geometry.coordinates[0]) && Array.isArray(geometry.coordinates[0][0])) {
      return geometry.coordinates
        .flatMap(line => Array.isArray(line) ? line.map(normalizeCoordinate).filter(Boolean) : [])
        .filter(Boolean);
    }
    return geometry.coordinates.map(normalizeCoordinate).filter(Boolean);
  }

  return [];
};

const parseYear = (dateValue) => {
  if (dateValue === null || dateValue === undefined) return null;

  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  }

  if (typeof dateValue === 'string') {
    const match = dateValue.match(/\b(20\d{2})\b/);
    if (match) return Number(match[1]);

    const parsed = Date.parse(dateValue);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).getFullYear();
    }
  }

  return null;
};

const normalizeDate = (dateValue) => {
  if (dateValue === null || dateValue === undefined) return null;

  if (typeof dateValue === 'number') {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }

  if (typeof dateValue === 'string') {
    return dateValue;
  }

  return null;
};

export const selectLatestRoutes = (routes, preferredYear = new Date().getFullYear()) => {
  if (!Array.isArray(routes) || routes.length === 0) return [];

  const routesWithYear = routes.map(route => ({
    route,
    year: parseYear(route.date)
  }));

  const preferred = routesWithYear
    .filter(item => item.year === preferredYear)
    .map(item => item.route);

  if (preferred.length > 0) {
    return preferred;
  }

  const years = routesWithYear
    .map(item => item.year)
    .filter(year => typeof year === 'number');

  if (years.length === 0) {
    return routes;
  }

  const latestYear = Math.max(...years);
  return routesWithYear
    .filter(item => item.year === latestYear)
    .map(item => item.route);
};

export const fetchParadeRoutes = async () => {
  for (const endpoint of ALTERNATIVE_ENDPOINTS) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      // Transform ArcGIS data to our app format
      const routes = transformArcGISData(data);
      if (routes.length > 0) {
        return selectLatestRoutes(routes);
      }

      console.warn(`No routes found from ${endpoint}, trying next source.`);
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error.message);
      continue;
    }
  }

  // If all API calls fail, try using local data
  console.log('API calls failed, trying local data...');
  try {
    if (mardiGrasRoutesData && mardiGrasRoutesData.length > 0) {
      const localRoutes = convertGeoJSONToRoutes(mardiGrasRoutesData);
      if (localRoutes.length > 0) {
        console.log(`Using ${localRoutes.length} routes from local data`);
        return selectLatestRoutes(localRoutes);
      }
    }
  } catch (error) {
    console.warn('Failed to load local data:', error);
  }

  throw new Error('All API endpoints failed. Using fallback data.');
};

const transformArcGISData = (data) => {
  console.log('Transforming ArcGIS data:', data);

  // Handle different ArcGIS response formats
  const features = extractFeatures(data);

  if (!features || features.length === 0) {
    console.warn('No features found in ArcGIS data:', data);
    return [];
  }

  console.log(`Processing ${features.length} features`);

  return features.map((feature, index) => {
    const properties = feature.properties || feature.attributes || {};
    const geometry = feature.geometry || feature.shape || feature;
    const rawDate = properties.PARADE_DATE || properties.Date || properties.DATE || properties.parade_date;

    console.log(`Processing feature ${index}:`, { properties, geometry });

    // Extract route coordinates from geometry in multiple typical GIS formats
    let routeCoordinates = extractRouteCoordinates(geometry);

    // For ArcGIS feature service, sometimes geometry is nested under component geometry
    if (!routeCoordinates.length && feature.geometry && feature.geometry.paths) {
      routeCoordinates = extractRouteCoordinates(feature.geometry);
    }

    // Ensure we have valid coordinates
    if (routeCoordinates.length === 0) {
      console.warn(`No coordinates found for feature ${index}, using fallback`); // eslint-disable-line no-console
      routeCoordinates = [
        [29.9511, -90.0715],
        [29.9611, -90.0815],
        [29.9711, -90.0915]
      ];
    }

    const route = {
      id: properties.OBJECTID || properties.FID || properties.id || index + 1,
      name: properties.KREWE_NAME || properties.Krewe || properties.Parade || properties.Name || properties.krewe_name || `Parade Route ${index + 1}`,
      route: routeCoordinates,
      date: normalizeDate(rawDate),
      startTime: properties.START_TIME || properties.StartTime || properties.start_time || properties.Time,
      endTime: properties.END_TIME || properties.EndTime || properties.end_time,
      krewe: {
        name: properties.KREWE_NAME || properties.Krewe || properties.Parade || properties.krewe_name,
        theme: properties.THEME || properties.Theme || properties.theme,
        website: properties.WEBSITE || properties.Website || properties.website
      }
    };

    console.log('Transformed route:', route);
    return route;
  }).filter(route => route.route && route.route.length > 0);
};

// Fallback data in case API fails
export const fallbackRoutes = [
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