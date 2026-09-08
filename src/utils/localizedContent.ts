import { Vacancy, EmploymentType, ExperienceLevel } from '../types';
import { Language } from '../i18n/types';

// ============================================================================
// 1. JOB CATEGORIES LOCALIZATION
// ============================================================================
export const CATEGORY_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  'İT və Proqramlaşdırma': {
    en: 'IT & Software Development',
    ru: 'ИТ и Разработка ПО',
  },
  'Maliyyə və Mühasibat': {
    en: 'Finance & Accounting',
    ru: 'Финансы и Бухгалтерия',
  },
  'Satış və Müştəri Xidmətləri': {
    en: 'Sales & Customer Service',
    ru: 'Продажи и Клиентский сервис',
  },
  'Marketinq və PR': {
    en: 'Marketing & PR',
    ru: 'Маркетинг и PR',
  },
  'Dizayn və Yaradıcılıq': {
    en: 'Design & Creative',
    ru: 'Дизайн и Креатив',
  },
  'İnzibati və Ofis': {
    en: 'Administrative & Office',
    ru: 'Администрация и Офис',
  },
  'İnsan Resursları (HR)': {
    en: 'Human Resources (HR)',
    ru: 'Управление персоналом (HR)',
  },
  'Təhsil və Təlim': {
    en: 'Education & Training',
    ru: 'Образование и Обучение',
  },
  'Səhiyyə və Tibb': {
    en: 'Healthcare & Medicine',
    ru: 'Здравоохранение и Медицина',
  },
  'Tikinti və Mühəndislik': {
    en: 'Construction & Engineering',
    ru: 'Строительство и Инженерия',
  },
  'Restoran və Otelçilik': {
    en: 'Hospitality & Restaurants',
    ru: 'Гостиницы и Рестораны',
  },
  'Loqistika və Nəqliyyat': {
    en: 'Logistics & Transportation',
    ru: 'Логистика и Транспорт',
  },
  'İstehsalat və Sənaye': {
    en: 'Production & Manufacturing',
    ru: 'Производство и Промышленность',
  },
  'Hüquq və audit': {
    en: 'Legal & Audit',
    ru: 'Юриспруденция и Аудит',
  },
  'Təhlükəsizlik və Mühafizə': {
    en: 'Security & Safety',
    ru: 'Безопасность и Охрана',
  },
  'Ticarət və Xidmət': {
    en: 'Retail & Services',
    ru: 'Торговля и Услуги',
  },
  'Fəhlə və Sənətkarlıq': {
    en: 'Skilled Trades & Labor',
    ru: 'Рабочие специальности',
  },
  'Digər': {
    en: 'Other',
    ru: 'Другое',
  },
};

export function getLocalizedCategory(category: string, lang: Language): string {
  if (lang === 'az' || !category) return category;
  const match = CATEGORY_TRANSLATIONS[category];
  if (match && match[lang]) {
    return match[lang];
  }
  return category;
}

// ============================================================================
// 2. CITIES LOCALIZATION
// ============================================================================
export const CITY_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  'Bakı': { en: 'Baku', ru: 'Баку' },
  'Sumqayıt': { en: 'Sumgait', ru: 'Сумгаит' },
  'Gəncə': { en: 'Ganja', ru: 'Гянджа' },
  'Xırdalan': { en: 'Khirdalan', ru: 'Хырдалан' },
  'Mingəçevir': { en: 'Mingachevir', ru: 'Мингечевир' },
  'Şirvan': { en: 'Shirvan', ru: 'Ширван' },
  'Naxçıvan': { en: 'Nakhchivan', ru: 'Нахчыван' },
  'Şəki': { en: 'Sheki', ru: 'Шеки' },
  'Lənkəran': { en: 'Lankaran', ru: 'Ленкорань' },
  'Quba': { en: 'Guba', ru: 'Губа' },
  'Qusar': { en: 'Gusar', ru: 'Гусар' },
  'Xaçmaz': { en: 'Khachmaz', ru: 'Хачмаз' },
  'Masallı': { en: 'Masalli', ru: 'Масаллы' },
  'Cəlilabad': { en: 'Jalilabad', ru: 'Джалилабад' },
  'Şamaxı': { en: 'Shamakhi', ru: 'Шамахы' },
  'Zaqatala': { en: 'Zaqatala', ru: 'Загатала' },
  'Bərdə': { en: 'Barda', ru: 'Барда' },
  'Ağdam': { en: 'Aghdam', ru: 'Агдам' },
  'Yevlax': { en: 'Yevlakh', ru: 'Евлах' },
  'Göyçay': { en: 'Goychay', ru: 'Гейчай' },
  'İsmayıllı': { en: 'Ismayilli', ru: 'Исмаиллы' },
  'Qəbələ': { en: 'Gabala', ru: 'Габала' },
  'Uzaqdan / Remote': { en: 'Remote', ru: 'Удаленно' },
};

export function getLocalizedCity(city: string, lang: Language): string {
  if (lang === 'az' || !city) return city;
  const match = CITY_TRANSLATIONS[city];
  if (match && match[lang]) {
    return match[lang];
  }
  return city;
}

// ============================================================================
// 3. EMPLOYMENT TYPE LOCALIZATION
// ============================================================================
export const EMPLOYMENT_TYPE_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  'Tam ştat': { en: 'Full-time', ru: 'Полная занятость' },
  'Yarım ştat': { en: 'Part-time', ru: 'Частичная занятость' },
  'Hibrid': { en: 'Hybrid', ru: 'Гибрид' },
  'Uzaqdan (Remote)': { en: 'Remote', ru: 'Удаленная работа' },
  'Uzaqdan': { en: 'Remote', ru: 'Удаленно' },
  'Təcrübə proqramı': { en: 'Internship', ru: 'Стажировка' },
  'Frilans': { en: 'Freelance', ru: 'Фриланс' },
  'Layihə əsaslı': { en: 'Contract / Project', ru: 'Проектная работа' },
};

export function getLocalizedEmploymentType(type: string, lang: Language): string {
  if (lang === 'az' || !type) return type;
  const match = EMPLOYMENT_TYPE_TRANSLATIONS[type];
  if (match && match[lang]) {
    return match[lang];
  }
  return type;
}

// ============================================================================
// 4. EXPERIENCE LEVEL LOCALIZATION
// ============================================================================
export const EXPERIENCE_LEVEL_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  'Təcrübəsiz / Junior': { en: 'Junior / No Experience', ru: 'Junior / Без опыта' },
  'Təcrübəsiz': { en: 'No Experience', ru: 'Без опыта' },
  'Orta (Mid-level, 1-3 il)': { en: 'Mid-level (1-3 yrs)', ru: 'Middle (1-3 года)' },
  'Baş (Senior, 3-5+ il)': { en: 'Senior (3-5+ yrs)', ru: 'Senior (3-5+ лет)' },
  'Rəhbər / Lead': { en: 'Lead / Management', ru: 'Руководитель / Lead' },
  '1 ildən aşağı': { en: 'Under 1 year', ru: 'Менее 1 года' },
  '1-3 il': { en: '1-3 years', ru: '1-3 года' },
  '3-5 il': { en: '3-5 years', ru: '3-5 лет' },
  '5 ildən çox': { en: '5+ years', ru: 'Более 5 лет' },
};

export function getLocalizedExperienceLevel(exp: string, lang: Language): string {
  if (lang === 'az' || !exp) return exp;
  const match = EXPERIENCE_LEVEL_TRANSLATIONS[exp];
  if (match && match[lang]) {
    return match[lang];
  }
  return exp;
}

// ============================================================================
// 5. JOB TITLES DICTIONARY
// ============================================================================
export const JOB_TITLE_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  'Senior Java Proqramçı': { en: 'Senior Java Developer', ru: 'Senior Java Разработчик' },
  'Java Proqramçı': { en: 'Java Developer', ru: 'Java Разработчик' },
  'Frontend React Developer': { en: 'Frontend React Developer', ru: 'Frontend React Разработчик' },
  'Full Stack Proqramçı': { en: 'Full Stack Developer', ru: 'Full Stack Разработчик' },
  'Backend Python Developer': { en: 'Backend Python Developer', ru: 'Backend Python Разработчик' },
  'DevOps Mühəndisi': { en: 'DevOps Engineer', ru: 'DevOps Инженер' },
  'QA Mühəndisi / Tester': { en: 'QA Engineer / Tester', ru: 'QA Инженер / Тестировщик' },
  'Mobil Tətbiq Proqramçısı (Flutter / React Native)': { en: 'Mobile Developer (Flutter / React Native)', ru: 'Мобильный разработчик (Flutter / RN)' },
  'Məlumat Analitiki (Data Analyst)': { en: 'Data Analyst', ru: 'Аналитик данных (Data Analyst)' },
  'Kiber Təhlükəsizlik Mütəxəssisi': { en: 'Cybersecurity Specialist', ru: 'Специалист по кибербезопасности' },
  'Baş Mühasib': { en: 'Chief Accountant', ru: 'Главный бухгалтер' },
  'Mühasib': { en: 'Accountant', ru: 'Бухгалтер' },
  'Kiçik Mühasib': { en: 'Junior Accountant', ru: 'Младший бухгалтер' },
  'Maliyyə Meneceri': { en: 'Finance Manager', ru: 'Финансовый менеджер' },
  'Maliyyə Analitiki': { en: 'Financial Analyst', ru: 'Финансовый аналитик' },
  'Audit Mütəxəssisi': { en: 'Audit Specialist', ru: 'Специалист по аудиту' },
  'Satış Meneceri': { en: 'Sales Manager', ru: 'Менеджер по продажам' },
  'Satış Nümayəndəsi': { en: 'Sales Representative', ru: 'Торговый представитель' },
  'Satıcı-Məsləhətçi': { en: 'Sales Consultant', ru: 'Продавец-консультант' },
  'Kassa Meneceri / Xəzinədar': { en: 'Cashier / Teller', ru: 'Кассир' },
  'Müştəri Xidmətləri Mütəxəssisi': { en: 'Customer Support Specialist', ru: 'Специалист клиентской поддержки' },
  'Zəng Mərkəzi Operatoru': { en: 'Call Center Operator', ru: 'Оператор колл-центра' },
  'Qrafik Dizayner': { en: 'Graphic Designer', ru: 'Графический дизайнер' },
  'UI/UX Dizayner': { en: 'UI/UX Designer', ru: 'UI/UX Дизайнер' },
  '3D Dizayner və Animator': { en: '3D Designer & Animator', ru: '3D Дизайнер и Аниматор' },
  'Video Montajçı (Motion Designer)': { en: 'Video Editor & Motion Designer', ru: 'Видеомонтажер и Моушн-дизайнер' },
  'SMM Meneceri': { en: 'SMM Manager', ru: 'SMM-менеджер' },
  'Rəqəmsal Marketinq Meneceri': { en: 'Digital Marketing Manager', ru: 'Менеджер по цифровому маркетингу' },
  'SEO Mütəxəssisi': { en: 'SEO Specialist', ru: 'SEO-специалист' },
  'Kopirayter / Məzmun Yaradıcısı': { en: 'Copywriter & Content Creator', ru: 'Копирайтер и Контент-мейкер' },
  'PR Meneceri': { en: 'PR Manager', ru: 'PR-менеджер' },
  'İnsan Resursları (HR) Meneceri': { en: 'HR Manager', ru: 'HR-менеджер' },
  'İşə Qəbul Mütəxəssisi (Recruiter)': { en: 'Talent Acquisition / Recruiter', ru: 'Специалист по подбору персонала (Рекрутер)' },
  'Kadrlar üzrə Mütəxəssis': { en: 'HR Specialist', ru: 'Специалист отдела кадров' },
  'Ofis Meneceri': { en: 'Office Manager', ru: 'Офис-менеджер' },
  'İcraçı Assistent / Katibə': { en: 'Executive Assistant / Secretary', ru: 'Исполнительный ассистент / Секретарь' },
  'Resepşn': { en: 'Receptionist', ru: 'Администратор зоны ресепшн' },
  'Hüquqşünas': { en: 'Legal Counsel / Lawyer', ru: 'Юрист' },
  'Aparıcı Hüquq Məsləhətçisi': { en: 'Lead Legal Advisor', ru: 'Ведущий юрисконсульт' },
  'Sürücü (Şəxsi / Korporativ)': { en: 'Driver (Personal / Corporate)', ru: 'Водитель (Личный / Корпоративный)' },
  'Ekspeditor / Kuryer': { en: 'Courier / Dispatcher', ru: 'Курьер / Экспедитор' },
  'Moto Kuryer': { en: 'Motorcycle Courier', ru: 'Мотокурьер' },
  'Anbardar': { en: 'Warehouse Supervisor', ru: 'Заведующий складом / Кладовщик' },
  'Fəhlə / Anbar İşçisi': { en: 'Warehouse Worker / Handyman', ru: 'Работник склада / Разнорабочий' },
  'Baş Aşpaz': { en: 'Head Chef', ru: 'Шеф-повар' },
  'Aşpaz Köməkçisi': { en: 'Assistant Cook', ru: 'Помощник повара' },
  'Qənnadçı': { en: 'Pastry Chef / Confectioner', ru: 'Кондитер' },
  'Ofisiant': { en: 'Waiter / Server', ru: 'Официант' },
  'Barmen / Barista': { en: 'Barman / Barista', ru: 'Бармен / Бариста' },
  'Həkim-Terapevt': { en: 'General Practitioner / Physician', ru: 'Врач-терапевт' },
  'Tibb Bacısı / Qardaşı': { en: 'Nurse', ru: 'Медицинская сестра / Брат' },
  'Əczaçı (Farmasevt)': { en: 'Pharmacist', ru: 'Фармацевт' },
  'İngilis Dili Müəllimi': { en: 'English Teacher', ru: 'Преподаватель английского языка' },
  'İbtidai Sinif Müəllimi': { en: 'Primary School Teacher', ru: 'Учитель начальных классов' },
  'Təlim və İnkişaf Koordinatoru': { en: 'Learning & Development Coordinator', ru: 'Координатор обучения и развития' },
  'Mülki Mühəndis': { en: 'Civil Engineer', ru: 'Инженер-строитель' },
  'Elektrik Mühəndisi': { en: 'Electrical Engineer', ru: 'Инженер-электрик' },
  'Mexanik Mühəndis': { en: 'Mechanical Engineer', ru: 'Инженер-механик' },
  'Memar': { en: 'Architect', ru: 'Архитектор' },
  'Mühafizəçi': { en: 'Security Guard', ru: 'Охранник' },
  'Təmizlik İşçisi': { en: 'Cleaning Specialist', ru: 'Специалист по клинингу' },
};

export function getLocalizedJobTitle(title: string, lang: Language): string {
  if (lang === 'az' || !title) return title;
  
  // Exact match
  if (JOB_TITLE_TRANSLATIONS[title]) {
    return JOB_TITLE_TRANSLATIONS[title][lang];
  }

  // Partial phrase mapping if title contains key terms
  for (const [azKey, trans] of Object.entries(JOB_TITLE_TRANSLATIONS)) {
    if (title.toLowerCase().includes(azKey.toLowerCase())) {
      return title.replace(new RegExp(azKey, 'i'), trans[lang]);
    }
  }

  return title;
}

// ============================================================================
// 6. VACANCY LOCALIZATION HELPER
// ============================================================================
export function getLocalizedVacancy(vacancy: Vacancy, lang: Language): Vacancy {
  if (lang === 'az' || !vacancy) return vacancy;

  const localizedTitle = getLocalizedJobTitle(vacancy.title, lang);
  const localizedCat = getLocalizedCategory(vacancy.category, lang);
  const localizedCity = getLocalizedCity(vacancy.city, lang);
  const localizedType = getLocalizedEmploymentType(vacancy.employmentType, lang) as EmploymentType;
  const localizedExp = getLocalizedExperienceLevel(vacancy.experienceLevel, lang) as ExperienceLevel;

  return {
    ...vacancy,
    title: localizedTitle,
    category: localizedCat,
    city: localizedCity,
    employmentType: localizedType,
    experienceLevel: localizedExp,
  };
}
