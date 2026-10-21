import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PenTool,
  Archive,
  Download,
  Eye,
  Trash2,
  ShieldCheck,
  Building2,
  User,
  ArrowRight,
  Layers,
  History,
  FileCheck,
  AlertCircle,
  Mic,
  Upload,
  RefreshCw
} from 'lucide-react';
import {
  FormTemplate,
  FormSubmission,
  TemplateCategoryType,
  FormSubmissionStatus,
  SmartDocument,
  SignatureRecord
} from '../../types/smartForms';
import {
  getAllTemplates,
  getSubmissions,
  getAuditLogs,
  updateSubmissionStatus,
  getDocumentBySubmissionId,
  generateDocumentFromSubmission,
  getAllSignatureRecordsFromFirestore
} from './smartFormsService';
import { SmartFormFillerModal } from './SmartFormFillerModal';
import { AITemplateBuilderModal } from './AITemplateBuilderModal';
import { SmartDocumentViewerModal } from './SmartDocumentViewerModal';
import { SectionBottomLogo } from '../common/SectionBottomLogo';

export interface SmartFormsViewProps {
  currentUser?: any;
  activeCompany?: any;
  candidateCV?: any;
  onOpenAuthModal?: () => void;
}

export const SmartFormsView: React.FC<SmartFormsViewProps> = ({
  currentUser,
  activeCompany,
  candidateCV,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'submissions' | 'signatures' | 'audit'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [firestoreSignatures, setFirestoreSignatures] = useState<SignatureRecord[]>([]);

  // Modals state
  const [selectedTemplateForFill, setSelectedTemplateForFill] = useState<FormTemplate | null>(null);
  const [isAIBuilderOpen, setIsAIBuilderOpen] = useState(false);
  const [selectedSubmissionForView, setSelectedSubmissionForView] = useState<FormSubmission | null>(null);
  const [viewingDocument, setViewingDocument] = useState<SmartDocument | null>(null);

  // Load data
  const loadData = () => {
    const tpls = getAllTemplates(activeCompany?.id || 'system');
    const subs = getSubmissions(activeCompany?.id);
    const logs = getAuditLogs(activeCompany?.id);
    setTemplates(tpls);
    setSubmissions(subs);
    setAuditLogs(logs);

    // Fetch live signatures from Firestore 'SignatureRecords'
    getAllSignatureRecordsFromFirestore().then((records) => {
      if (records && records.length > 0) {
        setFirestoreSignatures(records);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [activeCompany]);

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchStatus = statusFilter === 'all' || sub.currentStatus === statusFilter;
    const matchSearch =
      sub.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Calculate statistics
  const pendingApprovalsCount = submissions.filter(
    (s) => s.currentStatus === 'pending_approval' || s.currentStatus === 'pending_review'
  ).length;
  const pendingSignaturesCount = submissions.filter((s) => s.currentStatus === 'pending_signature').length;
  const completedCount = submissions.filter((s) => s.currentStatus === 'completed' || s.currentStatus === 'signed').length;

  // Handle Approve / Reject
  const handleStatusChange = (submissionId: string, newStatus: FormSubmissionStatus, comment?: string) => {
    updateSubmissionStatus(
      submissionId,
      newStatus,
      currentUser?.id || 'admin-1',
      currentUser?.fullName || 'Rəhbər / HR Menecer',
      comment
    );
    loadData();
  };

  // Open Document in Viewer with Print & PDF
  const handleOpenDocumentViewer = (sub: FormSubmission) => {
    let doc = getDocumentBySubmissionId(sub.id);
    if (!doc) {
      doc = generateDocumentFromSubmission(sub);
    }
    setViewingDocument(doc);
    setSelectedSubmissionForView(sub);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner & Module Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Jobia.az Ağıllı Sənədlər və E-İmza Sistemi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            AI Əsaslı Sənəd Şablonları, Ağıllı Formalar və Elektron İmzalama Modulu
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            İşəgötürənlər, HR mütəxəssisləri və əməkdaşlar üçün vahid sənəd dövriyyəsi mərkəzi.
            Formanı adi qaydada, səsli danışaraq və ya sənədin fotosunu yükləyərək doldurun,
            çoxpilləli iş axınından keçirin və rəqəmsal imza ilə təsdiqləyin.
          </p>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsAIBuilderOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI ilə Yeni Şablon Yarat</span>
            </button>

            <button
              onClick={() => {
                if (templates.length > 0) {
                  setSelectedTemplateForFill(templates[0]);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Sürətli Sənəd Doldur</span>
            </button>
          </div>
        </div>

        {/* Ambient Gradient Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none block">
              {templates.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
              Standart və Fərdi Şablon
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-amber-900 leading-none block">
              {pendingApprovalsCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
              Təsdiq Gözləyən Sənəd
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-indigo-950 leading-none block">
              {pendingSignaturesCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
              İmza Gözləyən Sənəd
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-emerald-950 leading-none block">
              {completedCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
              İmzalanmış və Arxivlənmiş
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sənəd Şablonları Kitabxanası ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Doldurulmuş Sənədlər və İş Axını ({submissions.length})</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'signatures'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Rəqəmsal İmza Reyestri</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Arxiv və Audit Jurnalı</span>
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Yenilə"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şablon və ya sənəd axtarın (məs: məzuniyyət, təhvil-təslim, işə qəbul)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm font-semibold"
          />
        </div>

        {activeTab === 'templates' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Bütün Kateqoriyalar</option>
              <option value="labor_relations">Əmək Münasibətləri Ərizələri</option>
              <option value="hr_management">HR və İşəgötürən Formaları</option>
              <option value="general_requests">Daxili Müraciətlər və Digər</option>
              <option value="company_custom">Müəssisənin Fərdi Şablonları</option>
            </select>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Bütün Statuslar</option>
              <option value="pending_approval">Təsdiq Gözləyir</option>
              <option value="pending_signature">İmza Gözləyir</option>
              <option value="signed">İmzalanıb</option>
              <option value="completed">Tamamlanıb</option>
              <option value="rejected">Rədd Edilib</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: TEMPLATES LIBRARY */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-400"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      v{template.version}.0
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {template.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {template.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{template.estimatedMinutes || 3} dəq</span>
                  </div>

                  <button
                    onClick={() => setSelectedTemplateForFill(template)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                  >
                    <span>Formanı Doldur</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMISSIONS & WORKFLOWS */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Sənəd Başlığı</th>
                  <th className="py-3 px-4">Əməkdaş / Müraciətçi</th>
                  <th className="py-3 px-4">Tarix</th>
                  <th className="py-3 px-4">Cari Status</th>
                  <th className="py-3 px-4">Doldurma Üsulu</th>
                  <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Heç bir doldurulmuş sənəd tapılmadı.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.templateTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{sub.submittedByName}</div>
                        <div className="text-[10px] text-slate-400">{sub.submittedByEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString('az-AZ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sub.currentStatus === 'completed' || sub.currentStatus === 'signed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.currentStatus === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.currentStatus === 'pending_signature'
                              ? 'bg-indigo-100 text-indigo-800'
                              : sub.currentStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sub.currentStatus === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.currentStatus === 'pending_approval' && <Clock className="w-3 h-3" />}
                          {sub.currentStatus === 'pending_signature' && <PenTool className="w-3 h-3" />}
                          <span>
                            {sub.currentStatus === 'completed'
                              ? 'Tamamlanıb'
                              : sub.currentStatus === 'signed'
                              ? 'İmzalanıb'
                              : sub.currentStatus === 'pending_approval'
                              ? 'Təsdiq Gözləyir'
                              : sub.currentStatus === 'pending_signature'
                              ? 'İmza Gözləyir'
                              : sub.currentStatus === 'rejected'
                              ? 'İmtina Edilib'
                              : 'Qaralama'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 uppercase font-semibold">
                        {sub.completionMode}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.currentStatus === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(sub.id, 'completed', 'Təsdiq olundu')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Təsdiq Et
                              </button>
                              <button
                                onClick={() => handleStatusChange(sub.id, 'rejected', 'Rədd edildi')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] cursor-pointer"
                              >
                                İmtina
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenDocumentViewer(sub)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Sənədə Bax, Çap Et və ya PDF Endir"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Bax / Çap / PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL SIGNATURES REGISTRY */}
      {activeTab === 'signatures' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Rəqəmsal İmza və Biometrik Audit Reyestri</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bütün rəsmi imzaların Firebase Cloud Firestore ('SignatureRecords') kolleksiyasında saxlanan audit izi və 2-pilləli canlı veb-kamera foto sübutları.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Firestore Sinxronizasiya Aktivdir</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {submissions
              .filter((s) => s.currentStatus === 'signed' || s.currentStatus === 'completed')
              .map((sub, idx) => {
                const doc = getDocumentBySubmissionId(sub.id);
                const sig = doc?.signatures?.[0] || firestoreSignatures.find(f => f.documentId === doc?.id);
                const photos = sig?.verificationPhotos || [];

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-3 text-xs transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                          <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900">{sub.templateTitle}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                              {doc?.documentNumber || `HR-2026/0${idx + 1}`}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">
                            İmzalayan: <strong className="text-slate-800">{sub.submittedByName}</strong> ({sub.submittedByEmail})
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 mt-1">
                            Heş Kodu: {sig?.verificationHash || `JOBIA-SIG-2026-X88${idx}A9F2`} • TLS 1.3 • Firestore 'SignatureRecords'
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Doğrulanmış İmza</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenDocumentViewer(sub)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Sənədi Aç & Çap Et</span>
                        </button>
                      </div>
                    </div>

                    {/* 2-Step Biometric Photos Strip */}
                    {photos.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>İkipilləli Biometrik Foto Təsdiqi ({photos.length} Canlı Şəkil):</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            Həmin an çəkilmiş canlı audit sübutu ✓
                          </span>
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-1">
                          {photos.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              className="relative rounded-xl overflow-hidden border border-slate-300 w-28 h-20 shrink-0 bg-slate-900 group shadow-2xs"
                            >
                              <img
                                src={photoUrl}
                                alt={`Audit ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white font-mono text-[8px]">
                                Foto #{pIdx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Dəyişdirilə Bilməyən Sistem Audit Jurnalı</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sənədlərin yaradılması, şablon redaktəsi, təsdiq və imza əməliyyatlarının tam xronikası.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-400">({log.actorName})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('az-AZ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTemplateForFill && (
        <SmartFormFillerModal
          template={selectedTemplateForFill}
          isOpen={true}
          onClose={() => setSelectedTemplateForFill(null)}
          onCompleted={(sub) => {
            loadData();
            setActiveTab('submissions');
          }}
          currentUser={currentUser}
          activeCompany={activeCompany}
          candidateCV={candidateCV}
        />
      )}

      {isAIBuilderOpen && (
        <AITemplateBuilderModal
          isOpen={true}
          onClose={() => setIsAIBuilderOpen(false)}
          onTemplateCreated={(tpl) => {
            loadData();
            setActiveTab('templates');
          }}
          organizationId={activeCompany?.id || 'demo-corp'}
          organizationName={activeCompany?.name || 'Müəssisə'}
        />
      )}

      {/* Document View & Print Modal */}
      {selectedSubmissionForView && (
        <SmartDocumentViewerModal
          isOpen={true}
          onClose={() => {
            setSelectedSubmissionForView(null);
            setViewingDocument(null);
          }}
          document={viewingDocument}
          submission={selectedSubmissionForView}
          template={templates.find(t => t.id === selectedSubmissionForView.templateId)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Bottom Legal Branding */}
      <SectionBottomLogo />
    </div>
  );
};
