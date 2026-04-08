import { fetchParadeRoutes, selectLatestRoutes } from './paradeRoutes';

describe('fetchParadeRoutes', () => {
  let consoleLogSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('tries next endpoint when first response has no features', async () => {
    const emptyFeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    const validFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            OBJECTID: 999,
            KREWE_NAME: 'Krewe of Tests',
            PARADE_DATE: '2026-02-10',
            START_TIME: '18:00',
            END_TIME: '21:00'
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-90.0715, 29.9511],
              [-90.0815, 29.9611]
            ]
          }
        }
      ]
    };

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyFeatureCollection
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => validFeatureCollection
      });

    const routes = await fetchParadeRoutes();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(routes).toHaveLength(1);
    expect(routes[0].id).toBe(999);
    expect(routes[0].name).toBe('Krewe of Tests');
    expect(routes[0].route[0]).toEqual([29.9511, -90.0715]);
  });

  test('returns local data when all endpoints fail', async () => {
    global.fetch.mockRejectedValue(new Error('Network down'));

    const routes = await fetchParadeRoutes();

    expect(global.fetch).toHaveBeenCalled();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]).toHaveProperty('name');
    expect(routes[0]).toHaveProperty('route');
    expect(Array.isArray(routes[0].route)).toBe(true);
    expect(routes[0].route.length).toBeGreaterThan(0);
  });
});

describe('selectLatestRoutes', () => {
  test('prefers routes from the provided year when available', () => {
    const routes = [
      { id: 1, name: 'Older', date: '2025-02-01', route: [[29.9, -90.1]] },
      { id: 2, name: 'Current', date: '2026-02-10', route: [[29.95, -90.07]] }
    ];

    const selected = selectLatestRoutes(routes, 2026);

    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe(2);
  });

  test('falls back to most recent available year when preferred year missing', () => {
    const routes = [
      { id: 1, name: 'Oldest', date: '2023-02-01', route: [[29.9, -90.1]] },
      { id: 2, name: 'Latest', date: '2025-02-10', route: [[29.95, -90.07]] }
    ];

    const selected = selectLatestRoutes(routes, 2026);

    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe(2);
  });
});
