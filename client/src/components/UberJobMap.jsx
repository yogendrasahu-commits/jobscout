import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Briefcase, 
  User, 
  Navigation, 
  Layers, 
  Search, 
  DollarSign, 
  Phone, 
  Video, 
  MessageSquare,
  Crosshair,
  Filter,
  CheckCircle,
  Radio,
  MapPin,
  Sparkles,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Move,
  Eye,
  EyeOff,
  Car,
  X,
  Loader2,
  Building,
  Compass,
  Moon,
  Sun,
  Plus,
  Minus,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Fix Leaflet's default marker icons in case standard markers are used
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Haversine Distance Calculation (Distance between two coordinates in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 9999;
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10; // Round to 1 decimal place (e.g. 4.2 km)
}

// Strict Geographic boundaries of India (with slight coastal buffer)
const INDIA_BOUNDS = [
  [5.5, 67.0],  // South-West (Indian Ocean / Arabian Sea)
  [37.5, 97.5]  // North-East (Kashmir / Arunachal Pradesh)
];

// National geographic center of India
const INDIA_CENTER = [20.5937, 78.9629];

// Quick City & National Region Presets across India
const INDIA_CITY_PRESETS = [
  { name: 'All India', label: 'All India', lat: 20.5937, lng: 78.9629, zoom: 5, isCountryView: true },
  { name: 'Delhi NCR', label: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Mumbai', label: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Bengaluru', label: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Hyderabad', label: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 12 },
  { name: 'Pune', label: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 12 },
  { name: 'Chennai', label: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 12 },
  { name: 'Kolkata', label: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 12 },
  { name: 'Ahmedabad', label: 'Ahmedabad', lat: 23.0225, lng: 72.5714, zoom: 12 },
  { name: 'Jaipur', label: 'Jaipur', lat: 26.9124, lng: 75.7873, zoom: 12 },
  { name: 'Chandigarh', label: 'Chandigarh', lat: 30.7333, lng: 76.7794, zoom: 12 },
  { name: 'Indore', label: 'Indore', lat: 22.7196, lng: 75.8577, zoom: 12 },
  { name: 'Kochi', label: 'Kochi', lat: 9.9312, lng: 76.2673, zoom: 12 }
];

// Instant Pre-indexed Popular Locations & Tech/Business Hubs in India
const POPULAR_LOCATIONS = [
  // National View
  { name: 'All India (National View)', city: 'All India', state: 'India', lat: 20.5937, lng: 78.9629, label: 'India' },

  // Delhi NCR
  { name: 'Connaught Place (CP)', city: 'New Delhi', state: 'Delhi', lat: 28.6304, lng: 77.2177, label: 'Delhi CP' },
  { name: 'Cyber City, DLF Phase 2', city: 'Gurugram', state: 'Haryana', lat: 28.4900, lng: 77.0880, label: 'Gurugram' },
  { name: 'Sector 62 IT Corridor', city: 'Noida', state: 'Uttar Pradesh', lat: 28.6258, lng: 77.3638, label: 'Noida 62' },
  { name: 'South Extension & AIIMS', city: 'New Delhi', state: 'Delhi', lat: 28.5700, lng: 77.2200, label: 'South Ext' },
  { name: 'Okhla Industrial Area Phase 3', city: 'New Delhi', state: 'Delhi', lat: 28.5355, lng: 77.2710, label: 'Okhla' },

  // Mumbai Hubs (Seed Job Area)
  { name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, label: 'BKC' },
  { name: 'Andheri East (MIDC & SEEPZ)', city: 'Mumbai', state: 'Maharashtra', lat: 19.1136, lng: 72.8697, label: 'Andheri E' },
  { name: 'Andheri West (Lokhandwala)', city: 'Mumbai', state: 'Maharashtra', lat: 19.1363, lng: 72.8277, label: 'Andheri W' },
  { name: 'Bandra West (Hill Rd & Linking)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lng: 72.8295, label: 'Bandra' },
  { name: 'Lower Parel (Kamala Mills & Phoenix)', city: 'Mumbai', state: 'Maharashtra', lat: 19.0020, lng: 72.8310, label: 'Parel' },
  { name: 'Dadar West & Central Station', city: 'Mumbai', state: 'Maharashtra', lat: 19.0178, lng: 72.8478, label: 'Dadar' },
  { name: 'Powai (Hiranandani Tech Hub)', city: 'Mumbai', state: 'Maharashtra', lat: 19.1176, lng: 72.9060, label: 'Powai' },
  { name: 'Kurla & Sakinaka Junction', city: 'Mumbai', state: 'Maharashtra', lat: 19.0910, lng: 72.8860, label: 'Sakinaka' },
  { name: 'Santacruz East & Airport Hub', city: 'Mumbai', state: 'Maharashtra', lat: 19.0800, lng: 72.8410, label: 'Santacruz' },
  { name: 'Worli & Sea Face Commercials', city: 'Mumbai', state: 'Maharashtra', lat: 19.0150, lng: 72.8180, label: 'Worli' },
  { name: 'Ghatkopar & Vikhroli Tech Park', city: 'Mumbai', state: 'Maharashtra', lat: 19.1020, lng: 72.9120, label: 'Ghatkopar' },
  { name: 'Navi Mumbai (Vashi & Mahape IT)', city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297, label: 'Navi Mum' },
  { name: 'Thane West (Wagle Estate & Ghodbunder)', city: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781, label: 'Thane' },
  { name: 'Colaba & Nariman Point', city: 'South Mumbai', state: 'Maharashtra', lat: 18.9220, lng: 72.8346, label: 'Colaba' },
  { name: 'Goregaon East (NESCO IT Hub)', city: 'Mumbai', state: 'Maharashtra', lat: 19.1550, lng: 72.8550, label: 'Goregaon' },
  { name: 'Malad West (Mindspace Park)', city: 'Mumbai', state: 'Maharashtra', lat: 19.1860, lng: 72.8350, label: 'Malad' },
  { name: 'Borivali West & Station', city: 'Mumbai', state: 'Maharashtra', lat: 19.2307, lng: 72.8567, label: 'Borivali' },

  // Bengaluru
  { name: 'Koramangala Tech Corridor', city: 'Bengaluru', state: 'Karnataka', lat: 12.9352, lng: 77.6245, label: 'Koramangala' },
  { name: 'Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', lat: 12.9784, lng: 77.6408, label: 'Indiranagar' },
  { name: 'HSR Layout Startup Hub', city: 'Bengaluru', state: 'Karnataka', lat: 12.9121, lng: 77.6446, label: 'HSR' },
  { name: 'Whitefield & ITPL', city: 'Bengaluru', state: 'Karnataka', lat: 12.9698, lng: 77.7500, label: 'Whitefield' },
  { name: 'Electronic City Phase 1', city: 'Bengaluru', state: 'Karnataka', lat: 12.8452, lng: 77.6602, label: 'E-City' },
  { name: 'Manyata Tech Park', city: 'Bengaluru', state: 'Karnataka', lat: 13.0475, lng: 77.6197, label: 'Manyata' },

  // Hyderabad
  { name: 'Hitec City & Madhapur', city: 'Hyderabad', state: 'Telangana', lat: 17.4474, lng: 78.3762, label: 'Hitec City' },
  { name: 'Gachibowli Financial Dist', city: 'Hyderabad', state: 'Telangana', lat: 17.4401, lng: 78.3489, label: 'Gachibowli' },
  { name: 'Kondapur & Botanical Garden', city: 'Hyderabad', state: 'Telangana', lat: 17.4646, lng: 78.3582, label: 'Kondapur' },

  // Pune
  { name: 'Hinjawadi IT Park Phase 1', city: 'Pune', state: 'Maharashtra', lat: 18.5913, lng: 73.7389, label: 'Hinjawadi' },
  { name: 'Viman Nagar & Kharadi IT', city: 'Pune', state: 'Maharashtra', lat: 18.5679, lng: 73.9143, label: 'Viman Ngr' },
  { name: 'Magarpatta Cybercity', city: 'Pune', state: 'Maharashtra', lat: 18.5132, lng: 73.9268, label: 'Magarpatta' },

  // Chennai
  { name: 'OMR IT Expressway (Taramani)', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9863, lng: 80.2432, label: 'OMR' },
  { name: 'T Nagar Commercial Hub', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0418, lng: 80.2341, label: 'T Nagar' },
  { name: 'Guindy & Olympia Tech Park', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0067, lng: 80.2025, label: 'Guindy' },

  // Kolkata
  { name: 'Salt Lake Sector V IT Hub', city: 'Kolkata', state: 'West Bengal', lat: 22.5804, lng: 88.4378, label: 'Sector V' },
  { name: 'New Town Action Area 1 & 2', city: 'Kolkata', state: 'West Bengal', lat: 22.5867, lng: 88.4754, label: 'New Town' },
  { name: 'Park Street Business Dist', city: 'Kolkata', state: 'West Bengal', lat: 22.5516, lng: 88.3524, label: 'Park St' },

  // Ahmedabad, Jaipur, Chandigarh, Indore, Kochi
  { name: 'SG Highway & Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0125, lng: 72.5118, label: 'SG Highway' },
  { name: 'GIFT City Fin-Tech Zone', city: 'Gandhinagar', state: 'Gujarat', lat: 23.1610, lng: 72.6842, label: 'GIFT City' },
  { name: 'Malviya Nagar & World Trade Park', city: 'Jaipur', state: 'Rajasthan', lat: 26.8532, lng: 75.8052, label: 'Jaipur WTP' },
  { name: 'Rajiv Gandhi Chandigarh IT Park', city: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7258, lng: 76.8454, label: 'Chd IT Park' },
  { name: 'Vijay Nagar & Super Corridor IT', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7533, lng: 75.8937, label: 'Indore IT' },
  { name: 'Infopark Kakkanad', city: 'Kochi', state: 'Kerala', lat: 10.0104, lng: 76.3638, label: 'Infopark' }
];

// Forces Leaflet to invalidate size and re-render tiles on mount, resize, orientation, and tab changes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 700);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);
  return null;
}

// Smoothly pan & fly the map when center coordinates change, honoring preset zooms and search zooms
function MapRecenter({ coords, flyTrigger, targetZoom }) {
  const map = useMap();
  const prevCoordsRef = useRef(coords);
  const prevTriggerRef = useRef(flyTrigger);

  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      const prev = prevCoordsRef.current;
      const changed = !prev || prev[0] !== coords[0] || prev[1] !== coords[1];
      const triggerChanged = flyTrigger !== prevTriggerRef.current;

      if (changed || triggerChanged) {
        prevCoordsRef.current = coords;
        prevTriggerRef.current = flyTrigger;

        let desiredZoom = map.getZoom();
        if (typeof targetZoom === 'number') {
          desiredZoom = targetZoom;
        } else if (triggerChanged && flyTrigger > 0) {
          desiredZoom = 17;
        }
        map.flyTo(coords, desiredZoom, { animate: true, duration: 1.0 });
      }
    }
  }, [coords, flyTrigger, targetZoom, map]);
  return null;
}

// Map Controller to provide map instance for external zoom buttons
function MapController({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// Map Events Listener for Click and Move / Pan events (like Google Maps)
function MapEventsHandler({ onMapClick, onMapMoveEnd }) {
  const map = useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
    moveend() {
      if (onMapMoveEnd) {
        onMapMoveEnd(map.getCenter());
      }
    }
  });
  return null;
}

// Validate coordinates are within geographic boundaries of India (Lat: ~6-38, Lng: ~68-98)
const isWithinIndia = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return !isNaN(nLat) && !isNaN(nLng) && nLat >= 6.0 && nLat <= 38.0 && nLng >= 68.0 && nLng <= 98.0;
};

// Validate coordinates are valid numbers and within world boundaries
const isValidCoord = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return !isNaN(nLat) && !isNaN(nLng) && isFinite(nLat) && isFinite(nLng) && nLat >= -90.0 && nLat <= 90.0 && nLng >= -180.0 && nLng <= 180.0;
};

// Clamp coordinates to stay within Indian territory
const clampToIndia = (lat, lng) => {
  const clampedLat = Math.min(Math.max(Number(lat), 7.0), 36.5);
  const clampedLng = Math.min(Math.max(Number(lng), 68.5), 97.0);
  return [clampedLat, clampedLng];
};

// Auto-fits map bounds to include all jobs, seekers, and the current center
function MapBoundsFitter({ boundsTrigger, jobs, seekers, centerCoords }) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    // Run on manual trigger OR once on initial load when data is available
    if (!boundsTrigger && initialFitDone.current) return;

    const points = [];
    if (centerCoords && centerCoords[0] && centerCoords[1]) {
      points.push(centerCoords);
    }
    jobs?.forEach((j) => {
      if (j.lat && j.lng && isWithinIndia(j.lat, j.lng)) {
        points.push([Number(j.lat), Number(j.lng)]);
      }
    });
    seekers?.forEach((s) => {
      if (s.lat && s.lng && isWithinIndia(s.lat, s.lng)) {
        points.push([Number(s.lat), Number(s.lng)]);
      }
    });

    if (points.length > 1 || (points.length === 1 && boundsTrigger > 0)) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        initialFitDone.current = true;
      } catch (err) {
        console.warn('Map fitBounds error:', err);
      }
    }
  }, [boundsTrigger, map, jobs, seekers, centerCoords]);

  return null;
}

// Custom Leaflet DivIcon for Job Markers with Distance Badge
const createJobIcon = (job) => {
  const isInside = job.isInsideRadar;
  return L.divIcon({
    className: 'custom-job-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
        <div style="
          background: ${isInside ? '#4f46e5' : '#475569'};
          color: white;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          border: 1.5px solid white;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${job.salary ? job.salary.split('-')[0].trim() : 'Job'}</span>
          <span style="opacity: 0.9; font-size: 9px; background: rgba(0,0,0,0.3); padding: 0.5px 4px; border-radius: 4px;">
            ${job.distanceKm}km
          </span>
        </div>
        <div style="
          width: 32px;
          height: 32px;
          background: ${isInside ? '#3730a3' : '#334155'};
          border: 2px solid ${isInside ? '#818cf8' : '#94a3b8'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${isInside ? '14px rgba(99, 102, 241, 0.8)' : '4px rgba(0,0,0,0.4)'};
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [80, 58],
    iconAnchor: [40, 48],
    popupAnchor: [0, -45]
  });
};

// Custom Leaflet DivIcon for Seeker Markers with Distance Badge
const createSeekerIcon = (seeker) => {
  const isInside = seeker.isInsideRadar;
  return L.divIcon({
    className: 'custom-seeker-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
        <div style="
          background: ${isInside ? '#059669' : '#475569'};
          color: white;
          padding: 2px 6px;
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          border: 1.5px solid white;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          <span>${seeker.name.split(' ')[0]}</span>
          <span style="opacity: 0.9; font-size: 8px; background: rgba(0,0,0,0.3); padding: 0.5px 3px; border-radius: 4px;">
            ${seeker.distanceKm}km
          </span>
        </div>
        <div style="
          width: 30px;
          height: 30px;
          background: ${isInside ? '#065f46' : '#334155'};
          border: 2px solid ${isInside ? '#34d399' : '#94a3b8'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${isInside ? '14px rgba(16, 185, 129, 0.8)' : '4px rgba(0,0,0,0.4)'};
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [70, 50],
    iconAnchor: [35, 42],
    popupAnchor: [0, -40]
  });
};

// Radar Center GPS Beacon Icon (Draggable like Google Maps)
const createUserLocationIcon = (isDragging = false) => {
  return L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: grab;">
        <div style="
          background: rgba(15, 23, 42, 0.92);
          color: ${isDragging ? '#a5b4fc' : '#818cf8'};
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          border: 1px solid ${isDragging ? '#818cf8' : 'rgba(99, 102, 241, 0.6)'};
          margin-bottom: 2px;
          pointer-events: none;
        ">
          ${isDragging ? '📍 Moving Pin...' : '🖐️ Drag to Move'}
        </div>
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: ${isDragging ? '26px' : '22px'};
            height: ${isDragging ? '26px' : '22px'};
            background: ${isDragging ? '#6366f1' : '#3b82f6'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px ${isDragging ? '#6366f1' : '#3b82f6'};
            z-index: 10;
            transition: all 0.2s;
          "></div>
          <div style="
            position: absolute;
            width: 48px;
            height: 48px;
            background: rgba(59, 130, 246, 0.35);
            border-radius: 50%;
            animation: pulseRadar 2s infinite;
          "></div>
        </div>
      </div>
    `,
    iconSize: [110, 60],
    iconAnchor: [55, 42]
  });
};

export const UberJobMap = ({ 
  jobs = [], 
  seekers = [], 
  onSelectJob, 
  onSelectSeeker, 
  onPostJobAtCoords 
}) => {
  const { user, isEmployer, updateLocation } = useAuth();
  const { otherUserLocations, broadcastLocation, startCall, setActiveChatUser } = useSocket();

  const initialLat = isWithinIndia(user?.lat, user?.lng) ? Number(user.lat) : INDIA_CENTER[0];
  const initialLng = isWithinIndia(user?.lat, user?.lng) ? Number(user.lng) : INDIA_CENTER[1];

  // Radar center coordinates (Defaults to user coordinates or All India National Center)
  const [centerCoords, setCenterCoords] = useState([initialLat, initialLng]);
  const [activeLocationName, setActiveLocationName] = useState(
    user?.address || 'India (National Live Map)'
  );

  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [strictRadar, setStrictRadar] = useState(false); // Default false: show all pins across nation, highlight inside radar
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
  const [showJobsLayer, setShowJobsLayer] = useState(true);
  const [showSeekersLayer, setShowSeekersLayer] = useState(true);
  const [mapTheme, setMapTheme] = useState('voyager'); // 'voyager' | 'dark'
  
  // Drawer & Mobile Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTabDrawer, setActiveTabDrawer] = useState('jobs'); // 'jobs' | 'seekers'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Search Functionality States
  const [searchQuery, setSearchQuery] = useState(user?.address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveGeocodedResults, setLiveGeocodedResults] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const [targetZoomLevel, setTargetZoomLevel] = useState(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [autoMoveRadar, setAutoMoveRadar] = useState(false);
  const [isDraggingBeacon, setIsDraggingBeacon] = useState(false);
  const searchContainerRef = useRef(null);

  // Zoom In & Zoom Out Handlers
  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  // Handle City & National Preset Selection (e.g. All India, Delhi, Mumbai, Bengaluru)
  const handleSelectCityPreset = (preset) => {
    const lat = preset.lat;
    const lng = preset.lng;
    const zoom = preset.isCountryView ? 5 : (preset.zoom || 12);
    setTargetZoomLevel(zoom);
    setCenterCoords([lat, lng]);
    const locName = preset.isCountryView ? 'India (National View)' : `${preset.name}, India`;
    setActiveLocationName(locName);
    setSearchQuery(preset.isCountryView ? 'India' : preset.name);
    setIsSearchOpen(false);
    setShowSearchThisArea(false);

    if (preset.isCountryView) {
      setStrictRadar(false);
    }
    setFlyTrigger((prev) => prev + 1);
    if (mapInstance) {
      mapInstance.flyTo([lat, lng], zoom, { animate: true, duration: 1.0 });
    }
  };

  // Sync center when user profile coordinates change
  useEffect(() => {
    if (user?.lat && user?.lng && isWithinIndia(user.lat, user.lng)) {
      const uLat = Number(user.lat);
      const uLng = Number(user.lng);
      setCenterCoords([uLat, uLng]);
      if (user.address) {
        setActiveLocationName(user.address);
        setSearchQuery(user.address);
      }
      if (mapInstance) {
        mapInstance.flyTo([uLat, uLng], 13, { animate: true, duration: 1.0 });
      }
    }
  }, [user?.lat, user?.lng, user?.address, mapInstance]);

  // Guaranteed safe finite coordinates within India for MapContainer & Leaflet layers
  const safeCoords = useMemo(() => {
    const lat = Number(centerCoords?.[0]);
    const lng = Number(centerCoords?.[1]);
    if (isWithinIndia(lat, lng)) {
      return [lat, lng];
    }
    return [INDIA_CENTER[0], INDIA_CENTER[1]];
  }, [centerCoords]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Debounced Live Geocoding via OpenStreetMap Nominatim
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setLiveGeocodedResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const parsed = data.map((item) => ({
            name: item.display_name.split(',')[0],
            city: item.display_name.split(',').slice(1, 3).join(', ').trim(),
            state: 'India',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            isGeocoded: true
          }));
          setLiveGeocodedResults(parsed);
        }
      } catch (err) {
        console.warn('Geocode error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combined Location Search Results (Curated Hubs + Live Geocoded)
  const combinedSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Filter local curated hubs
    const localMatches = q
      ? POPULAR_LOCATIONS.filter(
          (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.city.toLowerCase().includes(q) ||
            loc.state.toLowerCase().includes(q)
        )
      : POPULAR_LOCATIONS.slice(0, 8); // Default popular list when query is empty

    // Merge with live geocoded results, avoiding lat/lng proximity duplicates
    const combined = [...localMatches];
    liveGeocodedResults.forEach((geo) => {
      const exists = combined.some(
        (loc) => Math.abs(loc.lat - geo.lat) < 0.01 && Math.abs(loc.lng - geo.lng) < 0.01
      );
      if (!exists) {
        combined.push(geo);
      }
    });

    return combined.slice(0, 8);
  }, [searchQuery, liveGeocodedResults]);

  // Handle Location Selection (Zooms to maximum zoom level 17)
  const handleSelectLocation = (loc) => {
    setTargetZoomLevel(17);
    setCenterCoords([loc.lat, loc.lng]);
    const fullName = `${loc.name}${loc.city ? `, ${loc.city}` : ''}`;
    setActiveLocationName(fullName);
    setSearchQuery(loc.name);
    setIsSearchOpen(false);
    updateLocation(loc.lat, loc.lng, fullName);
    broadcastLocation(loc.lat, loc.lng, fullName);
    setFlyTrigger((prev) => prev + 1);
    if (mapInstance) {
      mapInstance.flyTo([loc.lat, loc.lng], 17, { animate: true, duration: 1.0 });
    }
  };

  // Submit search query on Enter (auto-select top match at max zoom 18)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (combinedSearchResults && combinedSearchResults.length > 0) {
      handleSelectLocation(combinedSearchResults[0]);
    }
  };

  // Reverse geocode coordinates to location name
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=15`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return `${parts[0]?.trim() || ''}, ${parts[1]?.trim() || ''}`;
        }
      }
    } catch (err) {
      // ignore
    }
    return `Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`;
  };

  // Move radar center when beacon marker is dragged (like Google Maps pin)
  const handleMarkerDragEnd = async (latlng) => {
    if (!latlng) return;
    const [lat, lng] = clampToIndia(latlng.lat, latlng.lng);
    setCenterCoords([lat, lng]);
    setShowSearchThisArea(false);
    const newName = await reverseGeocode(lat, lng);
    setActiveLocationName(newName);
    setSearchQuery(newName);
    updateLocation(lat, lng, newName);
    broadcastLocation(lat, lng, newName);
  };

  // Move radar center to current visible map center (Google Maps "Search this area")
  const handleMoveRadarToMapCenter = async () => {
    if (mapInstance) {
      const center = mapInstance.getCenter();
      const [lat, lng] = clampToIndia(center.lat, center.lng);
      setCenterCoords([lat, lng]);
      setShowSearchThisArea(false);
      const newName = await reverseGeocode(lat, lng);
      setActiveLocationName(newName);
      setSearchQuery(newName);
      updateLocation(lat, lng, newName);
      broadcastLocation(lat, lng, newName);
    }
  };

  // Directional pan controls to smoothly move map view (Google Maps D-pad)
  const handlePan = (dx, dy) => {
    if (mapInstance) {
      mapInstance.panBy([dx, dy], { animate: true, duration: 0.35 });
    }
  };

  // Handle map movement end (detects when user dragged or panned the map)
  const handleMapMoveEnd = useCallback((center) => {
    if (!center) return;
    const dist = calculateDistance(safeCoords[0], safeCoords[1], center.lat, center.lng);
    if (autoMoveRadar && dist > 0.15) {
      setCenterCoords([center.lat, center.lng]);
      setActiveLocationName(`Area [${center.lat.toFixed(3)}, ${center.lng.toFixed(3)}]`);
      setShowSearchThisArea(false);
    } else if (dist > 0.45) {
      setShowSearchThisArea(true);
    } else {
      setShowSearchThisArea(false);
    }
  }, [safeCoords, autoMoveRadar]);


  // Compute live distance for each job relative to centerCoords
  const processedJobs = useMemo(() => {
    return (jobs || [])
      .filter((job) => isValidCoord(job?.lat, job?.lng))
      .map((job) => {
        const lat = Number(job.lat);
        const lng = Number(job.lng);
        const dist = calculateDistance(safeCoords[0], safeCoords[1], lat, lng);
        return {
          ...job,
          lat,
          lng,
          distanceKm: dist,
          isInsideRadar: dist <= radiusKm
        };
      });
  }, [jobs, safeCoords, radiusKm]);

  // Filtered Jobs: according to category + strict radar setting
  const visibleJobs = useMemo(() => {
    if (!showJobsLayer) return [];
    return processedJobs
      .filter((job) => {
        const matchesCategory =
          selectedCategory === 'All' 
            ? true 
            : job.category?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCategory) return false;
        return strictRadar ? job.isInsideRadar : true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [processedJobs, selectedCategory, strictRadar, showJobsLayer]);

  // Compute live distance for each seeker relative to centerCoords
  const processedSeekers = useMemo(() => {
    return (seekers || [])
      .filter((s) => s && s.id !== user?.id) // Do not display oneself as a separate candidate marker
      .map((seeker) => {
        const livePos = otherUserLocations[seeker.id];
        const rawLat = livePos?.lat ?? seeker.lat;
        const rawLng = livePos?.lng ?? seeker.lng;
        if (!isValidCoord(rawLat, rawLng)) return null;
        const lat = Number(rawLat);
        const lng = Number(rawLng);
        const dist = calculateDistance(safeCoords[0], safeCoords[1], lat, lng);
        return {
          ...seeker,
          lat,
          lng,
          distanceKm: dist,
          isInsideRadar: dist <= radiusKm
        };
      })
      .filter(Boolean);
  }, [seekers, user?.id, otherUserLocations, safeCoords, radiusKm]);

  // Filtered Seekers: according to strict radar setting
  const visibleSeekers = useMemo(() => {
    if (!showSeekersLayer) return [];
    return processedSeekers
      .filter((seeker) => {
        return strictRadar ? seeker.isInsideRadar : true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [processedSeekers, strictRadar, showSeekersLayer]);

  // Handle HTML5 GPS Geolocation
  const locateMe = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let lat = pos.coords.latitude;
          let lng = pos.coords.longitude;
          if (!isWithinIndia(lat, lng)) {
            [lat, lng] = clampToIndia(lat, lng);
          }
          setTargetZoomLevel(17);
          setCenterCoords([lat, lng]);
          const gpsLabel = 'My GPS Location';
          setActiveLocationName(gpsLabel);
          setSearchQuery(gpsLabel);
          updateLocation(lat, lng, gpsLabel);
          broadcastLocation(lat, lng, gpsLabel);
          setFlyTrigger((prev) => prev + 1);
          if (mapInstance) {
            mapInstance.flyTo([lat, lng], 17, { animate: true, duration: 1.0 });
          }
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Map Click Handler: relocate radar center dynamically for exploration without mutating saved user profile
  const handleMapClick = (latlng) => {
    if (!latlng) return;
    const [lat, lng] = clampToIndia(latlng.lat, latlng.lng);
    setTargetZoomLevel(null); // Keep user's current zoom level
    setCenterCoords([lat, lng]);
    const clickedLabel = `Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`;
    setActiveLocationName(clickedLabel);
  };

  return (
    <div 
      className="relative w-full h-[calc(100dvh-60px-56px)] md:h-[calc(100vh-68px)] bg-slate-100 overflow-hidden select-none"
    >
      
      {/* ============================================================== */}
      {/* TOP FLOATING SEARCH & RADAR BAR */}
      {/* ============================================================== */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 z-[500] flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Location Search Bar + GPS Button */}
        <div className="flex items-center gap-2 pointer-events-auto max-w-3xl">
          
          {/* Autocomplete Search Input */}
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="relative flex items-center bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-4 h-4 text-indigo-600 absolute left-3.5 pointer-events-none" />
              
              <form onSubmit={handleSearchSubmit} className="w-full">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search city, area, or landmark (e.g. Bandra, Andheri, Delhi)..."
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full bg-transparent pl-10 pr-9 py-2.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </form>

              {/* Clear button or Loader */}
              <div className="absolute right-3 flex items-center">
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                ) : searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLiveGeocodedResults([]);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-[600] max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{searchQuery ? 'Location Results' : 'Suggested Hubs'}</span>
                  <span className="text-indigo-600 font-semibold">{combinedSearchResults.length} found</span>
                </div>

                {combinedSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching location found. Try searching a major city or district.
                  </div>
                ) : (
                  combinedSearchResults.map((loc, idx) => {
                    const distFromCurrent = calculateDistance(safeCoords[0], safeCoords[1], loc.lat, loc.lng);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectLocation(loc)}
                        className="px-3.5 py-2.5 hover:bg-slate-50 hover:border-l-4 hover:border-indigo-600 cursor-pointer transition-all border-b border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">{loc.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{loc.city ? `${loc.city}, ` : ''}{loc.state || 'India'}</p>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold whitespace-nowrap flex-shrink-0 border border-indigo-200">
                          {distFromCurrent > 0 ? `${distFromCurrent} km` : 'Current'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick GPS Geolocation Button */}
          <button
            onClick={locateMe}
            title="Recenter map to my current GPS location"
            className="flex-shrink-0 px-3 py-2.5 sm:py-2 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-lg hover:bg-slate-50 hover:border-indigo-500 text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 text-indigo-600" />
            )}
            <span className="text-xs font-bold hidden sm:inline">Current Location</span>
          </button>

          {/* Map View Mode Toggle (Streets / Satellite Hybrid) */}
          <button
            onClick={() => setMapTheme(mapTheme === 'voyager' ? 'dark' : 'voyager')}
            title="Switch between Google Streets and Satellite Hybrid view"
            className="flex-shrink-0 px-2.5 py-2.5 sm:py-2 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-lg hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold hidden md:inline">{mapTheme === 'voyager' ? 'Satellite' : 'Streets'}</span>
          </button>

          {/* Mobile Filter Sheet Trigger Button */}
        </div>

        {/* Quick Indian Cities & National Hubs Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pointer-events-auto py-0.5 max-w-full">
          {INDIA_CITY_PRESETS.map((city) => {
            const isCurrent = 
              Math.abs(safeCoords[0] - city.lat) < 0.15 && 
              Math.abs(safeCoords[1] - city.lng) < 0.15;
            return (
              <button
                key={city.name}
                type="button"
                onClick={() => handleSelectCityPreset(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all active:scale-95 flex items-center gap-1.5 border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 text-white border-amber-400/40 shadow-sm ring-1 ring-amber-400/60'
                    : 'bg-white/90 hover:bg-white backdrop-blur-xl text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300'
                }`}
                title={`Explore ${city.name}`}
              >
                {city.isCountryView ? (
                  <span className="flex items-center gap-1 font-extrabold text-white">
                    <span>🇮🇳</span>
                    <span>All India</span>
                  </span>
                ) : (
                  <span>{city.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 2: Mobile Status Strip */}
        <div className="md:hidden flex items-center justify-between gap-1 pointer-events-auto">
          <div 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-2xl px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs shadow-md cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-900 whitespace-nowrap">
              {radiusKm} km:
            </span>
            <span className="text-[11px] text-indigo-600 font-bold whitespace-nowrap">
              {visibleJobs.length} Jobs • {visibleSeekers.length} Seekers
            </span>
          </div>

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-xl text-[11px] font-bold text-indigo-600 flex items-center gap-1 shadow-md"
          >
            <span>List</span>
            {isDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Desktop Full Floating Control Bars */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          
          {/* Main Radar Slider & Stats Card */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-2xl px-3.5 py-1.5 rounded-2xl border border-slate-200/90 shadow-lg text-slate-900">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs"></span>
              </span>
              <span className="text-xs font-bold text-slate-900 tracking-wide whitespace-nowrap">
                Radius: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 font-extrabold">{radiusKm} km</span>
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-24 accent-indigo-600 cursor-pointer"
              title="Drag to resize search radius"
            />

            {/* Radius Quick Preset Buttons */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              {[5, 10, 15, 25].map((km) => (
                <button
                  key={km}
                  onClick={() => setRadiusKm(km)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    radiusKm === km
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs border border-indigo-500/30'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {km}k
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Live Filter Count Display */}
            <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200">
                {visibleJobs.length} Jobs
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                {visibleSeekers.length} Seekers
              </span>
            </div>

            {/* Strict Distance Mode Toggle */}
            <button
              onClick={() => setStrictRadar(!strictRadar)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                strictRadar
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs border border-emerald-500/30'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
              title="Toggle whether pins outside search radius are hidden"
            >
              {strictRadar ? <Eye className="w-3 h-3 text-white" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
              <span>{strictRadar ? 'Strict Filter ON' : 'Show All'}</span>
            </button>
          </div>

          {/* Categories Filter Pills */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-2xl p-1.5 rounded-2xl border border-slate-200/90 shadow-lg text-slate-700">
            {['All', 'Technology', 'Design', 'Support', 'Logistics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Layers Toggle (Show/Hide Jobs or Seekers) */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-2xl px-2 py-1.5 rounded-2xl border border-slate-200/90 shadow-lg">
            <button
              onClick={() => setShowJobsLayer(!showJobsLayer)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                showJobsLayer 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Jobs</span>
            </button>
            <button
              onClick={() => setShowSeekersLayer(!showSeekersLayer)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                showSeekersLayer 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Seekers</span>
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* GOOGLE MAPS FLOATING PILL: "SEARCH THIS AREA / MOVE RADAR" */}
      {/* ============================================================== */}
      {showSearchThisArea && (
        <div className="absolute top-28 sm:top-24 left-1/2 -translate-x-1/2 z-[500] pointer-events-auto flex items-center gap-1.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            onClick={handleMoveRadarToMapCenter}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-2xl border border-indigo-400/40 transition-all active:scale-95 hover:shadow-indigo-500/30"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Search This Area</span>
          </button>
          
          <button
            onClick={() => setShowSearchThisArea(false)}
            className="p-2 bg-slate-950/40 hover:bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white rounded-full border border-white/10 shadow-xl transition-all"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MOBILE MAP & FILTER BOTTOM SHEET MODAL */}
      {/* ============================================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[950] md:hidden bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white border-t border-slate-200 rounded-t-3xl p-5 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4 text-slate-900">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-600" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 ml-1">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Map & Distance Settings</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Close dialog"
              >
                <span className="text-[11px] font-semibold">Close (बंद करें)</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Radius Slider Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Search Distance Radius</span>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  {radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[5, 10, 15, 25].map((km) => (
                  <button
                    key={km}
                    onClick={() => setRadiusKm(km)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      radiusKm === km
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Distance Mode */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Strict Distance Filter</h4>
                <p className="text-[10px] text-slate-500">Only show pins within {radiusKm} km circle</p>
              </div>
              <button
                onClick={() => setStrictRadar(!strictRadar)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  strictRadar ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {strictRadar ? 'Active' : 'Show All'}
              </button>
            </div>

            {/* Auto-Move Center Mode (Google Maps style) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Auto-Follow Map Center</span>
                </h4>
                <p className="text-[10px] text-slate-500">Shift center pin dynamically as you pan & move map</p>
              </div>
              <button
                onClick={() => setAutoMoveRadar(!autoMoveRadar)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  autoMoveRadar ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {autoMoveRadar ? 'Active' : 'Manual'}
              </button>
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Job Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Technology', 'Design', 'Support', 'Logistics'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Toggles */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Display Layers</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowJobsLayer(!showJobsLayer)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    showJobsLayer ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Jobs ({visibleJobs.length})</span>
                </button>
                <button
                  onClick={() => setShowSeekersLayer(!showSeekersLayer)}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    showSeekersLayer ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Seekers ({visibleSeekers.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Indian Cities & National Hubs */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Explore Indian Cities & Hubs</span>
              <div className="flex flex-wrap gap-1.5">
                {INDIA_CITY_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      handleSelectCityPreset(p);
                      setIsFilterModalOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 active:scale-95 transition-all"
                  >
                    {p.isCountryView ? '🇮🇳 All India' : p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Close / Apply buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Close (रद्द करें)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all active:scale-95 text-center truncate"
              >
                Apply & View ({visibleJobs.length} Jobs • {visibleSeekers.length} Seekers)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOATING ACTION BUTTONS (Bottom Right) */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* FLOATING ACTION BUTTONS (Bottom Right) */}
      {/* ============================================================== */}
      <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 z-[500] flex flex-col gap-2.5 items-end pointer-events-auto">
        
        {/* Google Maps Style Move & Zoom Navigation Controller (Transparent Glassmorphic) */}
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-lg p-1.5 gap-1 transition-all duration-200">
          <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
            <Move className="w-2.5 h-2.5 text-indigo-600" />
            <span>Move</span>
          </div>

          {/* D-Pad Pan Directional Controls */}
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              type="button"
              onClick={() => handlePan(0, -180)}
              title="Move Map North / Up"
              className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all active:scale-90 border border-slate-200"
              aria-label="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div></div>
            
            <button
              type="button"
              onClick={() => handlePan(-180, 0)}
              title="Move Map West / Left"
              className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all active:scale-90 border border-slate-200"
              aria-label="Move Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleMoveRadarToMapCenter}
              title="Center Map at Current View (Search here)"
              className="p-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg transition-all active:scale-90 border border-indigo-200"
              aria-label="Center Map at Current View"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePan(180, 0)}
              title="Move Map East / Right"
              className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all active:scale-90 border border-slate-200"
              aria-label="Move Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div></div>
            <button
              type="button"
              onClick={() => handlePan(0, 180)}
              title="Move Map South / Down"
              className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all active:scale-90 border border-slate-200"
              aria-label="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div></div>
          </div>
          
          <div className="w-full border-t border-slate-200 my-0.5" />

          {/* Zoom Controls (+ / -) */}
          <div className="flex w-full justify-between gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className="flex-1 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all flex items-center justify-center active:scale-90 border border-slate-200"
              aria-label="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className="flex-1 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg transition-all flex items-center justify-center active:scale-90 border border-slate-200"
              aria-label="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fit All Markers in View button */}
        <button
          onClick={() => setFitBoundsTrigger((prev) => prev + 1)}
          title="Fit all active jobs and candidates into view"
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-2xl text-indigo-700 hover:text-indigo-900 border border-slate-200/90 shadow-lg text-xs font-bold transition-all active:scale-95"
        >
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Fit All Pins</span>
        </button>

        {/* Toggle Results List Drawer */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 hover:bg-white backdrop-blur-2xl text-slate-900 border border-slate-200/90 shadow-lg text-xs font-bold transition-all active:scale-95"
        >
          {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4 text-emerald-600" />}
          <span>{isDrawerOpen ? 'Close List' : `Matches (${visibleJobs.length + visibleSeekers.length})`}</span>
        </button>

        {/* Post Job button (if Employer) */}
        {isEmployer && (
          <button
            onClick={() => onPostJobAtCoords({ lat: safeCoords[0], lng: safeCoords[1] })}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition-transform active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Post Job Here</span>
            <span className="sm:hidden">Post Job</span>
          </button>
        )}

      </div>

      {/* Map Guidance Tip (Desktop only) */}
      <div className="absolute bottom-4 left-4 z-[500] pointer-events-none hidden lg:block">
        <div className="bg-white/95 backdrop-blur-2xl px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-[11px] text-slate-600 flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span>Active Hub: <strong className="text-slate-900">{activeLocationName}</strong> • {visibleJobs.length} jobs & {visibleSeekers.length} seekers in range</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM COLLAPSIBLE DISCOVERY DRAWER */}
      {/* ============================================================== */}
      {isDrawerOpen && (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[480px] lg:w-[540px] max-w-[calc(100vw-1.5rem)] max-h-64 sm:max-h-72 z-[520] bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-200 pointer-events-auto text-slate-900">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                Matches ({radiusKm} km)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTabDrawer('jobs')}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-xs font-bold transition-all ${
                    activeTabDrawer === 'jobs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Jobs ({visibleJobs.length})
                </button>
                <button
                  onClick={() => setActiveTabDrawer('seekers')}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-xs font-bold transition-all ${
                    activeTabDrawer === 'seekers'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Seekers ({visibleSeekers.length})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Close drawer"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Card List */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
            {activeTabDrawer === 'jobs' && visibleJobs.length === 0 && (
              <p className="text-xs text-slate-500 py-3 px-2">No jobs within this {radiusKm} km search radius. Try increasing the radius slider.</p>
            )}

            {activeTabDrawer === 'jobs' && visibleJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="min-w-[210px] sm:min-w-[230px] max-w-[230px] bg-slate-50 hover:bg-slate-100/90 p-3 rounded-2xl border border-slate-200/90 hover:border-indigo-400 cursor-pointer transition-all flex flex-col justify-between flex-shrink-0 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-indigo-600 font-bold mb-1">
                    <span>{job.jobType}</span>
                    <span className="text-slate-500 font-semibold">{job.distanceKm} km away</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{job.company}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">{job.salary ? job.salary.split('-')[0].trim() : 'Active'}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs font-semibold"
                      title="Open Directions in Google Maps"
                    >
                      <Navigation className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Route</span>
                    </a>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">Apply</span>
                  </div>
                </div>
              </div>
            ))}

            {activeTabDrawer === 'seekers' && visibleSeekers.length === 0 && (
              <p className="text-xs text-slate-500 py-3 px-2">No active seekers within this {radiusKm} km search radius. Try increasing the radius slider.</p>
            )}

            {activeTabDrawer === 'seekers' && visibleSeekers.map((seeker) => (
              <div
                key={seeker.id}
                onClick={() => onSelectSeeker(seeker)}
                className="min-w-[210px] sm:min-w-[230px] max-w-[230px] bg-slate-50 hover:bg-slate-100/90 p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-400 cursor-pointer transition-all flex flex-col justify-between flex-shrink-0 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={seeker.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seeker.name}`}
                    alt={seeker.name}
                    className="w-8 h-8 rounded-full border border-emerald-400 object-cover"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{seeker.name}</h4>
                    <p className="text-[10px] text-emerald-700 truncate">{seeker.title || 'Job Seeker'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                  <span className="text-slate-500 text-[10px]">{seeker.distanceKm} km away</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Connect</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* LEAFLET MAP CONTAINER (Bounded to India) */}
      {/* ============================================================== */}
      <MapContainer
        center={safeCoords}
        zoom={user?.lat && isWithinIndia(user.lat, user.lng) ? 13 : 5}
        minZoom={4}
        maxZoom={19}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        keyboard={true}
        style={{ height: '100%', width: '100%' }}
        className="h-full w-full"
      >
        <MapResizer />
        <MapController onMapReady={setMapInstance} />
        <MapRecenter coords={safeCoords} flyTrigger={flyTrigger} targetZoom={targetZoomLevel} />
        <MapBoundsFitter 
          boundsTrigger={fitBoundsTrigger} 
          jobs={visibleJobs} 
          seekers={visibleSeekers} 
          centerCoords={safeCoords} 
        />
        <MapEventsHandler 
          onMapClick={handleMapClick} 
          onMapMoveEnd={handleMapMoveEnd} 
        />

        {/* Keyless High-Resolution Google Map Tiles (Streets & Satellite Hybrid) */}
        <TileLayer
          key={mapTheme}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
          attribution='&copy; Google Maps'
          url={
            mapTheme === 'dark'
              ? 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
              : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
          }
        />

        {/* Primary Uber-style Radar Radius Circle */}
        <Circle
          center={safeCoords}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#4f46e5',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6, 6'
          }}
        />

        {/* Inner Radar Pulse Range (40% radius) */}
        <Circle
          center={safeCoords}
          radius={(radiusKm * 1000) * 0.4}
          pathOptions={{
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.06,
            weight: 1,
            dashArray: '3, 6'
          }}
        />

        {/* User's Center Location Pin (Draggable like Google Maps Pin) */}
        <Marker
          position={safeCoords}
          draggable={true}
          autoPan={true}
          eventHandlers={{
            dragstart: () => setIsDraggingBeacon(true),
            dragend: (e) => {
              setIsDraggingBeacon(false);
              const marker = e.target;
              if (marker) {
                handleMarkerDragEnd(marker.getLatLng());
              }
            }
          }}
          icon={createUserLocationIcon(isDraggingBeacon)}
        >
          <Popup>
            <div className="p-1 text-center min-w-[170px]">
              <span className="text-xs font-bold text-indigo-600 block">Map Center Pin</span>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {user ? user.name : 'Guest Location'} ({user?.role === 'emp' ? 'Employer' : 'Job Seeker'})
              </p>
              <p className="text-[9px] text-indigo-700 font-semibold mt-1 bg-indigo-50 py-0.5 rounded border border-indigo-200">
                🖐️ Drag pin to explore any area
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-500 truncate">
                {activeLocationName}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Job Markers */}
        {visibleJobs.map((job) => (
          <Marker
            key={job.id}
            position={[job.lat, job.lng]}
            icon={createJobIcon(job)}
          >
            <Popup>
              <div className="min-w-[210px] p-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {job.jobType}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {job.distanceKm} km away
                  </span>
                </div>
                
                <h4 className="font-bold text-sm text-slate-900 leading-tight mt-1">{job.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                
                <div className="my-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold">{job.salary}</span>
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Car className="w-3 h-3 text-slate-400" />
                    ~{Math.max(2, Math.round(job.distanceKm * 2.5))} min
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    View & Apply
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center gap-1 text-[11px] font-semibold"
                    title="Open Directions in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Seeker Markers */}
        {visibleSeekers.map((seeker) => (
          <Marker
            key={seeker.id}
            position={[seeker.lat, seeker.lng]}
            icon={createSeekerIcon(seeker)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={seeker.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seeker.name}`}
                    alt={seeker.name}
                    className="w-9 h-9 rounded-full border border-emerald-500/60 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{seeker.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{seeker.title || 'Available Candidate'}</p>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      📍 {seeker.distanceKm} km away
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 my-2">
                  <button
                    onClick={() => {
                      startCall(seeker, false);
                    }}
                    className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" /> Voice
                  </button>
                  <button
                    onClick={() => {
                      startCall(seeker, true);
                    }}
                    className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Video className="w-3 h-3 text-indigo-600" /> Video
                  </button>
                </div>

                <button
                  onClick={() => onSelectSeeker(seeker)}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                >
                  View Profile & Skills
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>
  );
};
