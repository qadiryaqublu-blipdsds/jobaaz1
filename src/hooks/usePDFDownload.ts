import { useState, useCallback } from 'react';
import { downloadCVAsPDF } from '../utils/pdfExport';

export interface UsePDFDownloadReturn {
  isDownloading: boolean;
  progressPercent: number;
  progressStatus: string;
  showToast: boolean;
  fileName: string;
  downloadPDF: (elementOrId: HTMLElement | string, options?: { fileName?: string }) => Promise<void>;
  dismissToast: () => void;
}

export function usePDFDownload(): UsePDFDownloadReturn {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  const downloadPDF = useCallback(async (
    elementOrId: HTMLElement | string,
    options?: { fileName?: string }
  ) => {
    const rawName = options?.fileName || 'CV_jobia_az.pdf';
    const cleanFileName = rawName.endsWith('.pdf') ? rawName : `${rawName}.pdf`;

    setFileName(cleanFileName);
    setIsDownloading(true);
    setProgressPercent(10);
    setProgressStatus('CV məlumatları oxunur...');
    setShowToast(false);

    try {
      await downloadCVAsPDF(elementOrId, {
        fileName: cleanFileName,
        onProgress: (status, percent) => {
          setProgressStatus(status);
          setProgressPercent(percent);
        },
      });

      // Smooth finish to 100%
      setProgressPercent(100);
      setProgressStatus('Uğurla tamamlandı!');

      // Brief transition delay before showing celebratory toast
      setTimeout(() => {
        setIsDownloading(false);
        setShowToast(true);
      }, 350);
    } catch (err) {
      setIsDownloading(false);
      setProgressPercent(0);
      setProgressStatus('');
      throw err;
    }
  }, []);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    isDownloading,
    progressPercent,
    progressStatus,
    showToast,
    fileName,
    downloadPDF,
    dismissToast,
  };
}
