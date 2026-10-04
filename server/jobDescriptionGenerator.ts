export interface OfficialJobDescriptionRequest {
  companyName: string;
  industry?: string;
  department?: string;
  jobTitle: string;
  reportsTo?: string;
  subordinates?: string;
  workMode?: string;
  purpose?: string;
  experienceLevel?: string;
  educationRequirement?: string;
  customNotes?: string;
}

export interface FunctionalDuties {
  daily: string[];
  weekly: string[];
  monthly: string[];
}

export interface KpiMetric {
  kpiName: string;
  measurementUnit: string;
  measurementPeriod: string;
  targetScore: string;
}

export interface OfficialJobDescription {
  documentTitle: string;
  companyName: string;
  department: string;
  jobTitle: string;
  reportsTo: string;
  subordinates: string;
  workMode: string;
  sections: {
    generalProvisions: string[];
    jobPurpose: string;
    keyResponsibilities: string[];
    functionalDuties: FunctionalDuties;
    rightsAndAuthorities: string[];
    responsibilitiesAndLiabilities: string[];
    requiredSkillsAndKnowledge: string[];
    educationAndExperience: {
      education: string;
      experience: string;
      languages: string[];
      certifications: string[];
    };
    reportingHierarchy: string;
    interdepartmentalRelations: string[];
    kpisAndPerformanceMetrics: KpiMetric[];
    finalProvisions: string[];
  };
  approvalSection: {
    approverTitle: string;
    approverName: string;
    approvalDate: string;
    employeeAcknowledgement: string;
  };
}

export function buildOfficialJobDescriptionPrompt(req: OfficialJobDescriptionRequest): string {
  return `Sən Azərbaycan Respublikasının Əmək Qanunvericiliyi və beynəlxalq HR idarəetmə standartları üzrə yüksək səviyyəli Baş HR Mütəxəssisisən.
İşəgötürən üçün aşağıdakı parametrlər üzrə 12 BƏNDDƏN İBARƏT RƏSMİ VƏ DƏRİN VƏZİFƏ TƏLİMATI (Job Description Document) sənədi hazırla.

ŞİRKƏT VƏ VƏZİFƏ PARAMETRLƏRİ:
- Şirkətin adı: "${req.companyName || 'Müəssisə'}"
- Fəaliyyət sahəsi / Sektor: "${req.industry || 'Ümumi Biznes'}"
- Departament / Şöbə: "${req.department || 'Müvafiq Şöbə'}"
- Vəzifənin tam adı: "${req.jobTitle || 'Mütəxəssis'}"
- Vəzifənin tabe olduğu şəxs: "${req.reportsTo || 'Şöbə Müdiri / Direktor'}"
- Birbaşa tabeliyində olan vəzifələr: "${req.subordinates || 'Tabeliyində işçi yoxdur'}"
- İş rejimi: "${req.workMode || 'Tam ştat (Ofis / Hibrid)'}"
- Təcrübə səviyyəsi: "${req.experienceLevel || 'Orta (1-3 il)'}"
- Təhsil tələbi: "${req.educationRequirement || 'Ali təhsil'}"
${req.purpose ? `- Vəzifənin məqsədi haqqında qeyd: "${req.purpose}"` : ''}
${req.customNotes ? `- Əlavə tələb və qeydlər: "${req.customNotes}"` : ''}

TƏLƏB OLUNAN 12 RƏSMİ BÖLMƏ:
1. Ümumi müddəalar (General Provisions) - Vəzifənin statusu, təyinat qaydası, əvəzetmə və hüquqi əsasları (3-4 maddə).
2. Vəzifənin məqsədi (Job Purpose) - Vəzifənin təşkilatdakı əsas rolu və biznesə töhfəsi.
3. Əsas vəzifə öhdəlikləri (Key Responsibilities) - 5-7 əsas məsuliyyət istiqaməti.
4. Funksional vəzifələr (Functional Duties) - Gündəlik (daily), Həftəlik (weekly) və Aylıq (monthly) konkret vəzifələr.
5. Hüquq və səlahiyyətlər (Rights and Authorities) - Qərar qəbul etmə, tələb etmə, təklif vermə hüquqları (4-5 bənd).
6. Məsuliyyət (Responsibilities and Liabilities) - İntizam, maddi, kommersiya sirri və fəaliyyət məsuliyyəti (4-5 bənd).
7. Tələb olunan bilik və bacarıqlar (Skills & Knowledge) - Texniki və idarəetmə bacarıqları (6-8 maddə).
8. Təhsil və iş təcrübəsi (Education & Experience) - Təhsil dərəcəsi, iş stajı, dillər, sertifikatlar.
9. Tabelik və hesabatlılıq (Reporting Hierarchy) - Kimə hesabat verir, əvəzedici şəxs.
10. Digər şöbələrlə qarşılıqlı əlaqələr (Interdepartmental Relations) - Daxili və xarici tərəfdaşlarla əməkdaşlıq xətləri.
11. KPI və performans göstəriciləri (KPIs & Performance Metrics) - 3-4 ədəd ölçülə bilən dəqiq KPI (ad, ölçü vahidi, dövr və hədəf göstərici).
12. Yekun müddəalar və təsdiq bölməsi (Final Provisions & Approval) - Qüvvəyə minmə və arxivləşdirmə qaydası.

ÇIXIŞ FORMATI:
YALNIZ AŞAĞIDAKI JSON STRUKTURUNDA VƏ AZƏRBAYCAN DİLİNDƏ CAVAB VER:
{
  "documentTitle": "VƏZİFƏ TƏLİMATI",
  "companyName": "${req.companyName || 'Müəssisə'}",
  "department": "${req.department || 'Müvafiq Şöbə'}",
  "jobTitle": "${req.jobTitle || 'Mütəxəssis'}",
  "reportsTo": "${req.reportsTo || 'Şöbə Müdiri'}",
  "subordinates": "${req.subordinates || 'Tabeliyində işçi yoxdur'}",
  "workMode": "${req.workMode || 'Tam ştat'}",
  "sections": {
    "generalProvisions": [
      "string 1",
      "string 2"
    ],
    "jobPurpose": "string",
    "keyResponsibilities": [
      "string 1",
      "string 2"
    ],
    "functionalDuties": {
      "daily": ["string 1", "string 2"],
      "weekly": ["string 1", "string 2"],
      "monthly": ["string 1", "string 2"]
    },
    "rightsAndAuthorities": [
      "string 1",
      "string 2"
    ],
    "responsibilitiesAndLiabilities": [
      "string 1",
      "string 2"
    ],
    "requiredSkillsAndKnowledge": [
      "string 1",
      "string 2"
    ],
    "educationAndExperience": {
      "education": "string",
      "experience": "string",
      "languages": ["Azərbaycan dili (Sərbəst)", "İngilis dili (İşgüzar)"],
      "certifications": ["Müvafiq peşəkar sertifikat"]
    },
    "reportingHierarchy": "string",
    "interdepartmentalRelations": [
      "string 1",
      "string 2"
    ],
    "kpisAndPerformanceMetrics": [
      {
        "kpiName": "string",
        "measurementUnit": "% və ya Ədəd",
        "measurementPeriod": "Aylıq / Rüblük",
        "targetScore": "95%"
      }
    ],
    "finalProvisions": [
      "string 1",
      "string 2"
    ]
  },
  "approvalSection": {
    "approverTitle": "Baş İcraçı Direktor",
    "approverName": "Rəhbərlik",
    "approvalDate": "${new Date().toLocaleDateString('az-AZ')}",
    "employeeAcknowledgement": "Vəzifə təlimatının bir nüsxəsini aldım, oxudum və icra üçün qəbul etdim."
  }
}`;
}

export function generateRealisticFallbackJobDescription(req: OfficialJobDescriptionRequest): OfficialJobDescription {
  const company = req.companyName || 'Müəssisə';
  const title = req.jobTitle || 'Mütəxəssis';
  const dept = req.department || 'Əməliyyat Şöbəsi';
  const reportsTo = req.reportsTo || 'Şöbə Müdiri / İcraçı Direktor';
  const subordinates = req.subordinates || 'Tabeliyində işçi yoxdur';
  const workMode = req.workMode || 'Tam ştat (09:00 - 18:00)';

  return {
    documentTitle: 'RƏSMİ VƏZİFƏ TƏLİMATI',
    companyName: company,
    department: dept,
    jobTitle: title,
    reportsTo,
    subordinates,
    workMode,
    sections: {
      generalProvisions: [
        `Bu vəzifə təlimatı "${company}" təşkilati strukturuna uyğun olaraq ${dept} tərkibindəki "${title}" vəzifəsinin hüquqi statusunu, xidməti vəzifələrini, hüquqlarını və məsuliyyətini müəyyən edir.`,
        `"${title}" vəzifəsinə təyinat və vəzifədən azad edilmə Azərbaycan Respublikasının Əmək Məcəlləsinə uyğun olaraq Baş İcraçı Direktorun əmri ilə həyata keçirilir.`,
        `"${title}" birbaşa ${reportsTo} tabeliyindədir və öz fəaliyyətində Azərbaycan Respublikasının qanunvericiliyini, Şirkətin Nizamnaməsini və daxili intizam qaydalarını rəhbər tutur.`,
        `"${title}" ezamiyyətdə, məzuniyyətdə və ya əmək qabiliyyətini müvəqqəti itirdikdə onun vəzifə səlahiyyətləri rəhbərliyin müvafiq əmri ilə təyin olunmuş əməkdaşa həvalə olunur.`
      ],
      jobPurpose: `"${title}" vəzifəsinin əsas məqsədi "${company}" strategiyasına uyğun olaraq ${dept} üzrə biznes proseslərinin fasiləsiz, yüksək keyfiyyətli və səmərəli icrasını təmin etmək, müəyyən edilmiş hədəf və KPI göstəricilərinə vaxtında nail olmaqdır.`,
      keyResponsibilities: [
        `${title} vəzifəsi üzrə müəyyən edilmiş gündəlik, həftəlik və aylıq əməliyyat tapşırıqlarını vaxtında və keyfiyyətlə icra etmək.`,
        `Fəaliyyət istiqaməti üzrə sənədləşməni və hesabatlılığı şirkət standartlarına tam uyğun aparmaq.`,
        `Daxili proseslərin optimallaşdırılması və xərclərə qənaət üzrə mütəmadi təkliflər irəli sürmək.`,
        `Tərəfdaşlar, müştərilər və digər şöbələrlə peşəkar, etik və operativ işgüzar əlaqələri qorumaq.`,
        `Təhlükəsizlik qaydalarına, əmək intizamına və kommersiya sirrinin qorunmasına qeyd-şərtsiz riayət etmək.`
      ],
      functionalDuties: {
        daily: [
          `Gündəlik iş planını müəyyən etmək və cari əməliyyat tapşırıqlarını icra etmək.`,
          `Gələn sənədləri, elektron məktubları və daxili müraciətləri operativ cavablandırmaq.`,
          `Cari layihələr və fəaliyyət üzrə ilkin yoxlamaları və keyfiyyət nəzarətini həyata keçirmək.`
        ],
        weekly: [
          `Həftəlik görülmüş işlər haqqında hesabat hazırlayıb ${reportsTo} təqdim etmək.`,
          `Şöbənin həftəlik koordinasiya iclaslarında iştirak etmək və hədəfləri müzakirə etmək.`,
          `Həftəlik planlaşdırmanı nəzərdən keçirərək riskləri öncədən müəyyənləşdirmək.`
        ],
        monthly: [
          `Aylıq icra hesabatlarını və KPI nəticələrini təhlil edib təqdim etmək.`,
          `Gələn ay üçün fəaliyyət planı və resurs bölgüsü təkliflərini hazırlamaq.`,
          `Aidiyyəti sənəd dövriyyəsini arxivləşdirmək və təhvil vermək.`
        ]
      },
      rightsAndAuthorities: [
        `Öz vəzifə öhdəliklərini icra etmək üçün tələb olunan məlumatları və sənədləri digər struktur bölmələrdən tələb etmək.`,
        `İş proseslərinin təkmilləşdirilməsi və xidmət keyfiyyətinin yüksəldilməsi üzrə rəhbərliyə rəsmi təkliflər vermək.`,
        `Vəzifə səlahiyyətləri daxilində sənədləri imzalamaq və ya vizalamaq.`,
        `Peşəkar fəaliyyəti üçün normal iş şəraiti və texniki vasitələrlə təmin olunmasını rəhbərlikdən tələb etmək.`
      ],
      responsibilitiesAndLiabilities: [
        `Vəzifə təlimatında nəzərdə tutulmuş öhdəliklərin vaxtında və lazımi qaydada icra edilməməsinə görə birbaşa intizam məsuliyyəti daşıyır.`,
        `Şirkətin kommersiya və konfidensial məlumatlarının yayılmasına görə qanunvericilik qarşısında məsuliyyət daşıyır.`,
        `Şirkətə məxsus maddi və texniki vəsaitlərin qorunmasına və düzgün istismarına görə maddi məsuliyyət daşıyır.`,
        `Əmək intizamı, yanğın təhlükəsizliyi və daxili korporativ davranış qaydalarına əməl olunmasına görə məsuliyyət daşıyır.`
      ],
      requiredSkillsAndKnowledge: [
        `${title} sahəsində müasir metodologiyalar, standartlar və bazar praktikası bilikləri.`,
        `Biznes yazışmaları, analitik düşüncə və problemlərin səmərəli həlli bacarığı.`,
        `Kompüter və ofis proqram təminatlarından (MS Office, ERP/CRM və ixtisas proqramları) peşəkar istifadə.`,
        `Komandada işləmək, yüksək məsuliyyət və vaxtın effektiv idarə edilməsi (Time management).`,
        `Stresə davamlılıq, dəqiqlik və nəticəyönümlülük kompetensiyası.`
      ],
      educationAndExperience: {
        education: req.educationRequirement || 'Müvafiq ixtisas üzrə Ali Təhsil (Bakalavr və ya Magistr)',
        experience: req.experienceLevel || 'Müvafiq sahədə ən azı 1-3 il peşəkar iş təcrübəsi',
        languages: ['Azərbaycan dili (Əla / Sərbəst)', 'İngilis dili (İşgüzar / Texniki)', 'Rus dili (Arzuolunandır)'],
        certifications: ['Sahə üzrə peşəkar ixtisas və ya təlim sertifikatları üstünlükdür']
      },
      reportingHierarchy: `"${title}" birbaşa ${reportsTo} qarşısında hesabatlıdır. Fəaliyyət nəticələri dövri olaraq şöbə rəhbərliyinə və şirkət direktoruna təqdim olunur.`,
      interdepartmentalRelations: [
        `Şirkətin Maliyyə və Mühasibatlıq şöbəsi ilə sənəd təsdiqləri və büdcə məsələləri üzrə qarşılıqlı əlaqə.`,
        `İnsan Resursları (HR) departamenti ilə kadr inzibatçılığı, təlimlər və davamiyyət məsələləri üzrə əməkdaşlıq.`,
        `Hüquq və Satınalma bölmələri ilə müqavilələrin və tələbatların razılaşdırılması üzrə əlaqə.`,
        `Xarici partnyorlar, podratçılar və müştərilərlə işgüzar kommunikasiyanın aparılması.`
      ],
      kpisAndPerformanceMetrics: [
        {
          kpiName: 'Tapşırıqların vaxtında və qüsursuz icra dərəcəsi',
          measurementUnit: '%',
          measurementPeriod: 'Aylıq',
          targetScore: '≥ 95%'
        },
        {
          kpiName: 'Daxili və xarici müştəri məmnuniyyəti indeksi (CSAT)',
          measurementUnit: 'Bal (1-5)',
          measurementPeriod: 'Rüblük',
          targetScore: '≥ 4.5'
        },
        {
          kpiName: 'Biznes proseslərinin təkmilləşdirilməsi təşəbbüsləri',
          measurementUnit: 'Ədəd',
          measurementPeriod: 'İllik',
          targetScore: '≥ 3 təklif'
        },
        {
          kpiName: 'Əmək intizamı və korporativ standartlara uyğunluq',
          measurementUnit: '%',
          measurementPeriod: 'Aylıq',
          targetScore: '100%'
        }
      ],
      finalProvisions: [
        `Bu vəzifə təlimatı Baş İcraçı Direktor tərəfindən təsdiq edildiyi andan qüvvəyə minir və yeni təlimat qəbul edilənədək qüvvədə qalır.`,
        `Vəzifə təlimatı 2 (iki) nüsxədə tərtib olunur: bir nüsxəsi İnsan Resursları departamentində, digər nüsxəsi isə imzalanaraq əməkdaşda saxlanılır.`,
        `Şirkətin fəaliyyətində və ya strukturunda əhəmiyyətli dəyişikliklər baş verdikdə vəzifə təlimatına qanunvericiliyə uyğun olaraq əlavə və dəyişikliklər edilə bilər.`
      ]
    },
    approvalSection: {
      approverTitle: 'Baş İcraçı Direktor',
      approverName: `${company} Rəhbərliyi`,
      approvalDate: new Date().toLocaleDateString('az-AZ'),
      employeeAcknowledgement: 'Vəzifə təlimatının bir nüsxəsini aldım, oxudum, məzmunu ilə tam razıyam və icra üçün qəbul edirəm.'
    }
  };
}
