import { CVTemplateType } from '../../types';

export interface CVTemplateMeta {
  id: CVTemplateType;
  name: string;
  description: string;
  category: 'Modern' | 'Klassik' | 'ATS' | 'Kreativ' | 'Texnoloji' | 'Akademik' | 'Sadə' | 'Rəhbər' | 'Xidmət & Texniki';
  colorTheme: string;
  badge?: string;
  isPopular?: boolean;
}

export const CV_TEMPLATES: CVTemplateMeta[] = [
  {
    id: 'simple-clean',
    name: 'Sadə Təmiz Ağ',
    description: 'Heç bir artıq bəzək olmadan ultra-sadə, hər kəs üçün universal və asan oxunan ən rahat forma.',
    category: 'Sadə',
    colorTheme: '#475569',
    badge: 'Ultra-Sadə',
    isPopular: true
  },
  {
    id: 'entry-student',
    name: 'Başlanğıc & Tələbə',
    description: 'Tələbələr, stajorlar və karyerasına yeni başlayan gənclər üçün təhsil və potensial yönümlü forma.',
    category: 'Sadə',
    colorTheme: '#0284c7',
    badge: 'Tələbə & Junior'
  },
  {
    id: 'prestige-executive',
    name: 'Prestige Executive',
    description: 'Yuxarı vəzifələr, C-Level rəhbərlər (CEO, CFO, CTO), idarə heyəti və direktorlar üçün nüfuzlu dizayn.',
    category: 'Rəhbər',
    colorTheme: '#090d16',
    badge: 'C-Level & Direktor',
    isPopular: true
  },
  {
    id: 'practical-direct',
    name: 'Praktik İşçi & Xidmət',
    description: 'Xidmət sektoru, ticarət, sürücü, anbar, kuryer, operator və texniki işlər üçün aydın və dərhal anlaşılan forma.',
    category: 'Xidmət & Texniki',
    colorTheme: '#d97706',
    badge: 'Xidmət & Əməli'
  },
  {
    id: 'modern-emerald',
    name: 'Müasir Zümrüd',
    description: 'Zümrüd yaşılı zərif vurğular, fotoşəkil kartı və balanslaşdırılmış 2-sütunlu universal dizayn.',
    category: 'Modern',
    colorTheme: '#059669',
    badge: 'Populyar',
    isPopular: true
  },
  {
    id: 'classic-corporate',
    name: 'Klassik Korporativ',
    description: 'Bankçılıq, dövlət qulluğu, maliyyə və hüquq üçün formal, mərkəzləşdirilmiş nüfuzlu tərtibat.',
    category: 'Klassik',
    colorTheme: '#1e293b',
    isPopular: true
  },
  {
    id: 'minimal-indigo',
    name: 'Minimalist İndiqo',
    description: 'Skandinaviya təmizliyi, geniş ağ sahə və diqqəti yalnız vacib məlumatlara yönəldən minimalist stil.',
    category: 'Modern',
    colorTheme: '#4f46e5'
  },
  {
    id: 'slate-tech',
    name: 'Slate Texnoloji',
    description: 'Proqramçılar, mühəndislər və IT mütəxəssisləri üçün monospace teqlər və qaranlıq başlıq.',
    category: 'Texnoloji',
    colorTheme: '#0f172a',
    badge: 'IT & Dev'
  },
  {
    id: 'executive-burgundy',
    name: 'Lüks İcraçı Bordo',
    description: 'Rəhbərlər, direktorlar və menecerlər üçün dəbdəbəli tünd şərab qırmızı və qızılı zolaqlar.',
    category: 'Rəhbər',
    colorTheme: '#881337',
    badge: 'VIP Rəhbər'
  },
  {
    id: 'creative-coral',
    name: 'Yaradıcı Koral',
    description: 'Dizaynerlər, marketoloqlar və media mütəxəssisləri üçün canlı koral narıncı və dinamik kartlar.',
    category: 'Kreativ',
    colorTheme: '#ea580c',
    badge: 'Kreativ'
  },
  {
    id: 'compact-ats',
    name: 'Kompakt ATS Standartı',
    description: 'Beynəlxalq və yerli ATS skanerləri üçün 100% zəmanətli monoxrom tək-sütunlu format.',
    category: 'ATS',
    colorTheme: '#334155',
    badge: '100% ATS',
    isPopular: true
  },
  {
    id: 'nordic-teal',
    name: 'Skandinaviya Teal',
    description: 'Sol tünd rəngli əlaqə və bacarıq paneli, sağ zəngin xronoloji təcrübə axını.',
    category: 'Modern',
    colorTheme: '#0d9488'
  },
  {
    id: 'horizon-blue',
    name: 'Horizon Göy',
    description: 'Geniş göy qradiyent üfüqi banner və inteqrasiya olunmuş profil şəkli ilə vizual cazibə.',
    category: 'Modern',
    colorTheme: '#2563eb'
  },
  {
    id: 'academic-serif',
    name: 'Akademik və Elm',
    description: 'Tədqiqatçılar, müəllimlər və analitiklər üçün nəcib serif şrifti və elmi nailiyyət strukturu.',
    category: 'Akademik',
    colorTheme: '#292524'
  },
  {
    id: 'metro-violet',
    name: 'Metro Bənövşəyi',
    description: 'Startaplar və məhsul menecerləri üçün dairəvi kartlar və müasir bənövşəyi vurğular.',
    category: 'Kreativ',
    colorTheme: '#7c3aed'
  },
  {
    id: 'zurich-banking',
    name: 'İsveçrə Bank & Maliyyə',
    description: 'Bankirlər, maliyyəçilər, audit və hüquqşünaslar üçün İsveçrə dəqiqliyi və rəsmi nüfuzlu dizayn.',
    category: 'Rəhbər',
    colorTheme: '#0a192f',
    badge: 'Maliyyə & Audit',
    isPopular: true
  },
  {
    id: 'silicon-dev',
    name: 'Silikon Vadisi Tech',
    description: 'Mühəndislər, developerlər və texnologiya liderləri üçün qaranlıq terminal şapkası və kod monospace vurğuları.',
    category: 'Texnoloji',
    colorTheme: '#0f172a',
    badge: 'Tech & Dev',
    isPopular: true
  },
  {
    id: 'berlin-creative',
    name: 'Berlin Creative Studio',
    description: 'Qrafik dizaynerlər, art-direktorlar və marketoloqlar üçün asimmetrik stil və isti terrakota xətləri.',
    category: 'Kreativ',
    colorTheme: '#ea580c',
    badge: 'Dizayn & Art'
  },
  {
    id: 'tokyo-minimal',
    name: 'Tokyo Zen Minimal',
    description: 'İncə xətlər, sakit yapon minimalizmi, səliqəli tipoqrafika və nəfəs alan boşluqlar.',
    category: 'Sadə',
    colorTheme: '#64748b',
    badge: 'Zen Minimal'
  },
  {
    id: 'cambridge-scholar',
    name: 'Cambridge Akademik',
    description: 'Universitet professorları, elmi işçilər və beynəlxalq qrant tədqiqatçıları üçün rəsmi elmi format.',
    category: 'Akademik',
    colorTheme: '#1e293b',
    badge: 'Oxford / Ivy'
  },
  {
    id: 'scandinavian-edge',
    name: 'Nordic Meşə Zərif',
    description: 'Dərin meşə yaşılı (#1b4332) çalarları, balanslaşdırılmış iki sütunlu nizam və müasir skandinav estetika.',
    category: 'Modern',
    colorTheme: '#1b4332',
    badge: 'Nordic Clean'
  },
  {
    id: 'dubai-gold',
    name: 'Dubai Lüks & Qızıl',
    description: 'Tünd göy fon, qızılı zolaqlar və premium rəhbər statusu. Yüksək maaşlı vəzifələr və beynəlxalq şirkətlər üçün lüks dizayn.',
    category: 'Rəhbər',
    colorTheme: '#d4af37',
    badge: 'VIP Gold',
    isPopular: true
  },
  {
    id: 'vienna-formal',
    name: 'Vyana Rəsmi Hüquq',
    description: 'Klassik Avstriya hüquqşünaslıq və audit üslubu. İkiqat rəsmi çərçivə, nəcib serif şrifti və yüksək dərəcəli rəsmiyyət.',
    category: 'Klassik',
    colorTheme: '#292524',
    badge: 'Hüquq & Audit'
  },
  {
    id: 'amsterdam-modern',
    name: 'Amsterdam Modern Tech',
    description: 'Müasir kart modulları, səma mavisi vurğular və aydın struktur. Startaplar və texnoloji sahələr üçün ideal seçim.',
    category: 'Texnoloji',
    colorTheme: '#0284c7',
    badge: 'Modern Tech'
  },
  {
    id: 'seoul-minimal',
    name: 'Seoul Minimalist Pastel',
    description: 'Yumşaq xətlər, sakit koreya minimalizmi və rahat oxunan geniş məkanlar. Zərif və müasir təqdimat.',
    category: 'Sadə',
    colorTheme: '#6366f1',
    badge: 'Seoul Pastel'
  },
  {
    id: 'baku-corporate',
    name: 'Bakı Korporativ & Neft-Qaz',
    description: 'Xəzər göyü və mis/bürünc vurğular. Neft-qaz, sənaye, mühəndislik və iri holdinglər üçün prestijli korporativ dizayn.',
    category: 'Rəhbər',
    colorTheme: '#0f2b48',
    badge: 'Neft & Sənaye',
    isPopular: true
  },
  {
    id: 'paris-elegance',
    name: 'Paris Zərif & Moda',
    description: 'Fransız dəb və dizayn jurnalı estetikasında incə xətlər, nəcib serif şrifti və zərif tipoqrafik nizam.',
    category: 'Kreativ',
    colorTheme: '#9b5168',
    badge: 'Dəb & Art'
  },
  {
    id: 'ats-pro-clean',
    name: 'ATS Pro Qlobal Standart',
    description: 'Beynəlxalq və yerli ATS alqoritmlərini 100% keçən, semantik başlıqlı və təmiz oxunan monoxrom şablon.',
    category: 'ATS',
    colorTheme: '#0f172a',
    badge: '100% ATS Pro',
    isPopular: true
  },
  {
    id: 'toronto-hybrid',
    name: 'Toronto İnnovativ İki-Sütun',
    description: 'Polad mavisi sol panel, sağ tərəfdə ölçülə bilən nailiyyətlər və dinamik struktur. IT və biznes liderləri üçün ideal seçim.',
    category: 'Texnoloji',
    colorTheme: '#1a2d42',
    badge: 'Tech & Lider'
  },
  {
    id: 'florence-classic',
    name: 'Florensiya Klassik İntibah',
    description: 'İsti perqament fon, terrakota çərçivələr və klassik humanitar nizam. Tibb, təhsil, elmi-tədqiqat və hüquq üçün nəcib forma.',
    category: 'Klassik',
    colorTheme: '#9c4126',
    badge: 'Klassik İntibah'
  }
];
