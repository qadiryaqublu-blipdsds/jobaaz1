import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Truck, 
  Sparkles, 
  RotateCcw, 
  Layers, 
  Check, 
  Compass, 
  Globe 
} from 'lucide-react';
import { CandidateProfile } from '../../types';
import { 
  CANDIDATE_REGIONS, 
  SPECIAL_WORK_PREFERENCES, 
  CandidateRegion, 
  RegionMatchMode, 
  getCandidateRegionalStats,
  getRegionDisplayName
} from '../../data/candidateRegions';

interface AzerbaijanCandidateMapProps {
  candidates: CandidateProfile[];
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
  regionMatchMode: RegionMatchMode;
  onChangeMatchMode: (mode: RegionMatchMode) => void;
  onResetFilter: () => void;
}

export const AzerbaijanCandidateMap: React.FC<AzerbaijanCandidateMapProps> = ({
  candidates,
  selectedRegion,
  onSelectRegion,
  regionMatchMode,
  onChangeMatchMode,
  onResetFilter,
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Compute live candidate statistics across all regions
  const stats = useMemo(() => {
    return getCandidateRegionalStats(candidates);
  }, [candidates]);

  // Active region details
  const activeRegion = useMemo(() => {
    if (selectedRegion === 'all') return null;
    return CANDIDATE_REGIONS.find((r) => r.id === selectedRegion) || null;
  }, [selectedRegion]);

  // Hovered region details
  const hoveredRegion = useMemo(() => {
    if (!hoveredRegionId) return null;
    return CANDIDATE_REGIONS.find((r) => r.id === hoveredRegionId) || null;
  }, [hoveredRegionId]);

  const activeStat = useMemo(() => {
    if (selectedRegion === 'all') {
      return {
        total: candidates.length,
        living: candidates.length,
        eligible: candidates.length,
        relocatable: candidates.filter((c) => c.willingToRelocate).length,
      };
    }
    return stats[selectedRegion] || { total: 0, living: 0, eligible: 0, relocatable: 0 };
  }, [stats, selectedRegion, candidates]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
      {/* Top Header / Mode Switcher */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Azərbaycan Xəritəsi üzrə Namizəd Axtarışı</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  İnteraktiv
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Xəritədə iqtisadi regionlara klikləyərək və ya filtrlərdən seçərək uyğun mütəxəssisləri tapın
              </p>
            </div>
          </div>
        </div>

        {/* Filter Criteria (Matching Mode) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start md:self-auto text-xs shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Uyğunluq:
          </span>
          <button
            type="button"
            onClick={() => onChangeMatchMode('any')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              regionMatchMode === 'any'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Hamısı (Yaşayış & İş)
          </button>
          <button
            type="button"
            onClick={() => onChangeMatchMode('living')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              regionMatchMode === 'living'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Yalnız Yaşayanlar
          </button>
          <button
            type="button"
            onClick={() => onChangeMatchMode('eligible')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              regionMatchMode === 'eligible'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            İşləməyə Hazırlar
          </button>
        </div>
      </div>

      {/* Main Map Canvas & Live Regional Info Panel */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Interactive SVG Map */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl p-3 sm:p-4 relative overflow-hidden border border-slate-800 shadow-inner">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Map Compass Tag */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AZƏRBAYCAN REGİONLARI</span>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full aspect-[800/490]">
            <svg
              viewBox="0 0 800 490"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))' }}
            >
              {/* Region Polygons */}
              {CANDIDATE_REGIONS.map((region) => {
                const isSelected = selectedRegion === region.id;
                const isHovered = hoveredRegionId === region.id;
                const regionCandidateCount =
                  regionMatchMode === 'living'
                    ? stats[region.id]?.living || 0
                    : regionMatchMode === 'eligible'
                    ? stats[region.id]?.eligible || 0
                    : stats[region.id]?.total || 0;

                // Color logic based on status
                let fill = '#1e293b'; // slate-800
                let stroke = '#334155'; // slate-700
                let strokeWidth = 1.5;

                if (isSelected) {
                  fill = '#2563eb'; // blue-600
                  stroke = '#60a5fa'; // blue-400
                  strokeWidth = 2.5;
                } else if (isHovered) {
                  fill = '#3b82f6'; // blue-500
                  stroke = '#93c5fd';
                  strokeWidth = 2;
                } else if (regionCandidateCount > 0) {
                  fill = '#1e3a5f'; // soft slate blue with candidates
                  stroke = '#475569';
                }

                return (
                  <g
                    key={region.id}
                    onClick={() => onSelectRegion(isSelected ? 'all' : region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    className="cursor-pointer transition-colors duration-200 group"
                  >
                    <path
                      d={region.svgPath}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="transition-all duration-150"
                    />

                    {/* Regional Center Coordinates Marker & Label */}
                    <g transform={`translate(${region.labelX}, ${region.labelY})`}>
                      {/* Pulse circle if has candidates */}
                      {regionCandidateCount > 0 && !isSelected && (
                        <circle
                          r="10"
                          fill="rgba(59, 130, 246, 0.2)"
                          className="animate-ping opacity-75"
                        />
                      )}
                      
                      {/* Pin Circle */}
                      <circle
                        r={isSelected ? 10 : 8}
                        fill={isSelected ? '#ffffff' : regionCandidateCount > 0 ? '#38bdf8' : '#64748b'}
                        stroke={isSelected ? '#1d4ed8' : '#0f172a'}
                        strokeWidth="2"
                      />

                      {/* Candidate count number inside or near pin */}
                      <text
                        y={3}
                        textAnchor="middle"
                        fill={isSelected ? '#1e3a8a' : '#0f172a'}
                        fontSize="9"
                        fontWeight="900"
                        fontFamily="sans-serif"
                        className="pointer-events-none"
                      >
                        {regionCandidateCount}
                      </text>

                      {/* City Name Text */}
                      <text
                        y={isSelected ? 22 : 18}
                        textAnchor="middle"
                        fill={isSelected ? '#93c5fd' : '#cbd5e1'}
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : '600'}
                        fontFamily="sans-serif"
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {region.centerCity}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map legend footer */}
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Seçilmiş Region
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                Namizədləri olan region
              </span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Məlumatlar real namizəd anketləri əsasında yenilənir
            </span>
          </div>
        </div>

        {/* Live Region Info / Analytics Card */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedRegion === 'all' ? 'ÜMUMİ AZƏRBAYCAN' : 'SEÇİLMİŞ REGİON'}
                </span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">
                  {selectedRegion === 'all'
                    ? 'Bütün Regionlar & Məsafədən'
                    : activeRegion?.name || 'Məsafədən / Remote'}
                </h4>
                {activeRegion && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mərkəzi şəhər: <span className="font-semibold text-slate-700">{activeRegion.centerCity}</span>
                  </p>
                )}
              </div>
              {selectedRegion !== 'all' && (
                <button
                  type="button"
                  onClick={onResetFilter}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Filtrləri sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Sıfırla</span>
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  Toplam Uyğun
                </div>
                <div className="text-xl font-black text-blue-700 mt-1">
                  {activeStat.total} <span className="text-xs font-normal text-slate-500">nəfər</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  Burada Yaşayan
                </div>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {activeStat.living} <span className="text-xs font-normal text-slate-500">nəfər</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-indigo-600" />
                  İşləməyə Hazır
                </div>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {activeStat.eligible} <span className="text-xs font-normal text-slate-500">nəfər</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-600" />
                  Ezamiyyətə Hazır
                </div>
                <div className="text-xl font-black text-slate-800 mt-1">
                  {activeStat.relocatable} <span className="text-xs font-normal text-slate-500">nəfər</span>
                </div>
              </div>
            </div>

            {/* Region description / included cities */}
            {activeRegion && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Əhatə olunan şəhər və rayonlar:</div>
                <p className="line-clamp-2 leading-relaxed text-slate-500">
                  {activeRegion.cities.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Quick Remote & Whole Azerbaijan Filter Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block">Xüsusi Məkan Seçimləri:</span>
            <div className="flex flex-wrap gap-2">
              {SPECIAL_WORK_PREFERENCES.map((pref) => {
                const isSelected = selectedRegion === pref.id;
                const count = stats[pref.id]?.total || 0;
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => onSelectRegion(isSelected ? 'all' : pref.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <span>{pref.icon}</span>
                    <span>{pref.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 font-bold'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Region Chips Carousel / Bar below map */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Regionlar:
        </span>

        {/* All Regions Chip */}
        <button
          type="button"
          onClick={() => onSelectRegion('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
            selectedRegion === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          🇦🇿 Bütün Azərbaycan ({candidates.length})
        </button>

        {/* Individual Regions */}
        {CANDIDATE_REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          const count =
            regionMatchMode === 'living'
              ? stats[region.id]?.living || 0
              : regionMatchMode === 'eligible'
              ? stats[region.id]?.eligible || 0
              : stats[region.id]?.total || 0;

          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(isSelected ? 'all' : region.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{region.shortName}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
