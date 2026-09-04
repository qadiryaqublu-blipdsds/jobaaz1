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
  }
];
