import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { SmartCandidate, SmartCandidatePipelineStage } from '../types';

/**
 * Standard Azerbaijani Demo Candidates for instantaneous testing by employers
 */
export const SAMPLE_DEMO_CANDIDATES: SmartCandidate[] = [
  {
    id: 'cand-demo-1',
    fullName: 'Murad Əliyev',
    firstName: 'Murad',
    lastName: 'Əliyev',
    email: 'murad.aliyev.dev@gmail.com',
    phone: '+994 50 234 56 78',
    jobTitle: 'Senior Frontend Developer',
    suitablePositions: ['Senior Frontend Developer', 'React Mühəndisi', 'Full Stack Developer', 'UI Arxitektoru'],
    experienceYears: 5,
    careerLevel: 'Senior',
    summary: '5 ildən artıq yüksək yüklü SPA və SaaS platformaların yaradılmasında təcrübəli Senior Frontend mühəndisi. React 19, TypeScript və Next.js arxitekturası üzrə ixtisaslaşmışdır.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'REST API', 'Git', 'Webpack'],
    softSkills: ['Komanda Liderliyi', 'Problem Həlli', 'Mentorluq', 'Agile/Scrum'],
    toolsAndTechnologies: ['VS Code', 'GitHub Actions', 'Figma', 'Postman', 'Docker'],
    educationLevel: 'Bakalavr',
    educationDetails: 'ADA Universiteti — Kompüter Elmləri (2019)',
    expectedSalary: 2500,
    minSalary: 2200,
    maxSalary: 3000,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nəsimi',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'C1 - Sərbəst' },
      { language: 'Rus', level: 'B2 - Yaxşı' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Murad_Aliyev_Senior_Frontend.pdf',
    originalFileName: 'Murad_Aliyev_Senior_Frontend.pdf',
    workExperiences: [
      {
        id: 'exp-1',
        companyName: 'Pasha Bank Tech',
        jobTitle: 'Senior Frontend Engineer',
        industry: 'Fintech & Bank',
        startDate: '2022-03',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Bankın rəqəmsal korporativ internet-bankçılıq portalının hazırlanması, mikronəhəng frontend arxitekturasının qurulması.',
        achievements: 'Səhifə yüklənmə sürətini 40% artırmış, 200,000+ aktiv müştəri bazasına xidmət edən modulları uğurla buraxmışdır.',
        toolsUsed: ['React', 'TypeScript', 'Redux Toolkit', 'Jest', 'Tailwind']
      },
      {
        id: 'exp-2',
        companyName: 'Innovation & Digital Development Agency',
        jobTitle: 'Frontend Developer',
        industry: 'Dövlət & İT',
        startDate: '2019-09',
        endDate: '2022-02',
        isCurrent: false,
        city: 'Bakı',
        responsibilities: 'Vətəndaşlar üçün rəqəmsal xidmət platformalarının frontend tərəfinin sıfırdan kodlaşdırılması.',
        achievements: '5 fərqli elektron xidmətin istifadəyə verilməsində əsas tərtibatçı olmuşdur.',
        toolsUsed: ['React', 'JavaScript', 'CSS3', 'REST API']
      }
    ],
    educationHistory: [
      {
        id: 'edu-1',
        institution: 'ADA Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'Kompüter Elmləri (Computer Science)',
        startDate: '2015',
        endDate: '2019',
        gpa: '3.75 / 4.0',
        city: 'Bakı'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta (Coursera)',
        issueDate: '2022',
        credentialId: 'META-FE-99214'
      },
      {
        id: 'cert-2',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: '2023',
        credentialId: 'AWS-CCP-41829'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Open Source UI Library for Azerbaijan',
        role: 'Yaradıcı & Əsas Developer',
        technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        description: 'Azərbaycan dilində yerliləşdirilmiş açıq mənbəli veb komponentlər toplusu.',
        link: 'https://github.com/murad/az-ui'
      }
    ],
    preferredWorkModes: ['Hibrid', 'Distant (Remote)'],
    preferredJobTypes: ['Tam ştat'],
    tags: ['A Kateqoriyası', 'Frontend', 'Dərhal Hazır', 'Senior'],
    pipelineStage: 'shortlist',
    notes: 'Texniki imtahandan yüksək bal toplayıb. React 19 və Next.js arxitekturasında təcrübəlidir.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-2',
    fullName: 'Leyla Məmmədova',
    firstName: 'Leyla',
    lastName: 'Məmmədova',
    email: 'leyla.mammadova.qa@yahoo.com',
    phone: '+994 55 876 54 32',
    jobTitle: 'QA Automation Engineer',
    suitablePositions: ['QA Automation Engineer', 'Test Avtomatlaşdırma Mühəndisi', 'Manual QA Mütəxəssisi', 'Proqram Keyfiyyət Təminatı'],
    experienceYears: 4,
    careerLevel: 'Middle',
    summary: 'Avtomatlaşdırılmış test ssenariləri, E2E və API testləri üzrə 4 illik staja malik QA mühəndisi. Cypress və Selenium üzrə güclü texniki baza.',
    skills: ['Selenium', 'Cypress', 'JavaScript', 'Python', 'Postman', 'Jira', 'SQL', 'CI/CD'],
    softSkills: ['Dəqiqlik', 'Analitik Təfəkkür', 'Tənqidi Düşüncə', 'Komanda İşi'],
    toolsAndTechnologies: ['Cypress', 'Postman', 'GitLab CI', 'Jira', 'Confluence'],
    educationLevel: 'Magistr',
    educationDetails: 'Bakı Dövlət Universiteti — Tətbiqi Riyaziyyat və Kibernetika (2020)',
    expectedSalary: 2100,
    minSalary: 1800,
    maxSalary: 2300,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Yasamal',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'B2 - Texniki' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Leyla_Mammadova_CV.pdf',
    originalFileName: 'Leyla_Mammadova_CV.pdf',
    workExperiences: [
      {
        id: 'exp-qa-1',
        companyName: 'Kapital Bank',
        jobTitle: 'QA Automation Specialist',
        industry: 'Bank',
        startDate: '2021-06',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Mobil tətbiq və veb xidmətlər üçün avtomatlaşdırılmış test skriptlərinin yazılması, reqresiya testlərinin icrası.',
        achievements: 'Test proseslərinin vaxtını 65% qısaldan avtomatlaşdırılmış CI/CD boru kəmərini tətbiq etmişdir.',
        toolsUsed: ['Cypress', 'Postman', 'Jenkins', 'SQL']
      }
    ],
    educationHistory: [
      {
        id: 'edu-qa-1',
        institution: 'Bakı Dövlət Universiteti',
        degree: 'Magistr',
        fieldOfStudy: 'Tətbiqi Riyaziyyat və İnformatika',
        startDate: '2018',
        endDate: '2020',
        city: 'Bakı'
      }
    ],
    certifications: [
      {
        id: 'cert-qa-1',
        name: 'ISTQB Certified Tester Foundation Level (CTFL)',
        issuer: 'ISTQB',
        issueDate: '2021',
        credentialId: 'ISTQB-CTFL-2021-08'
      }
    ],
    preferredWorkModes: ['Ofis', 'Hibrid'],
    preferredJobTypes: ['Tam ştat'],
    tags: ['QA', 'Avtomatlaşdırma', 'ISTQB'],
    pipelineStage: 'interview',
    notes: 'Avtomatlaşdırılmış test ssenariləri və API inteqrasiyaları üzrə güclü portfeli var.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-3',
    fullName: 'Elvin Rzayev',
    firstName: 'Elvin',
    lastName: 'Rzayev',
    email: 'elvin.rzayev.be@mail.ru',
    phone: '+994 70 312 45 67',
    jobTitle: 'Backend Node.js & Go Mühəndisi',
    suitablePositions: ['Backend Developer', 'Node.js Developer', 'Golang Mühəndisi', 'API Arxitektoru', 'Full Stack Developer'],
    experienceYears: 3.5,
    careerLevel: 'Middle',
    summary: 'Mikroxidmətlər, REST & gRPC API-lar, PostgreSQL və Redis keşləmə üzrə 3.5 il təcrübəli backend developer. Yüksək yüklü sistemlərin optimallaşdırılmasında ixtisaslaşmışdır.',
    skills: ['Node.js', 'Express', 'Golang', 'PostgreSQL', 'Docker', 'Redis', 'Microservices', 'Git'],
    softSkills: ['Analitik Düşüncə', 'Komanda İşi', 'Problem Həlli'],
    toolsAndTechnologies: ['Docker', 'Postman', 'GitLab', 'Redis', 'DBeaver'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Azərbaycan Texniki Universiteti — İnformasiya Texnologiyaları (2021)',
    expectedSalary: 1900,
    minSalary: 1700,
    maxSalary: 2200,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Xətai',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'C1 - Sərbəst' },
      { language: 'İngilis', level: 'B1 - Orta' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Elvin_Rzayev_Backend_CV.pdf',
    originalFileName: 'Elvin_Rzayev_Backend_CV.pdf',
    workExperiences: [
      {
        id: 'exp-be-1',
        companyName: 'AzInTelecom MMC',
        jobTitle: 'Backend Developer',
        industry: 'Bulud Texnologiyaları & İT',
        startDate: '2022-08',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Dövlət bulud xidmətləri üçün mikroxidmət arxitekturalı REST API-ların Node.js və Go ilə yazılması.',
        achievements: 'Verilənlər bazası sorğularını 50% sürətləndirmiş, Redis kəşləmə sistemini qurmuşdur.',
        toolsUsed: ['Node.js', 'Golang', 'PostgreSQL', 'Docker', 'Redis']
      },
      {
        id: 'exp-be-2',
        companyName: 'Matrix Tech Lab',
        jobTitle: 'Junior Backend Developer',
        industry: 'Proqram Təminatı',
        startDate: '2021-02',
        endDate: '2022-07',
        isCurrent: false,
        city: 'Bakı',
        responsibilities: 'E-ticarət layihələri üçün API inteqrasiyaları və ödəniş şlüzlərinin (Birkart, Pasha) qoşulması.',
        achievements: '3 fərqli onlayn mağaza üçün ödəniş modulunu uğurla təhvil vermişdir.',
        toolsUsed: ['Node.js', 'Express', 'MySQL', 'Git']
      }
    ],
    educationHistory: [
      {
        id: 'edu-be-1',
        institution: 'Azərbaycan Texniki Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'İnformasiya Texnologiyaları',
        startDate: '2017',
        endDate: '2021',
        city: 'Bakı'
      }
    ],
    tags: ['Backend', 'Microservices', 'Node.js', 'Go'],
    pipelineStage: 'screened',
    notes: 'Yüksək yüklü sistemlər və PostgreSQL optimizasiyası təcrübəsi var.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-4',
    fullName: 'Günel Həsənova',
    firstName: 'Günel',
    lastName: 'Həsənova',
    email: 'gunel.hasanova.acc@gmail.com',
    phone: '+994 51 999 11 22',
    jobTitle: 'Baş Mühasib & Maliyyəçi',
    suitablePositions: ['Baş Mühasib', 'Maliyyə Rəhbəri', 'Maliyyə Meneceri', 'Daxili Audit Mütəxəssisi', 'Vergi Məsləhətçisi'],
    experienceYears: 7,
    careerLevel: 'Senior',
    summary: 'AR Vergi Məcəlləsi, 1C 8.3 ERP, BTP və DSMF bəyannamələrində 7 illik rəsmi baş mühasib stajı olan təcrübəli maliyyəçi. PMS sertifikatlıdır.',
    skills: ['1C 8.3', 'BTP', 'Maliyyə Hesabatları', 'Vergi Məcəlləsi', 'Excel Advanced', 'DSMF', 'İşçilərin Əməkhaqqı Hesablanması'],
    softSkills: ['Dəqiqlik', 'Məsuliyyət', 'Liderlik', 'Audit Yoxlamaları'],
    toolsAndTechnologies: ['1C 8.3 ERP', 'BTP', 'e-taxes.gov.az', 'Excel', 'İnternet Bankçılıq'],
    educationLevel: 'Magistr',
    educationDetails: 'UNEC — Maliyyə və Kredit (2018)',
    expectedSalary: 1800,
    minSalary: 1600,
    maxSalary: 2200,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nərimanov',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'B2 - Yaxşı' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Gunel_Hasanova_Bash_Muhesib.pdf',
    originalFileName: 'Gunel_Hasanova_Bash_Muhesib.pdf',
    workExperiences: [
      {
        id: 'exp-acc-1',
        companyName: 'Baku Logistics Group MMC',
        jobTitle: 'Baş Mühasib',
        industry: 'Logistika & Nəqliyyat',
        startDate: '2020-04',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Bütün növ vergi və statistika hesabatlarının tərtibi, 120 nəfərlik heyətin əməkhaqqı uçotu, xarici valyuta əməliyyatları.',
        achievements: 'Vergi yoxlamalarından 0 cərimə ilə keçmiş, şirkətin illik xərclərinə 15% vergi optimizasiyası gətirmişdir.',
        toolsUsed: ['1C 8.3', 'BTP', 'Excel', 'e-taxes']
      },
      {
        id: 'exp-acc-2',
        companyName: 'Azərsun Holdinq (Distribüsiya)',
        jobTitle: 'Aparıcı Mühasib',
        industry: 'İstehsalat & Ticarət',
        startDate: '2017-09',
        endDate: '2020-03',
        isCurrent: false,
        city: 'Bakı',
        responsibilities: 'Bank hesablaşmaları, mal-material qalıqlarının uçotu və ƏDV əvəzləşdirmələri.',
        achievements: 'Aylıq dövriyyəsi 2 milyon AZN olan hesablaşmaların gündəlik balansını aparmışdır.',
        toolsUsed: ['1C 8.3', 'Excel']
      }
    ],
    educationHistory: [
      {
        id: 'edu-acc-1',
        institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)',
        degree: 'Magistr',
        fieldOfStudy: 'Maliyyə və Kredit',
        startDate: '2016',
        endDate: '2018',
        city: 'Bakı'
      }
    ],
    tags: ['Maliyyə', '1C', 'Təcrübəli', 'Baş Mühasib'],
    pipelineStage: 'interview',
    notes: 'AR Vergi Məcəlləsi və ƏDV bəyannamələrində 7 illik rəsmi baş mühasib stajı.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-5',
    fullName: 'Rauf Quliyev',
    firstName: 'Rauf',
    lastName: 'Quliyev',
    email: 'rauf.quliyev.pm@outlook.com',
    phone: '+994 50 444 33 22',
    jobTitle: 'Rəqəmsal Məhsul Meneceri (Product Manager)',
    suitablePositions: ['Product Manager', 'Məhsul Meneceri', 'Layihə Meneceri (PM)', 'Scrum Master', 'Biznes Analitik'],
    experienceYears: 4,
    careerLevel: 'Middle',
    summary: 'Fintech və E-ticarət məhsullarının sıfırdan bazara çıxarılmasında, Agile sprintlərinin idarəsində və müştəri təcrübəsinin artırılmasında 4 il təcrübəli Product Manager.',
    skills: ['Agile', 'Scrum', 'Jira', 'Figma', 'Məhsul Analitikası', 'A/B Testlər', 'Bazar Araşdırması', 'Sprint Planlaşdırma'],
    softSkills: ['Strateji Baxış', 'Komanda Liderliyi', 'Danışıqlar', 'Data-driven Qərarlar'],
    toolsAndTechnologies: ['Jira', 'Confluence', 'Figma', 'Mixpanel', 'Google Analytics'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Xəzər Universiteti — Biznesin İdarə Edilməsi (2020)',
    expectedSalary: 2200,
    minSalary: 1900,
    maxSalary: 2600,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Səbail',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'C1 - Sərbəst' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Rauf_Quliyev_ProductManager.pdf',
    originalFileName: 'Rauf_Quliyev_ProductManager.pdf',
    workExperiences: [
      {
        id: 'exp-pm-1',
        companyName: 'Birbank / Kapital Bank Tech',
        jobTitle: 'Product Owner & Manager',
        industry: 'Fintech & Bank',
        startDate: '2022-01',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Rəqəmsal kredit və loyallıq məhsulunun yol xəritəsinin (Roadmap) idarə olunması, 8 nəfərlik tərtibatçı komandası ilə sprintlərin aparılması.',
        achievements: 'Məhsulun aylıq aktiv istifadəçi sayını (MAU) 35% artırmışdır.',
        toolsUsed: ['Jira', 'Figma', 'Mixpanel']
      }
    ],
    educationHistory: [
      {
        id: 'edu-pm-1',
        institution: 'Xəzər Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'Biznesin İdarə Edilməsi (BBA)',
        startDate: '2016',
        endDate: '2020',
        city: 'Bakı'
      }
    ],
    tags: ['Product', 'Agile', 'Fintech'],
    pipelineStage: 'sourced',
    notes: 'Fintech və E-ticarət məhsullarının idarə olunmasında təcrübə.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-6',
    fullName: 'Nərgiz Qasımova',
    firstName: 'Nərgiz',
    lastName: 'Qasımova',
    email: 'nargiz.qasimova.hr@gmail.com',
    phone: '+994 55 678 90 12',
    jobTitle: 'HR Mütəxəssis & Təlim Koordinatoru',
    suitablePositions: ['HR Mütəxəssis', 'İnsan Resursları Meneceri', 'Kadrlar üzrə Aparıcı Mütəxəssis', 'Rekrutinq Koordinatoru', 'Təlim Meneceri'],
    experienceYears: 3,
    careerLevel: 'Middle',
    summary: 'Kadr kargüzarlığı, ƏMAS portalında əmək müqavilələrinin rəsmiləşdirilməsi və kütləvi işə qəbul kampaniyalarının aparılmasında 3 illik təcrübəli HR mütəxəssisi.',
    skills: ['İşə Qəbul (Recruitment)', 'Əmək Qanunvericiliyi', 'İşçilərin Adaptasiyası', 'Müsahibələrin Təşkili', 'HR Brandinq', 'Kadr Kargüzarlığı'],
    softSkills: ['Ünsiyyət Bacarığı', 'Empatiya', 'Konfliktlərin Həlli', 'Təşkilatçılıq'],
    toolsAndTechnologies: ['ƏMAS Portalı', '1C ZUP', 'LinkedIn Recruiter', 'Excel', 'Google Forms'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Dövlət İdarəçilik Akademiyası — Dövlət və Bələdiyyə İdarəetməsi (2021)',
    expectedSalary: 1300,
    minSalary: 1100,
    maxSalary: 1500,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Binəqədi',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'B2 - Yaxşı' },
      { language: 'Rus', level: 'B1 - Orta' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Nargiz_Qasimova_HR_CV.pdf',
    originalFileName: 'Nargiz_Qasimova_HR_CV.pdf',
    workExperiences: [
      {
        id: 'exp-hr-1',
        companyName: 'Bravo Supermarketlər Şəbəkəsi',
        jobTitle: 'Kadrlar və İşə Qəbul üzrə Mütəxəssis',
        industry: 'Pərakəndə Satış (Retail)',
        startDate: '2022-03',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Mağaza heyətinin seçimi, ilkin müsahibələr, ƏMAS-da əmək müqavilələrinin qeydiyyatı və şəxsi işlərin formalaşdırılması.',
        achievements: '3 ayda 60+ vakansiyanı vaxtında bağlamış, adaptasiya prosesini təkmilləşdirmişdir.',
        toolsUsed: ['ƏMAS', '1C ZUP', 'Excel']
      }
    ],
    educationHistory: [
      {
        id: 'edu-hr-1',
        institution: 'Azərbaycan Respublikasının Prezidenti yanında Dövlət İdarəçilik Akademiyası',
        degree: 'Bakalavr',
        fieldOfStudy: 'Dövlət və Bələdiyyə İdarəetməsi',
        startDate: '2017',
        endDate: '2021',
        city: 'Bakı'
      }
    ],
    tags: ['HR', 'Kadr', 'ƏMAS', 'Recruitment'],
    pipelineStage: 'screened',
    notes: 'Kadr sənədləşməsi və kütləvi işə qəbul kampaniyalarını idarə edib.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-7',
    fullName: 'Tural İsmayılov',
    firstName: 'Tural',
    lastName: 'İsmayılov',
    email: 'tural.marketing@gmail.com',
    phone: '+994 77 456 78 90',
    jobTitle: 'Performans Marketoloq & SMM Menecer',
    suitablePositions: ['Rəqəmsal Marketinq Meneceri', 'Performans Marketoloq', 'SMM Menecer', 'Hədəfli Reklam Mütəxəssisi', 'SEO Mütəxəssisi'],
    experienceYears: 3.5,
    careerLevel: 'Middle',
    summary: 'Aylıq 20,000+ AZN reklam büdcələrini idarə edən, Meta Ads və Google Ads üzrə ROAS 4.5+ nəticələr göstərən rəqəmsal marketinq mütəxəssisi.',
    skills: ['Meta Ads', 'Google Ads', 'SEO', 'TikTok Ads', 'Kopiraytinq', 'Analitika GA4', 'Canva', 'Büdcə İdarəetməsi'],
    softSkills: ['Kreativlik', 'Analitik Düşüncə', 'Trend İzləmə', 'Sürət'],
    toolsAndTechnologies: ['Meta Ads Manager', 'Google Ads', 'GA4', 'Canva', 'SEMrush'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Azərbaycan Dillər Universiteti — Regionşünaslıq (2021)',
    expectedSalary: 1400,
    minSalary: 1200,
    maxSalary: 1700,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nəsimi',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'C1 - Sərbəst' },
      { language: 'İngilis', level: 'B2 - Yaxşı' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Tural_Ismayilov_Marketing.pdf',
    originalFileName: 'Tural_Ismayilov_Marketing.pdf',
    workExperiences: [
      {
        id: 'exp-mkt-1',
        companyName: 'İrşad Electronics',
        jobTitle: 'Performans Marketoloq',
        industry: 'Elektronika & Pərakəndə',
        startDate: '2022-05',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Hədəfli reklam kampaniyalarının (Facebook, Instagram, Google) qurulması, A/B testlər, satış konversiyalarının artırılması.',
        achievements: 'E-ticarət satışlarında online sifarişləri 40% artırmış və ROAS-ı 4.8 səviyyəsinə qaldırmışdır.',
        toolsUsed: ['Meta Ads', 'Google Ads', 'GA4']
      }
    ],
    educationHistory: [
      {
        id: 'edu-mkt-1',
        institution: 'Azərbaycan Dillər Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'Beynəlxalq Münasibətlər və Regionşünaslıq',
        startDate: '2017',
        endDate: '2021',
        city: 'Bakı'
      }
    ],
    tags: ['Marketinq', 'SMM', 'Meta Ads', 'Performans'],
    pipelineStage: 'sourced',
    notes: 'Aylıq 20.000+ AZN reklam büdcəsini idarə edib, ROAS 4.5+ nəticə göstərib.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-8',
    fullName: 'Fərid Babayev',
    firstName: 'Fərid',
    lastName: 'Babayev',
    email: 'farid.babayev.sales@mail.ru',
    phone: '+994 50 711 22 33',
    jobTitle: 'Korporativ B2B Satış Meneceri',
    suitablePositions: ['B2B Satış Meneceri', 'Korporativ Əlaqələr Meneceri', 'Satış Təmsilçisi', 'Biznes İnkişaf Meneceri', 'Müştəri Meneceri'],
    experienceYears: 5,
    careerLevel: 'Middle',
    summary: 'Korporativ şirkətlərlə tender və illik xidmət müqavilələrinin bağlanması, böyük B2B müştəri portfelinin idarəsində 5 illik uğurlu staja malik satış mütəxəssisi.',
    skills: ['B2B Danışıqlar', 'Soyuq Zənglər', 'Müştəri Bazası İdarəetməsi', 'Təqdimat Bacarıqları', 'CRM Bitrix24', 'Müqavilələrin Bağlanması'],
    softSkills: ['İnandırma Bacarığı', 'Davamlılıq', 'Məqsədyönlülük', 'Stressə Davamlılıq'],
    toolsAndTechnologies: ['Bitrix24 CRM', 'Excel', 'PowerPoint', '1C'],
    educationLevel: 'Bakalavr',
    educationDetails: 'UNEC — Beynəlxalq İqtisadi Münasibətlər (2019)',
    expectedSalary: 1600,
    minSalary: 1400,
    maxSalary: 2000,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Xətai',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'C1 - Sərbəst' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Farid_Babayev_B2B_Sales.pdf',
    originalFileName: 'Farid_Babayev_B2B_Sales.pdf',
    workExperiences: [
      {
        id: 'exp-sales-1',
        companyName: 'Pasha Sığorta ASC',
        jobTitle: 'Korporativ Satış üzrə Aparıcı Mütəxəssis',
        industry: 'Maliyyə & Sığorta',
        startDate: '2021-04',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Böyük korporativ müştərilərə korporativ paketlərin satışı, tender sənədləşməsi və müqavilələrin yenilənməsi.',
        achievements: 'İllik satış planını 125% icra etmiş, 45 yeni korporativ partnyor cəlb etmişdir.',
        toolsUsed: ['Bitrix24', 'Excel', 'PowerPoint']
      }
    ],
    educationHistory: [
      {
        id: 'edu-sales-1',
        institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)',
        degree: 'Bakalavr',
        fieldOfStudy: 'Beynəlxalq İqtisadi Münasibətlər',
        startDate: '2015',
        endDate: '2019',
        city: 'Bakı'
      }
    ],
    tags: ['Satış', 'B2B', 'Müştəri Əlaqələri', 'Tender'],
    pipelineStage: 'interview',
    notes: 'Böyük şirkətlərlə tender və illik xidmət müqavilələrinin bağlanması üzrə təcrübəli.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-9',
    fullName: 'Elnur Kərimov',
    firstName: 'Elnur',
    lastName: 'Kərimov',
    email: 'chef.elnur@gmail.com',
    phone: '+994 55 333 44 55',
    jobTitle: 'Şef Aşpaz & İsti Sex Ustası',
    suitablePositions: ['Şef Aşpaz', 'Mətbəx Rəhbəri', 'İsti Sex Ustası', 'Baş Aşpaz', 'Kalkulyator-Menyu Tərtibatçısı'],
    experienceYears: 8,
    careerLevel: 'Senior',
    summary: 'Avropa və milli mətbəx üzrə 8 illik təcrübəyə malik Şef Aşpaz. HACCP qida təhlükəsizliyi, kalkulyasiya və banketlərin təşkilində peşəkar.',
    skills: ['Avropa Mətbəxi', 'Milli Mətbəx', 'HACCP Standartları', 'Kalkulyasiya Vərəqələri', 'Menyu Tərtibatı', 'Mətbəx Komandası İdarəetməsi'],
    softSkills: ['Liderlik', 'Dad Həssaslığı', 'Dəqiqlik', 'Təmizlik Standartları'],
    toolsAndTechnologies: ['Konvektomat', 'Sous-vide', 'HACCP Sənədləri', 'Kalkulyasiya Excel'],
    educationLevel: 'Orta',
    educationDetails: 'Bakı Qida və Xidmət Kolleci — İaşə İşi (2016)',
    expectedSalary: 1800,
    minSalary: 1600,
    maxSalary: 2300,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nərimanov',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Türk', level: 'C1 - Sərbəst' },
      { language: 'Rus', level: 'B1 - Orta' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Elnur_Kerimov_Chef_CV.pdf',
    originalFileName: 'Elnur_Kerimov_Chef_CV.pdf',
    workExperiences: [
      {
        id: 'exp-chef-1',
        companyName: 'Mangal Steak House & Restoranlar Qrupu',
        jobTitle: 'Baş Aşpaz / Sous Chef',
        industry: 'Restoran & İaşə',
        startDate: '2020-02',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Gündəlik menyu hazırlığı, isti sexdə 12 nəfərlik mətbəx heyətinin idarə edilməsi, ərzaq keyfiyyətinə və israfına nəzarət.',
        achievements: 'Xammal itkisini 12% azaltmış, müştəri rəylərində mətbəx reytinqini 4.9/5 səviyyəsinə yüksəltmişdir.',
        toolsUsed: ['Konvektomat', 'HACCP', 'Kalkulyasiya']
      }
    ],
    educationHistory: [
      {
        id: 'edu-chef-1',
        institution: 'Bakı Qida və Xidmət Kolleci',
        degree: 'Orta-ixtisas',
        fieldOfStudy: 'İctimai İaşə Məhsullarının Texnologiyası',
        startDate: '2013',
        endDate: '2016',
        city: 'Bakı'
      }
    ],
    tags: ['Aşpaz', 'Restoran', 'HACCP', 'Şef'],
    pipelineStage: 'shortlist',
    notes: 'Premium restoran və otellərdə baş aşpaz və növbə rəisi vəzifələrində çalışıb.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-10',
    fullName: 'Samir Cəfərov',
    firstName: 'Samir',
    lastName: 'Cəfərov',
    email: 'samir.ceferov.cook@mail.ru',
    phone: '+994 70 888 77 66',
    jobTitle: 'Aşpaz Köməkçisi & Fast Food Hazırlığı',
    suitablePositions: ['Aşpaz Köməkçisi', 'Fast Food Ustası', 'Salat və Qəlyanaltı Ustası', 'Mətbəx İşçisi'],
    experienceYears: 2,
    careerLevel: 'Junior',
    summary: 'Burger, sendviç və sürətli iaşə məhsullarının hazırlanması, sanitariya qaydalarına riayət üzrə 2 illik staja malik operativ əməkdaş.',
    skills: ['Burger və Sendviçlər', 'Salat və Qəlyanaltılar', 'Sanitariya Qaydaları', 'Sürətli Xidmət', 'İnqrediyentlərin Hazırlanması'],
    softSkills: ['Cəldlik', 'Dözümlülük', 'Komanda ilə İşləmək'],
    toolsAndTechnologies: ['Fritür', 'Qril', 'Dilimləyici alətlər'],
    educationLevel: 'Orta',
    educationDetails: 'Bakı Peşə Liseyi (2022)',
    expectedSalary: 850,
    minSalary: 800,
    maxSalary: 1000,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nizami',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Samir_Ceferov_Aspaz_Komekci.pdf',
    originalFileName: 'Samir_Ceferov_Aspaz_Komekci.pdf',
    workExperiences: [
      {
        id: 'exp-cook-1',
        companyName: 'Paul Azerbaijan / Cafe & Bakery',
        jobTitle: 'Aşpaz Köməkçisi',
        industry: 'Kafe & Fast Casual',
        startDate: '2023-01',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Səhər yeməkləri və sendviçlərin hazırlanması, yarımfabrikatların hazırlanması, iş sahəsinin təmiz saxlanması.',
        achievements: 'Gündəlik 180+ sifarişin fasiləsiz təhvilində iştirak etmişdir.',
        toolsUsed: ['Qril', 'Fritür', 'Soyuducu kameralar']
      }
    ],
    educationHistory: [
      {
        id: 'edu-cook-1',
        institution: 'Bakı Peşə Liseyi № 12',
        degree: 'Orta',
        fieldOfStudy: 'Aşpazlıq İşi',
        startDate: '2020',
        endDate: '2022',
        city: 'Bakı'
      }
    ],
    tags: ['Aşpaz köməkçisi', 'Fast Food', 'Gənc Kadr'],
    pipelineStage: 'screened',
    notes: 'Davamiyyəti nizamlı, sürətli və komanda ilə işləməyə meyilli gənc namizəd.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-11',
    fullName: 'Aysel Vəliyeva',
    firstName: 'Aysel',
    lastName: 'Vəliyeva',
    email: 'aysel.design@gmail.com',
    phone: '+994 51 654 32 10',
    jobTitle: 'UI/UX & Qrafik Dizayner',
    suitablePositions: ['UI/UX Dizayner', 'Məhsul Dizayneri', 'Qrafik Dizayner', 'Veb Dizayner', 'Brend Dizayneri'],
    experienceYears: 4,
    careerLevel: 'Middle',
    summary: 'Mobil tətbiqlər və veb platformalar üçün istifadəçi yönümlü dizayn sistemləri, Figma komponentləri və brend vizual standartları üzrə 4 illik təcrübəli dizayner.',
    skills: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Dizayn Sistemləri', 'Wireframing', 'Prototyping', 'Responsive Design', 'Brendinq'],
    softSkills: ['Vizual Hissiyyat', 'Kreativlik', 'Müştəri Yönümlülük', 'Feedback Qəbulu'],
    toolsAndTechnologies: ['Figma', 'Photoshop', 'Illustrator', 'Miro', 'Zeplin'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Azərbaycan Dövlət Rəssamlıq Akademiyası — Dizayn Fakultəsi (2020)',
    expectedSalary: 1700,
    minSalary: 1500,
    maxSalary: 2000,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Nəsimi',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'B2 - Yaxşı' },
      { language: 'Rus', level: 'B2 - Yaxşı' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Aysel_Valiyeva_Portfolio_CV.pdf',
    originalFileName: 'Aysel_Valiyeva_Portfolio_CV.pdf',
    workExperiences: [
      {
        id: 'exp-ui-1',
        companyName: 'Leo Burnett Azerbaijan / Rəqəmsal Agentlik',
        jobTitle: 'UI/UX & Qrafik Dizayner',
        industry: 'Reklam & Rəqəmsal Həllər',
        startDate: '2021-09',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Bank və telekom müştəriləri üçün mobil tətbiq ekranlarının, interaktiv prototiplərin və brendbook qaydalarının dizaynı.',
        achievements: 'Hazırladığı mobil interfeys Red Dot və yerli dizayn nominasiyalarında yüksək qiymətləndirilib.',
        toolsUsed: ['Figma', 'Illustrator', 'Photoshop']
      }
    ],
    educationHistory: [
      {
        id: 'edu-ui-1',
        institution: 'Azərbaycan Dövlət Rəssamlıq Akademiyası',
        degree: 'Bakalavr',
        fieldOfStudy: 'Qrafik və İnteryer Dizayn',
        startDate: '2016',
        endDate: '2020',
        city: 'Bakı'
      }
    ],
    tags: ['UI/UX', 'Figma', 'Dizayn', 'Kreativ'],
    pipelineStage: 'interview',
    notes: 'Mobil tətbiq və veb interfeyslər üzrə zəngin Behance / Dribbble portfelinə sahibdir.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-12',
    fullName: 'Kamran Süleymanov',
    firstName: 'Kamran',
    lastName: 'Süleymanov',
    email: 'kamran.warehouse@yahoo.com',
    phone: '+994 50 123 98 76',
    jobTitle: 'Anbardar & Logistika Mütəxəssisi',
    suitablePositions: ['Anbardar', 'Baş Anbardar', 'Logistika Koordinatoru', 'İnventar Nəzarətçisi', 'Təchizatçı'],
    experienceYears: 4,
    careerLevel: 'Middle',
    summary: '1C Anbar modulu, barkodlu inventarizasiya və böyük paylayıcı anbarlarda mal qəbulu/buraxılışı üzrə 4 illik stajlı anbardar.',
    skills: ['1C Anbar', 'İnventarizasiya', 'Barkod Sistemləri', 'Mal Qəbulu və Buraxılışı', 'Anbarın Nizamlanması', 'Yük Qaimələri'],
    softSkills: ['Dəqiqlik', 'Fiziki Dözümlülük', 'Məsuliyyət', 'Nizam-intizam'],
    toolsAndTechnologies: ['1C 8.3 Anbar', 'Barkod Skaneri', 'Excel', 'Tərəzi sistemləri'],
    educationLevel: 'Orta',
    educationDetails: 'Bakı Dövlət Rabitə və Nəqliyyat Kolleci (2019)',
    expectedSalary: 1100,
    minSalary: 1000,
    maxSalary: 1300,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Sumqayıt',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'B1 - Orta' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Kamran_Suleymanov_Anbardar.pdf',
    originalFileName: 'Kamran_Suleymanov_Anbardar.pdf',
    workExperiences: [
      {
        id: 'exp-wh-1',
        companyName: 'Veysəloğlu Şirkətlər Qrupu (Mərkəzi Anbar)',
        jobTitle: 'Baş Anbardar',
        industry: 'FMCG & Distribüsiya',
        startDate: '2021-03',
        endDate: '',
        isCurrent: true,
        city: 'Sumqayıt / Bakı',
        responsibilities: '3500 kv.m mərkəzi anbarda qida və qeyri-qida məhsullarının 1C proqramı ilə qəbulu, yerləşdirilməsi və mağazalara yola salınması.',
        achievements: 'İllik inventarizasiya zamanı kənarlaşmanı 0.05% həddində saxlamışdır.',
        toolsUsed: ['1C 8.3', 'Barkod Terminalı', 'Excel']
      }
    ],
    educationHistory: [
      {
        id: 'edu-wh-1',
        institution: 'Bakı Dövlət Rabitə və Nəqliyyat Kolleci',
        degree: 'Orta-ixtisas',
        fieldOfStudy: 'Nəqliyyat və Logistika',
        startDate: '2016',
        endDate: '2019',
        city: 'Bakı'
      }
    ],
    tags: ['Anbar', '1C', 'Logistika', 'İnventar'],
    pipelineStage: 'sourced',
    notes: 'Böyük paylayıcı mərkəzdə 1C proqramı ilə mal dövriyyəsini idarə edib.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-13',
    fullName: 'Vüsal Əhmədov',
    firstName: 'Vüsal',
    lastName: 'Əhmədov',
    email: 'vusal.driver@mail.ru',
    phone: '+994 55 900 80 70',
    jobTitle: 'Sürücü-Ekspeditor (B, C kateqoriya)',
    suitablePositions: ['Sürücü-Ekspeditor', 'Yük Sürücüsü', 'Şəxsi Sürücü', 'Kuryer-Çatdırılma Sürücüsü'],
    experienceYears: 7,
    careerLevel: 'Senior',
    summary: 'B və C kateqoriyalı sürücülük vəsiqəsi ilə 7 illik qəzasız staj. Bakı və Abşeron ünvanlarını dəqiq tanıyır, sprinter və yük furqonlarını təhlükəsiz idarə edir.',
    skills: ['B, C Kateqoriyalı Sürücülük', 'Bakı Şəhərini Əla Tanıma', 'Yük Daşıma Təhlükəsizliyi', 'Sənədləşmə & Qaimə Təhvili', 'Avtomobilə Texniki Qulluq'],
    softSkills: ['Dəqiqlik', 'Səliqə', 'Müştəri ilə Nəzakətli Davranış', 'Zamanın İdarə Edilməsi'],
    toolsAndTechnologies: ['Waze Naviqasiya', 'Yandex Maps', 'Qaimə Təhvili'],
    educationLevel: 'Orta',
    educationDetails: 'Orta Təhsil (2015)',
    expectedSalary: 950,
    minSalary: 900,
    maxSalary: 1100,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Sabunçu',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Vusal_Ahmedov_Surucu_CV.pdf',
    originalFileName: 'Vusal_Ahmedov_Surucu_CV.pdf',
    workExperiences: [
      {
        id: 'exp-drv-1',
        companyName: 'Mətanət A Şirkəti (Distribüsiya)',
        jobTitle: 'Sürücü-Ekspeditor (Mercedes Sprinter)',
        industry: 'Tikinti Materialları Daşınması',
        startDate: '2019-06',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Gündəlik marşrut üzrə 25-30 ticarət nöqtəsinə məhsul çatdırılması, qaimələrin imzalatdırılması və təhvili.',
        achievements: '7 il ərzində heç bir yol-nəqliyyat hadisəsi törətməmiş, avtomobilin texniki sazlığını yüksək səviyyədə qorumuşdur.',
        toolsUsed: ['Mercedes Sprinter', 'Waze']
      }
    ],
    educationHistory: [
      {
        id: 'edu-drv-1',
        institution: 'Bakı Şəhər 72 saylı Tam Orta Məktəb',
        degree: 'Orta',
        fieldOfStudy: 'Tam Orta Təhsil',
        startDate: '2004',
        endDate: '2015',
        city: 'Bakı'
      }
    ],
    tags: ['Sürücü', 'Ekspeditor', 'C Kateqoriya', 'Qəzasız Staj'],
    pipelineStage: 'shortlist',
    notes: 'Qəzasız 7 illik rəsmi sürücülük stajı, sprinter və kiçik tonnajlı yük maşınları təcrübəsi.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-14',
    fullName: 'Şəhla Tağıyeva',
    firstName: 'Şəhla',
    lastName: 'Tağıyeva',
    email: 'shahla.support@gmail.com',
    phone: '+994 77 222 33 44',
    jobTitle: 'Müştəri Xidmətləri & Call Center Təmsilçisi',
    suitablePositions: ['Müştəri Xidmətləri Təmsilçisi', 'Call Center Operatoru', 'Müştəri Əlaqələri Koordinatoru', 'Reception & Məlumat Masası'],
    experienceYears: 2.5,
    careerLevel: 'Junior',
    summary: 'Azərbaycan və rus dillərində səlis diksiya, gələn və gedən zənglərin idarə edilməsi, şikayətlərin operativ həlli üzrə 2.5 illik çağrı mərkəzi təcrübəsi.',
    skills: ['Telefon Danışıqları Etiketi', 'Şikayətlərin İdarə Edilməsi', 'Zəng Mərkəzi Proqramları', 'Sürətli Yazı (Typing)', 'Məhsul Məlumatlandırması', 'Səbir və Diqqət'],
    softSkills: ['Diksiya', 'Empatiya', 'Stressə Davamlılıq', 'Pozitiv Ünsiyyət'],
    toolsAndTechnologies: ['Avaya', 'Bitrix24 CRM', 'Excel', 'Zendesk'],
    educationLevel: 'Bakalavr',
    educationDetails: 'Bakı Slavyan Universiteti — Filologiya və Tərcüməçilik (2022)',
    expectedSalary: 800,
    minSalary: 750,
    maxSalary: 950,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Xətai',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'C1 - Sərbəst' },
      { language: 'İngilis', level: 'B1 - Orta' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Shahla_Tagiyeva_CallCenter_CV.pdf',
    originalFileName: 'Shahla_Tagiyeva_CallCenter_CV.pdf',
    workExperiences: [
      {
        id: 'exp-call-1',
        companyName: 'Azercell Telecom (Çağrı Mərkəzi Partnyoru)',
        jobTitle: 'Çağrı Mərkəzi Operatoru',
        industry: 'Telekommunikasiya & Müştəri Xidmətləri',
        startDate: '2022-09',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Gündəlik 120+ müştəri zənginin qəbulu, xidmət paketləri üzrə məlumatlandırma və texniki problemlərin qeydiyyatı.',
        achievements: 'Müştəri məmnuniyyəti göstəricisi (CSAT) 96.4% olaraq ayın ən yaxşı operatoru seçilmişdir.',
        toolsUsed: ['Avaya', 'CRM', 'Zendesk']
      }
    ],
    educationHistory: [
      {
        id: 'edu-call-1',
        institution: 'Bakı Slavyan Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: 'Tərcümə və Filologiya (Rus dili)',
        startDate: '2018',
        endDate: '2022',
        city: 'Bakı'
      }
    ],
    tags: ['Call Center', 'Dəstək', 'Rus dili', 'Müştəri Xidməti'],
    pipelineStage: 'screened',
    notes: 'Xoş səs tonu, təmiz nitq qabiliyyəti və konfliktli müştərilərlə peşəkar davranma bacarığı.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'cand-demo-15',
    fullName: 'Cavid Nəsirov',
    firstName: 'Cavid',
    lastName: 'Nəsirov',
    email: 'cavid.security@mail.ru',
    phone: '+994 50 888 12 34',
    jobTitle: 'Mühafizəçi & Təhlükəsizlik Nəzarətçisi',
    suitablePositions: ['Mühafizəçi', 'Növbə Rəisi', 'CCTV Kamera Nəzarətçisi', 'Obyekt Mühafizəçisi'],
    experienceYears: 5,
    careerLevel: 'Middle',
    summary: 'Obyektlərin nəzarət-buraxılış rejimi, CCTV kamera sistemləri və yanğın təhlükəsizliyi qaydaları üzrə 5 illik rəsmi mühafizə stajı. Hərbi xidmətini tamamlayıb.',
    skills: ['Nəzarət-Buraxılış Rejimi', 'CCTV Kamera Müşahidəsi', 'Yanğın Təhlükəsizliyi Qaydaları', 'Fiziki Hazırlıq', 'Gecə Növbəsi', 'Mühafizə Sertifikatı'],
    softSkills: ['Diqqətlilik', 'İntizam', 'Fiziki Güc', 'Məsuliyyət'],
    toolsAndTechnologies: ['Hikvision CCTV', 'Torniket nəzarət proqramları', 'Rasiya'],
    educationLevel: 'Orta',
    educationDetails: 'Hərbi Xidmət Tamamlanıb (2018)',
    expectedSalary: 750,
    minSalary: 700,
    maxSalary: 900,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    location: 'Bakı, Qaradağ',
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' }
    ],
    sourceFormat: 'pdf',
    fileName: 'Cavid_Nesirov_Muhafize_CV.pdf',
    originalFileName: 'Cavid_Nesirov_Muhafize_CV.pdf',
    workExperiences: [
      {
        id: 'exp-sec-1',
        companyName: 'Gesco Mühafizə Şirkəti (Port Baku Mall Obyekti)',
        jobTitle: 'Mühafizəçi / Nəzarətçi',
        industry: 'Təhlükəsizlik & Mühafizə',
        startDate: '2020-01',
        endDate: '',
        isCurrent: true,
        city: 'Bakı',
        responsibilities: 'Ticarət mərkəzində ictimai asayişin qorunması, qonaqların yoxlanması və kamera nəzarət mərkəzində növbə çəkmək.',
        achievements: 'Obyektdə baş vermiş 2 oğurluq cəhdini vaxtında aşkar edərək qarşısını almışdır.',
        toolsUsed: ['CCTV', 'Rasiya', 'Metal detektor']
      }
    ],
    educationHistory: [
      {
        id: 'edu-sec-1',
        institution: 'Qaradağ Rayon Tam Orta Məktəb',
        degree: 'Orta',
        fieldOfStudy: 'Tam Orta Təhsil',
        startDate: '2006',
        endDate: '2017',
        city: 'Bakı'
      }
    ],
    tags: ['Mühafizə', 'Növbəli', 'CCTV', 'Fiziki İntizam'],
    pipelineStage: 'sourced',
    notes: 'Hərbi xidmət keçib, boyu 185 sm, lisenziyalı mühafizəçi vəsiqəsi mövcuddur.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

/**
 * Common skill dictionary to detect from raw CV texts
 */
const KNOWN_SKILL_KEYWORDS = [
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET', 'PHP', 'Laravel', 'Golang',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'Git', 'CI/CD', 'Linux', 'REST API', 'GraphQL', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS',
  'QA', 'Selenium', 'Cypress', 'Postman', 'Jira', 'Figma', 'UI/UX', 'Photoshop', 'Illustrator',
  '1C', '1C 8.3', 'BTP', 'Maliyyə', 'Vergi Məcəlləsi', 'Excel', 'DSMF', 'Mühasibatlıq',
  'SMM', 'Meta Ads', 'Google Ads', 'SEO', 'Kopiraytinq', 'Marketinq', 'Satış', 'B2B',
  'CRM', 'Bitrix24', 'HR', 'Recruitment', 'Kadr Kargüzarlığı', 'Məhsul Meneceri', 'Agile', 'Scrum',
  'Aşpaz', 'Mətbəx', 'HACCP', 'Kalkulyasiya', 'Qida', 'Fast Food', 'Sürücü', 'Ekspeditor',
  'Anbardar', 'Logistika', 'Barkod', 'İnventarizasiya', 'Call Center', 'Müştəri Xidmətləri',
  'Mühafizə', 'CCTV', 'Təhlükəsizlik'
];

/**
 * Heuristically parses raw text or CV content into candidate data fields
 */
export function parseRawTextToCandidate(text: string, fileName?: string): SmartCandidate {
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = cleanText.match(emailRegex);
  const email = emailMatch ? emailMatch[1].toLowerCase() : `namized-${Date.now().toString().slice(-4)}@jobia.az`;

  // 2. Phone extraction
  const phoneRegex = /(?:\+?994|0)?\s*(?:50|51|55|70|77|99|12)\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}/;
  const phoneMatch = cleanText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ') : '+994 50 000 00 00';

  // 3. Name extraction (first line or line before email/title)
  let fullName = 'Namizəd ' + Math.floor(100 + Math.random() * 900);
  if (lines.length > 0) {
    const firstNonEmpty = lines[0];
    if (firstNonEmpty.length < 50 && !firstNonEmpty.includes('@') && !firstNonEmpty.match(/\d{5,}/)) {
      fullName = firstNonEmpty.replace(/^(Ad|Name|CV|Resume|Namizəd)[\s:]+/i, '').trim() || fullName;
    }
  }

  // 4. Job title extraction
  let jobTitle = 'Mütəxəssis';
  const titleKeywords = [
    'Developer', 'Mühəndis', 'Proqramçı', 'Mühasib', 'Dizayner', 'Menecer',
    'Aşpaz', 'Sürücü', 'Anbardar', 'Mühafizəçi', 'Marketoloq', 'QA', 'HR',
    'Specialist', 'Konsultant', 'Satıcı', 'Operator'
  ];
  for (const line of lines.slice(0, 6)) {
    if (titleKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
      jobTitle = line.replace(/^(Vəzifə|Position|Title)[\s:]+/i, '').trim();
      break;
    }
  }

  // 5. Experience extraction
  let experienceYears = 2;
  const expMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(?:il|year|лет|illik)/i);
  if (expMatch) {
    const parsedExp = parseFloat(expMatch[1]);
    if (!isNaN(parsedExp) && parsedExp >= 0 && parsedExp <= 40) {
      experienceYears = parsedExp;
    }
  }

  // 6. Expected Salary extraction
  let expectedSalary = 1000;
  const salaryMatch = cleanText.match(/(\d{3,5})\s*(?:AZN|manat|₼|\$|USD)/i);
  if (salaryMatch) {
    const parsedSal = parseInt(salaryMatch[1], 10);
    if (!isNaN(parsedSal) && parsedSal >= 300 && parsedSal <= 20000) {
      expectedSalary = parsedSal;
    }
  }

  // 7. Skills extraction
  const foundSkills: string[] = [];
  KNOWN_SKILL_KEYWORDS.forEach(sk => {
    const regex = new RegExp(`\\b${sk.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(cleanText)) {
      foundSkills.push(sk);
    }
  });

  // 8. Education extraction
  let educationLevel: SmartCandidate['educationLevel'] = 'Bakalavr';
  if (/magistr|master|магистр/i.test(cleanText)) educationLevel = 'Magistr';
  else if (/doktor|phd|доктор/i.test(cleanText)) educationLevel = 'Doktorantura';
  else if (/orta|kollec|peşə|среднее/i.test(cleanText)) educationLevel = 'Orta';

  // 9. Location extraction
  let location = 'Bakı, Azərbaycan';
  if (/Gəncə/i.test(cleanText)) location = 'Gəncə';
  else if (/Sumqayıt/i.test(cleanText)) location = 'Sumqayıt';
  else if (/Naxçıvan/i.test(cleanText)) location = 'Naxçıvan';
  else if (/Şəki/i.test(cleanText)) location = 'Şəki';
  else if (/Lənkəran/i.test(cleanText)) location = 'Lənkəran';

  return {
    id: 'cand-' + Math.random().toString(36).substring(2, 9),
    fullName,
    email,
    phone,
    jobTitle,
    experienceYears,
    skills: foundSkills.length > 0 ? foundSkills : ['Ümumi Bacarıqlar', 'Komanda İşi'],
    educationLevel,
    educationDetails: educationLevel + ' təhsili',
    expectedSalary,
    currency: 'AZN',
    location,
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: cleanText.includes('English') ? 'B2' : 'B1' }
    ],
    sourceFormat: fileName?.endsWith('.csv') ? 'csv' : fileName?.endsWith('.xlsx') ? 'xlsx' : 'manual',
    fileName: fileName || 'manual_entry.txt',
    tags: [jobTitle.split(' ')[0] || 'Namizəd', `${experienceYears} il təcrübə`],
    pipelineStage: 'sourced',
    rawText: cleanText.slice(0, 500),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Parses CSV or Excel file (.csv, .xlsx, .xls) into SmartCandidate list
 */
export async function parseCSVorExcel(file: File): Promise<SmartCandidate[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Fayl boşdur və ya məlumat cədvəli aşkar edilmədi.');
  }

  const results: SmartCandidate[] = [];

  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];

    // Helper to find value from possible key synonyms
    const findVal = (synonyms: string[]): string => {
      for (const s of synonyms) {
        for (const k of Object.keys(row)) {
          if (k.toLowerCase().trim() === s.toLowerCase().trim() || k.toLowerCase().includes(s.toLowerCase())) {
            const v = String(row[k] || '').trim();
            if (v) return v;
          }
        }
      }
      return '';
    };

    const fullName = findVal(['ad soyad', 'ad', 'fullname', 'full name', 'name', 'fio', 'namizəd', 'namized']) || `Namizəd #${idx + 1}`;
    const email = findVal(['email', 'e-poçt', 'epoct', 'e-mail', 'mail']) || `candidate${idx + 1}@jobia.az`;
    const phone = findVal(['telefon', 'phone', 'mobil', 'tel', 'elaqe', 'əlaqə']) || '+994 50 000 00 00';
    const jobTitle = findVal(['vəzifə', 'vezife', 'ixtisas', 'position', 'job title', 'title', 'rol']) || 'Mütəxəssis';
    
    // Experience years
    const expStr = findVal(['təcrübə', 'tecrube', 'experience', 'staj', 'il', 'years']);
    let experienceYears = 2;
    if (expStr) {
      const parsed = parseFloat(expStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) experienceYears = parsed;
    }

    // Salary
    const salStr = findVal(['maaş', 'maas', 'əməkhaqqı', 'emekhaqqi', 'salary', 'gözlənilən maaş', 'gozlenilen maas']);
    let expectedSalary = 1000;
    if (salStr) {
      const parsed = parseInt(salStr.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) expectedSalary = parsed;
    }

    // Skills
    const skillsStr = findVal(['bacarıqlar', 'bacariqlar', 'skills', 'biliklər', 'bilikler', 'texnologiyalar']);
    let skills: string[] = [];
    if (skillsStr) {
      skills = skillsStr.split(/[,;|•\n]+/).map(s => s.trim()).filter(Boolean);
    }
    if (skills.length === 0) {
      // Auto-extract from job title & notes
      skills = KNOWN_SKILL_KEYWORDS.filter(sk => (jobTitle + ' ' + fullName).toLowerCase().includes(sk.toLowerCase()));
      if (skills.length === 0) skills = ['Ümumi İxtisas Bacarıqları'];
    }

    // Education
    const eduStr = findVal(['təhsil', 'tehsil', 'education', 'dərəcə', 'derece']);
    let educationLevel: SmartCandidate['educationLevel'] = 'Bakalavr';
    if (/magistr|master/i.test(eduStr)) educationLevel = 'Magistr';
    else if (/doktor|phd/i.test(eduStr)) educationLevel = 'Doktorantura';
    else if (/orta|kollec/i.test(eduStr)) educationLevel = 'Orta';

    // Location
    const location = findVal(['şəhər', 'seher', 'şəhər/rayon', 'location', 'ünvan', 'unvan', 'city']) || 'Bakı, Azərbaycan';

    // Languages
    const langStr = findVal(['dillər', 'diller', 'languages', 'dil']);
    const languages: { language: string; level: string }[] = [
      { language: 'Azərbaycan', level: 'Ana dili' }
    ];
    if (langStr) {
      langStr.split(/[,;]+/).forEach(l => {
        const clean = l.trim();
        if (clean && !clean.toLowerCase().includes('azərbaycan')) {
          languages.push({ language: clean, level: 'Yaxşı' });
        }
      });
    }

    // Notes
    const notes = findVal(['qeyd', 'qeydlər', 'notes', 'haqqında', 'haqqinda', 'bio', 'şərh']);

    results.push({
      id: 'cand-csv-' + Math.random().toString(36).substring(2, 9),
      fullName,
      email,
      phone,
      jobTitle,
      experienceYears,
      skills,
      educationLevel,
      educationDetails: eduStr || educationLevel,
      expectedSalary,
      currency: 'AZN',
      location,
      languages,
      sourceFormat: file.name.endsWith('.csv') ? 'csv' : 'xlsx',
      fileName: file.name,
      tags: [jobTitle, `${experienceYears} il təcrübə`],
      pipelineStage: 'sourced',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Parses DOCX files using mammoth
 */
export async function parseDocxFile(file: File): Promise<SmartCandidate> {
  const buffer = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buffer });
  return parseRawTextToCandidate(res.value, file.name);
}

/**
 * Parses JSON candidate list
 */
export async function parseJSONFile(file: File): Promise<SmartCandidate[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : [data];

  return arr.map((item, idx) => ({
    id: item.id || 'cand-json-' + Math.random().toString(36).substring(2, 9),
    fullName: item.fullName || item.name || `Namizəd #${idx + 1}`,
    email: item.email || `candidate${idx + 1}@jobia.az`,
    phone: item.phone || '+994 50 000 00 00',
    jobTitle: item.jobTitle || item.title || 'Mütəxəssis',
    experienceYears: typeof item.experienceYears === 'number' ? item.experienceYears : 2,
    skills: Array.isArray(item.skills) ? item.skills : ['Bacarıqlar'],
    educationLevel: item.educationLevel || 'Bakalavr',
    educationDetails: item.educationDetails || '',
    expectedSalary: typeof item.expectedSalary === 'number' ? item.expectedSalary : 1000,
    currency: item.currency || 'AZN',
    location: item.location || 'Bakı, Azərbaycan',
    languages: Array.isArray(item.languages) ? item.languages : [{ language: 'Azərbaycan', level: 'Ana dili' }],
    sourceFormat: 'json',
    fileName: file.name,
    tags: Array.isArray(item.tags) ? item.tags : ['JSON İdxal'],
    pipelineStage: item.pipelineStage || 'sourced',
    notes: item.notes || '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Converts File to Base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * AI-Driven Single CV Parser (Supports PDF, DOCX, TXT, Images)
 * Accurately extracts candidate's real job title, suitable positions, skills, experience, and vacancy match!
 */
export async function parseSingleCVWithAI(
  file: File,
  vacancies?: any[],
  targetCriteria?: any
): Promise<SmartCandidate> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let rawText = '';
  let fileBase64 = '';

  // Extract client-side text for DOCX or TXT if available
  if (ext === 'docx') {
    try {
      const buffer = await file.arrayBuffer();
      const res = await mammoth.extractRawText({ arrayBuffer: buffer });
      rawText = res.value || '';
    } catch (e) {
      console.warn('Mammoth client-side extract notice:', e);
    }
  } else if (ext === 'txt') {
    try {
      rawText = await file.text();
    } catch {}
  }

  try {
    fileBase64 = await fileToBase64(file);
  } catch (e) {
    console.warn('fileToBase64 warning:', e);
  }

  // Call real backend AI endpoint
  const response = await fetch('/api/ai/parse-smart-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64,
      mimeType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
      fileName: file.name,
      rawText,
      vacancies,
      targetCriteria,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI CV analiz serveri cavab vermədi (${response.status})`);
  }

  const data = await response.json();
  const c = data.candidate || {};

  const cleanJobTitle = (c.primaryJobTitle || c.jobTitle || 'Mütəxəssis').trim();
  const suitablePositions: string[] = Array.isArray(c.suitablePositions) && c.suitablePositions.length > 0
    ? c.suitablePositions
    : [cleanJobTitle];

  return {
    id: 'cand-ai-' + Math.random().toString(36).substring(2, 9),
    fullName: c.fullName?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    email: c.email?.trim() || `namized-${Date.now().toString().slice(-4)}@jobia.az`,
    phone: c.phone?.trim() || '+994 50 000 00 00',
    jobTitle: cleanJobTitle,
    suitablePositions,
    bestMatchingVacancyId: c.bestMatchingVacancyId,
    bestMatchingVacancyTitle: c.bestMatchingVacancyTitle,
    bestMatchScore: typeof c.bestMatchScore === 'number' ? c.bestMatchScore : 80,
    matchRationale: c.matchRationale || `Namizəd «${cleanJobTitle}» ixtisası üzrə uyğundur.`,
    experienceYears: typeof c.experienceYears === 'number' ? c.experienceYears : 2,
    skills: Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : [cleanJobTitle, 'Təcrübə'],
    educationLevel: c.educationLevel || 'Bakalavr',
    educationDetails: c.educationDetails || 'Ali Təhsil',
    expectedSalary: typeof c.expectedSalary === 'number' && c.expectedSalary > 0 ? c.expectedSalary : 1200,
    currency: 'AZN',
    location: c.location?.trim() || 'Bakı, Azərbaycan',
    languages: Array.isArray(c.languages) && c.languages.length > 0
      ? c.languages
      : [{ language: 'Azərbaycan', level: 'Ana dili' }],
    sourceFormat: (ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : ext === 'txt' ? 'manual' : 'pdf') as any,
    fileName: file.name,
    originalFileName: file.name,
    fileDataUrl: fileBase64 || undefined,
    fileMimeType: file.type || (ext === 'pdf' ? 'application/pdf' : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain'),
    fileSize: file.size,
    summary: c.notes || c.summary || `${cleanJobTitle} sahəsində təcrübəli mütəxəssis.`,
    workExperiences: Array.isArray(c.workExperiences) ? c.workExperiences : undefined,
    educationHistory: Array.isArray(c.educationHistory) ? c.educationHistory : undefined,
    certifications: Array.isArray(c.certifications) ? c.certifications : undefined,
    projects: Array.isArray(c.projects) ? c.projects : undefined,
    careerLevel: c.careerLevel || (c.experienceYears >= 5 ? 'Senior' : c.experienceYears >= 2 ? 'Middle' : 'Junior'),
    tags: [cleanJobTitle, `${c.experienceYears || 2} il təcrübə`, ...(suitablePositions.slice(0, 1))],
    pipelineStage: 'sourced',
    notes: c.notes?.trim() || `AI Təhlili: Əsas vəzifə «${cleanJobTitle}». Uyğun olduğu sahələr: ${suitablePositions.join(', ')}.`,
    aiAnalyzed: true,
    rawText: rawText ? rawText.slice(0, 500) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * AI-Driven Raw Pasted Text CV Parser
 */
export async function parseRawTextWithAI(
  rawText: string,
  fileName: string = 'yapışdırılmış_cv.txt',
  vacancies?: any[],
  targetCriteria?: any
): Promise<SmartCandidate> {
  const response = await fetch('/api/ai/parse-smart-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText,
      fileName,
      vacancies,
      targetCriteria,
    }),
  });

  if (!response.ok) {
    throw new Error('AI CV mətnini analiz edə bilmədi.');
  }

  const data = await response.json();
  const c = data.candidate || {};
  const cleanJobTitle = (c.primaryJobTitle || c.jobTitle || 'Mütəxəssis').trim();
  const suitablePositions: string[] = Array.isArray(c.suitablePositions) && c.suitablePositions.length > 0
    ? c.suitablePositions
    : [cleanJobTitle];

  return {
    id: 'cand-ai-' + Math.random().toString(36).substring(2, 9),
    fullName: c.fullName?.trim() || 'Namizəd',
    email: c.email?.trim() || `namized-${Date.now().toString().slice(-4)}@jobia.az`,
    phone: c.phone?.trim() || '+994 50 000 00 00',
    jobTitle: cleanJobTitle,
    suitablePositions,
    bestMatchingVacancyId: c.bestMatchingVacancyId,
    bestMatchingVacancyTitle: c.bestMatchingVacancyTitle,
    bestMatchScore: typeof c.bestMatchScore === 'number' ? c.bestMatchScore : 80,
    matchRationale: c.matchRationale || `Namizəd «${cleanJobTitle}» ixtisası üzrə uyğundur.`,
    experienceYears: typeof c.experienceYears === 'number' ? c.experienceYears : 2,
    skills: Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : [cleanJobTitle],
    educationLevel: c.educationLevel || 'Bakalavr',
    educationDetails: c.educationDetails || 'Ali Təhsil',
    expectedSalary: typeof c.expectedSalary === 'number' && c.expectedSalary > 0 ? c.expectedSalary : 1200,
    currency: 'AZN',
    location: c.location?.trim() || 'Bakı, Azərbaycan',
    languages: Array.isArray(c.languages) && c.languages.length > 0
      ? c.languages
      : [{ language: 'Azərbaycan', level: 'Ana dili' }],
    sourceFormat: 'text_paste',
    fileName,
    tags: [cleanJobTitle, `${c.experienceYears || 2} il təcrübə`],
    pipelineStage: 'sourced',
    notes: c.notes?.trim() || `AI tərəfindən mətn əsasında təhlil edildi. Uyğun vəzifələr: ${suitablePositions.join(', ')}.`,
    aiAnalyzed: true,
    rawText: rawText.slice(0, 500),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Universal Multi-file Uploader with Real AI Intelligence & Batch Progress
 * Supports CSV, XLSX, PDF, DOCX, TXT, JSON
 */
export async function parseUploadedFilesWithAI(
  files: File[],
  vacancies?: any[],
  targetCriteria?: any,
  onProgress?: (current: number, total: number, fileName: string, statusText: string) => void
): Promise<SmartCandidate[]> {
  const allCandidates: SmartCandidate[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (onProgress) {
      onProgress(i, files.length, file.name, `AI analiz edir: ${file.name}...`);
    }

    try {
      if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
        const parsed = await parseCSVorExcel(file);
        // Enrich rows with vacancy matching & suitable positions
        for (const row of parsed) {
          row.suitablePositions = [row.jobTitle];
          if (Array.isArray(vacancies) && vacancies.length > 0) {
            const matched = vacancies.find(v =>
              v.title && (v.title.toLowerCase().includes(row.jobTitle.toLowerCase()) || row.jobTitle.toLowerCase().includes(v.title.toLowerCase()))
            );
            if (matched) {
              row.bestMatchingVacancyId = matched.id;
              row.bestMatchingVacancyTitle = matched.title;
              row.bestMatchScore = 88;
              row.matchRationale = `«${matched.title}» vəzifəsi tələbləri ilə uyğunlaşdırıldı.`;
            }
          }
        }
        allCandidates.push(...parsed);
      } else if (ext === 'json') {
        const parsed = await parseJSONFile(file);
        allCandidates.push(...parsed);
      } else {
        // PDF, DOCX, TXT, image -> Real AI extraction!
        const candidate = await parseSingleCVWithAI(file, vacancies, targetCriteria);
        allCandidates.push(candidate);
      }

      if (onProgress) {
        const latest = allCandidates[allCandidates.length - 1];
        onProgress(i + 1, files.length, latest?.fullName || file.name, `Tamamlandı: ${latest?.fullName || file.name} (${latest?.jobTitle || ''})`);
      }
    } catch (err: any) {
      console.warn(`Error AI parsing file ${file.name}:`, err);
      // Fallback so candidate is not lost
      const fallback = parseRawTextToCandidate(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), file.name);
      allCandidates.push(fallback);
      if (onProgress) {
        onProgress(i + 1, files.length, fallback.fullName, `Baza əlavəsi: ${fallback.fullName}`);
      }
    }
  }

  return allCandidates;
}

/**
 * Universal multi-file uploader that handles CSV, XLSX, DOCX, TXT, JSON (backward compatibility)
 */
export async function parseUploadedFiles(
  files: File[],
  vacancies?: any[],
  targetCriteria?: any,
  onProgress?: (current: number, total: number, fileName: string, statusText: string) => void
): Promise<SmartCandidate[]> {
  return parseUploadedFilesWithAI(files, vacancies, targetCriteria, onProgress);
}

/**
 * Downloads a pre-formatted clean CSV template with Azerbaijani columns
 */
export function downloadSampleCSVTemplate(): void {
  const headers = [
    'Ad Soyad',
    'Email',
    'Telefon',
    'Vəzifə',
    'Təcrübə İli',
    'Bacarıqlar (vergüllə)',
    'Təhsil',
    'Gözlənilən Maaş (AZN)',
    'Şəhər',
    'Dillər',
    'Qeydlər'
  ];

  const sampleRows = [
    [
      'Rəşad Qasımov',
      'reshad.qasimov@example.com',
      '+994 50 111 22 33',
      'Frontend React Developer',
      '4',
      'React, TypeScript, Tailwind CSS, Next.js, Redux, Git',
      'Bakalavr',
      '2200',
      'Bakı',
      'Azərbaycan, İngilis C1',
      'Portfeli güclüdür, dərhal işə başlaya bilər'
    ],
    [
      'Aytən Kərimova',
      'ayten.kerimova@example.com',
      '+994 55 222 33 44',
      'Maliyyə Analitiki & Baş Mühasib',
      '6',
      '1C 8.3, BTP, Maliyyə Hesabatları, Vergi Məcəlləsi, Excel',
      'Magistr',
      '1900',
      'Bakı',
      'Azərbaycan, Rus B2',
      'Böyük holdinqdə vergi audit təcrübəsi var'
    ],
    [
      'Cavid Hüseynov',
      'cavid.huseynov@example.com',
      '+994 70 333 44 55',
      'B2B Satış və Müştəri Meneceri',
      '3.5',
      'B2B Satış, Soyuq Zənglər, CRM Bitrix24, Danışıqlar',
      'Bakalavr',
      '1400',
      'Gəncə',
      'Azərbaycan, Rus C1',
      'Gəncə və qərb regionunda aktiv müştəri bazası var'
    ]
  ];

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...sampleRows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jobia_numune_cv_baza_shablon.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports candidate list to clean XLSX workbook
 */
export function exportCandidatesToExcel(
  candidates: SmartCandidate[],
  fileName: string = 'jobia_kadr_bazasi.xlsx'
): void {
  const rows = candidates.map(c => ({
    'ID': c.id,
    'Ad Soyad': c.fullName,
    'Vəzifə / İxtisas': c.jobTitle,
    'Mərhələ (Status)': c.pipelineStage,
    'Təcrübə (İl)': c.experienceYears,
    'Maaş Gözləntisi (AZN)': c.expectedSalary,
    'Əsas Bacarıqlar': c.skills.join(', '),
    'Təhsil': c.educationLevel + (c.educationDetails ? ` (${c.educationDetails})` : ''),
    'Şəhər / Lokasiya': c.location,
    'Əlaqə Telefonu': c.phone,
    'Email': c.email,
    'Dillər': c.languages.map(l => `${l.language} (${l.level})`).join(', '),
    'Mənbə Formatı': c.sourceFormat,
    'Fayl Adı': c.fileName || '',
    'Teqlər': c.tags.join(', '),
    'HR Qeydləri': c.notes || '',
    'Əlavə Tarixi': new Date(c.createdAt).toLocaleDateString('az-AZ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Namizədlər Baza');
  XLSX.writeFile(workbook, fileName);
}
