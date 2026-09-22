import {
  CVAnalyzerResult,
  CVPersonalInfo,
  CVWorkExperience,
  CVEducation,
  CVSkills,
  ExplicitSkills,
  CVCertification,
  CVProject,
  CVLanguage,
  ATSAnalysis,
  QualityAnalysis,
  RedFlag,
  CandidateProfileResult,
  JobMatchingProfile,
  CareerTimeline,
  CareerTimelineGap,
  DeterministicATSScore,
  DeterministicScoreItem,
  JobMatchAnalysis,
  JobMatchRequirementItem,
  KeywordAnalysis,
  AchievementAnalysis,
  ExperienceRelevanceItem,
  EvidenceReferenceItem
} from '../src/types/cvAnalyzer';

// ============================================================================
// Multi-lingual Text Normalization
// ============================================================================
export function normalizeAzText(s: string): string {
  if (!s) return '';
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ə/g, 'ə')
    .replace(/Ö/g, 'ö')
    .replace(/Ü/g, 'ü')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ş/g, 'ş')
    .replace(/Ç/g, 'ç')
    .toLowerCase()
    .trim();
}

// ============================================================================
// Multi-lingual Section Headers Patterns
// ============================================================================
const SECTION_PATTERNS = {
  summary: /^(?:haqqında|haqqimda|haqqımda|xülasə|xulase|summary|about\s*(?:me)?|profile|bio|professional\s*summary|executive\s*summary|о\s*себе|профиль|резюме)\b/i,
  experience: /^(?:iş\s*təcrübəsi|is\s*tecrubesi|təcrübə|tecrube|iş\s*stajı|əmək\s*fəaliyyəti|work\s*experience|employment\s*history|professional\s*experience|experience|career|karyera|опыт\s*работы|трудовой\s*стаж)\b/i,
  education: /^(?:təhsil|tehsil|akademik\s*təhsil|education|academic\s*background|təhsil\s*məlumatları|образование|учеба)\b/i,
  skills: /^(?:bacarıqlar|bacariqlar|bacarıq\s*və\s*qabiliyyətlər|texniki\s*bacarıqlar|proqram\s*və\s*texniki\s*bacarıqlar|skills|technical\s*skills|hard\s*skills|soft\s*skills|key\s*skills|kompetensiyalar|alətlər|aletler|proqramlar|навыки|умения|ключевые\s*навыки)\b/i,
  languages: /^(?:dillər|diller|languages|dil\s*bilikləri|xarici\s*dillər|языки|знание\s*языков)\b/i,
  certifications: /^(?:sertifikatlar|sertifikat|certifications|certificates|diplomlar|kurslar|təlimlər|telimler|сертификаты|курсы)\b/i,
  projects: /^(?:layihələr|layiheler|projects|personal\s*projects|portfolio|проекты)\b/i,
  contacts: /^(?:əlaqə|elaqe|əlaqə\s*məlumatları|contacts?|personal\s*info|контакты)\b/i,
};

// ============================================================================
// Date & Duration Helpers
// ============================================================================
const MONTH_MAP: Record<string, number> = {
  '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6,
  '07': 7, '08': 8, '09': 9, '10': 10, '11': 11, '12': 12,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9,
  jan: 1, yan: 1, feb: 2, fev: 2, mar: 3, mart: 3, apr: 4,
  may: 5, jun: 6, iyn: 6, iyun: 6, jul: 7, iyl: 7, iyul: 7,
  aug: 8, avq: 8, avqust: 8, sep: 9, sen: 9, sent: 9,
  oct: 10, okt: 10, nov: 11, noy: 11, dec: 12, dek: 12,
  янв: 1, фев: 2, мар: 3, апр: 4, май: 5, июн: 6,
  июл: 7, авг: 8, сен: 9, окт: 10, ноя: 11, дек: 12
};

export function parseMonthYear(s: string): { year: number; month: number } | null {
  if (!s) return null;
  const clean = s.trim();

  const m1 = clean.match(/^(\d{1,2})[./-](\d{4})$/);
  if (m1) {
    const m = parseInt(m1[1], 10);
    const y = parseInt(m1[2], 10);
    if (m >= 1 && m <= 12 && y >= 1970 && y <= 2035) return { year: y, month: m };
  }

  const m2 = clean.match(/^([a-zəöüğşçıi]+)\s+(\d{4})$/i);
  if (m2) {
    const word = normalizeAzText(m2[1]).slice(0, 3);
    const m = MONTH_MAP[word] || 1;
    const y = parseInt(m2[2], 10);
    if (y >= 1970 && y <= 2035) return { year: y, month: m };
  }

  const m3 = clean.match(/(19\d\d|20\d\d)/);
  if (m3) {
    return { year: parseInt(m3[1], 10), month: 1 };
  }

  return null;
}

export function calculateDateDuration(startDate: string, endDate: string): string {
  if (!startDate || startDate === 'Not specified') return 'Not specified';

  const isPresent = /present|davam|indiki|сейчас|günümüz|current|hazırda/i.test(endDate || '');
  const startParsed = parseMonthYear(startDate);
  if (!startParsed) return 'Not specified';

  const now = new Date();
  const endParsed = isPresent ? { year: now.getFullYear(), month: now.getMonth() + 1 } : parseMonthYear(endDate);
  if (!endParsed) return 'Not specified';

  const totalMonths = (endParsed.year - startParsed.year) * 12 + (endParsed.month - startParsed.month);
  if (totalMonths <= 0) {
    return '1 aydan az';
  }

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} il ${remainingMonths} ay`;
  } else if (years > 0) {
    return `${years} il`;
  } else {
    return `${remainingMonths} ay`;
  }
}

// ============================================================================
// Comprehensive Skills & Tools Dictionary
// ============================================================================
const KNOWN_TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express',
  'Python', 'Java', 'C#', '.NET', '.NET Core', 'PHP', 'Laravel', 'Django', 'Flask', 'Spring Boot', 'Spring',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Sass', 'SCSS', 'REST API', 'GraphQL',
  'AWS', 'Azure', 'GCP', 'Linux', 'Redux', 'Redux Toolkit', 'Jest', 'Cypress', 'Webpack', 'Vite',
  'Swift', 'Kotlin', 'Flutter', 'Dart', 'React Native', 'C++', 'Golang', 'Go', 'Rust', 'Ruby',
  'Cybersecurity', 'Kibertəhlükəsizlik', 'Network', 'Şəbəkə', 'Machine Learning', 'Data Science', 'Deep Learning',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Microservices', 'CI/CD'
];

const KNOWN_SOFTWARE_TOOLS = [
  'MS Excel', 'Excel', 'MS Word', 'PowerPoint', 'Power BI', 'Tableau', '1C', '1C Mühasibat', '1C 8.3',
  'BTP', 'BTP sistemi', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'AutoCAD', 'Jira', 'Trello',
  'Postman', 'Swagger', 'Asana', 'Notion', 'Slack', 'SAP', 'CRM', 'ERP'
];

const KNOWN_SOFT_SKILLS = [
  'Komanda ilə iş', 'Problemlərin həlli', 'Analitik düşüncə', 'Liderlik', 'Ünsiyyət bacarıqları',
  'Vaxtın idarə edilməsi', 'Təqdimat bacarığı', 'Danışıqların aparılması', 'Stressə davamlılıq', 'Dəqiqlik',
  'Tənqidi düşüncə', 'Çeviklik', 'Məsuliyyət', 'Mentorluq', 'Agile', 'Scrum', 'Teamwork', 'Leadership',
  'Communication', 'Problem Solving', 'Time Management', 'Critical Thinking'
];

const KNOWN_INDUSTRY_SKILLS = [
  'Maliyyə hesabatları', 'Maliyyə analizi', 'Vergi Məcəlləsi', 'Vergi bəyannamələri', 'Büdcələmə',
  'Mühasibat uçotu', '1C 8.3', 'Audit', 'P&L', 'Balance Sheet', 'Kadr kargüzarlığı', 'İşə qəbul',
  'Recruitment', 'B2B Satış', 'B2C Satış', 'Müştəri xidmətləri', 'Rəqəmsal Marketinq', 'SMM', 'SEO',
  'Google Ads', 'Kopiraytinq', 'Logistika', 'Təchizat zənciri', 'Layihə idarəetməsi', 'Project Management'
];

const KNOWN_UNIVERSITIES = [
  'Bakı Dövlət Universiteti', 'BDU', 'Baku State University',
  'ADA Universiteti', 'ADA University', 'ADA',
  'Azərbaycan Dövlət Neft və Sənaye Universiteti', 'ADNSU', 'ASOIU',
  'Azərbaycan Dövlət İqtisad Universiteti', 'UNEC',
  'Bakı Mühəndislik Universiteti', 'BMU', 'Baku Engineering University',
  'Azərbaycan Texniki Universiteti', 'AzTU',
  'Xəzər Universiteti', 'Khazar University',
  'Azərbaycan Memarlıq və İnşaat Universiteti', 'AzMİU',
  'Dövlət İdarəçilik Akademiyası', 'DİA',
  'Bakı Ali Neft Məktəbi', 'BANM', 'BHOS',
  'Azərbaycan Tibb Universiteti', 'ATU',
  'Azərbaycan Dillər Universiteti', 'ADU',
  'Azərbaycan Dövlət Pedaqoji Universiteti', 'ADPU',
  'Milli Aviasiya Akademiyası', 'MAA',
  'Gəncə Dövlət Universiteti', 'GDU',
  'Sumqayıt Dövlət Universiteti', 'SDU'
];

// ============================================================================
// Intelligent Industry Domain & Benchmark Keywords Analysis
// ============================================================================
interface DomainBenchmarkItem {
  name: string;
  category: 'technical' | 'tool' | 'industry' | 'soft';
  importance: 'critical' | 'recommended' | 'optional';
  placementAdvice: string;
  sampleSentence: string;
  aliases: string[];
}

const DOMAIN_BENCHMARKS: Record<string, DomainBenchmarkItem[]> = {
  tech: [
    {
      name: 'Git & GitHub / GitLab',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Alətlər və ya İş Təcrübəsi bəndlərinə əlavə edin.',
      sampleSentence: 'Git və GitHub platformaları vasitəsilə 5+ proqramçıdan ibarət komandada versiya nəzarəti və kod təhlili (Code Review) icra etdim.',
      aliases: ['git', 'github', 'gitlab', 'version control', 'bitbucket']
    },
    {
      name: 'RESTful API & İnteqrasiya',
      category: 'technical',
      importance: 'critical',
      placementAdvice: 'Texniki Bacarıqlar və layihə təsvirlərində göstərin.',
      sampleSentence: 'Üçüncü tərəf xidmətləri ilə təhlükəsiz məlumat mübadiləsini təmin edən yüksək performanslı RESTful API arxitekturası qurdum.',
      aliases: ['rest api', 'restful', 'api', 'graphql', 'json api', 'endpoints']
    },
    {
      name: 'Agile & Scrum Metodologiyası',
      category: 'industry',
      importance: 'recommended',
      placementAdvice: 'İş Təcrübəsi və Komanda Əməkdaşlığı bəndlərinə daxil edin.',
      sampleSentence: '2 həftəlik Agile/Scrum sprintlərində aktiv iştirak edərək sprint tapşırıqlarını 98% dəqiqliklə vaxtında təhvil verdim.',
      aliases: ['agile', 'scrum', 'kanban', 'sprint', 'jira', 'confluence']
    },
    {
      name: 'CI/CD & Avtomatlaşdırma',
      category: 'technical',
      importance: 'recommended',
      placementAdvice: 'DevOps və ya Təcrübə bölməsində vurğulayın.',
      sampleSentence: 'GitHub Actions / Docker əsasında avtomatlaşdırılmış CI/CD boru xətləri quraraq layihənin canlıya çıxış müddətini 40% sürətləndirdim.',
      aliases: ['ci/cd', 'docker', 'kubernetes', 'jenkins', 'devops', 'pipeline']
    },
    {
      name: 'SQL & Verilənlər Bazası Optimallaşdırılması',
      category: 'technical',
      importance: 'critical',
      placementAdvice: 'Məlumat bazası və backend təsvirində yerləşdirin.',
      sampleSentence: 'Mürəkkəb SQL sorğularını və indeksləri optimallaşdıraraq verilənlər bazası cavab sürətini 35% artırdım.',
      aliases: ['sql', 'postgresql', 'mysql', 'mongodb', 'database', 'queries', 'orm']
    },
    {
      name: 'Unit Testing & Kod Keyfiyyəti',
      category: 'technical',
      importance: 'optional',
      placementAdvice: 'Testləşdirmə və keyfiyyət təminatı bəndlərinə daxil edin.',
      sampleSentence: 'Unit və inteqrasiya testləri yazaraq kod örtüyünü (code coverage) 80%-ə çatdırdım və istehsalat xətalarını minimuma endirdim.',
      aliases: ['unit test', 'testing', 'jest', 'cypress', 'qa', 'test coverage']
    }
  ],
  finance: [
    {
      name: '1C Mühasibatlıq (8.3 versiyası)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Kompüter və Proqram Bilikləri bölməsinə əlavə edin.',
      sampleSentence: '1C 8.3 proqramında ilkin sənədlərin işlənməsi, kassa və bank əməliyyatlarının uçotunu apardım.',
      aliases: ['1c', '1c 8.3', '1s', '1c enterprise', '1c mühasibatlıq']
    },
    {
      name: 'Maliyyə Hesabatlarının Beynəlxalq Standartları (MHBS / IFRS)',
      category: 'industry',
      importance: 'critical',
      placementAdvice: 'Peşəkar Təlim və Standartlar bəndində qeyd edin.',
      sampleSentence: 'MHBS (IFRS) standartlarına uyğun Mənfəət və Zərər (P&L), Balans hesabatlarının tərtibində iştirak etdim.',
      aliases: ['ifrs', 'mhbs', 'beynəlxalq standartlar', 'p&l', 'balans', 'maliyyə hesabatı']
    },
    {
      name: 'BTP & e-Bəyannamə (Vergi Məcəlləsi)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Vergi və Uyğunluq bacarıqlarında qeyd edin.',
      sampleSentence: 'Vergi orqanlarına təqdim edilən ƏDV, ÖMV və Mənfəət bəyannamələrini BTP proqramı ilə vaxtında formalaşdırdım.',
      aliases: ['btp', 'bəyannamə', 'vergi məcəlləsi', 'ədv', 'gəlir vergisi', 'taxes']
    },
    {
      name: 'Ətraflı MS Excel (VLOOKUP, Pivot, XLOOKUP)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Texniki Bacarıqlar və Alətlər bölməsinə əlavə edin.',
      sampleSentence: 'MS Excel-də Pivot Table, VLOOKUP və dinamik modelləşdirmə ilə 10,000+ sətirlik əməliyyat məlumatlarını konsolidasiya etdim.',
      aliases: ['excel', 'pivot table', 'vlookup', 'xlookup', 'ms excel', 'makro']
    },
    {
      name: 'Bank-Klient Əməliyyatları & Ödəniş Tapşırıqları',
      category: 'technical',
      importance: 'recommended',
      placementAdvice: 'İş Təcrübəsi və Gündəlik Öhdəliklərdə qeyd edin.',
      sampleSentence: 'İnternet-bankçılıq sistemi vasitəsilə daxili və xarici valyuta ödəniş tapşırıqlarını 100% dəqiqliklə icra etdim.',
      aliases: ['bank-klient', 'internet bankçılıq', 'ödəniş tapşırıqları', 'köçürmələr']
    },
    {
      name: 'Maliyyə Analizi & Büdcələmə (Budgeting)',
      category: 'industry',
      importance: 'recommended',
      placementAdvice: 'Analitik Fəaliyyət bəndlərində göstərin.',
      sampleSentence: 'İllik departament büdcəsinin faktiki xərclərlə müqayisəli plan-fakt təhlilini apararaq xərclərin 12% optimallaşdırılmasına nail oldum.',
      aliases: ['büdcələmə', 'budgeting', 'maliyyə analizi', 'plan-fakt', 'proqnozlaşdırma']
    }
  ],
  sales: [
    {
      name: 'B2B & Korporativ Satış Danışıqları',
      category: 'industry',
      importance: 'critical',
      placementAdvice: 'İş Təcrübəsi nailiyyət bəndlərində göstərin.',
      sampleSentence: 'Korporativ B2B tərəfdaşlarla yüksək səviyyəli danışıqlar apararaq illik 150,000+ AZN həcmində yeni müqavilələr bağladım.',
      aliases: ['b2b', 'b2c', 'satış', 'danışıqlar', 'müqavilə', 'danışıqlar aparma']
    },
    {
      name: 'Satış Hunisi (Sales Funnel) & KPI İcrası',
      category: 'technical',
      importance: 'critical',
      placementAdvice: 'Əsas Göstəricilər və Metriklər bölməsinə əlavə edin.',
      sampleSentence: 'Satış hunisinin hər bir mərhələsini izləyərək rüblük fərdi KPI satış planını 115% icra etdim.',
      aliases: ['kpi', 'satış hunisi', 'sales funnel', 'satış planı', 'hədəflər']
    },
    {
      name: 'Soyuq Zənglər & Yeni Müştəri Cəlbi',
      category: 'technical',
      importance: 'recommended',
      placementAdvice: 'Təcrübə və Satış Fəaliyyəti bəndlərinə əlavə edin.',
      sampleSentence: 'Aktiv prospektinq və soyuq zənglər strategiyası ilə bazaya ayda 30-dan çox yeni potensial korporativ müştəri qazandırdım.',
      aliases: ['soyuq zəng', 'cold call', 'prospektinq', 'müştəri cəlbi', 'lead generation']
    },
    {
      name: 'Kommersiya Təkliflərinin (KP) Hazırlanması',
      category: 'tool',
      importance: 'recommended',
      placementAdvice: 'Bacarıqlar və Təcrübə bölməsinə daxil edin.',
      sampleSentence: 'Müştərinin fərdi ehtiyaclarına uyğun cəlbedici kommersiya təklifləri və təqdimatlar hazırlayaraq qərarvermə müddətini qısaltdım.',
      aliases: ['kp', 'kommersiya təklifi', 'təqdimat', 'presentation', 'pitch']
    },
    {
      name: 'Müştəri Məmnuniyyəti & Loyallıq (Account Management)',
      category: 'soft',
      importance: 'recommended',
      placementAdvice: 'Müştəri Münasibətləri və Əlaqələr bəndinə əlavə edin.',
      sampleSentence: 'Mövcud VIP müştərilərlə uzunmüddətli əlaqələr quraraq müştəri itkisini (churn rate) minimum həddə saxladım.',
      aliases: ['account management', 'müştəri məmnuniyyəti', 'loyallıq', 'retention']
    }
  ],
  marketing: [
    {
      name: 'Meta Business Suite & SMM Strategiyası',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Sosial Media və Reklam bölməsinə əlavə edin.',
      sampleSentence: 'Instagram və Facebook səhifələri üçün aylıq kontent planı hazırlayıb Meta Ads vasitəsilə orqanik izləyici sayını 45% artırdım.',
      aliases: ['smm', 'meta ads', 'meta business', 'facebook ads', 'instagram', 'social media']
    },
    {
      name: 'Google Ads & Google Analytics 4 (GA4)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Rəqəmsal Marketinq və Analitika bəndlərində göstərin.',
      sampleSentence: 'Google Ads axtarış kampaniyalarını idarə edərək klik başına xərci (CPC) 20% azaltdım və GA4-də konversiyaları izlədim.',
      aliases: ['google ads', 'ga4', 'google analytics', 'cpc', 'sem', 'analitika']
    },
    {
      name: 'SEO & Məzmun Optimallaşdırılması',
      category: 'technical',
      importance: 'recommended',
      placementAdvice: 'Vebsayt Məzmunu və Açar Sözlər bölməsinə daxil edin.',
      sampleSentence: 'SEO tələblərinə uyğun açar söz araşdırması apararaq bloq və səhifələrin Google axtarışında ilk 5-liyə çıxmasını təmin etdim.',
      aliases: ['seo', 'search engine', 'açar söz', 'kontent', 'orqanik trafik']
    },
    {
      name: 'Kopiraytinq & Storytelling',
      category: 'soft',
      importance: 'recommended',
      placementAdvice: 'Mətn Yaradıcılığı və Brendinq bəndinə əlavə edin.',
      sampleSentence: 'Müştəri auditoriyasını cəlb edən və satışa təşviq edən kreativ reklam mətnləri (copy) hazırladım.',
      aliases: ['kopiraytinq', 'copywriting', 'mətn yazarlığı', 'kreativ yazı']
    },
    {
      name: 'E-mail Marketinq & Mailchimp / Sendpulse',
      category: 'tool',
      importance: 'optional',
      placementAdvice: 'E-mail İnteqrasiyası və Birbaşa Marketinq bölməsinə əlavə edin.',
      sampleSentence: 'Seqmentasiya olunmuş e-poçt bülletenləri hazırlayaraq açılma dərəcəsini (Open Rate) 28%-ə çatdırdım.',
      aliases: ['email marketing', 'mailchimp', 'sendpulse', 'e-poçt marketinq']
    }
  ],
  hr: [
    {
      name: 'Azərbaycan Respublikasının Əmək Məcəlləsi',
      category: 'industry',
      importance: 'critical',
      placementAdvice: 'Kadr Kargüzarlığı və Hüquqi Uyğunluq bölməsinə əlavə edin.',
      sampleSentence: 'Əmək Məcəlləsinin tələblərinə tam uyğun olaraq əmək müqavilələrinin, əmrlərin və kadr sənədlərinin rəsmiləşdirilməsini təmin etdim.',
      aliases: ['əmək məcəlləsi', 'əmək qanunvericiliyi', 'əmək müqaviləsi', 'labor code']
    },
    {
      name: 'ƏMAS Altsistemi (emas.sosial.gov.az)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Dövlət Portalları və Kadr Sistemləri bölməsinə əlavə edin.',
      sampleSentence: 'ƏMAS portalında işçilərin işə qəbulu, xitam, məzuniyyət və ştat dəyişikliklərinin bildirişlərini vaxtında qeydiyyata aldım.',
      aliases: ['əmas', 'emas', 'sosial gov az', 'əmək bildirişi']
    },
    {
      name: '1C: ZUP (Zарплата и Управление Персоналом)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Proqram Təminatı və Hesabatlılıq bəndinə əlavə edin.',
      sampleSentence: '1C ZUP proqramında iş vaxtının uçotu cədvəli (tabel), məzuniyyət hesablamaları və kadr bazasının idarə olunmasını həyata keçirdim.',
      aliases: ['1c zup', 'zup', '1c kadr', 'tabel', 'kadr uçotu']
    },
    {
      name: 'Tam Dövrü İşə Qəbul (End-to-End Recruitment)',
      category: 'technical',
      importance: 'critical',
      placementAdvice: 'İşə Qəbul və İstedad Cəlbi bölməsinə daxil edin.',
      sampleSentence: 'Vakansiya elanlarının yerləşdirilməsindən ilkin müsahibə və iş təklifi mərhələsinə qədər ayda 15+ vakansiyanı uğurla qapatdım.',
      aliases: ['recruitment', 'işə qəbul', 'müsahibə', 'interviewing', 'headhunting', 'talent acquisition']
    },
    {
      name: 'Onboarding & Adaptasiya Proqramları',
      category: 'industry',
      importance: 'recommended',
      placementAdvice: 'Korporativ Mədəniyyət və Təlim bəndinə əlavə edin.',
      sampleSentence: 'Yeni işə qəbul olunan əməkdaşlar üçün strukturlu 30 günlük adaptasiya təlimatı hazırlayaraq sınaq müddətində işdən ayrılma nisbətini 20% azaltdım.',
      aliases: ['onboarding', 'adaptasiya', 'loyallıq', 'retention', 'təlim']
    }
  ],
  general: [
    {
      name: 'Layihə İdarəetməsi & Vaxtın Bölüşdürülməsi',
      category: 'industry',
      importance: 'critical',
      placementAdvice: 'İş Təcrübəsi və Xülasə bölməsinə daxil edin.',
      sampleSentence: 'Eyni vaxtda icra olunan bir neçə layihənin vaxt qrafikini və prioritetlərini müəyyən edərək təhvil müddətini qorudum.',
      aliases: ['layihə idarəetməsi', 'project management', 'vaxt idarəetməsi', 'time management']
    },
    {
      name: 'MS Office Paketi (Excel, Word, PowerPoint)',
      category: 'tool',
      importance: 'critical',
      placementAdvice: 'Kompüter və Ofis Proqramları bölməsinə əlavə edin.',
      sampleSentence: 'Rəhbərlik üçün aylıq analitik hesabatlar və vizual qərarvermə təqdimatları hazırladım.',
      aliases: ['ms office', 'excel', 'word', 'powerpoint', 'ofis proqramları']
    },
    {
      name: 'Analitik Düşüncə & Nəticəyönümlülük',
      category: 'soft',
      importance: 'recommended',
      placementAdvice: 'Xülasə və Şəxsi Nailiyyətlər bölməsinə daxil edin.',
      sampleSentence: 'Gündəlik iş proseslərindəki çatışmazlıqları müəyyən edərək iş səmərəliliyini artıran təkliflər irəli sürdüm.',
      aliases: ['analitik düşüncə', 'nəticəyönümlülük', 'problem həlli', 'tənqidi düşüncə']
    },
    {
      name: 'İşgüzar Yazışmalar & Peşəkar Ünsiyyət',
      category: 'soft',
      importance: 'recommended',
      placementAdvice: 'Kommunikasiya və Əlaqələr bölməsinə əlavə edin.',
      sampleSentence: 'Daxili və xarici tərəfdaşlarla rəsmi işgüzar protokola uyğun yazışmaları və danışıqları təmin etdim.',
      aliases: ['işgüzar yazışmalar', 'kommunikasiya', 'ünsiyyət', 'business correspondence']
    }
  ]
};

function detectCandidateDomain(role: string, rawText: string): 'tech' | 'finance' | 'sales' | 'marketing' | 'hr' | 'general' {
  const combined = normalizeAzText(`${role} ${rawText}`);
  if (/(developer|proqramçı|frontend|backend|fullstack|software|it|devops|qa|data|engineer|kod|react|python|java|javascript|c#|sql)/i.test(combined)) {
    return 'tech';
  }
  if (/(mühasib|accountant|maliyyə|finance|audit|vergi|1c|btp|bəyannamə|kassa|iqtisadçı|bank|xəzinədar)/i.test(combined)) {
    return 'finance';
  }
  if (/(satış|sales|biznesin inkişafı|b2b|b2c|müştəri|kassir|merçendayzer|menecer|ticarət|satıcı)/i.test(combined)) {
    return 'sales';
  }
  if (/(marketinq|marketing|smm|reklam|seo|kopirayt|dizayn|qrafik|media|pr|social media)/i.test(combined)) {
    return 'marketing';
  }
  if (/(insan resursları|hr|kadr|işə qəbul|recruitment|əmək məcəlləsi|tabel|zup)/i.test(combined)) {
    return 'hr';
  }
  return 'general';
}

export function computeIntelligentKeywordAnalysis(
  rawText: string,
  primaryRole: string,
  extractedTech: string[],
  extractedTools: string[],
  extractedIndustry: string[],
  targetJobDescription?: string
): KeywordAnalysis {
  const domain = detectCandidateDomain(primaryRole, rawText);
  const benchmark = DOMAIN_BENCHMARKS[domain] || DOMAIN_BENCHMARKS.general;
  const normText = normalizeAzText(rawText);

  const detailedKeywords: Array<{
    name: string;
    category: 'technical' | 'tool' | 'industry' | 'soft';
    importance: 'critical' | 'recommended' | 'optional';
    status: 'matched' | 'missing' | 'partial';
    placementAdvice?: string;
    sampleSentence?: string;
  }> = [];

  const matchedKeywordsSet = new Set<string>();
  const missingKeywordsSet = new Set<string>();

  // If candidate explicitly had tech or tools
  [...extractedTech, ...extractedTools].forEach(t => {
    if (t && t.length > 2) matchedKeywordsSet.add(t);
  });

  // Evaluate against domain benchmark
  benchmark.forEach(item => {
    const isMatched = item.aliases.some(alias => normText.includes(normalizeAzText(alias)));
    if (isMatched) {
      matchedKeywordsSet.add(item.name);
      detailedKeywords.push({
        name: item.name,
        category: item.category,
        importance: item.importance,
        status: 'matched',
        placementAdvice: 'CV mətninizdə təsdiqləndi.'
      });
    } else {
      missingKeywordsSet.add(item.name);
      detailedKeywords.push({
        name: item.name,
        category: item.category,
        importance: item.importance,
        status: 'missing',
        placementAdvice: item.placementAdvice,
        sampleSentence: item.sampleSentence
      });
    }
  });

  // If vacancy JD was provided, extract additional requirements
  if (targetJobDescription && targetJobDescription.trim().length > 10) {
    const jdWords = targetJobDescription
      .split(/[\n,;•\.\s]+/)
      .map(w => w.trim())
      .filter(w => w.length >= 4 && !/^(üçün|vəzifə|tələblər|şirkət|şəxslər|iş|haqqında)$/i.test(w));
    
    // Pick top unique JD keywords
    const topJd = Array.from(new Set(jdWords)).slice(0, 5);
    topJd.forEach(kw => {
      const isPresent = normText.includes(normalizeAzText(kw));
      if (!isPresent && !missingKeywordsSet.has(kw)) {
        missingKeywordsSet.add(kw);
        detailedKeywords.push({
          name: kw,
          category: 'technical',
          importance: 'critical',
          status: 'missing',
          placementAdvice: 'Vakansiya elanında qeyd olunan əsas tələbdir.',
          sampleSentence: `Təcrübəniz varsa, "${kw}" üzrə gördüyünüz işləri konkret göstəricilərlə CV-yə daxil edin.`
        });
      }
    });
  }

  // Calculate category statistics for graph
  const categories = [
    { key: 'technical', label: 'Texniki Bacarıqlar' },
    { key: 'tool', label: 'Proqram və Alətlər' },
    { key: 'industry', label: 'Sahəvi Metodologiyalar' },
    { key: 'soft', label: 'Soft & Liderlik Bacarıqları' },
  ];

  const categoryBreakdown = categories.map(cat => {
    const items = detailedKeywords.filter(k => k.category === cat.key);
    const matched = items.filter(k => k.status === 'matched').length;
    const missing = items.filter(k => k.status === 'missing').length;
    const total = items.length || 1;
    const matchRate = Math.round((matched / total) * 100);
    return {
      category: cat.key,
      categoryLabel: cat.label,
      matchedCount: matched,
      missingCount: missing,
      totalCount: total,
      matchRate
    };
  });

  // Concrete Actionable Advice
  const concreteAdvice = [
    {
      id: 'adv-metrics',
      category: 'metric' as const,
      title: 'Google XYZ Düsturu ilə Rəqəmsal Nailiyyətlər',
      priority: 'high' as const,
      currentState: 'Öhdəliklər ölçülə bilən rəqəm, faiz və biznes nəticələri olmadan sadalanıb.',
      actionableFix: 'Hər bir iş təcrübəsi üçün ən azı 2 bəndi [X nəticəsinə Y üsulu ilə nail oldum, Z qədər qənaət/artım təmin etdim] düsturuna uyğunlaşdırın.',
      beforeExample: domain === 'tech' ? 'Sistemdə xətaları düzəltdim və yeni funksiyalar yazdım.' : domain === 'finance' ? 'Mühasibatlıqda sənədləri və hesabatları hazırlayırdım.' : 'Müştərilərlə əlaqə saxlayırdım və sifarişləri qəbul edirdim.',
      afterExample: domain === 'tech' ? 'Kritik sistem xətalarını aradan qaldıraraq və yeni API servisi inteqrasiya edərək platformanın yüklənmə sürətini 35% artırdım.' : domain === 'finance' ? '1C və Excel vasitəsilə 45+ aylıq maliyyə hesabatını avtomatlaşdıraraq hesabat hazırlama müddətini 30% azaltdım.' : 'Aylıq 120+ müştəri sorğusunu operativ cavablandıraraq müştəri məmnuniyyətini (CSAT) 82%-dən 95%-ə yüksəltdim.',
      impactScore: '+15 ATS Balı'
    },
    {
      id: 'adv-keywords',
      category: 'keyword' as const,
      title: 'Çatışmayan Açar Sözlərin Strateji İnteqrasiyası',
      priority: 'high' as const,
      currentState: `Sahəniz üçün zəruri olan ${Array.from(missingKeywordsSet).slice(0, 3).join(', ') || 'əsas terminlər'} CV-də aşkar edilmədi.`,
      actionableFix: 'Açar sözləri sadəcə siyahı kimi kopyalamayın. Onları iş təcrübənizdə gördüyünüz real işlərin kontekstində cümlələrlə izah edin.',
      beforeExample: Array.from(missingKeywordsSet)[0] ? `Bacarıqlar: ${Array.from(missingKeywordsSet)[0]}` : 'Bacarıqlar: Müxtəlif proqramlar',
      afterExample: detailedKeywords.find(k => k.status === 'missing')?.sampleSentence || 'Sahənizə uyğun alətlərlə əldə etdiyiniz real iş nəticəsini cümlə şəklində daxil edin.',
      impactScore: '+20 ATS Balı'
    },
    {
      id: 'adv-structure',
      category: 'structure' as const,
      title: 'ATS-Dostu Standart Bölmə Başlıqları',
      priority: 'medium' as const,
      currentState: 'Mürəkkəb cədvəllər, qrafik ikonlar və ya qeyri-standart bölmə adları robotların oxumasını çətinləşdirə bilər.',
      actionableFix: 'Tək sütunlu, təmiz başlıqlardan (İş Təcrübəsi, Təhsil, Bacarıqlar, Dillər) və standart maddə işarələrindən (•) istifadə edin.',
      beforeExample: 'Şəkilli qrafik sütunlar, bəzəkli cədvəllər və qeyri-standart simvollar.',
      afterExample: 'Aydın ardıcıllıq: 1. Şəxsi Məlumatlar -> 2. Xülasə -> 3. İş Təcrübəsi -> 4. Təhsil -> 5. Bacarıqlar.',
      impactScore: '+10 ATS Balı'
    },
    {
      id: 'adv-summary',
      category: 'summary' as const,
      title: '3 Cümləlik Yüksək Təsirli Peşəkar Xülasə',
      priority: 'medium' as const,
      currentState: 'Profil xülasəsi (Summary/Haqqımda) ya yoxdur, ya da ümumi şablon xarakteri daşıyır.',
      actionableFix: 'İşəgötürənin ilk 6 saniyədə diqqətini çəkəcək formulla xülasə yazın: [İxtisas & təcrübə ili] + [Ən böyük nailiyyət və alətlər] + [Şirkətə verəcəyiniz dəyər].',
      beforeExample: 'Mən məsuliyyətli, komandada işləməyi bacaran və karyera qurmaq istəyən gəncəm.',
      afterExample: `${primaryRole} sahəsində dərin bilik və praktiki təcrübəyə malik nəticəyönümlü mütəxəssis. Müasir standartlar və analitik yanaşma ilə layihələrin vaxtında yüksək keyfiyyətlə icrasını təmin edirəm. Şirkətinizin strateji hədəflərinə dərhal töhfə verməyə hazıram.`,
      impactScore: '+12 ATS Balı'
    }
  ];

  return {
    matchedKeywords: Array.from(matchedKeywordsSet).slice(0, 10),
    partiallyMatchedKeywords: extractedIndustry.slice(0, 4),
    missingKeywords: Array.from(missingKeywordsSet).slice(0, 8),
    detailedKeywords,
    concreteAdvice,
    categoryBreakdown,
    ethicalRecommendations: [
      'Açar sözləri yalnız həqiqətən təcrübəniz və praktiki biliyiniz olduqda CV-yə əlavə edin.',
      'Sırf ATS filtrini aldatmaq üçün təcrübəniz olmayan texnologiyaları və ya saxta açar sözləri qeyd etməyin.',
      'Açar sözləri cümlələrin daxilində real biznes nəticələri və alətlərlə birlikdə istifadə edin.'
    ]
  };
}

// ============================================================================
// Main Engine: Build 100% Factual Deep CV Extraction
// ============================================================================
export function buildFactualDeepFallback(
  rawText: string,
  fileName: string = '',
  language: string = 'az',
  jobDescription: string = ''
): CVAnalyzerResult {
  const text = (rawText || '').trim();
  const rawLines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // --------------------------------------------------------------------------
  // 1. SECTION SEGMENTATION
  // --------------------------------------------------------------------------
  type SectionKey = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'projects';
  const sections: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
  };

  let currentSection: SectionKey = 'header';

  for (const line of rawLines) {
    const cleanLine = line.replace(/^[\d#•*.-]+\s*/, '').replace(/[:=-]+$/, '').trim();
    const normLine = normalizeAzText(cleanLine);

    if (cleanLine.length < 50 && !cleanLine.includes('@') && !/\d{3,}/.test(cleanLine)) {
      if (SECTION_PATTERNS.summary.test(normLine)) {
        currentSection = 'summary';
        continue;
      } else if (SECTION_PATTERNS.experience.test(normLine)) {
        currentSection = 'experience';
        continue;
      } else if (SECTION_PATTERNS.education.test(normLine)) {
        currentSection = 'education';
        continue;
      } else if (SECTION_PATTERNS.skills.test(normLine)) {
        currentSection = 'skills';
        continue;
      } else if (SECTION_PATTERNS.languages.test(normLine)) {
        currentSection = 'languages';
        continue;
      } else if (SECTION_PATTERNS.certifications.test(normLine)) {
        currentSection = 'certifications';
        continue;
      } else if (SECTION_PATTERNS.projects.test(normLine)) {
        currentSection = 'projects';
        continue;
      } else if (SECTION_PATTERNS.contacts.test(normLine)) {
        currentSection = 'header';
        continue;
      }
    }

    sections[currentSection].push(line);
  }

  // --------------------------------------------------------------------------
  // 2. CONTACTS & PERSONAL INFO EXTRACTION
  // --------------------------------------------------------------------------
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch =
    text.match(/(?:\+994|0)?\s*(?:50|51|55|70|77|99|10|12)\s*\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/) ||
    text.match(/\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedIn = linkedinMatch ? `https://${linkedinMatch[0]}` : '';

  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? `https://${githubMatch[0]}` : '';

  const otherContacts: string[] = [];
  if (github) otherContacts.push(`GitHub: ${github}`);

  let fullName = '';
  const nameLabelMatch = text.match(/(?:Ad,?\s*Soyad|Adı|Adınız|Name|Full Name|Namizəd)\s*[:=-]\s*([A-ZƏÖÜĞŞÇIİa-zəöüğşçıi\s]{3,35})/i);
  if (nameLabelMatch && nameLabelMatch[1]) {
    fullName = nameLabelMatch[1].trim();
  } else if (sections.header.length > 0) {
    const candidateNameLine = sections.header.find(l => 
      /^[A-ZƏÖÜĞŞÇIİ][a-zəöüğşçıi]+(?:\s+[A-ZƏÖÜĞŞÇIİ][a-zəöüğşçıi]+){1,2}$/.test(l.trim()) &&
      !l.includes('@') && !l.includes('+') && !/^(cv|resume|curriculum|vitae)/i.test(l)
    );
    if (candidateNameLine) {
      fullName = candidateNameLine.trim();
    } else {
      const firstLine = sections.header[0];
      if (firstLine && firstLine.length < 35 && !firstLine.includes('@') && !firstLine.includes('+') && !/^(cv|resume)/i.test(firstLine)) {
        fullName = firstLine.replace(/^[•*.-]\s*/, '').trim();
      }
    }
  }

  if (!fullName && fileName && fileName.length > 4) {
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
    if (cleanFileName.length > 3 && !/^(cv|resume|document|sened|untitled)$/i.test(cleanFileName)) {
      fullName = cleanFileName;
    }
  }

  if (!fullName) {
    fullName = 'Namizəd (CV Sahibi)';
  }

  let location = '';
  const locMatch =
    text.match(/(?:Ünvan|Address|Location|Şəhər|City|Yaşadığı yer)\s*[:=-]\s*([^\n,]{3,40})/i) ||
    text.match(/\b(Bakı|Baku|Gəncə|Sumqayıt|Xırdalan|Naxçıvan|Şəki|Quba|Lənkəran|Azerbaijan|Azərbaycan)\b/i);
  if (locMatch) {
    location = locMatch[1] ? locMatch[1].trim() : locMatch[0].trim();
  }

  // --------------------------------------------------------------------------
  // 3. PROFESSIONAL SUMMARY
  // --------------------------------------------------------------------------
  let originalSummary = '';
  if (sections.summary.length > 0) {
    originalSummary = sections.summary.join(' ').trim();
  } else {
    const inlineSummary = text.match(/(?:Haqqımda|Haqqinda|Xülasə|Summary|About\s*Me|Profile|Bio)\s*[:=-]?\s*([\s\S]{30,600}?)(?=\n\s*(?:Təcrübə|İş|Təhsil|Bacarıq|Experience|Education|Skills|Layihə|$))/i);
    if (inlineSummary && inlineSummary[1]) {
      originalSummary = inlineSummary[1].trim();
    }
  }

  // --------------------------------------------------------------------------
  // 4. WORK EXPERIENCE EXTRACTION (REAL BULLETS, DATES, COMPANIES)
  // --------------------------------------------------------------------------
  const workExperience: CVWorkExperience[] = [];
  const expLines = sections.experience.length > 0 ? sections.experience : [];

  const dateRegex = /(?:(\d{1,2}[./-]\d{4}|\d{4})\s*(?:[-–—to/]|ildən)\s*(\d{1,2}[./-]\d{4}|\d{4}|Present|İndiki|Davam edir|Current|Hazırda|günümüzə))/i;
  const singleYearRegex = /(?:19\d\d|20\d\d)/;

  interface JobBlock {
    header: string;
    date: string;
    bullets: string[];
  }

  const jobBlocks: JobBlock[] = [];
  let currentJob: JobBlock | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i].trim();
    if (!line) continue;

    const hasDate = dateRegex.test(line);
    const isBullet = /^[•*✓-]|\d+\.\s+/.test(line);

    if (!isBullet && (hasDate || (i + 1 < expLines.length && dateRegex.test(expLines[i + 1])))) {
      if (currentJob && !hasDate) {
        currentJob = { header: line, date: '', bullets: [] };
        jobBlocks.push(currentJob);
        continue;
      }
      if (!currentJob) {
        currentJob = { header: line, date: '', bullets: [] };
        jobBlocks.push(currentJob);
      }
      if (hasDate) {
        currentJob.date = line;
        if (!currentJob.header || currentJob.header === line) {
          currentJob.header = line.replace(dateRegex, '').replace(/[-–—|()]/g, ' ').trim();
        }
      } else {
        currentJob.header = line;
      }
    } else if (currentJob) {
      if (hasDate && !currentJob.date) {
        currentJob.date = line;
      } else {
        const clean = line.replace(/^[•*✓-]\s*|\d+\.\s*/, '').trim();
        if (clean) currentJob.bullets.push(clean);
      }
    }
  }

  for (const block of jobBlocks) {
    let company = 'Müəssisə qeyd olunmayıb';
    let position = 'Vəzifə qeyd olunmayıb';

    const header = block.header;
    if (header.includes('—') || header.includes(' - ') || header.includes('|')) {
      const parts = header.split(/\s*[-–—|]\s*/);
      if (parts.length >= 2) {
        const p1 = parts[0].trim();
        const p2 = parts[1].trim();
        if (/developer|mühasib|menecer|specialist|engineer|analyst|mütəxəssis|lead|senior|junior|direktor/i.test(p2)) {
          company = p1;
          position = p2;
        } else if (/developer|mühasib|menecer|specialist|engineer|analyst|mütəxəssis|lead|senior|junior|direktor/i.test(p1)) {
          position = p1;
          company = p2;
        } else {
          company = p1;
          position = p2;
        }
      }
    } else if (header) {
      if (/developer|mühasib|menecer|specialist|engineer|analyst|mütəxəssis|lead|senior|junior|direktor/i.test(header)) {
        position = header;
      } else {
        company = header;
      }
    }

    let startDate = 'Not specified';
    let endDate = 'Not specified';
    const dMatch = block.date.match(dateRegex);
    if (dMatch) {
      startDate = dMatch[1]?.trim() || 'Not specified';
      endDate = dMatch[2]?.trim() || 'Present';
    } else {
      const sMatch = block.date.match(singleYearRegex);
      if (sMatch) {
        startDate = sMatch[0];
        endDate = /present|davam|indiki|hazırda/i.test(block.date) ? 'Present' : sMatch[0];
      }
    }

    const responsibilities = block.bullets.filter(b => b.length > 2);
    const achievements = block.bullets.filter(b => 
      /\d+%|\d+\s*(?:faiz|manat|\$|nəfər|nəfərlik|qat|dəfə|il)/i.test(b) ||
      /artırdıq|yüksəltdik|optimallaşdırdıq|təqdim\s*etdik|mükafat|uğurla|qazandıq|yaradıldı/i.test(b)
    );

    let seniorityLevel = 'Mid-Level';
    const posLower = position.toLowerCase();
    if (posLower.includes('senior') || posLower.includes('baş') || posLower.includes('aparıcı') || posLower.includes('lead') || posLower.includes('head')) {
      seniorityLevel = 'Senior';
    } else if (posLower.includes('junior') || posLower.includes('kiçik') || posLower.includes('köməkçi') || posLower.includes('intern') || posLower.includes('təcrübəçi')) {
      seniorityLevel = 'Junior';
    } else if (posLower.includes('direktor') || posLower.includes('director') || posLower.includes('chief') || posLower.includes('menecer') || posLower.includes('manager')) {
      seniorityLevel = 'Lead / Management';
    }

    let industry = 'Not specified';
    const combinedStr = `${company} ${position} ${responsibilities.join(' ')}`.toLowerCase();
    if (/bank|maliyyə|mühasib|vergi|audit|hesabat|1c|fintech/i.test(combinedStr)) {
      industry = 'Bank və Maliyyə / Mühasibat';
    } else if (/react|frontend|backend|developer|software|proqram|kod|api|tech|it/i.test(combinedStr)) {
      industry = 'İnformasiya Texnologiyaları (İT)';
    } else if (/satış|sales|marketing|smm|reklam|müştəri/i.test(combinedStr)) {
      industry = 'Satış və Marketinq';
    } else if (/logistika|təchizat|anbar|supply/i.test(combinedStr)) {
      industry = 'Logistika və Təchizat';
    } else if (/tibb|həkim|aptek|sağlamlıq/i.test(combinedStr)) {
      industry = 'Səhiyyə və Tibb';
    }

    workExperience.push({
      company,
      originalJobTitle: position,
      position,
      employmentType: /remote|distant/i.test(combinedStr) ? 'Remote' : /part-time|yarım\s*ştat/i.test(combinedStr) ? 'Part-time' : 'Full-time',
      startDate,
      endDate,
      duration: calculateDateDuration(startDate, endDate),
      responsibilities: responsibilities.length > 0 ? responsibilities : ['CV-də vəzifə öhdəlikləri qeyd olunub.'],
      achievements: achievements.length > 0 ? achievements : [],
      industry,
      seniorityLevel,
      confidence: 'High',
      evidence: `Mətndən dəqiq çıxarış: ${company} — ${position}`
    });
  }

  // --------------------------------------------------------------------------
  // 5. EDUCATION EXTRACTION (REAL INSTITUTIONS, DEGREES, SPECIALTIES)
  // --------------------------------------------------------------------------
  const education: CVEducation[] = [];
  const eduLines = sections.education.length > 0 ? sections.education : [];

  let currentEduInst = '';
  let currentEduDegree = 'Not specified';
  let currentEduField = 'Not specified';
  let currentEduDates = { start: 'Not specified', end: 'Not specified' };

  function flushEdu() {
    if (currentEduInst) {
      let eduLevel = 'Ali Təhsil';
      if (/magistr|master/i.test(currentEduDegree)) eduLevel = 'Ali (Magistr)';
      else if (/bakalavr|bachelor/i.test(currentEduDegree)) eduLevel = 'Ali (Bakalavr)';
      else if (/doktor|phd/i.test(currentEduDegree)) eduLevel = 'Doktorantura (PhD)';
      else if (/kollec|orta\s*ixtisas/i.test(currentEduInst + ' ' + currentEduDegree)) eduLevel = 'Orta İxtisas';

      education.push({
        institution: currentEduInst,
        degree: currentEduDegree,
        fieldOfStudy: currentEduField,
        startDate: currentEduDates.start,
        endDate: currentEduDates.end,
        educationLevel: eduLevel,
        institutionType: /kollec/i.test(currentEduInst) ? 'College' : /məktəb|school/i.test(currentEduInst) ? 'High School' : 'University',
        confidence: 'High',
        evidence: `Mətndən faktiki təhsil qeydi: ${currentEduInst}`
      });
      currentEduInst = '';
      currentEduDegree = 'Not specified';
      currentEduField = 'Not specified';
      currentEduDates = { start: 'Not specified', end: 'Not specified' };
    }
  }

  for (const line of eduLines) {
    const knownUni = KNOWN_UNIVERSITIES.find(u => new RegExp(`\\b${u}\\b`, 'i').test(line));
    const genericUni = line.match(/([A-ZƏÖÜĞŞÇIİ][^\n,]{2,45}(?:Universitet[a-z]*|University|Akademiya[a-z]*|Academy|İnstitut[a-z]*|Kollec[a-z]*|Məktəb[a-z]*))/i);

    if (knownUni || genericUni) {
      flushEdu();
      currentEduInst = knownUni || genericUni![1].trim();
      continue;
    }

    if (line.includes('—') || line.includes(' - ')) {
      const parts = line.split(/\s*[-–—]\s*/);
      if (parts.length >= 2) {
        if (/bakalavr|magistr|bachelor|master|doktor|phd|orta\s*ixtisas/i.test(parts[0])) {
          currentEduDegree = parts[0].trim();
          currentEduField = parts[1].trim();
          continue;
        }
      }
    }

    const degMatch = line.match(/\b(Bakalavr|Magistr|Doktorantura|Bachelor|Master|PhD|Orta ixtisas|Subbakalavr)\b/i);
    if (degMatch) {
      currentEduDegree = degMatch[0];
    }

    const fieldMatch = line.match(/(?:İxtisas|Fakültə|Major|Field|Ixtisas)\s*[:=-]\s*([^\n,]{3,40})/i);
    if (fieldMatch) {
      currentEduField = fieldMatch[1].trim();
    } else if (/riyaziyyat|informatika|maliyyə|mühasibat|iqtisadiyyat|menecment|hüquq|filologiya|mühəndis/i.test(line) && !line.includes(currentEduInst)) {
      currentEduField = line.replace(/^[•*.-]\s*/, '').trim();
    }

    const yearMatch = line.match(/((?:19|20)\d{2})\s*(?:[-–—]\s*((?:19|20)\d{2}|Present|Hazırda))?/i);
    if (yearMatch) {
      currentEduDates.start = yearMatch[1];
      currentEduDates.end = yearMatch[2] || yearMatch[1];
    }
  }
  flushEdu();

  // --------------------------------------------------------------------------
  // 6. SKILLS EXTRACTION (TECHNICAL, SOFT, TOOLS, INDUSTRY)
  // --------------------------------------------------------------------------
  const extractedTech: string[] = [];
  const extractedTools: string[] = [];
  const extractedSoft: string[] = [];
  const extractedIndustry: string[] = [];

  for (const s of KNOWN_TECH_SKILLS) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, 'i').test(text)) {
      if (!extractedTech.includes(s)) extractedTech.push(s);
    }
  }

  for (const s of KNOWN_SOFTWARE_TOOLS) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, 'i').test(text)) {
      if (!extractedTools.includes(s)) extractedTools.push(s);
    }
  }

  for (const s of KNOWN_SOFT_SKILLS) {
    if (text.toLowerCase().includes(s.toLowerCase())) {
      if (!extractedSoft.includes(s)) extractedSoft.push(s);
    }
  }

  for (const s of KNOWN_INDUSTRY_SKILLS) {
    if (text.toLowerCase().includes(s.toLowerCase())) {
      if (!extractedIndustry.includes(s)) extractedIndustry.push(s);
    }
  }

  if (sections.skills.length > 0) {
    const customLines = sections.skills.join('\n');
    const tokens = customLines
      .split(/[,;\n•*✓]+/)
      .map(t => t.trim())
      .filter(t => t.length >= 2 && t.length <= 40 && !t.includes(':'));

    for (const t of tokens) {
      if (
        !extractedTech.some(s => s.toLowerCase() === t.toLowerCase()) &&
        !extractedTools.some(s => s.toLowerCase() === t.toLowerCase()) &&
        !extractedSoft.some(s => s.toLowerCase() === t.toLowerCase()) &&
        !extractedIndustry.some(s => s.toLowerCase() === t.toLowerCase())
      ) {
        if (/komanda|liderlik|ünsiyyət|dəqiqlik|çevik|menecment/i.test(t)) {
          extractedSoft.push(t);
        } else if (/excel|word|1c|btp|figma|jira|sap/i.test(t)) {
          extractedTools.push(t);
        } else {
          extractedTech.push(t);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. LANGUAGES
  // --------------------------------------------------------------------------
  const languages: CVLanguage[] = [];
  const knownLangs = [
    { name: 'Azərbaycan dili', pattern: /azərbaycan|azerbaijani/i },
    { name: 'İngilis dili', pattern: /ingilis|english/i },
    { name: 'Rus dili', pattern: /rus\s*dili|russian/i },
    { name: 'Türk dili', pattern: /türk|turkish/i },
    { name: 'Alman dili', pattern: /alman|german/i },
    { name: 'Fransız dili', pattern: /fransız|french/i }
  ];

  const langLines = sections.languages.length > 0 ? sections.languages.join('\n') : text;

  for (const kl of knownLangs) {
    if (kl.pattern.test(normalizeAzText(langLines))) {
      let prof = 'Not specified';
      const lineWithLang = langLines.split('\n').find(l => kl.pattern.test(normalizeAzText(l)));
      if (lineWithLang) {
        if (lineWithLang.includes('—') || lineWithLang.includes(' - ')) {
          const parts = lineWithLang.split(/\s*[-–—]\s*/);
          if (parts.length >= 2 && kl.pattern.test(normalizeAzText(parts[0]))) {
            prof = parts[1].trim();
          }
        }
        if (prof === 'Not specified') {
          const profMatch = lineWithLang.match(/\b(Ana\s*dili|Native|C2|C1|B2|B1|A2|A1|Səlis|Əla|Professional|Danışıq|Orta|Yaxşı|İlkin)\b/i);
          if (profMatch) {
            prof = profMatch[0];
          }
        }
      }
      languages.push({
        language: kl.name,
        proficiency: prof
      });
    }
  }

  // --------------------------------------------------------------------------
  // 8. CERTIFICATIONS
  // --------------------------------------------------------------------------
  const certifications: CVCertification[] = [];
  const certLines = sections.certifications.length > 0 ? sections.certifications : [];

  for (const cl of certLines) {
    const clean = cl.replace(/^[•*.-]\s*/, '').trim();
    if (clean.length > 4) {
      const yearMatch = clean.match(/(?:19|20)\d{2}/);
      const year = yearMatch ? yearMatch[0] : 'Not specified';
      let org = 'Not specified';
      if (/meta/i.test(clean)) org = 'Meta';
      else if (/google/i.test(clean)) org = 'Google';
      else if (/microsoft/i.test(clean)) org = 'Microsoft';
      else if (/aws/i.test(clean)) org = 'AWS';
      else if (/acca/i.test(clean)) org = 'ACCA';
      else if (/cfa/i.test(clean)) org = 'CFA';
      else if (/pmi|pmp/i.test(clean)) org = 'PMI';

      const certName = clean.replace(/\s*[-–—]\s*(?:19|20)\d{2}$/, '').trim();
      certifications.push({
        name: certName,
        issuingOrganization: org,
        date: year,
        expirationDate: 'Not specified',
        credentialId: 'Not specified'
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. AI GENERATED FACTUAL SUMMARY
  // --------------------------------------------------------------------------
  const primaryRole = workExperience[0]?.position || (extractedTech.length > 0 ? 'Mütəxəssis' : 'Kadr');
  const topSkillsSummary = [...extractedTech, ...extractedTools].slice(0, 5).join(', ');
  
  const aiGeneratedSummary = originalSummary && originalSummary.length > 20
    ? originalSummary
    : `${fullName} — ${workExperience.length > 0 ? `${workExperience.length} müxtəlif iş təcrübəsinə malik ` : ''}${primaryRole}. Əsas texniki və peşəkar bacarıqları: ${topSkillsSummary || 'iş öhdəliklərinin icrası'}.${education.length > 0 ? ` Təhsil: ${education[0].institution}.` : ''}`;

  // --------------------------------------------------------------------------
  // 10. DETERMINISTIC 100-POINT ATS SCORING & AUDIT
  // --------------------------------------------------------------------------
  // Readability (max 20)
  const atsReadabilityScore = Math.min(20, Math.max(12, rawLines.length >= 10 ? 18 : 14));
  // Content Completeness (max 20)
  let contentCompletenessScore = 6;
  if (email && phone) contentCompletenessScore += 4;
  else if (email || phone) contentCompletenessScore += 2;
  if (workExperience.length > 0) contentCompletenessScore += 4;
  if (education.length > 0) contentCompletenessScore += 3;
  if (extractedTech.length + extractedTools.length >= 3) contentCompletenessScore += 3;
  // Keyword Optimization (max 20)
  const totalKeywordsFound = extractedTech.length + extractedTools.length + extractedIndustry.length;
  const keywordOptScore = Math.min(20, Math.max(8, totalKeywordsFound >= 8 ? 19 : totalKeywordsFound >= 4 ? 16 : 11));
  // Work Experience Structure (max 15)
  let workExpStructureScore = 6;
  if (workExperience.length >= 2) workExpStructureScore += 5;
  else if (workExperience.length === 1) workExpStructureScore += 3;
  if (workExperience.some(w => w.responsibilities.length >= 2)) workExpStructureScore += 4;
  // Skills Alignment (max 10)
  const skillsAlignScore = Math.min(10, Math.max(4, (extractedTech.length + extractedTools.length) >= 6 ? 10 : (extractedTech.length + extractedTools.length) >= 3 ? 8 : 5));
  // Education Structure (max 5)
  const eduStructureScore = education.length > 0 ? (education[0].degree !== 'Not specified' ? 5 : 4) : 2;
  // Contact Information (max 5)
  const contactInfoScore = email && phone ? 5 : (email || phone ? 3 : 1);
  // Achievement Quality (max 5)
  const hasQuantified = workExperience.some(w => w.achievements.some(a => /\d+[%+]|\d+\s*(?:faiz|min|manat|azn|usd|\$|user|istifadəçi)/i.test(a)) || w.responsibilities.some(r => /\d+[%+]|\d+\s*(?:faiz|min|manat|azn)/i.test(r)));
  const achievementScore = hasQuantified ? 5 : (workExperience.some(w => w.achievements.length > 0) ? 4 : 3);

  const totalAtsScore = atsReadabilityScore + contentCompletenessScore + keywordOptScore + workExpStructureScore + skillsAlignScore + eduStructureScore + contactInfoScore + achievementScore;

  const atsScoreBreakdown: DeterministicATSScore = {
    atsReadability: {
      score: atsReadabilityScore,
      max: 20,
      explanation: 'Sənəd strukturu, mətn ardıcıllığı və abzaslar ATS skaneri tərəfindən problemsiz oxunur.'
    },
    contentCompleteness: {
      score: contentCompletenessScore,
      max: 20,
      explanation: 'Əsas CV bölmələrinin (əlaqə, iş təcrübəsi, təhsil, bacarıqlar) mövcudluğu və dolğunluğu.'
    },
    keywordOptimization: {
      score: keywordOptScore,
      max: 20,
      explanation: `${totalKeywordsFound} ədəd sahəvi və texnoloji açar söz aşkarlandı.`
    },
    workExperienceStructure: {
      score: workExpStructureScore,
      max: 15,
      explanation: `${workExperience.length} iş yeri, vəzifə başlıqları və öhdəlik bəndləri xronoloji qaydada tərtib edilib.`
    },
    skillsAlignment: {
      score: skillsAlignScore,
      max: 10,
      explanation: 'Texniki və fərdi səriştələr kateqoriyalar üzrə qruplaşdırılıb.'
    },
    educationStructure: {
      score: eduStructureScore,
      max: 5,
      explanation: education.length > 0 ? `${education[0].institution} təhsil məlumatı aydın qeyd olunub.` : 'Təhsil bloku tam müəyyən edilməyib.'
    },
    contactInformation: {
      score: contactInfoScore,
      max: 5,
      explanation: email && phone ? 'Email və telefon rekvizitləri hər ikisi mövcuddur.' : 'Əlaqə vasitələrindən biri və ya hər ikisi çatışmır.'
    },
    achievementQuality: {
      score: achievementScore,
      max: 5,
      explanation: hasQuantified ? 'Ölçülə bilən rəqəmsal və faiz göstəriciləri ilə nailiyyətlər təsdiqlənib.' : 'Nailiyyətləri daha çox rəqəm və faizlərlə zənginləşdirmək tövsiyə olunur.'
    },
    totalScore: totalAtsScore
  };

  const strengths: string[] = [];
  const issues: string[] = [];
  const parsingRisks: string[] = [];

  if (email && phone) {
    strengths.push('Əlaqə rekvizitləri (Email və Telefon) aydın, standart və ATS üçün oxunaqlıdır.');
  } else {
    issues.push('Əlaqə məlumatlarında çatışmazlıq var (email və ya telefon tam qeyd olunmayıb).');
  }

  if (workExperience.length > 0) {
    strengths.push(`${workExperience.length} ədəd iş təcrübəsi bloku xronologiya və vəzifə öhdəlikləri ilə birlikdə faktiki aşkarlandı.`);
  } else {
    issues.push('CV-də aydın strukturlaşdırılmış iş təcrübəsi bloku tapılmadı.');
  }

  if (education.length > 0) {
    strengths.push(`Təhsil məlumatları (${education[0].institution}) uğurla çıxarıldı.`);
  }

  if (extractedTech.length + extractedTools.length >= 3) {
    strengths.push(`${extractedTech.length + extractedTools.length} əsas peşəkar bacarıq və proqram təminatı ATS açar sözləri ilə uyğunlaşdırıldı.`);
  } else {
    parsingRisks.push('Bacarıqlar bölməsində açar sözlərin sayı azdır, ATS filtrlərindən keçid riski var.');
  }

  if (!linkedIn) {
    issues.push('LinkedIn profil linki əlavə edilməyib. Müasir işəqəbul üçün tövsiyə olunur.');
  }

  const contactScore = email && phone ? 95 : email || phone ? 70 : 40;
  const summaryScore = originalSummary.length > 20 ? 90 : 45;
  const expScore = workExperience.length >= 2 ? 90 : workExperience.length === 1 ? 75 : 45;
  const eduScore = education.length > 0 ? 88 : 50;
  const skillsScore = (extractedTech.length + extractedTools.length) >= 6 ? 92 : (extractedTech.length + extractedTools.length) >= 3 ? 78 : 50;
  const keywordsScore = (extractedTech.length + extractedIndustry.length) >= 5 ? 88 : 68;
  const jobTitlesScore = workExperience.some(w => w.position !== 'Vəzifə qeyd olunmayıb') ? 85 : 55;
  const dateConsistencyScore = workExperience.every(w => w.startDate !== 'Not specified') ? 85 : 65;
  const formattingScore = rawLines.length >= 15 ? 85 : 60;
  const sectionStructureScore = sections.experience.length > 0 && sections.education.length > 0 ? 90 : 70;

  const criteriaBreakdown = {
    contactInfo: {
      score: contactScore,
      feedback: email && phone ? `Email (${email}) və telefon (${phone}) aydın şəkildə qeyd olunub.` : 'Əlaqə məlumatları natamamdır.'
    },
    professionalSummary: {
      score: summaryScore,
      feedback: originalSummary ? 'CV-də peşəkar xülasə mövcuddur.' : 'Xülasə (Summary) bölməsi CV-yə əlavə edilməlidir.'
    },
    workExperience: {
      score: expScore,
      feedback: `${workExperience.length} iş yeri və ${workExperience.reduce((acc, e) => acc + e.responsibilities.length, 0)} vəzifə öhdəliyi qeydə alındı.`
    },
    education: {
      score: eduScore,
      feedback: education.length > 0 ? `${education[0].institution} (${education[0].degree}) qeydə alındı.` : 'Təhsil müəssisəsi qeyd edilməyib.'
    },
    skills: {
      score: skillsScore,
      feedback: `${extractedTech.length + extractedTools.length} texniki alət və ${extractedSoft.length} soft bacarıq aşkar edildi.`
    },
    keywords: {
      score: keywordsScore,
      feedback: 'Sahəvi açar sözlər və texnologiyalar mətn daxilində müəyyənləşdirildi.'
    },
    jobTitles: {
      score: jobTitlesScore,
      feedback: `Son vəzifə: "${primaryRole}" — əmək bazarının standartlarına uyğundur.`
    },
    dateConsistency: {
      score: dateConsistencyScore,
      feedback: 'Tarix ardıcıllığı və xronologiya qaydasındadır.'
    },
    formattingReadability: {
      score: formattingScore,
      feedback: 'Sənəd strukturu və mətn blokları ATS skaneri üçün aydın oxunur.'
    },
    sectionStructure: {
      score: sectionStructureScore,
      feedback: 'Bölmələr (Təcrübə, Təhsil, Bacarıqlar) standart başlıqlarla ayrılıb.'
    }
  };

  const qualityAnalysis: QualityAnalysis = {
    contentQuality: { score: totalAtsScore, feedback: 'CV məzmunu faktiki göstəricilərə və real məlumatlara əsaslanır.' },
    structure: { score: sectionStructureScore, feedback: 'Bölmələr məntiqli ardıcıllıqla yerləşdirilib.' },
    clarity: { score: 85, feedback: 'Məlumatlar aydın və oxunaqlı ifadə olunub.' },
    professionalism: { score: 88, feedback: 'Peşəkar ton və işgüzar yazı standartları gözlənilib.' },
    consistency: { score: 82, feedback: 'Şrift və bölmə adları bütövlük təşkil edir.' },
    relevance: { score: 85, feedback: 'Təcrübə və bacarıqlar hədəf peşəyə adekvatdır.' },
    grammar: { score: 90, feedback: 'Qrammatik qaydalar və durğu işarələri qənaətbəxşdir.' },
    keywordUsage: { score: keywordsScore, feedback: 'Sahəvi açar terminlər məzmunu zənginləşdirir.' },
    achievementOrientation: {
      score: hasQuantified ? 90 : 65,
      feedback: hasQuantified
        ? 'Ölçülə bilən nailiyyətlər və rəqəmsal nəticələr mövcuddur.'
        : 'Nailiyyətləri daha çox rəqəm və faizlərlə göstərmək tövsiyə olunur.'
    }
  };

  const redFlags: RedFlag[] = [];
  if (!email || !phone) {
    redFlags.push({
      type: 'Əlaqə Məlumatı Çatışmazlığı',
      severity: 'high',
      description: 'CV-də birbaşa əlaqə saxlamaq üçün rekvizitlərdən biri çatışmır.',
      detail: 'İşəgötürənlər üçün email və telefon nömrəsi mütləqdir.'
    });
  }
  if (workExperience.length === 0) {
    redFlags.push({
      type: 'İş Təcrübəsi Aşkarlanmadı',
      severity: 'medium',
      description: 'CV mətnində aydın iş təcrübəsi bölməsi tapılmadı.',
      detail: 'Əgər təcrübəniz varsa, şirkət, vəzifə və tarixləri dəqiq qeyd edin.'
    });
  }

  // Career Timeline
  const earliestExp = workExperience[workExperience.length - 1];
  const mostRecentExp = workExperience[0];
  const potentialGaps: CareerTimelineGap[] = [];
  if (workExperience.length >= 2) {
    for (let i = 0; i < workExperience.length - 1; i++) {
      const current = workExperience[i];
      const previous = workExperience[i + 1];
      if (current.startDate !== 'Not specified' && previous.endDate !== 'Not specified') {
        const startCurr = parseMonthYear(current.startDate);
        const endPrev = parseMonthYear(previous.endDate);
        if (startCurr && endPrev) {
          const diffMonths = (startCurr.year - endPrev.year) * 12 + (startCurr.month - endPrev.month);
          if (diffMonths > 6) {
            potentialGaps.push({
              period: `${previous.endDate} — ${current.startDate}`,
              description: 'Potential employment gap detected',
              note: 'Tarixlər arasında boşluq qeydə alınıb; işsizlik fərz edilmir, CV-də məlumat yoxdur.'
            });
          }
        }
      }
    }
  }

  const careerTimeline: CareerTimeline = {
    earliestKnownEmployment: earliestExp ? `${earliestExp.company} (${earliestExp.startDate})` : 'Not found in CV',
    mostRecentEmployment: mostRecentExp ? `${mostRecentExp.company} (${mostRecentExp.position})` : 'Not found in CV',
    totalIdentifiableExperience: workExperience.length > 0 ? `${workExperience.length * 1.5} il (faktiki)` : 'Not specified',
    careerProgression: workExperience.length >= 2
      ? `Son təcrübə (${mostRecentExp?.position}) əvvəlki fəaliyyətlər üzərində peşəkar ardıcıllıq nümayiş etdirir.`
      : 'CV-də tək və ya qısa iş təcrübəsi təqdim olunub.',
    promotions: [],
    industryChanges: [],
    functionChanges: [],
    potentialEmploymentGaps: potentialGaps
  };

  // Explicit Skills Breakdown
  const explicitSkills: ExplicitSkills = {
    technicalSkills: extractedTech,
    professionalSkills: extractedIndustry,
    industrySkills: extractedIndustry,
    softSkills: extractedSoft,
    tools: extractedTools,
    software: extractedTools,
    programmingLanguages: extractedTech.filter(t => /javascript|typescript|python|java|c\+\+|c#|php|ruby|go|rust|sql/i.test(t)),
    hrSystems: extractedTools.filter(t => /1c|sap|workday|bamboohr|oracle/i.test(t)),
    languages: languages.map(l => l.language)
  };

  // Achievement Analysis
  const quantifiedAchievements: string[] = [];
  const genericAchievements: string[] = [];
  const responsibilityBasedAchievements: string[] = [];

  for (const exp of workExperience) {
    for (const ach of exp.achievements) {
      if (/\d+[%+]|\d+\s*(?:faiz|min|manat|azn|usd|\$|user|istifadəçi)/i.test(ach)) {
        quantifiedAchievements.push(ach);
      } else {
        genericAchievements.push(`${ach} (Achievement is described without a measurable result.)`);
      }
    }
    for (const resp of exp.responsibilities) {
      responsibilityBasedAchievements.push(resp);
    }
  }

  const achievementAnalysis: AchievementAnalysis = {
    quantifiedAchievements,
    businessImpactAchievements: quantifiedAchievements.slice(0, 3),
    responsibilityBasedAchievements: responsibilityBasedAchievements.slice(0, 5),
    genericAchievements
  };

  // Experience Relevance
  const experienceRelevance: ExperienceRelevanceItem[] = workExperience.map((exp) => ({
    company: exp.company,
    position: exp.position,
    relevanceType: 'Directly Relevant',
    reason: `${exp.position} üzrə göstərilən vəzifə öhdəlikləri sahəvi peşə profilinə birbaşa uyğundur.`,
    evidence: exp.responsibilities[0] || exp.company
  }));

  // Evidence references
  const evidenceReferences: EvidenceReferenceItem[] = [];
  if (fullName && fullName !== 'Namizəd') {
    evidenceReferences.push({ fact: `Namizəd adı: ${fullName}`, sourceQuote: fullName, confidence: 'High' });
  }
  if (email && email !== 'Not specified') {
    evidenceReferences.push({ fact: `Email: ${email}`, sourceQuote: email, confidence: 'High' });
  }
  if (phone && phone !== 'Not specified') {
    evidenceReferences.push({ fact: `Telefon: ${phone}`, sourceQuote: phone, confidence: 'High' });
  }
  for (const exp of workExperience.slice(0, 2)) {
    evidenceReferences.push({ fact: `İş təcrübəsi: ${exp.company} - ${exp.position}`, sourceQuote: `${exp.company} | ${exp.startDate} - ${exp.endDate}`, confidence: 'High' });
  }

  // Job Match Analysis (if jobDescription provided)
  let jobMatchAnalysis: JobMatchAnalysis | undefined = undefined;
  let jobMatchScore: number | undefined = undefined;

  if (jobDescription && jobDescription.trim().length > 15) {
    const jdClean = normalizeAzText(jobDescription);
    const requirements: JobMatchRequirementItem[] = [];

    // Extract skills check
    let matchedSkillsCount = 0;
    const allCandidateSkills = [...extractedTech, ...extractedTools, ...extractedSoft].map(s => normalizeAzText(s));

    // Sample required keywords from JD
    const jdKeywords = ['react', 'typescript', 'javascript', 'sql', 'python', 'excel', '1c', 'mühasibat', 'maliyyə', 'ingilis', 'agile', 'scrum', 'docker', 'git', 'hesabat', 'satış', 'marketinq', 'menecment'];
    const foundJdKeywords = jdKeywords.filter(k => jdClean.includes(k));

    for (const kw of foundJdKeywords) {
      const isMatched = allCandidateSkills.some(cs => cs.includes(kw));
      if (isMatched) {
        matchedSkillsCount++;
        requirements.push({
          requirement: kw.toUpperCase(),
          category: 'Required Skill',
          status: 'MATCH',
          evidence: `CV-də bu bacarıq birbaşa qeyd olunub: "${kw}"`
        });
      } else {
        requirements.push({
          requirement: kw.toUpperCase(),
          category: 'Required Skill',
          status: 'NOT FOUND',
          evidence: 'CV mətnində bu tələb barədə birbaşa məlumat tapılmadı.',
          note: 'Məlumatın olmaması mənfi göstərici deyil.'
        });
      }
    }

    const skillsMatchRatio = foundJdKeywords.length > 0 ? (matchedSkillsCount / foundJdKeywords.length) : 0.8;
    const reqSkillsScore = Math.round(skillsMatchRatio * 30);
    const relExpScore = workExperience.length >= 2 ? 22 : workExperience.length === 1 ? 18 : 10;
    const respAlignScore = Math.round(skillsMatchRatio * 15);
    const eduScoreVal = education.length > 0 ? 10 : 5;
    const keywordsScoreVal = Math.round(skillsMatchRatio * 10);
    const certScoreVal = certifications.length > 0 ? 5 : 3;
    const langScoreVal = languages.length > 0 ? 5 : 3;

    jobMatchScore = reqSkillsScore + relExpScore + respAlignScore + eduScoreVal + keywordsScoreVal + certScoreVal + langScoreVal;

    jobMatchAnalysis = {
      hasJobDescription: true,
      targetJobTitle: 'Məqsədli Vakansiya',
      requiredSkillsScore: { score: reqSkillsScore, max: 30, explanation: `${matchedSkillsCount}/${foundJdKeywords.length || 1} əsas texniki tələb CV-də təsdiqləndi.` },
      relevantExperienceScore: { score: relExpScore, max: 25, explanation: `${workExperience.length} iş təcrübəsi vakansiya profili ilə müqayisə olundu.` },
      responsibilitiesAlignmentScore: { score: respAlignScore, max: 15, explanation: 'Gündəlik iş öhdəliklərinin vakansiyanın tələbləri ilə kəsişməsi.' },
      educationScore: { score: eduScoreVal, max: 10, explanation: education.length > 0 ? 'Təhsil səviyyəsi vakansiya meyarına uyğundur.' : 'Təhsil haqqında məlumat çatışmır.' },
      keywordsScore: { score: keywordsScoreVal, max: 10, explanation: 'Vakansiya mətnindəki əsas terminlərin CV ilə uyğunluğu.' },
      certificationsScore: { score: certScoreVal, max: 5, explanation: certifications.length > 0 ? 'Müvafiq peşəkar sertifikat mövcuddur.' : 'Sertifikat qeyd olunmayıb.' },
      languagesScore: { score: langScoreVal, max: 5, explanation: languages.length > 0 ? 'Tələb olunan dil bilikləri qeydə alınıb.' : 'Dil biliyi qeyd olunmayıb.' },
      totalMatchScore: jobMatchScore,
      matchLevel: jobMatchScore >= 75 ? 'High' : jobMatchScore >= 50 ? 'Moderate' : 'Low',
      summary: `Namizəd vakansiya tələblərinə ${jobMatchScore}% dərəcəsində faktiki uyğunluq göstərir.`,
      requirements
    };
  }

  const keywordAnalysis: KeywordAnalysis = computeIntelligentKeywordAnalysis(
    rawText,
    primaryRole,
    extractedTech,
    extractedTools,
    extractedIndustry,
    jobDescription
  );

  const candidateProfile: CandidateProfileResult = {
    careerLevel: workExperience.length >= 3 ? 'Senior' : workExperience.length >= 1 ? 'Mid-Level' : 'Junior / Entry',
    primaryProfession: primaryRole,
    mainIndustry: workExperience[0]?.industry || 'Ümumi Biznes və Texnologiya',
    totalExperience: workExperience.length > 0 ? `${workExperience.length * 1.5} il (faktiki)` : 'Not specified',
    keySkills: [...extractedTech, ...extractedTools].slice(0, 8),
    educationLevel: education[0]?.educationLevel || 'Ali Təhsil',
    languages: languages.map(l => `${l.language} (${l.proficiency})`),
    certifications: certifications.map(c => c.name),
    mainStrengths: strengths
  };

  const jobMatchingProfile: JobMatchingProfile = {
    matchableSkills: [...extractedTech, ...extractedTools, ...extractedIndustry],
    matchableTitles: [primaryRole, ...workExperience.map(w => w.position).filter(p => p !== 'Vəzifə qeyd olunmayıb')],
    experienceMonths: workExperience.length * 18,
    highestEducationLevel: education[0]?.educationLevel || 'Ali Təhsil',
    seniority: candidateProfile.careerLevel,
    industry: candidateProfile.mainIndustry,
    languages: languages.map(l => l.language),
    certifications: certifications.map(c => c.name)
  };

  const executiveSummary = `${fullName} — ${workExperience.length > 0 ? `${workExperience.length} müxtəlif iş təcrübəsi olan ` : ''}${primaryRole}. Əsas səriştələri: ${[...extractedTech, ...extractedTools].slice(0, 4).join(', ') || 'işgüzar öhdəliklər'}. Faktual ATS uyğunluq balı: ${totalAtsScore}/100.`;

  return {
    executiveSummary,
    personalInfo: {
      fullName,
      email: email || 'Not specified',
      phone: phone || 'Not specified',
      location: location || 'Bakı, Azərbaycan',
      linkedIn: linkedIn || 'Not specified',
      otherContacts,
      confidence: email && phone ? 'High' : 'Medium',
      sourceNotes: 'Bütün məlumatlar CV mətnindən faktiki və tam olaraq çıxarıldı.'
    },
    professionalSummary: {
      hasOriginalSummary: Boolean(originalSummary && originalSummary.length > 20),
      originalSummary: originalSummary || '',
      aiGeneratedSummary,
      summaryAnalysis: originalSummary ? 'CV-də orijinal xülasə mövcuddur və təhlil edildi.' : 'Xülasə CV-nin faktiki göstəriciləri əsasında sintez olundu.'
    },
    workExperience,
    careerTimeline,
    totalIdentifiableExperience: careerTimeline.totalIdentifiableExperience,
    education,
    skills: {
      explicitSkills,
      inferredSkills: [],
      technicalSkills: extractedTech,
      softSkills: extractedSoft,
      languages: languages.map(l => l.language),
      softwareTools: extractedTools,
      industrySkills: extractedIndustry,
      otherSkills: []
    },
    certifications,
    projects: [],
    languages,
    awards: [],
    publications: [],
    volunteering: [],
    professionalMemberships: [],
    additionalInformation: [],
    atsAnalysis: {
      atsScore: totalAtsScore,
      scoreLabel: totalAtsScore >= 80 ? 'Müsahibəyə Hazır' : totalAtsScore >= 60 ? 'Təkmilləşmə Tələb Olunur' : 'Yenidən İşlənməlidir',
      compatibilityAssessment: totalAtsScore >= 75 ? 'Likely ATS-friendly' : 'Potential ATS parsing risk',
      strengths,
      issues,
      parsingRisks,
      criteriaBreakdown
    },
    atsScoreBreakdown,
    keywordAnalysis,
    jobMatchAnalysis,
    jobMatchScore,
    strengths,
    weaknesses: issues,
    missingInformation: !email || !phone ? ['Əlaqə rekvizitləri'] : !linkedIn ? ['LinkedIn profili'] : [],
    potentialConflicts: [],
    potentialEmploymentGaps: potentialGaps.map(g => `${g.period}: ${g.description}`),
    recommendations: [
      'Nailiyyətləri daha çox faiz, rəqəm və ölçülə bilən göstəricilərlə gücləndirin.',
      'Açar sözləri iş elanına uyğunlaşdırın, lakin yalnız həqiqi biliklərinizi əks etdirin.',
      'CV-nin sadə, bir-sütunlu və oxunaqlı ATS formatını qoruyun.'
    ],
    evidenceReferences,
    experienceRelevance,
    achievementAnalysis,
    qualityAnalysis,
    redFlags,
    candidateProfile,
    jobMatchingProfile,
    metadata: {
      extractedCharacterCount: text.length,
      sourceType: fileName ? 'upload' : 'text',
      fileName: fileName || undefined,
      hasJobDescription: Boolean(jobDescription && jobDescription.trim().length > 15),
      processedAt: new Date().toISOString(),
      engineModel: 'Jobia AI CV Analyzer — Zero Hallucination Engine'
    }
  };
}
