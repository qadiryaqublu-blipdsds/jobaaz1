/**
 * Utility functions for reading and parsing uploaded CV documents
 * (PDF, DOCX, TXT, Images) on the client side.
 */

export interface UploadedFileInfo {
  file: File;
  fileName: string;
  fileSizeFormatted: string;
  fileType: string;
  base64Data?: string;
  extractedText?: string;
  wordCount?: number;
  previewUrl?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts readable text from PDF and DOCX binary buffers without heavy external libraries.
 */
export async function extractTextFromDocument(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  // 1. Plain Text, Markdown, CSV, HTML, RTF
  if (
    fileType.includes('text') ||
    fileType.includes('csv') ||
    fileType.includes('rtf') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.rtf')
  ) {
    const raw = await readFileAsText(file);
    // Clean RTF tags if present
    if (fileName.endsWith('.rtf') || fileType.includes('rtf')) {
      return raw.replace(/\\par[d]?/g, '\n').replace(/\\[a-zA-Z0-9\-]+/g, ' ').replace(/[{}]/g, '').trim();
    }
    return raw.trim();
  }

  // 2. DOCX file (ZIP archive containing word/document.xml)
  if (fileName.endsWith('.docx') || fileType.includes('wordprocessingml')) {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawBinaryString = decoder.decode(new Uint8Array(buffer));

      // Extract all <w:t> text nodes from document.xml inside the zip stream
      const textMatches = rawBinaryString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches && textMatches.length > 0) {
        const extracted = textMatches
          .map((tag) => tag.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
          .join(' ');
        if (extracted.length > 50) {
          return extracted.replace(/\s+/g, ' ').trim();
        }
      }
    } catch {
      // DOCX xml stream read error - proceed to fallbacks
    }
  }

  // 3. Legacy Word .doc file (OLE2 binary format)
  if (fileName.endsWith('.doc') || fileType === 'application/msword') {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const uint8 = new Uint8Array(buffer);
      // Try UTF-16LE decode (standard for Word 97-2003 text streams)
      const utf16Decoder = new TextDecoder('utf-16le', { fatal: false });
      const utf16Str = utf16Decoder.decode(uint8);
      const utf16Matches = utf16Str.match(/[\p{L}\p{N}\s.,@/:;()\-+–—]{4,}/gu) || [];
      const utf16Extracted = utf16Matches.map((s) => s.trim()).filter((s) => s.length >= 4 && !s.includes('\u0000')).join(' ');

      // Try UTF-8 decode
      const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
      const utf8Str = utf8Decoder.decode(uint8);
      const utf8Matches = utf8Str.match(/[\p{L}\p{N}\s.,@/:;()\-+–—]{4,}/gu) || [];
      const utf8Extracted = utf8Matches.map((s) => s.trim()).filter((s) => s.length >= 4).join(' ');

      const chosen = utf16Extracted.length > utf8Extracted.length ? utf16Extracted : utf8Extracted;
      if (chosen.length > 30) {
        return chosen.replace(/\s+/g, ' ').trim();
      }
    } catch {
      // Fallback
    }
  }

  // 4. PDF file text extraction
  if (fileName.endsWith('.pdf') || fileType.includes('pdf')) {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const uint8 = new Uint8Array(buffer);
      const decoder = new TextDecoder('latin1');
      const pdfString = decoder.decode(uint8);

      // Extract text objects between BT (Begin Text) and ET (End Text) or text operators Tj / TJ
      const extractedChunks: string[] = [];

      // Regex to find parenthesized strings in text blocks: (Some Text) Tj or [(Some) 12 (Text)] TJ
      const textMatches = pdfString.match(/\(([^()]{2,150})\)\s*T[jd]/g) || [];
      for (const match of textMatches) {
        const clean = match.replace(/^.*?\(/, '').replace(/\)\s*T[jd]$/, '').trim();
        if (clean.length > 1 && !/^[\x00-\x1F]+$/.test(clean)) {
          extractedChunks.push(clean);
        }
      }

      // If textMatches gave too few results, extract general readable strings
      if (extractedChunks.length < 15) {
        const generalMatches: string[] = pdfString.match(/[a-zA-Z0-9əƏıIöÖüÜçÇşŞğĞ@.\-+/:, ]{4,100}/g) || [];
        const meaningful = generalMatches.filter((s: string) => {
          const trimmed = s.trim();
          return (
            trimmed.length >= 4 &&
            !trimmed.startsWith('/Font') &&
            !trimmed.startsWith('/Type') &&
            !trimmed.startsWith('/Subtype') &&
            !trimmed.startsWith('endobj') &&
            !trimmed.startsWith('stream') &&
            !trimmed.startsWith('xref')
          );
        });
        if (meaningful.length > extractedChunks.length) {
          return meaningful.slice(0, 500).join(' ').replace(/\s+/g, ' ').trim();
        }
      }

      if (extractedChunks.length > 0) {
        return extractedChunks.join(' ').replace(/\s+/g, ' ').trim();
      }
    } catch {
      // PDF client stream parse fallback
    }
  }

  return '';
}

export async function processUploadedCVFile(file: File): Promise<UploadedFileInfo> {
  const fileType = file.type || '';
  const fileName = file.name;
  const fileSizeFormatted = formatFileSize(file.size);

  let base64Data: string | undefined;
  let extractedText: string | undefined;
  let previewUrl: string | undefined;

  // Extract text from document
  try {
    extractedText = await extractTextFromDocument(file);
  } catch {
    // Non-critical text extraction fallback
  }

  // Generate Base64 for PDF and Images for multimodal AI & transmission
  try {
    base64Data = await readFileAsBase64(file);
    if (fileType.startsWith('image/')) {
      previewUrl = base64Data;
    }
  } catch {
    // Non-critical Base64 encoding fallback
  }

  const wordCount = extractedText && extractedText.length > 0
    ? extractedText.split(/\s+/).filter(Boolean).length
    : undefined;

  return {
    file,
    fileName,
    fileSizeFormatted,
    fileType: fileType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
    base64Data,
    extractedText,
    wordCount,
    previewUrl,
  };
}

