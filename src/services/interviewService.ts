import { ScheduledInterview, SmtpConfigStatus, EmailHistoryItem } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

const STORAGE_KEY = 'jobia_scheduled_interviews';

function getLocalInterviews(): ScheduledInterview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalInterviews(list: ScheduledInterview[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save local interviews:', err);
  }
}

/**
 * Fetch all scheduled interviews, optionally filtered by company ID.
 */
export async function fetchScheduledInterviews(companyId?: string): Promise<ScheduledInterview[]> {
  try {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    const res = await safeFetchJson<{ success: boolean; interviews: ScheduledInterview[] }>(`/api/interviews${query}`);

    if (res.ok && res.data?.interviews) {
      saveLocalInterviews(res.data.interviews);
      return res.data.interviews;
    }
  } catch (err) {
    console.warn('API fetch interviews note:', err);
  }

  // Fallback to local storage if API is offline
  const local = getLocalInterviews();
  if (companyId && companyId !== 'all') {
    return local.filter((i) => i.companyId === companyId);
  }
  return local;
}

/**
 * Schedule a new interview or update an existing one.
 */
export async function scheduleInterview(
  payload: Partial<ScheduledInterview>
): Promise<{ success: boolean; interview?: ScheduledInterview; error?: string }> {
  try {
    const res = await safeFetchJson<{ success: boolean; interview: ScheduledInterview; error?: string }>(
      '/api/interviews/schedule',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok && res.data?.interview) {
      // Update local storage cache
      const list = getLocalInterviews();
      const idx = list.findIndex((i) => i.id === res.data.interview.id);
      if (idx >= 0) {
        list[idx] = res.data.interview;
      } else {
        list.unshift(res.data.interview);
      }
      saveLocalInterviews(list);

      return { success: true, interview: res.data.interview };
    }
    return { success: false, error: res.data?.error || res.error || 'Müsahibə təyin edilə bilmədi' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Şəbəkə xətası' };
  }
}

/**
 * Manually trigger or send interview reminder email via existing SMTP configuration.
 */
export async function sendInterviewReminder(
  interviewId: string
): Promise<{ success: boolean; result?: any; interview?: ScheduledInterview; error?: string }> {
  try {
    const res = await safeFetchJson<{ success: boolean; result: any; interview: ScheduledInterview; error?: string }>(
      `/api/interviews/${interviewId}/send-reminder`,
      {
        method: 'POST',
      }
    );

    if (res.ok && res.data?.interview) {
      const list = getLocalInterviews();
      const idx = list.findIndex((i) => i.id === interviewId);
      if (idx >= 0) {
        list[idx] = res.data.interview;
        saveLocalInterviews(list);
      }
      return { success: true, result: res.data.result, interview: res.data.interview };
    }
    return { success: false, error: res.data?.error || res.error || 'Xatırlatma göndərilə bilmədi' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Xatırlatma xətası' };
  }
}

/**
 * Toggle 24-hour automated reminder configuration.
 */
export async function toggleAutoReminder(
  interviewId: string
): Promise<{ success: boolean; interview?: ScheduledInterview; error?: string }> {
  try {
    const res = await safeFetchJson<{ success: boolean; interview: ScheduledInterview; error?: string }>(
      `/api/interviews/${interviewId}/toggle-auto-reminder`,
      {
        method: 'POST',
      }
    );

    if (res.ok && res.data?.interview) {
      const list = getLocalInterviews();
      const idx = list.findIndex((i) => i.id === interviewId);
      if (idx >= 0) {
        list[idx] = res.data.interview;
        saveLocalInterviews(list);
      }
      return { success: true, interview: res.data.interview };
    }
    return { success: false, error: res.data?.error || res.error };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Cancel or delete an interview.
 */
export async function deleteInterview(interviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await safeFetchJson<{ success: boolean; error?: string }>(`/api/interviews/${interviewId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      const list = getLocalInterviews().filter((i) => i.id !== interviewId);
      saveLocalInterviews(list);
      return { success: true };
    }
    return { success: false, error: res.data?.error || res.error };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Manually trigger the automated 24-hour reminder scan and email dispatch.
 */
export async function trigger24hReminders(): Promise<{
  success: boolean;
  triggeredCount: number;
  checkedTotal: number;
  triggeredResults?: any[];
  error?: string;
}> {
  try {
    const res = await safeFetchJson<{
      success: boolean;
      triggeredCount: number;
      checkedTotal: number;
      triggeredResults?: any[];
      error?: string;
    }>('/api/interviews/trigger-24h-reminders', {
      method: 'POST',
    });

    if (res.ok && res.data) {
      return res.data;
    }
    return { success: false, triggeredCount: 0, checkedTotal: 0, error: res.data?.error || res.error };
  } catch (err: any) {
    return { success: false, triggeredCount: 0, checkedTotal: 0, error: err?.message };
  }
}

/**
 * Fetch SMTP server configuration status.
 */
export async function fetchSmtpStatus(): Promise<SmtpConfigStatus> {
  try {
    const res = await safeFetchJson<SmtpConfigStatus>('/api/email/smtp-status');
    if (res.ok && res.data) {
      return res.data;
    }
  } catch {
    // fallback
  }

  return {
    configured: false,
    host: '',
    port: 587,
    from: 'jobia.az <noreply@jobia.az>',
    secure: false,
    mode: 'simulation',
  };
}

export interface EmailHistoryResponse {
  success: boolean;
  emailLogs: EmailHistoryItem[];
  totalCount: number;
  stats: {
    totalSent: number;
    deliveredCount: number;
    failedCount: number;
    automated24hCount: number;
    manualCount: number;
  };
  error?: string;
}

/**
 * Fetch automated interview reminder email history for recruiters.
 */
export async function fetchEmailHistory(params?: {
  companyId?: string;
  status?: string;
  search?: string;
}): Promise<EmailHistoryResponse> {
  try {
    const q = new URLSearchParams();
    if (params?.companyId && params.companyId !== 'all') {
      q.append('companyId', params.companyId);
    }
    if (params?.status && params.status !== 'all') {
      q.append('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      q.append('search', params.search.trim());
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    const res = await safeFetchJson<EmailHistoryResponse>(`/api/interviews/email-history${queryStr}`);
    if (res.ok && res.data) {
      return res.data;
    }
    return {
      success: false,
      emailLogs: [],
      totalCount: 0,
      stats: { totalSent: 0, deliveredCount: 0, failedCount: 0, automated24hCount: 0, manualCount: 0 },
      error: res.data?.error || res.error || 'E-poçt tarixçəsi yüklənə bilmədi',
    };
  } catch (err: any) {
    return {
      success: false,
      emailLogs: [],
      totalCount: 0,
      stats: { totalSent: 0, deliveredCount: 0, failedCount: 0, automated24hCount: 0, manualCount: 0 },
      error: err?.message || 'Şəbəkə xətası',
    };
  }
}

/**
 * Resend an interview reminder email from history.
 */
export async function resendInterviewReminderEmail(logId: string): Promise<{
  success: boolean;
  result?: any;
  newLog?: EmailHistoryItem;
  error?: string;
}> {
  try {
    const res = await safeFetchJson<{ success: boolean; result?: any; newLog?: EmailHistoryItem; error?: string }>(
      `/api/interviews/email-history/resend/${encodeURIComponent(logId)}`,
      { method: 'POST' }
    );
    if (res.ok && res.data) {
      return res.data;
    }
    return { success: false, error: res.data?.error || res.error || 'Yenidən göndəriş xətası' };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Send a test reminder email to verify SMTP delivery.
 */
export async function sendTestReminderEmail(payload: {
  recipientEmail: string;
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
  companyId?: string;
}): Promise<{
  success: boolean;
  result?: any;
  log?: EmailHistoryItem;
  error?: string;
}> {
  try {
    const res = await safeFetchJson<{ success: boolean; result?: any; log?: EmailHistoryItem; error?: string }>(
      '/api/interviews/email-history/test-send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok && res.data) {
      return res.data;
    }
    return { success: false, error: res.data?.error || res.error || 'Sınaq məktubu göndərilə bilmədi' };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete an individual email history log.
 */
export async function deleteEmailHistoryLog(logId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await safeFetchJson<{ success: boolean; error?: string }>(
      `/api/interviews/email-history/${encodeURIComponent(logId)}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: res.data?.error || res.error };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

