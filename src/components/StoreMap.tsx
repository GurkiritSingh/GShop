import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { UserLocation, StoreRecommendation } from '../types';
import { SUPERMARKET_INFO } from '../types';
import { formatPrice, formatDistance } from '../services/recommendations';

// Fix default marker icon issue with Leaflet + bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createStoreIcon(color: string, isBest: boolean) {
  const size = isBest ? 32 : 24;
  return L.divIcon({
    className: 'store-marker',
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${isBest ? 'animation: pulse 2s infinite;' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapBoundsUpdater({
  location,
  recommendations,
}: {
  location: UserLocation;
  recommendations: StoreRecommendation[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [[location.lat, location.lon]];
    for (const rec of recommendations) {
      points.push([rec.store.lat, rec.store.lon]);
    }
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([location.lat, location.lon], 13);
    }
  }, [map, location, recommendations]);

  return null;
}

interface StoreMapProps {
  location: UserLocation;
  recommendations: StoreRecommendation[];
}

export function StoreMap({ location, recommendations }: StoreMapProps) {
  return (
    <div className="store-map">
      <h2>Nearby Stores</h2>
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={13}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater location={location} recommendations={recommendations} />

        {/* User location marker */}
        <Marker position={[location.lat, location.lon]}>
          <Popup>
            <strong>You are here</strong>
          </Popup>
        </Marker>

        {/* Store markers */}
        {recommendations.map((rec, index) => {
          const info = SUPERMARKET_INFO[rec.store.brand];
          const isBest = index === 0;

          return (
            <Marker
              key={rec.store.id}
              position={[rec.store.lat, rec.store.lon]}
              icon={createStoreIcon(info.color, isBest)}
            >
              <Popup>
                <div className="map-popup">
                  <strong>
                    {info.logo} {info.name}
                  </strong>
                  {isBest && <span className="map-popup-badge">Best Pick</span>}
                  <br />
                  <span>{formatDistance(rec.store.distance)} away</span>
                  <br />
                  <span>
                    {formatPrice(rec.pricing.totalPrice)} for {rec.pricing.itemsFound}/
                    {rec.pricing.itemsTotal} items
                  </span>
                  {rec.store.address && (
                    <>
                      <br />
                      <span className="map-popup-address">{rec.store.address}</span>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
