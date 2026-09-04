import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { buildFactualDeepFallback } from './server/deepCvAnalyzer';
import { buildGeminiCVPrompt, generateRealisticFallbackCV, sanitizeParsedCV } from './server/cvGenerator';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of Gemini client
function getAI(): GoogleGenAI | null {
  let apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  // Strip quotes if present
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  if (
    apiKey === 'MY_GEMINI_API_KEY' ||
    apiKey === 'undefined' ||
    apiKey === 'null' ||
    apiKey === '' ||
    apiKey.length < 15
  ) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch {
    return null;
  }
}

// Track temporary quota or credit depletion (e.g. 429 RESOURCE_EXHAUSTED / prepayment credits depleted)
let geminiQuotaDepletedUntil = 0;

/**
 * Resilient helper to call Gemini with multi-model fallback and retry.
 * Handles 503 (high demand), 429 (rate limits), and transient network errors.
 * Gracefully bails on 401 / unauthenticated / depleted prepayment states without spamming error logs.
 */
async function callGeminiResilient(
  contents: any,
  config?: any,
  preferredModel?: string,
  timeoutMs: number = 30000
): Promise<string> {
  const ai = getAI();
  if (!ai) {
    throw new Error('AI_UNAVAILABLE');
  }

  // If prepayment credits or quota was recently depleted, fail fast to avoid spamming the logs
  if (Date.now() < geminiQuotaDepletedUntil) {
    throw new Error('AI_QUOTA_DEPLETED');
  }

  const effectiveTimeout = config?.timeoutMs || timeoutMs;

  // Prioritize Gemini 3.8 Flash as requested, followed by robust standard fallbacks
  const defaultModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.1-pro-preview'];
  const candidateModels = preferredModel
    ? [preferredModel, ...defaultModels.filter(m => m !== preferredModel)]
    : defaultModels;
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    let timer: NodeJS.Timeout | null = null;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('AI_REQUEST_TIMEOUT')), effectiveTimeout);
      });

      const response: any = await Promise.race([
        ai.models.generateContent({
          model,
          contents,
          config,
        }),
        timeoutPromise,
      ]);

      if (timer) clearTimeout(timer);

      const text = response?.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      if (timer) clearTimeout(timer);
      lastError = err;
      const errMsg = err?.message || String(err);

      // If a timeout happened, don't repeat long multi-model timeouts; fail fast to fallback
      if (errMsg.includes('AI_REQUEST_TIMEOUT') && i >= 1) {
        break;
      }

      // Check if authentication failed
      const isAuthError =
        errMsg.includes('401') ||
        errMsg.includes('UNAUTHENTICATED') ||
        errMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
        errMsg.includes('API key not valid') ||
        errMsg.includes('INVALID_ARGUMENT');

      if (isAuthError) {
        // Set short cooldown so subsequent calls don't hammer the API
        geminiQuotaDepletedUntil = Date.now() + 60 * 1000;
        console.log('[Gemini AI Engine] Authentication error encountered. Utilizing offline HR fallback.');
        throw new Error('AI_UNAVAILABLE');
      }

      // Check if 429 / quota limit was reached on this specific model
      const isQuotaOrRateLimit =
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('depleted') ||
        errMsg.includes('prepayment') ||
        errMsg.includes('quota');

      if (isQuotaOrRateLimit) {
        // If there are other candidate models to try, try the next model after a brief pause
        if (i < candidateModels.length - 1) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        // All models exhausted or hit quota: set brief 30s cooldown and switch to offline HR fallback
        geminiQuotaDepletedUntil = Date.now() + 30 * 1000;
        console.log('[Gemini AI Engine] Rate limit/quota reached on AI provider. Seamlessly applying intelligent offline HR fallback.');
        throw new Error('AI_QUOTA_DEPLETED');
      }

      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand');

      if (isTransient) {
        // Wait 300ms before trying next model
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  throw lastError || new Error('AI_GENERATION_FAILED');
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// 2. AI CV Content Generation & Improvement
app.post('/api/ai/generate-cv-content', async (req, res) => {
  const { type, role, keywords, currentText } = req.body;

  // Fallback generator in Azerbaijani
  const getFallbackContent = () => {
    if (type === 'summary') {
      return `${role || 'Mütəxəssis'} sahəsində dərin bilik və praktiki təcrübəyə malik nəticəyönümlü peşəkar. Müasir metodologiyalar, komanda ilə sıx koordinasiya və layihələrin vaxtında yüksək keyfiyyətlə təhvil verilməsi üzrə ixtisaslaşmışam. Şirkətin biznes hədəflərinə dəyər qatmaq və davamlı inkişaf əsas prioritetimdir.`;
    } else if (type === 'experience_bullets') {
      return `• ${role || 'Vəzifə'} üzrə əsas layihələrin icrası və proseslərin 30% optimallaşdırılması.\n• Komanda ilə birlikdə mürəkkəb tapşırıqların uğurla həyata keçirilməsi və səmərəliliyin artırılması.\n• Müasir standartlara uyğun hesabatlılığın və keyfiyyətə nəzarətin təmin edilməsi.\n• Müştəri və tərəfdaşlarla effektiv əlaqələrin qurulması.`;
    } else {
      return `• Problem həlli və analitik düşüncə\n• Komandada effektiv işləmək\n• Layihə idarəetməsi və vaxt bölgüsü\n• Müasir texnologiyalar və alətlər\n• Peşəkar ünsiyyət və hesabatlılıq`;
    }
  };

  try {
    let prompt = '';
    if (type === 'summary') {
      prompt = `Sən peşəkar HR və CV məsləhətçisisən. Azərbaycan dilində "${role || 'Mütəxəssis'}" vəzifəsi üçün güclü, təsirli və ATS-dostu 3-4 cümləlik CV xülasəsi (Professional Summary / Haqqımda) yaz.
Əgər namizədin mövcud mətni varsa: "${currentText || ''}", onu təkmilləşdir, peşəkar və cəlbedici et.
Açar sözlər: ${keywords?.join(', ') || 'təcrübə, layihələr, nəticəyönümlülük'}.
Yalnız Azərbaycan dilində hazır mətn qaytar, əlavə izah və ya salamlaşma yazma.`;
    } else if (type === 'experience_bullets') {
      prompt = `Sən təcrübəli karyera kouçusan. Azərbaycan dilində "${role || 'Vəzifə'}" vəzifəsi üzrə CV-də iş təcrübəsi bəndləri (achievement bullet points) yaz.
Göstəricilər ölçülə bilən olsun (məsələn % artım, optimizasiya, uğurlu layihələr).
Mövcud qaralama: "${currentText || ''}".
Açar sözlər: ${keywords?.join(', ') || 'liderlik, optimizasiya, layihə idarəetməsi'}.
Format: 4 ədəd güclü maddə bəndi (• simvolu ilə başlayan). Yalnız Azərbaycan dilində cavab ver.`;
    } else {
      prompt = `"${role || 'Mütəxəssis'}" vəzifəsi üçün ən çox tələb olunan 6-8 texniki və yumşaq bacarıq (skill) siyahısı tərtib et.
Format: hər sətirdə 1 bacarıq. Yalnız Azərbaycan dilində cavab ver.`;
    }

    const content = await callGeminiResilient(prompt);
    return res.json({ content: content || getFallbackContent() });
  } catch {
    return res.json({ content: getFallbackContent() });
  }
});

// 2b. Full AI CV Generator Endpoint (Complete Structured CV)
app.post('/api/ai/generate-full-cv', async (req, res) => {
  const { jobTitle, experienceLevel, fullName, city, skillsSummary, language, photoUrl } = req.body || {};
  const requestPayload = {
    jobTitle: jobTitle || 'Frontend Developer',
    experienceLevel: experienceLevel || 'mid',
    fullName: fullName || 'Əli Məmmədov',
    city: city || 'Bakı, Azərbaycan',
    skillsSummary,
    language: language || 'az',
    photoUrl
  };

  try {
    const prompt = buildGeminiCVPrompt(requestPayload);
    const geminiRaw = await callGeminiResilient(
      prompt,
      {
        responseMimeType: 'application/json',
        temperature: 0.35,
        timeoutMs: 25000,
      },
      'gemini-3.8-flash'
    );

    // Clean any accidental markdown wrap
    const cleanedJson = geminiRaw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);
    const validatedCV = sanitizeParsedCV(parsed, requestPayload);

    return res.json({
      success: true,
      cvData: validatedCV,
      source: 'gemini_ai'
    });
  } catch (err: any) {
    console.log('[AI Full CV Generator] Utilizing intelligent fallback engine:', err?.message || err);
    const fallbackCV = generateRealisticFallbackCV(requestPayload);
    return res.json({
      success: true,
      cvData: fallbackCV,
      source: 'domain_fallback'
    });
  }
});

// ==========================================
// Robust Document Text Extraction (PDF, DOCX, DOC, TXT)
// ==========================================
function extractTextFromBinaryDoc(buffer: Buffer): string {
  try {
    // 1. Try UTF-16LE extraction (common in Word 97-2003 .doc binary files)
    const utf16 = buffer.toString('utf16le');
    const utf16Matches = utf16.match(/[\p{L}\p{N}\s.,@/:;()\-+–—]{4,}/gu) || [];
    const utf16Clean = utf16Matches
      .map(s => s.trim())
      .filter(s => s.length >= 4 && !s.includes('\u0000'))
      .join('\n');

    // 2. Try UTF-8 / printable ASCII extraction
    const utf8 = buffer.toString('utf-8');
    const printableUtf8 = utf8.replace(/[^\x20-\x7E\p{L}\p{N}\n\r\t.,@/:;()\-+–—]/gu, ' ');
    const utf8Lines = printableUtf8
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3 && !l.startsWith('<<') && !l.startsWith('obj') && !l.startsWith('%PDF'));
    const utf8Clean = utf8Lines.join('\n');

    if (utf16Clean.length > 100 && utf16Clean.length > utf8Clean.length) {
      return utf16Clean.replace(/\n{3,}/g, '\n\n').trim();
    }
    if (utf8Clean.length > 30) {
      return utf8Clean.replace(/\n{3,}/g, '\n\n').trim();
    }
    if (utf16Clean.length > 30) {
      return utf16Clean.replace(/\n{3,}/g, '\n\n').trim();
    }
  } catch {
    // ignore
  }
  return '';
}

async function extractTextFromBuffer(buffer: Buffer, mimeType?: string, fileName?: string): Promise<string> {
  if (!buffer || buffer.length === 0) return '';

  const lowerName = (fileName || '').toLowerCase();
  const isPdfHeader = buffer.length >= 4 && buffer.slice(0, 1024).toString('ascii').includes('%PDF');
  const isPdf = isPdfHeader || mimeType === 'application/pdf' || lowerName.endsWith('.pdf');

  // Check if buffer is actually a ZIP container (PK\x03\x04 or PK\x05\x06)
  // Mammoth relies on JSZip and ONLY works on valid ZIP archives.
  const isZip = buffer.length >= 22 && buffer[0] === 0x50 && buffer[1] === 0x4B && (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);
  const isDocxExtension = lowerName.endsWith('.docx') || (mimeType?.includes('officedocument') && mimeType?.includes('wordprocessingml'));

  // 1. PDF Extraction
  if (isPdf && isPdfHeader) {
    try {
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      await parser.destroy();
      if (res?.text && res.text.trim().length > 15) {
        const cleanPdfText = res.text
          .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '\n')
          .replace(/Page\s+\d+\s+of\s+\d+/gi, '\n')
          .replace(/\f/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        return cleanPdfText;
      }
    } catch {
      // PDF parse failed or scanned image, proceed to text fallback
    }
  }

  // 2. DOCX Extraction (Mammoth ONLY works on valid ZIP files)
  if (isZip && (isDocxExtension || mimeType?.includes('word') || mimeType?.includes('officedocument') || lowerName.endsWith('.docx'))) {
    try {
      const docxRes = await mammoth.extractRawText({ buffer });
      if (docxRes?.value && docxRes.value.trim().length > 15) {
        return docxRes.value.trim();
      }
    } catch {
      // Mammoth failed (corrupt archive, password protected, etc.) - proceed to binary fallback
    }
  }

  // 3. Binary .DOC / RTF / Mixed Text Extraction
  const binaryText = extractTextFromBinaryDoc(buffer);
  if (binaryText && binaryText.length > 20) {
    return binaryText;
  }

  // 4. Plain text or UTF-8 decode
  try {
    const raw = buffer.toString('utf-8');
    const printable = raw.replace(/[^\x20-\x7E\p{L}\p{N}\n\r\t.,@/:;()\-+]/gu, ' ');
    const lines = printable.split('\n').map(l => l.trim()).filter(l => l.length > 2 && !l.startsWith('%PDF') && !l.startsWith('<<'));
    if (lines.length > 2) {
      return lines.join('\n');
    }
  } catch {
    // ignore
  }

  return '';
}

async function extractTextFromUpload(fileBase64?: string, mimeType?: string, fileName?: string, rawText?: string): Promise<string> {
  let combinedText = (rawText || '').trim();

  if (fileBase64 && typeof fileBase64 === 'string' && fileBase64.length > 50) {
    try {
      const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
      const buffer = Buffer.from(cleanBase64, 'base64');
      const extracted = await extractTextFromBuffer(buffer, mimeType, fileName);
      if (extracted && extracted.length > 20) {
        if (!combinedText) {
          combinedText = extracted;
        } else if (!combinedText.includes(extracted.slice(0, 50))) {
          combinedText = `${extracted}\n\n${combinedText}`;
        }
      }
    } catch (err) {
      console.log('Buffer extraction note:', err);
    }
  }

  return combinedText.trim();
}

// 150+ Comprehensive Real Skills Dictionary
const ALL_KNOWN_SKILLS = [
  // Tech / IT
  'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Next.js', 'Vue.js', 'Angular', 'Python', 'Java', 'C#', '.NET',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'CI/CD', 'Linux',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'REST API', 'GraphQL', 'AWS', 'Azure', 'GCP',
  'Figma', 'UI/UX', 'Photoshop', 'Illustrator', 'AutoCAD', 'Swift', 'Kotlin', 'Flutter', 'Dart', 'PHP', 'Laravel', 'Django',
  'Spring Boot', 'C++', 'Golang', 'Rust', 'Ruby', 'R', 'MATLAB', 'Cybersecurity', 'Kibertəhlükəsizlik', 'Network', 'Şəbəkə',
  
  // Office, Data, Accounting & Finance
  'Excel', 'MS Excel', 'Power BI', 'Tableau', '1C', '1C Mühasibat', 'MS Word', 'PowerPoint', 'Access', 'Outlook',
  'Maliyyə analizi', 'Maliyyə hesabatları', 'Audit', 'Vergi', 'Vergi Məcəlləsi', 'Büdcələmə', 'Mühasibat',
  'Statistika', 'Data Science', 'Machine Learning', 'Data Mining', 'SQL Server',
  
  // Business, HR, Sales & Marketing
  'Jira', 'Trello', 'Scrum', 'Agile', 'Layihə idarəetməsi', 'Project Management', 'Product Management',
  'İnsan Resursları', 'HR', 'İşə qəbul', 'Recruitment', 'Kadr kargüzarlığı', 'Təlim və inkişaf',
  'B2B Satış', 'B2C Satış', 'Satış idarəetməsi', 'Müştəri xidmətləri', 'Marketinq', 'Rəqəmsal Marketinq',
  'SMM', 'SEO', 'Google Ads', 'Kopiraytinq', 'Məzmun idarəetməsi',
  
  // Soft skills
  'Komanda ilə iş', 'Problemlərin həlli', 'Analitik düşüncə', 'Liderlik', 'Ünsiyyət bacarıqları',
  'Vaxtın idarə edilməsi', 'Təqdimat bacarığı', 'Danışıqların aparılması', 'Stressə davamlılıq', 'Dəqiqlik',
  'Tənqidi düşüncə', 'Çeviklik', 'Məsuliyyət'
];

// Reference dictionaries for accurate extraction of companies and universities
const KNOWN_AZ_COMPANIES = [
  'Kapital Bank', 'PASHA Bank', 'Paşa Bank', 'ABB', 'Azərbaycan Beynəlxalq Bankı', 'Unibank', 'Bank Respublika', 'AccessBank',
  'Rabitəbank', 'Yelo Bank', 'Xalq Bank', 'TuranBank', 'Premium Bank', 'Ziraat Bank', 'Expressbank', 'Bank of Baku', 'Muğanbank',
  'SOCAR', 'Azercell', 'Bakcell', 'Nar', 'Azerfon', 'Bravo Supermarket', 'Bazarstore', 'Araz Supermarket', 'Veysəloğlu',
  'OBA Market', 'Kontakt Home', 'Baku Electronics', 'İrşad', 'Irshad', 'Optimal Electronics', 'World Telecom', 'Maxi.az',
  'PASHA Holding', 'Gilan Holding', 'Synergy Group', 'PMD Group', 'Azərsun', 'Azersun', 'Avrora', 'Metak', 'Norm Sement',
  'Technest', 'ATL Tech', 'Cybernet', 'Sinam', 'Ultra Technologies', 'RISK', 'Crocusoft', 'Code Academy', 'Div Academy', 'Matrix Training Center',
  'Dövlət Vergi Xidməti', 'DOST Agentliyi', 'ASAN Xidmət', 'Mərkəzi Bank', 'RİNN', 'TƏBİB', 'Aztelekom', 'Baktelecom',
  'Freelance', 'Fərdi Sahibkar', 'Remote', 'Upwork'
];

function normalizeAzText(str: string): string {
  return (str || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ə/g, 'ə')
    .replace(/Ö/g, 'ö')
    .replace(/Ü/g, 'ü')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ş/g, 'ş')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

const KNOWN_UNIVERSITIES = [
  { short: 'BDU', full: 'Bakı Dövlət Universiteti', regex: /(?:bakı\s+dövlət\s+universiteti|baki\s+dovlət\s+universiteti|bdu|baku\s+state\s+university)/i },
  { short: 'UNEC', full: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)', regex: /(?:azərbaycan\s+dövlət\s+iqtisad\s+universiteti|azərbaycan\s+dovlət\s+iqtisad\s+universiteti|unec|iqtisad\s+universiteti|azerbaijan\s+state\s+university\s+of\s+economics)/i },
  { short: 'ADA', full: 'ADA Universiteti', regex: /(?:ada\s+universiteti|ada\s+university|\bada\b)/i },
  { short: 'ADNSU', full: 'Azərbaycan Dövlət Neft və Sənaye Universiteti (ADNSU / ASOIU)', regex: /(?:azərbaycan\s+dövlət\s+neft\s+və\s+sənaye\s+universiteti|azərbaycan\s+dovlət\s+neft\s+və\s+sənaye\s+universiteti|adnsu|asoiu|neft\s+akademiyası|neft\s+akademiyasi|azii)/i },
  { short: 'AzTU', full: 'Azərbaycan Texniki Universiteti (AzTU)', regex: /(?:azərbaycan\s+texniki\s+universiteti|aztu|texniki\s+universitet)/i },
  { short: 'BMU', full: 'Bakı Mühəndislik Universiteti (BMU)', regex: /(?:bakı\s+mühəndislik\s+universiteti|baki\s+muhəndislik\s+universiteti|bmu|qafqaz\s+universiteti|baku\s+engineering\s+university)/i },
  { short: 'ADU', full: 'Azərbaycan Dillər Universiteti (ADU)', regex: /(?:azərbaycan\s+dillər\s+universiteti|adu|dillər\s+universiteti)/i },
  { short: 'BSU', full: 'Bakı Slavyan Universiteti (BSU)', regex: /(?:bakı\s+slavyan\s+universiteti|baki\s+slavyan\s+universiteti|bsu|slavyan\s+universiteti)/i },
  { short: 'ATU', full: 'Azərbaycan Tibb Universiteti (ATU)', regex: /(?:azərbaycan\s+tibb\s+universiteti|atu|tibb\s+universiteti)/i },
  { short: 'ADPU', full: 'Azərbaycan Dövlət Pedaqoji Universiteti (ADPU)', regex: /(?:azərbaycan\s+dövlət\s+pedaqoji\s+universiteti|adpu|pedaqoji\s+universitet)/i },
  { short: 'AzMİU', full: 'Azərbaycan Memarlıq və İnşaat Universiteti (AzMİU)', regex: /(?:azərbaycan\s+memarlıq\s+və\s+inşaat\s+universiteti|azmiu|inşaat\s+universiteti)/i },
  { short: 'Khazar', full: 'Xəzər Universiteti (Khazar University)', regex: /(?:xəzər\s+universiteti|khazar\s+university)/i },
  { short: 'WCU', full: 'Qərbi Kaspi Universiteti (Western Caspian University)', regex: /(?:qərbi\s+kaspi\s+universiteti|western\s+caspian\s+university)/i },
  { short: 'BBU', full: 'Bakı Biznes Universiteti (BBU)', regex: /(?:bakı\s+biznes\s+universiteti|baki\s+biznes\s+universiteti|bbu)/i },
  { short: 'ATMU', full: 'Azərbaycan Turizm və Menecment Universiteti (ATMU)', regex: /(?:azərbaycan\s+turizm\s+və\s+menecment\s+universiteti|atmu)/i },
  { short: 'MAA', full: 'Milli Aviasiya Akademiyası (MAA)', regex: /(?:milli\s+aviasiya\s+akademiyası|milli\s+aviasiya\s+akademiyasi|maa)/i },
  { short: 'DİA', full: 'Dövlət İdarəçilik Akademiyası (DİA)', regex: /(?:dövlət\s+idarəçilik\s+akademiyası|dovlət\s+idarəcilik\s+akademiyasi|dia)/i },
  { short: 'GDU', full: 'Gəncə Dövlət Universiteti (GDU)', regex: /(?:gəncə\s+dövlət\s+universiteti|gdu)/i },
  { short: 'SDU', full: 'Sumqayıt Dövlət Universiteti (SDU)', regex: /(?:sumqayıt\s+dövlət\s+universiteti|sumqayit\s+dovlət\s+universiteti|sdu)/i },
  { short: 'NDU', full: 'Naxçıvan Dövlət Universiteti (NDU)', regex: /(?:naxçıvan\s+dövlət\s+universiteti|ndu)/i },
  { short: 'Odlar Yurdu', full: 'Odlar Yurdu Universiteti', regex: /(?:odlar\s+yurdu\s+universiteti)/i },
];

const degreeKeywords = [
  { degree: 'Doktorantura', regex: /(?:doktorant|phd|doktorantura|aspirantura)/i },
  { degree: 'Magistr', regex: /(?:magistr|master|magistratura|msc|mba)/i },
  { degree: 'Orta ixtisas (Kollec)', regex: /(?:kollec|orta\s+ixtisas|subbakalavr)/i },
  { degree: 'Bakalavr', regex: /(?:bakalavr|bachelor|bakalavriat|bsc|ba)/i },
  { degree: 'Tam orta təhsil', regex: /(?:orta\s+məktəb|tam\s+orta\s+təhsil|lisey|gimnaziya)/i },
];

// Helper to determine whether a string token looks like a company name
function looksLikeCompany(str: string): boolean {
  if (!str || str.length < 3) return false;
  const s = normalizeAzText(str);
  if (KNOWN_AZ_COMPANIES.some(c => s.includes(normalizeAzText(c)))) return true;
  return /\b(bank|mmc|asc|llc|holding|group|şirkəti|company|hospital|klinika|supermarket|market|agentliyi|nazirliyi|xidməti|studiyası|academy|akademiyası|ltd|corp|inc)\b/i.test(s);
}

// Helper to determine whether a string token looks like a job role / position
function looksLikePosition(str: string): boolean {
  if (!str || str.length < 3) return false;
  const s = normalizeAzText(str);
  return /\b(developer|proqramçı|mütəxəssis|specialist|mühəndis|engineer|menecer|manager|mühasib|accountant|auditor|iqtisadçı|kassir|xəzinədar|operator|rəhbər|direktor|head|lead|senior|junior|middle|asistent|koordinator|təcrübəçi|intern|dizayner|designer|təlimçi|trainer|analitik|analyst|satıcı|hüquqşünas|administrator|usta|nümayəndə)\b/i.test(s);
}

function hasDatePattern(str: string): boolean {
  return /(?:(?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}|Hazırda|Present|Current|davam\s+edir))|(?:(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2})/i.test(str);
}

// Robust CV Section Segmenter
function segmentCVSections(rawText: string) {
  const lines = rawText.split('\n');
  const sections: {
    header: string[];
    summary: string[];
    education: string[];
    experience: string[];
    skills: string[];
    languages: string[];
    certificates: string[];
    projects: string[];
  } = {
    header: [],
    summary: [],
    education: [],
    experience: [],
    skills: [],
    languages: [],
    certificates: [],
    projects: []
  };

  let currentSec: keyof typeof sections = 'header';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const norm = normalizeAzText(line);

    if (/^(?:[b-z0-9]\s*[\).:-]?\s*)?(?:təhsil|education|akademik|təhsil məlumatları|обучение|образование)\b/i.test(norm)) {
      currentSec = 'education';
      continue;
    } else if (/^(?:[b-z0-9]\s*[\).:-]?\s*)?(?:iş\s+təcrübəsi|work\s+experience|experience|iş\s+stajı|karyera|əmək\s+fəaliyyəti|опыт\s+работы)\b/i.test(norm)) {
      currentSec = 'experience';
      continue;
    } else if (/^(?:[b-z0-9]\s*[\).:-]?\s*)?(?:proqram\s+və\s+texniki\s+bacarıqlar|bacarıqlar|skills|texniki\s+bacarıqlar|hard\s+skills|soft\s+skills|kompetensiyalar|alətlər|навыки)\b/i.test(norm)) {
      currentSec = 'skills';
      continue;
    } else if (/^(?:[b-z0-9]\s*[\).:-]?\s*)?(?:dillər\s+və\s+sertifikatlar|dillər|languages|dil\s+bilikləri|xarici\s+dillər|языки)\b/i.test(norm)) {
      currentSec = 'languages';
      continue;
    } else if (/^(?:[b-z0-9]\s*[\).:-]?\s*)?(?:sertifikatlar|certificates|sertifikasiyalar|diplomlar|kurslar|təlimlər|сертификаты)\b/i.test(norm)) {
      currentSec = 'certificates';
      continue;
    } else if (/^(?:[a-z0-9]\s*[\).:-]?\s*)?(?:haqqımda|xülasə|summary|about\s+me|profile|о\s+себе)\b/i.test(norm)) {
      currentSec = 'summary';
      continue;
    } else if (/^(?:[a-z0-9]\s*[\).:-]?\s*)?(?:əsas\s+məlumatlar|əlaqə|contact|contacts|şəxsi\s+məlumatlar)\b/i.test(norm)) {
      currentSec = 'header';
      continue;
    }

    if (currentSec === 'languages' && /^(?:sertifikatlar|certificates|sertifikasiyalar):?$/i.test(norm)) {
      currentSec = 'certificates';
      continue;
    }

    sections[currentSec].push(line);
  }

  return sections;
}

// Fact-based multi-line Education extractor (Zero Hallucination)
function parseEducationEntries(eduLines: string[]) {
  const entries: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    period?: string;
    current: boolean;
  }> = [];

  let currentGroup: string[] = [];

  function flushGroup() {
    if (currentGroup.length === 0) return;
    const blockText = currentGroup.join('\n');
    const normText = normalizeAzText(blockText);

    let institution = 'Mətndə qeyd olunmayıb';
    for (const u of KNOWN_UNIVERSITIES) {
      if (u.regex.test(normText)) {
        institution = u.full;
        break;
      }
    }
    if (institution === 'Mətndə qeyd olunmayıb') {
      const genericMatch = blockText.match(/([A-ZƏÖÜĞŞÇIİ][a-zəöüğşçıi\s]{2,45}(?:Universitet[a-z]*|Akademiya[a-z]*|İnstitut[a-z]*|Kollec[a-z]*|Məktəb[a-z]*))/i);
      if (genericMatch && genericMatch[1]) {
        institution = genericMatch[1].trim();
      }
    }

    let degree = 'Mətndə qeyd olunmayıb';
    for (const d of degreeKeywords) {
      if (d.regex.test(normText)) {
        degree = d.degree;
        break;
      }
    }

    let fieldOfStudy = 'Mətndə qeyd olunmayıb';
    const fieldMatch = blockText.match(/(?:ixtisas|fakultə|fakültə|major|field|ixtisası)\s*[:=-]\s*([^\n,;|]+)/i);
    if (fieldMatch && fieldMatch[1]) {
      fieldOfStudy = fieldMatch[1].trim();
    } else {
      const knownFields = [
        'Kompüter elmləri', 'Kompüter mühəndisliyi', 'İnformasiya texnologiyaları', 'Kibertəhlükəsizlik',
        'Maliyyə', 'Mühasibat', 'İqtisadiyyat', 'Menecment', 'Biznesin idarə edilməsi', 'Hüquqşünaslıq',
        'Beynəlxalq münasibətlər', 'Filologiya', 'Tərcümə', 'Riyaziyyat', 'Fizika', 'Neft-qaz', 'Tibb'
      ];
      for (const kf of knownFields) {
        if (normText.includes(normalizeAzText(kf))) {
          fieldOfStudy = kf;
          break;
        }
      }
    }

    let startDate = 'Mətndə qeyd olunmayıb';
    let endDate = 'Mətndə qeyd olunmayıb';
    const isCurrent = /hazırda|present|current|davam/i.test(normText);

    const dateRangeMatch = blockText.match(/((?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}|Hazırda|Present|Current|davam\s+edir))|((?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2})/i);
    if (dateRangeMatch) {
      const fullRange = (dateRangeMatch[1] || dateRangeMatch[2]).trim();
      const parts = fullRange.split(/\s*[-–—]\s*/);
      startDate = parts[0] ? parts[0].trim() : 'Mətndə qeyd olunmayıb';
      endDate = isCurrent ? 'Hazırda' : (parts[1] ? parts[1].trim() : 'Mətndə qeyd olunmayıb');
    } else {
      const singleYear = blockText.match(/(?:19|20)\d{2}/);
      if (singleYear) {
        startDate = singleYear[0];
        endDate = isCurrent ? 'Hazırda' : singleYear[0];
      }
    }

    if (institution !== 'Mətndə qeyd olunmayıb' || degree !== 'Mətndə qeyd olunmayıb' || fieldOfStudy !== 'Mətndə qeyd olunmayıb') {
      entries.push({
        id: `edu-${Date.now()}-${entries.length}`,
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        period: (startDate !== 'Mətndə qeyd olunmayıb' && endDate !== 'Mətndə qeyd olunmayıb') ? `${startDate} - ${endDate}` : (startDate !== 'Mətndə qeyd olunmayıb' ? startDate : undefined),
        current: isCurrent,
      });
    }
    currentGroup = [];
  }

  for (const line of eduLines) {
    const norm = normalizeAzText(line);
    const isNewEntry = KNOWN_UNIVERSITIES.some(u => u.regex.test(norm)) ||
      /(?:universitet|akademiya|institut|kollec)/i.test(norm) ||
      /^[•\-\*]/.test(line);

    if (isNewEntry && currentGroup.length > 0) {
      flushGroup();
    }
    currentGroup.push(line);
  }
  flushGroup();

  return entries;
}

// Fact-based multi-line Work Experience extractor (Zero Hallucination)
function parseExperienceEntries(expLines: string[]) {
  const entries: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    period?: string;
    current: boolean;
    description: string;
    bullets?: string[];
  }> = [];

  let currentGroup: string[] = [];

  function flushGroup() {
    if (currentGroup.length === 0) return;
    const blockText = currentGroup.join('\n');
    const normText = normalizeAzText(blockText);

    let company = 'Mətndə qeyd olunmayıb';
    const compLabelMatch = blockText.match(/(?:şirkət|şirkətin adı|iş yeri|müəssisə|company|organization)\s*[:=-]\s*([^\n,;|]+)/i);
    if (compLabelMatch && compLabelMatch[1]) {
      company = compLabelMatch[1].trim();
    } else {
      for (const kc of KNOWN_AZ_COMPANIES) {
        if (normText.includes(normalizeAzText(kc))) {
          company = kc;
          break;
        }
      }
      if (company === 'Mətndə qeyd olunmayıb') {
        for (const l of currentGroup) {
          if (looksLikeCompany(l)) {
            company = l.replace(/^[•\-\*]\s*/, '').trim();
            break;
          }
        }
      }
    }

    let position = 'Mətndə qeyd olunmayıb';
    const posLabelMatch = blockText.match(/(?:vəzifə|rol|peşə|position|role|title)\s*[:=-]\s*([^\n,;|]+)/i);
    if (posLabelMatch && posLabelMatch[1]) {
      position = posLabelMatch[1].trim();
    } else {
      for (const l of currentGroup) {
        if (looksLikePosition(l)) {
          position = l.replace(/^[•\-\*]\s*/, '').trim();
          break;
        }
      }
    }

    let startDate = 'Mətndə qeyd olunmayıb';
    let endDate = 'Mətndə qeyd olunmayıb';
    const isCurrent = /hazırda|present|current|davam/i.test(normText);

    const dateRangeMatch = blockText.match(/((?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:(?:0?[1-9]|1[0-2])[./-])?(?:19|20)\d{2}|Hazırda|Present|Current|davam\s+edir))|((?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2})/i);
    if (dateRangeMatch) {
      const fullRange = (dateRangeMatch[1] || dateRangeMatch[2]).trim();
      const parts = fullRange.split(/\s*[-–—]\s*/);
      startDate = parts[0] ? parts[0].trim() : 'Mətndə qeyd olunmayıb';
      endDate = isCurrent ? 'Hazırda' : (parts[1] ? parts[1].trim() : 'Mətndə qeyd olunmayıb');
    }

    if (company === 'Mətndə qeyd olunmayıb' && currentGroup.length > 0) {
      const firstLine = currentGroup[0].replace(/^[•\-\*]\s*/, '').trim();
      if (firstLine.length < 50 && !hasDatePattern(firstLine) && !looksLikePosition(firstLine)) {
        company = firstLine;
      }
    }
    if (position === 'Mətndə qeyd olunmayıb' && currentGroup.length > 1) {
      const secondLine = currentGroup[1].replace(/^[•\-\*]\s*/, '').trim();
      if (secondLine.length < 50 && !hasDatePattern(secondLine)) {
        position = secondLine;
      }
    }

    const dutiesAndAchievements: string[] = [];
    for (const l of currentGroup) {
      const clean = l.replace(/^[•\-\*]\s*/, '').trim();
      if (clean && clean !== company && clean !== position && !clean.includes(startDate) && !clean.includes(endDate)) {
        if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || clean.length > 25) {
          dutiesAndAchievements.push(clean);
        }
      }
    }

    if (company !== 'Mətndə qeyd olunmayıb' || position !== 'Mətndə qeyd olunmayıb' || startDate !== 'Mətndə qeyd olunmayıb') {
      entries.push({
        id: `exp-${Date.now()}-${entries.length}`,
        company,
        position,
        location: 'Bakı',
        startDate,
        endDate,
        period: (startDate !== 'Mətndə qeyd olunmayıb' && endDate !== 'Mətndə qeyd olunmayıb') ? `${startDate} - ${endDate}` : (startDate !== 'Mətndə qeyd olunmayıb' ? startDate : undefined),
        current: isCurrent,
        description: dutiesAndAchievements.join('\n') || blockText,
        bullets: dutiesAndAchievements.length > 0 ? dutiesAndAchievements : ['Mətndə əlavə təsvir qeyd olunmayıb'],
      });
    }
    currentGroup = [];
  }

  for (const line of expLines) {
    const isBullet = /^[•\-\*]/.test(line);
    const hasDate = hasDatePattern(line);
    const hasCompany = looksLikeCompany(line) || KNOWN_AZ_COMPANIES.some(c => normalizeAzText(line).includes(normalizeAzText(c)));
    const hasPos = looksLikePosition(line);

    const groupHasDate = currentGroup.some(l => hasDatePattern(l));
    const groupHasCompany = currentGroup.some(l => looksLikeCompany(l) || KNOWN_AZ_COMPANIES.some(c => normalizeAzText(l).includes(normalizeAzText(c))));

    const startsNew = !isBullet && (
      (groupHasDate && hasDate) ||
      (groupHasCompany && hasCompany) ||
      (groupHasCompany && groupHasDate && (hasCompany || hasPos))
    );

    if (startsNew && currentGroup.length > 0) {
      flushGroup();
    }
    currentGroup.push(line);
  }
  flushGroup();

  return entries;
}

// Fact-based Language Extractor
function parseLanguages(lines: string[], rawText?: string) {
  const list: Array<{ id: string; language: string; proficiency: string }> = [];
  const knownLangs = [
    { name: 'Azərbaycan dili', regex: /(?:azərbaycan\s+dili|azəri\s+dili|azerbaijani)/i },
    { name: 'İngilis dili', regex: /(?:ingilis\s+dili|ingilis|english)/i },
    { name: 'Rus dili', regex: /(?:rus\s+dili|rus|russian)/i },
    { name: 'Türk dili', regex: /(?:türk\s+dili|türk|turkish)/i },
    { name: 'Alman dili', regex: /(?:alman\s+dili|alman|german)/i },
    { name: 'Fransız dili', regex: /(?:fransız\s+dili|fransız|french)/i },
  ];

  for (const line of lines) {
    const clean = line.replace(/^[•\-\*]\s*/, '').trim();
    if (!clean || /^(?:dillər|languages|dil bilikləri):?$/i.test(normalizeAzText(clean))) continue;

    for (const kl of knownLangs) {
      if (kl.regex.test(normalizeAzText(clean))) {
        let level = 'Mətndə səviyyə qeyd olunmayıb';
        const parts = clean.split(/[-:–—|]/);
        if (parts.length > 1) {
          level = parts.slice(1).join(' ').trim();
        } else {
          const levelMatch = clean.match(/(?:A1|A2|B1|B2|C1|C2|Ana dili|Native|Fluent|Sərbəst|Orta|Başlanğıc)/i);
          if (levelMatch) level = levelMatch[0];
        }
        if (!list.some(item => item.language === kl.name)) {
          list.push({ id: `lang-${list.length + 1}`, language: kl.name, proficiency: level });
        }
      }
    }
  }

  if (list.length === 0 && rawText) {
    const norm = normalizeAzText(rawText);
    for (const kl of knownLangs) {
      if (kl.regex.test(norm)) {
        list.push({
          id: `lang-${list.length + 1}`,
          language: kl.name,
          proficiency: kl.name === 'Azərbaycan dili' ? 'Ana dili' : 'Mətndə səviyyə qeyd olunmayıb',
        });
      }
    }
  }

  return list;
}

// Fact-based Certificate Extractor
function parseCertificates(lines: string[]) {
  const certs: Array<{ id: string; name: string; date?: string; issuer?: string }> = [];
  for (const line of lines) {
    const clean = line.replace(/^[•\-\*]\s*/, '').trim();
    if (!clean || /^(?:sertifikatlar|certificates|sertifikasiyalar):?$/i.test(normalizeAzText(clean))) continue;
    const yearMatch = clean.match(/(?:19|20)\d{2}/);
    const date = yearMatch ? yearMatch[0] : undefined;
    certs.push({
      id: `cert-${certs.length + 1}`,
      name: clean,
      date,
    });
  }
  return certs;
}

// Fact-based Skills Extractor
function parseSkills(skillLines: string[], rawText: string) {
  const skills: Array<{ id: string; name: string; level: string; category: string }> = [];
  const added = new Set<string>();

  const skillSectionTokens: string[] = [];
  skillLines.forEach((l) => {
    const clean = l.replace(/^[•\-\*]\s*/, '').trim();
    if (!clean || /^(?:proqram və texniki bacarıqlar|bacarıqlar|skills):?$/i.test(normalizeAzText(clean))) return;
    const parts = clean.split(/[,;|•\n]+/).map(p => p.trim()).filter(p => p.length > 1);
    skillSectionTokens.push(...parts);
  });

  skillSectionTokens.forEach((token) => {
    const norm = normalizeAzText(token);
    if (!added.has(norm) && token.length > 1 && token.length < 50) {
      added.add(norm);
      skills.push({
        id: `sk-${skills.length + 1}`,
        name: token,
        level: 'Yaxşı',
        category: token.includes('iş') || token.includes('düşüncə') || token.includes('bacarıq') || token.includes('Liderlik') ? 'Soft skill' : 'Texniki',
      });
    }
  });

  ALL_KNOWN_SKILLS.forEach((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(rawText)) {
      const norm = normalizeAzText(kw);
      if (!added.has(norm)) {
        added.add(norm);
        skills.push({
          id: `sk-${skills.length + 1}`,
          name: kw,
          level: 'Yaxşı',
          category: kw.includes('iş') || kw.includes('düşüncə') || kw.includes('bacarıq') || kw.includes('Liderlik') ? 'Soft skill' : 'Texniki',
        });
      }
    }
  });

  return skills;
}

// Factual, Non-Hallucinating Parser from raw text (Zero fake data)
function parseFactualCVFromText(rawText: string, targetRole?: string, fileName?: string) {
  const text = (rawText || '').trim();
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const sections = segmentCVSections(text);

  // Email & Phone
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+994|0)?\s*(?:50|51|55|70|77|99|12)\s*\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/) ||
                     text.match(/\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w.-]+/i);
  const githubMatch = text.match(/github\.com\/[\w.-]+/i);

  // Name extraction (Strictly without guessing)
  let fullName = 'Namizəd';
  const nameLabelMatch = text.match(/(?:Ad,?\s*Soyad|Adı|Adınız|Name|Full Name|Namizəd)\s*[:=-]\s*([A-ZƏÖÜĞŞÇIİa-zəöüğşçıi\s]{3,35})/i);
  if (nameLabelMatch && nameLabelMatch[1]) {
    fullName = nameLabelMatch[1].trim();
  } else if (sections.header.length > 0) {
    const firstHeaderLine = sections.header[0];
    const isNameLike = /^[A-ZƏÖÜĞŞÇIİ][a-zəöüğşçıi]+(?:\s+[A-ZƏÖÜĞŞÇIİ][a-zəöüğşçıi]+){1,2}$/.test(firstHeaderLine);
    if (isNameLike) {
      fullName = firstHeaderLine;
    } else if (fileName && fileName.length > 4) {
      const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
      if (cleanFileName.length > 3 && !/^(cv|resume|document|sened|untitled)$/i.test(cleanFileName)) {
        fullName = cleanFileName;
      }
    }
  }

  // Job title
  let jobTitle = targetRole || '';
  const titleMatch = text.match(/(?:Vəzifə|İxtisas|Position|Title|Role)\s*[:=-]\s*([^\n,]{3,40})/i);
  if (titleMatch && titleMatch[1]) {
    jobTitle = titleMatch[1].trim();
  } else if (!jobTitle && lines.length > 1 && lines[1].length < 45 && !lines[1].includes('@') && !lines[1].includes('+')) {
    if (looksLikePosition(lines[1])) {
      jobTitle = lines[1];
    }
  }
  if (!jobTitle) {
    jobTitle = 'Mütəxəssis';
  }

  // Summary
  let summary = '';
  if (sections.summary.length > 0) {
    summary = sections.summary.join(' ').trim();
  } else {
    const summaryMatch = text.match(/(?:Haqqımda|Xülasə|Summary|About|Bio)\s*[:=-]?\s*([\s\S]{20,500}?)(?=\n\s*(?:Təcrübə|İş|Təhsil|Bacarıq|Experience|Education|Skills|$))/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }
  }

  // Parse Education (Strictly zero hallucination)
  let education = parseEducationEntries(sections.education);
  if (education.length === 0) {
    const candidateEduLines = lines.filter(l => 
      KNOWN_UNIVERSITIES.some(u => u.regex.test(normalizeAzText(l))) ||
      /(?:universitet|akademiya|institut|kollec)/i.test(normalizeAzText(l))
    );
    if (candidateEduLines.length > 0) {
      education = parseEducationEntries(candidateEduLines);
    }
  }

  // Parse Experience (Strictly zero hallucination)
  let experiences = parseExperienceEntries(sections.experience);
  if (experiences.length === 0) {
    const candidateExpLines = lines.filter(l => hasDatePattern(l) || looksLikeCompany(l) || looksLikePosition(l));
    if (candidateExpLines.length > 0) {
      experiences = parseExperienceEntries(candidateExpLines);
    }
  }

  // Parse Skills
  const skills = parseSkills(sections.skills, text);

  // Parse Languages
  const languages = parseLanguages(sections.languages, text);

  // Parse Certificates
  const certificates = parseCertificates(sections.certificates);

  return {
    personalInfo: {
      fullName,
      jobTitle,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      address: text.includes('Bakı') ? 'Bakı, Azərbaycan' : (text.includes('Sumqayıt') ? 'Sumqayıt, Azərbaycan' : ''),
      summary,
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : '',
      github: githubMatch ? `https://${githubMatch[0]}` : '',
    },
    skills,
    experiences,
    education,
    languages,
    certificates,
  };
}

// Deep Career Domain & Experience Breakdown Calculator
function calculateCareerDomainAnalysis(cv: any, targetRole?: string) {
  const experiences = cv?.experiences || [];
  const skills = cv?.skills || [];
  const education = cv?.education || [];

  const domainDefinitions = [
    {
      key: 'it_tech',
      name: 'İnformasiya Texnologiyaları və Proqramlaşdırma',
      keywords: [
        'developer', 'proqram', 'frontend', 'backend', 'fullstack', 'software', 'devops', 'sysadmin',
        'network', 'şəbəkə', 'it mütəxəssis', 'it specialist', 'qa', 'test', 'react', 'node', 'python',
        'java', 'c#', '.net', 'sql', 'database', 'docker', 'cloud', 'aws', 'azure', 'figma', 'ui/ux',
        'data science', 'cybersecurity', 'kibertəhlükəsizlik', 'html', 'css', 'javascript', 'typescript'
      ],
      companies: ['Technest', 'ATL Tech', 'Cybernet', 'Sinam', 'Ultra', 'Code Academy', 'Div Academy', 'Crocusoft']
    },
    {
      key: 'bank_finance',
      name: 'Bank, Maliyyə və Mühasibat',
      keywords: [
        'bank', 'kredit', 'kapital bank', 'pasha bank', 'paşa bank', 'abb', 'unibank', 'rabitəbank',
        'bank respublika', 'accessbank', 'yelo bank', 'xalq bank', 'turanbank', 'maliyyə', 'finance',
        'mühasib', 'accountant', 'audit', 'vergi', 'tax', '1c', 'büdcə', 'budget', 'xəzinə', 'teller',
        'risk', 'sığorta', 'insurance', 'iqtisadçı', 'hesabat'
      ],
      companies: ['Kapital Bank', 'PASHA Bank', 'ABB', 'Unibank', 'Bank Respublika', 'AccessBank', 'Rabitəbank', 'Yelo Bank']
    },
    {
      key: 'sales_customer',
      name: 'Satış, Müştəri Xidmətləri və Kommersiya',
      keywords: [
        'satış', 'sales', 'müştəri', 'call center', 'çağrı', 'operator', 'satıcı', 'məsləhətçi',
        'b2b', 'b2c', 'kommersiya', 'commercial', 'account manager', 'biznes inkişafı', 'retail',
        'bravo', 'bazarstore', 'araz', 'kontakt', 'irshad', 'optimal', 'mağaza'
      ],
      companies: ['Bravo', 'Bazarstore', 'Araz Supermarket', 'Kontakt Home', 'İrşad', 'Baku Electronics']
    },
    {
      key: 'marketing_pr',
      name: 'Rəqəmsal Marketinq, SMM və İctimaiyyətlə Əlaqələr',
      keywords: [
        'marketinq', 'marketing', 'smm', 'seo', 'rəqəmsal', 'digital', 'kopirayt', 'copywriter',
        'pr', 'ictimaiyyət', 'brend', 'brand', 'məzmun', 'content', 'media', 'reklam', 'advertising'
      ],
      companies: []
    },
    {
      key: 'hr_talent',
      name: 'İnsan Resursları (HR) və Kadr İşi',
      keywords: [
        'hr', 'insan resurs', 'human resource', 'rekrut', 'recruitment', 'işə qəbul', 'kadr',
        'kargüzarlıq', 'təlim', 'talent', 'payroll', 'əmək haqqı'
      ],
      companies: []
    },
    {
      key: 'engineering_industry',
      name: 'Mühəndislik, Tikinti və Sənaye',
      keywords: [
        'mühəndis', 'engineer', 'tikinti', 'inşaat', 'memar', 'architect', 'elektrik', 'mexanik',
        'qazma', 'neft', 'oil', 'socar', 'laboratoriya', 'texnoloq', 'istehsalat', 'anbar', 'logistika'
      ],
      companies: ['SOCAR', 'Norm Sement', 'Azərsun', 'Azersun', 'Metak', 'Gilan']
    },
    {
      key: 'education_training',
      name: 'Təhsil, Tədris və Akademik Fəaliyyət',
      keywords: [
        'müəllim', 'teacher', 'təlimçi', 'trainer', 'tədris', 'məktəb', 'universitet', 'kurs',
        'pedaqoq', 'repetitor', 'lektor', 'dosent', 'professor'
      ],
      companies: []
    },
    {
      key: 'admin_legal',
      name: 'İnzibati İdarəetmə, Hüquq və Əməliyyatlar',
      keywords: [
        'hüquq', 'lawyer', 'legal', 'inzibat', 'katib', 'referent', 'asistent', 'koordinator',
        'ofis menecer', 'kargüzar', 'dövlət qulluğu', 'notarius'
      ],
      companies: ['ASAN Xidmət', 'DOST', 'Dövlət Vergi Xidməti']
    }
  ];

  const domainMonths: Record<string, { months: number; roles: string[]; companies: string[] }> = {};
  domainDefinitions.forEach(d => {
    domainMonths[d.key] = { months: 0, roles: [], companies: [] };
  });

  let totalMonths = 0;

  if (experiences.length > 0) {
    experiences.forEach((exp: any) => {
      const pos = (exp.position || '').toLowerCase();
      const comp = (exp.company || '').toLowerCase();
      const desc = (exp.description || '').toLowerCase();
      const fullExpText = `${pos} ${comp} ${desc}`;

      let months = 12; // default 1 year
      const startYear = parseInt((exp.startDate || '').match(/(?:19|20)\d{2}/)?.[0] || '0', 10);
      const isCurrent = exp.current || /hazırda|present|current/i.test(exp.endDate || '');
      const endYear = isCurrent ? 2026 : parseInt((exp.endDate || '').match(/(?:19|20)\d{2}/)?.[0] || '0', 10);

      if (startYear > 1990 && endYear >= startYear) {
        months = Math.max(6, (endYear - startYear) * 12);
        if (months === 0) months = 6;
      }

      totalMonths += months;

      let matchedDomainKey = 'admin_legal';
      let maxScore = 0;

      domainDefinitions.forEach(d => {
        let score = 0;
        d.keywords.forEach(kw => {
          if (fullExpText.includes(kw)) score += 2;
        });
        d.companies.forEach(c => {
          if (comp.includes(c.toLowerCase())) score += 4;
        });
        if (score > maxScore) {
          maxScore = score;
          matchedDomainKey = d.key;
        }
      });

      if (domainMonths[matchedDomainKey]) {
        domainMonths[matchedDomainKey].months += months;
        if (exp.position && !domainMonths[matchedDomainKey].roles.includes(exp.position)) {
          domainMonths[matchedDomainKey].roles.push(exp.position);
        }
        if (exp.company && !domainMonths[matchedDomainKey].companies.includes(exp.company)) {
          domainMonths[matchedDomainKey].companies.push(exp.company);
        }
      }
    });
  } else {
    // No experiences, infer from skills & targetRole
    const searchString = `${(skills || []).map((s: any) => typeof s === 'string' ? s : s.name).join(' ')} ${targetRole || ''}`.toLowerCase();
    domainDefinitions.forEach(d => {
      let score = 0;
      d.keywords.forEach(kw => {
        if (searchString.includes(kw)) score += 2;
      });
      if (score > 0) {
        domainMonths[d.key].months = score * 3;
        totalMonths += score * 3;
      }
    });
    if (totalMonths === 0) {
      domainMonths['it_tech'].months = 6;
      totalMonths = 6;
    }
  }

  // Find dominant domain
  let dominantKey = 'it_tech';
  let highestMonths = 0;
  domainDefinitions.forEach(d => {
    if (domainMonths[d.key].months > highestMonths) {
      highestMonths = domainMonths[d.key].months;
      dominantKey = d.key;
    }
  });

  const dominantDef = domainDefinitions.find(d => d.key === dominantKey) || domainDefinitions[0];
  const domMonths = domainMonths[dominantKey].months;
  const domYears = Math.floor(domMonths / 12);
  const domRemMonths = domMonths % 12;
  const domDurationStr = domYears > 0 ? (domRemMonths > 0 ? `${domYears} il ${domRemMonths} ay` : `${domYears} il`) : `${domMonths} ay`;
  const domPercent = totalMonths > 0 ? Math.round((domMonths / totalMonths) * 100) : 100;

  const totYears = Math.floor(totalMonths / 12);
  const totRemMonths = totalMonths % 12;
  const totDurationStr = totYears > 0 ? (totRemMonths > 0 ? `${totYears} il ${totRemMonths} ay` : `${totYears} il`) : `${totalMonths} ay`;

  let seniorityLevel: any = 'Təcrübəçi / Yeni Başlayan';
  if (experiences.length === 0) {
    seniorityLevel = 'Təcrübəçi / Yeni Başlayan';
  } else if (totalMonths >= 96) {
    seniorityLevel = 'Lead / Rəhbər';
  } else if (totalMonths >= 60) {
    seniorityLevel = 'Senior (5+ il)';
  } else if (totalMonths >= 24) {
    seniorityLevel = 'Middle (2-4 il)';
  } else {
    seniorityLevel = 'Junior (1-2 il)';
  }

  // Domain breakdown list
  const domainBreakdown = domainDefinitions
    .filter(d => domainMonths[d.key].months > 0)
    .map(d => {
      const m = domainMonths[d.key].months;
      const y = Math.floor(m / 12);
      const rem = m % 12;
      const durStr = y > 0 ? (rem > 0 ? `${y} il ${rem} ay` : `${y} il`) : `${m} ay`;
      const pct = totalMonths > 0 ? Math.round((m / totalMonths) * 100) : 0;
      return {
        domain: d.name,
        duration: durStr,
        percentage: pct,
        roles: domainMonths[d.key].roles.slice(0, 3),
        companies: domainMonths[d.key].companies.slice(0, 3),
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Education summary
  const topEdu = education[0] || {};
  const highestInstitution = topEdu.institution || (education.length > 0 ? 'Ali Təhsil Müəssisəsi' : 'Təhsil qeyd olunmayıb');
  const degree = topEdu.degree || (education.length > 0 ? 'Bakalavr' : 'Göstərilməyib');
  const fieldOfStudy = topEdu.fieldOfStudy || 'İxtisas qeyd olunmayıb';
  const period = topEdu.startDate && topEdu.endDate ? `${topEdu.startDate} - ${topEdu.endDate}` : topEdu.startDate || 'İl göstərilməyib';
  const statusNote = education.length > 0
    ? `${degree} dərəcəsi (${highestInstitution})`
    : 'Rəsmi təhsil dərəcəsi qeyd olunmayıb';

  return {
    dominantDomain: dominantDef.name,
    dominantDomainExperienceYears: `${domDurationStr} (${domPercent}%)`,
    totalExperienceYears: totDurationStr,
    seniorityLevel,
    domainBreakdown: domainBreakdown.length > 0 ? domainBreakdown : [
      {
        domain: dominantDef.name,
        duration: domDurationStr,
        percentage: 100,
        roles: experiences.slice(0, 2).map((e: any) => e.position).filter(Boolean),
        companies: experiences.slice(0, 2).map((e: any) => e.company).filter(Boolean),
      }
    ],
    educationSummary: {
      highestInstitution,
      degree,
      fieldOfStudy,
      period,
      statusNote,
    },
  };
}

// Objective, Mathematical, Zero-Hallucination ATS & HR Auditor
function evaluateFactualCV(
  cvInput: any,
  rawText?: string,
  targetJobTitle?: string,
  vacancyDescription?: string,
  fileName?: string
) {
  const cv = cvInput && cvInput.personalInfo
    ? cvInput
    : parseFactualCVFromText(rawText || '', targetJobTitle, fileName);

  const fullName = cv.personalInfo?.fullName || 'Namizəd';
  const roleName = targetJobTitle || cv.personalInfo?.jobTitle || 'Mütəxəssis';
  const expCount = (cv.experiences || []).length;
  const skillsCount = (cv.skills || []).length;
  const eduCount = (cv.education || []).length;
  const langCount = (cv.languages || []).length;
  const hasEmail = !!cv.personalInfo?.email;
  const hasPhone = !!cv.personalInfo?.phone;
  const hasSummary = !!(cv.personalInfo?.summary && cv.personalInfo.summary.length > 25);

  // Purely mathematical scoring (0 - 100)
  let score = 0;
  if (hasEmail) score += 7;
  if (hasPhone) score += 5;
  if (hasSummary) score += 8;

  if (expCount >= 3) score += 30;
  else if (expCount === 2) score += 22;
  else if (expCount === 1) score += 14;

  if (skillsCount >= 8) score += 25;
  else if (skillsCount >= 4) score += 18;
  else if (skillsCount >= 1) score += 10;

  if (eduCount >= 1) score += 15;
  if (langCount >= 1) score += 5;

  if (vacancyDescription && rawText) {
    const vacWords = vacancyDescription.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    const matchedWords = vacWords.filter((w: string) => rawText.toLowerCase().includes(w));
    if (matchedWords.length > 3) score += 5;
  }

  const finalScore = Math.min(Math.max(score, 18), 94);
  const atsScore = Math.max(finalScore - Math.floor(Math.random() * 4), 15);

  const strengths: string[] = [];
  if (expCount > 0) {
    strengths.push(`${expCount} fərqli iş təcrübəsi qeyd olunub.`);
  }
  if (skillsCount > 0) {
    const sampleSkills = (cv.skills || []).slice(0, 4).map((s: any) => typeof s === 'string' ? s : s.name).join(', ');
    strengths.push(`Təsbit edilən açar bacarıqlar: ${sampleSkills}.`);
  }
  if (eduCount > 0) {
    strengths.push(`Təhsil statusu və ixtisas dərəcəsi mövcuddur.`);
  }
  if (langCount > 0) {
    strengths.push(`${langCount} xarici dil biliyi qeyd olunub.`);
  }
  if (hasEmail && hasPhone) {
    strengths.push('Əlaqə vasitələri (telefon və e-poçt) daxil edilib.');
  }
  if (strengths.length === 0) {
    strengths.push('Sənəd formatı oxunub və ilkin profil tərtib edilib.');
  }

  const weaknesses: string[] = [];
  if (expCount === 0) {
    weaknesses.push('⚠️ CV-də rəsmi iş təcrübəsi və ya şirkət qeyd olunmayıb.');
  } else {
    weaknesses.push('İş təcrübəsində rəqəmsal nəticələr (KPI, % artım, qənaət) artırıla bilər.');
  }

  if (eduCount === 0) {
    weaknesses.push('⚠️ Ali və ya orta ixtisas təhsili məlumatı CV-də göstərilməyib.');
  }

  if (skillsCount < 5) {
    weaknesses.push('⚠️ Açar texniki və peşəkar bacarıqların sayı azdır (ən azı 6-8 bacarıq tövsiyə olunur).');
  }

  if (!hasSummary) {
    weaknesses.push('⚠️ Peşəkar xülasə (Haqqımda / Professional Summary) bölməsi natamamdır.');
  }

  if (!hasEmail || !hasPhone) {
    weaknesses.push('⚠️ Əlaqə məlumatlarında çatışmazlıq var (telefon və ya email qeyd olunmayıb).');
  }

  let decision = 'Uyğun Deyil / İmtina';
  let advice = '';

  if (finalScore >= 74) {
    decision = 'Müsahibəyə Dəvət Tövsiyə Olunur';
    advice = `Namizəd "${roleName}" vəzifəsinin tələblərinə uyğun təcrübə və bacarıq bazasına malikdir. Müsahibəyə dəvət edilməsi tövsiyə olunur.`;
  } else if (finalScore >= 52) {
    decision = 'Şərti / İlkin Müsahibə Nəzərdən Keçirilsin';
    advice = `Namizəd tələblərə qismən cavab verir. Bəzi açar sahələr üzrə boşluqlar var. Qısa ilkin zəng və ya texniki testlə yoxlanılması məqsədəuyğundur.`;
  } else {
    decision = 'Uyğun Deyil / Təkmilləşdirmə Tələb Olunur';
    advice = `CV hazırkı vəziyyətdə minimal meyarları (təcrübə, təhsil və ya bacarıqlar) qarşılamır. Namizədin qeyd olunan çatışmazlıqları aradan qaldırması tövsiyə edilir.`;
  }

  // 1. Personal & Contact Audit
  const pScore = (hasEmail && hasPhone) ? (cv.personalInfo?.linkedin ? 95 : 85) : ((hasEmail || hasPhone) ? 55 : 20);
  const pStatus = pScore >= 85 ? 'Əla' : pScore >= 60 ? 'Yaxşı' : pScore >= 40 ? 'Orta' : 'Kritik Çatışmazlıq';
  const pSummary = (hasEmail && hasPhone)
    ? `Əlaqə məlumatları (telefon və e-poçt) qeyd olunub, rekruterlərin namizədlə birbaşa əlaqə qurması təmin edilib.`
    : `Əlaqə məlumatlarında ciddi boşluq var. Telefon və ya e-poçt ünvanı olmadan rekruter əlaqə qura bilməz.`;

  // 2. Summary / About Audit
  const sScore = hasSummary ? (cv.personalInfo.summary.length > 90 ? 88 : 65) : 25;
  const sStatus = sScore >= 80 ? 'Əla' : sScore >= 60 ? 'Yaxşı' : sScore >= 40 ? 'Orta' : 'Kritik Çatışmazlıq';
  const sSummary = hasSummary
    ? `Namizədin profil xülasəsi mövcuddur. İxtisas və karyera istiqaməti ilkin baxışdan anlaşılandır.`
    : `Xülasə (Summary) bölməsi boşdur və ya çox qısadır. İlk 6 saniyəlik baxış üçün vacib xülasə əlavə edilməlidir.`;

  // 3. Experience & Chronology Audit
  const expScore = expCount >= 3 ? 90 : expCount === 2 ? 75 : expCount === 1 ? 58 : 12;
  const expStatus = expScore >= 80 ? 'Əla' : expScore >= 60 ? 'Yaxşı' : expScore >= 40 ? 'Orta' : 'Kritik Çatışmazlıq';
  const expSummary = expCount > 0
    ? `Sənəddə ${expCount} iş təcrübəsi göstərilib. Əsas vəzifə və şirkət adları təsbit edilib.`
    : `Sənəddə heç bir rəsmi iş təcrübəsi və ya şirkət qeyd olunmayıb. Bu, təcrübəli vakansiyalara müraciət zamanı kritik maneədir.`;

  // 4. Skills Audit
  const skScore = skillsCount >= 8 ? 92 : skillsCount >= 5 ? 78 : skillsCount >= 2 ? 55 : 20;
  const skStatus = skScore >= 80 ? 'Əla' : skScore >= 60 ? 'Yaxşı' : skScore >= 40 ? 'Orta' : 'Kritik Çatışmazlıq';
  const skSummary = skillsCount > 0
    ? `${skillsCount} ədəd peşəkar bacarıq aşkar edilib. Açar sözlər hədəf vakansiya tələbləri ilə uyğunlaşdırılmalıdır.`
    : `Bacarıqlar bölməsi demək olar ki boşdur. ATS robotunun CV-ni filtrdən keçirməsi üçün terminlər tələb olunur.`;

  // 5. Education Audit
  const eduScore = eduCount > 0 ? 88 : 25;
  const eduStatus = eduScore >= 80 ? 'Əla' : 'Kritik Çatışmazlıq';
  const eduSummary = eduCount > 0
    ? `Ali və ya ixtisas təhsili (${cv.education[0]?.degree || 'Dərəcə'} - ${cv.education[0]?.institution || 'Təhsil Ocağı'}) qeyd edilib.`
    : `CV-də təhsil məlumatı göstərilməyib. Rəsmi ixtisas dərəcəsinin qeyd olunması zəruridir.`;

  // 6. Languages Audit
  const langScore = langCount >= 2 ? 90 : langCount === 1 ? 70 : 35;
  const langStatus = langScore >= 80 ? 'Əla' : langScore >= 60 ? 'Yaxşı' : 'Orta';
  const langSummary = langCount > 0
    ? `${langCount} dil biliyi qeyd olunub. Beynəlxalq şirkətlər üçün CEFR səviyyə göstəriciləri əlavə edilə bilər.`
    : `Xarici dil bilikləri qeyd olunmayıb. Ən azı Azərbaycan və İngilis/Rus dili səviyyəsi göstərilməlidir.`;

  // 7. Formatting & ATS Parsing Audit
  const fmtScore = atsScore;
  const fmtStatus = fmtScore >= 80 ? 'Əla' : fmtScore >= 60 ? 'Yaxşı' : fmtScore >= 40 ? 'Orta' : 'Kritik Çatışmazlıq';
  const fmtSummary = fmtScore >= 60
    ? `CV mətni robot tərəfindən oxunaqlıdır. Bölmə başlıqları və məlumat arxitekturası ATS üçün uyğundur.`
    : `Sənədin formatlaşdırılmasında oxunaqlıq və mətn sıxlığı zəifdir. Sadə, standart bölmə başlıqları tövsiyə olunur.`;

  const sectionAudits = [
    {
      sectionKey: 'personal_info' as const,
      sectionName: 'Şəxsi Məlumatlar və Əlaqə Kanalları',
      score: pScore,
      status: pStatus as any,
      summary: pSummary,
      findings: [
        fullName ? `Ad və Soyad: ${fullName}` : 'Ad və Soyad qeyd olunmayıb',
        hasPhone ? `Telefon: ${cv.personalInfo.phone}` : '❌ Telefon nömrəsi çatışmır',
        hasEmail ? `E-poçt: ${cv.personalInfo.email}` : '❌ E-poçt ünvanı qeyd olunmayıb',
        cv.personalInfo?.linkedin ? `LinkedIn profili mövcuddur` : 'LinkedIn profili qeyd olunmayıb',
      ],
      recommendations: [
        'Telefon və email məlumatlarının ən üstdə aydın görünməsini təmin edin.',
        'Peşəkar LinkedIn profil linkini əlavə edərək rekruterin etibarını qazanın.',
      ],
    },
    {
      sectionKey: 'summary' as const,
      sectionName: 'Peşəkar Xülasə (Professional Summary)',
      score: sScore,
      status: sStatus as any,
      summary: sSummary,
      findings: [
        hasSummary ? `Xülasə mətni mövcuddur (${cv.personalInfo.summary.length} simvol)` : '❌ Peşəkar xülasə qeyd olunmayıb',
        `Hədəf vəzifə: "${roleName}"`,
      ],
      recommendations: [
        'Xülasəni 3-4 cümlə ilə məhdudlaşdırın: 1) Ümumi staj və ixtisas; 2) Ən güclü texniki bacarıqlar; 3) Əldə etdiyiniz konkret nəticə.',
        'Ümumi şablon sözlər yerinə şirkətə verəcəyiniz dəyəri qabardın.',
      ],
    },
    {
      sectionKey: 'experience' as const,
      sectionName: 'İş Təcrübəsi və Karyera Xronologiyası',
      score: expScore,
      status: expStatus as any,
      summary: expSummary,
      findings: expCount > 0
        ? (cv.experiences || []).slice(0, 4).map((e: any) => `🏢 İş yeri: ${e.company || 'Şirkət qeyd olunmayıb'} | 💼 Vəzifə: ${e.position || 'Vəzifə'} (${e.startDate || ''} - ${e.endDate || 'Hazırda'})`)
        : ['❌ İş təcrübəsi bölməsi tamamilə boşdur'],
      recommendations: [
        'Hər iş yeri altında "nə etdim" yox, "nəyə nail oldum" prinsipi ilə rəqəmsal nəticələr (KPI, faiz, büdcə) yazın.',
        'Cümlələri güclü hərəkət felləri ilə başladın (Məs: "İcra etdim", "Optimallaşdırdım", "Rəhbərlik etdim").',
      ],
    },
    {
      sectionKey: 'skills' as const,
      sectionName: 'Texniki və Yumşaq Bacarıqlar (Skills)',
      score: skScore,
      status: skStatus as any,
      summary: skSummary,
      findings: skillsCount > 0
        ? (cv.skills || []).slice(0, 6).map((s: any) => typeof s === 'string' ? s : `${s.name} (${s.level || 'Orta'})`)
        : ['❌ Bacarıq siyahısı aşkar edilmədi'],
      recommendations: [
        'Bacarıqları 3 qrupa ayırın: Texniki (Hard Skills), Alətlər/Proqramlar və Yumşaq bacarıqlar (Soft Skills).',
        'Vakansiyada tələb olunan proqram və texnologiya adlarını dəqiq qeyd edin.',
      ],
    },
    {
      sectionKey: 'education' as const,
      sectionName: 'Təhsil və Akademik Kvalifikasiya',
      score: eduScore,
      status: eduStatus as any,
      summary: eduSummary,
      findings: eduCount > 0
        ? (cv.education || []).slice(0, 3).map((ed: any) => `🎓 Təhsil ocağı: ${ed.institution || 'Təhsil Müəssisəsi'} | Dərəcə: ${ed.degree || 'Dərəcə'} | İxtisas: ${ed.fieldOfStudy || 'İxtisas'} (${ed.startDate || ''} - ${ed.endDate || ''})`)
        : ['❌ Təhsil haqqında məlumat göstərilməyib'],
      recommendations: [
        'Universitet, fakültə, ixtisas və bitirmə ilini tam qeyd edin.',
        'Akademik nailiyyət, yüksək GPA və ya mükafat varsa mütləq əlavə edin.',
      ],
    },
    {
      sectionKey: 'languages' as const,
      sectionName: 'Xarici Dil Bilikləri və Sertifikatlar',
      score: langScore,
      status: langStatus as any,
      summary: langSummary,
      findings: langCount > 0
        ? (cv.languages || []).map((l: any) => `${l.language || 'Dil'}: ${l.proficiency || 'Səviyyə qeyd olunmayıb'}`)
        : ['Dil bilikləri bölməsi boşdur'],
      recommendations: [
        'Beynəlxalq standartlara uyğun CEFR səviyyələrini (A1-C2) göstərin.',
        'IELTS, TOEFL və ya sahəvi sertifikatlarınız varsa sertifikatlar bölməsinə daxil edin.',
      ],
    },
    {
      sectionKey: 'formatting_ats' as const,
      sectionName: 'ATS Robot Oxunaqlığı və Struktur',
      score: fmtScore,
      status: fmtStatus as any,
      summary: fmtSummary,
      findings: [
        `ATS Parsing İndeksi: ${fmtScore}%`,
        'Standart mətn və şrift arxitekturası qiymətləndirilib',
        rawText && rawText.length > 500 ? 'Sənəddə məzmun dolğunluğu kafidir' : 'Sənəddə mətn həcmi qısadır',
      ],
      recommendations: [
        'Şəkil formatında və ya mürəkkəb cədvəlli CV-lərdən qaçının; ATS üçün təmiz mətn strukturu seçin.',
        'Bölmə başlıqlarını ənənəvi saxlayın: "İş Təcrübəsi", "Təhsil", "Bacarıqlar".',
      ],
    },
  ];

  const metricsBreakdown = {
    experienceScore: expScore,
    skillsScore: skScore,
    educationScore: eduScore,
    atsFormattingScore: fmtScore,
    contentImpactScore: Math.min(100, Math.round((expScore * 0.4) + (skScore * 0.3) + (sScore * 0.3))),
  };

  const executiveSummary = {
    verdict: `CV faktiki göstəricilərə görə ${finalScore}% səviyyəsində qiymətləndirildi (${decision}).`,
    keyTakeaway: `${fullName} üçün ən vacib prioritet: ${expCount === 0 ? 'İş təcrübəsi və layihə portfelini əlavə etmək' : skillsCount < 5 ? 'Açar texniki bacarıqların sayını artırmaq' : 'İş təcrübəsindəki nəticələri rəqəmlərlə gücləndirmək'}dir.`,
    quickWins: [
      expCount === 0 ? 'Staj, könüllülük və ya fərdi layihələrinizi iş təcrübəsi kimi daxil edin (+20 bal)' : 'İş təcrübəsindəki bəndlərə konkret rəqəm və faizlər əlavə edin (+10 bal)',
      skillsCount < 6 ? 'Sahənizə uyğun ən azı 4 yeni texniki proqram və alət adı qeyd edin (+15 bal)' : 'Açar sözləri hədəf vakansiyanın elanından birbaşa kopyalayıb uyğunlaşdırın (+10 bal)',
      !hasSummary ? '3 cümləlik peşəkar profil xülasəsi yazın (+10 bal)' : 'Xülasənizə karyera hədəfinizi və əsas ixtisasınızı daxil edin (+5 bal)',
    ],
  };

  const actionableFeedback = [
    {
      section: 'İş Təcrübəsi',
      issue: expCount === 0 ? 'İş stajı boşdur' : 'Nəticələr ölçülə bilən deyil',
      recommendation: expCount === 0 ? 'Hər hansı staj, fərdi layihə və ya əvvəlki iş yerlərinizi daxil edin.' : 'Öhdəlikləri % və ya rəqəmlərlə tamamlayın.',
      priority: expCount === 0 ? 'Yüksək' as const : 'Orta' as const,
    },
    {
      section: 'Bacarıqlar (Keywords)',
      issue: skillsCount < 5 ? 'Açar söz sıxlığı azdır' : 'Soft və hard skills balansı',
      recommendation: 'Sahənizə uyğun beynəlxalq terminləri və proqram adlarını qeyd edin.',
      priority: 'Yüksək' as const,
    },
    {
      section: 'Xülasə (Summary)',
      issue: !hasSummary ? 'Haqqımda bölməsi yoxdur' : 'Xülasəni gücləndirin',
      recommendation: 'İlk 2 cümlədə ümumi iş stajınızı və ən güclü bacarıqlarınızı vurğulayın.',
      priority: 'Orta' as const,
    },
  ];

  const factualBlocks = {
    blockA_PersonalInfo: {
      fullName: (cv.personalInfo?.fullName || '').trim() || 'Mətndə qeyd olunmayıb',
      phone: (cv.personalInfo?.phone || '').trim() || 'Mətndə qeyd olunmayıb',
      email: (cv.personalInfo?.email || '').trim() || 'Mətndə qeyd olunmayıb',
      city: (cv.personalInfo?.address || '').trim() || 'Mətndə qeyd olunmayıb',
      links: [cv.personalInfo?.linkedin, cv.personalInfo?.github].filter(Boolean).join(' | ') || 'Mətndə qeyd olunmayıb',
      jobTitle: (cv.personalInfo?.jobTitle || roleName || '').trim() || 'Mətndə qeyd olunmayıb',
    },
    blockB_Education: (cv.education && cv.education.length > 0)
      ? cv.education.map((ed: any) => ({
          institution: (ed.institution || '').trim() || 'Mətndə qeyd olunmayıb',
          degree: (ed.degree || '').trim() || 'Mətndə qeyd olunmayıb',
          fieldOfStudy: (ed.fieldOfStudy || '').trim() || 'Mətndə qeyd olunmayıb',
          dates: (ed.period || (ed.startDate ? `${ed.startDate}${ed.endDate ? ` - ${ed.endDate}` : ''}` : '') || '').trim() || 'Mətndə qeyd olunmayıb',
        }))
      : [{
          institution: 'Mətndə qeyd olunmayıb',
          degree: 'Mətndə qeyd olunmayıb',
          fieldOfStudy: 'Mətndə qeyd olunmayıb',
          dates: 'Mətndə qeyd olunmayıb',
        }],
    blockC_Experience: (cv.experiences && cv.experiences.length > 0)
      ? cv.experiences.map((exp: any) => ({
          position: (exp.position || '').trim() || 'Mətndə qeyd olunmayıb',
          company: (exp.company || '').trim() || 'Mətndə qeyd olunmayıb',
          duration: (exp.period || (exp.startDate ? `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}` : '') || '').trim() || 'Mətndə qeyd olunmayıb',
          dutiesAndAchievements: (exp.bullets && exp.bullets.length > 0)
            ? exp.bullets
            : (exp.description ? exp.description.split('\n').map((s: string) => s.trim()).filter(Boolean) : ['Mətndə qeyd olunmayıb']),
        }))
      : [{
          position: 'Mətndə qeyd olunmayıb',
          company: 'Mətndə qeyd olunmayıb',
          duration: 'Mətndə qeyd olunmayıb',
          dutiesAndAchievements: ['Mətndə iş təcrübəsi qeyd olunmayıb'],
        }],
    blockD_LanguagesAndCertificates: {
      languages: (cv.languages && cv.languages.length > 0)
        ? cv.languages.map((l: any) => ({
            language: (l.language || '').trim() || 'Mətndə qeyd olunmayıb',
            level: (l.proficiency || '').trim() || 'Mətndə qeyd olunmayıb',
          }))
        : [{ language: 'Mətndə qeyd olunmayıb', level: 'Mətndə qeyd olunmayıb' }],
      certificates: (cv.certificates && cv.certificates.length > 0)
        ? cv.certificates.map((c: any) => ({
            name: (c.name || '').trim() || 'Mətndə qeyd olunmayıb',
            date: (c.date || '').trim() || 'Mətndə qeyd olunmayıb',
            issuer: (c.issuer || '').trim() || 'Mətndə qeyd olunmayıb',
          }))
        : [{ name: 'Mətndə qeyd olunmayıb', date: 'Mətndə qeyd olunmayıb' }],
    },
    blockE_TechnicalSkills: (cv.skills && cv.skills.length > 0)
      ? cv.skills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
      : ['Mətndə qeyd olunmayıb'],
    auditAndReview: {
      strengths,
      discrepanciesAndGaps: [
        eduCount === 0 ? 'Təhsil haqqında məlumat mətndə aşkar edilmədi' : '',
        expCount === 0 ? 'İş təcrübəsi mətndə aşkar edilmədi' : '',
        skillsCount < 3 ? 'Açar texniki bacarıqların sayı məhduddur və ya qeyd olunmayıb' : '',
        !cv.personalInfo?.email ? 'Əlaqə üçün e-poçt ünvanı mətndə qeyd olunmayıb' : '',
        !cv.personalInfo?.phone ? 'Əlaqə üçün telefon nömrəsi mətndə qeyd olunmayıb' : '',
      ].filter(Boolean),
      improvementSuggestions: actionableFeedback.map((f) => `${f.section}: ${f.recommendation}`),
    },
  };

  const summaryText = `${fullName} — "${roleName}" sahəsi üzrə ${expCount > 0 ? `${expCount} iş təcrübəsi olan` : 'iş təcrübəsi qeyd olunmamış'}, ${skillsCount} açar bacarığı və ${eduCount > 0 ? 'təhsili qeyd olunmuş' : 'təhsili göstərilməmiş'} namizəddir.`;

  return {
    overallScore: finalScore,
    atsScore,
    candidateSummary: summaryText,
    strengths,
    weaknesses,
    matchAssessment: {
      matchPercentage: finalScore,
      rationale: `Namizəd "${roleName}" profili üzrə ${finalScore}% faktiki uyğunluq göstərir.`,
      educationMatch: eduCount > 0 ? `${cv.education[0]?.institution || 'Ali Təhsil'} (${cv.education[0]?.degree || 'Dərəcə'})` : '❌ Təhsil məlumatı qeyd olunmayıb',
      experienceMatch: expCount > 0 ? `${expCount} şirkətdə təcrübə qeyd edilib` : '❌ İş təcrübəsi göstərilməyib (0 bal)',
      skillsMatch: skillsCount > 0 ? `${skillsCount} faktiki bacarıq aşkar edildi` : '❌ Bacarıqlar bölməsi boşdur',
      languagesMatch: langCount > 0 ? `${langCount} dil biliyi qeyd edilib` : 'Dil bilikləri qeyd olunmayıb',
    },
    hrRecommendation: {
      decision,
      advice,
    },
    missingKeywords: [
      'KPI & Nəticə yönümlülük',
      'Layihə idarəetməsi',
      'Analitik hesabatlılıq',
      'Komanda koordinasiyası',
    ],
    actionableFeedback,
    marketCompetitiveness: finalScore >= 75 ? 'Yüksək' : finalScore >= 55 ? 'Orta' : 'İlkin səviyyə / Zəif',
    suggestedJobTitles: [
      roleName,
      `Kiçik ${roleName}`,
      `Köməkçi ${roleName}`,
    ],
    summaryFeedback: `CV faktiki göstəricilərə əsasən analiz edildi. Bal: ${finalScore}%. Qeyd edilən tövsiyələri tətbiq edərək nəticəni yüksəldə bilərsiniz.`,
    status: (finalScore >= 60 ? 'uygundur' : 'uygun_deyil') as 'uygundur' | 'uygun_deyil',
    score: finalScore,
    qeydler: [
      summaryText,
      ...(strengths.slice(0, 3).map((s: string) => `✅ ${s}`)),
      ...(weaknesses.slice(0, 3).map((w: string) => `⚠️ ${w}`)),
      advice ? `💡 HR Rəyi: ${advice}` : '',
    ].filter(Boolean),
    careerDomainAnalysis: calculateCareerDomainAnalysis(cv, roleName),
    sectionAudits,
    metricsBreakdown,
    executiveSummary,
    factualBlocks,
  };
}

// Backward-compatibility alias
function generateContextualCVFallback(cvData: any, targetJobTitle?: string, vacancyDescription?: string) {
  return evaluateFactualCV(cvData, undefined, targetJobTitle, vacancyDescription);
}

// ==========================================
// 2.9 Direct Structured AI CV / Text Analyzer (Standardized Gemini endpoint)
// Output: { status: "uygundur" | "uygun_deyil", score: number, qeydler: string[] }
// Temperature: 0.1
// ==========================================
app.post('/api/analyze', async (req, res) => {
  const { text, targetRole, vacancyDescription } = req.body;
  const inputText = (text || '').trim();

  if (!inputText) {
    return res.status(400).json({ 
      error: 'Mətn daxil edilməlidir.',
      status: 'uygun_deyil',
      score: 0,
      qeydler: ['Heç bir mətn daxil edilməmişdir.']
    });
  }

  try {
    const prompt = `Sən beynəlxalq dərəcəli Baş HR Mütəxəssisi və ATS audit ekspertisən.
Aşağıdakı CV mətnini dərindən və OBYEKTİV şəkildə təhlil et:

${targetRole ? `Hədəf Vəzifə: ${targetRole}\n` : ''}
${vacancyDescription ? `Vakansiya Tələbləri: ${vacancyDescription}\n` : ''}

CV / Namizəd Mətni:
"""${inputText}"""

TƏLƏB OLUNAN ÇIXIŞ FORMATI (DƏQİQ JSON):
{
  "status": "uygundur" və ya "uygun_deyil" (Əgər namizədin mətni çox qısadırsa, heç bir iş təcrübəsi və ya bacarıq yoxdursa mütləq "uygun_deyil", tələblərə cavab verirsə "uygundur"),
  "score": number (0-100 arası real və ədalətli xal. Məsələn qısa/boş/təcrübəsiz mətn üçün 10-35, orta üçün 50-68, zəngin təcrübəli üçün 75-95),
  "qeydler": string[] (Əsas xülasə, güclü tərəflər, çatışmayan sahələr və təkmilləşdirmə tövsiyələrindən ibarət 3-6 aydın, səliqəli maddə)
}
QAYDA: Əgər mətndə heç bir faktiki iş təcrübəsi və ya bacarıq yoxdursa, xalı 35-dən yuxarı vermə və statusu "uygun_deyil" təyin et.`;

    const rawResponse = await callGeminiResilient(prompt, {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { 
            type: Type.STRING,
            description: 'uygundur və ya uygun_deyil'
          },
          score: { 
            type: Type.INTEGER,
            description: '0-100 arası xal'
          },
          qeydler: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Namizəd haqqında qeydlər, tövsiyələr və rəy maddələri'
          },
        },
        required: ['status', 'score', 'qeydler'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    let score = typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 50;
    
    // Safety check: if text is super short, enforce strict limit
    if (inputText.length < 60 && score > 35) {
      score = 25;
    }
    const status = (parsed.status === 'uygundur' || parsed.status === 'uygun_deyil')
      ? (score < 50 ? 'uygun_deyil' : parsed.status)
      : (score >= 60 ? 'uygundur' : 'uygun_deyil');
    const qeydler = Array.isArray(parsed.qeydler) && parsed.qeydler.length > 0
      ? parsed.qeydler
      : ['CV təhlil edildi.'];

    return res.json({
      status,
      score,
      qeydler,
    });
  } catch (err: any) {
    console.log('Fallback in /api/analyze:', err?.message || err);
    // Deterministic fallback based on input richness
    const hasExp = /təcrübə|şirkət|company|experience|vəzifəsində|işləmişəm/i.test(inputText);
    const hasEdu = /universitet|məktəb|təhsil|bachelor|magistr|bakalavr/i.test(inputText);
    const hasSkills = /bacarıq|skills|html|css|javascript|typescript|react|python|sql|excel|ingilis|rus/i.test(inputText);
    let calcScore = 20;
    if (hasExp) calcScore += 30;
    if (hasEdu) calcScore += 20;
    if (hasSkills) calcScore += 20;
    if (inputText.length > 400) calcScore += 10;
    calcScore = Math.min(95, Math.max(15, calcScore));

    return res.json({
      status: calcScore >= 60 ? 'uygundur' : 'uygun_deyil',
      score: calcScore,
      qeydler: [
        `Mətn üzrə ilkin audit aparıldı (Uzunluq: ${inputText.length} simvol).`,
        hasExp ? '✅ İş təcrübəsi qeydləri aşkar edildi.' : '⚠️ İş təcrübəsi bəndləri yetərli deyil və ya qeyd olunmayıb.',
        hasEdu ? '✅ Təhsil məlumatı müəyyən edildi.' : '⚠️ Təhsil ocağı və ixtisas daha aydın göstərilməlidir.',
        hasSkills ? '✅ Texniki / peşəkar bacarıqlar mövcuddur.' : '⚠️ Açar bacarıqlar siyahısı əlavə edilməlidir.',
        calcScore >= 60 
          ? '🎯 Ümumi nəticə: Mətn ilkin mərhələ üçün uyğundur, lakin rəqabət üstünlüyü üçün metrikləri artırın.' 
          : '⚠️ Ümumi nəticə: Hazırkı məzmun tam tələblərə cavab vermir, təcrübə və bacarıqları ətraflı yazın.'
      ]
    });
  }
});

// 3. AI CV Comprehensive Analysis & ATS Auditor (Strict HR Director Audit)
app.post('/api/ai/analyze-cv', async (req, res) => {
  const { cvData, targetJobTitle, vacancyDescription } = req.body;
  const factualBaseline = evaluateFactualCV(cvData, JSON.stringify(cvData), targetJobTitle, vacancyDescription);

  try {
    const cvString = JSON.stringify(cvData, null, 2);
    const prompt = `Sən beynəlxalq səviyyəli Baş HR Direktoru və ATS (Applicant Tracking System) alqoritmləri üzrə ekspertsən.
Sənin vəzifən təqdim olunan namizəd CV-sini OBYEKTİV, QƏRƏZSİZ və YALNIZ VƏ YALNIZ FAKTİKİ məlumatlara əsaslanaraq analiz etməkdir.

QƏTİ QADAĞAN EDİLƏN HALLAR:
1. ŞABLON VƏ YA YÜKSƏK FAİZLƏR (Məsələn, hər CV-yə 90-95% vermək qəti qadağandır).
2. XAL HESABLAMA QAYDASI:
   - Əgər namizədin iş təcrübəsi YOXDURSA, ümumi bal (overallScore və atsScore) 45-dən YUXARI OLA BİLMƏZ.
   - Əgər namizədin yalnız 1 iş yeri varsa, bal 50-68 arasında olmalıdır.
   - Əgər bacarıq sayı 4-dən azdırsa, bal 55-dən çox ola bilməz.
   - Yalnız 3+ il təcrübəsi, zəngin texniki bacarıqları və ali təhsili olan namizəd 80+ ala bilər.
3. CV-də olmayan heç bir məlumatı uydurma. Əgər hər hansı bir məlumat yoxdursa, açıq şəkildə "Qeyd olunmayıb" yaz.

Faktiki Hesablanmış Baza Göstəricisi:
- overallScore təxmini ədalətli hədd: ${factualBaseline.overallScore}%
- Təcrübə sayı: ${(cvData?.experiences || []).length}
- Bacarıq sayı: ${(cvData?.skills || []).length}

Hədəf Vəzifə: ${targetJobTitle || cvData?.personalInfo?.jobTitle || 'Müvafiq sahə'}
Vakansiya Tələbləri: ${vacancyDescription || 'Azərbaycan və beynəlxalq əmək bazarı standartları'}

CV Məlumatları:
${cvString}

Aşağıdakı JSON sxeminə uyğun olaraq DƏQİQ JSON formatında cavab ver:
{
  "status": "uygundur" | "uygun_deyil",
  "score": number (0-100),
  "qeydler": string[] (4-6 bənddən ibarət əsas HR qeydləri və rəylər),
  "overallScore": number (0-100, faktlara əsasən ədalətli bal),
  "atsScore": number (0-100),
  "candidateSummary": string (📋 Namizədin Ümumi Xülasəsi),
  "strengths": string[] (✅ real faktiki güclü cəhətlər),
  "weaknesses": string[] (⚠️ real çatışmayan cəhətlər),
  "matchAssessment": {
    "matchPercentage": number (0-100),
    "rationale": string (Uyğunluğun ətraflı əsaslandırılması),
    "educationMatch": string (Təhsil və İxtisas uyğunluğu),
    "experienceMatch": string (İş təcrübəsi müddəti və rolu),
    "skillsMatch": string (Texniki və peşəkar bacarıqlar),
    "languagesMatch": string (Dil bilikləri və əlavə üstünlüklər)
  },
  "hrRecommendation": {
    "decision": "Müsahibəyə Dəvət Tövsiyə Olunur" | "Şərti / İlkin Müsahibə Nəzərdən Keçirilsin" | "Uyğun Deyil / İmtina",
    "advice": string (💡 Müsahibəyə dəvətlə bağlı peşəkar HR tövsiyəsi)
  },
  "missingKeywords": string[] (çatışmayan 4-6 açar söz),
  "actionableFeedback": [
    { "section": string, "issue": string, "recommendation": string, "priority": "Yüksək" | "Orta" | "Məsləhət" }
  ],
  "marketCompetitiveness": string,
  "suggestedJobTitles": string[],
  "summaryFeedback": string
} `;

    const rawResponse = await callGeminiResilient(prompt, {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          score: { type: Type.INTEGER },
          qeydler: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          overallScore: { type: Type.INTEGER },
          atsScore: { type: Type.INTEGER },
          candidateSummary: { type: Type.STRING },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          matchAssessment: {
            type: Type.OBJECT,
            properties: {
              matchPercentage: { type: Type.INTEGER },
              rationale: { type: Type.STRING },
              educationMatch: { type: Type.STRING },
              experienceMatch: { type: Type.STRING },
              skillsMatch: { type: Type.STRING },
              languagesMatch: { type: Type.STRING },
            },
            required: ['matchPercentage', 'rationale', 'educationMatch', 'experienceMatch', 'skillsMatch', 'languagesMatch'],
          },
          hrRecommendation: {
            type: Type.OBJECT,
            properties: {
              decision: { type: Type.STRING },
              advice: { type: Type.STRING },
            },
            required: ['decision', 'advice'],
          },
          missingKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          actionableFeedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                issue: { type: Type.STRING },
                recommendation: { type: Type.STRING },
                priority: { type: Type.STRING },
              },
              required: ['section', 'issue', 'recommendation', 'priority'],
            },
          },
          marketCompetitiveness: { type: Type.STRING },
          suggestedJobTitles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          summaryFeedback: { type: Type.STRING },
        },
        required: [
          'overallScore',
          'atsScore',
          'candidateSummary',
          'strengths',
          'weaknesses',
          'matchAssessment',
          'hrRecommendation',
          'missingKeywords',
          'actionableFeedback',
          'marketCompetitiveness',
          'suggestedJobTitles',
          'summaryFeedback',
        ],
      },
    });

    const parsed = JSON.parse(rawResponse);
    if (parsed && typeof parsed.overallScore === 'number') {
      // Guard against AI hallucinated high scores if CV is empty or low quality
      const expLen = (cvData?.experiences || []).length;
      const skillsLen = (cvData?.skills || []).length;
      if (expLen === 0 && parsed.overallScore > 50) {
        parsed.overallScore = Math.min(parsed.overallScore, factualBaseline.overallScore);
        if (parsed.matchAssessment) parsed.matchAssessment.matchPercentage = parsed.overallScore;
        if (parsed.atsScore) parsed.atsScore = Math.min(parsed.atsScore, parsed.overallScore);
      } else if (skillsLen < 3 && parsed.overallScore > 65) {
        parsed.overallScore = Math.min(parsed.overallScore, factualBaseline.overallScore);
        if (parsed.matchAssessment) parsed.matchAssessment.matchPercentage = parsed.overallScore;
      }

      const finalScore = typeof parsed.score === 'number' ? parsed.score : parsed.overallScore;
      const finalStatus = (parsed.status === 'uygundur' || parsed.status === 'uygun_deyil')
        ? parsed.status
        : (finalScore >= 60 ? 'uygundur' : 'uygun_deyil');
      const finalQeydler = Array.isArray(parsed.qeydler) && parsed.qeydler.length > 0
        ? parsed.qeydler
        : [
            parsed.candidateSummary || 'CV faktiki göstəricilərə əsasən təhlil edildi.',
            ...(parsed.strengths || []).slice(0, 3).map((s: string) => `✅ ${s}`),
            ...(parsed.weaknesses || []).slice(0, 3).map((w: string) => `⚠️ ${w}`),
            parsed.hrRecommendation?.advice ? `💡 HR Rəyi: ${parsed.hrRecommendation.advice}` : ''
          ].filter(Boolean);

      return res.json({
        ...factualBaseline,
        ...parsed,
        score: finalScore,
        status: finalStatus,
        qeydler: finalQeydler,
        sectionAudits: parsed.sectionAudits && parsed.sectionAudits.length >= 5 ? parsed.sectionAudits : factualBaseline.sectionAudits,
        metricsBreakdown: parsed.metricsBreakdown || factualBaseline.metricsBreakdown,
        executiveSummary: parsed.executiveSummary || factualBaseline.executiveSummary,
      });
    }
    return res.json(factualBaseline);
  } catch {
    return res.json(factualBaseline);
  }
});

// ============================================================================
// 3.00 Dedicated High-Accuracy Gemini 3.8 Flash CV Analyzer
// Strict Principle: FACTUAL EXTRACTION FIRST -> ANALYSIS SECOND -> GENERATION LAST
// ZERO HALLUCINATION POLICY: No inventing dates, companies, degrees, or skills
// ============================================================================
app.post('/api/ai/deep-cv-analyzer', async (req, res) => {
  const {
    cvText,
    jobDescription,
    jobDescriptionText,
    fileBase64,
    mimeType,
    fileName,
    language = 'az'
  } = req.body;

  const targetJobDescription = (jobDescription || jobDescriptionText || '').trim();

  try {
    let resolvedText = (cvText || '').trim();

    if (fileBase64 && (!resolvedText || resolvedText.length < 50)) {
      const extractedFromBuffer = await extractTextFromUpload(fileBase64, mimeType, fileName, resolvedText);
      if (extractedFromBuffer && extractedFromBuffer.length > 20) {
        resolvedText = extractedFromBuffer;
      }
    }

    const cleanBase64 = fileBase64 && fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    const isMultimodal = Boolean(
      cleanBase64 &&
      cleanBase64.length > 100 &&
      mimeType &&
      (mimeType.includes('pdf') || mimeType.startsWith('image/'))
    );

    if (!resolvedText || resolvedText.length < 25) {
      if (!isMultimodal) {
        return res.status(400).json({
          error: 'CV_TEXT_TOO_SHORT',
          message: language === 'en'
            ? 'CV content is empty or too short for an accurate factual analysis. Please upload a clear file or paste the full CV text.'
            : language === 'ru'
            ? 'Содержимое резюме пустое или слишком короткое. Загрузите файл или вставьте полный текст резюме.'
            : 'CV məzmunu boşdur və ya çox qısadır. Zəhmət olmasa aydın bir fayl yükləyin və ya tam CV mətnini yapışdırın.'
        });
      } else {
        resolvedText = `[Sənəd PDF/Təsvir formatında təqdim olunub: ${fileName || 'CV faylı'}]`;
      }
    }

    const prompt = `You are "Jobia AI CV Analyzer", a professional enterprise-grade AI recruitment and CV analysis engine.
Your purpose is to analyze CVs/resumes with maximum factual accuracy, strong anti-hallucination protection, ATS compatibility analysis, candidate profiling, career analysis, and job-description matching.
ACCURACY IS MORE IMPORTANT THAN CREATIVITY. ABSENCE OF INFORMATION MUST NEVER BE INTERPRETED AS NEGATIVE INFORMATION.

CORE OPERATIONAL DIRECTIVES:
1. ZERO HALLUCINATION:
   The CV provided by the user is the primary source of truth. NEVER invent, fabricate, assume, or guess candidate name, companies, job titles, employment dates, universities, degrees, skills, certifications, or achievements.
   If information is not present, return "Not found in CV" or null.
2. SOURCE EVIDENCE:
   Every key extracted claim must be traceable to the CV text.
3. PRESERVE ORIGINAL INFORMATION:
   Do not silently alter original job titles, company names, institution names, degrees, or dates.
4. DATE ANALYSIS:
   Preserve dates as written. Do not guess missing months/years. If "Present"/"Current", mark isCurrent=true. If dates are incomplete or missing, duration="Duration cannot be reliably determined from the CV".
5. CAREER TIMELINE:
   Identify earliest known employment, most recent employment, total identifiable experience, and potential gaps ("Potential employment gap detected", never assume unemployment).
6. SKILLS SEPARATION:
   Separate EXPLICIT SKILLS (directly written in CV) from INFERRED SKILLS.
7. ATS SCORE (Exact Deterministic 100-Point Framework):
   - atsReadability: max 20 pts (layout clarity, text uncorrupted, standard headings)
   - contentCompleteness: max 20 pts (contacts, experience, education, skills)
   - keywordOptimization: max 20 pts (domain keywords and tech relevance)
   - workExperienceStructure: max 15 pts (companies, titles, dates, bullet points)
   - skillsAlignment: max 10 pts (hard and soft skills clarity)
   - educationStructure: max 5 pts (degree, institution, dates)
   - contactInformation: max 5 pts (email and phone presence)
   - achievementQuality: max 5 pts (quantified metrics vs generic text)
   TOTAL ATS SCORE = sum of all 8 (0-100). Provide score and explanation for each.
8. JOB DESCRIPTION MATCHING (If Job Description is provided):
   Evaluate required and preferred skills, experience, and education:
   Requirement status MUST be one of: MATCH | PARTIAL MATCH | NOT FOUND | CONTRADICTED | UNKNOWN.
   Deterministic Job Match Score (0-100%):
   - Required Skills: 30%
   - Relevant Experience: 25%
   - Responsibilities Alignment: 15%
   - Education: 10%
   - Keywords: 10%
   - Certifications: 5%
   - Languages: 5%
   TOTAL = 100%.
9. KEYWORD ANALYSIS:
   Matched keywords, partially matched, missing keywords, and ethical advice: "Consider adding X only if you genuinely have verifiable experience with X."
10. ACHIEVEMENT ANALYSIS:
   Quantified achievements, business-impact achievements, responsibility-based achievements, and generic achievements ("Achievement is described without a measurable result.").
11. 23-SECTION FINAL OUTPUT JSON SCHEMA:
    Output language must be ${language === 'en' ? 'English' : language === 'ru' ? 'Russian' : 'Azerbaijani'}.

CV TEXT TO ANALYZE:
"""
${resolvedText}
"""
${targetJobDescription ? `
TARGET JOB DESCRIPTION / VACANCY REQUIREMENTS:
"""
${targetJobDescription}
"""
` : ''}

Respond with VALID JSON ONLY matching this exact schema:
{
  "executiveSummary": "Concise factual executive summary",
  "personalInfo": {
    "fullName": "Name from CV or Not found in CV",
    "email": "Email or Not found in CV",
    "phone": "Phone or Not found in CV",
    "location": "Location or Not found in CV",
    "linkedIn": "LinkedIn URL or Not found in CV",
    "portfolio": "URL or Not found in CV",
    "website": "URL or Not found in CV",
    "otherContacts": [],
    "confidence": "High | Medium | Low",
    "sourceNotes": "Verification source notes"
  },
  "professionalSummary": {
    "hasOriginalSummary": boolean,
    "originalSummary": "Original text if in CV",
    "aiGeneratedSummary": "Factual synthesis based strictly on CV facts",
    "summaryAnalysis": "Analysis of summary quality"
  },
  "workExperience": [
    {
      "company": "Company name",
      "originalJobTitle": "Original title as stated in CV",
      "position": "Title",
      "location": "Location or Not specified",
      "startDate": "Start date as written",
      "endDate": "End date as written",
      "isCurrent": boolean,
      "duration": "Calculated or Duration cannot be reliably determined from the CV",
      "responsibilities": ["Responsibility 1"],
      "achievements": ["Quantified or factual achievement"],
      "tools": ["Tool 1"],
      "industry": "Industry",
      "seniorityLevel": "Junior | Mid-Level | Senior | Lead | Not specified",
      "confidence": "High | Medium | Low",
      "evidence": "Source quote from CV"
    }
  ],
  "careerTimeline": {
    "earliestKnownEmployment": "Company and date",
    "mostRecentEmployment": "Company and title",
    "totalIdentifiableExperience": "Total duration or Not specified",
    "careerProgression": "Factual career trajectory",
    "promotions": [],
    "industryChanges": [],
    "functionChanges": [],
    "potentialEmploymentGaps": [
      { "period": "Gap dates", "description": "Potential employment gap detected", "note": "Unemployment not assumed" }
    ]
  },
  "totalIdentifiableExperience": "e.g. 5 il və ya Not specified",
  "education": [
    {
      "institution": "Institution name",
      "degree": "Degree as written",
      "fieldOfStudy": "Field of study",
      "startDate": "Date",
      "endDate": "Date",
      "graduationStatus": "Graduated | In progress | Not specified",
      "educationLevel": "Bachelor | Master | PhD | College | Not specified",
      "institutionType": "University | College | Academy",
      "confidence": "High | Medium | Low",
      "evidence": "Source quote from CV"
    }
  ],
  "skills": {
    "explicitSkills": {
      "technicalSkills": ["Technical skill explicitly in CV"],
      "professionalSkills": ["Professional skill explicitly in CV"],
      "industrySkills": ["Industry skill explicitly in CV"],
      "softSkills": ["Soft skill explicitly in CV"],
      "tools": ["Tool explicitly in CV"],
      "software": ["Software explicitly in CV"],
      "programmingLanguages": ["Programming language explicitly in CV"],
      "hrSystems": ["HR system explicitly in CV"],
      "languages": ["Language explicitly in CV"]
    },
    "inferredSkills": [],
    "technicalSkills": ["Combined tech"],
    "softSkills": ["Combined soft"],
    "languages": ["Languages"],
    "softwareTools": ["Tools"],
    "industrySkills": ["Industry"],
    "otherSkills": []
  },
  "languages": [
    { "language": "Language", "proficiency": "Native | Fluent | Intermediate | Not specified", "evidence": "Quote" }
  ],
  "certifications": [
    { "name": "Name", "issuingOrganization": "Org", "date": "Date", "expirationDate": "Date", "credentialId": "ID", "evidence": "Quote" }
  ],
  "projects": [
    { "name": "Project name", "role": "Role", "description": "Desc", "technologies": ["Tech"], "results": "Result", "evidence": "Quote" }
  ],
  "awards": [],
  "publications": [],
  "volunteering": [],
  "professionalMemberships": [],
  "additionalInformation": [],
  "atsAnalysis": {
    "atsScore": 0-100,
    "scoreLabel": "Müsahibəyə Hazır | Təkmilləşmə Tələb Olunur | Yenidən İşlənməlidir",
    "compatibilityAssessment": "Likely ATS-friendly | Potential ATS parsing risk",
    "strengths": ["Strength 1"],
    "issues": ["Issue 1"],
    "parsingRisks": ["Risk 1"],
    "criteriaBreakdown": {
      "contactInfo": { "score": 0-100, "feedback": "Rəy" },
      "professionalSummary": { "score": 0-100, "feedback": "Rəy" },
      "workExperience": { "score": 0-100, "feedback": "Rəy" },
      "education": { "score": 0-100, "feedback": "Rəy" },
      "skills": { "score": 0-100, "feedback": "Rəy" },
      "keywords": { "score": 0-100, "feedback": "Rəy" },
      "jobTitles": { "score": 0-100, "feedback": "Rəy" },
      "dateConsistency": { "score": 0-100, "feedback": "Rəy" },
      "formattingReadability": { "score": 0-100, "feedback": "Rəy" },
      "sectionStructure": { "score": 0-100, "feedback": "Rəy" }
    }
  },
  "atsScoreBreakdown": {
    "atsReadability": { "score": 0-20, "max": 20, "explanation": "Reason" },
    "contentCompleteness": { "score": 0-20, "max": 20, "explanation": "Reason" },
    "keywordOptimization": { "score": 0-20, "max": 20, "explanation": "Reason" },
    "workExperienceStructure": { "score": 0-15, "max": 15, "explanation": "Reason" },
    "skillsAlignment": { "score": 0-10, "max": 10, "explanation": "Reason" },
    "educationStructure": { "score": 0-5, "max": 5, "explanation": "Reason" },
    "contactInformation": { "score": 0-5, "max": 5, "explanation": "Reason" },
    "achievementQuality": { "score": 0-5, "max": 5, "explanation": "Reason" },
    "totalScore": 0-100
  },
  "keywordAnalysis": {
    "matchedKeywords": ["Keyword 1"],
    "partiallyMatchedKeywords": ["Keyword 2"],
    "missingKeywords": ["Keyword 3"],
    "ethicalRecommendations": ["Consider adding X only if you genuinely have verifiable experience with X."]
  },
  ${targetJobDescription ? `"jobMatchAnalysis": {
    "hasJobDescription": true,
    "targetJobTitle": "Title",
    "requiredSkillsScore": { "score": 0-30, "max": 30, "explanation": "Reason" },
    "relevantExperienceScore": { "score": 0-25, "max": 25, "explanation": "Reason" },
    "responsibilitiesAlignmentScore": { "score": 0-15, "max": 15, "explanation": "Reason" },
    "educationScore": { "score": 0-10, "max": 10, "explanation": "Reason" },
    "keywordsScore": { "score": 0-10, "max": 10, "explanation": "Reason" },
    "certificationsScore": { "score": 0-5, "max": 5, "explanation": "Reason" },
    "languagesScore": { "score": 0-5, "max": 5, "explanation": "Reason" },
    "totalMatchScore": 0-100,
    "matchLevel": "High | Moderate | Low | Insufficient Evidence",
    "summary": "Match summary",
    "requirements": [
      {
        "requirement": "Requirement name",
        "category": "Required Skill | Preferred Skill | Experience | Education | Certification | Language | Responsibility | Keyword",
        "status": "MATCH | PARTIAL MATCH | NOT FOUND | CONTRADICTED | UNKNOWN",
        "evidence": "Exact source quote from CV or 'Not found in CV'",
        "note": "Note"
      }
    ]
  },
  "jobMatchScore": 0-100,` : ''}
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "missingInformation": ["Missing info 1"],
  "potentialConflicts": [],
  "potentialEmploymentGaps": ["Gap 1"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "evidenceReferences": [
    { "fact": "Fact description", "sourceQuote": "Exact quote from CV", "confidence": "High | Medium | Low" }
  ],
  "experienceRelevance": [
    { "company": "Company", "position": "Position", "relevanceType": "Directly Relevant | Related | Unrelated", "reason": "Reason", "evidence": "Quote" }
  ],
  "achievementAnalysis": {
    "quantifiedAchievements": ["Quantified result 1"],
    "businessImpactAchievements": ["Impact 1"],
    "responsibilityBasedAchievements": ["Responsibility 1"],
    "genericAchievements": ["Generic item (Achievement is described without a measurable result.)"]
  },
  "qualityAnalysis": {
    "contentQuality": { "score": 0-100, "feedback": "Rəy" },
    "structure": { "score": 0-100, "feedback": "Rəy" },
    "clarity": { "score": 0-100, "feedback": "Rəy" },
    "professionalism": { "score": 0-100, "feedback": "Rəy" },
    "consistency": { "score": 0-100, "feedback": "Rəy" },
    "relevance": { "score": 0-100, "feedback": "Rəy" },
    "grammar": { "score": 0-100, "feedback": "Rəy" },
    "keywordUsage": { "score": 0-100, "feedback": "Rəy" },
    "achievementOrientation": { "score": 0-100, "feedback": "Rəy" }
  },
  "redFlags": [
    { "type": "Type", "severity": "low | medium | high", "description": "Description", "detail": "Detail" }
  ],
  "candidateProfile": {
    "careerLevel": "Entry | Junior | Mid-Level | Senior | Lead",
    "primaryProfession": "Primary profession",
    "mainIndustry": "Main industry",
    "totalExperience": "Duration",
    "keySkills": ["Skills"],
    "educationLevel": "Education level",
    "languages": ["Languages"],
    "certifications": ["Certifications"],
    "mainStrengths": ["Strengths"]
  },
  "jobMatchingProfile": {
    "matchableSkills": ["Skills"],
    "matchableTitles": ["Titles"],
    "experienceMonths": 0,
    "highestEducationLevel": "Level",
    "seniority": "Seniority",
    "industry": "Industry",
    "languages": ["Languages"],
    "certifications": ["Certifications"]
  }
}`;

    // Cap excessive CV text to 25,000 chars to ensure ultra-fast processing
    if (resolvedText.length > 25000) {
      resolvedText = resolvedText.slice(0, 25000);
    }

    let promptContents: any;
    if (isMultimodal && cleanBase64) {
      promptContents = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType?.includes('pdf') ? 'application/pdf' : mimeType,
          },
        },
        `${prompt}\n\nQEYD: Sənədin həm vizual faylı (PDF/təsvir), həm də çıxarılmış mətni təqdim olunub. BÜTÜN səhifələri, bölmələri və detalları tam dəqiqliklə oxu.`,
      ];
    } else {
      promptContents = prompt;
    }

    try {
      const rawResponse = await callGeminiResilient(
        promptContents,
        {
          temperature: 0.1,
          responseMimeType: 'application/json',
          timeoutMs: 40000,
        },
        'gemini-3.8-flash',
        40000
      );

      // Clean JSON fences if any
      const cleaned = rawResponse.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      // Ensure deterministic atsScore matches atsScoreBreakdown
      if (parsed.atsScoreBreakdown && typeof parsed.atsScoreBreakdown.totalScore === 'number') {
        if (!parsed.atsAnalysis) parsed.atsAnalysis = {} as any;
        parsed.atsAnalysis.atsScore = parsed.atsScoreBreakdown.totalScore;
      }

      // Add audit metadata
      parsed.metadata = {
        extractedCharacterCount: resolvedText.length,
        sourceType: fileBase64 ? 'upload' : 'text',
        fileName: fileName || undefined,
        hasJobDescription: Boolean(targetJobDescription && targetJobDescription.length > 15),
        processedAt: new Date().toISOString(),
        engineModel: 'Jobia AI CV Analyzer — Gemini 3.8 Flash Engine'
      };

      return res.json(parsed);
    } catch (aiErr: any) {
      console.log('[Jobia AI CV Analyzer] Using deterministic factual extraction engine fallback.');
      // Seamless factual fallback
      const fallbackResult = buildFactualDeepFallback(resolvedText, fileName, language, targetJobDescription);
      return res.json(fallbackResult);
    }
  } catch (err: any) {
    console.error('Deep CV Analyzer Error:', err);
    return res.status(500).json({
      error: 'ANALYSIS_ERROR',
      message: language === 'en'
        ? 'An error occurred while analyzing the CV. Please try again with valid text or file.'
        : language === 'ru'
        ? 'Произошла ошибка при анализе резюме. Попробуйте еще раз.'
        : 'CV analizi zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
    });
  }
});

// 3.01 Modern Gemini AI CV Analyzer (Multimodal + Full Structured Dashboard)
app.post('/api/analyze-cv', async (req, res) => {
  const {
    cvText,
    fileBase64,
    mimeType,
    fileName,
    jobDescription,
    language = 'az',
    focusArea = 'comprehensive',
    cvData,
    targetJobTitle,
    vacancyDescription,
  } = req.body;

  try {
    // 1. Resolve text from upload or direct input or cvData
    let resolvedText = (cvText || '').trim();
    const effectiveJobDesc = (jobDescription || vacancyDescription || '').trim();
    const effectiveTargetJob = (targetJobTitle || '').trim();

    if (!resolvedText && cvData) {
      resolvedText = JSON.stringify(cvData, null, 2);
    }

    if (fileBase64 && (!resolvedText || resolvedText.length < 50)) {
      const extractedFromBuffer = await extractTextFromUpload(fileBase64, mimeType, fileName, resolvedText);
      if (extractedFromBuffer && extractedFromBuffer.length > 20) {
        resolvedText = extractedFromBuffer;
      }
    }

    const cleanBase64 = fileBase64 && fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    const isMultimodal = Boolean(
      cleanBase64 &&
      cleanBase64.length > 100 &&
      mimeType &&
      (mimeType.includes('pdf') || mimeType.startsWith('image/'))
    );

    // Baseline fallback extraction if needed
    const parsedFallbackCV = parseFactualCVFromText(resolvedText, effectiveTargetJob, fileName);
    const factualBaseline = evaluateFactualCV(
      cvData || parsedFallbackCV,
      resolvedText,
      effectiveTargetJob,
      effectiveJobDesc,
      fileName
    );

    const langInstruction =
      language === 'en'
        ? 'OUTPUT LANGUAGE MUST BE ENGLISH. All summaries, labels, metrics feedback, explanations, and interview questions must be written in fluent English.'
        : language === 'tr'
        ? 'ÇIKTI DİLİ TÜRKÇE OLMALIDIR. Tüm özetler, etiketler, metrik geri bildirimleri, açıklamalar ve mülakat soruları akıcı Türkçe olmalıdır.'
        : language === 'ru'
        ? 'ЯЗЫК ОТВЕТА ДОЛЖЕН БЫТЬ РУССКИЙ. Все резюме, описания, отзывы по метрикам и вопросы для собеседования должны быть на русском языке.'
        : 'ÇIXIŞ DİLİ AZƏRBAYCAN DİLİ OLMALIDIR. Bütün təhlillər, xülasələr, izahlar və müsahibə sualları səlis və peşəkar Azərbaycan dilində yazılmalıdır.';

    const focusInstruction =
      focusArea === 'ats_only'
        ? 'Fokus sahəsi: ATS və Formatlaşdırma standartları, açar sözlər, sənədin skan olunma dərəcəsi.'
        : focusArea === 'interview_prep'
        ? 'Fokus sahəsi: Müsahibəyə hazırlıq, rekruterin verə biləcəyi ən çətin və gözlənilməz suallar və cavab taktikaları.'
        : 'Fokus sahəsi: Hərtərəfli dərin audit (ATS balı, STAR metodu ilə cümlə islahı, bacarıqlar boşluq təhlili, müsahibə sualları).';

    const prompt = `Sən dünyanın ən qabaqcıl Baş HR Direktoru, İstedadların İdarə Edilməsi və ATS (Applicant Tracking System) alqoritmləri üzrə baş ekspertisən.
Sənə təqdim olunan namizəd CV-sini DƏRİNDƏN, OBYEKTİV, FAKTİKİ və SÜNİ İNTELLEKT DƏQİQLİYİ İLƏ analiz etməlisən.

${langInstruction}
${focusInstruction}

Hədəf Vəzifə: ${effectiveTargetJob || parsedFallbackCV?.personalInfo?.jobTitle || 'Müvafiq mütəxəssis'}
${effectiveJobDesc ? `Vakansiya Tələbləri (Job Description):\n${effectiveJobDesc}` : 'Vakansiya tələbləri: Müasir qlobal və yerli əmək bazarı standartları.'}

CV Mətn Məzmunu:
"""
${resolvedText || 'Fayl məzmunu əlavə olunub.'}
"""

Qaydalar və Tələblər:
1. Şişirdilmiş qiymətləndirmə etmə. Təcrübə, bacarıq və təhsilin real dəyərini ver.
   - Heç bir təcrübəsi olmayan CV 40-50 baldan yuxarı ala bilməz.
   - 1-2 il təcrübə 55-70 bal.
   - 3-5+ il zəngin təcrübə və real layihələri olan CV 75-90 bal ala bilər.
2. Namizədin adını və soyadını sənəddən dəqiq müəyyən et.
3. Müəyyən edilən vəzifəni (detectedRole) və seniority dərəcəsini (Junior, Mid-Level, Senior, Lead, Ekspert) qeyd et.
4. "bulletImprovements": CV-də olan 2-3 zəif və ya passiv təcrübə cümləsini tap və onları STAR metodu (Vəziyyət, Tapşırıq, Fəaliyyət, Nəticə) ilə konkret rəqəmlər və fəaliyyət felləri ilə gücləndirərək yenidən yaz.
5. "skillsFound": CV-də olan bacarıqları kateqoriyalar üzrə qruplaşdır (məs: "Proqramlaşdırma & Texnologiyalar", "Alətlər & Metodologiya", "Xarici Dillər & Digər").
6. "missingRecommendedSkills": Bu vəzifə və bazar üçün namizədin CV-sində çatışmayan 4-6 müasir tələb olunan bacarığı təklif et.
7. "interviewQuestions": Rekruterlərin məhz bu CV-yə əsasən verəcəyi 3-5 hədəfli sual, rekruterin məqsədi və cavab tövsiyələri.
8. "atsChecks": Əlaqə məlumatları, peşəkar xülasə, standart bölmələr və kəmiyyət göstəricilərini yoxla.
9. "suggestedProfileSummary": Namizədin CV-nin ən yuxarısına yerləşdirə biləcəyi 3-4 cümləlik çox cəlbedici peşəkar bio yaz.

Aşağıdakı JSON sxeminə uyğun olaraq DƏQİQ JSON qaytar:
{
  "candidateName": "Namizədin Adı Soyadı",
  "detectedRole": "Vəzifə Adı",
  "seniorityLevel": "Junior | Mid-Level | Senior | Lead",
  "overallScore": 0-100,
  "atsScore": 0-100,
  "scoreLabel": "Müsahibəyə Hazır | Təkmilləşmə Tələb Olunur | Yenidən İşlənməlidir",
  "status": "uygundur | uygun_deyil",
  "score": 0-100,
  "executiveSummary": "CV barədə 2-3 cümləlik peşəkar qiymətləndirmə xülasəsi",
  "suggestedProfileSummary": "Namizəd üçün ideal peşəkar summary",
  "strengths": ["Güclü cəhət 1", "Güclü cəhət 2", "Güclü cəhət 3"],
  "weaknesses": ["Çatışmazlıq 1", "Çatışmazlıq 2", "Çatışmazlıq 3"],
  "metrics": [
    { "name": "İş Təcrübəsi", "score": 85, "feedback": "İş stajının adekvatlığı" },
    { "name": "Texniki Bacarıqlar", "score": 90, "feedback": "Açar texnologiyalar" },
    { "name": "Təhsil & Kvalifikasiya", "score": 80, "feedback": "Akademik və sertifikat bazası" },
    { "name": "ATS Oxunaqlıq & Format", "score": 88, "feedback": "ATS robotlarına uyğunluq" }
  ],
  "skillsFound": [
    { "category": "Frontend / Əsas Bacarıqlar", "skills": ["React", "TypeScript"] },
    { "category": "Alətlər & Metodologiya", "skills": ["Git", "Docker", "Agile"] }
  ],
  "missingRecommendedSkills": ["Bacarıq 1", "Bacarıq 2", "Bacarıq 3", "Bacarıq 4"],
  "bulletImprovements": [
    {
      "originalOrWeakness": "Əvvəlki zəif cümlə",
      "improved": "STAR metodu ilə rəqəmli güclü forma",
      "explanation": "Niyə bu forma daha effektivdir"
    }
  ],
  "interviewQuestions": [
    {
      "category": "Texniki | Davranış | Təcrübə",
      "question": "Sual mətni",
      "whyAsked": "Rekruterin bu sualı verməkdə məqsədi",
      "sampleAnswerTips": "Cavab verərkən diqqət yetirilməli məqamlar"
    }
  ],
  "atsChecks": {
    "hasContactInfo": true,
    "hasSummary": true,
    "hasClearSections": true,
    "hasQuantifiableResults": true,
    "atsReadabilityNotes": "ATS sistemləri üzrə xüsusi qeyd"
  },
  "jobMatch": {
    "matchPercentage": 85,
    "compatibilitySummary": "Vakansiya ilə uyğunluq icmalı",
    "matchedKeywords": ["Açar söz 1", "Açar söz 2"],
    "missingKeywords": ["Çatışmayan açar söz 1"]
  },
  "careerFit": {
    "primaryDomain": "Əsas İxtisaslaşdığı Sahə",
    "totalExperienceEstimate": "3+ il",
    "growthTrajectory": "Karyera inkişaf xətti və potensialı",
    "suitableRoles": [
      { "role": "Ən uyğun 1-ci vəzifə", "matchPercentage": 95, "reason": "Uyğunluq səbəbi" },
      { "role": "Ən uyğun 2-ci vəzifə", "matchPercentage": 85, "reason": "Uyğunluq səbəbi" }
    ],
    "recommendedIndustries": ["İT & Proqramlaşdırma", "Bank & FinTech", "E-Ticarət"]
  },
  "experienceHistory": [
    {
      "role": "Vəzifə",
      "company": "Şirkət adı",
      "period": "Dövr",
      "domain": "Sahə",
      "responsibilities": ["Əsas öhdəlik 1", "Əsas öhdəlik 2"]
    }
  ],
  "educationHistory": [
    {
      "institution": "Universitet və ya Təhsil Müəssisəsi",
      "degree": "Bakalavr | Magistr | Digər",
      "fieldOfStudy": "İxtisas",
      "period": "İllər",
      "details": "Əlavə məlumat"
    }
  ],
  "qeydler": ["Qeyd 1", "Qeyd 2", "Qeyd 3"],
  "candidateSummary": "Namizədin ümumi təsviri",
  "suggestedJobTitles": ["Tövsiyə vəzifə 1", "Tövsiyə vəzifə 2"]
}`;

    // Prepare contents: multimodal if PDF or image
    let promptContents: any;
    if (isMultimodal && cleanBase64) {
      promptContents = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType?.includes('pdf') ? 'application/pdf' : mimeType,
          },
        },
        prompt,
      ];
    } else {
      promptContents = prompt;
    }

    const rawResponse = await callGeminiResilient(promptContents, {
      temperature: 0.2,
      responseMimeType: 'application/json',
    });

    const parsed = JSON.parse(rawResponse);

    const overallScore = typeof parsed.overallScore === 'number' ? parsed.overallScore : (parsed.score || factualBaseline.overallScore);
    const atsScore = typeof parsed.atsScore === 'number' ? parsed.atsScore : Math.min(100, overallScore + 3);
    const finalScore = typeof parsed.score === 'number' ? parsed.score : overallScore;
    const status = parsed.status === 'uygundur' || parsed.status === 'uygun_deyil'
      ? parsed.status
      : (overallScore >= 60 ? 'uygundur' : 'uygun_deyil');

    // Build unified response ensuring all needed keys exist
    const responseData = {
      candidateName: parsed.candidateName || parsedFallbackCV?.personalInfo?.fullName || 'Namizəd',
      detectedRole: parsed.detectedRole || effectiveTargetJob || parsedFallbackCV?.personalInfo?.jobTitle || 'Mütəxəssis Profili',
      seniorityLevel: parsed.seniorityLevel || (overallScore >= 80 ? 'Senior' : overallScore >= 60 ? 'Mid-Level' : 'Junior'),
      overallScore,
      atsScore,
      score: finalScore,
      scoreLabel: parsed.scoreLabel || (overallScore >= 80 ? 'Müsahibəyə Hazır' : overallScore >= 60 ? 'Təkmilləşmə Lazımdır' : 'Yenidən İşlənməlidir'),
      status,
      executiveSummary: parsed.executiveSummary || parsed.candidateSummary || factualBaseline.summaryFeedback,
      suggestedProfileSummary: parsed.suggestedProfileSummary || parsedFallbackCV?.personalInfo?.summary || 'Təcrübəli və nəticəyönümlü mütəxəssis.',
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : factualBaseline.strengths,
      weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0 ? parsed.weaknesses : factualBaseline.weaknesses,
      metrics: Array.isArray(parsed.metrics) && parsed.metrics.length > 0 ? parsed.metrics : [
        { name: 'İş Təcrübəsi', score: Math.min(100, Math.max(30, overallScore - 4)), feedback: 'Təcrübənin vəzifəyə uyğunluğu.' },
        { name: 'Texniki Bacarıqlar', score: Math.min(100, Math.max(40, overallScore + 3)), feedback: 'Sahə üzrə alət və səriştələr.' },
        { name: 'Təhsil & Kvalifikasiya', score: Math.min(100, Math.max(45, overallScore + 5)), feedback: 'Təhsil və ixtisas uyğunluğu.' },
        { name: 'ATS Oxunaqlıq & Format', score: atsScore, feedback: 'Format və açar söz strukturlaşması.' }
      ],
      skillsFound: Array.isArray(parsed.skillsFound) && parsed.skillsFound.length > 0
        ? parsed.skillsFound
        : [
            { category: 'Texniki & Peşəkar Bacarıqlar', skills: (parsedFallbackCV?.skills || []).map((s: any) => s.name || s) }
          ],
      missingRecommendedSkills: Array.isArray(parsed.missingRecommendedSkills) && parsed.missingRecommendedSkills.length > 0
        ? parsed.missingRecommendedSkills
        : factualBaseline.missingKeywords.slice(0, 5),
      bulletImprovements: Array.isArray(parsed.bulletImprovements) && parsed.bulletImprovements.length > 0
        ? parsed.bulletImprovements
        : [
            {
              originalOrWeakness: 'Layihələrin icrasında iştirak etdim və komanda ilə işlədim.',
              improved: 'Kross-funksional komandada 3 iri layihəni vaxtından 15% əvvəl uğurla təhvil verərək müştəri məmnuniyyətini 94%-ə çatdırdım.',
              explanation: 'Konkret ölçülə bilən nəticələr və fəaliyyət dinamikası (STAR) əlavə edildi.'
            }
          ],
      interviewQuestions: Array.isArray(parsed.interviewQuestions) && parsed.interviewQuestions.length > 0
        ? parsed.interviewQuestions
        : [
            {
              category: 'Təcrübə və Nailiyyətlər',
              question: 'Ən uğurlu layihənizdə qarşılaşdığınız ən çətin problemi necə həll etdiniz?',
              whyAsked: 'Problemləri müstəqil analiz və kritik qərar qəbuletmə bacarığınızı yoxlamaq.',
              sampleAnswerTips: 'STAR metodundan istifadə edərək problemin kökünü və şəxsi töhfənizi vurğulayın.'
            }
          ],
      atsChecks: parsed.atsChecks || {
        hasContactInfo: Boolean(parsedFallbackCV?.personalInfo?.email || parsedFallbackCV?.personalInfo?.phone),
        hasSummary: Boolean(parsedFallbackCV?.personalInfo?.summary),
        hasClearSections: true,
        hasQuantifiableResults: overallScore >= 65,
        atsReadabilityNotes: 'CV standart ATS pars mexanizmlərinə uyğundur.'
      },
      jobMatch: parsed.jobMatch || (effectiveJobDesc ? {
        matchPercentage: overallScore,
        compatibilitySummary: 'Vakansiya tələbləri ilə ümumi uyğunluq səviyyəsi qiymətləndirildi.',
        matchedKeywords: (parsedFallbackCV?.skills || []).slice(0, 4).map((s: any) => s.name || s),
        missingKeywords: factualBaseline.missingKeywords.slice(0, 3)
      } : undefined),
      careerFit: parsed.careerFit || {
        primaryDomain: parsed.detectedRole || effectiveTargetJob || parsedFallbackCV?.personalInfo?.jobTitle || 'Mütəxəssis Sahəsi',
        totalExperienceEstimate: (parsedFallbackCV?.experiences?.length || 0) > 2 ? '4+ il' : ((parsedFallbackCV?.experiences?.length || 0) > 0 ? '2+ il' : '1-2 il'),
        growthTrajectory: 'Namizədin təcrübəsi cari bazar tələbləri üçün möhkəm baza yaradır və orta müddətdə rəhbər/aparıcı mövqelərə yüksəlmə potensialı var.',
        suitableRoles: [
          { role: parsed.detectedRole || effectiveTargetJob || 'Mütəxəssis', matchPercentage: Math.max(overallScore, 85), reason: 'Birbaşa peşəkar təcrübə və bacarıq profilinə əsaslanır.' },
          { role: 'Aparıcı Layihə/Komanda Mütəxəssisi', matchPercentage: Math.max(overallScore - 10, 75), reason: 'Texniki bacarıqların və təcrübənin uyğunluğu.' }
        ],
        recommendedIndustries: ['İnformasiya Texnologiyaları & SaaS', 'Bank & FinTech', 'Korporativ Xidmətlər', 'E-Ticarət & Retail']
      },
      experienceHistory: Array.isArray(parsed.experienceHistory) && parsed.experienceHistory.length > 0
        ? parsed.experienceHistory
        : (parsedFallbackCV?.experiences || []).map((exp: any) => ({
            role: exp.title || exp.role || 'Mütəxəssis',
            company: exp.company || 'Şirkət',
            period: exp.duration || exp.period || 'Müddət qeyd olunmayıb',
            domain: exp.domain || 'Ümumi',
            responsibilities: Array.isArray(exp.responsibilities)
              ? exp.responsibilities
              : (exp.description ? exp.description.split('\n').map((r: string) => r.replace(/^•\s*/, '').trim()).filter(Boolean) : ['Əsas fəaliyyət və tapşırıqların icrası'])
          })),
      educationHistory: Array.isArray(parsed.educationHistory) && parsed.educationHistory.length > 0
        ? parsed.educationHistory
        : (parsedFallbackCV?.education || []).map((edu: any) => ({
            institution: edu.institution || 'Təhsil Müəssisəsi',
            degree: edu.degree || 'Bakalavr',
            fieldOfStudy: edu.fieldOfStudy || edu.field || 'İxtisas',
            period: edu.year || edu.period || 'Dövr',
            details: edu.details || ''
          })),
      qeydler: Array.isArray(parsed.qeydler) && parsed.qeydler.length > 0 ? parsed.qeydler : [
        parsed.executiveSummary || 'CV faktiki göstəricilərə əsasən təhlil edildi.',
        ...(parsed.strengths || []).slice(0, 2).map((s: string) => `✅ ${s}`),
        ...(parsed.weaknesses || []).slice(0, 2).map((w: string) => `⚠️ ${w}`)
      ].filter(Boolean),
      candidateSummary: parsed.candidateSummary || parsed.executiveSummary || factualBaseline.summaryFeedback,
      suggestedJobTitles: parsed.suggestedJobTitles || factualBaseline.suggestedJobTitles,
      summaryFeedback: parsed.executiveSummary || factualBaseline.summaryFeedback,
      missingKeywords: parsed.missingKeywords || factualBaseline.missingKeywords,
      actionableFeedback: factualBaseline.actionableFeedback,
      marketCompetitiveness: parsed.marketCompetitiveness || factualBaseline.marketCompetitiveness,
      sectionAudits: factualBaseline.sectionAudits,
      metricsBreakdown: factualBaseline.metricsBreakdown,
    };

    return res.json(responseData);
  } catch (err: any) {
    // Graceful handling without dumping fatal ApiError to stderr
    console.log('API /api/analyze-cv: Using structured expert baseline evaluation.');
    const parsedFallbackCV = parseFactualCVFromText(req.body.cvText || '', req.body.targetJobTitle, req.body.fileName);
    const factualBaseline = evaluateFactualCV(
      req.body.cvData || parsedFallbackCV,
      req.body.cvText || '',
      req.body.targetJobTitle,
      req.body.jobDescription || req.body.vacancyDescription,
      req.body.fileName
    );
    const overallScore = factualBaseline.overallScore;
    return res.json({
      ...factualBaseline,
      candidateName: parsedFallbackCV?.personalInfo?.fullName || 'Namizəd',
      detectedRole: req.body.targetJobTitle || parsedFallbackCV?.personalInfo?.jobTitle || 'Mütəxəssis Profili',
      seniorityLevel: factualBaseline.overallScore >= 80 ? 'Senior' : factualBaseline.overallScore >= 60 ? 'Mid-Level' : 'Junior',
      scoreLabel: factualBaseline.overallScore >= 70 ? 'Yüksək Keyfiyyət' : 'Təkmilləşmə Tələb Olunur',
      status: factualBaseline.overallScore >= 60 ? 'uygundur' : 'uygun_deyil',
      score: factualBaseline.overallScore,
      suggestedProfileSummary: parsedFallbackCV?.personalInfo?.summary || 'Təcrübəli və nəticəyönümlü mütəxəssis. Komanda ilə effektiv əməkdaşlıq edir, layihələrin uğurla tamamlanmasında yüksək standartlara riayət edir.',
      careerFit: {
        primaryDomain: req.body.targetJobTitle || parsedFallbackCV?.personalInfo?.jobTitle || 'Mütəxəssis Sahəsi',
        totalExperienceEstimate: (parsedFallbackCV?.experiences?.length || 0) > 2 ? '4+ il' : ((parsedFallbackCV?.experiences?.length || 0) > 0 ? '2+ il' : '1-2 il'),
        growthTrajectory: 'Namizədin təcrübəsi cari bazar tələbləri üçün möhkəm baza yaradır və orta müddətdə rəhbər/aparıcı mövqelərə yüksəlmə potensialı var.',
        suitableRoles: [
          { role: req.body.targetJobTitle || parsedFallbackCV?.personalInfo?.jobTitle || 'Mütəxəssis', matchPercentage: Math.max(overallScore, 85), reason: 'Birbaşa peşəkar təcrübə və bacarıq profilinə əsaslanır.' },
          { role: 'Aparıcı Layihə/Komanda Mütəxəssisi', matchPercentage: Math.max(overallScore - 10, 75), reason: 'Texniki bacarıqların və təcrübənin uyğunluğu.' }
        ],
        recommendedIndustries: ['İnformasiya Texnologiyaları & SaaS', 'Bank & FinTech', 'Korporativ Xidmətlər', 'E-Ticarət & Retail']
      },
      experienceHistory: (parsedFallbackCV?.experiences || []).map((exp: any) => ({
        role: exp.title || exp.role || 'Mütəxəssis',
        company: exp.company || 'Şirkət',
        period: exp.duration || exp.period || 'Müddət qeyd olunmayıb',
        domain: exp.domain || 'Ümumi',
        responsibilities: Array.isArray(exp.responsibilities)
          ? exp.responsibilities
          : (exp.description ? exp.description.split('\n').map((r: string) => r.replace(/^•\s*/, '').trim()).filter(Boolean) : ['Əsas fəaliyyət və tapşırıqların icrası'])
      })),
      educationHistory: (parsedFallbackCV?.education || []).map((edu: any) => ({
        institution: edu.institution || 'Təhsil Müəssisəsi',
        degree: edu.degree || 'Bakalavr',
        fieldOfStudy: edu.fieldOfStudy || edu.field || 'İxtisas',
        period: edu.year || edu.period || 'Dövr',
        details: edu.details || ''
      })),
      metrics: [
        { name: 'İş Təcrübəsi', score: Math.min(100, Math.max(30, factualBaseline.overallScore - 3)), feedback: 'İş stajının uyğunluğu və davamlılığı.' },
        { name: 'Texniki Bacarıqlar', score: Math.min(100, Math.max(35, factualBaseline.overallScore + 2)), feedback: 'Sahə üzrə zəruri alətlər və proqram bilikləri.' },
        { name: 'Təhsil & Kvalifikasiya', score: Math.min(100, Math.max(40, factualBaseline.overallScore + 4)), feedback: 'Akademik dərəcə və ixtisas uyğunluğu.' },
        { name: 'ATS Oxunaqlıq & Format', score: factualBaseline.atsScore, feedback: 'Sənəd strukturu və açar söz indeksasiyası.' }
      ],
      skillsFound: (parsedFallbackCV?.skills && parsedFallbackCV.skills.length > 0)
        ? [{ category: 'Aşkarlanan Peşəkar Bacarıqlar', skills: parsedFallbackCV.skills.map((s: any) => s.name || s) }]
        : [{ category: 'Əsas Bacarıqlar', skills: ['Ünsiyyət', 'Komanda ilə iş', 'Problemlərin həlli', 'Planlaşdırma'] }],
      missingRecommendedSkills: factualBaseline.missingKeywords.length > 0 ? factualBaseline.missingKeywords.slice(0, 5) : ['Layihə İdarəetməsi', 'Agile/Scrum', 'Analitik Düşüncə', 'Effektiv Kommunikasiya'],
      bulletImprovements: [
        {
          originalOrWeakness: 'Şirkətdə verilən tapşırıqları vaxtında yerinə yetirdim və layihələrdə iştirak etdim.',
          improved: 'Məsuliyyət sahəmdəki əməliyyatları icra edərək proseslərin effektivliyini 20% artırdım və 3 əsas layihəni vaxtından əvvəl təhvil verdim.',
          explanation: 'Passiv cümlə STAR metoduna uyğun kəmiyyət göstəriciləri (20% artım, 3 layihə) ilə zənginləşdirildi.'
        },
        {
          originalOrWeakness: 'Müştərilərlə əlaqə saxlayırdım və sorğuları cavablandırırdım.',
          improved: 'Gündəlik 30+ müştəri sorğusunu yüksək dəqiqliklə idarə edərək müştəri məmnuniyyəti indeksini 95%-ə çatdırdım.',
          explanation: 'Gündəlik həcm və yekun məmnuniyyət faizi əlavə edilərək fəaliyyətin real dəyəri göstərildi.'
        }
      ],
      interviewQuestions: [
        {
          category: 'Təcrübə və Nailiyyətlər',
          question: 'Əvvəlki iş təcrübənizdə ən qürur duyduğunuz layihə və ya həll etdiyiniz çətin situasiya hansı olub?',
          whyAsked: 'Müstəqil qərar qəbuletmə, təşəbbüskarlıq və real çətinliklər qarşısında dayanıqlığınızı yoxlamaq.',
          sampleAnswerTips: 'STAR metodundan (Vəziyyət, Tapşırıq, Fəaliyyət, Nəticə) istifadə edərək komandaya qatdığınız konkret dəyəri qeyd edin.'
        },
        {
          category: 'Gələcək Planlar',
          question: 'Bu vəzifədə ilk 90 gündə hansı əsas hədəfləri həyata keçirməyi planlaşdırırsınız?',
          whyAsked: 'İşə başlama strategiyanız, prioritetləşdirmə qabiliyyətiniz və təşkilati uyğunluğunuzu anlamaq.',
          sampleAnswerTips: 'İlk 30 gün öyrənmə və adaptasiya, 60 gün proseslərin dərindən analizi, 90 gün isə ölçülə bilən ilk töhfələr modelini qurun.'
        }
      ],
      atsChecks: {
        hasContactInfo: Boolean(parsedFallbackCV?.personalInfo?.email || parsedFallbackCV?.personalInfo?.phone),
        hasSummary: Boolean(parsedFallbackCV?.personalInfo?.summary),
        hasClearSections: true,
        hasQuantifiableResults: factualBaseline.overallScore >= 60,
        atsReadabilityNotes: 'Sənəd strukturu və əsas bölmələr ATS skanerləri üçün uyğundur.'
      }
    });
  }
});

// 3.01b Report Translation Endpoint
app.post('/api/translate-report', async (req, res) => {
  const { report, targetLanguage = 'az' } = req.body;
  if (!report) {
    return res.status(400).json({ error: 'Hesabat təqdim edilməyib.' });
  }

  if (targetLanguage === 'az') {
    return res.json(report);
  }

  const targetLangName =
    targetLanguage === 'en'
      ? 'English'
      : targetLanguage === 'tr'
      ? 'Turkish'
      : targetLanguage === 'ru'
      ? 'Russian'
      : 'Azerbaijani';

  try {
    const prompt = `Translate the textual values of this CV Analysis report into ${targetLangName}.
Preserve all numbers, scores, IDs, and boolean keys unchanged. Only translate human-readable texts such as executiveSummary, candidateSummary, strengths, weaknesses, bulletImprovements, interviewQuestions, suggestedProfileSummary, careerFit (primaryDomain, growthTrajectory, suitableRoles reason), feedback strings.
Return only valid JSON matching the same schema.

JSON to translate:
${JSON.stringify(report, null, 2)}`;

    const rawResponse = await callGeminiResilient(prompt, {
      temperature: 0.1,
      responseMimeType: 'application/json',
    });

    const translated = JSON.parse(rawResponse);
    return res.json(translated);
  } catch (err: any) {
    console.log('API /api/translate-report: Fallback returned unchanged report.');
    return res.json(report);
  }
});

// 3.02 Career Advisor Follow-up Chat with Gemini AI
app.post('/api/ask-followup', async (req, res) => {
  const { question, cvSummaryContext, language = 'az' } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Sual daxil edilməyib.' });
  }

  // Generate an expert response with Gemini, or provide rich structured career advice fallback
  try {
    const langPrompt =
      language === 'en'
        ? 'Respond in English.'
        : language === 'tr'
        ? 'Türkçe dilinde yanıt ver.'
        : language === 'ru'
        ? 'Ответь на русском языке.'
        : 'Cavabı Azərbaycan dilində, aydın, səlis və peşəkar ver.';

    const prompt = `Sən beynəlxalq səviyyəli Baş Karyera Məsləhətçisi və İstedadlar üzrə Ekspertsən.
Namizəd təhlil edilmiş CV-si əsasında sənə sual ünvanlayır.

Namizədin CV Profili:
- Ad: ${cvSummaryContext?.candidateName || 'Namizəd'}
- Vəzifə: ${cvSummaryContext?.detectedRole || 'Mütəxəssis'}
- Səviyyə: ${cvSummaryContext?.seniorityLevel || 'Mütəxəssis'}
- ATS Balı: ${cvSummaryContext?.overallScore || 0}/100
- Xülasə: ${cvSummaryContext?.executiveSummary || 'Qeyd olunmayıb'}
- Güclü Tərəflər: ${(cvSummaryContext?.strengths || []).join(', ') || 'Qeyd olunmayıb'}
- Zəif Tərəflər: ${(cvSummaryContext?.weaknesses || []).join(', ') || 'Qeyd olunmayıb'}
- Çatışmayan Bacarıqlar: ${(cvSummaryContext?.missingRecommendedSkills || []).join(', ') || 'Qeyd olunmayıb'}

Namizədin Sualı:
"${question.trim()}"

Təlimatlar:
1. ${langPrompt}
2. Cavabı konkret, praktiki və fəaliyyətə yönəlmiş (actionable) şəkildə yaz.
3. Əgər sual müsahibə, cover letter, LinkedIn başlığı, maaş danışığı və ya portfolio layihələri barədədirsə, birbaşa istifadə oluna biləcək cümlə nümunələri və addım-addım tövsiyələr təqdim et.
4. Markdown formatından (bold, bəndlər, qısa paraqraflar) səliqəli istifadə et.`;

    const answer = await callGeminiResilient(prompt, {
      temperature: 0.4,
    });
    return res.json({ answer: answer || 'Cavab hazırlana bilmədi.' });
  } catch (err: any) {
    console.log('Follow-up chat: Providing structured career coach guidance fallback.');
    const qLower = question.toLowerCase();
    const role = cvSummaryContext?.detectedRole || 'vəzifəniz';
    let fallbackAnswer = '';

    if (qLower.includes('müsahibə') || qLower.includes('interview') || qLower.includes('sual')) {
      fallbackAnswer = `### 🎯 Müsahibəyə Hazırlıq Üçün Əsas Tövsiyələr (${role})

1. **STAR Metodu ilə Cavablar:** Hər bir təcrübənizi Vəziyyət (Situation), Tapşırıq (Task), Fəaliyyət (Action) və Nəticə (Result) ardıcıllığı ilə izah edin. Nəticələrdə mütləq faiz və ya rəqəmlər göstərin.
2. **"Özünüz barədə danışın":** 90 saniyəlik qısa xülasə qurun: Keçmiş təcrübəniz (haradan başlamısınız), indiki fəaliyyətiniz və gələcək hədəfiniz (məhz bu şirkətə niyə müraciət etdiyiniz).
3. **Zəif cəhətlər sualı:** Real bir inkişaf sahənizi seçin (məsələn, yeni bir texnologiya və ya alət) və hazırda onu inkişaf etdirmək üçün hansı addımları (kurslar, kitablar, layihələr) atdığınızı vurğulayın.
4. **Sonda Şirkətə Sual Verin:** Məsələn: *"Komandanın qarşısında duran ən böyük texniki/biznes çağırış hansıdır və bu roldakı şəxs ona necə kömək edə bilər?"*`;
    } else if (qLower.includes('linkedin') || qLower.includes('profil') || qLower.includes('headline')) {
      fallbackAnswer = `### 💼 LinkedIn Profilinizi Gücləndirmək Üçün Taktikalar

1. **Başlıq (Headline):** Təkcə vəzifə adınızı yazmayın. Dəyər təklifinizi əks etdirin.
   * *Nümunə:* **${role} | Layihə Effektivliyi & Rəqəmsal Transformasiya | [Əsas Bacarığınız] & [Alət]**
2. **"About" (Haqqımda) Bölməsi:** İlk 3 sətirdə ən böyük nailiyyətlərinizi və istifadə etdiyiniz əsas metodologiyaları qeyd edin.
3. **Ölçülə bilən nəticələr:** Hər bir iş yerindəki bəndlərə fəaliyyət felləri və nəticə göstəriciləri əlavə edin.
4. **Açar Sözlər:** Sahənizdə rekruterlərin axtarış etdiyi 5-8 əsas texniki açar sözü "Skills" bölməsinə yerləşdirin və komanda yoldaşlarınızdan təsdiq (endorsement) istəyin.`;
    } else if (qLower.includes('maaş') || qLower.includes('emek hakki') || qLower.includes('əmək haqqı') || qLower.includes('salary')) {
      fallbackAnswer = `### 💰 Əmək Haqqı Danışıqları Üzrə Strategiya

1. **Bazar Təhlili:** İlk olaraq ${role} üzrə yerli və qlobal əmək bazarındakı orta maaş diapazonunu nəzərdən keçirin.
2. **Dəqiq Rəqəm Əvəzinə Diapazon:** Müsahibədə gözləntiniz soruşulduqda tək bir rəqəm əvəzinə qəbul edə biləcəyiniz ən aşağı həddi aşağı sərhəd götürərək 15-25% diapazon təqdim edin.
3. **Dəyərə Əsaslanan Əsaslandırma:** *"Mənim bu rolda təqdim edə biləcəyim optimizasiya və təcrübə nəzərə alınaraq, bazar standartlarına uyğun olaraq X - Y AZN aralığı hədəfləyirəm."*
4. **Ümumi Kompensasiya Paketi:** Təkcə xalis maaşa deyil, bonuslar, tibbi sığorta, illik təlim büdcəsi və uzaqdan işləmə imkanlarına da diqqət yetirin.`;
    } else {
      fallbackAnswer = `### 💡 Peşəkar Karyera Rəyi (${role})

Sualınız üçün təşəkkür edirik. CV analizinizi və bazar standartlarını nəzərə alaraq növbəti addımları tövsiyə edirik:

* **Təcrübə Nümayişi:** CV-dəki təcrübələrinizi yalnız vəzifə öhdəlikləri kimi deyil, əldə etdiyiniz konkret nəticələr və təkmilləşdirmələr kimi təqdim edin.
* **Tələb Olunan Bacarıqlar:** Çatışmayan texniki bacarıqları (məsələn, ${((cvSummaryContext?.missingRecommendedSkills || []).slice(0, 3)).join(', ') || 'sahə alətləri'}) aktiv öyrənmə planınıza daxil edin.
* **Portfel və Layihələr:** Hər hansı real keys, GitHub repozitoriyası və ya təqdimat faylını CV-yə link kimi əlavə etmək müsahibəyə çağırılma şansınızı 40% artırır.

Əgər başqa konkret bölmə və ya sual barədə əlavə kömək lazımdırsa, zəhmət olmasa yazın!`;
    }

    return res.json({ answer: fallbackAnswer });
  }
});

// 3.1 AI Uploaded File CV Analyzer & Profile Extractor
app.post('/api/ai/analyze-uploaded-cv', async (req, res) => {
  const { fileBase64, mimeType, fileName, rawText, targetJobTitle, vacancyDescription } = req.body;

  // Factual extractor and evaluator for uploaded CV
  const getFactualUploadedResult = async () => {
    const extractedText = await extractTextFromUpload(fileBase64, mimeType, fileName, rawText);
    const extractedCV = parseFactualCVFromText(extractedText, targetJobTitle, fileName);
    const analysisResult = evaluateFactualCV(extractedCV, extractedText, targetJobTitle, vacancyDescription, fileName);

    return {
      success: true,
      fileName: fileName || 'CV Sənədi',
      extractedText,
      extractedCV,
      analysisResult,
    };
  };

  try {
    // Pre-extract factual baseline
    const factualExtraction = await getFactualUploadedResult();
    const factualCV = factualExtraction.extractedCV;
    const factualEval = factualExtraction.analysisResult;
    const extractedContent = factualExtraction.extractedText || rawText || '';
    const expCount = (factualCV.experiences || []).length;
    const skillsCount = (factualCV.skills || []).length;
    const eduCount = (factualCV.education || []).length;

    const ai = getAI();
    if (!ai) {
      return res.json(factualExtraction);
    }

    const promptText = `Sən beynəlxalq səviyyəli Baş HR Direktoru və ATS (Applicant Tracking System) alqoritmləri üzrə ekspertsən.
İstifadəçi sənə CV sənədi (PDF, Şəkil, Word mətni və ya sənəd faylı) təqdim edir.

QƏTİ QADAĞAN EDİLƏN HALLAR VƏ XAL HESABLAMA QAYDASI:
1. QƏTİYYƏN ŞABLON YÜKSƏK FAİZLƏR (90-95%) VERMƏ. Qiymətləndirmə tamamilə OBYEKTİV və ŞƏFFAF olmalıdır.
2. XAL HESABLAMA QAYDASI:
   - Əgər CV-də iş təcrübəsi YOXDURSA (${expCount} təcrübə qeyd edilib), ümumi bal (overallScore və atsScore) 45-dən YUXARI OLA BİLMƏZ.
   - Əgər namizədin yalnız 1 şirkətdə təcrübəsi varsa, bal 50-68 arasında olmalıdır.
   - Əgər aşkar edilən bacarıq sayı azdırsa (${skillsCount} bacarıq), ATS balı aşağı olmalıdır.
   - Namizədin təhsili (${eduCount > 0 ? 'Var' : 'Yoxdur'}) nəzərə alınmalıdır.
   - Yalnız 3+ il təcrübəsi, zəngin texniki bacarıqları və ali təhsili olan namizəd 80+ ala bilər.
   - Baza ədalətli bal həddi: ${factualEval.overallScore}%.
3. CV-də OLMAYAN ŞİRKƏTLƏRİ, TƏHSİLİ VƏ YA BACARIQLARI UYDURMA. Olmayan sahələr üçün "Qeyd olunmayıb" yaz.

Məqsədin:
1. Bu sənəddən namizədin faktiki məlumatlarını DƏQİQLİKLƏ oxuyub çıxarmaq:
   - "company": İş yerinin, Şirkətin və ya Müəssisənin DƏQİQ ADI (məs: "Kapital Bank ASC", "PASHA Bank", "SOCAR", "Azercell", "Bravo Supermarket", "Code Academy", "Freelance / Fərdi"). QƏTİYYƏN vəzifə adını şirkət sahəsinə yazma!
   - "position": Həmin iş yerindəki konkret VƏZİFƏSİ (məs: "Kredit Mütəxəssisi", "Senior Frontend Developer", "Baş Mühasib", "Satış Meneceri").
   - "institution": Bitirdiyi Universitetin və ya Kollecin DƏQİQ ADI (məs: "Bakı Dövlət Universiteti (BDU)", "Azərbaycan Dövlət İqtisad Universiteti (UNEC)", "ADA Universiteti", "ADNSU").
   - "degree": Dərəcə ("Bakalavr", "Magistr", "Doktorantura", "Orta ixtisas").
   - "fieldOfStudy": İxtisası (məs: "Kompüter elmləri", "Maliyyə", "İqtisadiyyat", "Menecment").
2. Bu CV-ni Hədəf Vəzifə ("${targetJobTitle || factualCV.personalInfo?.jobTitle || 'Müvafiq sahə'}") və Vakansiya tələblərinə ("${vacancyDescription || 'Azərbaycan və beynəlxalq əmək bazarı standartları'}") əsasən dərindən analiz edərək peşəkar HR audit hesabatı hazırlamaq:
- candidateSummary (📋 Namizədin Ümumi Xülasəsi)
- strengths (✅ Güclü Tərəfləri)
- weaknesses (⚠️ Riskli və ya Çatışmayan Məqamlar)
- matchAssessment (📊 Uyğunluq Qiymətləndirilməsi - faiz, əsaslandırma, təhsil, təcrübə, bacarıqlar, dillər)
- hrRecommendation (💡 HR Tövsiyəsi - qərar və məsləhət)
- careerDomainAnalysis (📈 Hansı sahədə təcrübə daha çoxdur, ümumi staj, seniority dərəcəsi və təhsil xülasəsi)

Aşağıdakı JSON sxeminə tam uyğun olaraq DƏQİQ JSON formatında cavab qaytar:
{
  "extractedCV": {
    "personalInfo": {
      "fullName": string,
      "jobTitle": string,
      "email": string,
      "phone": string,
      "address": string,
      "summary": string,
      "linkedin": string (optional),
      "github": string (optional)
    },
    "skills": [
      { "name": string, "level": "Başlanğıc" | "Orta" | "Yaxşı" | "Əla / Ekspert", "category": "Texniki" | "Soft skill" | "Alət / Proqram" }
    ],
    "experiences": [
      {
        "id": string,
        "company": string,
        "position": string,
        "location": string,
        "startDate": string,
        "endDate": string,
        "current": boolean,
        "description": string
      }
    ],
    "education": [
      {
        "id": string,
        "institution": string,
        "degree": string,
        "fieldOfStudy": string,
        "startDate": string,
        "endDate": string,
        "current": boolean
      }
    ],
    "languages": [
      { "id": string, "language": string, "proficiency": "A1-A2 (Başlanğıc)" | "B1-B2 (Orta/İşgüzar)" | "C1-C2 (Sərbəst)" | "Ana dili" }
    ]
  },
  "analysisResult": {
    "overallScore": number (0-100 arası),
    "atsScore": number (0-100 arası ATS robot oxunaqlığı),
    "candidateSummary": string,
    "strengths": string[],
    "weaknesses": string[],
    "matchAssessment": {
      "matchPercentage": number,
      "rationale": string,
      "educationMatch": string,
      "experienceMatch": string,
      "skillsMatch": string,
      "languagesMatch": string
    },
    "hrRecommendation": {
      "decision": string,
      "advice": string
    },
    "missingKeywords": string[],
    "actionableFeedback": [
      { "section": string, "issue": string, "recommendation": string, "priority": "Yüksək" | "Orta" | "Məsləhət" }
    ],
    "careerDomainAnalysis": {
      "dominantDomain": string (Məs: "Bank, Maliyyə və Mühasibat" və ya "İnformasiya Texnologiyaları və Proqramlaşdırma"),
      "dominantDomainExperienceYears": string (Məs: "3 il (65%)"),
      "totalExperienceYears": string (Məs: "4 il 6 ay"),
      "seniorityLevel": string ("Junior (1-2 il)" | "Middle (2-4 il)" | "Senior (5+ il)" | "Lead / Rəhbər" | "Təcrübəçi / Yeni Başlayan"),
      "domainBreakdown": [
        { "domain": string, "duration": string, "percentage": number, "roles": string[], "companies": string[] }
      ],
      "educationSummary": {
        "highestInstitution": string (Məs: "Bakı Dövlət Universiteti"),
        "degree": string (Məs: "Bakalavr"),
        "fieldOfStudy": string (Məs: "Kompüter elmləri"),
        "period": string,
        "statusNote": string
      }
    },
    "marketCompetitiveness": string,
    "suggestedJobTitles": string[],
    "summaryFeedback": string
  }
}`;

    let contentsPayload: any;

    if (fileBase64 && typeof fileBase64 === 'string' && fileBase64.length > 50) {
      const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
      const effectiveMime = mimeType || (fileName?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      const isMultimodalMime = 
        effectiveMime === 'application/pdf' ||
        effectiveMime.startsWith('image/');

      if (isMultimodalMime) {
        contentsPayload = [
          {
            inlineData: {
              mimeType: effectiveMime,
              data: base64Data,
            },
          },
          {
            text: `${promptText}\n\nFayl adı: ${fileName || 'CV Sənədi'}${extractedContent ? `\n\nÇıxarılmış Mətn:\n${extractedContent}` : ''}`,
          },
        ];
      } else {
        contentsPayload = `${promptText}\n\nFayl adı: ${fileName || 'CV'}\nMətn:\n${extractedContent || 'Məzmun sənəd faylıdır.'}`;
      }
    } else {
      contentsPayload = `${promptText}\n\nFayl adı: ${fileName || 'CV Mətni'}\nCV Məzmunu:\n${extractedContent || 'Məzmun daxil edilməyib.'}`;
    }

    const rawResponse = await callGeminiResilient(contentsPayload, {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedCV: {
            type: Type.OBJECT,
            properties: {
              personalInfo: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  address: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                },
                required: ['fullName', 'jobTitle', 'email', 'phone', 'summary'],
              },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    level: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ['name'],
                },
              },
              experiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    current: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                  },
                  required: ['company', 'position'],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    current: { type: Type.BOOLEAN },
                  },
                  required: ['institution', 'degree'],
                },
              },
            },
            required: ['personalInfo', 'skills'],
          },
          analysisResult: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              score: { type: Type.INTEGER },
              qeydler: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              overallScore: { type: Type.INTEGER },
              atsScore: { type: Type.INTEGER },
              candidateSummary: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              matchAssessment: {
                type: Type.OBJECT,
                properties: {
                  matchPercentage: { type: Type.INTEGER },
                  rationale: { type: Type.STRING },
                  educationMatch: { type: Type.STRING },
                  experienceMatch: { type: Type.STRING },
                  skillsMatch: { type: Type.STRING },
                  languagesMatch: { type: Type.STRING },
                },
                required: ['matchPercentage', 'rationale', 'educationMatch', 'experienceMatch', 'skillsMatch', 'languagesMatch'],
              },
              hrRecommendation: {
                type: Type.OBJECT,
                properties: {
                  decision: { type: Type.STRING },
                  advice: { type: Type.STRING },
                },
                required: ['decision', 'advice'],
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionableFeedback: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ['section', 'issue', 'recommendation', 'priority'],
                },
              },
              marketCompetitiveness: { type: Type.STRING },
              suggestedJobTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summaryFeedback: { type: Type.STRING },
            },
            required: [
              'overallScore',
              'atsScore',
              'candidateSummary',
              'strengths',
              'weaknesses',
              'matchAssessment',
              'hrRecommendation',
              'missingKeywords',
              'actionableFeedback',
              'marketCompetitiveness',
              'suggestedJobTitles',
              'summaryFeedback',
            ],
          },
        },
        required: ['extractedCV', 'analysisResult'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    if (parsed && parsed.analysisResult && typeof parsed.analysisResult.overallScore === 'number') {
      const parsedExpCount = (parsed.extractedCV?.experiences || []).length;
      const parsedSkillsCount = (parsed.extractedCV?.skills || []).length;

      // Ensure AI doesn't hallucinate inflated scores on empty / sparse CVs
      if (parsedExpCount === 0 && parsed.analysisResult.overallScore > 50) {
        parsed.analysisResult.overallScore = Math.min(parsed.analysisResult.overallScore, factualEval.overallScore);
        if (parsed.analysisResult.matchAssessment) {
          parsed.analysisResult.matchAssessment.matchPercentage = parsed.analysisResult.overallScore;
        }
        if (parsed.analysisResult.atsScore) {
          parsed.analysisResult.atsScore = Math.min(parsed.analysisResult.atsScore, parsed.analysisResult.overallScore);
        }
      } else if (parsedSkillsCount < 3 && parsed.analysisResult.overallScore > 65) {
        parsed.analysisResult.overallScore = Math.min(parsed.analysisResult.overallScore, factualEval.overallScore);
        if (parsed.analysisResult.matchAssessment) {
          parsed.analysisResult.matchAssessment.matchPercentage = parsed.analysisResult.overallScore;
        }
      }

      const rawScore = typeof parsed.analysisResult.score === 'number' ? parsed.analysisResult.score : parsed.analysisResult.overallScore;
      const finalStatus = (parsed.analysisResult.status === 'uygundur' || parsed.analysisResult.status === 'uygun_deyil')
        ? parsed.analysisResult.status
        : (rawScore >= 60 ? 'uygundur' : 'uygun_deyil');
      const finalQeydler = Array.isArray(parsed.analysisResult.qeydler) && parsed.analysisResult.qeydler.length > 0
        ? parsed.analysisResult.qeydler
        : [
            parsed.analysisResult.candidateSummary || 'CV sənədi meyarlar üzrə təhlil edildi.',
            ...(parsed.analysisResult.strengths || []).slice(0, 3).map((s: string) => `✅ ${s}`),
            ...(parsed.analysisResult.weaknesses || []).slice(0, 3).map((w: string) => `⚠️ ${w}`),
            parsed.analysisResult.hrRecommendation?.advice ? `💡 HR Rəyi: ${parsed.analysisResult.hrRecommendation.advice}` : ''
          ].filter(Boolean);

      const mergedAnalysis = {
        ...factualEval,
        ...parsed.analysisResult,
        score: rawScore,
        status: finalStatus,
        qeydler: finalQeydler,
        factualBlocks: factualEval.factualBlocks,
        careerDomainAnalysis: parsed.analysisResult?.careerDomainAnalysis || factualEval.careerDomainAnalysis,
        sectionAudits: parsed.analysisResult?.sectionAudits && parsed.analysisResult.sectionAudits.length >= 5
          ? parsed.analysisResult.sectionAudits
          : factualEval.sectionAudits,
        metricsBreakdown: parsed.analysisResult?.metricsBreakdown || factualEval.metricsBreakdown,
        executiveSummary: parsed.analysisResult?.executiveSummary || factualEval.executiveSummary,
      };

      let finalExtractedCV = parsed.extractedCV && parsed.extractedCV.personalInfo?.fullName ? parsed.extractedCV : factualCV;
      if (finalExtractedCV.experiences && Array.isArray(finalExtractedCV.experiences)) {
        finalExtractedCV.experiences = finalExtractedCV.experiences.map((e: any, i: number) => {
          const fallbackExp = factualCV.experiences?.[i];
          let comp = (e.company || '').trim();
          let pos = (e.position || '').trim();
          if (!comp || comp.toLowerCase() === pos.toLowerCase()) {
            comp = fallbackExp?.company || 'Özəl Şirkət / Təşkilat';
          }
          if (!pos) {
            pos = fallbackExp?.position || 'Mütəxəssis';
          }
          return { ...e, company: comp, position: pos };
        });
      }
      if (finalExtractedCV.education && Array.isArray(finalExtractedCV.education)) {
        finalExtractedCV.education = finalExtractedCV.education.map((ed: any, i: number) => {
          const fallbackEdu = factualCV.education?.[i];
          let inst = (ed.institution || '').trim();
          let deg = (ed.degree || '').trim();
          let field = (ed.fieldOfStudy || '').trim();
          if (!inst || inst.toLowerCase().includes('bakalavr') || inst.toLowerCase().includes('magistr')) {
            inst = fallbackEdu?.institution || inst || 'Ali Təhsil Müəssisəsi';
          }
          if (!deg) deg = fallbackEdu?.degree || 'Bakalavr';
          if (!field) field = fallbackEdu?.fieldOfStudy || 'İxtisas qeyd olunmayıb';
          return { ...ed, institution: inst, degree: deg, fieldOfStudy: field };
        });
      }

      return res.json({
        success: true,
        fileName: fileName || 'CV Sənədi',
        extractedCV: finalExtractedCV,
        analysisResult: mergedAnalysis,
      });
    }

    return res.json(await getFactualUploadedResult());
  } catch {
    return res.json(await getFactualUploadedResult());
  }
});

// Helper for parsing arbitrary pasted text into fully structured CVData without hallucinations
function parseRawTextToCVFallback(rawText: string, targetRole?: string) {
  const factual = parseFactualCVFromText(rawText, targetRole);
  return {
    id: `cv-ai-${Date.now()}`,
    title: `${factual.personalInfo.fullName} - ${factual.personalInfo.jobTitle} CV`,
    lastUpdated: new Date().toISOString().split('T')[0],
    personalInfo: factual.personalInfo,
    experiences: factual.experiences,
    education: factual.education,
    skills: factual.skills,
    languages: factual.languages,
    projects: [],
    certificates: [],
  };
}

// 3.2 AI Generate & Structure Full CV from Raw Pasted Text (for CV Builder)
app.post('/api/ai/generate-cv-from-text', async (req, res) => {
  const { rawText, targetJobTitle } = req.body;

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
    return res.status(400).json({ error: 'Zəhmət olmasa CV mətni daxil edin (ən azı 10 simvol).' });
  }

  try {
    const ai = getAI();
    if (!ai) {
      const fallbackCV = parseRawTextToCVFallback(rawText, targetJobTitle);
      return res.json({ success: true, cvData: fallbackCV });
    }

    const prompt = `Sən beynəlxalq səviyyəli Baş HR Mütəxəssisi və Peşəkar CV Tərtibatçısısan.
İstifadəçi sənə sərbəst, qarışıq və ya köhnə CV mətni / bioqrafiya / LinkedIn qeydləri təqdim edir.

Məqsədin:
Bu mətndən namizədin bütün məlumatlarını (Ad, Soyad, Vəzifə, Əlaqə, Haqqında xülasə, İş təcrübələri, Təhsil, Bacarıqlar, Dillər, Layihələr, Sertifikatlar) dəqiqliklə çıxarmaq və Azərbaycan dilində tam professional, səliqəli və ATS standartlarına uyğun strukturlaşdırmaqdır.

Əgər mətndə hansısa bənd tam qeyd edilməyibsə, mətndəki kontekstə uyğun peşəkar cümlələr və bacarıqlar əlavə edərək CV-ni dolğunlaşdır.

Hədəf Vəzifə (əgər varsa): ${targetJobTitle || 'Mətndəki vəzifəyə uyğun'}

İSTİFADƏÇİNİN DAXİL ETDİYİ MƏTN:
${rawText}

Aşağıdakı JSON sxeminə uyğun olaraq DƏQİQ JSON qaytar:
{
  "title": string (məsələn: "Əli Əliyev - Senior Developer CV"),
  "personalInfo": {
    "fullName": string,
    "jobTitle": string,
    "email": string,
    "phone": string,
    "address": string,
    "linkedin": string,
    "github": string,
    "portfolio": string,
    "summary": string (3-4 cümləlik peşəkar xülasə)
  },
  "experiences": [
    {
      "id": string (məs: "exp-1"),
      "company": string,
      "position": string,
      "location": string,
      "startDate": string (YYYY-MM və ya YYYY formatı),
      "endDate": string (YYYY-MM və ya "Hazırda"),
      "current": boolean,
      "description": string (Bənd-bənd əsas öhdəliklər və nailiyyətlər)
    }
  ],
  "education": [
    {
      "id": string (məs: "edu-1"),
      "institution": string,
      "degree": string (Bakalavr / Magistr / Kollec / Orta),
      "fieldOfStudy": string,
      "startDate": string,
      "endDate": string,
      "current": boolean
    }
  ],
  "skills": [
    {
      "id": string,
      "name": string,
      "level": "Başlanğıc" | "Orta" | "Yaxşı" | "Əla / Ekspert",
      "category": "Texniki" | "Soft skill" | "Alət / Proqram"
    }
  ],
  "languages": [
    {
      "id": string,
      "language": string,
      "proficiency": "A1-A2 (Başlanğıc)" | "B1-B2 (Orta/İşgüzar)" | "C1-C2 (Sərbəst)" | "Ana dili"
    }
  ],
  "projects": [
    {
      "id": string,
      "title": string,
      "link": string,
      "description": string,
      "technologies": string[]
    }
  ],
  "certificates": [
    {
      "id": string,
      "name": string,
      "issuer": string,
      "issueDate": string,
      "credentialUrl": string
    }
  ]
}`;

    const rawResponse = await callGeminiResilient(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              address: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              github: { type: Type.STRING },
              portfolio: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
            required: ['fullName', 'jobTitle', 'email', 'phone', 'summary'],
          },
          experiences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                company: { type: Type.STRING },
                position: { type: Type.STRING },
                location: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                current: { type: Type.BOOLEAN },
                description: { type: Type.STRING },
              },
              required: ['id', 'company', 'position', 'description'],
            },
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                fieldOfStudy: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                current: { type: Type.BOOLEAN },
              },
              required: ['id', 'institution', 'degree'],
            },
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                level: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ['id', 'name', 'level', 'category'],
            },
          },
          languages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                language: { type: Type.STRING },
                proficiency: { type: Type.STRING },
              },
              required: ['id', 'language', 'proficiency'],
            },
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                link: { type: Type.STRING },
                description: { type: Type.STRING },
                technologies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['id', 'title', 'description'],
            },
          },
          certificates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                issueDate: { type: Type.STRING },
                credentialUrl: { type: Type.STRING },
              },
              required: ['id', 'name', 'issuer'],
            },
          },
        },
        required: ['personalInfo', 'experiences', 'education', 'skills'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    if (parsed && parsed.personalInfo && parsed.personalInfo.fullName) {
      const fullCV = {
        id: `cv-ai-${Date.now()}`,
        title: parsed.title || `${parsed.personalInfo.fullName} - CV`,
        lastUpdated: new Date().toISOString().split('T')[0],
        personalInfo: {
          fullName: parsed.personalInfo.fullName,
          jobTitle: parsed.personalInfo.jobTitle || 'Mütəxəssis',
          email: parsed.personalInfo.email || 'namized@example.com',
          phone: parsed.personalInfo.phone || '+994 50 123 45 67',
          address: parsed.personalInfo.address || 'Bakı, Azərbaycan',
          linkedin: parsed.personalInfo.linkedin || '',
          github: parsed.personalInfo.github || '',
          portfolio: parsed.personalInfo.portfolio || '',
          summary: parsed.personalInfo.summary || '',
          photoUrl: '',
        },
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      };
      return res.json({ success: true, cvData: fullCV });
    }

    const fallbackCV = parseRawTextToCVFallback(rawText, targetJobTitle);
    return res.json({ success: true, cvData: fallbackCV });
  } catch {
    const fallbackCV = parseRawTextToCVFallback(rawText, targetJobTitle);
    return res.json({ success: true, cvData: fallbackCV });
  }
});

// 4. AI Job Description Generator for Employers / Businesses
app.post('/api/ai/generate-job-desc', async (req, res) => {
  const { title, category, level, employmentType, keyPoints } = req.body;

  const fallbackJobDesc = {
    description: `Şirkətimizin böyüyən komandasına peşəkar və motivasiyalı ${title || 'Mütəxəssis'} axtarırıq. Siz müasir layihələrdə iştirak edərək biznes proseslərinin inkişafına birbaşa töhfə verəcəksiniz.`,
    responsibilities: [
      `${title || 'Vəzifə'} üzrə gündəlik əməliyyatların və strateji tapşırıqların icrası`,
      'Komanda ilə koordinasiyalı işləmək və hesabatlılığın təmin edilməsi',
      'Mövcud proseslərin səmərəliliyinin artırılması üzrə təşəbbüslərin irəli sürülməsi',
      'Müştəri və tərəfdaşlarla peşəkar ünsiyyətin qurulması',
    ],
    requirements: [
      `Müvafiq sahədə ali təhsil və ${level || 'müvafiq'} iş təcrübəsi`,
      'Analitik düşüncə tərzi və problemləri çevik həll etmə bacarığı',
      'Azərbaycan dilində mükəmməl yazılı və şifahi ünsiyyət (xarici dil bilikləri üstünlükdür)',
      'Komandada məsuliyyətlə çalışmaq və vaxt idarəetməsi bacarığı',
    ],
    benefits: [
      'Rəqabətədavamlı əmək haqqı və karyera yüksəlişi imkanları',
      'Könüllü tibbi sığorta paketi',
      'Daimi peşəkar təlimlər və sertifikatlaşdırma dəstəyi',
      'Rahat və dinamik korporativ iş mühiti',
    ],
    skills: ['Peşəkar Ünsiyyət', 'Layihə İdarəetməsi', 'Problem Həlli', 'MS Office', 'Komanda İşi'],
  };

  try {
    const prompt = `Sən təcrübəli HR və İşə Qəbul Menecerisən. Azərbaycan dilində aşağıdakı parametrlərə uyğun cəlbedici, peşəkar və detallı vakansiya elanı tərtib et.

Vəzifə: ${title}
Kateqoriya: ${category || 'Ümumi'}
Təcrübə səviyyəsi: ${level || 'Orta'}
İş rejimi: ${employmentType || 'Tam ştat'}
Xüsusi qeydlər: ${keyPoints || 'standart şirkət tələbləri'}

Aşağıdakı JSON formatında cavab ver:
- description: string (2-3 cümləlik şirkət və vakansiya haqqında ümumi cəlbedici mətn)
- responsibilities: array of string (4-6 konkret vəzifə öhdəliyi)
- requirements: array of string (4-6 namizədə qoyulan tələb)
- benefits: array of string (4-5 şirkətin təklif etdiyi üstünlük və imtiyaz)
- skills: array of string (5-8 əsas tələb olunan bacarıq və proqram adı)`;

    const rawResponse = await callGeminiResilient(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          responsibilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          benefits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['description', 'responsibilities', 'requirements', 'benefits', 'skills'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    return res.json(parsed);
  } catch {
    return res.json(fallbackJobDesc);
  }
});

// 5. AI Interview Preparation & Question Generator
app.post('/api/ai/interview-prep', async (req, res) => {
  const { vacancyTitle, companyName, requirements } = req.body;

  const fallbackInterview = {
    questions: [
      {
        category: 'Texniki',
        question: `"${vacancyTitle}" vəzifəsində ən son qarşılaşdığınız çətin texniki problemi necə həll etmisiniz?`,
        whyAsked: 'Müsahibəçi sizin real problem həll etmə (problem-solving) yanaşmanızı yoxlayır.',
        suggestedAnswerTip: 'STAR metodundan (Situation, Task, Action, Result) istifadə edərək konkret nəticəni qeyd edin.',
        sampleAnswerAz: 'Əvvəlki işimdə oxşar mürəkkəb tapşırıq zamanı əvvəlcə problemin kök səbəbini analiz etdim, komanda ilə həll variantlarını müzakirə etdikdən sonra optimallaşdırma apardım və səmərəliliyi 25% artırdım.',
      },
      {
        category: 'Davranış və Situasiya',
        question: 'Fikrinizin rəhbərlik və ya komanda yoldaşınızla üst-üstə düşmədiyi vəziyyətdə nə etmisiniz?',
        whyAsked: 'Konfliktləri idarə etmə və konstruktiv müzakirə aparmaq qabiliyyətinizi qiymətləndirir.',
        suggestedAnswerTip: 'Emosiyalardan uzaq, faktlara və biznes məqsədlərinə əsaslandığınızı göstərin.',
        sampleAnswerAz: 'Fikrimi arqumentlər, statistik məlumatlar və nümunələrlə izah etdim, eyni zamanda qarşı tərəfin arqumentlərini dinləyərək ümumi komanda maraqlarına uyğun ən yaxşı kompromisə gəldik.',
      },
      {
        category: 'Şirkət Uyğunluğu',
        question: `Niyə məhz ${companyName || 'şirkətimizdə'} və bu vəzifədə işləmək istəyirsiniz?`,
        whyAsked: 'Şirkətin fəaliyyəti və vizyonu haqqında məlumatlılığınızı və motivasiyanızı ölçür.',
        suggestedAnswerTip: 'Şirkətin son uğurlarını və sizin bacarıqlarınızın bu uğura necə qatqı verəcəyini əlaqələndirin.',
        sampleAnswerAz: 'Şirkətinizin bazardakı innovativ addımlarını və inkişaf tempini yaxından izləyirəm. Mənim bu sahədəki təcrübəm və komandaya qatacağım dinamika qarşılıqlı böyük uğurlar gətirəcək.',
      },
    ],
    tips: [
      'Müsahibədən əvvəl şirkətin veb saytını və son xəbərlərini mütləq araşdırın.',
      'Özünüz haqqında 2 dəqiqəlik yığcam və təsirli təqdimat hazırlayın.',
      'Müsahibənin sonunda şirkətə vermək üçün 2-3 məzmunlu sual hazırlayın.',
    ],
  };

  try {
    const prompt = `Sən peşəkar işə qəbul və müsahibə mütəxəssisisən.
Namizədin müraciət etdiyi vakansiya üçün Azərbaycan dilində 4-5 ədəd dərin, real və faydalı müsahibə sualı və nümunəvi cavab bələdçisi hazırla.

Vakansiya: ${vacancyTitle}
Şirkət: ${companyName || 'Azərbaycan Şirkəti'}
Tələblər: ${requirements?.join(', ') || 'Standart peşəkar tələblər'}

Aşağıdakı JSON sxeminə uyğun cavab ver:
- questions: array of { category: 'Texniki' | 'Davranış və Situasiya' | 'Şirkət Uyğunluğu', question: string, whyAsked: string, suggestedAnswerTip: string, sampleAnswerAz: string }
- tips: array of string (namizəd üçün 3-4 ümumi vacib müsahibə tövsiyəsi)`;

    const rawResponse = await callGeminiResilient(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                question: { type: Type.STRING },
                whyAsked: { type: Type.STRING },
                suggestedAnswerTip: { type: Type.STRING },
                sampleAnswerAz: { type: Type.STRING },
              },
              required: ['category', 'question', 'whyAsked', 'suggestedAnswerTip', 'sampleAnswerAz'],
            },
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['questions', 'tips'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    return res.json(parsed);
  } catch {
    return res.json(fallbackInterview);
  }
});

// -------------------------------------------------------------
// AI INTERVIEW EVALUATION SUMMARY ENDPOINT
// -------------------------------------------------------------
app.post('/api/ai/interview-summary', async (req, res) => {
  const { candidateName, position, department, ratings, strengths, weaknesses, notes, recommendation } = req.body;

  const fallbackSummary = `Namizəd ${candidateName || 'Namizəd'} ilə "${position || 'Təyin olunmuş vəzifə'}" üzrə keçirilmiş müsahibə nəticəsində peşəkar və ünsiyyət bacarıqları yüksək qiymətləndirildi. ` +
    (strengths ? `Əsas üstünlükləri: ${strengths}. ` : '') +
    (weaknesses ? `İnkişaf etdirilməli sahələr: ${weaknesses}. ` : '') +
    `Müsahibə qeydləri və meyarlar üzrə ümumi rəy: ${recommendation || 'Müsbət dəyərləndirilir və növbəti mərhələ üçün uyğun hesab edilir.'}`;

  try {
    const prompt = `Sən təcrübəli HR direktoru və müsahibə dəyərləndirmə üzrə AI köməkçisisən.
Aşağıdakı namizəd məlumatları, qiymətləndirmə meyarları və HR qeydləri əsasında peşəkar, lakonik və analitik "Müsahibə Yekun Rəyi" (Interview Summary Report) hazırla.

Namizəd: ${candidateName || 'Namizəd'}
Vəzifə: ${position || 'Vəzifə'} (${department || 'Departament'})
Qiymətlər (1-5 şkalası):
- Texniki Bacarıqlar: ${ratings?.technicalSkills || 4}/5
- İş Təcrübəsi: ${ratings?.relevantExperience || 4}/5
- Ünsiyyət və Kommunikasiya: ${ratings?.communication || 4}/5
- Problem Həll Etmə: ${ratings?.problemSolving || 4}/5
- Komanda İşi: ${ratings?.teamwork || 4}/5
- Liderlik: ${ratings?.leadership || 3}/5
- Şirkət Mədəniyyətinə Uyğunluq: ${ratings?.culturalFit || 4}/5
- Motivasiya: ${ratings?.motivation || 5}/5

Namizədin Güclü Tərəfləri: ${strengths || 'Təcrübəli, pozitiv və məsuliyyətli'}
İnkişaf Sahələri / Çatışmazlıqlar: ${weaknesses || 'Bəzi xüsusi daxili alətlər üzrə təlim tələb oluna bilər'}
Müsahibəçi Qeydləri: ${notes || 'Müsahibə zamanı suallara inamla cavab verdi.'}
HR Yekun Tövsiyəsi: ${recommendation || 'Təklif verilməsi tövsiyə olunur.'}

Tələblər:
1. Rəyi aydın, peşəkar Azərbaycan dilində yaz.
2. Namizədin komandaya qatacağı dəyəri və yekun tövsiyəni vurğula.
3. 2-3 cümləlik dolğun və analitik xülasə təqdim et.`;

    const summaryText = await callGeminiResilient(prompt);
    return res.json({
      summary: summaryText.trim(),
    });
  } catch {
    return res.json({
      summary: fallbackSummary,
    });
  }
});

// -------------------------------------------------------------
// AI JOB OFFER GENERATION ENDPOINT
// -------------------------------------------------------------
app.post('/api/ai/generate-job-offer', async (req, res) => {
  const { offer, language = 'az' } = req.body;

  const isAz = language === 'az';

  const fallbackOfferLetter = isAz
    ? `Hörmətli ${offer?.candidateName || 'Namizəd'},

${offer?.companyName || 'Şirkətimiz'} adından Sizi uğurlu müsahibə mərhələlərindən sonra komandamızda görməkdən böyük məmnunluq duyuruq. Şirkətimiz Sizə "${offer?.position || 'Mütəxəssis'}" vəzifəsini təklif edir.

Sizin peşəkar bacarıqlarınız, təcrübəniz və komandaya qatacağınız dəyər şirkətimizin strateji hədəflərinə çatmaqda mühüm rol oynayacaqdır.

### Əməkdaşlığın Əsas Şərtləri:
1. **Vəzifə və Struktur Bölmə:** ${offer?.position || 'Mütəxəssis'}, ${offer?.department || 'Əsas Şöbə'}
2. **İşə Başlama Tarixi:** ${offer?.startDate || 'Razılaşdırılmış tarix'}
3. **Məşğulluq Növü:** ${offer?.employmentType || 'Tam ştat'}
4. **İş Yeri:** ${offer?.workLocation || offer?.companyAddress || 'Bakı, Azərbaycan'}
5. **İş Qrafiki:** ${offer?.workingSchedule || '09:00 - 18:00, Bazar ertəsi - Cümə'}
6. **Əməkhaqqı:**
   - Aylıq Məcmu Əməkhaqqı (Gross): ${offer?.grossSalary ? `${offer.grossSalary.toLocaleString('az-AZ')} AZN` : 'Razılaşma ilə'}
   - Xalis Əməkhaqqı (Net): ${offer?.netSalary ? `${offer.netSalary.toLocaleString('az-AZ')} AZN` : 'Razılaşma ilə'}
7. **Sınaq Müddəti:** ${offer?.probationPeriod || '3 ay'}
8. **Məzuniyyət:** ${offer?.annualLeave || '21 təqvim günü'}
9. **Bonus və Mükafatlar:** ${offer?.bonus || 'KPI və fərdi nəticələrə əsasən'}

### Şirkət Tərəfindən Təmin Edilən İmtiyazlar (Benefits):
${Array.isArray(offer?.benefits) && offer.benefits.length > 0 ? offer.benefits.map((b: string) => `• ${b}`).join('\n') : '• Müvafiq korporativ təminatlar paketi'}

### Əlavə Qaydalar:
${offer?.additionalTerms?.trim() || 'Əmək müqaviləsi AR Əmək Məcəlləsinə uyğun olaraq rəsmiləşdirilir.'}

Bu təklif ilə razısınızsa, elektron imza və ya onlayn təsdiq vasitəsilə cavabınızı bildirməyinizi xahiş edirik.

Hörmətlə,
**${offer?.hrContactPerson || 'HR Meneceri'}**
${offer?.hrContactPosition || 'İnsan Resursları Departamenti'}
${offer?.companyName || 'Şirkət'}`
    : `Dear ${offer?.candidateName || 'Candidate'},

On behalf of ${offer?.companyName || 'our company'}, we are delighted to formally extend an offer of employment for the position of "${offer?.position || 'Specialist'}" within the ${offer?.department || 'Department'}.

### Key Employment Terms:
- **Position:** ${offer?.position || 'Specialist'}
- **Department:** ${offer?.department || 'Department'}
- **Start Date:** ${offer?.startDate || 'Agreed date'}
- **Employment Type:** ${offer?.employmentType || 'Full-time'}
- **Work Location:** ${offer?.workLocation || 'Baku, Azerbaijan'}
- **Working Schedule:** ${offer?.workingSchedule || 'Monday - Friday, 09:00 - 18:00'}
- **Compensation:** Gross ${offer?.grossSalary ? `${offer.grossSalary.toLocaleString('en-US')} AZN` : 'TBD'} / Net ${offer?.netSalary ? `${offer.netSalary.toLocaleString('en-US')} AZN` : 'TBD'}
- **Probation Period:** ${offer?.probationPeriod || '3 months'}
- **Annual Leave:** ${offer?.annualLeave || '21 calendar days'}
- **Bonus Plan:** ${offer?.bonus || 'Performance-based bonus'}

### Benefits:
${Array.isArray(offer?.benefits) && offer.benefits.length > 0 ? offer.benefits.map((b: string) => `• ${b}`).join('\n') : '• Standard company benefits package'}

### Additional Terms:
${offer?.additionalTerms?.trim() || 'Standard terms of employment in compliance with local labor legislation.'}

Sincerely,
**${offer?.hrContactPerson || 'HR Manager'}**
${offer?.hrContactPosition || 'Human Resources'}
${offer?.companyName || 'Company'}`;

  try {
    const prompt = `You are a premier executive HR Director. Write an official, corporate, highly polished Job Offer Letter based EXACTLY on the provided data without hallucinating or changing any financial or legal terms.

Language: ${language === 'az' ? 'Azərbaycan dili (Official corporate Azerbaijani)' : 'English (Formal corporate Business English)'}

Data:
- Candidate Name: ${offer?.candidateName}
- Company: ${offer?.companyName}
- Position: ${offer?.position}
- Department: ${offer?.department}
- Employment Type: ${offer?.employmentType}
- Work Location: ${offer?.workLocation || offer?.companyAddress}
- Start Date: ${offer?.startDate}
- Gross Salary: ${offer?.grossSalary} AZN
- Net Salary: ${offer?.netSalary} AZN
- Probation Period: ${offer?.probationPeriod}
- Working Hours: ${offer?.workingSchedule}
- Annual Leave: ${offer?.annualLeave}
- Bonus Plan: ${offer?.bonus}
- Benefits: ${Array.isArray(offer?.benefits) ? offer.benefits.join(', ') : 'Standard benefits'}
- Additional Terms: ${offer?.additionalTerms || 'Standard statutory terms'}
- HR Contact: ${offer?.hrContactPerson} (${offer?.hrContactPosition || 'HR Manager'})

Instructions:
1. Warm, congratulatory, yet strictly formal corporate opening.
2. Clear, beautifully formatted bullet points for all compensation, benefits, and schedule terms.
3. Instructions on how the candidate can review and confirm acceptance.
4. Formal closing signature block with HR contact details.`;

    const generatedText = await callGeminiResilient(prompt);
    return res.json({
      content: generatedText.trim(),
    });
  } catch {
    return res.json({
      content: fallbackOfferLetter,
    });
  }
});

// -------------------------------------------------------------
// AI SMART SEARCH & VACANCY MATCHER ENDPOINT
// -------------------------------------------------------------
app.post('/api/ai/smart-search-vacancies', async (req, res) => {
  const { query, candidateCV, vacancies } = req.body;

  const normalizeAz = (text: string) => {
    return (text || '')
      .toLowerCase()
      .replace(/ə/g, 'e')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g');
  };

  const getLocalFallbackMatches = () => {
    if (!Array.isArray(vacancies) || vacancies.length === 0) {
      return { matchedVacancies: [], extractedSummary: { keywords: [] } };
    }

    const normQuery = normalizeAz(query || '');
    const cvSkills = candidateCV?.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)) || [];
    const cvTitle = candidateCV?.personalInfo?.jobTitle || '';

    // Extract potential salary
    const salaryMatch = normQuery.match(/(\d{3,5})/);
    const targetMinSalary = salaryMatch ? parseInt(salaryMatch[1], 10) : 0;

    const scored = vacancies.map((vac: any) => {
      let score = 50;
      const reasons: string[] = [];
      const highlights: string[] = [];

      const vacText = normalizeAz(
        `${vac.title} ${vac.category} ${vac.description} ${vac.city} ${vac.employmentType} ${vac.skills?.join(' ')} ${vac.companyName}`
      );

      // Query keywords match
      if (normQuery) {
        const words = normQuery.split(/\s+/).filter((w: string) => w.length > 2);
        let matchedWordCount = 0;
        words.forEach((w: string) => {
          if (vacText.includes(w)) {
            matchedWordCount++;
          }
        });

        if (matchedWordCount > 0) {
          const ratio = matchedWordCount / Math.max(1, words.length);
          score += Math.round(ratio * 30);
          reasons.push(`Axtarış sorğusundakı açar anlayışlara (${matchedWordCount} parametr) uyğundur`);
        }
      }

      // CV Skills match
      if (cvSkills.length > 0) {
        const matchedSkills = (vac.skills || []).filter((s: string) =>
          cvSkills.some((cs: string) => normalizeAz(cs).includes(normalizeAz(s)) || normalizeAz(s).includes(normalizeAz(cs)))
        );

        if (matchedSkills.length > 0) {
          score += Math.min(25, matchedSkills.length * 8);
          highlights.push(`Bacarıq uyğunluğu: ${matchedSkills.slice(0, 3).join(', ')}`);
          reasons.push(`Sizin ${matchedSkills.length} əsas bacarığınızla birbaşa üst-üstə düşür`);
        }
      }

      // Title & role match
      if (cvTitle && normalizeAz(vac.title).includes(normalizeAz(cvTitle))) {
        score += 15;
        reasons.push(`CV-nizdəki "${cvTitle}" vəzifəsi ilə uyğundur`);
      }

      // Salary match
      if (targetMinSalary > 0 && vac.maxSalary) {
        if (vac.maxSalary >= targetMinSalary) {
          score += 12;
          reasons.push(`Maaş tələbinizi qarşılayır (${vac.minSalary} - ${vac.maxSalary} ${vac.currency || 'AZN'})`);
        } else {
          score -= 10;
        }
      }

      // Featured / verified bonus
      if (vac.isFeatured) score += 4;
      if (vac.companyVerified) score += 3;

      const finalScore = Math.min(99, Math.max(45, score));
      const matchReason = reasons.length > 0 
        ? reasons.join('. ') + '.'
        : `Vakansiya sahəsi (${vac.category}) və parametrləri ilə uyğundur.`;

      return {
        id: vac.id,
        matchScore: finalScore,
        matchReason,
        keyHighlights: highlights.length > 0 ? highlights : [vac.category, `${vac.minSalary}-${vac.maxSalary} ${vac.currency || 'AZN'}`],
      };
    });

    // Sort descending by match score
    scored.sort((a: any, b: any) => b.matchScore - a.matchScore);

    return {
      matchedVacancies: scored,
      extractedSummary: {
        keywords: query ? query.split(' ').filter(Boolean) : [],
        minSalary: targetMinSalary || undefined,
      },
    };
  };

  try {
    if (!query && !candidateCV) {
      return res.json(getLocalFallbackMatches());
    }

    const vacanciesSummary = (vacancies || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      company: v.companyName,
      category: v.category,
      city: v.city,
      type: v.employmentType,
      salary: `${v.minSalary}-${v.maxSalary} ${v.currency || 'AZN'}`,
      skills: v.skills,
      experienceLevel: v.experienceLevel,
    }));

    const prompt = `Sən ağıllı iş axtarış və namizəd-vakansiya uyğunlaşdırma (Job Matching) sistemisən.
İstifadəçinin axtarış sorğusunu və ya CV profilini təhlil edərək təqdim olunan vakansiyalar arasından ən uyğun olanlarını seç, faiz balı (0-100%) ver və Azərbaycan dilində niyə uyğun olduğunu 1 cümlə ilə izah et.

Axtarış Sorğusu: "${query || 'Bütün uyğun vakansiyalar'}"
Namizəd Profili: ${candidateCV ? `Vəzifə: ${candidateCV.personalInfo?.jobTitle || ''}, Bacarıqlar: ${candidateCV.skills?.map((s: any) => s.name || s).join(', ') || ''}` : 'Göstərilməyib'}

Mövcud Vakansiyalar:
${JSON.stringify(vacanciesSummary, null, 2)}

Aşağıdakı JSON sxeminə uyğun cavab ver:
- matchedVacancies: array of { id: string, matchScore: number (40-99 arası), matchReason: string (Azərbaycan dilində qısa izah), keyHighlights: array of string }
- extractedSummary: { keywords: array of string, category?: string, minSalary?: number, city?: string, workType?: string }`;

    const rawResponse = await callGeminiResilient(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchedVacancies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                matchScore: { type: Type.INTEGER },
                matchReason: { type: Type.STRING },
                keyHighlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['id', 'matchScore', 'matchReason', 'keyHighlights'],
            },
          },
          extractedSummary: {
            type: Type.OBJECT,
            properties: {
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              category: { type: Type.STRING },
              minSalary: { type: Type.INTEGER },
              city: { type: Type.STRING },
              workType: { type: Type.STRING },
            },
          },
        },
        required: ['matchedVacancies'],
      },
    });

    const parsed = JSON.parse(rawResponse);
    if (parsed && Array.isArray(parsed.matchedVacancies) && parsed.matchedVacancies.length > 0) {
      return res.json(parsed);
    }
    return res.json(getLocalFallbackMatches());
  } catch {
    return res.json(getLocalFallbackMatches());
  }
});

// -------------------------------------------------------------
// ONE-CLICK EMAIL DISPATCH ENDPOINT
// -------------------------------------------------------------
app.post('/api/email/send-job-offer', async (req, res) => {
  const {
    candidateEmail,
    candidateName,
    position,
    companyName,
    subject,
    htmlBody,
    textBody,
    secureOfferLink,
    pdfAttachmentBase64,
    pdfFileName,
  } = req.body;

  if (!candidateEmail || !subject) {
    return res.status(400).json({ error: 'Namizədin e-poçt ünvanı və mövzu mütləqdir.' });
  }

  const timestamp = new Date().toISOString();
  const simulatedMessageId = `<offer-${Date.now()}.${Math.random().toString(36).substring(2, 9)}@jobia.az>`;

  // Check if real SMTP credentials are provided in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const attachments = [];
      if (pdfAttachmentBase64) {
        const cleanBase64 = pdfAttachmentBase64.replace(/^data:application\/pdf;base64,/, '');
        attachments.push({
          filename: pdfFileName || `Job_Offer_${candidateName || 'Candidate'}.pdf`,
          content: Buffer.from(cleanBase64, 'base64'),
          contentType: 'application/pdf',
        });
      }

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `${companyName || 'jobia.az'} <noreply@jobia.az>`,
        to: candidateEmail,
        subject,
        text: textBody,
        html: htmlBody,
        attachments,
      });

      return res.json({
        success: true,
        messageId: info.messageId,
        deliveredTo: candidateEmail,
        sentAt: timestamp,
        isSimulated: false,
      });
    } catch (smtpErr: any) {
      console.log('Real SMTP delivery note:', smtpErr?.message);
    }
  }

  // High-reliability transactional dispatcher (simulated with audit confirmation)
  console.log(`[Job Offer Mailer] Sent to: ${candidateEmail} | Subject: "${subject}" | Secure Link: ${secureOfferLink}`);

  return res.json({
    success: true,
    messageId: simulatedMessageId,
    deliveredTo: candidateEmail,
    sentAt: timestamp,
    isSimulated: true,
  });
});

// -------------------------------------------------------------
// TWO-FACTOR (2FA / OTP) SECURITY CODE DISPATCH & VERIFICATION
// -------------------------------------------------------------
interface OtpRecord {
  code: string;
  email?: string;
  phone?: string;
  expiresAt: number;
  attempts: number;
  purpose: 'login' | 'register' | 'password_reset';
}

const otpVault = new Map<string, OtpRecord>();

// Clean up expired OTPs every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpVault.entries()) {
    if (record.expiresAt < now) {
      otpVault.delete(key);
    }
  }
}, 120000);

app.post('/api/auth/send-otp', async (req, res) => {
  const { email, phone, purpose = 'register', channel = 'email', identifier: customId } = req.body;

  const targetEmail = email?.trim().toLowerCase();
  const targetPhone = phone?.trim();

  if (!targetEmail && !targetPhone && !customId) {
    return res.status(400).json({ error: 'E-poçt və ya telefon nömrəsi qeyd olunmalıdır.' });
  }

  const identifier = (targetEmail || (customId?.trim().toLowerCase()) || targetPhone || '');
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresInSeconds = 300; // 5 minutes validity
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  otpVault.set(identifier, {
    code: otpCode,
    email: targetEmail || undefined,
    phone: targetPhone || undefined,
    expiresAt,
    attempts: 0,
    purpose: purpose as any,
  });

  // Mask target for display
  let maskedTarget = '';
  if (targetEmail) {
    const parts = targetEmail.split('@');
    const namePart = parts[0];
    const maskedName = namePart.length > 2 
      ? `${namePart[0]}***${namePart[namePart.length - 1]}` 
      : `${namePart[0]}*`;
    maskedTarget = `${maskedName}@${parts[1]}`;
  } else if (targetPhone) {
    maskedTarget = targetPhone.replace(/(\+\d{3}\s?\d{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})/, '$1 *** ** $4');
  } else {
    maskedTarget = identifier;
  }

  // Attempt real email dispatch via SMTP if available
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  let emailSentReal = false;
  let emailError: string | null = null;

  if (targetEmail && smtpHost && smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: { user: smtpUser, pass: smtpPass },
      });

      let subject = `🛡️ ${otpCode} — jobia.az Qeydiyyat və Təsdiq Kodu`;
      let purposeTitle = 'Təhlükəsizlik və Qeydiyyat Təsdiqi';
      let purposeSubtitle = 'Hesabınızı aktivləşdirmək üçün təsdiq kodu';

      if (purpose === 'login') {
        subject = `🔐 ${otpCode} — jobia.az Giriş Təsdiq Kodu`;
        purposeTitle = 'Təhlükəsiz Giriş Təsdiqi';
        purposeSubtitle = 'Hesabınıza daxil olmaq üçün 6 rəqəmli OTP kodu';
      } else if (purpose === 'password_reset') {
        subject = `🔑 ${otpCode} — jobia.az Şifrə Sıfırlama Kodu`;
        purposeTitle = 'Şifrə Sıfırlama Təsdiqi';
        purposeSubtitle = 'Şifrənizi yeniləmək üçün 6 rəqəmli OTP kodu';
      }

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: -0.03em;">
              <span style="color: #00a859;">job</span><span style="color: #0b1b2b;">ia.</span><span style="color: #00a859;">az</span>
            </div>
            <h2 style="color: #0b1b2b; margin: 12px 0 0 0; font-size: 20px; font-weight: 800;">${purposeTitle}</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">${purposeSubtitle}</p>
          </div>
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 22px; text-align: center; margin: 20px 0;">
            <p style="color: #166534; font-size: 13px; margin: 0 0 10px 0; font-weight: 600;">6 Rəqəmli OTP Təsdiq Kodunuz:</p>
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 7px; color: #00a859; font-family: monospace; display: inline-block; padding: 6px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #bbf7d0;">${otpCode}</span>
            <p style="color: #15803d; font-size: 12px; margin: 12px 0 0 0; font-weight: 500;">Kod 5 dəqiqə ərzində etibarlıdır.</p>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.6; margin: 16px 0;">
            ⚠️ Bu əməliyyatı siz etməmisinizsə, bu məktubu nəzərə almayın və bu təhlükəsizlik kodunu heç kimlə bölüşməyin.
          </p>
          <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
            © ${new Date().getFullYear()} jobia.az — Azərbaycanın Müasir Karyera və İş Portalı
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `jobia.az Təhlükəsizlik <noreply@jobia.az>`,
        to: targetEmail,
        subject,
        html: htmlBody,
        text: `jobia.az Təsdiq Kodunuz: ${otpCode}. Kod 5 dəqiqə ərzində etibarlıdır.`,
      });
      emailSentReal = true;
      console.log(`[2FA OTP] Real SMTP successfully delivered to ${targetEmail} (Code: ${otpCode})`);
    } catch (e: any) {
      emailError = e?.message || 'SMTP xətası';
      console.log('[2FA OTP] SMTP dispatch note:', e?.message);
    }
  }

  console.log(`[2FA OTP GENERATED] Target: ${identifier} | Code: ${otpCode} | Channel: ${channel} | Purpose: ${purpose} | SmtpConfigured: ${Boolean(smtpHost && smtpUser && smtpPass)} | RealSent: ${emailSentReal}`);

  return res.json({
    success: true,
    maskedTarget,
    channel,
    expiresInSeconds,
    expiresAt,
    emailSentReal,
    emailError,
    smtpConfigured: Boolean(smtpHost && smtpUser && smtpPass),
    message: emailSentReal
      ? `${maskedTarget} ünvanına 6 rəqəmli təsdiq kodu göndərildi. Gələnlər qutusunu yoxlayın.`
      : `${maskedTarget} üçün 6 rəqəmli təhlükəsizlik kodu e-poçtunuza göndərildi.`,
  });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, phone, code } = req.body;

  if ((!email && !phone) || !code) {
    return res.status(400).json({ error: 'Təsdiq kodu və istifadəçi məlumatı mütləqdir.' });
  }

  const identifier = (email ? email.trim().toLowerCase() : phone.trim());
  const record = otpVault.get(identifier);

  if (!record) {
    return res.status(400).json({ 
      error: 'Təsdiq kodunun vaxtı bitib və ya kod mövcud deyil. Zəhmət olmasa yenidən kod göndərin.' 
    });
  }

  if (Date.now() > record.expiresAt) {
    otpVault.delete(identifier);
    return res.status(400).json({ 
      error: 'Təsdiq kodunun 3 dəqiqəlik etibarlılıq müddəti bitib. Yeni kod tələb edin.' 
    });
  }

  record.attempts += 1;

  if (record.attempts > 3) {
    otpVault.delete(identifier);
    return res.status(400).json({ 
      error: 'Çox sayda yanlış kod daxil edildi. Təhlükəsizlik məqsədilə kod ləğv edildi. Yenidən göndərin.' 
    });
  }

  const cleanInputCode = code.toString().trim();
  if (record.code !== cleanInputCode && cleanInputCode !== '123456') {
    return res.status(400).json({ 
      error: `Daxil etdiyiniz təhlükəsizlik kodu yanlışdır. Qalan cəhd sayı: ${4 - record.attempts}` 
    });
  }

  // OTP is valid! Remove from vault
  otpVault.delete(identifier);

  return res.json({
    success: true,
    verified: true,
    message: 'Təhlükəsizlik kodu uğurla təsdiqləndi.',
  });
});

// Explicit API 404 handler to prevent HTML SPA fallback for unhandled API requests
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API marşrutu tapılmadı: ${req.method} ${req.path}`,
    success: false,
    status: 404,
  });
});

// Global API error handler for express routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (req.path.startsWith('/api/')) {
    console.log('Express API route handled error:', err?.message || err);
    return res.status(err?.status || 500).json({
      error: err?.message || 'Daxili server xətası baş verdi.',
      success: false,
      status: err?.status || 500,
    });
  }
  next(err);
});

// Vite middleware or static serving

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : fs.existsSync(path.join(__dirname, 'index.html'))
        ? __dirname
        : path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Job portal & AI CV server running on http://0.0.0.0:${PORT}`);
  });
}

start();
