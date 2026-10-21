import { RecruitmentCriteria } from '../../../types';

export interface EnterprisePositionDefinition {
  id: string;
  title: string;
  department: string;
  seniorityLevel: 'Junior' | 'Middle' | 'Senior' | 'Lead';
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  maxExpectedSalary: number;
  requiredEducation: string;
  requiredLanguages: string[];
  conceptDescription: string;
  conceptKeywords: string[];
  weights?: {
    skills: number;
    experience: number;
    jobTitleMatch: number;
    salary: number;
    education: number;
    languages: number;
    location: number;
  };
}

/**
 * Enterprise positions catalog across all standard corporate departments
 * Aligned with Azerbaijani labor market standards and modern enterprise concepts
 */
export const ENTERPRISE_POSITIONS_CATALOG: EnterprisePositionDefinition[] = [
  // ==========================================
  // 1. İT, PROQRAMLAŞDIRMA VƏ RƏQƏMSAL HƏLLƏR
  // ==========================================
  {
    id: 'ent-fe-sr',
    title: 'Senior Frontend Developer',
    department: 'İT & Rəqəmsal İnkişaf',
    seniorityLevel: 'Senior',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'REST API'],
    preferredSkills: ['GraphQL', 'Docker', 'Jest', 'CI/CD', 'Micro-frontends'],
    minExperienceYears: 4,
    maxExpectedSalary: 3000,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B2)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Müəssisənin yüksək yüklü müştəri və daxili veb platformalarının müasir SPA/SSR texnologiyaları ilə etibarlı, sürətli və miqyaslana bilən şəkildə hazırlanması konsepsiyası.',
    conceptKeywords: ['frontend', 'react', 'typescript', 'next.js', 'spa', 'veb'],
  },
  {
    id: 'ent-be-dev',
    title: 'Backend Developer (Node.js & Go)',
    department: 'İT & Rəqəmsal İnkişaf',
    seniorityLevel: 'Middle',
    requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'REST API'],
    preferredSkills: ['Golang', 'Microservices', 'Kubernetes', 'RabbitMQ', 'Kafka'],
    minExperienceYears: 3,
    maxExpectedSalary: 2400,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B1)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Biznes məntiqlərinin, mikroxidmət arxitekturalarının və verilənlər bazası inteqrasiyalarının təhlükəsiz və fasiləsiz işləməsini təmin edən sistem arxitekturası konsepsiyası.',
    conceptKeywords: ['backend', 'node.js', 'golang', 'postgresql', 'api', 'microservices'],
  },
  {
    id: 'ent-qa-eng',
    title: 'QA Automation & Test Mühəndisi',
    department: 'İT & Rəqəmsal İnkişaf',
    seniorityLevel: 'Middle',
    requiredSkills: ['Selenium', 'Cypress', 'JavaScript', 'Postman', 'SQL', 'Jira'],
    preferredSkills: ['Python', 'CI/CD', 'Performance Testing', 'JMeter'],
    minExperienceYears: 2.5,
    maxExpectedSalary: 2000,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B2)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Məhsulların sıfır xəta ilə istifadəyə verilməsi, reqresiya və funksional sınaqların avtomatlaşdırılması vasitəsilə keyfiyyətə zəmanət konsepsiyası.',
    conceptKeywords: ['qa', 'test', 'automation', 'cypress', 'selenium', 'postman'],
  },
  {
    id: 'ent-uiux-des',
    title: 'UI/UX & Rəqəmsal Məhsul Dizayneri',
    department: 'İT & Rəqəmsal İnkişaf',
    seniorityLevel: 'Middle',
    requiredSkills: ['Figma', 'Dizayn Sistemləri', 'Wireframing', 'Prototyping', 'İstifadəçi Araşdırması', 'Adobe Photoshop'],
    preferredSkills: ['Adobe Illustrator', 'Mobile App Design', 'Design Tokens', 'Usability Testing'],
    minExperienceYears: 3,
    maxExpectedSalary: 1900,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B1)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'İstifadəçi təcrübəsinin rahatlığı, intuitiv naviqasiya və korporativ vizual standartların tətbiqi ilə rəqəmsal konversiyanın artırılması konsepsiyası.',
    conceptKeywords: ['ui/ux', 'figma', 'dizayn', 'ux research', 'prototip'],
  },
  {
    id: 'ent-data-analyst',
    title: 'Data Analitik & BI Mütəxəssisi',
    department: 'İT & Rəqəmsal İnkişaf',
    seniorityLevel: 'Middle',
    requiredSkills: ['SQL', 'Power BI', 'Excel Advanced', 'Data Vizualizasiya', 'Python'],
    preferredSkills: ['Tableau', 'ETL', 'Statistika', 'Machine Learning'],
    minExperienceYears: 2.5,
    maxExpectedSalary: 2100,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B2)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Şirkət məlumatlarının analiz edilməsi, idarəetmə üçün vizual hesabatların və analitik modellərin qurulması ilə qərarların dəstəklənməsi konsepsiyası.',
    conceptKeywords: ['data', 'analitik', 'bi', 'sql', 'power bi', 'hesabat'],
  },

  // ==========================================
  // 2. MALİYYƏ, MÜHASİBAT VƏ AUDİT
  // ==========================================
  {
    id: 'ent-acc-chief',
    title: 'Baş Mühasib & Maliyyə Rəhbəri',
    department: 'Maliyyə və Mühasibat',
    seniorityLevel: 'Senior',
    requiredSkills: ['1C 8.3', 'BTP', 'Maliyyə Hesabatları', 'Vergi Məcəlləsi', 'Excel Advanced', 'DSMF', 'Əməkhaqqı Hesablanması'],
    preferredSkills: ['PMS Sertifikatı', 'İFRS', 'Audit', 'Bank Əməliyyatları'],
    minExperienceYears: 5,
    maxExpectedSalary: 2200,
    requiredEducation: 'Ali / Magistr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B2)'],
    conceptDescription: 'Müəssisənin bütün maliyyə-təsərrüfat əməliyyatlarının AR qanunvericiliyinə uyğun tam uçotu, vergi optimizasiyası və vaxtında hesabatlılıq konsepsiyası.',
    conceptKeywords: ['mühasib', '1c', 'vergi', 'hesabat', 'maliyyə', 'btp'],
  },
  {
    id: 'ent-fin-analyst',
    title: 'Maliyyə Mütəxəssisi & Büdcə Analitiki',
    department: 'Maliyyə və Mühasibat',
    seniorityLevel: 'Middle',
    requiredSkills: ['Maliyyə Təhlili', 'Büdcə Planlaşdırması', 'Excel Maliyyə Modelləri', 'Cash Flow', '1C'],
    preferredSkills: ['ACCA F2/F3', 'Power BI', 'Xəzinədarlıq'],
    minExperienceYears: 3,
    maxExpectedSalary: 1800,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'İngilis dili (B1)'],
    conceptDescription: 'Müəssisənin büdcə xərclərinin nizamlanması, gəlirlilik təhlili və pul axınlarının (Cash Flow) səmərəli idarə olunması konsepsiyası.',
    conceptKeywords: ['maliyyə', 'büdcə', 'analitik', 'cash flow', 'excel'],
  },

  // ==========================================
  // 3. İNSAN RESURSLARI (HR) VƏ KADRLAR
  // ==========================================
  {
    id: 'ent-hr-mgr',
    title: 'İnsan Resursları Meneceri (HR Manager)',
    department: 'İnsan Resursları (HR)',
    seniorityLevel: 'Senior',
    requiredSkills: ['İşə Qəbul (Recruitment)', 'AR Əmək Məcəlləsi', 'Kadr Kargüzarlığı', 'KPI Sistemləri', 'İşçilərin Motivasiyası', 'Müsahibələrin Təşkili'],
    preferredSkills: ['SHRM / HRCI', 'Təlim Planlaşdırma', 'İşəgötürən Brendi', 'HR Analitika'],
    minExperienceYears: 4,
    maxExpectedSalary: 2000,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B2)', 'İngilis dili (B1)'],
    conceptDescription: 'Şirkətin insan kapitalının strateji idarə olunması, ən güclü istedadların cəlb edilməsi və işçi məmnuniyyətinin artırılması konsepsiyası.',
    conceptKeywords: ['hr', 'recruitment', 'əmək məcəlləsi', 'kadr', 'kpi'],
  },
  {
    id: 'ent-hr-spec',
    title: 'Kadrlar üzrə Aparıcı Mütəxəssis & Rekruiter',
    department: 'İnsan Resursları (HR)',
    seniorityLevel: 'Middle',
    requiredSkills: ['Kadr Kargüzarlığı', 'Əmək Müqavilələri', 'Sourcing', 'İlkin Müsahibələr', 'Elektron Hökumət Portalı (ƏMAS)', 'Şəxsi İşlər'],
    preferredSkills: ['1C ZUP', 'İşçilərin Adaptasiyası', 'LinkedIn Sourcing'],
    minExperienceYears: 2,
    maxExpectedSalary: 1300,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B1)'],
    conceptDescription: 'ƏMAS sistemində qeydiyyat, əmək müqavilələrinin tərtibi, vakansiyaların sürətli bağlanması və kadr nizam-intizamının qorunması konsepsiyası.',
    conceptKeywords: ['kadr', 'əmas', 'əmək müqaviləsi', 'recruiter', 'sourcing'],
  },

  // ==========================================
  // 4. SATIŞ VƏ BİZNESİN İNKİŞAFI
  // ==========================================
  {
    id: 'ent-sales-b2b',
    title: 'Korporativ B2B Satış Meneceri',
    department: 'Satış və Biznesin İnkişafı',
    seniorityLevel: 'Middle',
    requiredSkills: ['B2B Danışıqlar', 'Soyuq Zənglər', 'Müştəri Portfeli İdarəetməsi', 'Təqdimat Bacarıqları', 'CRM Sistemləri', 'Müqavilələrin Bağlanması'],
    preferredSkills: ['Tender İştirakı', 'Bitrix24', 'Korporativ Şəbəkələşmə'],
    minExperienceYears: 3,
    maxExpectedSalary: 1800,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B2)'],
    conceptDescription: 'Korporativ müştərilərlə strateji tərəfdaşlıq quraraq satış həcminin və şirkətin gəlir marjasının dinamik böyüməsi konsepsiyası.',
    conceptKeywords: ['satış', 'b2b', 'danışıqlar', 'crm', 'təqdimat', 'müştəri'],
  },
  {
    id: 'ent-support-rep',
    title: 'Müştəri Xidmətləri & Call Center Təmsilçisi',
    department: 'Satış və Biznesin İnkişafı',
    seniorityLevel: 'Junior',
    requiredSkills: ['Telefon Danışıqları Etiketi', 'Şikayətlərin İdarə Edilməsi', 'Zəng Mərkəzi Proqramları', 'Sürətli Yazı (Typing)', 'Məhsul Məlumatlandırması', 'Səbir və Diqqət'],
    preferredSkills: ['CRM Daxiletmə', 'Çoxşaxəli İş Qabiliyyəti'],
    minExperienceYears: 1,
    maxExpectedSalary: 900,
    requiredEducation: 'Orta / Kollec / Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B2)'],
    conceptDescription: 'Gələn müraciətlərə yüksək etiketlə operativ cavab verilməsi, müştəri loyallığının və müsbət brend imicinin qorunması konsepsiyası.',
    conceptKeywords: ['müştəri xidməti', 'call center', 'dəstək', 'zəng', 'etiket'],
  },

  // ==========================================
  // 5. MARKETİNQ, SMM VƏ BRENDİNQ
  // ==========================================
  {
    id: 'ent-mkt-digital',
    title: 'Rəqəmsal Marketinq & Performans Meneceri',
    department: 'Marketinq və Brendinq',
    seniorityLevel: 'Middle',
    requiredSkills: ['Meta Ads', 'Google Ads', 'SEO', 'TikTok Ads', 'Analitika GA4', 'Büdcə İdarəetməsi', 'Kopiraytinq'],
    preferredSkills: ['Email Marketinq', 'ROAS Optimizasiyası', 'Canva'],
    minExperienceYears: 3,
    maxExpectedSalary: 1700,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B1)', 'İngilis dili (B1)'],
    conceptDescription: 'Rəqəmsal kanallarda hədəfli reklam strategiyaları ilə brend tanınmasını artırmaq və minimal xərclə yüksək ROI/ROAS əldə etmək konsepsiyası.',
    conceptKeywords: ['marketinq', 'meta ads', 'google ads', 'seo', 'smm', 'analitika'],
  },
  {
    id: 'ent-smm-mgr',
    title: 'SMM & Məzmun Meneceri (Content Creator)',
    department: 'Marketinq və Brendinq',
    seniorityLevel: 'Junior',
    requiredSkills: ['Sosial Media İdarəetməsi', 'Instagram & TikTok Məzmun', 'Video Montaj (CapCut)', 'Kopiraytinq', 'Story Planlaşdırma', 'Trendləri İzləmə'],
    preferredSkills: ['Canva', 'Ssenari Yazımı', 'Məhsul Çəkilişləri'],
    minExperienceYears: 1.5,
    maxExpectedSalary: 1100,
    requiredEducation: 'Bakalavr / Kollec',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B1)'],
    conceptDescription: 'Şirkətin sosial media hesablarında cəlbedici vizual və video məzmun yaradaraq aktiv izləyici icmasının formalaşdırılması konsepsiyası.',
    conceptKeywords: ['smm', 'məzmun', 'instagram', 'tiktok', 'video', 'kopiraytinq'],
  },

  // ==========================================
  // 6. İDARƏETMƏ, LAYİHƏ VƏ ƏMƏLİYYATLAR
  // ==========================================
  {
    id: 'ent-pm-agile',
    title: 'Layihə Meneceri (Project Manager / Scrum Master)',
    department: 'İdarəetmə və Layihələr',
    seniorityLevel: 'Senior',
    requiredSkills: ['Agile', 'Scrum', 'Jira', 'Sprint Planlaşdırma', 'Risklərin İdarə Edilməsi', 'Komanda Koordinasiyası', 'Büdcə Nəzarəti'],
    preferredSkills: ['PMP', 'Confluence', 'Stakeholder Management'],
    minExperienceYears: 4,
    maxExpectedSalary: 2500,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (B2)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Layihələrin vaxtında, büdcə daxilində və yüksək keyfiyyətlə təhvil verilməsi üçün komanda resurslarının səmərəli idarə olunması konsepsiyası.',
    conceptKeywords: ['project manager', 'agile', 'scrum', 'jira', 'layihə', 'pmp'],
  },
  {
    id: 'ent-po-prod',
    title: 'Rəqəmsal Məhsul Meneceri (Product Manager)',
    department: 'İdarəetmə və Layihələr',
    seniorityLevel: 'Middle',
    requiredSkills: ['Məhsul Strategiyası', 'Bazar Araşdırması', 'İstifadəçi Rəyləri', 'A/B Testlər', 'Figma', 'Yol Xəritəsi (Roadmap)'],
    preferredSkills: ['Fintech Təcrübəsi', 'Məhsul Metrikaları', 'SQL'],
    minExperienceYears: 3,
    maxExpectedSalary: 2300,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['İngilis dili (C1)', 'Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Müştəri ehtiyacları ilə biznes hədəflərini birləşdirərək dəyər yaradan rəqəmsal məhsul vizyonunun reallaşdırılması konsepsiyası.',
    conceptKeywords: ['product manager', 'roadmap', 'məhsul', 'a/b test', 'fintech'],
  },
  {
    id: 'ent-legal-corp',
    title: 'Hüquqşünas & Korporativ Hüquq Məsləhətçisi',
    department: 'Hüquq və İnzibati İşlər',
    seniorityLevel: 'Middle',
    requiredSkills: ['Mülki Qanunvericilik', 'Müqavilələrin Ekspertizası', 'AR Əmək Qanunvericiliyi', 'İddia və Ərizələrin Tərtibi', 'Dövlət Orqanları ilə Əlaqələr'],
    preferredSkills: ['Korporativ İdarəetmə', 'Məhkəmə Təcrübəsi'],
    minExperienceYears: 3,
    maxExpectedSalary: 1800,
    requiredEducation: 'Ali Hüquq',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Rus dili (B2)'],
    conceptDescription: 'Şirkətin hüquqi maraqlarının tam qorunması, müqavilə risklərinin minimuma endirilməsi və qanunvericiliyə tam uyğunluq konsepsiyası.',
    conceptKeywords: ['hüquq', 'müqavilə', 'məhkəmə', 'qanunvericilik', 'hüquqşünas'],
  },

  // ==========================================
  // 7. LOQİSTİKA, TƏSƏRRÜFAT VƏ İAŞƏ
  // ==========================================
  {
    id: 'ent-wh-logistics',
    title: 'Anbardar & Logistika Mütəxəssisi',
    department: 'Logistika və Təsərrüfat',
    seniorityLevel: 'Middle',
    requiredSkills: ['1C Anbar', 'İnventarizasiya', 'Barkod Sistemləri', 'Mal Qəbulu və Buraxılışı', 'Anbarın Nizamlanması', 'Yük Qaimələri'],
    preferredSkills: ['Forklift İdarəetməsi', 'Təhlükəsizlik Qaydaları'],
    minExperienceYears: 3,
    maxExpectedSalary: 1200,
    requiredEducation: 'Orta / Kollec',
    requiredLanguages: ['Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Malların təhlükəsiz saxlanması, qalıqların dəqiq uçotu və daxili sifarişlərin fasiləsiz təchizatı konsepsiyası.',
    conceptKeywords: ['anbar', '1c', 'logistika', 'inventarizasiya', 'qaimə'],
  },
  {
    id: 'ent-chef-lead',
    title: 'Şef Aşpaz & İsti Sex Ustası',
    department: 'Qida və İaşə Xidmətləri',
    seniorityLevel: 'Senior',
    requiredSkills: ['Avropa Mətbəxi', 'Milli Mətbəx', 'HACCP Standartları', 'Kalkulyasiya Vərəqələri', 'Menyu Tərtibatı', 'Mətbəx Komandası İdarəetməsi'],
    preferredSkills: ['Qida Təhlükəsizliyi Sertifikatı', 'Mətbəx İqtisadiyyatı'],
    minExperienceYears: 6,
    maxExpectedSalary: 2000,
    requiredEducation: 'Orta-ixtisas / Kollec',
    requiredLanguages: ['Azərbaycan dili (Ana dili)', 'Türk dili (C1)'],
    conceptDescription: 'Yüksək qastronomik keyfiyyət, qida təhlükəsizliyi standartları və mətbəx xammalının dəqiq kalkulyasiyası konsepsiyası.',
    conceptKeywords: ['aşpaz', 'şef', 'mətbəx', 'haccp', 'menyu', 'restoran'],
  },
  {
    id: 'ent-security-guard',
    title: 'Mühafizəçi & Təhlükəsizlik Nəzarətçisi',
    department: 'Təhlükəsizlik və Nəzarət',
    seniorityLevel: 'Middle',
    requiredSkills: ['Nəzarət-Buraxılış Rejimi', 'CCTV Kamera Müşahidəsi', 'Yanğın Təhlükəsizliyi Qaydaları', 'Fiziki Hazırlıq', 'Gecə Növbəsi', 'Mühafizə Sertifikatı'],
    preferredSkills: ['İlk Tibbi Yardım', 'Konfliktlərin Həlli'],
    minExperienceYears: 3,
    maxExpectedSalary: 850,
    requiredEducation: 'Orta Təhsil',
    requiredLanguages: ['Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Şirkət ərazisinin, əmlakının və əməkdaşlarının 24/7 rejimində etibarlı fiziki mühafizəsi konsepsiyası.',
    conceptKeywords: ['mühafizə', 'təhlükəsizlik', 'cctv', 'nəzarət'],
  },
  {
    id: 'ent-driver-delivery',
    title: 'Sürücü-Ekspeditor (B, C kateqoriya)',
    department: 'Logistika və Nəqliyyat',
    seniorityLevel: 'Middle',
    requiredSkills: ['B, C Kateqoriyalı Sürücülük', 'Bakı Şəhərini Əla Tanıma', 'Yük Daşıma Təhlükəsizliyi', 'Sənədləşmə & Qaimə Təhvili', 'Avtomobilə Texniki Qulluq'],
    preferredSkills: ['Qəzasız Sürücülük Tarixçəsi', 'Naviqasiya Tətbiqləri'],
    minExperienceYears: 5,
    maxExpectedSalary: 1000,
    requiredEducation: 'Orta Təhsil',
    requiredLanguages: ['Azərbaycan dili (Ana dili)'],
    conceptDescription: 'Məhsulların və sənədlərin təyinat nöqtəsinə vaxtında, təhlükəsiz və operativ çatdırılması konsepsiyası.',
    conceptKeywords: ['sürücü', 'ekspeditor', 'çatdırılma', 'nəqliyyat'],
  },
];

/**
 * Creates dynamic RecruitmentCriteria from ANY selected position (enterprise catalog, active vacancy, or custom title)
 */
export function buildCriteriaForPosition(
  positionKey: string,
  customTitle?: string,
  existingVacancies?: Array<{ id: string; title: string; requirements?: string[]; experienceLevel?: string; minSalary?: number; maxSalary?: number; city?: string }>
): RecruitmentCriteria {
  // 1. Check if matches real company vacancy
  if (existingVacancies && existingVacancies.length > 0) {
    const matchedVacancy = existingVacancies.find(v => v.id === positionKey || v.title.toLowerCase().trim() === positionKey.toLowerCase().trim());
    if (matchedVacancy) {
      const isSenior = matchedVacancy.experienceLevel?.includes('Senior') || matchedVacancy.experienceLevel?.includes('Baş');
      const isMid = matchedVacancy.experienceLevel?.includes('Mid') || matchedVacancy.experienceLevel?.includes('Orta');
      return {
        id: `crit-vac-${matchedVacancy.id}`,
        targetJobId: matchedVacancy.id,
        targetJobTitle: matchedVacancy.title,
        seniorityLevel: isSenior ? 'Senior' : isMid ? 'Middle' : 'Junior',
        requiredSkills: matchedVacancy.requirements && matchedVacancy.requirements.length > 0
          ? matchedVacancy.requirements.slice(0, 6)
          : [matchedVacancy.title, 'Sahə Təcrübəsi', 'Praktiki Bilik'],
        preferredSkills: ['Komanda İşi', 'Məsuliyyət', 'Problem Həlli'],
        minExperienceYears: isSenior ? 4 : isMid ? 2 : 1,
        maxExpectedSalary: matchedVacancy.maxSalary || matchedVacancy.minSalary || 2000,
        requiredEducation: 'Bakalavr',
        requiredLanguages: ['Azərbaycan dili (Ana dili)'],
        preferredLocation: matchedVacancy.city || 'Bakı',
        weights: {
          skills: 35,
          experience: 20,
          jobTitleMatch: 15,
          salary: 10,
          education: 10,
          languages: 5,
          location: 5,
        },
        knockout: {
          requireMinExperience: false,
          strictSalaryCap: false,
          requireEducationLevel: false,
          requireAllMandatorySkills: false,
        },
        strictnessMode: 'balanced',
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // 2. Check enterprise positions catalog
  const catalogItem = ENTERPRISE_POSITIONS_CATALOG.find(p => p.id === positionKey || p.title.toLowerCase().trim() === positionKey.toLowerCase().trim());
  if (catalogItem) {
    return {
      id: `crit-${catalogItem.id}`,
      targetJobId: catalogItem.id,
      targetJobTitle: catalogItem.title,
      seniorityLevel: catalogItem.seniorityLevel,
      requiredSkills: catalogItem.requiredSkills,
      preferredSkills: catalogItem.preferredSkills,
      minExperienceYears: catalogItem.minExperienceYears,
      maxExpectedSalary: catalogItem.maxExpectedSalary,
      requiredEducation: catalogItem.requiredEducation,
      requiredLanguages: catalogItem.requiredLanguages,
      preferredLocation: 'Bakı',
      weights: catalogItem.weights || {
        skills: 35,
        experience: 20,
        jobTitleMatch: 15,
        salary: 10,
        education: 10,
        languages: 5,
        location: 5,
      },
      knockout: {
        requireMinExperience: false,
        strictSalaryCap: false,
        requireEducationLevel: false,
        requireAllMandatorySkills: false,
      },
      strictnessMode: 'balanced',
      updatedAt: new Date().toISOString(),
    };
  }

  // 3. Fallback for custom typed title
  const finalTitle = customTitle || positionKey || 'Mütəxəssis';
  return {
    id: `crit-custom-${Date.now()}`,
    targetJobId: 'custom',
    targetJobTitle: finalTitle,
    seniorityLevel: 'Middle',
    requiredSkills: [finalTitle, 'Sahə Təcrübəsi', 'Praktiki Bilik'],
    preferredSkills: ['Komanda İşi', 'Problem Həlli'],
    minExperienceYears: 2,
    maxExpectedSalary: 2000,
    requiredEducation: 'Bakalavr',
    requiredLanguages: ['Azərbaycan dili (Ana dili)'],
    preferredLocation: 'Bakı',
    weights: {
      skills: 35,
      experience: 20,
      jobTitleMatch: 15,
      salary: 10,
      education: 10,
      languages: 5,
      location: 5,
    },
    knockout: {
      requireMinExperience: false,
      strictSalaryCap: false,
      requireEducationLevel: false,
      requireAllMandatorySkills: false,
    },
    strictnessMode: 'balanced',
    updatedAt: new Date().toISOString(),
  };
}
