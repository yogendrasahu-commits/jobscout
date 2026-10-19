import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Check, Search } from 'lucide-react';

export const POPULAR_INDIAN_CITIES = [
  { name: 'Mumbai, Maharashtra', label: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru, Karnataka', label: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Delhi NCR (Gurugram / Noida)', label: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Pune, Maharashtra', label: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad, Telangana', label: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Jaipur, Rajasthan', label: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Ahmedabad, Gujarat', label: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
];

export const POPULAR_HUBS = [
  { name: 'Bandra Kurla Complex (BKC), Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Andheri East (MIDC & SEEPZ), Mumbai', lat: 19.1136, lng: 72.8697 },
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout, Bengaluru', lat: 12.9121, lng: 77.6446 },
  { name: 'Whitefield IT Corridor, Bengaluru', lat: 12.9698, lng: 77.7500 },
  { name: 'Cyber City, DLF Phase 2, Gurugram', lat: 28.4900, lng: 77.0880 },
  { name: 'Sector 62 IT Hub, Noida', lat: 28.6258, lng: 77.3638 },
  { name: 'Connaught Place (CP), New Delhi', lat: 28.6304, lng: 77.2177 },
  { name: 'Hitech City & Madhapur, Hyderabad', lat: 17.4435, lng: 78.3772 },
  { name: 'Gachibowli Financial District, Hyderabad', lat: 17.4401, lng: 78.3489 },
  { name: 'Hinjawadi IT Park, Pune', lat: 18.5913, lng: 73.7389 },
  { name: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143 },
  { name: 'OMR Technology Corridor, Chennai', lat: 12.9249, lng: 80.2297 },
  { name: 'Salt Lake Sector 5, Kolkata', lat: 22.5804, lng: 88.4378 }
];

export const LocationPickerInput = ({
  value = '',
  onChange,
  label = 'Location / City (शहर या इलाका)',
  placeholder = 'उदा. Bandra Kurla Complex, Mumbai या Koramangala, Bengaluru',
  required = true,
  theme = 'indigo' // 'indigo' | 'emerald'
}) => {
  const [query, setQuery] = useState(value || '');
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Filter local presets or query Nominatim
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const qLower = query.toLowerCase().trim();
    const localMatches = POPULAR_HUBS.filter(h => 
      h.name.toLowerCase().includes(qLower)
    );

    if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 5));
    }

    // Debounce live geocoding
    const timer = setTimeout(async () => {
      if (query.trim().length >= 3) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=4`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const parsed = data.map(item => ({
              name: item.display_name.split(',').slice(0, 3).join(', ').trim(),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }));

            // Merge local and remote
            const combined = [...localMatches];
            parsed.forEach(p => {
              if (!combined.some(c => Math.abs(c.lat - p.lat) < 0.02 && Math.abs(c.lng - p.lng) < 0.02)) {
                combined.push(p);
              }
            });
            setSuggestions(combined.slice(0, 6));
          }
        } catch (err) {
          console.warn('Geocoding error:', err);
        } finally {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    if (onChange) {
      onChange(item.name, item.lat, item.lng);
    }
  };

  const handleCustomTextChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setShowDropdown(true);

    // Auto-match if matching a city
    const match = POPULAR_INDIAN_CITIES.find(c => 
      text.toLowerCase().includes(c.label.toLowerCase())
    );
    if (onChange) {
      onChange(text, match ? match.lat : null, match ? match.lng : null);
    }
  };

  // Browser GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const name = data.display_name 
              ? data.display_name.split(',').slice(0, 3).join(', ').trim()
              : `GPS Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`;
            setQuery(name);
            if (onChange) onChange(name, lat, lng);
          } else {
            const fallback = `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
            setQuery(fallback);
            if (onChange) onChange(fallback, lat, lng);
          }
        } catch {
          const fallback = `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          setQuery(fallback);
          if (onChange) onChange(fallback, lat, lng);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const isEmerald = theme === 'emerald';

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        
        {/* Detect GPS Button */}
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={gpsLoading}
          className={`text-[11px] font-bold transition-colors flex items-center gap-1 active:scale-95 ${
            isEmerald ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-600 hover:text-indigo-800'
          }`}
          title="Use browser GPS location"
        >
          {gpsLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Navigation className="w-3 h-3" />
          )}
          <span>{gpsLoading ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
        </button>
      </div>

      <div className="relative">
        <MapPin className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
          isEmerald ? 'text-emerald-600' : 'text-indigo-600'
        }`} />
        
        <input
          type="text"
          value={query}
          onChange={handleCustomTextChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white transition-all ${
            isEmerald 
              ? 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
              : 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          }`}
        />

        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          </div>
        )}

        {/* Live Auto-Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>Matching Verified Locations & GPS Points</span>
            </div>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleSelect(item)}
                className="px-3.5 py-2.5 hover:bg-indigo-50/70 cursor-pointer flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-700 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 flex-shrink-0">
                  Select
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick 1-Tap City Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 mr-0.5">Quick:</span>
        {POPULAR_INDIAN_CITIES.map((city) => {
          const isSelected = query.toLowerCase().includes(city.label.toLowerCase());
          return (
            <button
              key={city.label}
              type="button"
              onClick={() => handleSelect(city)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border active:scale-95 ${
                isSelected
                  ? isEmerald 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                    : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {city.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
