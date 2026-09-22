import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  Unlock, 
  Briefcase, 
  DollarSign, 
  Eye, 
  X, 
  Compass, 
  Layers,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { CandidateProfile } from '../../types';
import { CANDIDATE_REGIONS } from '../../data/candidateRegions';
import { getCoordinatesForCity, AZERBAIJAN_REGIONS } from '../../data/azerbaijanGeoData';

interface GoogleCandidateMapProps {
  candidates: CandidateProfile[];
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
  isCandidateUnlocked: (id: string) => boolean;
  onUnlockCandidate: (candidate: CandidateProfile) => void;
  onPreviewCV: (candidate: CandidateProfile) => void;
  maskPhone: (phone: string) => string;
  maskEmail: (email: string) => string;
  onCloseMap?: () => void;
}

// Map Tile Layers & Providers (Google Streets, Google Satellite Hybrid, OSM)
const TILE_PROVIDERS = {
  'google-streets': {
    name: 'Google Xəritə',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps &copy; Jobia.az',
  },
  'google-hybrid': {
    name: 'Google Peyk',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Satellite &copy; Jobia.az',
  },
};

type TileKey = keyof typeof TILE_PROVIDERS;

export const GoogleCandidateMap: React.FC<GoogleCandidateMapProps> = ({
  candidates,
  selectedRegion,
  onSelectRegion,
  isCandidateUnlocked,
  onUnlockCandidate,
  onPreviewCV,
  maskPhone,
  maskEmail,
  onCloseMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTile, setActiveTile] = useState<TileKey>('google-streets');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  // Derive geographical positions for candidates with small random offsets if in same city
  const candidatesWithCoords = useMemo(() => {
    return candidates.map((candidate, idx) => {
      const city = candidate.livingCity || candidate.location || 'Bakı';
      const coords = getCoordinatesForCity(city);
      
      // Deterministic slight jitter based on index so markers in the same city don't completely overlap
      const angle = (idx * 137.5) * (Math.PI / 180);
      const radius = 0.005 + (idx % 7) * 0.003;
      const lat = coords.lat + Math.sin(angle) * radius;
      const lng = coords.lng + Math.cos(angle) * radius;

      return {
        candidate,
        lat,
        lng,
        city,
      };
    });
  }, [candidates]);

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Baku coordinates
      const map = L.map(mapContainerRef.current, {
        center: [40.4093, 49.8671],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const currentConfig = TILE_PROVIDERS[activeTile];
      const tiles = L.tileLayer(currentConfig.url, {
        subdomains: currentConfig.subdomains,
        maxZoom: currentConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tiles;

      // Add layer group for candidate markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update tile layer when activeTile changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const currentConfig = TILE_PROVIDERS[activeTile];
    const newTiles = L.tileLayer(currentConfig.url, {
      subdomains: currentConfig.subdomains,
      maxZoom: currentConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [activeTile]);

  // Update markers on candidates changes or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    candidatesWithCoords.forEach(({ candidate, lat, lng }) => {
      const isUnlocked = isCandidateUnlocked(candidate.id);
      const isSelected = selectedCandidate?.id === candidate.id;

      // Custom SVG / HTML Pin matching site design
      const initials = candidate.fullName
        ? candidate.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'N';

      const customHtml = `
        <div class="relative cursor-pointer group transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-md border-2 ${
            isSelected
              ? 'bg-[#00a859] text-white border-white ring-2 ring-[#00a859]'
              : isUnlocked
              ? 'bg-[#00a859] text-white border-white'
              : 'bg-white text-[#0b1b2b] border-[#00a859]'
          }">
            ${initials}
          </div>
          ${
            candidate.expectedSalary
              ? `<div class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b1b2b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs pointer-events-none">
                  ${candidate.expectedSalary} ₼
                </div>`
              : ''
          }
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-candidate-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon });

      marker.on('click', () => {
        setSelectedCandidate(candidate);
        mapInstanceRef.current?.setView([lat, lng], 14, { animate: true });
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Fit bounds if candidates are in various regions
    if (candidatesWithCoords.length > 0 && selectedRegion === 'all') {
      const group = L.featureGroup(
        candidatesWithCoords.map((c) => L.marker([c.lat, c.lng]))
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  }, [candidatesWithCoords, selectedCandidate, isCandidateUnlocked, selectedRegion]);

  // Adjust center on region selection
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedRegion === 'all') {
      mapInstanceRef.current.setView([40.4093, 49.8671], 10, { animate: true });
      return;
    }

    const regMeta = AZERBAIJAN_REGIONS.find((r) => r.id === selectedRegion);
    if (regMeta) {
      mapInstanceRef.current.setView([regMeta.centerLat, regMeta.centerLng], regMeta.defaultZoom || 10, {
        animate: true,
      });
    }
  }, [selectedRegion]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative">
      {/* Top Map Controls Header */}
      <div className="p-2.5 sm:p-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00a859]/10 text-[#00a859] flex items-center justify-center font-bold text-xs">
            📍
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-[#0b1b2b]">Google Xəritə (Kadr Bankı)</h3>
              <span className="text-[10px] font-bold text-[#00a859] bg-[#00a859]/10 px-1.5 py-0.5 rounded-md border border-[#00a859]/20">
                {candidatesWithCoords.length} namizəd
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Pinə klikləyərək namizədin kompakt qutusuna baxa bilərsiniz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tile Toggle: Normal Google Maps vs Satellite */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTile('google-streets')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTile === 'google-streets'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setActiveTile('google-hybrid')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTile === 'google-hybrid'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peyk
            </button>
          </div>

          {onCloseMap && (
            <button
              type="button"
              onClick={onCloseMap}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Xəritəni Bağla"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[380px] sm:h-[430px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Compact Candidate Details Box on Marker Click */}
        {selectedCandidate && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-lg z-[1000] animate-fade-in space-y-2.5 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    selectedCandidate.profilePhoto ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      selectedCandidate.fullName
                    )}`
                  }
                  alt={selectedCandidate.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white p-0.5 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {selectedCandidate.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium truncate">
                    {selectedCandidate.professionalTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Meta */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{selectedCandidate.livingCity || selectedCandidate.location || 'Bakı'}</span>
              </span>
              {selectedCandidate.expectedSalary && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-900">
                    {selectedCandidate.expectedSalary.toLocaleString()} ₼
                  </span>
                </>
              )}
              {selectedCandidate.workExperience && selectedCandidate.workExperience.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{selectedCandidate.workExperience.length} iş yeri</span>
                </>
              )}
            </div>

            {/* Contact Preview Box */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] flex items-center justify-between gap-2 text-slate-600">
              <div className="flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                {isCandidateUnlocked(selectedCandidate.id) ? (
                  <a href={`tel:${selectedCandidate.phone}`} className="text-blue-600 font-bold hover:underline">
                    {selectedCandidate.phone}
                  </a>
                ) : (
                  <span className="font-mono text-slate-400">
                    {maskPhone(selectedCandidate.phone)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                {isCandidateUnlocked(selectedCandidate.id) ? (
                  <span className="text-slate-800 font-medium truncate max-w-[100px]">
                    {selectedCandidate.email}
                  </span>
                ) : (
                  <span className="font-mono text-slate-400">
                    {maskEmail(selectedCandidate.email)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons in Box */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onPreviewCV(selectedCandidate)}
                className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                <span>Tam CV</span>
              </button>

              {!isCandidateUnlocked(selectedCandidate.id) ? (
                <button
                  type="button"
                  onClick={() => onUnlockCandidate(selectedCandidate)}
                  className="flex-1 py-1.5 px-2.5 bg-[#00a859] hover:bg-[#00914c] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-emerald-200" />
                  <span>Əlaqəni Aç (19 ₼)</span>
                </button>
              ) : (
                <a
                  href={`tel:${selectedCandidate.phone}`}
                  className="flex-1 py-1.5 px-2.5 bg-[#00a859] hover:bg-[#00914c] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Zəng Et</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
