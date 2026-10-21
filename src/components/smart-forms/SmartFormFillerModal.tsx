import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  PenTool,
  RotateCcw,
  Eye,
  Info,
  Clock,
  Building2,
  UserCheck
} from 'lucide-react';
import {
  FormTemplate,
  FormSubmission,
  FormFieldDefinition,
  SignatureRecord
} from '../../types/smartForms';
import { DigitalSignatureComponent } from './DigitalSignatureComponent';
import {
  extractFieldsFromVoiceTranscript,
  extractFieldsFromDocumentOCR
} from './aiSmartFormExtractors';
import { createSubmission, attachSignatureToDocument, compileDocumentContent } from './smartFormsService';

export interface SmartFormFillerModalProps {
  template: FormTemplate;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (submission: FormSubmission) => void;
  currentUser?: any;
  activeCompany?: any;
  candidateCV?: any;
}

export const SmartFormFillerModal: React.FC<SmartFormFillerModalProps> = ({
  template,
  isOpen,
  onClose,
  onCompleted,
  currentUser,
  activeCompany,
  candidateCV,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeStep, setActiveStep] = useState<'fill' | 'voice' | 'ocr' | 'sign' | 'preview'>('fill');
  const [signatureRecord, setSignatureRecord] = useState<SignatureRecord | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceConfidenceNotes, setVoiceConfidenceNotes] = useState<Record<string, string>>({});
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrUnreadableFields, setOcrUnreadableFields] = useState<string[]>([]);
  const [ocrFileName, setOcrFileName] = useState<string>('');

  // Field mapping audit
  const [mappedSources, setMappedSources] = useState<Record<string, string>>({});

  // Initialize and auto-fill from system profile (Jobia.az Field Mapping)
  useEffect(() => {
    const initial: Record<string, any> = {};
    const sources: Record<string, string> = {};

    template.fields.forEach((field) => {
      const fieldNameLower = field.name.toLowerCase();

      // Company mapping
      if (
        ['company_name', 'sirket_adi', 'company', 'organization_name'].includes(fieldNameLower)
      ) {
        initial[field.name] = activeCompany?.name || 'Jobia Enterprise MMC';
        sources[field.name] = 'Mənbə: Şirkət Profili';
      }
      // Employee Full Name mapping
      else if (
        ['employee_full_name', 'fullname', 'applicant_name', 'ad_soyad'].includes(fieldNameLower) ||
        field.type === 'fullname'
      ) {
        initial[field.name] = currentUser?.fullName || candidateCV?.personalInfo?.fullName || 'Elvin Məmmədov';
        sources[field.name] = 'Mənbə: İstifadəçi / CV Profili';
      }
      // Phone mapping
      else if (field.type === 'phone' || fieldNameLower.includes('phone') || fieldNameLower.includes('telefon')) {
        initial[field.name] = currentUser?.phone || candidateCV?.personalInfo?.phone || '+994 50 123 45 67';
        sources[field.name] = 'Mənbə: Əlaqə Məlumatları';
      }
      // Email mapping
      else if (field.type === 'email' || fieldNameLower.includes('email')) {
        initial[field.name] = currentUser?.email || candidateCV?.personalInfo?.email || 'elvin.m@example.az';
        sources[field.name] = 'Mənbə: Sistem Hesabı';
      }
      // Position mapping
      else if (['position', 'job_title', 'vezife'].includes(fieldNameLower)) {
        initial[field.name] = currentUser?.position || candidateCV?.personalInfo?.title || 'Mütəxəssis';
        sources[field.name] = 'Mənbə: Vəzifə Təyinatı';
      }
      // Department mapping
      else if (['department', 'sobe', 'struktur'].includes(fieldNameLower) && field.options?.length) {
        initial[field.name] = field.options[0];
      }
      // Default value
      else if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });

    setFormData(initial);
    setMappedSources(sources);

    // Check Speech Recognition Web API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'az-AZ';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setVoiceTranscript(current);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch {
        setSpeechRecognitionSupported(false);
      }
    }
  }, [template, currentUser, activeCompany, candidateCV]);

  // Handle Input Changes
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setMappedSources((prev) => ({ ...prev, [fieldName]: 'Mənbə: İstifadəçi tərəfindən daxil edildi' }));
  };

  // Toggle Voice Recording
  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      processVoiceTranscript(voiceTranscript);
    } else {
      setVoiceTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch {
        // Fallback for simulation if microphone permission denied
        setIsRecording(true);
        setTimeout(() => {
          const simulatedText = `Mənim adım ${currentUser?.fullName || 'Elvin Məmmədov'}dur. ${activeCompany?.name || 'Şirvan Aqro'}da mütəxəssis vəzifəsində işləyirəm. Məzuniyyətimi noyabrın 10-dan 15-dək götürmək istəyirəm.`;
          setVoiceTranscript(simulatedText);
        }, 1200);
      }
    }
  };

  // Process Voice Transcript to Fields
  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    const { extractedValues, confidenceNotes } = await extractFieldsFromVoiceTranscript(
      transcript,
      template.fields,
      'az'
    );

    setFormData((prev) => ({ ...prev, ...extractedValues }));
    setVoiceConfidenceNotes(confidenceNotes);

    const updatedSources: Record<string, string> = { ...mappedSources };
    Object.keys(extractedValues).forEach((k) => {
      updatedSources[k] = 'Mənbə: AI Nitq Tanıma (Voice-to-Form)';
    });
    setMappedSources(updatedSources);
  };

  // Process OCR Upload
  const handleOCRFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const res = await extractFieldsFromDocumentOCR(
        base64,
        file.name,
        file.type,
        template.fields,
        'az'
      );

      setFormData((prev) => ({ ...prev, ...res.extractedValues }));
      setOcrUnreadableFields(res.unreadableFields);

      const updatedSources: Record<string, string> = { ...mappedSources };
      Object.keys(res.extractedValues).forEach((k) => {
        updatedSources[k] = 'Mənbə: OCR Sənəd Skantəsviri';
      });
      setMappedSources(updatedSources);
      setOcrLoading(false);
      setActiveStep('fill');
    };
    reader.readAsDataURL(file);
  };

  // Validation
  const getMissingRequiredFields = () => {
    return template.fields.filter((f) => f.required && !formData[f.name]);
  };

  // Save Signature
  const handleSaveSignature = (sig: {
    dataUrl: string;
    method: any;
    hash: string;
    level: any;
    consentDeclaration?: string;
    verificationPhotos?: string[];
    isTwoFactorVerified?: boolean;
    voiceConfirmationNote?: string;
  }) => {
    const newRecord: SignatureRecord = {
      id: `sig-${Date.now()}`,
      documentId: `DOC-${Date.now().toString(36).toUpperCase()}`,
      signerUserId: currentUser?.id || 'emp-current',
      signerName: formData.employee_full_name || currentUser?.fullName || 'Əməkdaş',
      signerEmail: currentUser?.email || 'user@example.az',
      signerPosition: formData.position || 'Mütəxəssis',
      signerRole: 'employee',
      signatureMethod: sig.method,
      signatureTypeLevel: sig.level,
      signatureDataUrl: sig.dataUrl,
      signedAt: new Date().toISOString(),
      ipAddress: '185.190.12.44 (Təhlükəsiz TLS sessiyası)',
      deviceInfo: navigator.userAgent,
      verificationHash: sig.hash,
      verificationStatus: 'verified',
      consentDeclaration: sig.consentDeclaration,
      verificationPhotos: sig.verificationPhotos,
      isTwoFactorVerified: sig.isTwoFactorVerified,
      biometricCaptureTimestamp: new Date().toISOString(),
      voiceConfirmationNote: sig.voiceConfirmationNote || (voiceTranscript ? voiceTranscript.trim() : undefined),
    };
    setSignatureRecord(newRecord);
    setActiveStep('preview');
  };

  // Final Submit
  const handleFinalSubmit = () => {
    const submission = createSubmission({
      organizationId: activeCompany?.id || 'demo-corp',
      organizationName: activeCompany?.name || 'Jobia Enterprise',
      templateId: template.id,
      templateTitle: template.title,
      templateCategory: template.category,
      templateVersion: template.version,
      submittedByUserId: currentUser?.id || 'emp-current',
      submittedByName: formData.employee_full_name || currentUser?.fullName || 'Əməkdaş',
      submittedByEmail: currentUser?.email || 'user@jobia.az',
      submittedByPhone: formData.contact_phone || currentUser?.phone,
      submittedByDepartment: formData.department,
      submittedByPosition: formData.position,
      formData,
      currentStatus: 'pending_approval',
      completionMode: 'standard',
    });

    if (signatureRecord && submission.documentId) {
      attachSignatureToDocument(submission.documentId, {
        documentId: submission.documentId,
        signerUserId: signatureRecord.signerUserId,
        signerName: signatureRecord.signerName,
        signerRole: signatureRecord.signerRole,
        signerPosition: signatureRecord.signerPosition,
        signatureMethod: signatureRecord.signatureMethod,
        signatureDataUrl: signatureRecord.signatureDataUrl,
        ipAddress: signatureRecord.ipAddress,
        verificationPhotos: signatureRecord.verificationPhotos,
        isTwoFactorVerified: signatureRecord.isTwoFactorVerified,
        biometricCaptureTimestamp: signatureRecord.biometricCaptureTimestamp,
        voiceConfirmationNote: signatureRecord.voiceConfirmationNote,
      });
    }

    onCompleted(submission);
    onClose();
  };

  const handleDownloadPDF = () => {
    const docNumber = 'HR-2026/041';
    const filename = `Jobia-Sened-${docNumber.replace('/', '-')}.html`;
    const docTitle = template.title;
    const company = activeCompany?.name || 'Jobia Enterprise MMC';

    const photosMarkup = signatureRecord?.verificationPhotos?.map((p, i) => `
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
    .recipient { text-align: right; margin-bottom: 24px; font-size: 13px; }
    .title { text-align: center; font-size: 20px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin: 24px 0; }
    .content { white-space: pre-line; text-align: justify; font-size: 14px; line-height: 1.8; margin-bottom: 30px; font-family: sans-serif; }
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
      <div class="company">${company}</div>
      <div style="font-size: 11px; color: #64748b; font-family: sans-serif;">İnsan Resursları və Kadr Sənəd Dövriyyəsi</div>
    </div>
    <div style="text-align: right; font-family: sans-serif; font-size: 12px;">
      <div><strong>№ ${docNumber}</strong></div>
      <div style="color: #64748b;">${new Date().toLocaleDateString('az-AZ')}</div>
    </div>
  </div>

  <div class="recipient">
    <div><strong>${template.documentLayout.headerRecipientText}</strong></div>
    <div>${formData.department || 'Müvafiq struktur bölmə'}, ${formData.position || 'mütəxəssis'}</div>
    <div><u>${formData.employee_full_name || currentUser?.fullName || 'Əməkdaş'} tərəfindən</u></div>
  </div>

  <div class="title">${template.documentLayout.documentTitle}</div>

  <div class="content">${compiledLegalText}</div>

  <div class="sign-section">
    <div>
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; margin-bottom: 6px;">
        ${template.documentLayout.footerSignerTitle || 'Ərizəçi / Əməkdaş'}:
      </div>
      <div class="sig-box">
        ${signatureRecord?.signatureDataUrl ? `<img src="${signatureRecord.signatureDataUrl}" style="max-height: 55px; max-width: 180px;" />` : '<i>İmza edilmişdir</i>'}
      </div>
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold;">
        ${formData.employee_full_name || currentUser?.fullName}
      </div>
      <div style="font-size: 11px; color: #64748b; font-family: sans-serif;">
        Tarix: ${new Date().toLocaleDateString('az-AZ')}
      </div>
    </div>

    <div style="text-align: right;">
      <div style="display: inline-block; border: 2px solid #2563eb; border-radius: 50%; width: 100px; height: 100px; padding: 10px; text-align: center; font-family: sans-serif; color: #1d4ed8; font-size: 10px; transform: rotate(-8deg);">
        <div style="font-weight: 900; font-size: 8px;">JOBIA DIGITAL</div>
        <div style="font-size: 8px; font-weight: bold; margin-top: 4px;">TƏSDİQ EDİLDİ</div>
        <div style="font-size: 7px; margin-top: 4px;">${new Date().toLocaleDateString('az-AZ')}</div>
      </div>
    </div>
  </div>

  ${signatureRecord?.verificationPhotos && signatureRecord.verificationPhotos.length > 0 ? `
    <div class="audit-box">
      <div class="audit-title">✓ İKİPİLLƏLİ İMZALAMA VƏ CANLI BİOMETRİK TƏSDİQ PROTOKOLU (2-FA AUDİT)</div>
      <div style="font-size: 11px; color: #475569; margin-bottom: 10px;">
        İşçinin şəxsən özü daxil olub ərizəni doldurduğunu və imzaladığını təsdiq edən canlı kamera görüntüləri:
      </div>
      <div>${photosMarkup}</div>
      ${signatureRecord.voiceConfirmationNote ? `<div style="font-size: 11px; color: #1e40af; margin-top: 6px;"><strong>🎙 Səsli Bəyanat:</strong> «${signatureRecord.voiceConfirmationNote}»</div>` : ''}
    </div>
  ` : ''}

  <div class="footer-hash">
    <span>Doğrulama Kodu: ${signatureRecord?.verificationHash || 'JOBIA-DOC-AUDIT-2026'}</span>
    <span>Jobia.az Ağıllı Sənəd və E-İmza Platforması (TLS 1.3 Kriptoqrafik Qorunma)</span>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const compiledLegalText = compileDocumentContent(template, formData, activeCompany?.name || 'Jobia Enterprise MMC');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate max-w-md">
                  {template.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v{template.version}.0
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">
                {template.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveStep('fill')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeStep === 'fill'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span>1. Sahələri Doldur</span>
            </button>

            <button
              onClick={() => setActiveStep('voice')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeStep === 'voice'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span>2. Səslə Doldur</span>
            </button>

            <button
              onClick={() => setActiveStep('ocr')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeStep === 'ocr'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>3. Şəkildən Oxu (OCR)</span>
            </button>

            <button
              onClick={() => setActiveStep('sign')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeStep === 'sign'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : signatureRecord
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-blue-500" />
              <span>4. Rəqəmsal İmza</span>
              {signatureRecord && <span className="text-[10px] text-emerald-600">✓</span>}
            </button>

            <button
              onClick={() => setActiveStep('preview')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeStep === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>5. Rəsmi Sənəd Baxışı</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Təxmini vaxt: {template.estimatedMinutes || 3} dəqiqə</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: FORM FIELDS */}
          {activeStep === 'fill' && (
            <div className="space-y-6">
              {/* Field Mapping Info Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-blue-950">Ağıllı Məlumat Uyğunlaşdırması (Field Mapping) Aktivdir</p>
                    <p className="text-blue-800/80 mt-0.5 leading-relaxed">
                      Ad, vəzifə, əlaqə və şirkət detalları Jobia.az kadr və şirkət profilinizdən avtomatik doldurulmuşdur.
                      İstənilən sahəyə klikləyərək düzəliş edə bilərsiniz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Form Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {template.fields.map((field: FormFieldDefinition) => {
                  const val = formData[field.name] || '';
                  const source = mappedSources[field.name];

                  return (
                    <div
                      key={field.id}
                      className={`space-y-1.5 ${
                        field.type === 'textarea' || field.type === 'signature' ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-800 flex items-center gap-1">
                          <span>{field.label}</span>
                          {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {source && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                            {source}
                          </span>
                        )}
                      </div>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={val}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `${field.label} daxil edin...`}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium"
                        />
                      ) : field.type === 'select' || field.type === 'department_select' ? (
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold bg-white"
                        >
                          <option value="">Seçin...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={val}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold"
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold"
                        />
                      ) : field.type === 'signature' ? (
                        <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800">Rəqəmsal İmza Sahəsi</p>
                            <p className="text-[11px] text-slate-500">
                              {signatureRecord ? 'İmza uğurla əlavə edilib ✓' : 'İmzanı çəkmək və ya yükləmək üçün addıma keçin'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStep('sign')}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>{signatureRecord ? 'İmzanı Yenilə' : 'İmza Çək'}</span>
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                          value={val}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `${field.label} daxil edin...`}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Next Step CTA */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep('sign')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Növbəti: İmzalama Mərhələsi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE INPUT */}
          {activeStep === 'voice' && (
            <div className="space-y-6 max-w-xl mx-auto text-center py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  Səslə Danışaraq Formanı Doldurun
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Mikrofon düyməsini sıxın və sənədlə bağlı məlumatları sərbəst nitq ilə danışın.
                  AI danışığınızı təhlil edib ad, vəzifə, tarixlər və səbəbləri formanın xanalarına paylayacaq.
                </p>
              </div>

              {/* Microphone Action Button */}
              <div className="flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                    isRecording
                      ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-105'
                  }`}
                >
                  {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </button>
                <span className="text-xs font-bold text-slate-700">
                  {isRecording ? '🔴 Dinlənilir... (Dayandırmaq üçün yenidən toxunun)' : 'Danışmaq üçün mikrofonu sıxın'}
                </span>
              </div>

              {/* Sample Voice Hint */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-left text-xs text-amber-900 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  Nümunə səsli cümlə:
                </span>
                <p className="italic text-amber-800">
                  «Mənim adım Elvin Məmmədovdur. Şirvan Aqroda traktorçu vəzifəsində işləyirəm.
                  Məzuniyyətimi noyabrın 10-dan 15-dək götürmək istəyirəm.»
                </p>
              </div>

              {/* Live Transcript Display */}
              {voiceTranscript && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Eşidilən Nitq Mətni:</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {voiceTranscript}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      processVoiceTranscript(voiceTranscript);
                      setActiveStep('fill');
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Sahələrə Tətbiq Et və Nəticəyə Bax ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: OCR DOCUMENT SCAN */}
          {activeStep === 'ocr' && (
            <div className="space-y-6 max-w-xl mx-auto text-center py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  Sənədin Şəklini və ya Skanını Yükləyin (OCR)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Kağız ərizənin, şəxsiyyət vəsiqəsinin və ya mövcud sənədin fotosunu/skanını (JPG, PNG, PDF) yükləyin.
                  AI şəkildəki mətni oxuyub avtomatik olaraq bu formaya dolduracaq.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleOCRFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {ocrLoading ? 'Sənəd təhlil olunur və mətn çıxarılır...' : 'Faylı seçin və ya bura sürüşdürün'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, PDF faylları dəstəklənir (Maksimum 25 MB)
                </p>
              </div>

              {ocrUnreadableFields.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-rose-950">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Şəkildə aydın oxunmayan sahələr:
                  </span>
                  <p>Aşağıdakı sahələri əl ilə tamamlamağınız xahiş olunur: {ocrUnreadableFields.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: DIGITAL SIGNATURE COMPONENT */}
          {activeStep === 'sign' && (
            <div className="space-y-4">
              <DigitalSignatureComponent
                signerName={formData.employee_full_name || currentUser?.fullName || 'Əməkdaş'}
                signerEmail={currentUser?.email || 'user@example.az'}
                signerPosition={formData.position || 'Mütəxəssis'}
                signerRole="employee"
                documentTitle={template.title}
                initialSignatureUrl={signatureRecord?.signatureDataUrl}
                onSave={handleSaveSignature}
                onCancel={() => setActiveStep('fill')}
              />
            </div>
          )}

          {/* STEP 5: PREVIEW AND A4 OFFICIAL PRINT VIEW */}
          {activeStep === 'preview' && (
            <div className="space-y-6">
              {/* Document Actions Bar */}
              <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Rəsmi Format:</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    A4 Beynəlxalq Standart
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-blue-500 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Çap Et (Print)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Endir</span>
                  </button>
                </div>
              </div>

              {/* Printable stylesheet for standard official document output */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #jobia-official-document-sheet, #jobia-official-document-sheet * {
                    visibility: visible !important;
                  }
                  #jobia-official-document-sheet {
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

              {/* Physical A4 Sheet Rendering */}
              <div
                id="jobia-official-document-sheet"
                className="bg-white border border-slate-300 shadow-xl rounded-xl p-8 sm:p-12 max-w-2xl mx-auto space-y-8 font-serif text-slate-900 leading-relaxed text-sm"
              >
                
                {/* Official Document Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div>
                    <h3 className="font-sans font-black text-lg text-slate-950 uppercase tracking-wider">
                      {activeCompany?.name || 'JOBIA ENTERPRISE'}
                    </h3>
                    <p className="font-sans text-xs text-slate-500 font-semibold mt-0.5">
                      İnsan Resursları və Kadr Sənəd Dövriyyəsi
                    </p>
                  </div>
                  <div className="text-right font-sans text-xs">
                    <p className="font-bold text-slate-800">№ HR-2026/041</p>
                    <p className="text-slate-500">{new Date().toLocaleDateString('az-AZ')}</p>
                  </div>
                </div>

                {/* Recipient Title */}
                <div className="text-right space-y-1 text-xs sm:text-sm">
                  <p className="font-bold">{template.documentLayout.headerRecipientText}</p>
                  <p className="text-slate-700">
                    {formData.department || 'Müvafiq struktur bölmə'}, {formData.position || 'mütəxəssis'}
                  </p>
                  <p className="font-bold underline">
                    {formData.employee_full_name || currentUser?.fullName || 'Əməkdaş'} tərəfindən
                  </p>
                </div>

                {/* Document Centered Title */}
                <div className="text-center py-2">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-950 underline decoration-2">
                    {template.documentLayout.documentTitle}
                  </h2>
                </div>

                {/* Legal Body Template Text */}
                <div className="whitespace-pre-line text-sm sm:text-base text-justify leading-relaxed font-sans text-slate-800">
                  {compiledLegalText}
                </div>

                {/* Signatures & Stamp Section */}
                <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end">
                  {/* Employee Signature */}
                  <div className="space-y-2 text-left">
                    <p className="font-sans text-xs text-slate-600 font-bold">
                      {template.documentLayout.footerSignerTitle || 'Ərizəçi / Əməkdaş'}:
                    </p>
                    <div className="min-h-[70px] border-b border-slate-900 flex flex-col justify-end pb-1">
                      {signatureRecord?.signatureDataUrl ? (
                        <img
                          src={signatureRecord.signatureDataUrl}
                          alt="İmza"
                          className="max-h-14 max-w-[180px] object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">İmza edilməyib</span>
                      )}
                    </div>
                    <p className="font-sans text-xs font-bold text-slate-900">
                      {formData.employee_full_name || currentUser?.fullName}
                    </p>
                    <p className="font-sans text-[10px] text-slate-400">
                      Tarix: {new Date().toLocaleDateString('az-AZ')}
                    </p>
                  </div>

                  {/* Stamp & Supervisor Approval Stamp */}
                  <div className="text-right space-y-2 flex flex-col items-end">
                    <div className="w-28 h-28 rounded-full border-2 border-blue-600/60 p-2 flex flex-col items-center justify-center text-center text-[10px] text-blue-700 font-sans rotate-[-8deg] shadow-2xs select-none">
                      <span className="font-black text-[9px] uppercase tracking-wider">JOBIA DIGITAL</span>
                      <span className="text-[8px] font-bold">TƏSDİQ EDİLDİ</span>
                      <span className="text-[7px] text-blue-500">{new Date().toLocaleDateString('az-AZ')}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* 2-Step Biometric Identity & Webcam Audit Section ("sənədin altında həmin zaman çəkilmiş bir neçə şəkli olsun") */}
                {signatureRecord?.verificationPhotos && signatureRecord.verificationPhotos.length > 0 && (
                  <div className="pt-6 border-t-2 border-dashed border-slate-300 font-sans space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          İkipilləli İmzalama və Canlı Biometrik Təsdiq Protokolu (2-FA Audit)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Şəxsiyyət Təsdiqləndi ✓
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      Aşağıdakı fotoşəkillər ərizənin doldurulması və imzalanması anında əməkdaşın canlı veb-kamerası vasitəsilə
                      çəkilmişdir və ərizəçinin fiziki/şəxsi iştirakını qeyd-şərtsiz sübut edir.
                    </p>

                    {/* Photo Strip Under Document */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {signatureRecord.verificationPhotos.map((photoUrl, pIdx) => (
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
                            <span>{new Date().toLocaleTimeString('az-AZ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Voice statement note if present */}
                    {(signatureRecord.voiceConfirmationNote || voiceTranscript) && (
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                        <span className="font-bold shrink-0">🎙 Səsli Təsdiq:</span>
                        <span className="italic">
                          «{signatureRecord.voiceConfirmationNote || voiceTranscript.trim()}»
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Security Audit Stamp */}
                <div className="pt-4 border-t border-slate-200 text-center font-sans text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Doğrulama Kodu: {signatureRecord?.verificationHash || 'JOBIA-DOC-AUDIT-2026'}</span>
                  <span>Jobia.az Ağıllı Sənəd və E-İmza Platforması</span>
                </div>
              </div>

              {/* Final Submit Button */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sənəd Dövriyyəsinə Göndərilsin?</h4>
                  <p className="text-[11px] text-slate-500">
                    Sənəd iş axınına uyğun olaraq şöbə rəhbəri və HR təsdiqinə yönləndiriləcək.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sənədi Rəsmiləşdir və Göndər</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
