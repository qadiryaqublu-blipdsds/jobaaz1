import { CVLanguage, CVPhotoSize, CVPhotoShape } from '../../types';

export interface CVDictionaryTerms {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  projects: string;
  certificates: string;
  present: string;
  contact: string;
  portfolio: string;
  native: string;
  fluent: string;
  intermediate: string;
  basic: string;
  keyAchievements: string;
  aboutMe: string;
  techStack: string;
  academicEducation: string;
  scientificProjects: string;
  honorsAndCertificates: string;
  leadershipSkills: string;
  strategicProjects: string;
  practicalSkills: string;
  graduateOrIntern: string;
  internshipPrograms: string;
  ongoing: string;
}

export const CV_TRANSLATIONS: Record<CVLanguage, CVDictionaryTerms> = {
  az: {
    summary: 'Peşəkar Xülasə',
    experience: 'İş Təcrübəsi',
    education: 'Təhsil',
    skills: 'Bacarıqlar',
    languages: 'Dil Bilikləri',
    projects: 'Layihələr',
    certificates: 'Sertifikatlar',
    present: 'Hal-hazırda',
    contact: 'Əlaqə Məlumatları',
    portfolio: 'Portfolio / Vebsayt',
    native: 'Ana dili',
    fluent: 'Sərbəst (C1-C2)',
    intermediate: 'Orta (B1-B2)',
    basic: 'Baza (A1-A2)',
    keyAchievements: 'Əsas nailiyyətlər',
    aboutMe: 'Haqqımda',
    techStack: 'Texnologiyalar və Bacarıqlar',
    academicEducation: 'Akademik Təhsil',
    scientificProjects: 'Elmi və Tətbiqi Layihələr',
    honorsAndCertificates: 'Sertifikatlar & Mükafatlar',
    leadershipSkills: 'Liderlik və Strateji Bacarıqlar',
    strategicProjects: 'Strateji Layihələr & Təşəbbüslər',
    practicalSkills: 'Praktiki Bacarıqlar',
    graduateOrIntern: 'Təcrübəçi / Məzun',
    internshipPrograms: 'Təcrübə Proqramları',
    ongoing: 'Davam edir'
  },
  en: {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Core Competencies & Skills',
    languages: 'Languages',
    projects: 'Key Projects',
    certificates: 'Certifications',
    present: 'Present',
    contact: 'Contact Information',
    portfolio: 'Portfolio / Website',
    native: 'Native',
    fluent: 'Fluent (C1-C2)',
    intermediate: 'Intermediate (B1-B2)',
    basic: 'Elementary (A1-A2)',
    keyAchievements: 'Key Achievements',
    aboutMe: 'About Me',
    techStack: 'Tech Stack & Skills',
    academicEducation: 'Academic Education',
    scientificProjects: 'Scientific & Applied Projects',
    honorsAndCertificates: 'Certifications & Honors',
    leadershipSkills: 'Leadership & Strategic Skills',
    strategicProjects: 'Strategic Projects & Initiatives',
    practicalSkills: 'Practical Competencies',
    graduateOrIntern: 'Intern / Graduate',
    internshipPrograms: 'Internship Programs',
    ongoing: 'Ongoing'
  },
  ru: {
    summary: 'О себе / Профессиональный профиль',
    experience: 'Опыт работы',
    education: 'Образование',
    skills: 'Ключевые навыки',
    languages: 'Владение языками',
    projects: 'Проекты',
    certificates: 'Сертификаты и курсы',
    present: 'По настоящее время',
    contact: 'Контактные данные',
    portfolio: 'Портфолио / Сайт',
    native: 'Родной язык',
    fluent: 'Свободно (C1-C2)',
    intermediate: 'Средний (B1-B2)',
    basic: 'Базовый (A1-A2)',
    keyAchievements: 'Ключевые достижения',
    aboutMe: 'Обо мне',
    techStack: 'Стек технологий и навыки',
    academicEducation: 'Академическое образование',
    scientificProjects: 'Научные и прикладные проекты',
    honorsAndCertificates: 'Сертификаты и награды',
    leadershipSkills: 'Лидерство и стратегические навыки',
    strategicProjects: 'Стратегические проекты и инициативы',
    practicalSkills: 'Практические навыки',
    graduateOrIntern: 'Стажер / Выпускник',
    internshipPrograms: 'Программы стажировок',
    ongoing: 'Продолжается'
  },
  tr: {
    summary: 'Profesyonel Özet',
    experience: 'İş Deneyimi',
    education: 'Eğitim Bilgileri',
    skills: 'Yetenekler ve Beceriler',
    languages: 'Yabancı Diller',
    projects: 'Projeler',
    certificates: 'Sertifikalar ve Başarılar',
    present: 'Günümüz',
    contact: 'İletişim Bilgileri',
    portfolio: 'Portfolyo / Web Sitesi',
    native: 'Ana Dil',
    fluent: 'İleri Düzey (C1-C2)',
    intermediate: 'Orta Düzey (B1-B2)',
    basic: 'Temel Düzey (A1-A2)',
    keyAchievements: 'Önemli Başarılar',
    aboutMe: 'Hakkımda',
    techStack: 'Teknoloji Yığını ve Beceriler',
    academicEducation: 'Akademik Eğitim',
    scientificProjects: 'Bilimsel ve Uygulamalı Projeler',
    honorsAndCertificates: 'Sertifikalar ve Ödüller',
    leadershipSkills: 'Liderlik ve Stratejik Beceriler',
    strategicProjects: 'Stratejik Projeler ve Girişimler',
    practicalSkills: 'Pratik Beceriler',
    graduateOrIntern: 'Stajyer / Mezun',
    internshipPrograms: 'Staj Programları',
    ongoing: 'Devam Ediyor'
  }
};

export function getCVTerms(lang?: CVLanguage): CVDictionaryTerms {
  if (!lang || !CV_TRANSLATIONS[lang]) {
    return CV_TRANSLATIONS.az;
  }
  return CV_TRANSLATIONS[lang];
}

export function getPhotoClasses(size?: CVPhotoSize, shape?: CVPhotoShape): string {
  // Default and base size is 112px (w-28 h-28)
  let sizeClass = 'w-28 h-28';
  if (size === '112px' || size === 'sm' || size === 'md') {
    sizeClass = 'w-28 h-28'; // 112px
  } else if (size === '140px' || size === 'lg') {
    sizeClass = 'w-[140px] h-[140px]'; // 140px
  } else if (size === '168px' || size === 'xl') {
    sizeClass = 'w-[168px] h-[168px]'; // 168px
  }

  let shapeClass = 'rounded-full'; // default circle
  if (shape === 'rounded') shapeClass = 'rounded-2xl';
  if (shape === 'square') shapeClass = 'rounded-lg';

  return `${sizeClass} ${shapeClass} object-cover shrink-0 transition-all`;
}
