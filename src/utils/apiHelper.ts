/**
 * Safe API request utility to guard against non-JSON responses (HTML error pages / SPA fallbacks)
 * and prevent "Unexpected token '<', "<!doctype "..." JSON syntax errors.
 */

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: SafeFetchOptions
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const { timeoutMs = 60000, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Always inspect raw text first to guard against HTML error pages (502/504, proxy errors, SPA fallbacks)
    const text = await res.text().catch(() => '');
    const trimmed = text.trim();

    // Guard against HTML error pages (e.g. 502/504 Gateway errors, SPA index.html fallbacks)
    if (
      trimmed.startsWith('<') ||
      trimmed.toLowerCase().startsWith('<!doctype') ||
      trimmed.toLowerCase().startsWith('<html')
    ) {
      return {
        ok: false,
        status: res.status,
        error: !res.ok
          ? `Server xətası (HTTP ${res.status}). Xidmət hazırda yenilənir və ya cavab vermir.`
          : 'Server cavabı gözlənilməz formatdadır. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
      };
    }

    if (!trimmed) {
      if (!res.ok) {
        return { ok: false, status: res.status, error: `Server xətası: HTTP ${res.status}` };
      }
      return { ok: true, status: res.status, data: undefined };
    }

    try {
      const data = JSON.parse(text);
      if (!res.ok) {
        const errMsg = data?.error || data?.message || `Server xətası: HTTP ${res.status}`;
        return { ok: false, status: res.status, error: errMsg, data };
      }
      return { ok: true, status: res.status, data };
    } catch {
      return {
        ok: false,
        status: res.status,
        error: 'Məlumat oxunarkən xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      return { ok: false, status: 408, error: 'Sorğu vaxtı bitdi (Request timeout). Zəhmət olmasa yenidən cəhd edin.' };
    }
    const rawMsg = err?.message || '';
    const isNetworkOrLoadFailed = 
      rawMsg.toLowerCase().includes('load failed') || 
      rawMsg.toLowerCase().includes('failed to fetch') ||
      rawMsg.toLowerCase().includes('network error');
    
    return {
      ok: false,
      status: 0,
      error: isNetworkOrLoadFailed 
        ? 'Şəbəkə bağlantısı və ya sorğuda gecikmə oldu. Zəhmət olmasa internet bağlantısını yoxlayın və yenidən cəhd edin.' 
        : rawMsg || 'Şəbəkə xətası baş verdi.',
    };
  }
}
