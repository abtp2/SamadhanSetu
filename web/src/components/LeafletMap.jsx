import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MapPin, ExternalLink } from 'lucide-react';

// Fix Leaflet's default icon missing in bundlers like Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Sub-component for interactive location picker
const LocationPickerHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

export const LeafletMap = ({
  challenges = [],
  center = [23.3441, 85.3096], // Default: Ranchi, Jharkhand
  zoom = 9,
  interactive = false,
  selectedLocation = null,
  onLocationSelect = null,
  height = '450px',
}) => {
  return (
    <div style={{ height, width: '100%' }} className="relative rounded border border-slate-300 overflow-hidden shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* If used as interactive location picker */}
        {interactive && <LocationPickerHandler onSelect={onLocationSelect} />}

        {interactive && selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-semibold text-gov-900">Selected GPS Location</p>
                <p className="text-slate-600">
                  Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Challenge markers */}
        {!interactive &&
          challenges.map((c) => {
            const lat = c.coordinates?.lat || 23.3441;
            const lng = c.coordinates?.lng || 85.3096;

            return (
              <Marker key={c._id} position={[lat, lng]}>
                <Popup>
                  <div className="p-1 max-w-[240px]">
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <span className="text-[10px] uppercase font-bold text-gov-800 tracking-wider">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority || c.urgency} />
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-tight mb-1">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2 flex items-center">
                      <MapPin className="w-3 h-3 mr-0.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location || c.district}</span>
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <StatusBadge status={c.status} />
                      <Link
                        to={`/challenges/${c._id}`}
                        className="inline-flex items-center text-[11px] font-medium text-gov-800 hover:text-gov-600"
                      >
                        Details <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
