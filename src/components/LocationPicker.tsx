import { useState } from 'react';
import type { UserLocation } from '../types';

interface LocationPickerProps {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  onRequestLocation: () => Promise<UserLocation | null>;
  onManualLocation: (lat: number, lon: number) => void;
}

// Major UK cities for quick selection
const UK_CITIES = [
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Manchester', lat: 53.4808, lon: -2.2426 },
  { name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
  { name: 'Leeds', lat: 53.8008, lon: -1.5491 },
  { name: 'Glasgow', lat: 55.8642, lon: -4.2518 },
  { name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
  { name: 'Bristol', lat: 51.4545, lon: -2.5879 },
  { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
  { name: 'Cardiff', lat: 51.4816, lon: -3.1791 },
  { name: 'Belfast', lat: 54.5973, lon: -5.9301 },
  { name: 'Newcastle', lat: 54.9783, lon: -1.6178 },
  { name: 'Sheffield', lat: 53.3811, lon: -1.4701 },
  { name: 'Nottingham', lat: 52.9548, lon: -1.1581 },
  { name: 'Southampton', lat: 50.9097, lon: -1.4044 },
  { name: 'Brighton', lat: 50.8225, lon: -0.1372 },
];

export function LocationPicker({
  location,
  loading,
  error,
  onRequestLocation,
  onManualLocation,
}: LocationPickerProps) {
  const [showCities, setShowCities] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [postcodeLoading, setPostcodeLoading] = useState(false);

  const handlePostcodeLookup = async () => {
    if (!postcode.trim()) return;
    setPostcodeLoading(true);
    try {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
      );
      const data = await response.json();
      if (data.status === 200 && data.result) {
        onManualLocation(data.result.latitude, data.result.longitude);
      } else {
        alert('Postcode not found. Please check and try again.');
      }
    } catch {
      alert('Failed to look up postcode. Please try again.');
    } finally {
      setPostcodeLoading(false);
    }
  };

  return (
    <div className="location-picker">
      <h2>Your Location</h2>

      {location ? (
        <div className="location-set">
          <div className="location-badge">
            <span className="location-icon">&#x1F4CD;</span>
            <span>
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </span>
          </div>
          <button className="btn-change-location" onClick={() => onManualLocation(0, 0)}>
            Change
          </button>
        </div>
      ) : (
        <div className="location-options">
          <button className="btn-locate" onClick={onRequestLocation} disabled={loading}>
            {loading ? 'Detecting location...' : 'Use My Location'}
          </button>

          <div className="location-divider">
            <span>or</span>
          </div>

          <div className="postcode-input">
            <input
              type="text"
              placeholder="Enter UK postcode (e.g. SW1A 1AA)"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePostcodeLookup()}
            />
            <button onClick={handlePostcodeLookup} disabled={postcodeLoading}>
              {postcodeLoading ? '...' : 'Go'}
            </button>
          </div>

          <div className="location-divider">
            <span>or pick a city</span>
          </div>

          <button className="btn-show-cities" onClick={() => setShowCities(!showCities)}>
            {showCities ? 'Hide cities' : 'Choose a UK city'}
          </button>

          {showCities && (
            <div className="city-grid">
              {UK_CITIES.map((city) => (
                <button
                  key={city.name}
                  className="city-btn"
                  onClick={() => onManualLocation(city.lat, city.lon)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}

          {error && <div className="location-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
