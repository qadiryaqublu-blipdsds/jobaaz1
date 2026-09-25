import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CVData, CreatedCVRecord, User } from '../types';
import { sanitizeForFirestore } from './firestoreService';
import { CV_TEMPLATES } from '../components/cv-templates/templateRegistry';

const CREATED_CVS_COLLECTION = 'createdCVs';
const STORAGE_KEY = 'jobia_created_cvs_registry';

/**
 * Calculate completeness percentage of a CVData object
 */
export function calculateCVCompleteness(cv: CVData): number {
  if (!cv || !cv.personalInfo) return 0;
  let score = 0;
  if (cv.personalInfo.fullName && cv.personalInfo.fullName.trim().length > 2) score += 15;
  if (cv.personalInfo.jobTitle && cv.personalInfo.jobTitle.trim().length > 2) score += 10;
  if (cv.personalInfo.email && cv.personalInfo.email.includes('@')) score += 10;
  if (cv.personalInfo.phone && cv.personalInfo.phone.trim().length > 5) score += 10;
  if (cv.personalInfo.address && cv.personalInfo.address.trim().length > 2) score += 5;
  if (cv.personalInfo.summary && cv.personalInfo.summary.trim().length > 20) score += 10;
  if (Array.isArray(cv.experiences) && cv.experiences.length > 0) {
    score += Math.min(cv.experiences.length * 10, 20);
  }
  if (Array.isArray(cv.education) && cv.education.length > 0) score += 10;
  if (Array.isArray(cv.skills) && cv.skills.length > 0) score += 10;
  return Math.min(score, 100);
}

/**
 * Get human readable name for a template ID
 */
export function getTemplateDisplayName(templateId?: string): string {
  if (!templateId) return 'Sadə Təmiz Ağ';
  const found = CV_TEMPLATES.find((t) => t.id === templateId);
  return found ? found.name : templateId;
}

/**
 * Initial rich seed data for the admin database representing real talent across Azerbaijan
 */
export const INITIAL_CREATED_CVS_SEEDS: CreatedCVRecord[] = [
  {
    id: 'cv-seed-01',
    userId: 'user-cand-101',
    userEmail: 'farid.hasanov@example.com',
    fullName: 'Fərid Həsənov',
    jobTitle: 'Senior Frontend Developer',
    email: 'farid.hasanov@example.com',
    phone: '+994 50 456 78 90',
    city: 'Bakı, Nəsimi ray.',
    template: 'baku-corporate',
    templateName: 'Bakı Korporativ',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    summary: 'Müasir web tətbiqləri, React ekosistemi və yüksək yüklü frontend sistemlərin yaradılmasında 5+ il təcrübəyə malik Mühəndis.',
    skills: ['TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'GraphQL', 'CI/CD'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 3,
    completenessScore: 95,
    downloadCount: 4,
    lastAction: 'downloaded',
    source: 'creator_studio',
    status: 'active',
    adminNotes: 'PASHA Bank və Kapital Bank vakansiyaları üçün güclü namizəddir.',
    tags: ['Frontend', 'Senior', 'React'],
    createdAt: '2026-09-21T10:15:00.000Z',
    updatedAt: '2026-09-24T18:20:00.000Z',
    cvData: {
      id: 'cv-seed-01',
      title: 'Senior Frontend Developer — Fərid Həsənov',
      language: 'az',
      template: 'baku-corporate',
      showPhoto: true,
      lastUpdated: '2026-09-24T18:20:00.000Z',
      personalInfo: {
        fullName: 'Fərid Həsənov',
        jobTitle: 'Senior Frontend Developer',
        email: 'farid.hasanov@example.com',
        phone: '+994 50 456 78 90',
        address: 'Bakı, Nəsimi ray.',
        linkedin: 'linkedin.com/in/faridhasanov',
        github: 'github.com/faridhasanov',
        portfolio: 'faridhasanov.dev',
        summary: 'Müasir web tətbiqləri, React ekosistemi və yüksək yüklü frontend sistemlərin yaradılmasında 5+ il təcrübəyə malik Mühəndis.',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s1',
          company: 'PASHA Bank OJSC',
          position: 'Senior Frontend Developer',
          location: 'Bakı',
          startDate: '03.2022',
          endDate: 'İndiyədək',
          current: true,
          description: 'Rəqəmsal bankçılıq interfeyslərinin arxitekturası və optimallaşdırılması.'
        },
        {
          id: 'exp-s2',
          company: 'Azercell Telecom',
          position: 'Frontend Developer',
          location: 'Bakı',
          startDate: '09.2019',
          endDate: '02.2022',
          current: false,
          description: 'Şəxsi kabinet və abunə modullarının hazırlanması.'
        }
      ],
      education: [
        {
          id: 'edu-s1',
          institution: 'ADA Universiteti',
          degree: 'Bakalavr',
          fieldOfStudy: 'Kompüter Elmləri',
          startDate: '2015',
          endDate: '2019',
          current: false,
          gpa: '3.75'
        }
      ],
      skills: [
        { id: 'sk-1', name: 'TypeScript', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-2', name: 'React.js', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-3', name: 'Next.js', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-4', name: 'Tailwind CSS', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-5', name: 'GraphQL', level: 'Yaxşı', category: 'Texniki' },
        { id: 'sk-6', name: 'CI/CD', level: 'Yaxşı', category: 'Texniki' },
      ],
      languages: [
        { id: 'l-1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-2', language: 'İngilis dili', proficiency: 'C1-C2 (Sərbəst)' },
        { id: 'l-3', language: 'Rus dili', proficiency: 'B1-B2 (Orta/İşgüzar)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-02',
    userId: 'user-cand-102',
    userEmail: 'leyla.mammadova@example.com',
    fullName: 'Leyla Məmmədova',
    jobTitle: 'Baş Mühasib / Maliyyə Meneceri',
    email: 'leyla.mammadova@example.com',
    phone: '+994 55 234 56 78',
    city: 'Bakı, Yasamal ray.',
    template: 'zurich-banking',
    templateName: 'Sürix Bankçılıq & Maliyyə',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    summary: 'Maliyyə hesabatlılığı (IFRS/MHBS), vergi uçotu və büdcə planlaşdırılması üzrə 7+ il təcrübəyə malik sertifikatlaşdırılmış Baş Mühasib.',
    skills: ['1C 8.3 Mühasibat', 'IFRS / MHBS', 'Vergi Məcəlləsi', 'Excel Advanced', 'Maliyyə Auditi', 'ACCA F3/F7'],
    skillsCount: 6,
    experienceCount: 3,
    educationCount: 1,
    languagesCount: 2,
    completenessScore: 92,
    downloadCount: 3,
    lastAction: 'downloaded',
    source: 'creator_studio',
    status: 'shortlisted',
    adminNotes: 'İri holdinq və distribütor şirkətləri üçün çox uyğundur.',
    tags: ['Mühasibat', 'Maliyyə', 'ACCA'],
    createdAt: '2026-09-22T14:30:00.000Z',
    updatedAt: '2026-09-24T12:00:00.000Z',
    cvData: {
      id: 'cv-seed-02',
      title: 'Baş Mühasib — Leyla Məmmədova',
      language: 'az',
      template: 'zurich-banking',
      showPhoto: true,
      lastUpdated: '2026-09-24T12:00:00.000Z',
      personalInfo: {
        fullName: 'Leyla Məmmədova',
        jobTitle: 'Baş Mühasib / Maliyyə Meneceri',
        email: 'leyla.mammadova@example.com',
        phone: '+994 55 234 56 78',
        address: 'Bakı, Yasamal ray.',
        summary: 'Maliyyə hesabatlılığı (IFRS/MHBS), vergi uçotu və büdcə planlaşdırılması üzrə 7+ il təcrübəyə malik sertifikatlaşdırılmış Baş Mühasib.',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s21',
          company: 'Baku Steel Company',
          position: 'Aparıcı Mühasib',
          location: 'Bakı',
          startDate: '2021',
          endDate: 'İndiyədək',
          current: true,
          description: 'Aylıq vergi və statistik hesabatların tərtibi, 1C uçotunun aparılması.'
        }
      ],
      education: [
        {
          id: 'edu-s21',
          institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)',
          degree: 'Bakalavr & Magistr',
          fieldOfStudy: 'Mühasibat uçotu və audit',
          startDate: '2013',
          endDate: '2019',
          current: false,
          gpa: '92 / 100'
        }
      ],
      skills: [
        { id: 'sk-21', name: '1C 8.3 Mühasibat', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-22', name: 'IFRS / MHBS', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-23', name: 'Excel Advanced', level: 'Əla / Ekspert', category: 'Texniki' }
      ],
      languages: [
        { id: 'l-21', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-22', language: 'Rus dili', proficiency: 'C1-C2 (Sərbəst)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-03',
    userId: 'user-cand-103',
    userEmail: 'elmir.qasimov@example.com',
    fullName: 'Elmir Qasımov',
    jobTitle: 'UI/UX & Product Designer',
    email: 'elmir.qasimov@example.com',
    phone: '+994 70 890 12 34',
    city: 'Bakı / Gəncə',
    template: 'paris-elegance',
    templateName: 'Paris Zəriflik & Moda',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    summary: 'Mobil və veb məhsulların istifadəçi yönümlü dizaynı, dizayn sistemləri və prototipləmə üzrə 4+ il təcrübəli UI/UX Dizayner.',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Mobile App UX', 'Adobe Creative Suite'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 2,
    completenessScore: 88,
    downloadCount: 5,
    lastAction: 'downloaded',
    source: 'creator_studio',
    status: 'contacted',
    adminNotes: 'İki beynəlxalq fintech layihəsində iştirak edib, portfeli çox cəlbedicidir.',
    tags: ['UI/UX', 'Figma', 'Fintech'],
    createdAt: '2026-09-23T09:10:00.000Z',
    updatedAt: '2026-09-24T16:45:00.000Z',
    cvData: {
      id: 'cv-seed-03',
      title: 'UI/UX Designer — Elmir Qasımov',
      language: 'az',
      template: 'paris-elegance',
      showPhoto: true,
      lastUpdated: '2026-09-24T16:45:00.000Z',
      personalInfo: {
        fullName: 'Elmir Qasımov',
        jobTitle: 'UI/UX & Product Designer',
        email: 'elmir.qasimov@example.com',
        phone: '+994 70 890 12 34',
        address: 'Bakı / Gəncə',
        portfolio: 'behance.net/elmirqasimov',
        summary: 'Mobil və veb məhsulların istifadəçi yönümlü dizaynı, dizayn sistemləri və prototipləmə üzrə 4+ il təcrübəli UI/UX Dizayner.',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s31',
          company: 'Innovate Solutions LLC',
          position: 'Lead UI/UX Designer',
          location: 'Bakı',
          startDate: '2022',
          endDate: 'İndiyədək',
          current: true,
          description: 'Design system yaradılması və mobil bank tətbiqi interfeysi.'
        }
      ],
      education: [
        {
          id: 'edu-s31',
          institution: 'Azərbaycan Dövlət Rəssamlıq Akademiyası',
          degree: 'Bakalavr',
          fieldOfStudy: 'Qrafik Dizayn və Multimedia',
          startDate: '2016',
          endDate: '2020',
          current: false
        }
      ],
      skills: [
        { id: 'sk-31', name: 'Figma', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
        { id: 'sk-32', name: 'Design Systems', level: 'Əla / Ekspert', category: 'Texniki' }
      ],
      languages: [
        { id: 'l-31', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-32', language: 'İngilis dili', proficiency: 'B2 (Yaxşı)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-04',
    userId: 'user-cand-104',
    userEmail: 'narmin.aliyeva@example.com',
    fullName: 'Nərmin Əliyeva',
    jobTitle: 'Rəqəmsal Marketinq & SMM Mütəxəssisi',
    email: 'narmin.aliyeva@example.com',
    phone: '+994 51 678 90 12',
    city: 'Bakı, Səbail ray.',
    template: 'creative-coral',
    templateName: 'Kreativ Mərcan',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    summary: 'Meta Ads, Google Ads və TikTok reklam kampaniyalarının idarə edilməsi, brend tanıtımı və SEO üzrə 3+ il təcrübə.',
    skills: ['Meta Ads Manager', 'Google Ads & Analytics', 'SEO & Content', 'Copywriting', 'Canva & CapCut', 'SMM Strategiya'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 3,
    completenessScore: 89,
    downloadCount: 2,
    lastAction: 'created',
    source: 'creator_studio',
    status: 'active',
    adminNotes: 'E-ticarət və pərakəndə sektorunda kampaniya təcrübəsi güclüdür.',
    tags: ['Marketinq', 'SMM', 'Meta Ads'],
    createdAt: '2026-09-24T08:00:00.000Z',
    updatedAt: '2026-09-24T14:10:00.000Z',
    cvData: {
      id: 'cv-seed-04',
      title: 'Digital Marketing — Nərmin Əliyeva',
      language: 'az',
      template: 'creative-coral',
      showPhoto: true,
      lastUpdated: '2026-09-24T14:10:00.000Z',
      personalInfo: {
        fullName: 'Nərmin Əliyeva',
        jobTitle: 'Rəqəmsal Marketinq & SMM Mütəxəssisi',
        email: 'narmin.aliyeva@example.com',
        phone: '+994 51 678 90 12',
        address: 'Bakı, Səbail ray.',
        summary: 'Meta Ads, Google Ads və TikTok reklam kampaniyalarının idarə edilməsi, brend tanıtımı və SEO üzrə 3+ il təcrübə.',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s41',
          company: 'Bravo Supermarketlər Şəbəkəsi',
          position: 'SMM Mütəxəssis',
          location: 'Bakı',
          startDate: '2022',
          endDate: 'İndiyədək',
          current: true,
          description: 'Aylıq büdcə ilə reklamların qurulması və hədəf kütlənin genişləndirilməsi.'
        }
      ],
      education: [
        {
          id: 'edu-s41',
          institution: 'Bakı Dövlət Universiteti',
          degree: 'Bakalavr',
          fieldOfStudy: 'Jurnalistika və İctimaiyyətlə Əlaqələr',
          startDate: '2017',
          endDate: '2021',
          current: false
        }
      ],
      skills: [
        { id: 'sk-41', name: 'Meta Ads Manager', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
        { id: 'sk-42', name: 'Google Ads & Analytics', level: 'Yaxşı', category: 'Texniki' }
      ],
      languages: [
        { id: 'l-41', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-42', language: 'İngilis dili', proficiency: 'B2 (Yaxşı)' },
        { id: 'l-43', language: 'Rus dili', proficiency: 'B1 (Orta)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-05',
    userId: 'user-cand-105',
    userEmail: 'rashad.kerimov@example.com',
    fullName: 'Rəşad Kərimov',
    jobTitle: 'İnşaat Mühəndisi / Layihə Rəhbəri',
    email: 'rashad.kerimov@example.com',
    phone: '+994 50 345 67 89',
    city: 'Sumqayıt / Bakı',
    template: 'ats-pro-clean',
    templateName: 'ATS Pro Clean',
    language: 'az',
    hasPhoto: false,
    summary: 'Sənaye və mülki tikinti obyektlərində tikinti-quraşdırma işlərinin keyfiyyət nəzarəti, smeta hesabatları və layihə icrası üzrə 6 il təcrübə.',
    skills: ['AutoCAD', 'Revit BIM', 'Smeta Tərtibi', 'Keyfiyyət Nəzarəti (QA/QC)', 'Tikinti Təhlükəsizliyi (HSE)', 'Primavera P6'],
    skillsCount: 6,
    experienceCount: 3,
    educationCount: 1,
    languagesCount: 2,
    completenessScore: 90,
    downloadCount: 3,
    lastAction: 'downloaded',
    source: 'creator_studio',
    status: 'active',
    adminNotes: 'Böyük infrastruktur layihələrində təcrübəsi var. Şəhərlərarası ezamiyyətə hazırdır.',
    tags: ['Mühəndislik', 'Tikinti', 'AutoCAD'],
    createdAt: '2026-09-20T11:20:00.000Z',
    updatedAt: '2026-09-23T10:15:00.000Z',
    cvData: {
      id: 'cv-seed-05',
      title: 'İnşaat Mühəndisi — Rəşad Kərimov',
      language: 'az',
      template: 'ats-pro-clean',
      showPhoto: false,
      lastUpdated: '2026-09-23T10:15:00.000Z',
      personalInfo: {
        fullName: 'Rəşad Kərimov',
        jobTitle: 'İnşaat Mühəndisi / Layihə Rəhbəri',
        email: 'rashad.kerimov@example.com',
        phone: '+994 50 345 67 89',
        address: 'Sumqayıt / Bakı',
        summary: 'Sənaye və mülki tikinti obyektlərində tikinti-quraşdırma işlərinin keyfiyyət nəzarəti, smeta hesabatları və layihə icrası üzrə 6 il təcrübə.'
      },
      experiences: [
        {
          id: 'exp-s51',
          company: 'Akkord Sənaye Tikinti İnvestisiya Korporasiyası',
          position: 'Aparıcı İnşaat Mühəndisi',
          location: 'Sumqayıt',
          startDate: '2020',
          endDate: 'İndiyədək',
          current: true,
          description: 'İnfrastruktur tikintilərinə nəzarət və texniki sənədləşmənin aparılması.'
        }
      ],
      education: [
        {
          id: 'edu-s51',
          institution: 'Azərbaycan Memarlıq və İnşaat Universiteti (AzMİU)',
          degree: 'Bakalavr',
          fieldOfStudy: 'Sənaye və mülki tikinti',
          startDate: '2014',
          endDate: '2018',
          current: false
        }
      ],
      skills: [
        { id: 'sk-51', name: 'AutoCAD', level: 'Əla / Ekspert', category: 'Alət / Proqram' },
        { id: 'sk-52', name: 'Revit BIM', level: 'Yaxşı', category: 'Texniki' }
      ],
      languages: [
        { id: 'l-51', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-52', language: 'Rus dili', proficiency: 'B2 (Yaxşı)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-06',
    userId: 'user-cand-106',
    userEmail: 'gunel.huseynova@example.com',
    fullName: 'Günel Hüseynova',
    jobTitle: 'Kadrlar üzrə Mütəxəssis (HR Generalist)',
    email: 'gunel.huseynova@example.com',
    phone: '+994 55 789 01 23',
    city: 'Bakı, Nərimanov ray.',
    template: 'toronto-hybrid',
    templateName: 'Toronto Hibrid',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    summary: 'Əmək Məcəlləsi qanunvericiliyi, işə qəbul (recruiting), əmək haqqı uçotu və kadr sənədləşməsi üzrə 5 il təcrübə.',
    skills: ['Əmək Məcəlləsi (AR)', '1C ZUP Kadr', 'İşə qəbul & Müsahibələr', 'Onboarding & Adaptasiya', 'KPI Sistemi', 'İşçilərin Motivasiyası'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 2,
    completenessScore: 91,
    downloadCount: 2,
    lastAction: 'updated',
    source: 'creator_studio',
    status: 'active',
    adminNotes: 'İri pərakəndə və xidmət şirkətləri üçün güclü kadr mütəxəssisidir.',
    tags: ['HR', 'Kadr', 'İşə Qəbul'],
    createdAt: '2026-09-21T13:40:00.000Z',
    updatedAt: '2026-09-24T15:20:00.000Z',
    cvData: {
      id: 'cv-seed-06',
      title: 'HR Generalist — Günel Hüseynova',
      language: 'az',
      template: 'toronto-hybrid',
      showPhoto: true,
      lastUpdated: '2026-09-24T15:20:00.000Z',
      personalInfo: {
        fullName: 'Günel Hüseynova',
        jobTitle: 'Kadrlar üzrə Mütəxəssis (HR Generalist)',
        email: 'gunel.huseynova@example.com',
        phone: '+994 55 789 01 23',
        address: 'Bakı, Nərimanov ray.',
        summary: 'Əmək Məcəlləsi qanunvericiliyi, işə qəbul (recruiting), əmək haqqı uçotu və kadr sənədləşməsi üzrə 5 il təcrübə.',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s61',
          company: 'Veysəloğlu Şirkətlər Qrupu',
          position: 'Aparıcı HR Mütəxəssis',
          location: 'Bakı',
          startDate: '2021',
          endDate: 'İndiyədək',
          current: true,
          description: 'İşə qəbul, əmək müqavilələri və işçilərin adaptasiya prosesinin koordinasiyası.'
        }
      ],
      education: [
        {
          id: 'edu-s61',
          institution: 'Dövlət İdarəçilik Akademiyası',
          degree: 'Bakalavr',
          fieldOfStudy: 'Dövlət və Bələdiyyə İdarəetməsi',
          startDate: '2015',
          endDate: '2019',
          current: false
        }
      ],
      skills: [
        { id: 'sk-61', name: 'Əmək Məcəlləsi (AR)', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-62', name: '1C ZUP Kadr', level: 'Əla / Ekspert', category: 'Alət / Proqram' }
      ],
      languages: [
        { id: 'l-61', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-62', language: 'İngilis dili', proficiency: 'B1 (Orta)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-07',
    userId: 'user-cand-107',
    userEmail: 'murad.babayev@example.com',
    fullName: 'Murad Babayev',
    jobTitle: 'Korporativ Satış & B2B Menecer',
    email: 'murad.babayev@example.com',
    phone: '+994 50 876 54 32',
    city: 'Bakı / Xırdalan',
    template: 'practical-direct',
    templateName: 'Praktik İşçi & Xidmət',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    summary: 'B2B satışlar, korporativ müştəri portfelinin idarə edilməsi, tenderlər və danışıqların aparılması üzrə 4 il uğurlu təcrübə.',
    skills: ['B2B Satış', 'CRM (Bitrix24)', 'Danışıqlar Aparma', 'Tender Sənədləşməsi', 'Müştəri Bazası İdarəetməsi', 'Prezentasiya Bacarığı'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 2,
    completenessScore: 87,
    downloadCount: 1,
    lastAction: 'created',
    source: 'creator_studio',
    status: 'active',
    adminNotes: 'Sürücülük vəsiqəsi və şəxsi avtomobili var, səyyar satışda çox təcrübəlidir.',
    tags: ['Satış', 'B2B', 'Bitrix24'],
    createdAt: '2026-09-24T07:15:00.000Z',
    updatedAt: '2026-09-24T07:15:00.000Z',
    cvData: {
      id: 'cv-seed-07',
      title: 'B2B Sales — Murad Babayev',
      language: 'az',
      template: 'practical-direct',
      showPhoto: true,
      lastUpdated: '2026-09-24T07:15:00.000Z',
      personalInfo: {
        fullName: 'Murad Babayev',
        jobTitle: 'Korporativ Satış & B2B Menecer',
        email: 'murad.babayev@example.com',
        phone: '+994 50 876 54 32',
        address: 'Bakı / Xırdalan',
        summary: 'B2B satışlar, korporativ müştəri portfelinin idarə edilməsi, tenderlər və danışıqların aparılması üzrə 4 il uğurlu təcrübə.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s71',
          company: 'Baku Electronics',
          position: 'Korporativ Satış Mütəxəssisi',
          location: 'Bakı',
          startDate: '2022',
          endDate: 'İndiyədək',
          current: true,
          description: 'Korporativ müştərilərə texnika satışları və tender təkliflərinin hazırlanması.'
        }
      ],
      education: [
        {
          id: 'edu-s71',
          institution: 'Xəzər Universiteti',
          degree: 'Bakalavr',
          fieldOfStudy: 'Biznesin İdarə Edilməsi (BBA)',
          startDate: '2016',
          endDate: '2020',
          current: false
        }
      ],
      skills: [
        { id: 'sk-71', name: 'B2B Satış', level: 'Əla / Ekspert', category: 'Soft skill' },
        { id: 'sk-72', name: 'CRM (Bitrix24)', level: 'Yaxşı', category: 'Alət / Proqram' }
      ],
      languages: [
        { id: 'l-71', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-72', language: 'Rus dili', proficiency: 'B2 (Yaxşı)' }
      ],
      projects: [],
      certificates: []
    }
  },
  {
    id: 'cv-seed-08',
    userId: 'user-cand-108',
    userEmail: 'aydan.quliyeva@example.com',
    fullName: 'Dr. Aydan Quliyeva',
    jobTitle: 'Terapevt & Tibbi Məsləhətçi',
    email: 'aydan.quliyeva@example.com',
    phone: '+994 77 456 78 90',
    city: 'Bakı, Binəqədi ray.',
    template: 'florence-classic',
    templateName: 'Florensiya Klassik',
    language: 'az',
    hasPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    summary: 'Daxili xəstəliklərin diaqnostikası, xəstələrin ambulator və stasionar müalicəsi üzrə 8 il peşəkar təcrübəyə malik Həkim-terapevt.',
    skills: ['Terapevtik Diaqnostika', 'EKQ / USM Qiymətləndirmə', 'Tibbi Protokollar', 'Elektron Səhiyyə (EHIS)', 'Xəstə Təqibi', 'İlk Yardım'],
    skillsCount: 6,
    experienceCount: 2,
    educationCount: 1,
    languagesCount: 3,
    completenessScore: 94,
    downloadCount: 3,
    lastAction: 'downloaded',
    source: 'creator_studio',
    status: 'shortlisted',
    adminNotes: 'Özəl klinikalar və sığorta şirkətləri üçün yüksək ixtisaslı tibb mütəxəssisidir.',
    tags: ['Tibb', 'Həkim', 'Səhiyyə'],
    createdAt: '2026-09-22T16:00:00.000Z',
    updatedAt: '2026-09-24T11:30:00.000Z',
    cvData: {
      id: 'cv-seed-08',
      title: 'Həkim Terapevt — Dr. Aydan Quliyeva',
      language: 'az',
      template: 'florence-classic',
      showPhoto: true,
      lastUpdated: '2026-09-24T11:30:00.000Z',
      personalInfo: {
        fullName: 'Dr. Aydan Quliyeva',
        jobTitle: 'Terapevt & Tibbi Məsləhətçi',
        email: 'aydan.quliyeva@example.com',
        phone: '+994 77 456 78 90',
        address: 'Bakı, Binəqədi ray.',
        summary: 'Daxili xəstəliklərin diaqnostikası, xəstələrin ambulator və stasionar müalicəsi üzrə 8 il peşəkar təcrübəyə malik Həkim-terapevt.',
        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      },
      experiences: [
        {
          id: 'exp-s81',
          company: 'Bona Dea Beynəlxalq Hospitalı',
          position: 'Həkim Terapevt',
          location: 'Bakı',
          startDate: '2019',
          endDate: 'İndiyədək',
          current: true,
          description: 'Ambulator qəbulların aparılması, xəstələrin müalicə planlarının tərtibi.'
        }
      ],
      education: [
        {
          id: 'edu-s81',
          institution: 'Azərbaycan Tibb Universiteti (ATU)',
          degree: 'Müalicə işi & Rezidentura',
          fieldOfStudy: 'Terapiya',
          startDate: '2010',
          endDate: '2017',
          current: false
        }
      ],
      skills: [
        { id: 'sk-81', name: 'Terapevtik Diaqnostika', level: 'Əla / Ekspert', category: 'Texniki' },
        { id: 'sk-82', name: 'EKQ / USM Qiymətləndirmə', level: 'Əla / Ekspert', category: 'Texniki' }
      ],
      languages: [
        { id: 'l-81', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
        { id: 'l-82', language: 'İngilis dili', proficiency: 'B2 (Yaxşı)' },
        { id: 'l-83', language: 'Rus dili', proficiency: 'C1 (Sərbəst)' }
      ],
      projects: [],
      certificates: []
    }
  }
];

/**
 * Get stored created CVs from local storage
 */
export function getStoredCreatedCVs(): CreatedCVRecord[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CREATED_CVS_SEEDS));
      return INITIAL_CREATED_CVS_SEEDS;
    }
  } catch {}
  return INITIAL_CREATED_CVS_SEEDS;
}

/**
 * Save created CVs to local storage
 */
export function saveStoredCreatedCVs(list: CreatedCVRecord[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Record a CV creation, update or download into the registry
 * Called automatically from CVCreator (save, download, generate)
 */
export async function recordCreatedCVToRegistry(params: {
  cvData: CVData;
  user?: User | null;
  action?: 'created' | 'updated' | 'downloaded' | 'ai_generated';
  source?: 'creator_studio' | 'candidate_profile' | 'job_application';
}): Promise<CreatedCVRecord> {
  const { cvData, user, action = 'updated', source = 'creator_studio' } = params;

  // Generate stable record ID based on user ID or email or persistent ID
  const email = (cvData.personalInfo?.email || user?.email || '').trim().toLowerCase();
  const rawFullName = cvData.personalInfo?.fullName || user?.fullName || 'Anonim Namizəd';
  
  // Use a predictable stable ID so repeated saves update the same record instead of creating duplicates
  let recordId: string;
  if (user?.id && !user.id.startsWith('demo-')) {
    recordId = `cv-user-${user.id}`;
  } else if (email) {
    recordId = `cv-email-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  } else {
    recordId = `cv-anon-${Date.now()}`;
  }

  const existingList = getStoredCreatedCVs();
  const existingRecord = existingList.find((r) => r.id === recordId || (email && r.email?.toLowerCase() === email));

  const now = new Date().toISOString();
  const completeness = calculateCVCompleteness(cvData);
  const templateId = cvData.template || 'simple-clean';
  const templateName = getTemplateDisplayName(templateId);

  const skillsList = Array.isArray(cvData.skills) 
    ? cvData.skills.map((s) => typeof s === 'string' ? s : s.name).filter(Boolean)
    : [];

  const downloadCount = (existingRecord?.downloadCount || 0) + (action === 'downloaded' ? 1 : 0);

  const record: CreatedCVRecord = {
    id: existingRecord?.id || recordId,
    userId: user?.id || existingRecord?.userId || 'guest',
    userEmail: user?.email || email || existingRecord?.userEmail,
    fullName: rawFullName,
    jobTitle: cvData.personalInfo?.jobTitle || existingRecord?.jobTitle || 'Mütəxəssis',
    email: email || existingRecord?.email || '',
    phone: cvData.personalInfo?.phone || existingRecord?.phone || '',
    city: cvData.personalInfo?.address || existingRecord?.city || 'Bakı, Azərbaycan',
    template: templateId,
    templateName: templateName,
    language: cvData.language || 'az',
    hasPhoto: Boolean(cvData.showPhoto && cvData.personalInfo?.photoUrl),
    photoUrl: cvData.personalInfo?.photoUrl || existingRecord?.photoUrl,
    summary: cvData.personalInfo?.summary || existingRecord?.summary || '',
    skills: skillsList.length > 0 ? skillsList : (existingRecord?.skills || []),
    skillsCount: skillsList.length,
    experienceCount: Array.isArray(cvData.experiences) ? cvData.experiences.length : 0,
    educationCount: Array.isArray(cvData.education) ? cvData.education.length : 0,
    languagesCount: Array.isArray(cvData.languages) ? cvData.languages.length : 0,
    completenessScore: completeness,
    downloadCount: downloadCount,
    lastAction: action,
    source: source,
    status: existingRecord?.status || 'active',
    adminNotes: existingRecord?.adminNotes || '',
    tags: existingRecord?.tags || (skillsList.slice(0, 3)),
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
    cvData: cvData
  };

  // 1. Immediately update localStorage for instant reactive feedback
  const updatedList = [record, ...existingList.filter((r) => r.id !== record.id)];
  saveStoredCreatedCVs(updatedList);

  // 2. Persist to Firestore createdCVs collection
  try {
    const sanitized = sanitizeForFirestore(record);
    await setDoc(doc(db, CREATED_CVS_COLLECTION, record.id), sanitized, { merge: true });
  } catch (err) {
    console.warn('Notice: Firestore createdCV save note (saved to local vault):', err);
  }

  // 3. Dispatch window event for live Admin dashboard sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_created_cv_registered', { detail: record }));
  }

  return record;
}

/**
 * Fetch all Created CVs for Admin panel from Firestore with local vault fallback and deep profile aggregation
 */
export async function getAllCreatedCVsFromFirestore(): Promise<CreatedCVRecord[]> {
  const map = new Map<string, CreatedCVRecord>();

  // 1. Load from local cache / seeds first
  const localList = getStoredCreatedCVs();
  localList.forEach((r) => {
    if (r && r.id) map.set(r.id, r);
  });

  // 2. Fetch from Firestore createdCVs collection
  try {
    const snap = await getDocs(collection(db, CREATED_CVS_COLLECTION));
    snap.forEach((d) => {
      const data = d.data() as CreatedCVRecord;
      if (data && data.fullName) {
        map.set(d.id, { ...data, id: d.id });
      }
    });
  } catch (err) {
    console.warn('Notice: Firestore createdCVs query notice:', err);
  }

  // 3. Aggregate any candidate profiles in Firestore that have cvData or filled resumes
  try {
    const candSnap = await getDocs(collection(db, 'candidateProfiles'));
    candSnap.forEach((d) => {
      const data = d.data() as any;
      const emailKey = (data.email || '').trim().toLowerCase();
      const existing = emailKey ? Array.from(map.values()).find((x) => x.email?.toLowerCase() === emailKey) : null;
      if (!existing && data.fullName) {
        const id = `cv-cand-${d.id}`;
        const cvData: CVData = data.cvData || {
          id: d.id,
          title: `CV — ${data.fullName}`,
          language: 'az',
          template: 'baku-corporate',
          showPhoto: Boolean(data.profilePhoto),
          lastUpdated: data.updatedAt || new Date().toISOString(),
          personalInfo: {
            fullName: data.fullName,
            jobTitle: data.professionalTitle || 'Namizəd',
            email: data.email || '',
            phone: data.phone || '',
            address: data.location || 'Bakı',
            summary: data.about || '',
            photoUrl: data.profilePhoto,
          },
          experiences: data.workExperience || [],
          education: data.education || [],
          skills: (data.skills || []).map((s: string, idx: number) => ({ id: `sk-${idx}`, name: s, level: 'Yaxşı' })),
          languages: data.languages || [],
          projects: [],
          certificates: data.certifications || []
        };

        const rec: CreatedCVRecord = {
          id,
          userId: data.userId || d.id,
          userEmail: data.email,
          fullName: data.fullName,
          jobTitle: data.professionalTitle || 'Mütəxəssis',
          email: data.email || '',
          phone: data.phone || '',
          city: data.location || 'Bakı',
          template: cvData.template || 'baku-corporate',
          templateName: getTemplateDisplayName(cvData.template),
          language: cvData.language || 'az',
          hasPhoto: Boolean(data.profilePhoto),
          photoUrl: data.profilePhoto,
          summary: data.about || '',
          skills: data.skills || [],
          skillsCount: Array.isArray(data.skills) ? data.skills.length : 0,
          experienceCount: Array.isArray(data.workExperience) ? data.workExperience.length : 0,
          educationCount: Array.isArray(data.education) ? data.education.length : 0,
          languagesCount: Array.isArray(data.languages) ? data.languages.length : 0,
          completenessScore: calculateCVCompleteness(cvData),
          downloadCount: 1,
          lastAction: 'created',
          source: 'candidate_profile',
          status: 'active',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          cvData: cvData
        };
        map.set(id, rec);
      }
    });
  } catch (err) {
    console.warn('Notice: Candidate profile aggregation notice:', err);
  }

  const list = Array.from(map.values());
  // Sort descending by updatedAt / createdAt
  list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  // Save merged view back to local cache
  saveStoredCreatedCVs(list);
  return list;
}

/**
 * Realtime subscription to Created CVs
 */
export function subscribeToCreatedCVs(callback: (list: CreatedCVRecord[]) => void): () => void {
  // Initial local dispatch
  const initial = getStoredCreatedCVs();
  callback(initial);

  // Window event listener
  const handleLocalUpdate = () => {
    callback(getStoredCreatedCVs());
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('jobia_created_cv_registered', handleLocalUpdate);
  }

  // Firestore listener
  try {
    const q = collection(db, CREATED_CVS_COLLECTION);
    const unsubscribe = onSnapshot(q, (snap) => {
      const items: CreatedCVRecord[] = [];
      snap.forEach((d) => {
        const item = { ...d.data(), id: d.id } as CreatedCVRecord;
        if (item.fullName) items.push(item);
      });

      if (items.length > 0) {
        const local = getStoredCreatedCVs();
        const map = new Map<string, CreatedCVRecord>();
        [...items, ...local].forEach((r) => {
          if (r && r.id) map.set(r.id, r);
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        saveStoredCreatedCVs(merged);
        callback(merged);
      }
    }, (err) => {
      console.warn('Firestore createdCVs snapshot notice, using fallback:', err);
    });

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('jobia_created_cv_registered', handleLocalUpdate);
      }
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('jobia_created_cv_registered', handleLocalUpdate);
      }
    };
  }
}

/**
 * Update a Created CV record (e.g. status, admin notes, tags)
 */
export async function updateCreatedCVInRegistry(
  recordId: string, 
  updates: Partial<Pick<CreatedCVRecord, 'status' | 'adminNotes' | 'tags'>>
): Promise<void> {
  const localList = getStoredCreatedCVs();
  const idx = localList.findIndex((r) => r.id === recordId);
  const now = new Date().toISOString();

  if (idx >= 0) {
    localList[idx] = {
      ...localList[idx],
      ...updates,
      updatedAt: now
    };
    saveStoredCreatedCVs(localList);
  }

  try {
    await updateDoc(doc(db, CREATED_CVS_COLLECTION, recordId), sanitizeForFirestore({
      ...updates,
      updatedAt: now
    }));
  } catch (err) {
    console.warn('Notice: Firestore updateCreatedCV error, saved locally:', err);
  }
}

/**
 * Delete a Created CV record from the registry
 */
export async function deleteCreatedCVFromRegistry(recordId: string): Promise<void> {
  const localList = getStoredCreatedCVs().filter((r) => r.id !== recordId);
  saveStoredCreatedCVs(localList);

  try {
    await deleteDoc(doc(db, CREATED_CVS_COLLECTION, recordId));
  } catch (err) {
    console.warn('Notice: Firestore deleteCreatedCV error, removed locally:', err);
  }
}

/**
 * Export CVs list to Microsoft Excel-compatible CSV file (with UTF-8 BOM)
 * Specially designed so Azerbaijani characters (Ə, ə, Ğ, ğ, İ, ı, Ö, ö, Ş, ş, Ç, ç) display cleanly
 */
export function exportCreatedCVsToCSV(cvList: CreatedCVRecord[]): void {
  const headers = [
    '№',
    'Ad və Soyad',
    'Vəzifə / İxtisas',
    'E-poçt',
    'Telefon',
    'Şəhər / Ünvan',
    'Seçilmiş Şablon',
    'CV Dili',
    'Şəkil Varmı',
    'Təcrübə Sayı',
    'Təhsil Müəssisəsi',
    'Əsas Bacarıqlar',
    'Doluluq Faizi',
    'PDF Yükləmə Sayı',
    'Mənbə',
    'Status',
    'Admin Qeydləri',
    'Hazırlanma Tarixi',
    'Son Yenilənmə'
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = cvList.map((r, index) => {
    const firstEdu = Array.isArray(r.cvData?.education) && r.cvData.education.length > 0 
      ? `${r.cvData.education[0].institution || ''} (${r.cvData.education[0].degree || ''})`
      : 'Göstərilməyib';
    const skillsJoined = (r.skills || []).slice(0, 6).join(', ');

    return [
      index + 1,
      escapeCSV(r.fullName),
      escapeCSV(r.jobTitle),
      escapeCSV(r.email),
      escapeCSV(r.phone),
      escapeCSV(r.city),
      escapeCSV(r.templateName || r.template),
      escapeCSV(r.language?.toUpperCase()),
      escapeCSV(r.hasPhoto ? 'Bəli' : 'Xeyr'),
      escapeCSV(r.experienceCount),
      escapeCSV(firstEdu),
      escapeCSV(skillsJoined),
      escapeCSV(`${r.completenessScore}%`),
      escapeCSV(r.downloadCount),
      escapeCSV(r.source === 'creator_studio' ? 'CV Konstruktor' : r.source === 'candidate_profile' ? 'Namizəd Profili' : 'Vakansiya'),
      escapeCSV(r.status === 'active' ? 'Aktiv' : r.status === 'shortlisted' ? 'Seçilmiş' : r.status === 'contacted' ? 'Əlaqə saxlanılıb' : 'Arxiv'),
      escapeCSV(r.adminNotes || ''),
      escapeCSV(new Date(r.createdAt).toLocaleString('az-AZ')),
      escapeCSV(new Date(r.updatedAt).toLocaleString('az-AZ'))
    ].join(';');
  });

  // Prepend UTF-8 BOM so Excel opens with Azerbaijani special characters
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `Jobia_CV_Hazirlayanlar_Bazasi_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export CVs list to JSON file
 */
export function exportCreatedCVsToJSON(cvList: CreatedCVRecord[]): void {
  const jsonStr = JSON.stringify(cvList, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `Jobia_CV_Data_Toplusu_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
