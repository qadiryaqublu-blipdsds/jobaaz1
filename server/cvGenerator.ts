import { CVData, ExperienceItem, EducationItem, SkillItem, LanguageItem, ProjectItem, CertificateItem } from '../src/types';

export interface GenerateCVRequest {
  jobTitle?: string;
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead';
  fullName?: string;
  city?: string;
  skillsSummary?: string;
  language?: 'az' | 'en' | 'ru';
  photoUrl?: string;
  rawPastedText?: string;
  hasImage?: boolean;
}

/**
 * Builds a comprehensive system & user prompt for Gemini to generate an ATS-optimized, high-impact CV
 */
export function buildGeminiCVPrompt(req: GenerateCVRequest): string {
  if (req.hasImage) {
    return `Sən ən yüksək səviyyəli peşəkar HR mütəxəssisi və CV tərtibatçısısan.
Təqdim olunmuş şəkildəki (CV sənədi, şəkil, diplom, sertifikat, qeydlər və ya profil fotosu/skrinşotu) bütün mətn və vizual məlumatları dəqiq oxu (OCR) və təhlil et.
${req.rawPastedText && req.rawPastedText.trim().length > 0 ? `İstifadəçinin əlavə yazdığı qeydlər:\n"${req.rawPastedText.trim()}"\n` : ''}

SƏNİN TAPŞIRIĞIN:
Şəkildəki bütün məlumatları (Ad, Soyad, Əlaqə nömrəsi, E-poçt, Şəhər, Peşə/Vəzifə, Haqqında/Xülasə, İş Təcrübələri, Təhsil, Bacarıqlar, Dillər, Layihələr, Sertifikatlar) çıxar və təmiz, ardıcıl, yüksək standartlı ATS-uyğun CV JSON strukturuna sal.

Vacib qaydalar:
1. Şəkildə mövcud olan ad, telefon, e-poçt, təhsil və iş yerlərini 100% dəqiqliklə oxu və çıxar.
2. İş təcrübələrini ardıcıl tarixlərlə (başlama-bitmə) düz, vəzifə öhdəliklərini isə ölçülə bilən nailiyyətlərlə zənginləşdirilmiş güclü maddə bəndləri (•) halında yaz.
3. Bacarıqları fərdi şəkildə kateqoriyalara ('Texniki', 'Soft skill', 'Alət / Proqram') böl.
4. Dilləri və səviyyələrini ('Ana dili', 'C1-C2 (Sərbəst)', 'B1-B2 (Orta/İşgüzar)', 'A1-A2 (Başlanğıc)') dəqiqləşdir.
5. Şəkildə çatışmayan hər hansı zəruri xülasə və ya təcrübə bəndlərini həmin ixtisasa tam uyğun şəkildə peşəkarca tamamla ki, nəticə tam və mükəmməl CV olsun.

ÇIXIŞ FORMATI:
YALNIZ AŞAĞIDAKI JSON STRUKTURUNDA CAVAB VER. HEÇ BİR İZAH VƏ YA ARTIQ SÖZ YAZMA:
{
  "personalInfo": {
    "fullName": "Ad Soyad",
    "jobTitle": "Vəzifə / İxtisas",
    "email": "email@example.com",
    "phone": "+994 ...",
    "address": "Bakı, Azərbaycan",
    "linkedin": "linkedin.com/in/...",
    "github": "",
    "portfolio": "",
    "summary": "Güclü və peşəkar 3-4 cümləlik xülasə..."
  },
  "experiences": [
    {
      "id": "exp-1",
      "company": "Şirkət",
      "position": "Vəzifə",
      "location": "Şəhər",
      "startDate": "2021",
      "endDate": "İndiyədək",
      "current": true,
      "description": "• Vəzifə və nailiyyət 1\\n• Vəzifə və nailiyyət 2"
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "Təhsil müəssisəsi",
      "degree": "Bakalavr",
      "fieldOfStudy": "İxtisas",
      "startDate": "2016",
      "endDate": "2020",
      "current": false,
      "gpa": ""
    }
  ],
  "skills": [
    {
      "id": "sk-1",
      "name": "Bacarıq",
      "level": "Yaxşı",
      "category": "Texniki"
    }
  ],
  "languages": [
    {
      "id": "lang-1",
      "language": "Azərbaycan dili",
      "proficiency": "Ana dili"
    }
  ],
  "projects": [],
  "certificates": []
}`;
  }

  if (req.rawPastedText && req.rawPastedText.trim().length > 10) {
    return `Sən ən yüksək səviyyəli peşəkar HR mütəxəssisi və CV tərtibatçısısan.
Aşağıda istifadəçinin sərbəst şəkildə yapışdırdığı (LinkedIn profili, köhnə CV, qeydlər, bioqrafiya və ya qarışıq mətn) məlumatlar verilmişdir:

--- İSTİFADƏÇİNİN YAPIŞDIRDIĞI MƏTN ---
${req.rawPastedText.trim()}
--- MƏTNİN SONU ---

SƏNİN TAPŞIRIĞIN:
Bu mətni dərindən analiz et və hər bir hissəni (Ad, Soyad, Əlaqə məlumatları, Şəhər, Peşə/Vəzifə, Haqqında/Xülasə, İş Təcrübələri, Təhsil, Bacarıqlar, Dillər, Layihələr, Sertifikatlar) təmiz, ardıcıl və qüsursuz CV formatına sal.

Vacib qaydalar:
1. Əgər mətndə ad-soyad tapılmazsa, mətndəki kontekstə uyğun layiqli bir ad və ya 'Namizəd' təyin et.
2. İş təcrübələrini ardıcıl tarixlərlə (başlama-bitmə) düz, vəzifə öhdəliklərini isə ölçülə bilən nailiyyətlərlə zənginləşdirilmiş güclü maddə bəndləri (•) halında yaz.
3. Bacarıqları fərdi şəkildə kateqoriyalara ('Texniki', 'Soft skill', 'Alət / Proqram') böl.
4. Dilləri və səviyyələrini ('Ana dili', 'C1-C2 (Sərbəst)', 'B1-B2 (Orta/İşgüzar)', 'A1-A2 (Başlanğıc)') dəqiqləşdir.
5. Mətndə hər hansı zəruri bölmə (məsələn güclü xülasə və ya təcrübə bəndləri) qeyd edilməyibsə, mətndəki ixtisasa tam uyğun şəkildə peşəkarca tamamla ki, nəticə tam və mükəmməl CV olsun.

ÇIXIŞ FORMATI:
YALNIZ AŞAĞIDAKI JSON STRUKTURUNDA CAVAB VER. HEÇ BİR İZAH VƏ YA ARTIQ SÖZ YAZMA:
{
  "personalInfo": {
    "fullName": "Ad Soyad",
    "jobTitle": "Vəzifə / İxtisas",
    "email": "email@example.com",
    "phone": "+994 ...",
    "address": "Bakı, Azərbaycan",
    "linkedin": "linkedin.com/in/...",
    "github": "",
    "portfolio": "",
    "summary": "Güclü və peşəkar 3-4 cümləlik xülasə..."
  },
  "experiences": [
    {
      "id": "exp-1",
      "company": "Şirkət",
      "position": "Vəzifə",
      "location": "Şəhər",
      "startDate": "2021",
      "endDate": "İndiyədək",
      "current": true,
      "description": "• Vəzifə və nailiyyət 1\\n• Vəzifə və nailiyyət 2"
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "Təhsil müəssisəsi",
      "degree": "Bakalavr",
      "fieldOfStudy": "İxtisas",
      "startDate": "2016",
      "endDate": "2020",
      "current": false,
      "gpa": ""
    }
  ],
  "skills": [
    {
      "id": "sk-1",
      "name": "Bacarıq",
      "level": "Yaxşı",
      "category": "Texniki"
    }
  ],
  "languages": [
    {
      "id": "lang-1",
      "language": "Azərbaycan dili",
      "proficiency": "Ana dili"
    }
  ],
  "projects": [],
  "certificates": []
}`;
  }

  const jobTitle = req.jobTitle?.trim() || 'Frontend Developer';
  const level = req.experienceLevel || 'mid';
  const fullName = req.fullName?.trim() || 'Əli Məmmədov';
  const city = req.city?.trim() || 'Bakı, Azərbaycan';
  const userNotes = req.skillsSummary?.trim() ? `Namizədin qeydləri və əsas bacarıqları: "${req.skillsSummary}"` : '';

  return `Sən peşəkar beynəlxalq HR eksperti və CV tərtibatçısısan.
Azərbaycan əmək bazarı və qlobal standartlar (ATS) üçün "${jobTitle}" vəzifəsində ${level} səviyyəli namizəd üçün mükəmməl, zəngin və tam strukturlaşdırılmış CV generasiya et.

NAMİZƏDİN MƏLUMATLARI:
- Ad və Soyad: ${fullName}
- Vəzifə / İxtisas: ${jobTitle}
- Təcrübə səviyyəsi: ${level} (Junior = 1-2 il, Mid = 3-5 il, Senior = 5-8 il, Lead = 8+ il)
- Şəhər: ${city}
${userNotes}

TƏLƏBLƏR:
1. Şəxsi xülasə (Summary): 3-4 cümləlik çox təsirli, nəticəyönümlü və peşəkar yazı.
2. İş təcrübəsi (Experiences): ${level === 'junior' ? '1-2' : level === 'mid' ? '2-3' : '3-4'} ədəd real və nüfuzlu şirkətlər (məsələn: PASHA Bank, Azercell, Kapital Bank, SOCAR, Bravo, Trendyol və ya tanınmış texnoloji/biznes şirkətləri).
   Hər təcrübə üçün:
   - company, position, location, startDate (MM.YYYY), endDate (MM.YYYY və ya 'İndiyədək'), current (boolean)
   - description: 3-4 ədəd ölçülə bilən göstəricili (məsələn: faizlər, qənaət, sürət artımı) güclü maddə bəndi (• simvolu ilə).
3. Təhsil (Education): 1-2 ədəd ali təhsil (məs: Bakı Dövlət Universiteti, ADA Universiteti, Bakı Ali Neft Məktəbi və ya UNEC), dərəcə (Bakalavr və ya Magistr), ixtisas, illər və GPA (məs: 3.6/4.0).
4. Bacarıqlar (Skills): ən azı 8-12 ədəd həmin vəzifəyə uyğun ən vacib bacarıq. Hər biri üçün:
   - name: bacarığın adı
   - level: 'Başlanğıc' | 'Orta' | 'Yaxşı' | 'Əla / Ekspert'
   - category: 'Texniki' | 'Soft skill' | 'Alət / Proqram'
5. Dillər (Languages): Azərbaycan dili (Ana dili), İngilis dili (məs: B2 və ya C1), Rus dili (məs: B1 və ya B2).
6. Layihələr (Projects): 2 ədəd həmin sahəyə aid uğurlu portfolio layihəsi (title, description, technologies).
7. Sertifikatlar (Certificates): 1-2 ədəd beynəlxalq və ya sahəvi sertifikat.

ÇIXIŞ FORMATI:
YALNIZ AŞAĞIDAKI STRUKTURDA TƏMİZ JSON FORMATINDA CAVAB VER. HEÇ BİR MARKDOWN İZAHI VƏ YA TƏKST ƏLAVƏ ETMƏ:

{
  "personalInfo": {
    "fullName": "${fullName}",
    "jobTitle": "${jobTitle}",
    "email": "namized@example.com",
    "phone": "+994 50 123 45 67",
    "address": "${city}",
    "linkedin": "linkedin.com/in/${fullName.toLowerCase().replace(/\\s+/g, '')}",
    "github": "github.com/${fullName.toLowerCase().replace(/\\s+/g, '')}",
    "portfolio": "portfolio-${fullName.toLowerCase().replace(/\\s+/g, '')}.az",
    "summary": "Peşəkar xülasə..."
  },
  "experiences": [
    {
      "id": "exp-1",
      "company": "Şirkət Adı",
      "position": "Vəzifə",
      "location": "Bakı, Azərbaycan",
      "startDate": "01.2021",
      "endDate": "İndiyədək",
      "current": true,
      "description": "• Nailiyyət 1\\n• Nailiyyət 2\\n• Nailiyyət 3"
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "Universitet Adı",
      "degree": "Bakalavr",
      "fieldOfStudy": "İxtisas adı",
      "startDate": "2016",
      "endDate": "2020",
      "current": false,
      "gpa": "3.7 / 4.0"
    }
  ],
  "skills": [
    {
      "id": "sk-1",
      "name": "Bacarıq adı",
      "level": "Əla / Ekspert",
      "category": "Texniki"
    }
  ],
  "languages": [
    {
      "id": "lang-1",
      "language": "Azərbaycan dili",
      "proficiency": "Ana dili"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "Layihə adı",
      "link": "https://layihe-linki.az",
      "description": "Layihənin məqsədi və nəticəsi",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "certificates": [
    {
      "id": "cert-1",
      "name": "Sertifikat adı",
      "issuer": "Təşkilat adı",
      "issueDate": "2023",
      "credentialUrl": ""
    }
  ]
}`;
}

/**
 * Intelligent domain knowledge base for fallback generation
 */
interface ProfessionPreset {
  summary: string;
  experiences: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: Array<{
    name: string;
    level: 'Başlanğıc' | 'Orta' | 'Yaxşı' | 'Əla / Ekspert';
    category: 'Texniki' | 'Soft skill' | 'Alət / Proqram';
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    issueDate: string;
  }>;
}

const PRESETS: Record<string, ProfessionPreset> = {
  developer: {
    summary: 'Müasir proqram təminatı arxitekturası, təmiz kod prinsipləri və miqyaslana bilən tətbiqlərin yaradılmasında 4+ il zəngin təcrübəyə malik Mühəndis. Yüksək yüklü sistemlərin optimallaşdırılması, mikroxidmət arxitekturası və CI/CD konveyerlərinin qurulması üzrə ixtisaslaşmışam. Komanda ruhuna və biznes tələblərinin texniki həllinə fokuslanıram.',
    experiences: [
      {
        company: 'PASHA Bank OJSC',
        position: 'Senior Software Engineer',
        location: 'Bakı, Azərbaycan',
        startDate: '02.2022',
        endDate: 'İndiyədək',
        current: true,
        bullets: [
          '• Rəqəmsal bankçılıq platformasının əsas modullarının arxitekturasını qurdum, səhifə yüklənmə sürətini 42% artırdım.',
          '• 10+ nəfərlik çevik (Agile/Scrum) mühəndislik komandasında texniki liderlik və kod yoxlanışı (Code Review) həyata keçirdim.',
          '• RESTful və GraphQL API inteqrasiyaları ilə əməliyyatların gecikmə müddətini (latency) 120ms-dən 35ms-ə endirdim.',
          '• Avtomatlaşdırılmış test örtüyünü (Unit & Integration) 85%-ə yüksəldərək istehsalatdakı xətaları minimuma endirdim.'
        ]
      },
      {
        company: 'Azercell Telecom',
        position: 'Software Developer',
        location: 'Bakı, Azərbaycan',
        startDate: '08.2019',
        endDate: '01.2022',
        current: false,
        bullets: [
          '• Abunəçi xidmətləri və faktura hesablaşma sistemlərinin frontend və backend komponentlərini tərtib etdim.',
          '• Mikroxidmət arxitekturasına keçid prosesində 5 əsas xidmətin miqrasiyasında birbaşa iştirak etdim.',
          '• Docker və Kubernetes vasitəsilə tətbiqin konteynerləşdirilməsini və avtomatlaşdırılmış yerləşdirilməsini təmin etdim.'
        ]
      }
    ],
    education: [
      {
        institution: 'ADA Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'Kompüter Elmləri və Mühəndisliyi',
        startDate: '2015',
        endDate: '2019',
        gpa: '3.78 / 4.0'
      }
    ],
    skills: [
      { name: 'TypeScript & JavaScript', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'React.js & Next.js', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'Node.js & Express', level: 'Yaxşı', category: 'Texniki' },
      { name: 'PostgreSQL & MongoDB', level: 'Yaxşı', category: 'Texniki' },
      { name: 'Docker & CI/CD', level: 'Yaxşı', category: 'Alət / Proqram' },
      { name: 'Git / GitHub', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
      { name: 'Problem Həlli və Analitika', level: 'Əla / Ekspert', category: 'Soft skill' },
      { name: 'Agile / Scrum Metodologiyası', level: 'Əla / Ekspert', category: 'Soft skill' }
    ],
    projects: [
      {
        title: 'B2B Fintech Ödəniş Gateway-i',
        description: 'Müəssisələr üçün real-vaxt tranzaksiya izləmə və təhlükəsiz ödəniş emalı sistemi.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS']
      },
      {
        title: 'Korporativ İstedad və Vakansiya İdarəetmə Portalı',
        description: 'Namizədlərin müraciətlərini avtomatlaşdıran və ATS filtrasiyası aparan platforma.',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase']
      }
    ],
    certificates: [
      { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', issueDate: '2023' },
      { name: 'Professional Scrum Master (PSM I)', issuer: 'Scrum.org', issueDate: '2022' }
    ]
  },
  marketing: {
    summary: 'Rəqəmsal marketinq, brend kommunikasiyası və performans strategiyaları üzrə 5 il uğurlu təcrübəyə malik Marketinq Meneceri. Məlumatlara əsaslanan (data-driven) kampaniyalar, sosial media idarəçiliyi və ROI göstəricilərinin 35%-dən çox artırılmasında sübut olunmuş nailiyyətlər. Güclü büdcə planlaşdırması və komanda liderliyi səriştəsi.',
    experiences: [
      {
        company: 'Bravo Supermarketlər Şəbəkəsi',
        position: 'Rəqəmsal Marketinq Meneceri',
        location: 'Bakı, Azərbaycan',
        startDate: '03.2021',
        endDate: 'İndiyədək',
        current: true,
        bullets: [
          '• Aylıq 100,000+ AZN reklam büdcəsinin idarə edilməsi və CAC (müştəri cəlbetmə dəyəri) göstəricisinin 28% azaldılması.',
          '• Çoxkanallı omnichannel kampaniyalar vasitəsilə tətbiq yüklənmələrini 150,000-dən yuxarı çatdırdım.',
          '• Sosial media orqanik izləyici kütləsini 12 ay ərzində 45% artıraraq brend sədaqətini gücləndirdim.',
          '• Tərəfdaşlıq və sponsorluq layihələri ilə əlavə satış gəlirlərinin 20% yüksəlməsini təmin etdim.'
        ]
      },
      {
        company: 'Kapital Bank',
        position: 'Marketing & Brand Specialist',
        location: 'Bakı, Azərbaycan',
        startDate: '01.2019',
        endDate: '02.2021',
        current: false,
        bullets: [
          '• Pərakəndə bank məhsullarının rəqəmsal təşviqi və SEO/SEM strategiyasının icrası.',
          '• Google Ads və Meta Ads kampaniyalarının konversiya dərəcəsini (CR) 2.4%-dən 4.1%-ə çatdırdım.',
          '• Müştəri seqmentasiyası və e-poçt marketinq avtomatlaşdırmasını qurdum.'
        ]
      }
    ],
    education: [
      {
        institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)',
        degree: 'Bakalavr',
        fieldOfStudy: 'Marketinq və Menecment',
        startDate: '2014',
        endDate: '2018',
        gpa: '3.65 / 4.0'
      }
    ],
    skills: [
      { name: 'Meta Ads & Google Ads', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
      { name: 'Google Analytics 4 & Looker', level: 'Yaxşı', category: 'Alət / Proqram' },
      { name: 'Məzmun Strategiyası & Copywriting', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'SEO & ASO Optimizasiyası', level: 'Yaxşı', category: 'Texniki' },
      { name: 'Büdcə və ROI Analitikası', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'Strateji Ünsiyyət və Danışıqlar', level: 'Əla / Ekspert', category: 'Soft skill' },
      { name: 'Kreativ Komanda Liderliyi', level: 'Yaxşı', category: 'Soft skill' }
    ],
    projects: [
      {
        title: 'Bahar Həftəsi Orqanik Virallıq Kampaniyası',
        description: 'Sosial şəbəkələrdə 1.2 milyon baxış toplayan interaktiv istifadəçi məzmunu (UGC) kampaniyası.',
        technologies: ['Meta Ads', 'TikTok Ads', 'Canva', 'Google Analytics']
      }
    ],
    certificates: [
      { name: 'Google Digital Marketing Professional', issuer: 'Google / Coursera', issueDate: '2022' },
      { name: 'Meta Certified Digital Marketing Associate', issuer: 'Meta', issueDate: '2023' }
    ]
  },
  finance: {
    summary: 'Maliyyə hesabatlılığı, IFRS (MHBS) standartları, vergi qanunvericiliyi və korporativ büdcələmə üzrə 6+ il mütərəqqi təcrübəyə malik Baş Mühasib / Maliyyə Analitiki. Xərclərin optimallaşdırılması, daxili audit və 1C 8.3 proqramında mürəkkəb əməliyyatların aparılması sahəsində dərin biliklər. Analitik qərarvermə və dəqiqlik nümayiş etdirirəm.',
    experiences: [
      {
        company: 'SOCAR Upstream Management',
        position: 'Aparıcı Maliyyə Mütəxəssisi',
        location: 'Bakı, Azərbaycan',
        startDate: '06.2020',
        endDate: 'İndiyədək',
        current: true,
        bullets: [
          '• Beynəlxalq Maliyyə Hesabatı Standartlarına (IFRS) uyğun dövri konsolidasiya edilmiş hesabatların hazırlanması.',
          '• Vergi Məcəlləsinə uyğun vergi bəyannamələrinin vaxtında və qüsursuz tərtib edilməsi.',
          '• İllik büdcə kənarlaşmalarının analizi ilə əməliyyat xərclərində 15% qənaət təkliflərinin irəli sürülməsi.',
          '• Xarici və daxili audit yoxlamalarının müvəffəqiyyətlə və heç bir cəriməsiz tamamlanması.'
        ]
      },
      {
        company: 'Deloitte & Touche Azerbaijan',
        position: 'Audit Konsultantı',
        location: 'Bakı, Azərbaycan',
        startDate: '09.2017',
        endDate: '05.2020',
        current: false,
        bullets: [
          '• Bank, sənaye və pərakəndə sektorlarındakı iri müştərilərin maliyyə hesabatlarının yoxlanılması.',
          '• Daxili nəzarət mexanizmlərinin qiymətləndirilməsi və risk xəritələrinin formalaşdırılması.'
        ]
      }
    ],
    education: [
      {
        institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)',
        degree: 'Magistr',
        fieldOfStudy: 'Maliyyə və Vergi Uçotu',
        startDate: '2017',
        endDate: '2019',
        gpa: '3.85 / 4.0'
      }
    ],
    skills: [
      { name: '1C: Müəssisə 8.3 & ERP', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
      { name: 'IFRS / MHBS Standartları', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'Azərbaycan Vergi Qanunvericiliyi', level: 'Əla / Ekspert', category: 'Texniki' },
      { name: 'MS Excel (VBA & Power Query)', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
      { name: 'Maliyyə Modelləşdirilməsi', level: 'Yaxşı', category: 'Texniki' },
      { name: 'Audit & Daxili Nəzarət', level: 'Yaxşı', category: 'Texniki' },
      { name: 'Yüksək Dəqiqlik və Məsuliyyət', level: 'Əla / Ekspert', category: 'Soft skill' }
    ],
    projects: [
      {
        title: 'Maliyyə Uçotunun Avtomatlaşdırılması Layihəsi',
        description: 'Əl ilə daxil edilən hesablaşmaların 1C sisteminə avtomatik inteqrasiyası ilə əmək sərfiyyatının 50% azaldılması.',
        technologies: ['1C 8.3', 'Excel Power Query', 'SQL']
      }
    ],
    certificates: [
      { name: 'ACCA (Applied Knowledge & Skills)', issuer: 'ACCA Global', issueDate: '2021' },
      { name: 'Peşəkar Mühasib Sertifikatı (PMS)', issuer: 'Dövlət İmtahan Mərkəzi', issueDate: '2022' }
    ]
  }
};

/**
 * Generates an ultra-realistic, detailed fallback CV tailored to user inputs
 */
export function generateRealisticFallbackCV(req: GenerateCVRequest): CVData {
  let jobTitle = req.jobTitle?.trim() || '';
  let fullName = req.fullName?.trim() || '';
  let city = req.city?.trim() || 'Bakı, Azərbaycan';
  let email = '';
  let phone = '';
  let linkedin = '';
  let github = '';
  let extractedSummary = '';
  const now = new Date().toISOString();

  // If raw pasted text is present, extract rich factual details from it
  if (req.rawPastedText && req.rawPastedText.trim().length > 10) {
    const text = req.rawPastedText.trim();
    
    // Email regex
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    // Phone regex
    const phoneMatch = text.match(/(?:\+?994|0)?\s*(?:50|51|55|70|77|99|12)\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}/);
    if (phoneMatch) phone = phoneMatch[0].trim();

    // LinkedIn regex
    const liMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
    if (liMatch) linkedin = liMatch[0];

    // GitHub regex
    const ghMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/);
    if (ghMatch) github = ghMatch[0];

    // Lines analysis
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      // Often first non-empty line without colons or emails is candidate name
      const firstLine = lines[0];
      if (!fullName && firstLine.length < 40 && !firstLine.includes('@') && !firstLine.includes(':')) {
        fullName = firstLine;
      }
    }
    if (lines.length > 1 && !jobTitle) {
      const secondLine = lines[1];
      if (secondLine.length < 50 && !secondLine.includes('@') && !secondLine.includes(':')) {
        jobTitle = secondLine;
      }
    }

    // Try finding summary paragraph
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    for (const p of paragraphs) {
      if (p.length > 60 && !p.includes('@') && !p.startsWith('•') && !p.startsWith('-')) {
        extractedSummary = p;
        break;
      }
    }
  }

  if (!fullName) fullName = 'Əli Məmmədov';
  if (!jobTitle) jobTitle = 'Mütəxəssis';

  const titleLower = jobTitle.toLowerCase();
  let presetKey = 'developer';
  if (titleLower.includes('market') || titleLower.includes('satış') || titleLower.includes('sales') || titleLower.includes('pr') || titleLower.includes('smm')) {
    presetKey = 'marketing';
  } else if (titleLower.includes('mühasib') || titleLower.includes('maliyy') || titleLower.includes('audit') || titleLower.includes('finance') || titleLower.includes('iqtisad')) {
    presetKey = 'finance';
  }

  const preset = PRESETS[presetKey] || PRESETS.developer;
  const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    id: `cv-${Date.now()}`,
    title: `${jobTitle} — ${fullName}`,
    lastUpdated: now,
    personalInfo: {
      fullName,
      jobTitle,
      email: email || `${username || 'namized'}@example.com`,
      phone: phone || '+994 50 234 56 78',
      address: city,
      linkedin: linkedin || `linkedin.com/in/${username || 'profil'}`,
      github: github || (presetKey === 'developer' ? `github.com/${username || 'code'}` : undefined),
      portfolio: `portfolio-${username || 'namized'}.az`,
      summary: extractedSummary || preset.summary.replace(/Mühəndis|Mütəxəssis|Menecer/, jobTitle),
      photoUrl: req.photoUrl || undefined
    },
    experiences: preset.experiences.map((exp, idx) => ({
      id: `exp-${idx + 1}`,
      company: exp.company,
      position: idx === 0 ? jobTitle : exp.position,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.bullets.join('\n')
    })),
    education: preset.education.map((edu, idx) => ({
      id: `edu-${idx + 1}`,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: false,
      gpa: edu.gpa
    })),
    skills: preset.skills.map((sk, idx) => ({
      id: `sk-${idx + 1}`,
      name: sk.name,
      level: sk.level,
      category: sk.category
    })),
    languages: [
      { id: 'lang-1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'lang-2', language: 'İngilis dili', proficiency: 'C1-C2 (Sərbəst)' },
      { id: 'lang-3', language: 'Rus dili', proficiency: 'B1-B2 (Orta/İşgüzar)' }
    ],
    projects: preset.projects.map((proj, idx) => ({
      id: `proj-${idx + 1}`,
      title: proj.title,
      link: `https://layihe-${idx + 1}.az`,
      description: proj.description,
      technologies: proj.technologies
    })),
    certificates: preset.certificates.map((cert, idx) => ({
      id: `cert-${idx + 1}`,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      credentialUrl: ''
    }))
  };
}

/**
 * Sanitizes and validates arbitrary parsed JSON into guaranteed CVData
 */
export function sanitizeParsedCV(raw: any, fallbackReq: GenerateCVRequest): CVData {
  if (!raw || typeof raw !== 'object') {
    return generateRealisticFallbackCV(fallbackReq);
  }

  const defaultCV = generateRealisticFallbackCV(fallbackReq);
  const p = raw.personalInfo || {};

  return {
    id: raw.id || `cv-${Date.now()}`,
    title: raw.title || `${p.jobTitle || fallbackReq.jobTitle} — ${p.fullName || fallbackReq.fullName || 'Namizəd'}`,
    lastUpdated: new Date().toISOString(),
    personalInfo: {
      fullName: String(p.fullName || fallbackReq.fullName || defaultCV.personalInfo.fullName).trim(),
      jobTitle: String(p.jobTitle || fallbackReq.jobTitle || defaultCV.personalInfo.jobTitle).trim(),
      email: String(p.email || defaultCV.personalInfo.email).trim(),
      phone: String(p.phone || defaultCV.personalInfo.phone).trim(),
      address: String(p.address || fallbackReq.city || defaultCV.personalInfo.address).trim(),
      linkedin: p.linkedin ? String(p.linkedin).trim() : defaultCV.personalInfo.linkedin,
      github: p.github ? String(p.github).trim() : defaultCV.personalInfo.github,
      portfolio: p.portfolio ? String(p.portfolio).trim() : defaultCV.personalInfo.portfolio,
      summary: String(p.summary || defaultCV.personalInfo.summary).trim(),
      photoUrl: fallbackReq.photoUrl || p.photoUrl || undefined
    },
    experiences: Array.isArray(raw.experiences) && raw.experiences.length > 0
      ? raw.experiences.map((e: any, i: number): ExperienceItem => ({
          id: e.id || `exp-${i + 1}`,
          company: String(e.company || 'Şirkət').trim(),
          position: String(e.position || fallbackReq.jobTitle).trim(),
          location: String(e.location || 'Bakı, Azərbaycan').trim(),
          startDate: String(e.startDate || '2021').trim(),
          endDate: String(e.endDate || 'İndiyədək').trim(),
          current: !!e.current || String(e.endDate).toLowerCase().includes('indiyədək'),
          description: Array.isArray(e.description)
            ? e.description.join('\n')
            : String(e.description || '• Əsas vəzifə və öhdəliklər icra edildi.')
        }))
      : defaultCV.experiences,
    education: Array.isArray(raw.education) && raw.education.length > 0
      ? raw.education.map((ed: any, i: number): EducationItem => ({
          id: ed.id || `edu-${i + 1}`,
          institution: String(ed.institution || 'Universitet').trim(),
          degree: String(ed.degree || 'Bakalavr').trim(),
          fieldOfStudy: String(ed.fieldOfStudy || 'Kompüter Elmləri / İqtisadiyyat').trim(),
          startDate: String(ed.startDate || '2016').trim(),
          endDate: String(ed.endDate || '2020').trim(),
          current: !!ed.current,
          gpa: ed.gpa ? String(ed.gpa).trim() : undefined
        }))
      : defaultCV.education,
    skills: Array.isArray(raw.skills) && raw.skills.length > 0
      ? raw.skills.map((s: any, i: number): SkillItem => ({
          id: s.id || `sk-${i + 1}`,
          name: typeof s === 'string' ? s : String(s.name || 'Bacarıq').trim(),
          level: ['Başlanğıc', 'Orta', 'Yaxşı', 'Əla / Ekspert'].includes(s.level)
            ? s.level
            : 'Yaxşı',
          category: ['Texniki', 'Soft skill', 'Alət / Proqram'].includes(s.category)
            ? s.category
            : 'Texniki'
        }))
      : defaultCV.skills,
    languages: Array.isArray(raw.languages) && raw.languages.length > 0
      ? raw.languages.map((l: any, i: number): LanguageItem => ({
          id: l.id || `lang-${i + 1}`,
          language: typeof l === 'string' ? l : String(l.language || 'Azərbaycan dili').trim(),
          proficiency: ['A1-A2 (Başlanğıc)', 'B1-B2 (Orta/İşgüzar)', 'C1-C2 (Sərbəst)', 'Ana dili'].includes(l.proficiency)
            ? l.proficiency
            : 'Ana dili'
        }))
      : defaultCV.languages,
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((pr: any, i: number): ProjectItem => ({
          id: pr.id || `proj-${i + 1}`,
          title: String(pr.title || 'Layihə').trim(),
          link: pr.link ? String(pr.link).trim() : undefined,
          description: String(pr.description || '').trim(),
          technologies: Array.isArray(pr.technologies) ? pr.technologies.map(String) : []
        }))
      : defaultCV.projects,
    certificates: Array.isArray(raw.certificates)
      ? raw.certificates.map((c: any, i: number): CertificateItem => ({
          id: c.id || `cert-${i + 1}`,
          name: String(c.name || 'Sertifikat').trim(),
          issuer: String(c.issuer || 'Təşkilat').trim(),
          issueDate: String(c.issueDate || '2023').trim(),
          credentialUrl: c.credentialUrl ? String(c.credentialUrl).trim() : undefined
        }))
      : defaultCV.certificates
  };
}
