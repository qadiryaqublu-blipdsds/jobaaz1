import { Vacancy, CVData } from '../types';

export interface ApplicationMatchEvaluation {
  score: number;
  matchLevel: 'Kritik Uyğunsuzluq' | 'Zəif Uyğunluq' | 'Orta Uyğunluq' | 'Yaxşı Uyğunluq' | 'Mükəmməl Uyğunluq';
  highlights: string[];
  matchedSkills: string[];
  missingSkills: string[];
  isCVEmpty: boolean;
}

/**
 * Normalizes Azerbaijani and international text for semantic matching
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates a genuine, transparent, and multi-dimensional ATS match score
 * for a candidate's application against a specific vacancy.
 * 
 * Empty CVs will NEVER be awarded high scores (they receive 10-15%).
 */
export function calculateApplicationMatchScore(
  vacancy: Vacancy,
  cv?: CVData | null,
  attachment?: { fileName?: string; fileType?: string; fileData?: string } | null,
  coverNote?: string
): ApplicationMatchEvaluation {
  const highlights: string[] = [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const experiences = cv?.experiences || [];
  const skills = cv?.skills || [];
  const education = cv?.education || [];
  const summary = (cv?.personalInfo?.summary || '').trim();
  const candidateJobTitle = (cv?.personalInfo?.jobTitle || '').trim();
  const hasAttachment = Boolean(attachment?.fileName || attachment?.fileData);
  const coverText = (coverNote || '').trim();

  // 1. Detect completely empty or minimal CV
  const isDigitalCVEmpty =
    experiences.length === 0 &&
    skills.length === 0 &&
    education.length === 0 &&
    summary.length === 0 &&
    candidateJobTitle.length === 0;

  if (isDigitalCVEmpty) {
    if (hasAttachment) {
      // Candidate uploaded a file (PDF/Word) but didn't fill in the digital CV fields
      const fileExt = (attachment?.fileName || '').split('.').pop()?.toUpperCase() || 'Sənəd';
      highlights.push(`📎 ${fileExt} formatında xarici CV sənədi təqdim edilib (${attachment?.fileName || 'Fayl'}).`);
      if (coverText.length > 20) {
        highlights.push('✍️ Müşayiət məktubu (Cover letter) əlavə edilib.');
      }
      highlights.push('📋 Rəqəmsal profil doldurulmadığından HR tərəfindən ilkin sənəd baxışı tələb olunur.');

      const score = Math.min(65, 45 + (coverText.length > 20 ? 10 : 0) + (attachment?.fileName ? 5 : 0));
      return {
        score,
        matchLevel: 'Orta Uyğunluq',
        highlights,
        matchedSkills: [],
        missingSkills: vacancy.skills || [],
        isCVEmpty: false,
      };
    }

    // Completely empty application: NO experience, NO skills, NO education, NO attachment
    highlights.push('⚠️ Boş CV: Heç bir iş təcrübəsi, əsas bacarıq və ya təhsil qeyd olunmayıb.');
    highlights.push('⚠️ Vakansiyanın tələb etdiyi ixtisas və texnoloji bacarıqlara uyğunluq təsdiqlənməyib.');
    highlights.push('💡 Şirkət tərəfindən dəyərləndirilmək üçün profilinizdə CV məlumatlarını tamamlayın.');

    return {
      score: 12, // Realistic baseline for an empty CV, NOT 84%!
      matchLevel: 'Kritik Uyğunsuzluq',
      highlights,
      matchedSkills: [],
      missingSkills: vacancy.skills || [],
      isCVEmpty: true,
    };
  }

  // 2. Score Section: Job Title & Category Alignment (Max 25 points)
  let titleScore = 0;
  const normVacTitle = normalizeText(vacancy.title);
  const normVacCat = normalizeText(vacancy.category || '');
  const normCandTitle = normalizeText(candidateJobTitle);

  if (normCandTitle) {
    if (normCandTitle === normVacTitle) {
      titleScore = 25;
      highlights.push(`🎯 Vəzifə adı ilə CV ixtisası tam uyğundur: "${candidateJobTitle}".`);
    } else {
      const candTokens = normCandTitle.split(' ').filter((t) => t.length > 2);
      const vacTokens = normVacTitle.split(' ').filter((t) => t.length > 2);
      const tokenMatches = candTokens.filter((t) => vacTokens.includes(t));

      if (tokenMatches.length > 0) {
        titleScore = Math.min(22, 12 + tokenMatches.length * 5);
        highlights.push(`💼 Vəzifə istiqaməti üzrə oxşar ixtisas: "${candidateJobTitle}".`);
      } else if (normVacCat && normVacCat.includes(normCandTitle)) {
        titleScore = 15;
        highlights.push(`📂 Vakansiya kateqoriyası ilə ixtisas uyğunluğu mövcuddur.`);
      } else {
        titleScore = 5;
        highlights.push(`ℹ️ İxtisas fərqi: Namizəd "${candidateJobTitle}", vakansiya "${vacancy.title}".`);
      }
    }
  } else {
    titleScore = 4;
  }

  // 3. Score Section: Skills Matching (Max 35 points)
  let skillsScore = 0;
  const targetSkills = (vacancy.skills || []).map((s) => s.trim()).filter((s) => s.length > 0);
  
  // Combine all candidate skill keywords (explicit skills + experience descriptions + summary)
  const candidateSkillWords = new Set<string>();
  skills.forEach((s) => {
    normalizeText(s.name)
      .split(' ')
      .forEach((w) => candidateSkillWords.add(w));
  });
  experiences.forEach((e) => {
    normalizeText(`${e.position} ${e.description}`)
      .split(' ')
      .forEach((w) => candidateSkillWords.add(w));
  });
  normalizeText(summary)
    .split(' ')
    .forEach((w) => candidateSkillWords.add(w));

  if (targetSkills.length > 0) {
    targetSkills.forEach((tSkill) => {
      const normTarget = normalizeText(tSkill);
      const parts = normTarget.split(' ').filter((p) => p.length > 1);
      const isMatched = parts.some((p) => candidateSkillWords.has(p));

      if (isMatched) {
        matchedSkills.push(tSkill);
      } else {
        missingSkills.push(tSkill);
      }
    });

    const matchRatio = matchedSkills.length / targetSkills.length;
    skillsScore = Math.round(matchRatio * 35);

    if (matchedSkills.length > 0) {
      highlights.push(`✅ Tələb olunan ${matchedSkills.length}/${targetSkills.length} əsas bacarıq təsdiqləndi: ${matchedSkills.slice(0, 4).join(', ')}${matchedSkills.length > 4 ? ' və s.' : ''}.`);
    }
    if (missingSkills.length > 0 && missingSkills.length <= 4) {
      highlights.push(`⚠️ Əlavə tələb olunan biliklər: ${missingSkills.join(', ')}.`);
    }
  } else {
    // Vacancy has no listed skills: award baseline based on candidate skills count
    skillsScore = Math.min(30, Math.max(10, skills.length * 4));
    if (skills.length > 0) {
      highlights.push(`🛠️ Namizədin ${skills.length} peşəkar bacarığı qeydə alınıb.`);
    }
  }

  // 4. Score Section: Work Experience Depth (Max 25 points)
  let expScore = 0;
  if (experiences.length === 0) {
    expScore = 2;
    highlights.push('⚠️ İş təcrübəsi bölməsi boşdur.');
  } else {
    // Check candidate experience volume
    const expCount = experiences.length;
    const reqLevel = normalizeText(vacancy.experienceLevel || '');

    if (reqLevel.includes('tecrubesiz') || reqLevel.includes('telebe') || reqLevel.includes('junior') || reqLevel.includes('0')) {
      expScore = 25;
      highlights.push(`🎓 Başlanğıc / tələbə səviyyəsi tələbinə tam uyğundur (${expCount} qeyd).`);
    } else if (reqLevel.includes('5+') || reqLevel.includes('senior') || reqLevel.includes('rehber')) {
      if (expCount >= 3) {
        expScore = 25;
        highlights.push(`🏆 Senior səviyyə üçün zəngin iş təcrübəsi (${expCount} fərqli şirkət/vəzifə).`);
      } else if (expCount >= 1) {
        expScore = 15;
        highlights.push(`📈 Təcrübə mövcuddur (${expCount} vəzifə), lakin senior səviyyə üçün daha çox staj tələb oluna bilər.`);
      }
    } else {
      // Mid level (1-3 or 3-5 years)
      if (expCount >= 2) {
        expScore = 24;
        highlights.push(`💼 Orta / Mid-level vəzifəsi üçün adekvat təcrübə (${expCount} vəzifə qeydi).`);
      } else {
        expScore = 16;
        highlights.push(`💼 1 iş təcrübəsi qeydə alınıb.`);
      }
    }
  }

  // 5. Score Section: Education & Certifications (Max 10 points)
  let eduScore = 0;
  if (education.length > 0) {
    eduScore += 6;
  }
  if ((cv?.certificates || []).length > 0) {
    eduScore += 4;
    highlights.push(`📜 Sertifikat və lisenziyalar təqdim olunub (${(cv?.certificates || []).length} ədəd).`);
  }

  // 6. Score Section: Cover Note & Summary (Max 5 points)
  let extraScore = 0;
  if (summary.length >= 40) extraScore += 3;
  if (coverText.length >= 30) {
    extraScore += 2;
    highlights.push('✉️ Xüsusi müraciət məktubu (Cover note) əlavə edilib.');
  }

  // Total raw score
  let totalScore = titleScore + skillsScore + expScore + eduScore + extraScore;
  totalScore = Math.max(15, Math.min(97, Math.round(totalScore)));

  let matchLevel: ApplicationMatchEvaluation['matchLevel'];
  if (totalScore >= 85) matchLevel = 'Mükəmməl Uyğunluq';
  else if (totalScore >= 70) matchLevel = 'Yaxşı Uyğunluq';
  else if (totalScore >= 50) matchLevel = 'Orta Uyğunluq';
  else if (totalScore >= 30) matchLevel = 'Zəif Uyğunluq';
  else matchLevel = 'Kritik Uyğunsuzluq';

  return {
    score: totalScore,
    matchLevel,
    highlights,
    matchedSkills,
    missingSkills,
    isCVEmpty: false,
  };
}
