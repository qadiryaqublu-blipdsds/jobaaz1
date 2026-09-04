export interface CVPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio?: string;
  website?: string;
  otherContacts: string[];
  confidence: 'High' | 'Medium' | 'Low';
  sourceNotes: string;
}

export interface CVWorkExperience {
  company: string;
  originalJobTitle?: string;
  position: string; // for backward compatibility
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  duration: string;
  responsibilities: string[];
  achievements: string[];
  tools?: string[];
  industry: string;
  seniorityLevel: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string;
}

export interface CVEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  graduationStatus?: string;
  educationLevel: string;
  institutionType: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string;
}

export interface ExplicitSkills {
  technicalSkills: string[];
  professionalSkills: string[];
  industrySkills: string[];
  softSkills: string[];
  tools: string[];
  software: string[];
  programmingLanguages: string[];
  hrSystems: string[];
  languages: string[];
}

export interface CVSkills {
  // Explicit skills directly stated in the CV
  explicitSkills?: ExplicitSkills;
  // Inferred or related skills clearly separated from explicit skills
  inferredSkills?: string[];
  // Legacy / convenience arrays
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  softwareTools: string[];
  industrySkills: string[];
  otherSkills: string[];
}

export interface CVCertification {
  name: string;
  issuingOrganization: string;
  date: string;
  expirationDate: string;
  credentialId: string;
  evidence?: string;
}

export interface CVProject {
  name: string;
  role: string;
  description: string;
  technologies: string[];
  results: string;
  evidence?: string;
}

export interface CVLanguage {
  language: string;
  proficiency: string;
  evidence?: string;
}

export interface CareerTimelineGap {
  period: string;
  description: string;
  note: string;
}

export interface CareerTimeline {
  earliestKnownEmployment: string;
  mostRecentEmployment: string;
  totalIdentifiableExperience: string;
  careerProgression: string;
  promotions: string[];
  industryChanges: string[];
  functionChanges: string[];
  potentialEmploymentGaps: CareerTimelineGap[];
}

export interface DeterministicScoreItem {
  score: number;
  max: number;
  explanation: string;
}

export interface DeterministicATSScore {
  atsReadability: DeterministicScoreItem; // max 20
  contentCompleteness: DeterministicScoreItem; // max 20
  keywordOptimization: DeterministicScoreItem; // max 20
  workExperienceStructure: DeterministicScoreItem; // max 15
  skillsAlignment: DeterministicScoreItem; // max 10
  educationStructure: DeterministicScoreItem; // max 5
  contactInformation: DeterministicScoreItem; // max 5
  achievementQuality: DeterministicScoreItem; // max 5
  totalScore: number; // 0-100
}

export type JobMatchRequirementStatus =
  | 'MATCH'
  | 'PARTIAL MATCH'
  | 'NOT FOUND'
  | 'CONTRADICTED'
  | 'UNKNOWN';

export interface JobMatchRequirementItem {
  requirement: string;
  category:
    | 'Required Skill'
    | 'Preferred Skill'
    | 'Experience'
    | 'Education'
    | 'Certification'
    | 'Language'
    | 'Responsibility'
    | 'Keyword';
  status: JobMatchRequirementStatus;
  evidence: string;
  note?: string;
}

export interface JobMatchAnalysis {
  hasJobDescription: boolean;
  targetJobTitle?: string;
  requiredSkillsScore: DeterministicScoreItem; // max 30
  relevantExperienceScore: DeterministicScoreItem; // max 25
  responsibilitiesAlignmentScore: DeterministicScoreItem; // max 15
  educationScore: DeterministicScoreItem; // max 10
  keywordsScore: DeterministicScoreItem; // max 10
  certificationsScore: DeterministicScoreItem; // max 5
  languagesScore: DeterministicScoreItem; // max 5
  totalMatchScore: number; // 0-100%
  matchLevel: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence';
  summary: string;
  requirements: JobMatchRequirementItem[];
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  partiallyMatchedKeywords: string[];
  missingKeywords: string[];
  ethicalRecommendations: string[]; // e.g. "Consider adding SAP only if you genuinely have SAP experience."
}

export interface AchievementAnalysis {
  quantifiedAchievements: string[];
  businessImpactAchievements: string[];
  responsibilityBasedAchievements: string[];
  genericAchievements: string[]; // e.g. "Achievement is described without a measurable result."
}

export interface ExperienceRelevanceItem {
  company: string;
  position: string;
  relevanceType: 'Directly Relevant' | 'Related' | 'Unrelated';
  reason: string;
  evidence: string;
}

export interface EvidenceReferenceItem {
  fact: string;
  sourceQuote: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface CriteriaItem {
  score: number;
  feedback: string;
}

export interface ATSAnalysis {
  atsScore: number;
  scoreLabel: string;
  compatibilityAssessment: 'Likely ATS-friendly' | 'Potential ATS parsing risk' | string;
  strengths: string[];
  issues: string[];
  parsingRisks: string[];
  criteriaBreakdown: {
    contactInfo: CriteriaItem;
    professionalSummary: CriteriaItem;
    workExperience: CriteriaItem;
    education: CriteriaItem;
    skills: CriteriaItem;
    keywords: CriteriaItem;
    jobTitles: CriteriaItem;
    dateConsistency: CriteriaItem;
    formattingReadability: CriteriaItem;
    sectionStructure: CriteriaItem;
  };
}

export interface QualityAnalysis {
  contentQuality: CriteriaItem;
  structure: CriteriaItem;
  clarity: CriteriaItem;
  professionalism: CriteriaItem;
  consistency: CriteriaItem;
  relevance: CriteriaItem;
  grammar: CriteriaItem;
  keywordUsage: CriteriaItem;
  achievementOrientation: CriteriaItem;
}

export interface RedFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detail: string;
}

export interface CandidateProfileResult {
  careerLevel: string;
  primaryProfession: string;
  mainIndustry: string;
  totalExperience: string;
  keySkills: string[];
  educationLevel: string;
  languages: string[];
  certifications: string[];
  mainStrengths: string[];
}

export interface JobMatchingProfile {
  matchableSkills: string[];
  matchableTitles: string[];
  experienceMonths: number;
  highestEducationLevel: string;
  seniority: string;
  industry: string;
  languages: string[];
  certifications: string[];
}

export interface CVAnalyzerResult {
  // 1. Executive Summary
  executiveSummary: string;

  // 2. Candidate Information
  personalInfo: CVPersonalInfo;

  // 3. Professional Summary Analysis
  professionalSummary: {
    hasOriginalSummary: boolean;
    originalSummary: string;
    aiGeneratedSummary: string;
    summaryAnalysis: string;
  };

  // 4. Work Experience
  workExperience: CVWorkExperience[];

  // 5. Career Timeline
  careerTimeline: CareerTimeline;

  // 6. Total Identifiable Experience
  totalIdentifiableExperience: string;

  // 7. Education
  education: CVEducation[];

  // 8. Skills (Explicit vs Inferred)
  skills: CVSkills;

  // 9. Languages
  languages: CVLanguage[];

  // 10. Certifications
  certifications: CVCertification[];

  // 11. Projects
  projects: CVProject[];

  // Additional sections
  awards?: string[];
  publications?: string[];
  volunteering?: string[];
  professionalMemberships?: string[];
  additionalInformation?: string[];

  // 12. ATS Analysis
  atsAnalysis: ATSAnalysis;

  // 13. ATS Score (Deterministic 8-part breakdown /100)
  atsScoreBreakdown: DeterministicATSScore;

  // 14. Keyword Analysis
  keywordAnalysis: KeywordAnalysis;

  // 15 & 16. Job Match Analysis & Score (when Job Description exists)
  jobMatchAnalysis?: JobMatchAnalysis;
  jobMatchScore?: number;

  // 17. Strengths
  strengths: string[];

  // 18. Weaknesses
  weaknesses: string[];

  // 19. Missing Information
  missingInformation: string[];

  // 20. Potential Conflicts
  potentialConflicts: string[];

  // 21. Potential Employment Gaps
  potentialEmploymentGaps: string[];

  // 22. Recommendations
  recommendations: string[];

  // 23. Evidence / Source References
  evidenceReferences: EvidenceReferenceItem[];

  // Deep Analytical Sub-structures
  experienceRelevance?: ExperienceRelevanceItem[];
  achievementAnalysis?: AchievementAnalysis;
  qualityAnalysis: QualityAnalysis;
  redFlags: RedFlag[];
  candidateProfile: CandidateProfileResult;
  jobMatchingProfile: JobMatchingProfile;

  // System metadata
  metadata: {
    extractedCharacterCount: number;
    sourceType: 'upload' | 'text';
    fileName?: string;
    hasJobDescription?: boolean;
    processedAt: string;
    engineModel: string;
  };
}

