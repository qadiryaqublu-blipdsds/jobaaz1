import { GigProfile, GigOffer, GigProfileType, GigAvailability } from '../types';

const LS_GIG_PROFILES = 'jobia_gig_profiles_v1';
const LS_GIG_OFFERS = 'jobia_gig_offers_v1';

export const INITIAL_GIG_PROFILES: GigProfile[] = [
  // 1. CASUAL HOURLY WORKERS
  {
    id: 'gig-worker-1',
    type: 'casual_worker',
    fullName: 'Elşən Məmmədov',
    title: 'Tədbir & Ziyafət Baş Ofisiantı & Barmen',
    category: 'Tədbir & HoReCa',
    phone: '+994 50 412 88 19',
    whatsapp: '994504128819',
    email: 'elshen.horeca@gmail.com',
    location: 'Bakı (Bütün rayonlar)',
    rating: 4.95,
    reviewsCount: 38,
    hourlyRate: 12,
    dailyRate: 65,
    currency: 'AZN',
    availability: 'available_today',
    subjectsOrSkills: ['Banket xidməti', 'Kokteyl & Bar', 'Protokol ziyafətləri', 'VIP masa xidməti', 'İngilis dili (B1)'],
    experienceYears: 5,
    completedGigsCount: 142,
    verified: true,
    badges: ['👑 Top İfaçı', '⚡ Bugün Hazır', '🛡️ Təsdiqlənmiş'],
    bio: '5 ildən artıqdır ki, Bakının ən böyük otel və restoranlarında (Four Seasons, JW Marriott, Fairmont) ziyafət, toy və rəsmi dövlət tədbirlərində xidmət göstərirəm. Gigiyena qaydalarına, ziyafət etiketlərinə tam riayət edirəm. Təmiz klassik uniformam (qara/ağ) hər zaman hazırdır.',
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Rauf Əliyev',
        authorRole: 'Tədbir Meneceri (Baku Events)',
        rating: 5,
        comment: 'Elşən korporativ tədbirimizdə çox yüksək səviyyədə işlədi. Çox çevik və nəzakətlidir. Tövsiyə edirəm!',
        date: '2026-09-20',
      },
      {
        id: 'rev-2',
        authorName: 'Səbinə Xəlilova',
        authorRole: 'Toy Təşkilatçısı',
        rating: 5,
        comment: 'Vaxtında gəldi, qonaqlar çox razı qaldı. Hər detalına qədər peşəkardır.',
        date: '2026-09-12',
      }
    ],
    createdAt: '2026-08-15',
  },
  {
    id: 'gig-worker-2',
    type: 'casual_worker',
    fullName: 'Rəşad Quliyev',
    title: 'Professional Santexnik və Elektrik Ustası',
    category: 'Usta & Təmir',
    phone: '+994 55 780 23 44',
    whatsapp: '994557802344',
    email: 'reshad.usta@mail.ru',
    location: 'Bakı və Abşeron (Xırdalan, Sumqayıt)',
    rating: 4.9,
    reviewsCount: 52,
    hourlyRate: 18,
    dailyRate: 80,
    currency: 'AZN',
    availability: 'flexible',
    subjectsOrSkills: ['İstilik sistemləri (Kombi)', 'Boru montajı', 'Elektrik xətləri', 'Qısaqapanma təmiri', 'Avadanlıq quraşdırma'],
    experienceYears: 9,
    completedGigsCount: 230,
    verified: true,
    badges: ['🛠️ Usta Mütəxəssis', '⭐ Yüksək Reytinq', '🛡️ Təsdiqlənmiş VÖEN'],
    bio: '9 illik praktiki təcrübəyə malik elektrik-santexnik ustasıyam. Müasir alət dəstlərimlə ünvana operativ yaxınlaşıram. Kombi, su xətləri, rozetka, avtomat şiti, qızdırıcıların quraşdırılması və təmiri. Görülən hər bir işə zəmanət verirəm.',
    reviews: [
      {
        id: 'rev-3',
        authorName: 'Kamran M.',
        authorRole: 'Mənzil Sahibi',
        rating: 5,
        comment: 'Gecə su sızması baş vermişdi, 30 dəqiqəyə çatdı və problemi kökündən həll etdi.',
        date: '2026-09-22',
      }
    ],
    createdAt: '2026-07-10',
  },
  {
    id: 'gig-worker-3',
    type: 'casual_worker',
    fullName: 'Nərmin Əliyeva',
    title: 'Tədbir Qeydiyyatçısı, Promouter & Sərgi Hostesi',
    category: 'Tədbir & Marketinq',
    phone: '+994 70 331 45 90',
    whatsapp: '994703314590',
    location: 'Bakı (Baku Expo Center, Heydər Əliyev Mərkəzi)',
    rating: 4.98,
    reviewsCount: 29,
    hourlyRate: 10,
    dailyRate: 50,
    currency: 'AZN',
    availability: 'weekends',
    subjectsOrSkills: ['Qonaq qarşılama', 'Sərgi stendi təqdimatı', 'İngilis dili (C1)', 'Rus dili (Sərbəst)', 'Bilet və QR skan'],
    experienceYears: 3,
    completedGigsCount: 65,
    verified: true,
    badges: ['🌐 3 Dil Bilgisi', '✨ VIP Hostes', '⚡ Sürətli Əlaqə'],
    bio: 'BDU Beynəlxalq Münasibətlər məzunuyam. Beynəlxalq neft-qaz sərgilərində, Caspian Agro, Baku Build və konsertlərdə moderator, hostes və qeydiyyat koordinatoru kimi çalışmışam. Yüksək ünsiyyət mədəniyyəti, gülərüzlük və punktuallıq.',
    createdAt: '2026-08-01',
  },
  {
    id: 'gig-worker-4',
    type: 'casual_worker',
    fullName: 'Tural İbrahimov',
    title: 'Ekspress Moto & Avto Kuryer (Şəxsi Nəqliyyatla)',
    category: 'Kuryer & Çatdırılma',
    phone: '+994 99 811 00 23',
    whatsapp: '994998110023',
    location: 'Bakı daxili (Nəsimi, Yasamal, Səbail, Xətai)',
    rating: 4.88,
    reviewsCount: 45,
    hourlyRate: 10,
    dailyRate: 55,
    currency: 'AZN',
    availability: 'available_today',
    subjectsOrSkills: ['Sənəd çatdırılması', 'E-ticarət bağlamaları', 'Termoçanta', 'Şəhər naviqasiyası', 'Giro & POS terminal'],
    experienceYears: 4,
    completedGigsCount: 310,
    verified: true,
    badges: ['🚀 Sürətli Çatdırılma', '⚡ Bugün Hazır'],
    bio: 'Şəxsi Yamaha motosikleti və Chevrolet Cruze avtomobilim var. Saatlıq və ya günlük çatdırılma sifarişləri qəbul edirəm. Məxfi sənədlər, hədiyyələr, təcili bağlamalar üçün təhlükəsiz və dəqiq çatdırılma zəmanəti.',
    createdAt: '2026-08-20',
  },
  {
    id: 'gig-worker-5',
    type: 'casual_worker',
    fullName: 'Fərid Səfərov',
    title: 'Tədbir, Məhsul & Toy Fotoqrafı / Videoqraf',
    category: 'Foto & Video',
    phone: '+994 50 620 11 87',
    whatsapp: '994506201187',
    location: 'Bakı və Regionlar',
    rating: 4.96,
    reviewsCount: 34,
    hourlyRate: 25,
    dailyRate: 130,
    currency: 'AZN',
    availability: 'flexible',
    subjectsOrSkills: ['Sony Alpha A7IV', 'Dron çəkilişi (DJI Mini 4)', 'Lightroom rəng korreksiyası', 'Reels & TikTok video montajı', 'Sürətli təhvil'],
    experienceYears: 6,
    completedGigsCount: 110,
    verified: true,
    badges: ['📸 Peşəkar Texnika', '⚡ 24 Saat İçində Təhvil'],
    bio: 'Korporativ tədbirlər, seminarlar, restoran menyusu çəkilişləri və ad günləri üçün saatlıq və günlük çəkilişlər aparıram. Çəkilən foto və videoları 24-48 saat ərzində peşəkar retuşla təhvil verirəm.',
    createdAt: '2026-07-25',
  },

  // 2. TUTORS & COURSE INSTRUCTORS (REPETİTOR VƏ KURS MÜƏLLİMLƏRİ)
  {
    id: 'gig-tutor-1',
    type: 'tutor_instructor',
    fullName: 'Aysel Həsənli',
    title: 'İngilis Dili Repetitoru & IELTS Təlimçisi (IELTS 8.5)',
    category: 'Xarici Dillər',
    phone: '+994 51 900 44 22',
    whatsapp: '994519004422',
    email: 'aysel.english.ielts@gmail.com',
    location: 'Bakı (Elmlər Akademiyası) & Onlayn (Zoom)',
    rating: 4.99,
    reviewsCount: 68,
    hourlyRate: 20,
    monthlyRate: 160,
    currency: 'AZN',
    availability: 'evenings',
    formats: ['online', 'in_person', 'tutor_place'],
    subjectsOrSkills: ['IELTS General & Academic (8.5)', 'General English (A1-C1)', 'Danışıq Klubu (Speaking Club)', 'Business English', 'Xaricdə Təhsil Motivasiya Məktubları'],
    experienceYears: 7,
    completedGigsCount: 180,
    verified: true,
    trialLessonAvailable: true,
    badges: ['🎓 IELTS 8.5 Sertifikatlı', '✨ Pulsuz Sınaq Dərsi', '🏆 200+ Uğurlu Tələbə'],
    educationOrCertifications: ['Cambridge CELTA Sertifikatı', 'IELTS Academic 8.5 (2025)', 'ADU İngilis dili Filologiyası Magistr'],
    bio: '7 illik pedaqoji təcrübəyə malikəm. Tələbələrimin 80%-dən çoxu IELTS imtahanından 7.0+ nəticə əldə edib. Dərslər tam fərdiləşdirilmiş proqramla, ən son Kembric materialları və interaktiv lüğət bazası ilə keçirilir. İlk 30 dəqiqəlik sınaq dərsi tamamilə PULSUZDUR!',
    reviews: [
      {
        id: 'rev-t1',
        authorName: 'Nihad Vəliyev',
        authorRole: 'Tələbə (IELTS 7.5)',
        rating: 5,
        comment: 'Aysel xanımla cəmi 3 aya Speaking balımı 6.0-dan 7.5-ə qaldırdım. Dərslər çox maraqlı və effektiv keçir.',
        date: '2026-09-18',
      },
      {
        id: 'rev-t2',
        authorName: 'Aytən M.',
        authorRole: 'Tələbə',
        rating: 5,
        comment: 'Həm onlayn, həm əyani dərsləri mükəmməldir. Materialları tam təmin edir.',
        date: '2026-09-05',
      }
    ],
    createdAt: '2026-06-20',
  },
  {
    id: 'gig-tutor-2',
    type: 'tutor_instructor',
    fullName: 'Murad Rəhimov',
    title: 'Python, Scratch & Web Proqramlaşdırma Mentoru',
    category: 'İT & Rəqəmsal Texnologiyalar',
    phone: '+994 50 710 89 00',
    whatsapp: '994507108900',
    email: 'murad.codes@gmail.com',
    location: 'Onlayn (Discord / Google Meet) & Bakı',
    rating: 4.94,
    reviewsCount: 42,
    hourlyRate: 25,
    monthlyRate: 180,
    currency: 'AZN',
    availability: 'weekends',
    formats: ['online', 'student_home', 'tutor_place'],
    subjectsOrSkills: ['Python (Numpy, Pandas, Django)', 'Frontend (HTML, CSS, React, JS)', 'Uşaqlar üçün Scratch & Roblox', 'Alqoritmika & Data Structures', 'Portfolio layihələr'],
    experienceYears: 5,
    completedGigsCount: 88,
    verified: true,
    trialLessonAvailable: true,
    badges: ['💻 Senior Mühəndis', '🚀 Praktiki Layihələr', '✨ Sınaq Dərsi Var'],
    educationOrCertifications: ['UFAZ Kompüter Elmləri Məzunu', 'Oracle Certified Associate'],
    bio: 'Yerli və beynəlxalq şirkətlərdə proqramçı kimi çalışıram. 0-dan proqramlaşdırma öyrənmək istəyən gənclər və uşaqlar üçün praktiki, real layihələr əsaslı dərslər keçirəm. Hər dərsin sonunda tələbə real kod yazır və öz portfoliyasını qurur.',
    createdAt: '2026-07-15',
  },
  {
    id: 'gig-tutor-3',
    type: 'tutor_instructor',
    fullName: 'Günel Məmmədova',
    title: 'Riyaziyyat və Məntiq Repetitoru (Abituriyent, Buraxılış & MİQ)',
    category: 'Məktəb & İmtahana Hazırlıq',
    phone: '+994 55 432 99 11',
    whatsapp: '994554329911',
    location: 'Bakı, Nərimanov (Metronun çıxışı)',
    rating: 4.97,
    reviewsCount: 56,
    hourlyRate: 15,
    monthlyRate: 130,
    currency: 'AZN',
    availability: 'flexible',
    formats: ['in_person', 'tutor_place', 'online'],
    subjectsOrSkills: ['DİM 9 və 11-ci sinif buraxılış', 'I və II qrup riyaziyyat qəbulu', 'MİQ (Müəllimlərin İşə Qəbulu)', 'Magistratura Məntiq', 'Fərdi test bankı'],
    experienceYears: 10,
    completedGigsCount: 160,
    verified: true,
    trialLessonAvailable: true,
    badges: ['📐 10 İllik Təcrübə', '🎯 95%+ Qəbul Nəticəsi', '🛡️ Təsdiqlənmiş Müəllim'],
    educationOrCertifications: ['BDU Tətbiqi Riyaziyyat Magistr', 'Əməkdar Müəllim Təlim Kursu'],
    bio: '10 ildir ki, abituriyentləri və müəllimləri DİM və Elm və Təhsil Nazirliyinin standartları üzrə hazırlayıram. Hər tələbə ilə fərdi zəif tərəflər təhlil olunur, həftəlik sınaq imtahanları təşkil edilir və nəticələr valideynlərə rəsmi təqdim olunur.',
    createdAt: '2026-06-10',
  },
  {
    id: 'gig-tutor-4',
    type: 'tutor_instructor',
    fullName: 'Samir Qasımov',
    title: 'Dövlət Qulluğu Qanunvericilik və İnformatika Təlimçisi',
    category: 'Dövlət Qulluğu & Karyera',
    phone: '+994 77 550 78 90',
    whatsapp: '994775507890',
    location: 'Bakı (Sahil) & Onlayn',
    rating: 4.92,
    reviewsCount: 37,
    hourlyRate: 18,
    monthlyRate: 140,
    currency: 'AZN',
    availability: 'evenings',
    formats: ['online', 'in_person'],
    subjectsOrSkills: ['Azərbaycan Konstitusiyası və Qanunları', 'Dövlət Qulluğu haqqında Qanun', 'DİM Test Texnikası', 'İnformatika və Kompüter bilikləri', 'Müsahibə Mərhələsinə Hazırlıq'],
    experienceYears: 6,
    completedGigsCount: 95,
    verified: true,
    badges: ['⚖️ Hüquqşünas Təlimçi', '🏛️ BB və BA İxtisaslaşması'],
    bio: 'Dövlət İmtahan Mərkəzinin (DİM) Dövlət Qulluğu imtahanlarına (inzibati rəhbər və icraçı vəzifələr üzrə BB, BA qrupları) intensiv hazırlıq. Qanunvericiliyin asan yadda qalması üçün xüsusi vizual cədvəllər və minlərlə real test bazası.',
    createdAt: '2026-07-28',
  },
  {
    id: 'gig-tutor-5',
    type: 'tutor_instructor',
    fullName: 'Nigar Sultanova',
    title: 'Rus Dili Praktiki Danışıq və Qrammatika Müəllimi (Native Speaker)',
    category: 'Xarici Dillər',
    phone: '+994 50 310 99 44',
    whatsapp: '994503109944',
    location: 'Bakı (Yasamal) & Onlayn',
    rating: 4.96,
    reviewsCount: 48,
    hourlyRate: 16,
    monthlyRate: 120,
    currency: 'AZN',
    availability: 'available_today',
    formats: ['online', 'in_person', 'tutor_place'],
    subjectsOrSkills: ['Rus dili danışıq (Разговорный русский)', 'Məktəblilər üçün rus bölməsi dərsləri', 'İşgüzar rus dili (Деловой русский)', 'Tələffüz korreksiyası', '0-dan rus dili'],
    experienceYears: 8,
    completedGigsCount: 135,
    verified: true,
    trialLessonAvailable: true,
    badges: ['🇷🇺 Native Speaker', '⚡ Danışıq Əsaslı', '✨ Sınaq Dərsi'],
    bio: 'Rus dilini ana dili səviyyəsində bilən təcrübəli pedaqoq. Əgər dil baryeriniz varsa və danışmaqda çətinlik çəkirsinizsə, cəmi 1-2 ay ərzində sərbəst ünsiyyət qurmağınıza kömək edəcəyəm. Məktəblilər və böyüklər üçün fərdi yanaşma.',
    createdAt: '2026-08-05',
  },
];

export const INITIAL_GIG_OFFERS: GigOffer[] = [
  {
    id: 'gig-offer-1',
    posterName: 'Baku Hospitality Group (Restoran)',
    posterPhone: '+994 12 598 44 20',
    posterWhatsapp: '994504128819',
    type: 'need_casual_worker',
    title: 'Şənbə günü ziyafət üçün 4 nəfər təcrübəli ofisiant axtarılır',
    category: 'Tədbir & HoReCa',
    rateOffered: '65 ₼/gün (Nahar + Taksi daxildir)',
    location: 'Bakı, Nəsimi rayonu (Nizami küç.)',
    dateOrSchedule: 'Bu Şənbə, 16:00 - 23:30',
    description: 'Qapalı korporativ ziyafət üçün ağ köynək, qara şalvar uniforması olan 4 nəfər peşəkar ofisiant dəvət olunur. Ödəniş işin sonunda dərhal nağd və ya karta köçürülməklə edilir.',
    status: 'open',
    applicantsCount: 6,
    createdAt: '2026-09-26',
  },
  {
    id: 'gig-offer-2',
    posterName: 'Leyla Xanım (Valideyn)',
    posterPhone: '+994 50 200 11 99',
    posterWhatsapp: '994502001199',
    type: 'need_tutor',
    title: '9-cu sinif buraxılış imtahanı üçün fərdi Riyaziyyat repetitoru',
    category: 'Məktəb & Təhsil',
    rateOffered: '130 ₼/ay (Həftədə 2 dəfə 90 dəq.)',
    location: 'Bakı, Əhmədli (Tələbənin evində və ya Nərimanovda)',
    dateOrSchedule: 'Həftədə 2 dəfə, saat 16:00-dan sonra',
    description: 'Oğlum 9-cu sinifdə oxuyur. DİM buraxılış imtahanına məqsədyönlü hazırlaşmaq istəyirik. Səbirli, təcrübəli və nəticəyə fokuslanmış müəllim axtarılır.',
    status: 'open',
    applicantsCount: 4,
    createdAt: '2026-09-25',
  },
  {
    id: 'gig-offer-3',
    posterName: 'TechExpo MMC',
    posterPhone: '+994 55 330 80 11',
    posterWhatsapp: '994553308011',
    type: 'need_casual_worker',
    title: '3 günlük İT sərgisində stend qeydiyyatçısı və hostes (2 nəfər)',
    category: 'Tədbir & Marketinq',
    rateOffered: '50 ₼/gün (Cəmi 150 ₼)',
    location: 'Baku Expo Center',
    dateOrSchedule: 'Gələn həftə: Çərşənbə-Cümə, 09:30 - 17:30',
    description: 'Sərgiyə gələn qonaqların qeydiyyatı, bukletlərin paylanması və ingilis dilində qısa məlumat verilməsi. İngilis dili biliyi üstünlükdür.',
    status: 'open',
    applicantsCount: 9,
    createdAt: '2026-09-24',
  },
  {
    id: 'gig-offer-4',
    posterName: 'Fərid Əliyev (Startap Təsisçisi)',
    posterPhone: '+994 70 811 22 33',
    posterWhatsapp: '994708112233',
    type: 'need_tutor',
    title: 'Həftəsonu üçün fərdi Python & Django mentoru axtarılır',
    category: 'İT & Proqramlaşdırma',
    rateOffered: '25 ₼/saat',
    location: 'Onlayn (Google Meet)',
    dateOrSchedule: 'Həftəsonları 2 saat',
    description: 'Öz startap layihəmin backend hissəsini yazmaq üçün təcrübəli mentor axtarıram. Kod analizi və arxitektura məsələlərində bələdçilik lazımdır.',
    status: 'open',
    applicantsCount: 3,
    createdAt: '2026-09-23',
  },
];

// Helper to get stored gig profiles
export function getGigProfiles(): GigProfile[] {
  if (typeof localStorage === 'undefined') return INITIAL_GIG_PROFILES;
  try {
    const raw = localStorage.getItem(LS_GIG_PROFILES);
    if (!raw) {
      localStorage.setItem(LS_GIG_PROFILES, JSON.stringify(INITIAL_GIG_PROFILES));
      return INITIAL_GIG_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LS_GIG_PROFILES, JSON.stringify(INITIAL_GIG_PROFILES));
      return INITIAL_GIG_PROFILES;
    }
    return parsed;
  } catch {
    return INITIAL_GIG_PROFILES;
  }
}

// Helper to save gig profiles
export function saveGigProfile(profile: GigProfile): GigProfile[] {
  const current = getGigProfiles();
  const existingIdx = current.findIndex((p) => p.id === profile.id);
  let updated: GigProfile[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = profile;
  } else {
    updated = [profile, ...current];
  }

  try {
    localStorage.setItem(LS_GIG_PROFILES, JSON.stringify(updated));
  } catch {}

  return updated;
}

// Helper to delete gig profile
export function deleteGigProfile(profileId: string): GigProfile[] {
  const current = getGigProfiles();
  const updated = current.filter((p) => p.id !== profileId);
  try {
    localStorage.setItem(LS_GIG_PROFILES, JSON.stringify(updated));
  } catch {}
  return updated;
}

// Helper to get gig offers
export function getGigOffers(): GigOffer[] {
  if (typeof localStorage === 'undefined') return INITIAL_GIG_OFFERS;
  try {
    const raw = localStorage.getItem(LS_GIG_OFFERS);
    if (!raw) {
      localStorage.setItem(LS_GIG_OFFERS, JSON.stringify(INITIAL_GIG_OFFERS));
      return INITIAL_GIG_OFFERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LS_GIG_OFFERS, JSON.stringify(INITIAL_GIG_OFFERS));
      return INITIAL_GIG_OFFERS;
    }
    return parsed;
  } catch {
    return INITIAL_GIG_OFFERS;
  }
}

// Helper to add gig offer
export function addGigOffer(offer: GigOffer): GigOffer[] {
  const current = getGigOffers();
  const updated = [offer, ...current];
  try {
    localStorage.setItem(LS_GIG_OFFERS, JSON.stringify(updated));
  } catch {}
  return updated;
}

// Build pre-filled WhatsApp contact message
export function buildGigWhatsAppLink(profile: GigProfile, customSenderName?: string): string {
  const cleanPhone = profile.whatsapp.replace(/\D/g, '');
  const senderText = customSenderName ? `Mən ${customSenderName}.` : 'Mən jobia.az istifadəçisiyəm.';
  
  const roleType = profile.type === 'tutor_instructor' 
    ? `müəllimlik/repetitorluq profilinizi («${profile.title}»)`
    : `günlük/saatlıq xidmət profilinizi («${profile.title}»)`;

  const msg = `Salam, ${profile.fullName}! ${senderText} jobia.az platformasında ${roleType} gördüm və sizinlə əməkdaşlıq / sifariş şərtlərini dəqiqləşdirmək istəyirəm. Uyğun vaxtınız varmı?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function buildOfferWhatsAppLink(offer: GigOffer, applicantName?: string): string {
  const cleanPhone = offer.posterWhatsapp.replace(/\D/g, '');
  const sender = applicantName ? `Adım: ${applicantName}.` : '';

  const msg = `Salam! jobia.az platformasında yerləşdirdiyiniz «${offer.title}» elanı üzrə yazıram. ${sender} Şərtlər və detallarla bağlı maraqlanıram.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
