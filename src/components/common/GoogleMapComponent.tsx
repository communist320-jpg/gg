import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, AlertCircle, Compass } from 'lucide-react';
import { Business } from '../../types';

interface GoogleMapComponentProps {
  businesses?: Business[];
  selectedBusiness?: Business | null;
  onSelectBusiness?: (b: Business) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  isPicker?: boolean;
  onLocationPick?: (coords: { lat: number; lng: number }, address?: string) => void;
  singleBusiness?: Business;
}

// Bathinda default center coordinates
const BATHINDA_CENTER = { lat: 30.2110, lng: 74.9455 };

declare global {
  interface Window {
    google?: any;
    initAocsfMap?: () => void;
  }
}

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  businesses = [],
  selectedBusiness,
  onSelectBusiness,
  center = BATHINDA_CENTER,
  zoom = 13,
  height = '480px',
  isPicker = false,
  onLocationPick,
  singleBusiness,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(
    singleBusiness ? singleBusiness.coordinates : null
  );

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDKVX9R8tVhNjNuGJI91DaY6L7DnZvGScs';

  useEffect(() => {
    if (!apiKey) {
      setMapError('Map integration is not configured yet');
      return;
    }

    // Check if script is already present
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      script.onerror = () => {
        setMapError('Failed to load Google Maps script. Showing fallback navigation.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => {
        setMapLoaded(true);
        initializeMap();
      });
    }
  }, [apiKey]);

  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      const mapCenter = singleBusiness ? singleBusiness.coordinates : center;
      const mapOptions = {
        center: mapCenter,
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }],
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#161412' }],
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#F7F4EE' }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Picker mode
      if (isPicker) {
        let pickerMarker = new window.google.maps.Marker({
          position: mapCenter,
          map: map,
          draggable: true,
          title: 'Drag to set business location in Bathinda',
        });

        pickerMarker.addListener('dragend', () => {
          const pos = pickerMarker.getPosition();
          if (pos && onLocationPick) {
            const coords = { lat: pos.lat(), lng: pos.lng() };
            setPickedLocation(coords);
            onLocationPick(coords);
          }
        });

        map.addListener('click', (e: any) => {
          if (e.latLng) {
            pickerMarker.setPosition(e.latLng);
            const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setPickedLocation(coords);
            if (onLocationPick) onLocationPick(coords);
          }
        });
        return;
      }

      // Single business mode
      if (singleBusiness) {
        new window.google.maps.Marker({
          position: singleBusiness.coordinates,
          map: map,
          title: singleBusiness.name,
          animation: window.google.maps.Animation.DROP,
        });
        return;
      }

      // Multi-business directory map markers
      clearMarkers();
      const bounds = new window.google.maps.LatLngBounds();

      businesses.forEach((biz) => {
        if (!biz.coordinates?.lat || !biz.coordinates?.lng) return;

        const pos = { lat: biz.coordinates.lat, lng: biz.coordinates.lng };
        bounds.extend(pos);

        const marker = new window.google.maps.Marker({
          position: pos,
          map: map,
          title: biz.name,
          label: {
            text: biz.name.charAt(0),
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '11px',
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family: sans-serif; padding: 6px; max-width: 220px; color: #161412;">
              <div style="font-size: 10px; font-weight: bold; color: #C82A2A; text-transform: uppercase;">${biz.categories[0] || 'Local Business'}</div>
              <div style="font-size: 13px; font-weight: bold; margin: 2px 0;">${biz.name}</div>
              <div style="font-size: 11px; color: #555;">📍 ${biz.locality}, Bathinda</div>
              <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: ${biz.status === 'open' ? '#15803d' : '#b91c1c'};">
                ● ${biz.status === 'open' ? 'Open Now' : 'Closed'}
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onSelectBusiness) onSelectBusiness(biz);
        });

        markersRef.current.push(marker);
      });

      if (businesses.length > 1) {
        map.fitBounds(bounds);
      }
    } catch (err: any) {
      console.warn('Google Maps initialization error:', err);
      setMapError(err.message || 'Map render error');
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  // Graceful Fallback if Google Maps is not available
  if (mapError || !apiKey) {
    const targetBiz = singleBusiness || selectedBusiness;
    return (
      <div
        className="w-full bg-[#F5F2EB] border-2 border-dashed border-[#161412]/30 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        style={{ minHeight: height }}
      >
        <div className="w-12 h-12 rounded-full bg-[#161412]/5 flex items-center justify-center mb-3">
          <Compass className="w-6 h-6 text-[#C82A2A]" />
        </div>
        <div className="font-serif text-base font-bold text-[#161412]">
          Bathinda Local Business Geo-Locator
        </div>
        <p className="text-xs text-stone-600 font-mono max-w-sm mt-1 mb-4">
          {mapError ? mapError : 'Map integration is not configured yet'}
        </p>

        {targetBiz && (
          <div className="bg-white border border-[#161412]/20 p-4 max-w-md w-full shadow-xs mb-3 text-left">
            <div className="text-[10px] font-mono uppercase text-[#C82A2A] font-bold">
              {targetBiz.locality} • BATHINDA
            </div>
            <div className="font-serif font-bold text-sm text-[#161412] mt-0.5">
              {targetBiz.name}
            </div>
            <p className="text-xs text-stone-600 mt-1">{targetBiz.address}</p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  targetBiz.address + ', Bathinda, Punjab'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#C82A2A] text-white text-xs font-mono font-medium rounded hover:bg-[#A81F1F] transition"
              >
                <Navigation className="w-3 h-3" />
                <span>Open in Google Maps</span>
              </a>
              <span className="text-[11px] font-mono text-stone-500">
                Coords: {targetBiz.coordinates?.lat?.toFixed(4)}, {targetBiz.coordinates?.lng?.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-stone-500 font-mono">
          All businesses in Bathinda remain 100% accessible via contact, catalog, and directions.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden border border-[#161412]/25" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {isPicker && (
        <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur px-3 py-1.5 border border-[#161412]/30 shadow-md text-xs font-mono text-[#161412]">
          📌 Click map or drag marker to set exact location in Bathinda
        </div>
      )}
    </div>
  );
};
