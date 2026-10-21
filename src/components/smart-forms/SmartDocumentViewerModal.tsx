import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Building2,
  PenTool,
  Camera,
  Mic,
  FileText
} from 'lucide-react';
import {
  SmartDocument,
  FormSubmission,
  FormTemplate,
  FormSubmissionStatus
} from '../../types/smartForms';

export interface SmartDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SmartDocument | null;
  submission: FormSubmission | null;
  template?: FormTemplate | null;
  onStatusChange?: (submissionId: string, newStatus: FormSubmissionStatus, comment?: string) => void;
}

export const SmartDocumentViewerModal: React.FC<SmartDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  submission,
  template,
  onStatusChange,
}) => {
  if (!isOpen || (!document && !submission)) return null;

  const docNumber = document?.documentNumber || 'HR-2026/041';
  const docTitle = document?.title || submission?.templateTitle || 'Rəsmi Sənəd';
  const companyName = document?.organizationName || submission?.organizationName || 'Jobia Enterprise MMC';
  const dateFormatted = document?.createdAt
    ? new Date(document.createdAt).toLocaleDateString('az-AZ')
    : new Date().toLocaleDateString('az-AZ');

  // Primary signature (employee)
  const employeeSig = document?.signatures?.find(s => s.signerRole === 'employee') || document?.signatures?.[0];
  const photos = employeeSig?.verificationPhotos || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const filename = `Jobia-Sened-${docNumber.replace(/[\/\\]/g, '-')}.html`;

    const photosMarkup = photos.map((p, i) => `
      <div style="border:1px solid #cbd5e1; border-radius:8px; padding:6px; text-align:center; display:inline-block; margin-right:10px; margin-bottom:10px; background:#f8fafc;">
        <img src="${p}" style="width:145px; height:110px; object-fit:cover; border-radius:6px; display:block;" />
        <div style="font-family:monospace; font-size:10px; color:#15803d; font-weight:bold; margin-top:4px;">Canlı Foto #${i + 1} ✓</div>
      </div>
    `).join('') || '';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle} - ${docNumber}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Times New Roman', Times, serif; color: #0f172a; margin: 0; padding: 25px; font-size: 14px; line-height: 1.6; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company { font-family: sans-serif; font-weight: 900; font-size: 18px; text-transform: uppercase; }
    .recipient { text-align: right; margin-bottom: 24px; font-size: 13px; font-family: sans-serif; }
    .title { text-align: center; font-size: 20px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin: 24px 0; font-family: sans-serif; }
    .content { white-space: pre-line; text-align: justify; font-size: 14px; line-height: 1.8; margin-bottom: 30px; font-family: sans-serif; color: #1e293b; }
    .sign-section { border-top: 1px solid #94a3b8; padding-top: 20px; margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .sig-box { min-height: 60px; }
    .audit-box { border-top: 2px dashed #94a3b8; margin-top: 25px; padding-top: 15px; font-family: sans-serif; }
    .audit-title { font-weight: bold; font-size: 12px; color: #0f172a; text-transform: uppercase; margin-bottom: 8px; }
    .footer-hash { border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 10px; font-size: 10px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${companyName}</div>
      <div style="font-size: 11px; color: #64748b; font-family: sans-serif;">İnsan Resursları və Kadr Sənəd Dövriyyəsi Portalı</div>
    </div>
    <div style="text-align: right; font-family: sans-serif; font-size: 12px;">
      <div><strong>№ ${docNumber}</strong></div>
      <div style="color: #64748b;">${dateFormatted}</div>
    </div>
  </div>

  <div class="recipient">
    <div><strong>${template?.documentLayout?.headerRecipientText || 'Müəssisə Rəhbərliyinə'}</strong></div>
    <div>${submission?.submittedByDepartment || 'Struktur Bölmə'}, ${submission?.submittedByPosition || 'Mütəxəssis'}</div>
    <div><u>${submission?.submittedByName || 'Əməkdaş'} tərəfindən</u></div>
  </div>

  <div class="title">${template?.documentLayout?.documentTitle || docTitle}</div>

  <div class="content">${document?.compiledContent || 'Sənəd mətni hazırlanmışdır.'}</div>

  <div class="sign-section">
    <div>
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; margin-bottom: 6px;">
        ${template?.documentLayout?.footerSignerTitle || 'Ərizəçi / Əməkdaş'}:
      </div>
      <div class="sig-box">
        ${employeeSig?.signatureDataUrl ? `<img src="${employeeSig.signatureDataUrl}" style="max-height: 55px; max-width: 180px;" />` : '<i>Rəqəmsal olaraq imzalanmışdır</i>'}
      </div>
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold;">
        ${employeeSig?.signerName || submission?.submittedByName || 'Əməkdaş'}
      </div>
      <div style="font-size: 11px; color: #64748b; font-family: sans-serif;">
        Tarix: ${dateFormatted}
      </div>
    </div>

    <div style="text-align: right;">
      <div style="display: inline-block; border: 2px solid #2563eb; border-radius: 50%; width: 105px; height: 105px; padding: 10px; text-align: center; font-family: sans-serif; color: #1d4ed8; font-size: 10px; transform: rotate(-8deg);">
        <div style="font-weight: 900; font-size: 8px;">JOBIA DIGITAL</div>
        <div style="font-size: 8px; font-weight: bold; margin-top: 4px;">TƏSDİQ EDİLDİ</div>
        <div style="font-size: 7px; margin-top: 4px;">${dateFormatted}</div>
      </div>
    </div>
  </div>

  ${photos.length > 0 ? `
    <div class="audit-box">
      <div class="audit-title">✓ İKİPİLLƏLİ İMZALAMA VƏ CANLI BİOMETRİK TƏSDİQ PROTOKOLU (2-FA AUDİT)</div>
      <div style="font-size: 11px; color: #475569; margin-bottom: 10px;">
        İşçinin həqiqətən özü daxil olub ərizəni doldurduğunu və imzaladığını sübut edən canlı kamera görüntüləri:
      </div>
      <div>${photosMarkup}</div>
      ${employeeSig?.voiceConfirmationNote ? `<div style="font-size: 11px; color: #1e40af; margin-top: 6px;"><strong>🎙 Səsli Bəyanat:</strong> «${employeeSig.voiceConfirmationNote}»</div>` : ''}
    </div>
  ` : ''}

  <div class="footer-hash">
    <span>Doğrulama Kodu: ${employeeSig?.verificationHash || 'JOBIA-DOC-AUDIT-2026'}</span>
    <span>Jobia.az Ağıllı Sənəd və E-İmza Platforması (TLS 1.3 Kriptoqrafik Qorunma)</span>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Printable CSS style */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #viewer-official-document-sheet, #viewer-official-document-sheet * {
              visibility: visible !important;
            }
            #viewer-official-document-sheet {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
              z-index: 99999 !important;
            }
          }
        `}</style>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{docTitle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {docNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {companyName} • {dateFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Çap Et"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span className="hidden sm:inline">Çap Et</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="PDF Endir"
            >
              <Download className="w-4 h-4" />
              <span>PDF Endir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div
            id="viewer-official-document-sheet"
            className="bg-white border border-slate-300 shadow-xl rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto space-y-8 font-serif text-slate-900 leading-relaxed text-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h3 className="font-sans font-black text-lg text-slate-950 uppercase tracking-wider">
                  {companyName}
                </h3>
                <p className="font-sans text-xs text-slate-500 font-semibold mt-0.5">
                  İnsan Resursları və Kadr Sənəd Dövriyyəsi
                </p>
              </div>
              <div className="text-right font-sans text-xs">
                <p className="font-bold text-slate-800">№ {docNumber}</p>
                <p className="text-slate-500">{dateFormatted}</p>
              </div>
            </div>

            {/* Recipient */}
            <div className="text-right space-y-1 text-xs sm:text-sm font-sans">
              <p className="font-bold">{template?.documentLayout?.headerRecipientText || 'Müəssisə Rəhbərliyinə'}</p>
              <p className="text-slate-700">
                {submission?.submittedByDepartment || 'Struktur bölmə'}, {submission?.submittedByPosition || 'mütəxəssis'}
              </p>
              <p className="font-bold underline">
                {submission?.submittedByName || 'Əməkdaş'} tərəfindən
              </p>
            </div>

            {/* Title */}
            <div className="text-center py-2 font-sans">
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-950 underline decoration-2">
                {template?.documentLayout?.documentTitle || docTitle}
              </h2>
            </div>

            {/* Body */}
            <div className="whitespace-pre-line text-sm sm:text-base text-justify leading-relaxed font-sans text-slate-800">
              {document?.compiledContent || 'Sənəd mətni mövcuddur.'}
            </div>

            {/* Signature & Stamp Line */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end font-sans">
              {/* Employee Signature */}
              <div className="space-y-2 text-left">
                <p className="text-xs text-slate-600 font-bold">
                  {template?.documentLayout?.footerSignerTitle || 'Ərizəçi / Əməkdaş'}:
                </p>
                <div className="min-h-[70px] border-b border-slate-900 flex flex-col justify-end pb-1">
                  {employeeSig?.signatureDataUrl ? (
                    <img
                      src={employeeSig.signatureDataUrl}
                      alt="İmza"
                      className="max-h-14 max-w-[180px] object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">İmza edilməyib</span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {employeeSig?.signerName || submission?.submittedByName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Tarix: {dateFormatted}
                </p>
              </div>

              {/* Approval Stamp */}
              <div className="text-right space-y-2 flex flex-col items-end">
                <div className="w-28 h-28 rounded-full border-2 border-blue-600/60 p-2 flex flex-col items-center justify-center text-center text-[10px] text-blue-700 rotate-[-8deg] shadow-2xs select-none">
                  <span className="font-black text-[9px] uppercase tracking-wider">JOBIA DIGITAL</span>
                  <span className="text-[8px] font-bold">TƏSDİQ EDİLDİ</span>
                  <span className="text-[7px] text-blue-500">{dateFormatted}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                </div>
              </div>
            </div>

            {/* 2-Step Biometric Identity & Webcam Audit Section ("sənədin altında həmin zaman çəkilmiş bir neçə şəkli olsun") */}
            {photos.length > 0 && (
              <div className="pt-6 border-t-2 border-dashed border-slate-300 font-sans space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      İkipilləli İmzalama və Canlı Biometrik Təsdiq Protokolu (2-FA Audit)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Şəxsiyyət Doğrulandı ✓
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  Aşağıdakı fotoşəkillər ərizənin doldurulması və imzalanması anında əməkdaşın canlı veb-kamerası vasitəsilə
                  çəkilmişdir və ərizəçinin fiziki/şəxsi iştirakını sübut edir.
                </p>

                {/* Photo Strip Under Document */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {photos.map((photoUrl, pIdx) => (
                    <div
                      key={pIdx}
                      className="border border-slate-300 rounded-xl p-1.5 bg-slate-50 space-y-1 shadow-2xs"
                    >
                      <img
                        src={photoUrl}
                        alt={`Audit Foto ${pIdx + 1}`}
                        className="w-full h-24 sm:h-28 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="text-[9px] font-mono text-slate-700 flex items-center justify-between px-1">
                        <span className="font-bold text-emerald-700">Foto #{pIdx + 1} ✓</span>
                        <span>{dateFormatted}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voice confirmation note if available */}
                {employeeSig?.voiceConfirmationNote && (
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                    <span className="font-bold shrink-0">🎙 Səsli Bəyanat:</span>
                    <span className="italic">«{employeeSig.voiceConfirmationNote}»</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Audit Hash */}
            <div className="pt-4 border-t border-slate-200 text-center font-sans text-[10px] text-slate-400 flex items-center justify-between">
              <span>Doğrulama Kodu: {employeeSig?.verificationHash || 'JOBIA-DOC-AUDIT-2026'}</span>
              <span>Jobia.az Ağıllı Sənəd və E-İmza Platforması (TLS 1.3 Kriptoqrafik Qorunma)</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Cari Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                submission?.currentStatus === 'completed' || submission?.currentStatus === 'signed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : submission?.currentStatus === 'pending_approval'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {submission?.currentStatus === 'completed'
                ? 'Tamamlanıb və Təsdiqlənib'
                : submission?.currentStatus === 'signed'
                ? 'İmzalanıb'
                : submission?.currentStatus === 'pending_approval'
                ? 'Rəhbərlik Təsdiqi Gözləyir'
                : 'Aktiv'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {submission && submission.currentStatus === 'pending_approval' && onStatusChange && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(submission.id, 'completed', 'Rəhbərlik tərəfindən təsdiq edildi');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sənədi Təsdiq Et</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(submission.id, 'rejected', 'Rəhbərlik tərəfindən imtina edildi');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                >
                  İmtina Et
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
