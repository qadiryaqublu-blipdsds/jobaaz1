import {
  SmartCandidate,
  RecruitmentCriteria,
  CandidateMatchResult,
  CandidateMatchBreakdown,
  KnockoutResult,
  RequiredLanguageCriterion
} from '../types';

/**
 * Normalizes text for semantic and fuzzy token matching
 */
function normalizeTokens(str: string): string[] {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яəğıöşüç\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Calculates semantic similarity (0.0 to 1.0) between target job title and candidate's primary/suitable roles
 */
function calculateRoleSemanticRelevance(
  targetTitle: string,
  candidateTitle: string,
  suitablePositions: string[] = []
): { score: number; note: string } {
  if (!targetTitle) return { score: 90, note: 'Hədəf vəzifə qeyd olunmayıb' };

  const targetTokens = normalizeTokens(targetTitle);
  const candTokens = normalizeTokens(candidateTitle);
  const allCandidateRoles = [candidateTitle, ...(suitablePositions || [])];

  // Exact or contains match
  const targetLower = targetTitle.toLowerCase().trim();
  for (const role of allCandidateRoles) {
    const roleLower = role.toLowerCase().trim();
    if (roleLower === targetLower) {
      return { score: 100, note: `CV-dəki vəzifə hədəf vakansiya ilə tam eynidir: «${role}»` };
    }
    if (roleLower.includes(targetLower) || targetLower.includes(roleLower)) {
      return { score: 95, note: `Vəzifə adı birbaşa uyğunluq təşkil edir: «${role}»` };
    }
  }

  // Token overlap calculation
  let maxOverlapScore = 0;
  for (const role of allCandidateRoles) {
    const tokens = normalizeTokens(role);
    const sharedTokens = targetTokens.filter(tt => tokens.some(ct => ct.includes(tt) || tt.includes(ct)));
    const overlapRatio = targetTokens.length > 0 ? sharedTokens.length / targetTokens.length : 0;
    if (overlapRatio > maxOverlapScore) {
      maxOverlapScore = overlapRatio;
    }
  }

  const roleScore = Math.min(100, Math.max(25, Math.round(maxOverlapScore * 100)));
  if (roleScore >= 80) {
    return { score: roleScore, note: `Peşə istiqaməti yüksək dərəcədə yaxındır: «${candidateTitle}»` };
  } else if (roleScore >= 50) {
    return { score: roleScore, note: `Qohum və ya keçid peşə sahəsidir: «${candidateTitle}»` };
  }
  return { score: roleScore, note: `CV-dəki əsas vəzifə («${candidateTitle}») hədəf vakansiyadan («${targetTitle}») fərqlənir` };
}

/**
 * Normalizes CEFR language level into numeric rank (1-6)
 */
function normalizeLanguageRank(levelStr?: string): number {
  if (!levelStr) return 2;
  const lower = levelStr.toLowerCase().trim();
  if (lower.includes('c2') || lower.includes('ana dili') || lower.includes('native') || lower.includes('sərbəst')) return 6;
  if (lower.includes('c1') || lower.includes('əla') || lower.includes('fluent') || lower.includes('advanced')) return 5;
  if (lower.includes('b2') || lower.includes('yaxşı') || lower.includes('upper')) return 4;
  if (lower.includes('b1') || lower.includes('orta') || lower.includes('intermediate')) return 3;
  if (lower.includes('a2') || lower.includes('pre')) return 2;
  if (lower.includes('a1') || lower.includes('ilkin') || lower.includes('beginner')) return 1;
  return 3;
}

/**
 * Calculates candidate compatibility score (0-100%) against international ATS recruitment standards
 */
export function calculateCandidateFit(
  candidate: SmartCandidate,
  criteria: RecruitmentCriteria
): CandidateMatchResult {
  const weights = criteria.weights || {
    skills: 35,
    experience: 20,
    jobTitleMatch: 15,
    salary: 10,
    education: 10,
    languages: 5,
    location: 5,
  };

  const totalWeights =
    (weights.skills || 0) +
    (weights.experience || 0) +
    (weights.jobTitleMatch || 0) +
    (weights.salary || 0) +
    (weights.education || 0) +
    (weights.languages || 0) +
    (weights.location || 0) || 100;

  const pros: string[] = [];
  const cons: string[] = [];
  const failedKnockouts: string[] = [];

  // ==========================================
  // 1. HARD SKILLS & SOFT SKILLS MATCHING
  // ==========================================
  const candidateSkillsLower = (candidate.skills || []).map(s => s.toLowerCase().trim());
  const requiredSkills = criteria.requiredSkills || [];
  const preferredSkills = criteria.preferredSkills || [];

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  requiredSkills.forEach(req => {
    const isMatched = candidateSkillsLower.some(
      candSkill => candSkill.includes(req.toLowerCase()) || req.toLowerCase().includes(candSkill)
    );
    if (isMatched) {
      matchedRequired.push(req);
    } else {
      missingRequired.push(req);
    }
  });

  const matchedPreferred: string[] = [];
  preferredSkills.forEach(pref => {
    const isMatched = candidateSkillsLower.some(
      candSkill => candSkill.includes(pref.toLowerCase()) || pref.toLowerCase().includes(candSkill)
    );
    if (isMatched) {
      matchedPreferred.push(pref);
    }
  });

  let rawSkillsRatio = 1.0;
  if (requiredSkills.length > 0) {
    const reqRatio = matchedRequired.length / requiredSkills.length;
    const prefBonus = preferredSkills.length > 0 ? (matchedPreferred.length / preferredSkills.length) * 0.15 : 0;
    rawSkillsRatio = Math.min(1.0, reqRatio * 0.85 + prefBonus);
  } else if (preferredSkills.length > 0) {
    rawSkillsRatio = matchedPreferred.length / preferredSkills.length;
  }

  const skillsScore = Math.round(rawSkillsRatio * 100);

  if (matchedRequired.length > 0) {
    pros.push(`${matchedRequired.length} əsas vacib bacarıq təsdiqləndi: (${matchedRequired.slice(0, 3).join(', ')}${matchedRequired.length > 3 ? '...' : ''})`);
  }
  if (missingRequired.length > 0) {
    cons.push(`Tələb olunan ${missingRequired.length} əsas bacarıq çatışmır: ${missingRequired.slice(0, 3).join(', ')}`);
    if (criteria.knockout?.requireAllMandatorySkills && missingRequired.length > 0) {
      failedKnockouts.push(`Məcburi ${missingRequired.length} bacarıq çatışmır (${missingRequired.join(', ')})`);
    }
  }
  if (matchedPreferred.length > 0) {
    pros.push(`Əlavə üstünlük verən bacarıqlar var: ${matchedPreferred.slice(0, 2).join(', ')}`);
  }

  // ==========================================
  // 2. EXPERIENCE YEARS & SENIORITY FIT
  // ==========================================
  let expScore = 100;
  const minExp = criteria.minExperienceYears || 0;
  const candExp = candidate.experienceYears || 0;

  if (minExp > 0) {
    if (candExp >= minExp) {
      expScore = 100;
      pros.push(`İş stajı (${candExp} il) tələb olunan minimumu (${minExp} il) tam ödəyir`);
    } else {
      const expRatio = candExp / minExp;
      expScore = Math.max(10, Math.round(expRatio * 85));
      cons.push(`Təcrübə tələb olunandan (${minExp} il) azdır: hazırda ${candExp} il`);
      if (criteria.knockout?.requireMinExperience && candExp < minExp) {
        failedKnockouts.push(`İş təcrübəsi minimum həddən azdır (${candExp} il < ${minExp} il)`);
      }
    }
  } else {
    expScore = 95;
    pros.push(`Müvafiq iş stajı: ${candExp} il`);
  }

  // ==========================================
  // 3. ROLE & JOB TITLE SEMANTIC RELEVANCE
  // ==========================================
  const roleAnalysis = calculateRoleSemanticRelevance(
    criteria.targetJobTitle,
    candidate.jobTitle,
    candidate.suitablePositions
  );
  const roleScore = roleAnalysis.score;
  if (roleScore >= 80) {
    pros.push(roleAnalysis.note);
  } else if (roleScore < 60) {
    cons.push(roleAnalysis.note);
  }

  // ==========================================
  // 4. SALARY BUDGET FIT & NEGOTIATION GAP
  // ==========================================
  let salaryScore = 100;
  const maxBudget = criteria.maxExpectedSalary || 0;
  const candSalary = candidate.expectedSalary || 0;

  if (maxBudget > 0 && candSalary > 0) {
    if (candSalary <= maxBudget) {
      salaryScore = 100;
      pros.push(`Maaş gözləntisi (${candSalary} AZN) şirkət büdcəsi (${maxBudget} AZN) daxilindədir`);
    } else {
      const delta = candSalary - maxBudget;
      const overRatio = delta / maxBudget;
      if (overRatio <= 0.15) {
        salaryScore = 75;
        cons.push(`Maaş gözləntisi büdcədən bir qədər yüksəkdir (+${delta} AZN / +%${Math.round(overRatio * 100)})`);
      } else if (overRatio <= 0.35) {
        salaryScore = 50;
        cons.push(`Maaş gözləntisi büdcəni əhəmiyyətli dərəcədə aşır (+${delta} AZN)`);
      } else {
        salaryScore = 20;
        cons.push(`Maaş gözləntisi büdcə limitindən xeyli artıqdır (+${delta} AZN)`);
      }

      if (criteria.knockout?.strictSalaryCap && candSalary > maxBudget) {
        failedKnockouts.push(`Maaş gözləntisi (${candSalary} AZN) büdcə həddini (${maxBudget} AZN) aşır`);
      }
    }
  } else {
    salaryScore = 90;
  }

  // ==========================================
  // 5. EDUCATION LEVEL & CREDENTIALS
  // ==========================================
  let educationScore = 80;
  const reqEdu = (criteria.requiredEducation || '').toLowerCase().trim();
  const candEdu = (candidate.educationLevel || '').toLowerCase().trim();

  if (reqEdu && !reqEdu.includes('hər hansı') && !reqEdu.includes('fərq etmir')) {
    if (candEdu.includes(reqEdu) || reqEdu.includes(candEdu)) {
      educationScore = 100;
      pros.push(`Təhsil səviyyəsi tələbə tam uyğundur: ${candidate.educationLevel}`);
    } else if (candEdu.includes('magistr') || candEdu.includes('doktor')) {
      educationScore = 100;
      pros.push(`Ali elmi dərəcə: ${candidate.educationLevel}`);
    } else if ((reqEdu.includes('ali') || reqEdu.includes('bakalavr')) && candEdu.includes('orta')) {
      educationScore = 40;
      cons.push(`Ali təhsil tələb olunur, namizəddə orta/kollec dərəcəsidir`);
      if (criteria.knockout?.requireEducationLevel) {
        failedKnockouts.push(`Ali təhsil tələbi ödənmir (${candidate.educationLevel})`);
      }
    } else {
      educationScore = 70;
    }
  } else {
    educationScore = 90;
  }

  // ==========================================
  // 6. LANGUAGES PROFICIENCY
  // ==========================================
  let languageScore = 100;
  const matchedLangs: string[] = [];
  const missingLangs: string[] = [];

  const rawReqLangs = criteria.requiredLanguages || [];
  if (rawReqLangs.length > 0) {
    const candidateLangs = candidate.languages || [];

    rawReqLangs.forEach(item => {
      let langName = '';
      let minLevel = 'B1';
      if (typeof item === 'string') {
        langName = item;
      } else {
        langName = item.language;
        minLevel = item.minLevel || 'B1';
      }

      const foundCandLang = candidateLangs.find(cl =>
        cl.language.toLowerCase().includes(langName.toLowerCase()) ||
        langName.toLowerCase().includes(cl.language.toLowerCase())
      );

      if (foundCandLang) {
        const candRank = normalizeLanguageRank(foundCandLang.level);
        const reqRank = normalizeLanguageRank(minLevel);
        if (candRank >= reqRank) {
          matchedLangs.push(`${langName} (${foundCandLang.level})`);
        } else {
          matchedLangs.push(`${langName} (${foundCandLang.level} - tələb: ${minLevel})`);
        }
      } else {
        missingLangs.push(langName);
      }
    });

    if (rawReqLangs.length > 0) {
      const matchRatio = matchedLangs.length / rawReqLangs.length;
      languageScore = Math.round(matchRatio * 100);
      if (matchedLangs.length > 0) {
        pros.push(`Tələb olunan xarici dil bilikləri: ${matchedLangs.join(', ')}`);
      }
      if (missingLangs.length > 0) {
        cons.push(`Çatışmayan dil tələbləri: ${missingLangs.join(', ')}`);
      }
    }
  }

  // ==========================================
  // 7. LOCATION & REMOTE PREFERENCE
  // ==========================================
  let locationScore = 100;
  const prefLoc = (criteria.preferredLocation || '').toLowerCase().trim();
  const candLoc = (candidate.location || '').toLowerCase().trim();

  if (prefLoc && !prefLoc.includes('hər hansı') && !prefLoc.includes('hamısı')) {
    if (candLoc.includes(prefLoc) || prefLoc.includes(candLoc)) {
      locationScore = 100;
      pros.push(`Lokasiya uyğundur: ${candidate.location}`);
    } else if (candLoc.includes('distant') || prefLoc.includes('distant') || prefLoc.includes('remote')) {
      locationScore = 95;
      pros.push(`Distant/Onlayn iş imkanı mövcuddur`);
    } else {
      locationScore = 40;
      cons.push(`Yaşayış ünvanı (${candidate.location}) hədəf şəhərlə (${criteria.preferredLocation}) tam eyni deyil`);
    }
  }

  // ==========================================
  // 8. WEIGHTED MULTI-FACTOR SCORE
  // ==========================================
  const weightedSum =
    skillsScore * (weights.skills ?? 35) +
    expScore * (weights.experience ?? 20) +
    roleScore * (weights.jobTitleMatch ?? 15) +
    salaryScore * (weights.salary ?? 10) +
    educationScore * (weights.education ?? 10) +
    languageScore * (weights.languages ?? 5) +
    locationScore * (weights.location ?? 5);

  let rawCalculatedScore = Math.min(100, Math.max(5, Math.round(weightedSum / totalWeights)));

  // Strictness mode factor
  if (criteria.strictnessMode === 'strict') {
    rawCalculatedScore = Math.max(5, Math.round(rawCalculatedScore * 0.92));
  } else if (criteria.strictnessMode === 'lenient') {
    rawCalculatedScore = Math.min(100, Math.round(rawCalculatedScore * 1.05));
  }

  // Knockout penalty
  const isKnockoutFailed = failedKnockouts.length > 0;
  if (isKnockoutFailed) {
    rawCalculatedScore = Math.min(rawCalculatedScore, 35);
  }

  const overallScore = rawCalculatedScore;

  let tier: CandidateMatchResult['tier'] = 'low';
  let recommendation = '';

  if (isKnockoutFailed) {
    tier = 'low';
    recommendation = `⛔ Məcburi Meyar Kənarlaşması (Knockout Disqualified): ${failedKnockouts.join('; ')}. Qaydalara görə dərhal rədd edilməsi və ya başqa kateqoriyaya yönəldilməsi tövsiyə olunur.`;
  } else if (overallScore >= 85) {
    tier = 'ideal';
    recommendation = '🌟 Mükəmməl Uyğunluq (Top Tier Candidate): Namizəd həm əsas vəzifə, həm kritik bacarıqlar, həm də büdcə meyarlarını ən yüksək səviyyədə ödəyir. Dərhal 1-ci dərəcəli ofis müsahibəsinə dəvət edilməsi tövsiyə olunur.';
  } else if (overallScore >= 70) {
    tier = 'high';
    recommendation = '👍 Yüksək Uyğunluq (Strong Match): Əsas funksional tələblər təmin olunub. Müsahibədə dəqiqləşdirilməli bir neçə kiçik nüans mövcuddur.';
  } else if (overallScore >= 50) {
    tier = 'medium';
    recommendation = '⚠️ Qismən Uyğunluq (Potential / Reserve): Tələblərlə profil arasında müəyyən boşluqlar var. Qısa siyahıda ehtiyat kadr kimi saxlanılması məqsədəuyğundur.';
  } else {
    tier = 'low';
    recommendation = '❌ Aşağı Uyğunluq: Vakansiya tələbləri ilə namizədin təcrübəsi arasında mühüm fərqlər var. Digər alternativ rollar üçün nəzərdən keçirilə bilər.';
  }

  // Tailored Interview Questions based on candidate's gaps
  const interviewQuestions: string[] = [];
  if (missingRequired.length > 0) {
    interviewQuestions.push(`«${missingRequired[0]}» üzrə praktiki təcrübəniz nə dərəcədədir və bu istiqamətdə hansı layihələrdə iştirak etmisiniz?`);
  }
  if (candExp < minExp) {
    interviewQuestions.push(`Vakansiya üçün ${minExp} illik təcrübə tələb olunur. Cari ${candExp} illik stajınızda qarşılaşdığınız ən mürəkkəb texniki/inzibati məsələni necə həll etmisiniz?`);
  }
  if (candSalary > maxBudget && maxBudget > 0) {
    interviewQuestions.push(`Gözlənilən maaş büdcə limitindən yüksəkdir (${candSalary} AZN vs ${maxBudget} AZN). Şirkətin bonus, sığorta və ya inkişaf paketləri daxilində kompromisə açıqsınızmı?`);
  }
  if (interviewQuestions.length === 0) {
    interviewQuestions.push(`«${criteria.targetJobTitle}» vəzifəsində ilk 90 gün ərzində komandaya və şirkət hədəflərinə necə töhfə verməyi planlaşdırırsınız?`);
    interviewQuestions.push(`Əvvəlki iş yerinizdə əldə etdiyiniz ən böyük ölçülə bilən uğur nə olub?`);
  }

  const breakdown: CandidateMatchBreakdown = {
    skillsScore,
    expScore,
    roleScore,
    salaryScore,
    educationScore,
    languageScore,
    locationScore,
  };

  const knockoutResult: KnockoutResult = {
    disqualified: isKnockoutFailed,
    failedCriteria: failedKnockouts,
  };

  return {
    candidateId: candidate.id,
    overallScore,
    tier,
    breakdown,
    matchedSkills: [...matchedRequired, ...matchedPreferred],
    missingSkills: missingRequired,
    matchedLanguages: matchedLangs,
    missingLanguages: missingLangs,
    pros,
    cons,
    recommendation,
    interviewQuestions,
    knockoutResult,
  };
}

/**
 * Calculates fit scores for an entire array of candidates and computes relative percentile ranks
 */
export function batchCalculateFit(
  candidates: SmartCandidate[],
  criteria: RecruitmentCriteria
): Map<string, CandidateMatchResult> {
  const resultMap = new Map<string, CandidateMatchResult>();
  const scores: { id: string; score: number }[] = [];

  for (const candidate of candidates) {
    const res = calculateCandidateFit(candidate, criteria);
    resultMap.set(candidate.id, res);
    scores.push({ id: candidate.id, score: res.overallScore });
  }

  // Calculate Percentile Ranks
  scores.sort((a, b) => b.score - a.score);
  const total = scores.length;
  scores.forEach((item, index) => {
    const existing = resultMap.get(item.id);
    if (existing && total > 0) {
      // 1-based rank percentile (e.g. index 0 in 10 items => Top 10%)
      const percentile = Math.max(1, Math.round(((index + 1) / total) * 100));
      existing.percentileRank = percentile;
    }
  });

  return resultMap;
}
