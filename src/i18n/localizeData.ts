import { Language } from './types';

// ============================================================================
// 1. CATEGORY LOCALIZATION MAP
// ============================================================================
export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'İT və Proqramlaşdırma': {
    az: 'İT və Proqramlaşdırma',
    en: 'IT & Software Development',
    ru: 'ИТ и Программирование',
  },
  'Maliyyə və Mühasibat': {
    az: 'Maliyyə və Mühasibat',
    en: 'Finance & Accounting',
    ru: 'Финансы и Бухгалтерия',
  },
  'Bankçılıq və Sığorta': {
    az: 'Bankçılıq və Sığorta',
    en: 'Banking & Insurance',
    ru: 'Банковское дело и Страхование',
  },
  'Marketinq, Reklam və PR': {
    az: 'Marketinq, Reklam və PR',
    en: 'Marketing, Advertising & PR',
    ru: 'Маркетинг, Реклама и PR',
  },
  'Satış və Müştəri Xidmətləri': {
    az: 'Satış və Müştəri Xidmətləri',
    en: 'Sales & Customer Service',
    ru: 'Продажи и Клиентский сервис',
  },
  'Dizayn və Yaradıcılıq': {
    az: 'Dizayn və Yaradıcılıq',
    en: 'Design & Creative',
    ru: 'Дизайн и Творчество',
  },
  'İnsan Resursları (HR)': {
    az: 'İnsan Resursları (HR)',
    en: 'Human Resources (HR)',
    ru: 'Управление персоналом (HR)',
  },
  'Mühəndislik və Tikinti': {
    az: 'Mühəndislik və Tikinti',
    en: 'Engineering & Construction',
    ru: 'Инженерия и Строительство',
  },
  'Tibb, Əczaçılıq və Səhiyyə': {
    az: 'Tibb, Əczaçılıq və Səhiyyə',
    en: 'Healthcare, Medicine & Pharmacy',
    ru: 'Медицина, Фармацевтика и Здравоохранение',
  },
  'Təhsil, Elm və Təlim': {
    az: 'Təhsil, Elm və Təlim',
    en: 'Education, Science & Training',
    ru: 'Образование, Наука и Обучение',
  },
  'Logistika, Nəqliyyat və Anbar': {
    az: 'Logistika, Nəqliyyat və Anbar',
    en: 'Logistics, Transport & Warehouse',
    ru: 'Логистика, Транспорт и Склад',
  },
  'Hüquq və Komplayens': {
    az: 'Hüquq və Komplayens',
    en: 'Legal & Compliance',
    ru: 'Юриспруденция и Комплаенс',
  },
  'Restoran, Otel və Turizm (HoReCa)': {
    az: 'Restoran, Otel və Turizm (HoReCa)',
    en: 'Hospitality, Hotel & Tourism (HoReCa)',
    ru: 'Рестораны, Отели и Туризм (HoReCa)',
  },
  'İnzibati, Ofis və Katiblik': {
    az: 'İnzibati, Ofis və Katiblik',
    en: 'Administrative & Office Support',
    ru: 'Административный и Офисный персонал',
  },
  'İstehsalat, Sənaye və Texnologiya': {
    az: 'İstehsalat, Sənaye və Texnologiya',
    en: 'Manufacturing, Industry & Tech',
    ru: 'Производство, Промышленность и Технологии',
  },
  'Energetika, Neft-Qaz və Mədən': {
    az: 'Energetika, Neft-Qaz və Mədən',
    en: 'Energy, Oil & Gas and Mining',
    ru: 'Энергетика, Нефть-Газ и Горное дело',
  },
  'Media, Jurnalistika və Nəşriyyat': {
    az: 'Media, Jurnalistika və Nəşriyyat',
    en: 'Media, Journalism & Publishing',
    ru: 'Медиа, Журналистика и Издательство',
  },
  'Təhlükəsizlik və Mühafizə': {
    az: 'Təhlükəsizlik və Mühafizə',
    en: 'Security & Protective Services',
    ru: 'Безопасность и Охрана',
  },
  'Kənd Təsərrüfatı və Aqrar': {
    az: 'Kənd Təsərrüfatı və Aqrar',
    en: 'Agriculture & Agronomy',
    ru: 'Сельское хозяйство и Агро',
  },
  'Tələbələr və Təcrübəçilər': {
    az: 'Tələbələr və Təcrübəçilər',
    en: 'Students & Internships',
    ru: 'Студенты и Стажировки',
  },
};

export function getLocalizedCategory(category: string, lang: Language): string {
  if (!category) return '';
  const match = CATEGORY_TRANSLATIONS[category];
  if (match && match[lang]) {
    return match[lang];
  }
  // Try case-insensitive or partial match
  const catLower = category.toLowerCase().trim();
  for (const [key, trans] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (key.toLowerCase() === catLower) {
      return trans[lang] || key;
    }
  }
  return category;
}

// ============================================================================
// 2. EMPLOYMENT TYPE LOCALIZATION MAP
// ============================================================================
export const EMPLOYMENT_TYPE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'full-time': {
    az: 'Tam ştat',
    en: 'Full-time',
    ru: 'Полная занятость',
  },
  'part-time': {
    az: 'Yarım ştat',
    en: 'Part-time',
    ru: 'Частичная занятость',
  },
  'remote': {
    az: 'Distant / Uzaqdan',
    en: 'Remote',
    ru: 'Удаленная работа',
  },
  'hybrid': {
    az: 'Hibrid',
    en: 'Hybrid',
    ru: 'Гибридный формат',
  },
  'shift': {
    az: 'Növbəli',
    en: 'Shift work',
    ru: 'Сменный график',
  },
  'internship': {
    az: 'Təcrübəçi',
    en: 'Internship',
    ru: 'Стажировка',
  },
  'contract': {
    az: 'Müqaviləli',
    en: 'Contract',
    ru: 'По контракту',
  },
  'freelance': {
    az: 'Freelance / Sərbəst',
    en: 'Freelance',
    ru: 'Фриланс / Проектная',
  },
};

export function getLocalizedEmploymentType(type: string, lang: Language): string {
  if (!type) return '';
  const normalized = type.toLowerCase().trim();
  if (EMPLOYMENT_TYPE_TRANSLATIONS[normalized]) {
    return EMPLOYMENT_TYPE_TRANSLATIONS[normalized][lang] || type;
  }
  // Also check if type is already in Azerbaijani
  for (const trans of Object.values(EMPLOYMENT_TYPE_TRANSLATIONS)) {
    if (trans.az.toLowerCase() === normalized) {
      return trans[lang] || type;
    }
  }
  return type;
}

// ============================================================================
// 3. EXPERIENCE LEVEL LOCALIZATION MAP
// ============================================================================
export const EXPERIENCE_LEVEL_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'no-experience': {
    az: 'Təcrübəsiz',
    en: 'No experience required',
    ru: 'Без опыта работы',
  },
  'junior': {
    az: 'Junior (1 ilə qədər)',
    en: 'Junior (up to 1 year)',
    ru: 'Junior (до 1 года)',
  },
  'mid': {
    az: 'Middle (1-3 il)',
    en: 'Middle (1-3 years)',
    ru: 'Middle (1-3 года)',
  },
  'senior': {
    az: 'Senior (3-5 il)',
    en: 'Senior (3-5 years)',
    ru: 'Senior (3-5 лет)',
  },
  'lead': {
    az: 'Lead / Rəhbər (5+ il)',
    en: 'Lead / Manager (5+ years)',
    ru: 'Lead / Руководитель (5+ лет)',
  },
};

export function getLocalizedExperienceLevel(level: string, lang: Language): string {
  if (!level) return '';
  const normalized = level.toLowerCase().trim();
  if (EXPERIENCE_LEVEL_TRANSLATIONS[normalized]) {
    return EXPERIENCE_LEVEL_TRANSLATIONS[normalized][lang] || level;
  }
  for (const trans of Object.values(EXPERIENCE_LEVEL_TRANSLATIONS)) {
    if (trans.az.toLowerCase() === normalized) {
      return trans[lang] || level;
    }
  }
  return level;
}

// ============================================================================
// 4. CITY LOCALIZATION MAP
// ============================================================================
export const CITY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Bakı': { az: 'Bakı', en: 'Baku', ru: 'Баку' },
  'Sumqayıt': { az: 'Sumqayıt', en: 'Sumgayit', ru: 'Сумгаит' },
  'Gəncə': { az: 'Gəncə', en: 'Ganja', ru: 'Гянджа' },
  'Xırdalan': { az: 'Xırdalan', en: 'Khirdalan', ru: 'Хырдалан' },
  'Mingəçevir': { az: 'Mingəçevir', en: 'Mingachevir', ru: 'Мингечевир' },
  'Naxçıvan': { az: 'Naxçıvan', en: 'Nakhchivan', ru: 'Нахчыван' },
  'Şəki': { az: 'Şəki', en: 'Sheki', ru: 'Шеки' },
  'Lənkəran': { az: 'Lənkəran', en: 'Lankaran', ru: 'Ленкорань' },
  'Quba': { az: 'Quba', en: 'Guba', ru: 'Губа' },
  'Qusar': { az: 'Qusar', en: 'Gusar', ru: 'Гусар' },
  'Xaçmaz': { az: 'Xaçmaz', en: 'Khachmaz', ru: 'Хачмаз' },
  'Şamaxı': { az: 'Şamaxı', en: 'Shamakhi', ru: 'Шамаха' },
  'İsmayıllı': { az: 'İsmayıllı', en: 'Ismayilli', ru: 'Исмаиллы' },
  'Qəbələ': { az: 'Qəbələ', en: 'Gabala', ru: 'Габала' },
  'Şuşa': { az: 'Şuşa', en: 'Shusha', ru: 'Шуша' },
  'Xankəndi': { az: 'Xankəndi', en: 'Khankendi', ru: 'Ханкенди' },
  'Ağdam': { az: 'Ağdam', en: 'Aghdam', ru: 'Агдам' },
  'Zəngilan': { az: 'Zəngilan', en: 'Zangilan', ru: 'Зангилан' },
  'Laçın': { az: 'Laçın', en: 'Lachin', ru: 'Лачин' },
  'Füzuli': { az: 'Füzuli', en: 'Fuzuli', ru: 'Физули' },
  'Cəbrayıl': { az: 'Cəbrayıl', en: 'Jabrayil', ru: 'Джебраил' },
  'Kəlbəcər': { az: 'Kəlbəcər', en: 'Kalbajar', ru: 'Кельбаджар' },
  'Qubadlı': { az: 'Qubadlı', en: 'Gubadli', ru: 'Губадлы' },
  'Tovuz': { az: 'Tovuz', en: 'Tovuz', ru: 'Товуз' },
  'Qazax': { az: 'Qazax', en: 'Gazakh', ru: 'Газах' },
  'Şəmkir': { az: 'Şəmkir', en: 'Shamkir', ru: 'Шамкир' },
  'Yevlax': { az: 'Yevlax', en: 'Yevlakh', ru: 'Евлах' },
  'Bərdə': { az: 'Bərdə', en: 'Barda', ru: 'Барда' },
  'Ağcabədi': { az: 'Ağcabədi', en: 'Aghjabadi', ru: 'Агджабеди' },
  'Göyçay': { az: 'Göyçay', en: 'Goychay', ru: 'Гейчай' },
  'Masallı': { az: 'Masallı', en: 'Masalli', ru: 'Масаллы' },
  'Cəlilabad': { az: 'Cəlilabad', en: 'Jalilabad', ru: 'Джалилабад' },
  'Salyan': { az: 'Salyan', en: 'Salyan', ru: 'Сальян' },
  'Şirvan': { az: 'Şirvan', en: 'Shirvan', ru: 'Ширван' },
  'Zaqatala': { az: 'Zaqatala', en: 'Zagatala', ru: 'Загатала' },
  'Balakən': { az: 'Balakən', en: 'Balakan', ru: 'Балакен' },
  'Uzaqdan / Remote': { az: 'Uzaqdan / Remote', en: 'Remote (Anywhere)', ru: 'Удаленно (Отовсюду)' },
};

export function getLocalizedCity(city: string, lang: Language): string {
  if (!city) return '';
  const match = CITY_TRANSLATIONS[city];
  if (match && match[lang]) return match[lang];
  for (const [key, trans] of Object.entries(CITY_TRANSLATIONS)) {
    if (key.toLowerCase() === city.toLowerCase().trim()) {
      return trans[lang] || key;
    }
  }
  return city;
}

// ============================================================================
// 5. INDUSTRY LOCALIZATION MAP
// ============================================================================
export const INDUSTRY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'İnformasiya Texnologiyaları': {
    az: 'İnformasiya Texnologiyaları',
    en: 'Information Technology',
    ru: 'Информационные технологии',
  },
  'Maliyyə və Bank': {
    az: 'Maliyyə və Bank',
    en: 'Finance & Banking',
    ru: 'Финансы и Банковское дело',
  },
  'Təhsil': {
    az: 'Təhsil',
    en: 'Education',
    ru: 'Образование',
  },
  'Səhiyyə və Tibb': {
    az: 'Səhiyyə və Tibb',
    en: 'Healthcare & Medicine',
    ru: 'Здравоохранение и Медицина',
  },
  'Pərakəndə və Satış': {
    az: 'Pərakəndə və Satış',
    en: 'Retail & Sales',
    ru: 'Розничная торговля и Продажи',
  },
  'Tikinti və Əmlak': {
    az: 'Tikinti və Əmlak',
    en: 'Construction & Real Estate',
    ru: 'Строительство и Недвижимость',
  },
  'Nəqliyyat və Logistika': {
    az: 'Nəqliyyat və Logistika',
    en: 'Transport & Logistics',
    ru: 'Транспорт и Логистика',
  },
  'Turizm və Qonaqpərvərlik': {
    az: 'Turizm və Qonaqpərvərlik',
    en: 'Tourism & Hospitality',
    ru: 'Туризм и Гостеприимство',
  },
  'İstehsalat': {
    az: 'İstehsalat',
    en: 'Manufacturing & Industry',
    ru: 'Производство и Промышленность',
  },
  'Müəssisə və Biznes': {
    az: 'Müəssisə və Biznes',
    en: 'Enterprise & Business',
    ru: 'Предприятие и Бизнес',
  },
  'Digər': {
    az: 'Digər',
    en: 'Other',
    ru: 'Другое',
  },
};

export function getLocalizedIndustry(industry: string, lang: Language): string {
  if (!industry) return '';
  const match = INDUSTRY_TRANSLATIONS[industry];
  if (match && match[lang]) return match[lang];
  for (const [key, trans] of Object.entries(INDUSTRY_TRANSLATIONS)) {
    if (key.toLowerCase() === industry.toLowerCase().trim()) {
      return trans[lang] || key;
    }
  }
  return industry;
}

// ============================================================================
// 6. COMMON JOB TITLE LOCALIZATION (Contextual Intelligent Mapping)
// ============================================================================
export const COMMON_JOB_TITLE_MAP: Record<string, Record<Language, string>> = {
  'Baş Mühasib': { az: 'Baş Mühasib', en: 'Chief Accountant', ru: 'Главный бухгалтер' },
  'Mühasib': { az: 'Mühasib', en: 'Accountant', ru: 'Бухгалтер' },
  'Kassir': { az: 'Kassir', en: 'Cashier', ru: 'Кассир' },
  'Satıcı': { az: 'Satıcı', en: 'Sales Associate', ru: 'Продавец-консультант' },
  'Satış Meneceri': { az: 'Satış Meneceri', en: 'Sales Manager', ru: 'Менеджер по продажам' },
  'Sürücü': { az: 'Sürücü', en: 'Driver', ru: 'Водитель' },
  'Kuryer': { az: 'Kuryer', en: 'Courier / Delivery Agent', ru: 'Курьер / Доставщик' },
  'Mühafizəçi': { az: 'Mühafizəçi', en: 'Security Guard', ru: 'Охранник' },
  'Aşpaz': { az: 'Aşpaz', en: 'Chef / Cook', ru: 'Повар' },
  'Xadimə': { az: 'Xadimə', en: 'Cleaning Specialist', ru: 'Уборщица / Клинер' },
  'Anbardar': { az: 'Anbardar', en: 'Warehouse Supervisor', ru: 'Кладовщик' },
  'Frontend Proqramçı': { az: 'Frontend Proqramçı', en: 'Frontend Developer', ru: 'Frontend Разработчик' },
  'Backend Proqramçı': { az: 'Backend Proqramçı', en: 'Backend Developer', ru: 'Backend Разработчик' },
  'Fullstack Proqramçı': { az: 'Fullstack Proqramçı', en: 'Full Stack Developer', ru: 'Full Stack Разработчик' },
  'UI/UX Dizayner': { az: 'UI/UX Dizayner', en: 'UI/UX Designer', ru: 'UI/UX Дизайнер' },
  'Qrafik Dizayner': { az: 'Qrafik Dizayner', en: 'Graphic Designer', ru: 'Графический дизайнер' },
  'HR Menecer': { az: 'HR Menecer', en: 'HR Manager', ru: 'HR Менеджер' },
  'İnsan Resursları Mütəxəssisi': { az: 'İnsan Resursları Mütəxəssisi', en: 'HR Specialist', ru: 'Специалист по кадрам' },
  'Layihə Meneceri (Project Manager)': { az: 'Layihə Meneceri (Project Manager)', en: 'Project Manager', ru: 'Руководитель проектов (Project Manager)' },
  'Məhsul Meneceri (Product Manager)': { az: 'Məhsul Meneceri (Product Manager)', en: 'Product Manager', ru: 'Продуктовый менеджер (Product Manager)' },
  'Zəng Mərkəzi Operatoru': { az: 'Zəng Mərkəzi Operatoru', en: 'Call Center Specialist', ru: 'Оператор колл-центра' },
  'Ofis Meneceri': { az: 'Ofis Meneceri', en: 'Office Manager', ru: 'Офис-менеджер' },
  'Resepşn': { az: 'Resepşn', en: 'Receptionist', ru: 'Администратор зоны ресепшн' },
};

export function getLocalizedJobTitle(title: string, lang: Language): string {
  if (!title) return '';
  if (COMMON_JOB_TITLE_MAP[title]) {
    return COMMON_JOB_TITLE_MAP[title][lang] || title;
  }
  for (const [key, trans] of Object.entries(COMMON_JOB_TITLE_MAP)) {
    if (key.toLowerCase() === title.toLowerCase().trim()) {
      return trans[lang] || title;
    }
  }
  return title;
}

export function getLocalizedExperience(level: string, lang: Language): string {
  return getLocalizedExperienceLevel(level, lang);
}

export function getLocalizedSortOption(sortKey: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    'newest': { az: 'Ən yenilər', en: 'Newest', ru: 'Сначала новые' },
    'salary-desc': { az: 'Maaş (Yüksəkdən aşağıya)', en: 'Highest Salary', ru: 'Сначала высокооплачиваемые' },
    'salary-asc': { az: 'Maaş (Aşağıdan yuxarıya)', en: 'Lowest Salary', ru: 'Сначала с низкой зарплатой' },
    'popular': { az: 'Populyarlıq', en: 'Most Popular', ru: 'Популярные' },
    'views': { az: 'Baxış sayına görə', en: 'Most Viewed', ru: 'По просмотрам' },
  };
  return map[sortKey]?.[lang] || sortKey;
}

export function getLocalizedVacancyTitle(title: string, lang: Language): string {
  return getLocalizedJobTitle(title, lang);
}

export function getLocalizedVacancyDescription(desc: string, _lang: Language): string {
  return desc || '';
}

export function getLocalizedVacancyRequirements(req: string, _lang: Language): string {
  return req || '';
}

// ============================================================================
// 7. APPLICATION STATUS LOCALIZATION
// ============================================================================
export const APPLICATION_STATUS_MAP: Record<string, Record<Language, string>> = {
  'Müraciət edildi': { az: 'Müraciət edildi', en: 'Applied', ru: 'Отправлено' },
  'Baxıldı': { az: 'Baxıldı', en: 'Viewed', ru: 'Просмотрено' },
  'Baxılır': { az: 'Baxılır', en: 'Under Review', ru: 'На рассмотрении' },
  'İlkin seçim': { az: 'İlkin seçim', en: 'Shortlisted', ru: 'Предварительный отбор' },
  'Müsahibəyə dəvət': { az: 'Müsahibəyə dəvət', en: 'Interview Invite', ru: 'Приглашение на интервью' },
  'Müsahibə': { az: 'Müsahibə', en: 'Interview', ru: 'Собеседование' },
  'Təklif verildi': { az: 'Təklif verildi', en: 'Offer Extended', ru: 'Оффер сделан' },
  'Təklif göndərildi': { az: 'Təklif göndərildi', en: 'Offer Sent', ru: 'Оффер отправлен' },
  'Qəbul edildi': { az: 'Qəbul edildi', en: 'Accepted', ru: 'Принято' },
  'İmtina edildi': { az: 'İmtina edildi', en: 'Rejected', ru: 'Отклонено' },
};

export function getLocalizedApplicationStatus(status: string, lang: Language): string {
  if (!status) return '';
  if (APPLICATION_STATUS_MAP[status]) {
    return APPLICATION_STATUS_MAP[status][lang] || status;
  }
  const sLower = status.toLowerCase().trim();
  for (const [key, trans] of Object.entries(APPLICATION_STATUS_MAP)) {
    if (key.toLowerCase() === sLower) {
      return trans[lang] || key;
    }
  }
  return status;
}

// ============================================================================
// 8. VACANCY STATUS LOCALIZATION
// ============================================================================
export const VACANCY_STATUS_MAP: Record<string, Record<Language, string>> = {
  'published': { az: 'Dərc olunub', en: 'Published', ru: 'Опубликовано' },
  'pending_review': { az: 'Təsdiq gözləyir', en: 'Pending Review', ru: 'На модерации' },
  'draft': { az: 'Qaralama', en: 'Draft', ru: 'Черновик' },
  'rejected': { az: 'İmtina olunub', en: 'Rejected', ru: 'Отклонено' },
  'closed': { az: 'Bağlanıb', en: 'Closed', ru: 'Закрыто' },
  'archived': { az: 'Arxivlənib', en: 'Archived', ru: 'В архиве' },
};

export function getLocalizedVacancyStatus(status: string, lang: Language): string {
  if (!status) return '';
  return VACANCY_STATUS_MAP[status]?.[lang] || status;
}

// ============================================================================
// 9. USER ROLE LOCALIZATION
// ============================================================================
export const USER_ROLE_MAP: Record<string, Record<Language, string>> = {
  'candidate': { az: 'Namizəd', en: 'Candidate', ru: 'Соискатель' },
  'business': { az: 'İşəgötürən', en: 'Employer', ru: 'Работодатель' },
  'admin': { az: 'Sistem Administratoru', en: 'System Administrator', ru: 'Администратор' },
};

export function getLocalizedUserRole(role: string, lang: Language): string {
  if (!role) return '';
  return USER_ROLE_MAP[role]?.[lang] || role;
}

// ============================================================================
// 10. SUBSCRIPTION TIER & STATUS LOCALIZATION
// ============================================================================
export const SUBSCRIPTION_TIER_MAP: Record<string, Record<Language, string>> = {
  'FREE': { az: 'Pulsuz Plan', en: 'Free Plan', ru: 'Бесплатный план' },
  'PRO': { az: 'Pro Plan', en: 'Pro Plan', ru: 'Профессиональный' },
  'BUSINESS': { az: 'Korporativ Plan', en: 'Business Plan', ru: 'Бизнес-план' },
  'ENTERPRISE': { az: 'Enterprise', en: 'Enterprise', ru: 'Enterprise' },
};

export function getLocalizedSubscriptionTier(tier: string, lang: Language): string {
  if (!tier) return '';
  return SUBSCRIPTION_TIER_MAP[tier]?.[lang] || tier;
}

export const SUBSCRIPTION_STATUS_MAP: Record<string, Record<Language, string>> = {
  'active': { az: 'Aktiv', en: 'Active', ru: 'Активный' },
  'cancelled': { az: 'Ləğv edilib', en: 'Cancelled', ru: 'Отменено' },
  'expired': { az: 'Vaxtı bitib', en: 'Expired', ru: 'Истек' },
  'pending': { az: 'Gözləyir', en: 'Pending', ru: 'В ожидании' },
};

export function getLocalizedSubscriptionStatus(status: string, lang: Language): string {
  if (!status) return '';
  return SUBSCRIPTION_STATUS_MAP[status]?.[lang] || status;
}

// ============================================================================
// 11. JOB OFFER STATUS LOCALIZATION
// ============================================================================
export const OFFER_STATUS_MAP: Record<string, Record<Language, string>> = {
  'SENT': { az: 'Göndərildi', en: 'Sent', ru: 'Отправлено' },
  'VIEWED': { az: 'Baxıldı', en: 'Viewed', ru: 'Просмотрено' },
  'ACCEPTED': { az: 'Qəbul edildi', en: 'Accepted', ru: 'Принято' },
  'DECLINED': { az: 'İmtina edildi', en: 'Declined', ru: 'Отклонено' },
  'EXPIRED': { az: 'Vaxtı bitdi', en: 'Expired', ru: 'Истек' },
};

export function getLocalizedOfferStatus(status: string, lang: Language): string {
  if (!status) return '';
  return OFFER_STATUS_MAP[status]?.[lang] || status;
}

// ============================================================================
// 12. AUDIT LOG ACTIONS LOCALIZATION
// ============================================================================
export const AUDIT_ACTION_MAP: Record<string, Record<Language, string>> = {
  'APPROVE_VACANCY': { az: 'Vakansiya təsdiqləndi', en: 'Vacancy Approved', ru: 'Вакансия одобрена' },
  'REJECT_VACANCY': { az: 'Vakansiyadan imtina edildi', en: 'Vacancy Rejected', ru: 'Вакансия отклонена' },
  'DELETE_VACANCY': { az: 'Vakansiya silindi', en: 'Vacancy Deleted', ru: 'Вакансия удалена' },
  'FEATURE_VACANCY': { az: 'Vakansiya VIP statusuna qaldırıldı', en: 'Vacancy Featured (VIP)', ru: 'Вакансия отмечена как VIP' },
  'VERIFY_COMPANY': { az: 'Şirkət VÖEN təsdiqləndi', en: 'Company Verified', ru: 'Компания верифицирована' },
  'UNVERIFY_COMPANY': { az: 'Şirkətin təsdiqi geri çağırıldı', en: 'Company Unverified', ru: 'Верификация компании отозвана' },
  'BLOCK_USER': { az: 'İstifadəçi bloklandı', en: 'User Blocked', ru: 'Пользователь заблокирован' },
  'ACTIVATE_USER': { az: 'İstifadəçi aktivləşdirildi', en: 'User Activated', ru: 'Пользователь активирован' },
};

export function getLocalizedAuditAction(action: string, lang: Language): string {
  if (!action) return '';
  return AUDIT_ACTION_MAP[action]?.[lang] || action;
}


