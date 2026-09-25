import React, { useState, useEffect, useMemo } from 'react';
import { CreatedCVRecord, CVTemplateType } from '../../types';
import { 
  getAllCreatedCVsFromFirestore, 
  subscribeToCreatedCVs, 
  updateCreatedCVInRegistry, 
  deleteCreatedCVFromRegistry, 
  exportCreatedCVsToCSV, 
  exportCreatedCVsToJSON,
  getTemplateDisplayName 
} from '../../services/createdCVService';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { CV_TEMPLATES } from '../cv-templates/templateRegistry';
import { downloadCVAsPDF } from '../../utils/pdfExport';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Copy, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Filter, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  Calendar, 
  ArrowUpDown, 
  Tag, 
  Layers, 
  X, 
  AlertCircle,
  MessageSquare,
  UserCheck,
  Smartphone,
  Share2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface AdminCreatedCVsRegistryProps {
  onRefreshParent?: () => void;
}

export const AdminCreatedCVsRegistry: React.FC<AdminCreatedCVsRegistryProps> = ({ onRefreshParent }) => {
  const [records, setRecords] = useState<CreatedCVRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedContactFilter, setSelectedContactFilter] = useState<'all' | 'has_phone' | 'has_email' | 'full_contact'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'shortlisted' | 'contacted' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'created_desc' | 'completeness_desc' | 'downloads_desc' | 'name_asc'>('updated_desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Multi-selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [previewRecord, setPreviewRecord] = useState<CreatedCVRecord | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateType>('simple-clean');
  const [noteEditRecord, setNoteEditRecord] = useState<CreatedCVRecord | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [adminStatusInput, setAdminStatusInput] = useState<CreatedCVRecord['status']>('active');

  // Copy feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // PDF download in modal
  const [isExportingModalPdf, setIsExportingModalPdf] = useState(false);

  // Initial fetch and realtime subscription
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getAllCreatedCVsFromFirestore().then((initial) => {
      if (isMounted) {
        setRecords(initial);
        setIsLoading(false);
      }
    });

    const unsubscribe = subscribeToCreatedCVs((updated) => {
      if (isMounted) {
        setRecords(updated);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    const refreshed = await getAllCreatedCVsFromFirestore();
    setRecords(refreshed);
    setIsLoading(false);
    if (onRefreshParent) onRefreshParent();
  };

  // Profession categories classifier
  const getRecordCategory = (jobTitle: string): string => {
    const t = (jobTitle || '').toLowerCase();
    if (t.includes('developer') || t.includes('proqramçı') || t.includes('frontend') || t.includes('backend') || t.includes('it ') || t.includes('qa ') || t.includes('devops') || t.includes('data')) {
      return 'İT & Texnologiya';
    }
    if (t.includes('mühasib') || t.includes('maliyyə') || t.includes('audit') || t.includes('bank') || t.includes('iqtisad') || t.includes('kredit')) {
      return 'Maliyyə & Mühasibat';
    }
    if (t.includes('dizayn') || t.includes('ui/ux') || t.includes('qrafik') || t.includes('art') || t.includes('creative')) {
      return 'Dizayn & Yaradıcılıq';
    }
    if (t.includes('marketinq') || t.includes('smm') || t.includes('satış') || t.includes('b2b') || t.includes('sales') || t.includes('ticarət')) {
      return 'Satış & Marketinq';
    }
    if (t.includes('mühəndis') || t.includes('inşaat') || t.includes('memar') || t.includes('neft') || t.includes('texnik')) {
      return 'Mühəndislik & Tikinti';
    }
    if (t.includes('kadr') || t.includes('hr') || t.includes('recruiter') || t.includes('insan resurs')) {
      return 'İnsan Resursları (HR)';
    }
    if (t.includes('həkim') || t.includes('tibb') || t.includes('əczaçı') || t.includes('terapevt') || t.includes('tibb bacısı')) {
      return 'Tibb & Səhiyyə';
    }
    if (t.includes('müəllim') || t.includes('təhsil') || t.includes('tərcümə') || t.includes('təlim')) {
      return 'Təhsil & Təlim';
    }
    return 'Digər Xidmətlər';
  };

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    let result = records.filter((r) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const skillsText = (r.skills || []).join(' ').toLowerCase();
        const matchesName = r.fullName?.toLowerCase().includes(q);
        const matchesTitle = r.jobTitle?.toLowerCase().includes(q);
        const matchesEmail = r.email?.toLowerCase().includes(q);
        const matchesPhone = r.phone?.toLowerCase().includes(q);
        const matchesCity = r.city?.toLowerCase().includes(q);
        const matchesSkills = skillsText.includes(q);
        if (!matchesName && !matchesTitle && !matchesEmail && !matchesPhone && !matchesCity && !matchesSkills) {
          return false;
        }
      }

      // Template filter
      if (selectedTemplateFilter !== 'all' && r.template !== selectedTemplateFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all') {
        const cat = getRecordCategory(r.jobTitle);
        if (cat !== selectedCategoryFilter) return false;
      }

      // Contact filter
      if (selectedContactFilter === 'has_phone' && (!r.phone || r.phone.trim().length < 5)) {
        return false;
      }
      if (selectedContactFilter === 'has_email' && (!r.email || !r.email.includes('@'))) {
        return false;
      }
      if (selectedContactFilter === 'full_contact') {
        const hasValidEmail = r.email && r.email.includes('@');
        const hasValidPhone = r.phone && r.phone.trim().length > 5;
        if (!hasValidEmail || !hasValidPhone) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && r.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'updated_desc') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      if (sortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'completeness_desc') {
        return (b.completenessScore || 0) - (a.completenessScore || 0);
      }
      if (sortBy === 'downloads_desc') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === 'name_asc') {
        return a.fullName.localeCompare(b.fullName, 'az');
      }
      return 0;
    });

    return result;
  }, [records, searchQuery, selectedTemplateFilter, selectedCategoryFilter, selectedContactFilter, selectedStatusFilter, sortBy]);

  // Key Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const withEmail = records.filter((r) => r.email && r.email.includes('@')).length;
    const withPhone = records.filter((r) => r.phone && r.phone.trim().length > 5).length;
    const withFullContact = records.filter((r) => r.email && r.email.includes('@') && r.phone && r.phone.trim().length > 5).length;
    const contactCoveragePct = total > 0 ? Math.round((withFullContact / total) * 100) : 0;

    // Today's new or updated
    const nowTime = Date.now();
    const twentyFourHoursAgo = nowTime - 24 * 60 * 60 * 1000;
    const todayCount = records.filter((r) => {
      const t = new Date(r.updatedAt || r.createdAt).getTime();
      return t >= twentyFourHoursAgo;
    }).length;

    // Most popular template
    const templateCounts: Record<string, number> = {};
    records.forEach((r) => {
      const t = r.template || 'simple-clean';
      templateCounts[t] = (templateCounts[t] || 0) + 1;
    });
    let topTemplate = 'Sadə Təmiz Ağ';
    let maxTCount = 0;
    Object.entries(templateCounts).forEach(([tId, count]) => {
      if (count > maxTCount) {
        maxTCount = count;
        topTemplate = getTemplateDisplayName(tId);
      }
    });

    // Top profession sector
    const sectorCounts: Record<string, number> = {};
    records.forEach((r) => {
      const s = getRecordCategory(r.jobTitle);
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });
    let topSector = 'İT & Texnologiya';
    let maxSCount = 0;
    Object.entries(sectorCounts).forEach(([sec, count]) => {
      if (count > maxSCount) {
        maxSCount = count;
        topSector = sec;
      }
    });

    return {
      total,
      withEmail,
      withPhone,
      withFullContact,
      contactCoveragePct,
      todayCount,
      topTemplate,
      topSector
    };
  }, [records]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Copy Emails to Clipboard
  const handleCopyEmails = () => {
    const targetList = selectedIds.size > 0 
      ? records.filter((r) => selectedIds.has(r.id))
      : filteredRecords;
    
    const emails = Array.from(new Set(targetList.map((r) => r.email?.trim()).filter((e) => e && e.includes('@'))));
    if (emails.length === 0) {
      alert('Seçilmiş namizədlər arasında e-poçt ünvanı tapılmadı.');
      return;
    }
    navigator.clipboard.writeText(emails.join(', '));
    setCopyFeedback(`${emails.length} ədəd e-poçt kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Copy Phone Numbers to Clipboard
  const handleCopyPhones = () => {
    const targetList = selectedIds.size > 0 
      ? records.filter((r) => selectedIds.has(r.id))
      : filteredRecords;
    
    const phones = Array.from(new Set(targetList.map((r) => r.phone?.trim()).filter((p) => p && p.length > 5)));
    if (phones.length === 0) {
      alert('Seçilmiş namizədlər arasında telefon nömrəsi tapılmadı.');
      return;
    }
    navigator.clipboard.writeText(phones.join(', '));
    setCopyFeedback(`${phones.length} ədəd telefon nömrəsi kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const targetList = selectedIds.size > 0 
      ? records.filter((r) => selectedIds.has(r.id))
      : filteredRecords;
    if (targetList.length === 0) {
      alert('İxrac etmək üçün heç bir CV qeydi tapılmadı.');
      return;
    }
    exportCreatedCVsToCSV(targetList);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const targetList = selectedIds.size > 0 
      ? records.filter((r) => selectedIds.has(r.id))
      : filteredRecords;
    if (targetList.length === 0) {
      alert('İxrac etmək üçün heç bir CV qeydi tapılmadı.');
      return;
    }
    exportCreatedCVsToJSON(targetList);
  };

  // Open Preview Modal
  const handleOpenPreview = (record: CreatedCVRecord) => {
    setPreviewRecord(record);
    const validTemplate = (record.template && CV_TEMPLATES.some((t) => t.id === record.template)) 
      ? (record.template as CVTemplateType)
      : 'simple-clean';
    setPreviewTemplate(validTemplate);
  };

  // Open Edit Note Modal
  const handleOpenNoteModal = (record: CreatedCVRecord) => {
    setNoteEditRecord(record);
    setAdminNoteInput(record.adminNotes || '');
    setAdminStatusInput(record.status || 'active');
  };

  // Save Note & Status
  const handleSaveNoteAndStatus = async () => {
    if (!noteEditRecord) return;
    await updateCreatedCVInRegistry(noteEditRecord.id, {
      adminNotes: adminNoteInput,
      status: adminStatusInput
    });
    setNoteEditRecord(null);
  };

  // Delete Record
  const handleDeleteRecord = async (record: CreatedCVRecord) => {
    if (window.confirm(`"${record.fullName}" namizədinin CV qeydini bazadan silmək istədiyinizə əminsiniz?`)) {
      await deleteCreatedCVFromRegistry(record.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  // Download PDF from Preview Modal
  const handleDownloadPreviewPDF = async () => {
    if (!previewRecord) return;
    setIsExportingModalPdf(true);
    const cleanName = (previewRecord.fullName || 'Namized').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
    const cleanTitle = (previewRecord.jobTitle || 'CV').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
    const fileName = `Jobia_Admin_CV_${cleanName}_${cleanTitle}.pdf`;
    try {
      await downloadCVAsPDF('admin-cv-live-preview-box', { fileName });
    } catch (e: any) {
      alert('PDF ixrac xətası: ' + (e?.message || 'Bilinməyən xəta'));
    } finally {
      setIsExportingModalPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Real Vaxt Namizəd Data Bazası
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              CV Hazırlayanlar Bazası
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Jobia platformasında kim CV hazırlayıb, redaktə edib və ya yükləyibsə bütün əlaqə və təcrübə məlumatları burada toplanır. Rekrutinq, bazar analitikası və birbaşa əlaqə üçün ixrac edə bilərsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition backdrop-blur-sm"
              title="Məlumatları yenilə"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Yenilə</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel / CSV İxrac Et</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-900/40 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>JSON İxrac</span>
            </button>
          </div>
        </div>

        {/* 5 Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Cəmi CV Bazası
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
              {stats.total}
            </div>
            <div className="text-[11px] text-blue-300 mt-0.5">Platformada qeydiyyatlı</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Əlaqə Əlçatanlığı
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-emerald-300 mt-1">
              {stats.contactCoveragePct}%
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">{stats.withFullContact} nəfər tam əlaqəli</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              Bugün Hazırlananlar
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 mt-1">
              +{stats.todayCount}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Son 24 saatda aktiv</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Top Şablon
            </div>
            <div className="text-base lg:text-lg font-bold text-purple-200 mt-1 truncate" title={stats.topTemplate}>
              {stats.topTemplate}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Ən çox seçilən tərtibat</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm col-span-2 md:col-span-1">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-rose-400" />
              Top İxtisas Sahəsi
            </div>
            <div className="text-base lg:text-lg font-bold text-rose-200 mt-1 truncate" title={stats.topSector}>
              {stats.topSector}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Ən yüksək namizəd payı</div>
          </div>
        </div>
      </div>

      {/* Action / Outreach Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Toplu Data Əməliyyatları:
          </span>
          <button
            onClick={handleCopyEmails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="E-poçtları kopyala"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>E-poçtları Kopyala ({selectedIds.size > 0 ? selectedIds.size : filteredRecords.length})</span>
          </button>

          <button
            onClick={handleCopyPhones}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="Telefon nömrələrini kopyala"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nömrələri Kopyala ({selectedIds.size > 0 ? selectedIds.size : filteredRecords.length})</span>
          </button>

          {copyFeedback && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              {copyFeedback}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-500 font-medium">Görünüş:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cədvəl
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Kartlar
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ad, vəzifə, email, telefon, bacarıq və ya şəhər axtar..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Profession Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition"
            >
              <option value="all">Bütün Sahələr</option>
              <option value="İT & Texnologiya">İT & Texnologiya</option>
              <option value="Maliyyə & Mühasibat">Maliyyə & Mühasibat</option>
              <option value="Dizayn & Yaradıcılıq">Dizayn & Yaradıcılıq</option>
              <option value="Satış & Marketinq">Satış & Marketinq</option>
              <option value="Mühəndislik & Tikinti">Mühəndislik & Tikinti</option>
              <option value="İnsan Resursları (HR)">İnsan Resursları (HR)</option>
              <option value="Tibb & Səhiyyə">Tibb & Səhiyyə</option>
              <option value="Təhsil & Təlim">Təhsil & Təlim</option>
              <option value="Digər Xidmətlər">Digər Xidmətlər</option>
            </select>
          </div>

          {/* Template Filter */}
          <div>
            <select
              value={selectedTemplateFilter}
              onChange={(e) => setSelectedTemplateFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition"
            >
              <option value="all">Bütün Şablonlar ({CV_TEMPLATES.length})</option>
              {CV_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact and Status Filter */}
          <div>
            <select
              value={selectedContactFilter}
              onChange={(e) => setSelectedContactFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition"
            >
              <option value="all">Bütün Əlaqə Tipləri</option>
              <option value="full_contact">Tam Əlaqəli (Tel + Email)</option>
              <option value="has_phone">Yalnız Telefonu Olanlar</option>
              <option value="has_email">Yalnız E-poçtu Olanlar</option>
            </select>
          </div>
        </div>

        {/* Second sub-filter row: Status and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500">Statusa görə:</span>
            {(['all', 'active', 'shortlisted', 'contacted', 'archived'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedStatusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'all' && 'Hamısı'}
                {st === 'active' && 'Aktiv'}
                {st === 'shortlisted' && 'Seçilmiş'}
                {st === 'contacted' && 'Əlaqə saxlanılıb'}
                {st === 'archived' && 'Arxiv'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Sıralama:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="updated_desc">Son Yenilənmə</option>
              <option value="created_desc">Qeydiyyat Tarixi</option>
              <option value="completeness_desc">CV Doluluq Faizi</option>
              <option value="downloads_desc">PDF Yükləmə Sayı</option>
              <option value="name_asc">Ad (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Section */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Axtarışa uyğun heç bir CV tapılmadı</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Axtarış filtrini dəyişərək və ya təmizləyərək digər qeydlərə baxa bilərsiniz.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('all');
              setSelectedTemplateFilter('all');
              setSelectedContactFilter('all');
              setSelectedStatusFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
          >
            Filtirləri Sıfırla
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-slate-700 flex items-center"
                    >
                      {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Namizəd & Əlaqə</th>
                  <th className="py-3.5 px-4">Vəzifə & Təcrübə</th>
                  <th className="py-3.5 px-4">Bacarıqlar</th>
                  <th className="py-3.5 px-4">Seçilmiş Şablon</th>
                  <th className="py-3.5 px-4 text-center">Doluluq</th>
                  <th className="py-3.5 px-4 text-center">Yükləmə</th>
                  <th className="py-3.5 px-4">Tarix & Status</th>
                  <th className="py-3.5 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, index) => {
                  const isSelected = selectedIds.has(r.id);
                  const categoryName = getRecordCategory(r.jobTitle);

                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-blue-50/40 transition group ${isSelected ? 'bg-blue-50/60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleSelectOne(r.id)}
                          className="text-slate-400 hover:text-slate-700 flex items-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          {r.photoUrl ? (
                            <img
                              src={r.photoUrl}
                              alt={r.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                              {r.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                              <span className="truncate">{r.fullName}</span>
                              {r.userId && !r.userId.startsWith('guest') && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700" title="Qeydiyyatlı istifadəçi">
                                  User
                                </span>
                              )}
                            </div>

                            {/* Contact Badges */}
                            <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                              {r.email ? (
                                <a 
                                  href={`mailto:${r.email}`}
                                  className="hover:text-blue-600 flex items-center gap-1 truncate"
                                  title={r.email}
                                >
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{r.email}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">E-poçt yoxdur</span>
                              )}

                              {r.phone ? (
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`tel:${r.phone}`}
                                    className="hover:text-emerald-600 flex items-center gap-1 truncate font-medium text-slate-700"
                                    title={r.phone}
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{r.phone}</span>
                                  </a>
                                  {r.phone.replace(/[^0-9]/g, '').length >= 9 && (
                                    <a
                                      href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                    >
                                      WP
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Telefon yoxdur</span>
                              )}
                            </div>

                            {r.city && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate">{r.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Profession & Experience */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {r.jobTitle || 'Qeyd edilməyib'}
                        </div>
                        <div className="inline-block mt-0.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                            {categoryName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{r.experienceCount} iş təcrübəsi</span>
                          <span>•</span>
                          <span>{r.educationCount} təhsil</span>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(r.skills || []).slice(0, 3).map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium truncate max-w-[120px]"
                            >
                              {skill}
                            </span>
                          ))}
                          {(r.skills || []).length > 3 && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                              +{(r.skills || []).length - 3}
                            </span>
                          )}
                          {(!r.skills || r.skills.length === 0) && (
                            <span className="text-xs text-slate-400 italic">Göstərilməyib</span>
                          )}
                        </div>
                      </td>

                      {/* Selected Template */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {r.templateName || getTemplateDisplayName(r.template)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                          <span className="uppercase font-bold text-blue-600">{r.language || 'AZ'}</span>
                          <span>•</span>
                          <span>{r.hasPhoto ? 'Şəkilli' : 'Şəkilsiz'}</span>
                        </div>
                      </td>

                      {/* Completeness */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full rounded-full ${
                                r.completenessScore >= 80 ? 'bg-emerald-500' : r.completenessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${r.completenessScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {r.completenessScore}%
                          </span>
                        </div>
                      </td>

                      {/* Downloads */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          <Download className="w-3 h-3 text-slate-500" />
                          {r.downloadCount || 0}
                        </span>
                      </td>

                      {/* Date & Status */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-700">
                          {new Date(r.updatedAt || r.createdAt).toLocaleDateString('az-AZ')}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                            r.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
                            r.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                            r.status === 'archived' ? 'bg-slate-200 text-slate-600' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {r.status === 'shortlisted' && 'Seçilmiş'}
                            {r.status === 'contacted' && 'Əlaqə saxlanılıb'}
                            {r.status === 'archived' && 'Arxiv'}
                            {(!r.status || r.status === 'active') && 'Aktiv'}
                          </span>
                        </div>
                        {r.adminNotes && (
                          <div className="text-[11px] text-amber-700 mt-1 line-clamp-1 italic max-w-[140px]" title={r.adminNotes}>
                            Note: {r.adminNotes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenPreview(r)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition"
                            title="Tam CV-yə Baxış"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenNoteModal(r)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition"
                            title="Qeyd və Status Dəyiş"
                          >
                            <Tag className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(r)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title="Qeydi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Cəmi <strong>{filteredRecords.length}</strong> namizəd qeydi göstərilir (Bazada cəmi: {records.length})
            </span>
            {selectedIds.size > 0 && (
              <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {selectedIds.size} namizəd seçilib
              </span>
            )}
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r) => {
            const isSelected = selectedIds.has(r.id);
            const categoryName = getRecordCategory(r.jobTitle);

            return (
              <div
                key={r.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {r.photoUrl ? (
                        <img
                          src={r.photoUrl}
                          alt={r.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-base shadow-sm">
                          {r.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">
                          {r.fullName}
                        </h4>
                        <p className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-1">
                          {r.jobTitle}
                        </p>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 mt-1">
                          {categoryName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSelectOne(r.id)}
                      className="text-slate-400 hover:text-slate-700 shrink-0 mt-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Contacts */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {r.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${r.email}`} className="truncate hover:text-blue-600">
                          {r.email}
                        </a>
                      </div>
                    )}
                    {r.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${r.phone}`} className="font-semibold text-slate-800 hover:text-emerald-600">
                            {r.phone}
                          </a>
                        </div>
                        {r.phone.replace(/[^0-9]/g, '').length >= 9 && (
                          <a
                            href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                    {r.city && (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{r.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(r.skills || []).slice(0, 4).map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {s}
                      </span>
                    ))}
                    {(r.skills || []).length > 4 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                        +{(r.skills || []).length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700">{r.completenessScore}% doluluq</span>
                    <span>•</span>
                    <span className="text-slate-500">{r.downloadCount || 0} yükləmə</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPreview(r)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>CV-yə Bax</span>
                    </button>
                    <button
                      onClick={() => handleOpenNoteModal(r)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
                      title="Qeyd və Status"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: FULL LIVE CV PREVIEW & DATA INSPECTION */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                    <span>{previewRecord.fullName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {previewRecord.jobTitle}
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    {previewRecord.email && <span>Email: {previewRecord.email}</span>}
                    {previewRecord.phone && <span>Tel: {previewRecord.phone}</span>}
                    {previewRecord.city && <span>Şəhər: {previewRecord.city}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPreviewPDF}
                  disabled={isExportingModalPdf}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingModalPdf ? 'Yüklənir...' : 'PDF Yüklə'}</span>
                </button>
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Selector Bar in Modal */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Şablonu dəyişdirərək bax:</span>
                <select
                  value={previewTemplate}
                  onChange={(e) => setPreviewTemplate(e.target.value as CVTemplateType)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {CV_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <span>Doluluq: <strong className="text-emerald-600">{previewRecord.completenessScore}%</strong></span>
                <span>•</span>
                <span>Yükləmə sayı: <strong>{previewRecord.downloadCount}</strong></span>
                <span>•</span>
                <span>Tarix: <strong>{new Date(previewRecord.updatedAt || previewRecord.createdAt).toLocaleDateString('az-AZ')}</strong></span>
              </div>
            </div>

            {/* Live CV Document Preview Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-200/70 flex justify-center">
              <div 
                id="admin-cv-live-preview-box"
                className="w-full max-w-[800px] bg-white shadow-2xl rounded-sm overflow-hidden"
              >
                <CVRenderer
                  template={previewTemplate}
                  data={previewRecord.cvData}
                  showPhoto={previewRecord.hasPhoto}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ADMIN NOTE & STATUS */}
      {noteEditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Qeyd & Status İdarəetməsi</span>
              </h3>
              <button
                onClick={() => setNoteEditRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Namizəd
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900">
                  {noteEditRecord.fullName} ({noteEditRecord.jobTitle})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={adminStatusInput}
                  onChange={(e) => setAdminStatusInput(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="active">Aktiv</option>
                  <option value="shortlisted">Seçilmiş Namizəd</option>
                  <option value="contacted">Əlaqə saxlanılıb</option>
                  <option value="archived">Arxivləşdirilmiş</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Daxili Admin Qeydləri
                </label>
                <textarea
                  rows={4}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Məs: PASHA Bank vakansiyasına uyğundur, müsahibəyə təklif edilə bilər..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteEditRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                >
                  İmtina
                </button>
                <button
                  type="button"
                  onClick={handleSaveNoteAndStatus}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/30 transition"
                >
                  Yadda Saxla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
