import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Globe2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Code,
  ShieldCheck,
  CheckCircle2,
  Building,
  Clock,
  RotateCcw
} from 'lucide-react';
import { SmartCandidate, CandidateMatchResult } from '../../../types';

interface PhysicalCVViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: SmartCandidate | null;
  matchResult?: CandidateMatchResult | null;
}

export const PhysicalCVViewerModal: React.FC<PhysicalCVViewerModalProps> = ({
  isOpen,
  onClose,
  candidate,
  matchResult,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'original' | 'a4-document'>('a4-document');
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync viewMode whenever candidate changes
  useEffect(() => {
    if (candidate) {
      const hasFile = Boolean(
        candidate.fileDataUrl &&
        (candidate.fileDataUrl.startsWith('data:') || candidate.fileDataUrl.startsWith('blob:') || candidate.fileDataUrl.startsWith('http'))
      );
      const isPdfFormat = Boolean(
        candidate.fileMimeType === 'application/pdf' ||
        candidate.fileName?.toLowerCase().endsWith('.pdf') ||
        candidate.fileDataUrl?.startsWith('data:application/pdf')
      );
      const isImgFormat = Boolean(
        candidate.fileMimeType?.startsWith('image/') ||
        candidate.fileName?.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/) ||
        candidate.fileDataUrl?.startsWith('data:image/')
      );

      if (hasFile && (isPdfFormat || isImgFormat)) {
        setViewMode('original');
      } else {
        setViewMode('a4-document');
      }
      setZoomLevel(100);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const hasOriginalUploadedFile = Boolean(
    candidate.fileDataUrl &&
    (candidate.fileDataUrl.startsWith('data:') || candidate.fileDataUrl.startsWith('blob:') || candidate.fileDataUrl.startsWith('http'))
  );

  const isPdf = Boolean(
    candidate.fileMimeType === 'application/pdf' ||
    candidate.fileName?.toLowerCase().endsWith('.pdf') ||
    candidate.fileDataUrl?.startsWith('data:application/pdf')
  );

  const isImage = Boolean(
    candidate.fileMimeType?.startsWith('image/') ||
    candidate.fileName?.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/) ||
    candidate.fileDataUrl?.startsWith('data:image/')
  );

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = () => {
    if (candidate.fileDataUrl) {
      const a = document.createElement('a');
      a.href = candidate.fileDataUrl;
      a.download = candidate.fileName || candidate.originalFileName || `${candidate.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none border-none'
            : 'w-full max-w-5xl max-h-[94vh] h-[92vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 text-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {candidate.fullName} — Fiziki CV Sənədi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {candidate.jobTitle}
                </span>
                {candidate.careerLevel && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {candidate.careerLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5">
                <span>Fayl: <strong className="text-slate-700">{candidate.fileName || 'Rəsmi_CV_Sənədi.pdf'}</strong></span>
                {candidate.fileSize && (
                  <span>• {(candidate.fileSize / 1024).toFixed(1)} KB</span>
                )}
                {candidate.aiAnalyzed && (
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    AI Təsdiqli
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            {hasOriginalUploadedFile && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'original'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Orijinal Fayl ({isPdf ? 'PDF' : isImage ? 'Şəkil' : 'Sənəd'})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('a4-document')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'a4-document'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A4 Fiziki Sənəd
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            {viewMode === 'a4-document' && (
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Uzaqlaşdır"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="100% miqyas"
                  className="px-2 py-1 font-mono text-[11px] text-slate-700 hover:text-slate-900 font-bold cursor-pointer"
                >
                  {zoomLevel}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Yaxınlaşdır"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              title="Sənədi Çap Et"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Çap Et</span>
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownloadFile}
              title="Faylı Endir"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Faylı Endir</span>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? 'Tam Ekrandan Çıx' : 'Tam Ekran'}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="Bağla"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer Area */}
        <div className="flex-1 bg-slate-100/70 overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
          {/* VIEW 1: ORIGINAL UPLOADED PDF / IMAGE */}
          {viewMode === 'original' && hasOriginalUploadedFile ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {isPdf ? (
                <div className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-white shadow-xl border border-slate-200">
                  <iframe
                    src={candidate.fileDataUrl}
                    className="w-full h-full min-h-[700px] border-0"
                    title={`Fiziki CV PDF - ${candidate.fullName}`}
                  />
                </div>
              ) : isImage ? (
                <div className="max-w-4xl max-h-[82vh] overflow-auto rounded-xl bg-white p-2 shadow-xl border border-slate-200 flex items-center justify-center">
                  <img
                    src={candidate.fileDataUrl}
                    alt={`${candidate.fullName} CV`}
                    className="max-w-full max-h-[78vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="max-w-2xl p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-700 space-y-4 shadow-sm">
                  <FileText className="w-16 h-16 text-blue-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">
                    {candidate.fileName || 'Yüklənmiş Sənəd'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bu sənəd mətn formatında yüklənmişdir. Sənədi A4 formatında baxmaq üçün «A4 Fiziki Sənəd» düyməsinə keçid edə bilərsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('a4-document')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
                  >
                    A4 Fiziki Sənəd Görünüşünə Keç
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* VIEW 2: STANDARD HIGH-FIDELITY A4 CV DOCUMENT SHEET */
            <div
              ref={printAreaRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="w-full max-w-[820px] bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-7 transition-transform duration-150 print:m-0 print:p-8 print:shadow-none print:border-none print:w-full print:max-w-none font-sans"
            >
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
                      {candidate.fullName}
                    </h1>
                    {candidate.careerLevel && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-black tracking-wider uppercase">
                        {candidate.careerLevel}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-blue-700">
                    {candidate.jobTitle}
                  </h2>

                  {/* Contact Badges Grid */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-2">
                    {candidate.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>{candidate.email}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ümumi staj: <strong>{candidate.experienceYears} il</strong></span>
                    </div>
                    {candidate.fatherName && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Ata adı: <strong className="text-slate-700">{candidate.fatherName}</strong></span>
                      </div>
                    )}
                    {candidate.gender && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Cins: <strong className="text-slate-700">{candidate.gender}</strong></span>
                      </div>
                    )}
                    {candidate.maritalStatus && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Ailə: <strong className="text-slate-700">{candidate.maritalStatus}</strong></span>
                      </div>
                    )}
                    {candidate.militaryStatus && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Hərbi: <strong className="text-slate-700">{candidate.militaryStatus}</strong></span>
                      </div>
                    )}
                    {candidate.drivingLicense && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Sürücülük: <strong className="text-slate-700">Kat. {candidate.drivingLicense}</strong></span>
                      </div>
                    )}
                    {candidate.linkedinUrl && (
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {candidate.portfolioUrl && (
                      <a
                        href={candidate.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:underline font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Portfolio / GitHub</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Side: Verification Stamp & Expected Salary */}
                <div className="sm:text-right shrink-0 space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200 min-w-[150px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Gözlənilən Maaş
                  </span>
                  <span className="text-xl font-black text-emerald-700 block">
                    {candidate.expectedSalary} {candidate.currency || 'AZN'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {candidate.salaryPeriod || 'Aylıq Net'}
                  </span>
                </div>
              </div>

              {/* Suitable Positions Banner */}
              {candidate.suitablePositions && candidate.suitablePositions.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Uyğun Ola Biləcək Vəzifələr & Karyera Potensialı:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {candidate.suitablePositions.map((pos, pIdx) => (
                      <span key={`${pos}-${pIdx}`} className="px-2.5 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 text-[11px] font-bold shadow-2xs">
                        💼 {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 1: Professional Summary / Bio */}
              {(candidate.summary || candidate.notes) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Peşəkar Xülasə & Profil</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                    {candidate.summary || candidate.notes}
                  </p>
                </div>
              )}

              {/* Section 2: Work Experience (İş Təcrübələri) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>İş Təcrübəsi Xronologiyası</span>
                </h3>

                {candidate.workExperiences && candidate.workExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.workExperiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-1 relative pl-3 border-l-2 border-blue-500">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">
                            {exp.jobTitle}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-500">
                            {exp.startDate || '2021'} — {exp.isCurrent ? 'Hazırda çalışır' : exp.endDate || '2024'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{exp.companyName}</span>
                          {exp.industry && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                              {exp.industry}
                            </span>
                          )}
                          {exp.city && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({exp.city})
                            </span>
                          )}
                        </div>

                        {exp.responsibilities && (
                          <p className="text-xs text-slate-700 leading-relaxed pt-1">
                            {exp.responsibilities}
                          </p>
                        )}

                        {exp.achievements && (
                          <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-medium mt-1">
                            <strong>Əsas Nəticə:</strong> {exp.achievements}
                          </div>
                        )}

                        {exp.toolsUsed && exp.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {exp.toolsUsed.map(t => (
                              <span key={t} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{candidate.jobTitle}</span>
                      <span className="text-slate-500">{candidate.experienceYears} il ümumi staj</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Namizədin bu sahə üzrə {candidate.experienceYears} il təcrübəsi mövcuddur. İxtisaslaşma sahəsi və peşəkar bacarıqları aşağıda qeyd olunmuşdur.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Education (Təhsil) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Təhsil Məlumatları</span>
                </h3>

                {candidate.educationHistory && candidate.educationHistory.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.educationHistory.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-xs font-black text-slate-900">
                          <span>{edu.degree}</span>
                          <span className="text-slate-500 text-[11px]">
                            {edu.startDate} — {edu.endDate}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-blue-700">
                          {edu.institution}
                        </div>
                        {edu.fieldOfStudy && (
                          <div className="text-[11px] text-slate-600">
                            İxtisas: {edu.fieldOfStudy}
                          </div>
                        )}
                        {edu.gpa && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            GPA / Bal: {edu.gpa}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{candidate.educationLevel} Dərəcəsi</span>
                      <span className="text-slate-600 block">{candidate.educationDetails || 'Ali Təhsil Müəssisəsi'}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                      {candidate.educationLevel}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 4: Skills Matrix (Bacarıqlar) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bacarıqlar və Kompetensiyalar</span>
                </h3>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Əsas & Texniki Bacarıqlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {candidate.softSkills && candidate.softSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Şəxsi / Yumşaq Bacarıqlar (Soft Skills):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.softSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-semibold text-[11px]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.toolsAndTechnologies && candidate.toolsAndTechnologies.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        İstifadə Edilən Alətlər və Sistemlər:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.toolsAndTechnologies.map((tl, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px]"
                          >
                            {tl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Languages & Certifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Languages */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xarici Dil Bilikləri</span>
                  </h3>
                  <div className="space-y-1.5">
                    {candidate.languages.map((l, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="font-bold text-slate-800">{l.language}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold text-[11px]">
                          {l.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications or Work Preference */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sertifikatlar & Təlimlər</span>
                  </h3>
                  {candidate.certifications && candidate.certifications.length > 0 ? (
                    <div className="space-y-1.5">
                      {candidate.certifications.map((cert, idx) => (
                        <div
                          key={cert.id || idx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5"
                        >
                          <span className="font-bold text-slate-900 block truncate">{cert.name}</span>
                          <span className="text-[11px] text-slate-500 block">
                            {cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">İş Rejimi Seçimi:</span>
                      </div>
                      <p className="text-[11px]">
                        {candidate.preferredWorkModes?.join(', ') || 'Ofis / Hibrid'} • {candidate.preferredJobTypes?.join(', ') || 'Tam ştat'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects (if available) */}
              {candidate.projects && candidate.projects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Layihələr & Portfello</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{proj.title}</span>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-[11px] text-slate-600">{proj.description}</p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map(t => (
                              <span key={t} className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Official Footer */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Jobia.az Rəsmi Kadr Baza Sənədi • İD: <code className="font-mono text-slate-700">{candidate.id}</code>
                  </span>
                </div>
                <span>
                  Sənəd generasiya tarixi: {new Date().toLocaleDateString('az-AZ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
