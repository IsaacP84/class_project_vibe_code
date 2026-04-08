const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polyline: () => <div data-testid="polyline" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

const mockHtml2canvas = jest.fn().mockResolvedValue({
  toDataURL: () => 'data:image/png;base64,test',
});

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: mockHtml2canvas,
}));

const MapView = require('./MapView').default;

describe('MapView', () => {
  beforeAll(() => {
    window.alert = jest.fn();
  });

  const sampleRoute = {
    name: 'Test Route',
    date: '2026-02-01',
    startTime: '10:00',
    endTime: '12:00',
    route: [
      [29.9511, -90.0715],
      [29.9611, -90.0815],
      [29.9711, -90.0915]
    ]
  };

  test('renders route map view and shows download UI without crashing', () => {
    render(<MapView route={sampleRoute} />);

    expect(screen.getByText(/test route route/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate predictions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download map/i })).toBeInTheDocument();
  });
});
