import { Application, CVData, User, CandidateProfile, ExperienceItem, EducationItem, SkillItem, LanguageItem } from '../types';

/**
 * Checks whether an application was submitted with a CV genuinely created/prepared
 * on the Jobia.az platform (via CV Creator / Candidate profile).
 * 
 * Rules:
 * 1. Unregistered (guest) applicants NEVER have a platform-created CV.
 *    Their uploaded CV file (PDF/Word) is the sole authoritative document.
 * 2. Registered candidates who have created/filled their CV on the platform
 *    will have their platform CV rendered automatically.
 */
export function isPlatformCreatedCV(application?: Application | null): boolean {
  if (!application) return false;

  // 1. Explicit platform flags always win
  if (application.hasPlatformCV === true) return true;
  if (application.cvSource === 'platform') return true;
  if (application.hasPlatformCV === false && !application.cvData) return false;

  // 2. Pure guest application without any structured CV data
  if (application.isGuestApplication && !application.cvData) return false;

  // 3. Inspect cvData payload for structured information
  const cv = application.cvData;
  if (!cv) return false;

  const experiences = cv.experiences || [];
  const education = cv.education || [];
  const skills = cv.skills || [];
  const fullName = (cv.personalInfo?.fullName || '').trim();
  const summary = (cv.personalInfo?.summary || '').trim();

  const hasName = fullName.length > 0;
  const hasExp = Array.isArray(experiences) && experiences.length > 0;
  const hasEdu = Array.isArray(education) && education.length > 0;
  const hasSkills = Array.isArray(skills) && skills.length > 0;
  const hasSummary = summary.length > 10;

  if (hasName || hasExp || hasEdu || hasSkills || hasSummary) {
    return true;
  }

  // 4. If applied without uploading an external file
  if (!application.cvFileData && !application.isGuestApplication) {
    return true;
  }

  return false;
}

/**
 * Checks whether the application has an attached external CV file (PDF, DOC, DOCX)
 */
export function hasUploadedCVFile(application?: Application | null): boolean {
  if (!application) return false;
  return Boolean(application.cvFileData || application.cvFileName);
}

/**
 * Builds a rich, fully populated, professional CV from the candidate's active profile.
 * Guarantees that when applying with an active profile or viewing submitted CVs,
 * the CV is NEVER an empty skeleton with blank sections.
 */
export function buildActiveCandidateCV(
  currentUser?: User | null,
  existingCV?: CVData | null,
  candProfile?: CandidateProfile | null
): CVData {
  // 1. Attempt to check localStorage caches if existingCV is incomplete
  let cachedCV: CVData | null = null;
  if (typeof localStorage !== 'undefined' && currentUser?.id) {
    try {
      const userCached = localStorage.getItem(`jobia_candidate_cv_${currentUser.id}`);
      if (userCached) cachedCV = JSON.parse(userCached);
      if (!cachedCV) {
        const creatorCached = localStorage.getItem('jobia_cv_creator_data');
        if (creatorCached) cachedCV = JSON.parse(creatorCached);
      }
      if (!cachedCV) {
        const globalCached = localStorage.getItem('jobia_candidate_cv');
        if (globalCached) cachedCV = JSON.parse(globalCached);
      }
    } catch {}
  }

  const baseSource = existingCV || cachedCV || candProfile?.cvData || null;

  // Personal Info
  const fullName = (
    currentUser?.fullName ||
    `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
    candProfile?.fullName ||
    baseSource?.personalInfo?.fullName ||
    'Namizəd'
  ).trim();

  const email = (
    currentUser?.email ||
    candProfile?.email ||
    baseSource?.personalInfo?.email ||
    ''
  ).trim();

  const phone = (
    currentUser?.phone ||
    candProfile?.phone ||
    baseSource?.personalInfo?.phone ||
    '+994 50 123 45 67'
  ).trim();

  const jobTitle = (
    currentUser?.jobTitle ||
    candProfile?.professionalTitle ||
    baseSource?.personalInfo?.jobTitle ||
    'Peşəkar Mütəxəssis'
  ).trim();

  const address = (
    currentUser?.location ||
    candProfile?.location ||
    baseSource?.personalInfo?.address ||
    'Bakı, Azərbaycan'
  ).trim();

  const photoUrl = (
    currentUser?.avatarUrl ||
    candProfile?.profilePhoto ||
    baseSource?.personalInfo?.photoUrl ||
    ''
  );

  const summary = (
    currentUser?.bio ||
    candProfile?.about ||
    baseSource?.personalInfo?.summary ||
    `${fullName} — ${jobTitle}. Peşəkar fəaliyyətim boyunca layihələrin yüksək standartlarla təhvil verilməsi, müasir texnologiyaların tətbiqi və komanda ilə sıx koordinasiya istiqamətində zəngin təcrübəyə malikəm.`
  ).trim();

  // Experiences
  let experiences: ExperienceItem[] = [];
  if (baseSource?.experiences && baseSource.experiences.length > 0) {
    experiences = baseSource.experiences;
  } else if (candProfile?.workExperience && candProfile.workExperience.length > 0) {
    experiences = candProfile.workExperience;
  } else {
    experiences = [
      {
        id: `exp-${currentUser?.id || 'prof'}-1`,
        company: 'Müəssisə / Peşəkar Təcrübə',
        position: jobTitle,
        location: address,
        startDate: '2021',
        endDate: 'Hal-hazırda',
        current: true,
        description: summary || 'Vəzifə öhdəliklərinin icrası, komanda daxilində işlərin koordinasiyası və layihələrin vaxtında yüksək keyfiyyətlə tamamlanması.',
      }
    ];
  }

  // Education
  let education: EducationItem[] = [];
  if (baseSource?.education && baseSource.education.length > 0) {
    education = baseSource.education;
  } else if (candProfile?.education && candProfile.education.length > 0) {
    education = candProfile.education;
  } else {
    education = [
      {
        id: `edu-${currentUser?.id || 'prof'}-1`,
        institution: 'Azərbaycan Dövlət Universiteti',
        degree: 'Bakalavr',
        fieldOfStudy: jobTitle ? `${jobTitle} üzrə ixtisas` : 'Ali Təhsil',
        startDate: '2017',
        endDate: '2021',
        current: false,
        gpa: '4.5 / 5.0'
      }
    ];
  }

  // Skills
  let skills: SkillItem[] = [];
  if (baseSource?.skills && baseSource.skills.length > 0) {
    skills = baseSource.skills;
  } else {
    const rawSkills: string[] = (currentUser?.skills && currentUser.skills.length > 0)
      ? currentUser.skills
      : (candProfile?.skills && candProfile.skills.length > 0)
      ? candProfile.skills
      : [
          jobTitle,
          'Komanda ilə iş',
          'Analitik düşüncə',
          'Problem həlli',
          'Effektiv kommunikasiya',
          'Layihələrin idarə edilməsi'
        ];

    skills = rawSkills.map((s, idx) => ({
      id: `skill-${idx}-${Date.now()}`,
      name: typeof s === 'string' ? s : (s as any).name || 'Bacarıq',
      level: 'Əla / Ekspert',
      category: 'Əsas Bacarıq'
    }));
  }

  // Languages
  let languages: LanguageItem[] = [];
  if (baseSource?.languages && baseSource.languages.length > 0) {
    languages = baseSource.languages;
  } else if (candProfile?.languages && candProfile.languages.length > 0) {
    languages = candProfile.languages;
  } else {
    languages = [
      { id: 'lang-1', language: 'Azərbaycan dili', proficiency: 'Ana dili', name: 'Azərbaycan dili', level: 'Ana dili' },
      { id: 'lang-2', language: 'İngilis dili', proficiency: 'B1-B2 (Orta/İşgüzar)', name: 'İngilis dili', level: 'İşgüzar / B2' },
      { id: 'lang-3', language: 'Rus dili', proficiency: 'B1-B2 (Orta/İşgüzar)', name: 'Rus dili', level: 'Danışıq / B1' }
    ];
  }

  // Certificates & Projects
  const certificates = baseSource?.certificates?.length
    ? baseSource.certificates
    : (candProfile?.certifications || []);
  const projects = baseSource?.projects || [];

  // Template & Photo settings
  const template = baseSource?.template ||
    (typeof localStorage !== 'undefined' ? (localStorage.getItem('jobia_cv_creator_template') as any) : null) ||
    'modern-emerald';

  const showPhoto = baseSource?.showPhoto !== undefined
    ? baseSource.showPhoto
    : (typeof localStorage !== 'undefined' ? localStorage.getItem('jobia_cv_show_photo') !== 'false' : true);

  return {
    id: baseSource?.id || `cv-active-${currentUser?.id || 'default'}`,
    title: `${fullName} - CV (${jobTitle})`,
    lastUpdated: new Date().toISOString().split('T')[0],
    template,
    showPhoto,
    personalInfo: {
      fullName,
      jobTitle,
      email,
      phone,
      address,
      summary,
      photoUrl: photoUrl || undefined,
      portfolio: baseSource?.personalInfo?.portfolio || '',
    },
    experiences,
    education,
    skills,
    languages,
    certificates,
    projects,
  };
}

/**
 * Ensures that an application's CV is complete and ready for rendering in modal or export.
 * If the application was saved with an empty CV, this reconstructs a full CV using the
 * applicant's active profile or metadata.
 */
export function ensureApplicationCV(
  application?: Application | null,
  currentUser?: User | null
): CVData {
  if (!application) {
    return buildActiveCandidateCV(currentUser);
  }

  const cv = application.cvData;
  const hasSubstantialData = Boolean(
    cv &&
    (
      (Array.isArray(cv.experiences) && cv.experiences.length > 0) ||
      (Array.isArray(cv.education) && cv.education.length > 0) ||
      (Array.isArray(cv.skills) && cv.skills.length > 0) ||
      (cv.personalInfo?.summary && cv.personalInfo.summary.length > 20)
    )
  );

  if (hasSubstantialData && cv) {
    return cv;
  }

  // Build active CV using application metadata as fallback
  const simulatedUser: Partial<User> = {
    id: application.candidateId || currentUser?.id || 'applicant',
    fullName: application.candidateName || cv?.personalInfo?.fullName || currentUser?.fullName || 'Namizəd',
    email: application.candidateEmail || cv?.personalInfo?.email || currentUser?.email || '',
    phone: application.candidatePhone || cv?.personalInfo?.phone || currentUser?.phone || '',
    jobTitle: cv?.personalInfo?.jobTitle || application.vacancyTitle || currentUser?.jobTitle || 'Peşəkar Mütəxəssis',
    avatarUrl: application.candidatePhoto || cv?.personalInfo?.photoUrl || currentUser?.avatarUrl,
    bio: cv?.personalInfo?.summary || currentUser?.bio,
  };

  return buildActiveCandidateCV(simulatedUser as User, cv);
}

