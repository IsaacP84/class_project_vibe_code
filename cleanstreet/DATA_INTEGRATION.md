# CleanStreet - Mardi Gras Route Data Integration

This app integrates with the New Orleans GIS portal to display official Mardi Gras parade routes for post-parade cleanup planning.

## Data Source

The app fetches parade route data from:
**ArcGIS Open Data Portal**: https://portal-nolagis.opendata.arcgis.com/datasets/mardi-gras-routes-1/explore

## How to Update Route Data

### Option 1: Automatic API Integration
The app automatically tries to fetch data from the ArcGIS API. If the API is accessible, routes will update automatically.

### Option 2: Manual Data Update
If the API is not accessible, you can manually update the route data:

1. **Visit the ArcGIS Portal**:
   - Go to: https://portal-nolagis.opendata.arcgis.com/datasets/mardi-gras-routes-1/explore
   - Click "Download" and select "GeoJSON" or "CSV" format

2. **Download the Data**:
   - Save the file as `mardiGrasRoutes.geojson` or similar

3. **Update the Local Data File**:
   - Open `src/data/mardiGrasRoutes.js`
   - Replace the `mardiGrasRoutesData` array with your downloaded data
   - Ensure the data follows the GeoJSON FeatureCollection format

4. **Data Format Example**:
```javascript
export const mardiGrasRoutesData = [
  {
    "type": "Feature",
    "properties": {
      "OBJECTID": 1,
      "KREWE_NAME": "Krewe of Bacchus",
      "PARADE_DATE": "2024-02-25",
      "START_TIME": "18:00",
      "END_TIME": "22:00"
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-90.0715, 29.9511], // [longitude, latitude]
        [-90.0815, 29.9611],
        // ... more coordinates
      ]
    }
  }
];
```

## API Endpoints Tried

The app attempts to fetch from these endpoints in order:
- ArcGIS Hub API (GeoJSON)
- ArcGIS REST API (GeoJSON format)
- ArcGIS REST API (JSON format)
- Local fallback data

## Troubleshooting

- **API Not Working**: Check browser console for error messages
- **No Routes Displayed**: Verify data format matches expected structure
- **CORS Issues**: May need to set up a proxy server for production

## Data Fields

The app expects these fields from the ArcGIS data:
- `KREWE_NAME` or `Krewe`: Name of the krewe
- `PARADE_DATE` or `Date`: Date of the parade
- `START_TIME` / `END_TIME`: Parade timing
- `THEME`: Parade theme
- `WEBSITE`: Krewe website
- Route geometry as LineString coordinates

## Development

To test with different data:
1. Modify `src/data/mardiGrasRoutes.js` with test data
2. Check browser console for transformation logs
3. Verify routes display correctly on the map