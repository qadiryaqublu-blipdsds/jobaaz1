import { CandidateProfile } from '../types';

export interface CandidateRegionMeta {
  id: string;
  name: string;
  shortName: string;
  description: string;
  centerCity: string;
  cities: string[];
  // SVG coordinates for responsive Azerbaijan regional map
  svgPath: string;
  labelX: number;
  labelY: number;
  badgeX: number;
  badgeY: number;
  color: string;
}

export type CandidateRegion = CandidateRegionMeta;
export type RegionMatchMode = 'all' | 'any' | 'living' | 'eligible' | 'remote' | 'relocate';

export const CANDIDATE_REGIONS: CandidateRegionMeta[] = [
  {
    id: 'baku',
    name: 'Bakı və Abşeron',
    shortName: 'Bakı & Abşeron',
    description: 'Paytaxt Bakı, Sumqayıt, Xırdalan və Abşeron yarımadası',
    centerCity: 'Bakı',
    cities: ['Bakı', 'Sumqayıt', 'Xırdalan', 'Abşeron', 'Masazır', 'Saray', 'Pirallahı'],
    // Approximate SVG polygon coordinates on 600x420 Azerbaijan canvas
    svgPath: 'M 490,165 L 530,170 L 575,185 L 590,205 L 565,225 L 520,230 L 485,210 L 480,185 Z',
    labelX: 525,
    labelY: 195,
    badgeX: 550,
    badgeY: 175,
    color: '#2563eb', // blue-600
  },
  {
    id: 'quba-khachmaz',
    name: 'Quba-Xaçmaz və Şimal',
    shortName: 'Quba-Xaçmaz',
    description: 'Quba, Qusar, Xaçmaz, Xudat, Şabran, Siyəzən',
    centerCity: 'Quba',
    cities: ['Quba', 'Qusar', 'Xaçmaz', 'Xudat', 'Şabran', 'Siyəzən'],
    svgPath: 'M 360,50 L 430,30 L 470,55 L 485,110 L 460,145 L 390,140 L 350,110 Z',
    labelX: 420,
    labelY: 90,
    badgeX: 450,
    badgeY: 70,
    color: '#0284c7', // sky-600
  },
  {
    id: 'sheki-zagatala',
    name: 'Şəki-Zaqatala və Şimal-Qərb',
    shortName: 'Şəki-Zaqatala',
    description: 'Şəki, Qəbələ, Zaqatala, Balakən, Qax, Oğuz, İsmayıllı, Şamaxı',
    centerCity: 'Şəki',
    cities: ['Şəki', 'Qəbələ', 'Zaqatala', 'Balakən', 'Qax', 'Oğuz', 'İsmayıllı', 'Şamaxı', 'Qobustan'],
    svgPath: 'M 190,40 L 280,30 L 360,50 L 390,140 L 330,170 L 250,150 L 190,100 Z',
    labelX: 285,
    labelY: 105,
    badgeX: 320,
    badgeY: 80,
    color: '#059669', // emerald-600
  },
  {
    id: 'ganja-gazakh',
    name: 'Gəncə-Qazax və Qərb',
    shortName: 'Gəncə-Qazax',
    description: 'Gəncə, Tovuz, Qazax, Şəmkir, Ağstafa, Göygöl, Daşkəsən, Gədəbəy',
    centerCity: 'Gəncə',
    cities: ['Gəncə', 'Tovuz', 'Qazax', 'Şəmkir', 'Ağstafa', 'Gədəbəy', 'Göygöl', 'Samux', 'Daşkəsən', 'Naftalan'],
    svgPath: 'M 120,95 L 190,100 L 250,150 L 230,220 L 170,225 L 110,180 L 85,130 Z',
    labelX: 165,
    labelY: 160,
    badgeX: 200,
    badgeY: 135,
    color: '#7c3aed', // violet-600
  },
  {
    id: 'central-aran',
    name: 'Mərkəzi Aran və Şirvan',
    shortName: 'Mərkəzi Aran',
    description: 'Mingəçevir, Yevlax, Göyçay, Şirvan, Salyan, Neftçala, Sabirabad, Saatlı, İmişli, Kürdəmir',
    centerCity: 'Mingəçevir',
    cities: ['Mingəçevir', 'Yevlax', 'Göyçay', 'Şirvan', 'Salyan', 'Neftçala', 'Sabirabad', 'Saatlı', 'İmişli', 'Beyləqan', 'Kürdəmir', 'Ucar', 'Zərdab', 'Hacıqabul', 'Biləsuvar'],
    svgPath: 'M 250,150 L 330,170 L 390,140 L 460,145 L 485,210 L 470,280 L 410,290 L 320,270 L 260,230 Z',
    labelX: 365,
    labelY: 215,
    badgeX: 395,
    badgeY: 190,
    color: '#d97706', // amber-600
  },
  {
    id: 'karabakh',
    name: 'Qarabağ və Şərqi Zəngəzur',
    shortName: 'Qarabağ & Zəngəzur',
    description: 'Şuşa, Xankəndi, Ağdam, Füzuli, Zəngilan, Laçın, Kəlbəcər, Cəbrayıl, Qubadlı, Bərdə, Tərtər',
    centerCity: 'Şuşa',
    cities: ['Şuşa', 'Xankəndi', 'Ağdam', 'Füzuli', 'Zəngilan', 'Laçın', 'Kəlbəcər', 'Cəbrayıl', 'Qubadlı', 'Xocalı', 'Xocavənd', 'Bərdə', 'Tərtər', 'Ağcabədi'],
    svgPath: 'M 170,225 L 230,220 L 260,230 L 320,270 L 310,350 L 240,360 L 180,310 L 150,260 Z',
    labelX: 235,
    labelY: 285,
    badgeX: 265,
    badgeY: 260,
    color: '#16a34a', // green-600
  },
  {
    id: 'lankaran-astara',
    name: 'Lənkəran-Astara və Cənub',
    shortName: 'Lənkəran-Astara',
    description: 'Lənkəran, Masallı, Astara, Lerik, Yardımlı, Cəlilabad',
    centerCity: 'Lənkəran',
    cities: ['Lənkəran', 'Masallı', 'Astara', 'Lerik', 'Yardımlı', 'Cəlilabad'],
    svgPath: 'M 410,290 L 470,280 L 490,320 L 485,385 L 450,405 L 415,370 L 400,320 Z',
    labelX: 445,
    labelY: 345,
    badgeX: 470,
    badgeY: 320,
    color: '#0d9488', // teal-600
  },
  {
    id: 'nakhchivan',
    name: 'Naxçıvan Muxtar Respublikası',
    shortName: 'Naxçıvan MR',
    description: 'Naxçıvan şəhəri, Ordubad, Culfa, Şərur, Babək, Şahbuz, Kəngərli, Sədərək',
    centerCity: 'Naxçıvan',
    cities: ['Naxçıvan', 'Şərur', 'Ordubad', 'Culfa', 'Şahbuz', 'Babək', 'Kəngərli', 'Sədərək'],
    svgPath: 'M 35,270 L 95,245 L 140,290 L 130,340 L 70,360 L 25,320 Z',
    labelX: 85,
    labelY: 300,
    badgeX: 110,
    badgeY: 275,
    color: '#ea580c', // orange-600
  },
];

// Special Work Options
export const SPECIAL_WORK_PREFERENCES = [
  {
    id: 'remote',
    name: 'Məsafədən / Remote (Online)',
    shortName: 'Məsafədən (Remote)',
    icon: '🌐',
    description: 'Evdən, onlayn və ya istənilən məkandan uzaqdan işləməyə hazırdır',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'all-azerbaijan',
    name: 'Bütün Azərbaycan (Ezamiyyətə Açıq)',
    shortName: 'Bütün Azərbaycan',
    icon: '🇦🇿',
    description: 'Ölkə üzrə istənilən regiona ezamiyyətə və ya layihəyə getməyə tam hazırdır',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
];

export const ALL_REGION_FILTER_OPTIONS = [
  { id: 'all', name: 'Bütün Regionlar (Hamısı)' },
  ...CANDIDATE_REGIONS.map((r) => ({ id: r.id, name: r.name })),
  { id: 'remote', name: 'Məsafədən / Remote' },
  { id: 'all-azerbaijan', name: 'Bütün Azərbaycan' },
];

/**
 * Get region ID from freeform text or city name
 */
export function detectRegionId(locationText?: string): string | null {
  if (!locationText) return null;
  const lower = locationText.toLowerCase().trim();

  if (lower.includes('remote') || lower.includes('məsafə') || lower.includes('onlayn') || lower.includes('online')) {
    return 'remote';
  }

  for (const reg of CANDIDATE_REGIONS) {
    if (lower.includes(reg.id)) return reg.id;
    if (lower.includes(reg.shortName.toLowerCase())) return reg.id;
    if (lower.includes(reg.name.toLowerCase())) return reg.id;
    for (const city of reg.cities) {
      if (lower.includes(city.toLowerCase())) return reg.id;
    }
  }

  return null;
}

/**
 * Get display name for a region ID
 */
export function getRegionDisplayName(regionId: string): string {
  if (regionId === 'remote') return 'Məsafədən / Remote';
  if (regionId === 'all-azerbaijan') return 'Bütün Azərbaycan';
  const found = CANDIDATE_REGIONS.find((r) => r.id === regionId);
  return found ? found.name : regionId;
}

/**
 * Comprehensive check whether a candidate matches a target region selection
 */
export function isCandidateInRegion(
  candidate: CandidateProfile,
  targetRegionId: string,
  filterMode: RegionMatchMode = 'all'
): boolean {
  if (!targetRegionId || targetRegionId === 'all' || targetRegionId === 'Hamısı') {
    if (filterMode === 'remote') {
      return (
        candidate.eligibleWorkRegions?.includes('remote') === true ||
        candidate.location?.toLowerCase().includes('remote') === true ||
        candidate.openToWork?.workplaceTypes?.includes('remote') === true
      );
    }
    if (filterMode === 'relocate') {
      return candidate.willingToRelocate === true || candidate.eligibleWorkRegions?.includes('all-azerbaijan') === true;
    }
    return true;
  }

  // 1. Candidate's living region
  const candLivingId = candidate.livingRegion || detectRegionId(candidate.livingCity) || detectRegionId(candidate.location) || 'baku';

  // 2. Candidate's eligible work regions
  const eligibleRegions = new Set<string>(candidate.eligibleWorkRegions || []);
  if (candidate.openToWork?.workplaceTypes?.includes('remote')) {
    eligibleRegions.add('remote');
  }
  if (candidate.location?.toLowerCase().includes('remote')) {
    eligibleRegions.add('remote');
  }

  // If candidate is willing to relocate or marked all-azerbaijan, they are eligible everywhere
  const isOpenEverywhere = candidate.willingToRelocate === true || eligibleRegions.has('all-azerbaijan');

  // Match logic based on filterMode
  if (filterMode === 'living') {
    return candLivingId === targetRegionId;
  }

  if (filterMode === 'eligible') {
    if (targetRegionId === 'remote') {
      return eligibleRegions.has('remote');
    }
    return eligibleRegions.has(targetRegionId) || isOpenEverywhere;
  }

  if (filterMode === 'remote') {
    return eligibleRegions.has('remote') || targetRegionId === 'remote';
  }

  if (filterMode === 'relocate') {
    return isOpenEverywhere;
  }

  // Default 'all' mode: matches if living there OR eligible to work there OR target is remote and they do remote
  if (targetRegionId === 'remote') {
    return eligibleRegions.has('remote');
  }

  if (targetRegionId === 'all-azerbaijan') {
    return isOpenEverywhere;
  }

  return (
    candLivingId === targetRegionId ||
    eligibleRegions.has(targetRegionId) ||
    isOpenEverywhere
  );
}

export interface RegionStatItem {
  total: number;
  living: number;
  eligible: number;
  relocatable: number;
}

export type RegionalStatsMap = Record<string, any> & {
  livingCounts: Record<string, number>;
  eligibleCounts: Record<string, number>;
  remoteCount: number;
  relocateCount: number;
  total: number;
};

/**
 * Calculate candidate distribution per region
 */
export function getCandidateRegionalStats(candidates: CandidateProfile[]): RegionalStatsMap {
  const livingCounts: Record<string, number> = {};
  const eligibleCounts: Record<string, number> = {};
  const byRegion: Record<string, RegionStatItem> = {};
  let remoteCount = 0;
  let relocateCount = 0;

  CANDIDATE_REGIONS.forEach((r) => {
    livingCounts[r.id] = 0;
    eligibleCounts[r.id] = 0;
    byRegion[r.id] = { total: 0, living: 0, eligible: 0, relocatable: 0 };
  });

  // Special options
  byRegion['remote'] = { total: 0, living: 0, eligible: 0, relocatable: 0 };
  byRegion['all-azerbaijan'] = { total: 0, living: 0, eligible: 0, relocatable: 0 };

  candidates.forEach((cand) => {
    const livingId = cand.livingRegion || detectRegionId(cand.livingCity) || detectRegionId(cand.location) || 'baku';
    if (livingCounts[livingId] !== undefined) {
      livingCounts[livingId]++;
    }

    const eligible = new Set<string>(cand.eligibleWorkRegions || []);
    const isRemote =
      cand.openToWork?.workplaceTypes?.includes('remote') ||
      cand.location?.toLowerCase().includes('remote') ||
      eligible.has('remote');

    if (isRemote) {
      remoteCount++;
      byRegion['remote'].total++;
      byRegion['remote'].eligible++;
    }

    const isRelocatable = cand.willingToRelocate || eligible.has('all-azerbaijan');
    if (isRelocatable) {
      relocateCount++;
      byRegion['all-azerbaijan'].total++;
      byRegion['all-azerbaijan'].eligible++;
      byRegion['all-azerbaijan'].relocatable++;
    }

    CANDIDATE_REGIONS.forEach((r) => {
      const isLiving = livingId === r.id;
      const isEligible = eligible.has(r.id) || isRelocatable;

      if (isLiving) {
        byRegion[r.id].living++;
      }
      if (isEligible) {
        eligibleCounts[r.id]++;
        byRegion[r.id].eligible++;
      }
      if (isRelocatable) {
        byRegion[r.id].relocatable++;
      }
      if (isLiving || isEligible) {
        byRegion[r.id].total++;
      }
    });
  });

  return {
    ...byRegion,
    livingCounts,
    eligibleCounts,
    remoteCount,
    relocateCount,
    total: candidates.length,
  };
}
