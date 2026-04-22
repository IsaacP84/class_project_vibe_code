declare module 'leaflet-image' {
  import { Map as LeafletMap } from 'leaflet';
  export default function leafletImage(
    map: LeafletMap,
    callback: (err: any, canvas?: HTMLCanvasElement) => void
  ): void;
}
