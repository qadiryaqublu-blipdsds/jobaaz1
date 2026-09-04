import { GoogleGenAI } from '@google/genai';
import { CVAnalyzerResult } from '../types/cvAnalyzer';

/**
 * System prompt instructions enforcing strict factual extraction and zero hallucination.
 */
export const CV_ANALYZER_SYSTEM_INSTRUCTION = `Sən Gemini 3.8 Flash mühərriki ilə işləyən yüksək dəqiqlikli, faktlara əsaslanan Baş HR Direktoru və ATS (Applicant Tracking System) Ekspertisən.
Sənin əsas məqsədin təqdim olunan namizəd CV-sini DƏQİQ, FAKTLARA ƏSASLANAN və STRUKTUR VƏZİYYƏTDƏ analiz etməkdir.

ƏSAS VƏ VACİB QAYDA (ZERO HALLUCINATION):
**CV-DƏ OLMAYAN HEÇ BİR MƏLUMATI YARATMAQ, FƏRZ ETMƏK VƏ YA ƏLAVƏ ETMƏK QƏTİ QADAĞANDIR.**
- CV-də universitet adı yoxdursa → universitet adı uydurma. "Not specified" yaz.
- İşə qəbul və işdən çıxma tarixləri yoxdursa → tarix təxmin etmə. "Not specified" yaz.
- Vəzifə adı qeyri-müəyyəndirsə → başqa vəzifə ilə əvəz etmə.
- Şirkət adı yoxdursa → şirkət adı yaratma. "Not specified" yaz.
- Bacarıq CV-də qeyd edilməyibsə → namizədə aid etmə.
- Təhsil səviyyəsi açıq şəkildə göstərilməyibsə → təxmin etmə.
- AI yalnız CV-də mövcud olan faktiki məlumatları çıxarmalı və analiz etməlidir.

Metodologiya:
FACTUAL EXTRACTION FIRST → ANALYSIS SECOND → GENERATION LAST

Aşağıdakı JSON sxeminə uyğun olaraq DƏQİQ JSON formatında cavab ver:
{
  "personalInfo": {
    "fullName": "Tam Ad Soyad",
    "email": "Email və ya Not specified",
    "phone": "Telefon və ya Not specified",
    "location": "Şəhər / Ölkə və ya Not specified",
    "linkedIn": "LinkedIn URL və ya Not specified",
    "otherContacts": ["Əlavə kontaktlar"],
    "confidence": "High | Medium | Low",
    "sourceNotes": "Çıxarış barədə qeyd"
  },
  "professionalSummary": {
    "hasOriginalSummary": boolean,
    "originalSummary": "CV-dəki orijinal xülasə və ya boş string",
    "aiGeneratedSummary": "CV faktlarına əsaslanan real peşəkar xülasə",
    "summaryAnalysis": "Xülasənin keyfiyyəti barədə şərh"
  },
  "workExperience": [
    {
      "company": "Şirkət",
      "position": "Vəzifə",
      "employmentType": "Full-time | Part-time | Contract | Remote | Not specified",
      "startDate": "YYYY və ya MM.YYYY və ya Not specified",
      "endDate": "YYYY | MM.YYYY | Present | Not specified",
      "duration": "Hesablanmış müddət və ya Not specified",
      "responsibilities": ["Vəzifə öhdəliyi 1"],
      "achievements": ["Faktiki nailiyyət (yalnız CV-də varsa)"],
      "industry": "CV-dən əsaslandırılan sahə və ya Not specified",
      "seniorityLevel": "Junior | Mid-Level | Senior | Lead | Not specified",
      "confidence": "High | Medium | Low",
      "evidence": "CV mətni sübutu"
    }
  ],
  "education": [
    {
      "institution": "Müəssisə adı",
      "degree": "Dərəcə və ya Not specified",
      "fieldOfStudy": "İxtisas və ya Not specified",
      "startDate": "Tarix və ya Not specified",
      "endDate": "Bitirmə ili və ya Not specified",
      "educationLevel": "Ali (Bakalavr) | Ali (Magistr) | Orta İxtisas | Not specified",
      "institutionType": "University | College | High School | Academy / Course",
      "confidence": "High | Medium | Low",
      "evidence": "Mənbə"
    }
  ],
  "skills": {
    "technicalSkills": ["Yalnız CV-də olan texniki bacarıqlar"],
    "softSkills": ["Yalnız CV-də olan soft bacarıqlar"],
    "languages": ["Dillər"],
    "softwareTools": ["Alətlər / Proqramlar"],
    "industrySkills": ["Sahəvi bacarıqlar"],
    "otherSkills": ["Digər"]
  },
  "certifications": [
    {
      "name": "Sertifikat adı",
      "issuingOrganization": "Verən qurum",
      "date": "Tarix",
      "expirationDate": "Bitmə tarixi və ya Not specified",
      "credentialId": "ID və ya Not specified"
    }
  ],
  "projects": [
    {
      "name": "Layihə adı",
      "role": "Rol",
      "description": "Təsvir",
      "technologies": ["İstifadə olunan texnologiya"],
      "results": "Nəticə"
    }
  ],
  "languages": [
    {
      "language": "Dil",
      "proficiency": "Səviyyə (məs: Səlis, B2 və ya Not specified)"
    }
  ],
  "aiSummary": {
    "overview": "Dəqiq peşəkar xülasə",
    "totalExperienceYears": "Yalnız tarixlərdən etibarlı hesablana bilirsə (məs: 4 il) və ya Not specified",
    "primaryRoleAndDomain": "Əsas vəzifə və sahə",
    "coreCompetencies": ["Əsas bacarıq 1", "Əsas bacarıq 2"],
    "verifiedAchievements": ["Təsdiqlənmiş nailiyyət (yalnız CV-də varsa)"]
  },
  "atsAnalysis": {
    "atsScore": 85,
    "scoreLabel": "Müsahibəyə Hazır | Təkmilləşmə Tələb Olunur | Yenidən İşlənməlidir",
    "strengths": ["Güclü cəhət 1"],
    "issues": ["Çatışmazlıq 1"],
    "parsingRisks": ["ATS risk 1"],
    "criteriaBreakdown": {
      "contactInfo": { "score": 90, "feedback": "Rəy" },
      "professionalSummary": { "score": 85, "feedback": "Rəy" },
      "workExperience": { "score": 88, "feedback": "Rəy" },
      "education": { "score": 90, "feedback": "Rəy" },
      "skills": { "score": 85, "feedback": "Rəy" },
      "keywords": { "score": 80, "feedback": "Rəy" },
      "jobTitles": { "score": 90, "feedback": "Rəy" },
      "dateConsistency": { "score": 95, "feedback": "Rəy" },
      "formattingReadability": { "score": 85, "feedback": "Rəy" },
      "sectionStructure": { "score": 90, "feedback": "Rəy" }
    }
  },
  "qualityAnalysis": {
    "contentQuality": { "score": 85, "feedback": "Rəy" },
    "structure": { "score": 90, "feedback": "Rəy" },
    "clarity": { "score": 85, "feedback": "Rəy" },
    "professionalism": { "score": 90, "feedback": "Rəy" },
    "consistency": { "score": 88, "feedback": "Rəy" },
    "relevance": { "score": 90, "feedback": "Rəy" },
    "grammar": { "score": 92, "feedback": "Rəy" },
    "keywordUsage": { "score": 82, "feedback": "Rəy" },
    "achievementOrientation": { "score": 80, "feedback": "Rəy" }
  },
  "redFlags": [
    {
      "type": "Tarix və ya xronologiya uyğunsuzluğu",
      "severity": "low | medium | high",
      "description": "Açıqlama",
      "detail": "Detallar"
    }
  ],
  "candidateProfile": {
    "careerLevel": "Entry | Junior | Mid-Level | Senior | Lead",
    "primaryProfession": "Əsas peşə",
    "mainIndustry": "Əsas sahə",
    "totalExperience": "Müddət",
    "keySkills": ["Açar bacarıqlar"],
    "educationLevel": "Təhsil səviyyəsi",
    "languages": ["Dillər"],
    "certifications": ["Sertifikatlar"],
    "mainStrengths": ["Əsas üstünlüklər"]
  },
  "jobMatchingProfile": {
    "matchableSkills": ["Bacarıqlar"],
    "matchableTitles": ["Vəzifə adları"],
    "experienceMonths": 0,
    "highestEducationLevel": "Səviyyə",
    "seniority": "Seniority",
    "industry": "Sahə",
    "languages": ["Dillər"],
    "certifications": ["Sertifikatlar"]
  }
}`;

/**
 * Retrieves the Gemini API key securely from environment variables.
 */
export function getGeminiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim().length > 15) {
    return explicitKey.trim();
  }

  // Node.js environment
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '');
    if (key && key !== 'undefined' && key !== 'null' && key.length > 15) {
      return key;
    }
  }

  // Vite/Browser environment fallback if configured
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.VITE_GEMINI_API_KEY) {
      const key = String(metaEnv.VITE_GEMINI_API_KEY).trim().replace(/^["']|["']$/g, '');
      if (key && key !== 'undefined' && key.length > 15) {
        return key;
      }
    }
  } catch {
    // ignore
  }

  throw new Error('GEMINI_API_KEY_MISSING: Gemini API açarı mühit dəyişənlərində tapılmadı.');
}

/**
 * Helper to initialize the GoogleGenAI instance.
 */
export function getGeminiClient(explicitKey?: string): GoogleGenAI {
  const apiKey = getGeminiApiKey(explicitKey);
  return new GoogleGenAI({ apiKey });
}

/**
 * Strips markdown json tags if the model wraps output in ```json ... ```.
 */
export function extractCleanJson(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export interface AnalyzeCVOptions {
  language?: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * Invokes Gemini 3.8 Flash model to perform high-accuracy, zero-hallucination CV analysis
 * with forced JSON schema output.
 *
 * @param cvText - Plain text representation of the CV
 * @param options - Configuration options (apiKey, language, model)
 * @returns Parsed CVAnalyzerResult conforming to the strict factual schema
 */
export async function analyzeCVWithGemini(
  cvText: string,
  options: AnalyzeCVOptions = {}
): Promise<CVAnalyzerResult> {
  if (!cvText || !cvText.trim()) {
    throw new Error('CV_TEXT_EMPTY: Analiz üçün CV mətni daxil edilməyib.');
  }

  // Truncate CV text if exceedingly large to avoid latency bottlenecks while retaining full depth
  const sanitizedText = cvText.length > 25000 ? cvText.slice(0, 25000) : cvText;
  const targetModel = options.model || 'gemini-3.8-flash';
  const timeoutMs = options.timeoutMs || 40000;

  const ai = getGeminiClient(options.apiKey);

  const prompt = `${CV_ANALYZER_SYSTEM_INSTRUCTION}

CV MƏTNİ:
"""
${sanitizedText}
"""

İSTİFADƏÇİ DİLİ: ${options.language || 'az'}

Yalnız etibarlı JSON qaytar. JSON xaricində heç bir ön və ya son söz, izahat yazma.`;

  const candidateModels = options.model 
    ? [options.model, 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'].filter((m, idx, arr) => arr.indexOf(m) === idx)
    : ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('AI_REQUEST_TIMEOUT: Analiz sorğusu vaxt limitini keçdi.')), timeoutMs);
    });

    try {
      const responsePromise = ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          temperature: 0.1, // Near-deterministic to enforce strict zero-hallucination adherence
          responseMimeType: 'application/json',
        },
      });

      const response: any = await Promise.race([responsePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      const rawText = response?.text?.trim();
      if (!rawText) {
        throw new Error('AI_EMPTY_RESPONSE: Gemini modeli boş cavab qaytardı.');
      }

      const cleanJson = extractCleanJson(rawText);
      const parsed: CVAnalyzerResult = JSON.parse(cleanJson);

      // Inject metadata
      parsed.metadata = {
        extractedCharacterCount: sanitizedText.length,
        sourceType: 'text',
        processedAt: new Date().toISOString(),
        engineModel: currentModel,
      };

      return parsed;
    } catch (err: any) {
      if (timer) clearTimeout(timer);
      lastError = err;
      const errMsg = err?.message || String(err);

      // If quota or rate limit, try next model before failing
      const isQuotaOrRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
      if (isQuotaOrRateLimit && i < candidateModels.length - 1) {
        await new Promise(r => setTimeout(r, 400));
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('AI_ANALYSIS_FAILED: CV analizi icra edilə bilmədi.');
}

/**
 * General purpose function to call Gemini 3.8 Flash with custom prompt and configuration.
 */
export async function callGeminiFlash(
  prompt: string,
  config: {
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    apiKey?: string;
    model?: string;
  } = {}
): Promise<string> {
  const ai = getGeminiClient(config.apiKey);
  const targetModel = config.model || 'gemini-3.8-flash';

  const response: any = await ai.models.generateContent({
    model: targetModel,
    contents: prompt,
    config: {
      temperature: config.temperature ?? 0.2,
      responseMimeType: config.responseMimeType,
      systemInstruction: config.systemInstruction,
    },
  });

  return response?.text?.trim() || '';
}

export default {
  analyzeCVWithGemini,
  callGeminiFlash,
  getGeminiApiKey,
  getGeminiClient,
  CV_ANALYZER_SYSTEM_INSTRUCTION,
};
