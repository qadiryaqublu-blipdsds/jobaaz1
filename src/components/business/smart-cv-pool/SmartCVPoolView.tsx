import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Upload,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Filter,
  Sparkles,
  Sliders,
  Scale,
  Download,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  GraduationCap,
  MapPin,
  Send,
  Eye,
  Trash2,
  ArrowUpDown,
  Layers,
  ChevronRight,
  RotateCcw,
  Tag,
  CheckSquare,
  Square,
  Clock,
  Phone,
  Mail,
  MoreHorizontal,
  ShieldCheck,
  Building
} from 'lucide-react';
import {
  SmartCandidate,
  RecruitmentCriteria,
  CandidateMatchResult,
  Company,
  Vacancy,
  SmartCandidatePipelineStage
} from '../../../types';
import {
  SAMPLE_DEMO_CANDIDATES,
  exportCandidatesToExcel,
  downloadSampleCSVTemplate
} from '../../../utils/cvParserHelper';
import {
  calculateCandidateFit,
  batchCalculateFit
} from '../../../utils/recruitmentMatchingEngine';
import { UploadCVModal } from './UploadCVModal';
import { CriteriaConfigModal } from './CriteriaConfigModal';
import { CandidateDetailModal } from './CandidateDetailModal';
import { OutreachModal } from './OutreachModal';
import { CandidateComparisonMatrixModal } from './CandidateComparisonMatrixModal';
import { PhysicalCVViewerModal } from './PhysicalCVViewerModal';
import {
  ENTERPRISE_POSITIONS_CATALOG,
  buildCriteriaForPosition,
  EnterprisePositionDefinition
} from './enterprisePositions';
import { safeAlert, safeConfirm } from '../../../utils/dialogHelper';

interface SmartCVPoolViewProps {
  activeCompany: Company;
  vacancies: Vacancy[];
  onOpenAuthModal?: () => void;
}

export const SmartCVPoolView: React.FC<SmartCVPoolViewProps> = ({
  activeCompany,
  vacancies,
  onOpenAuthModal,
}) => {
  const companyStorageKey = `jobia_smart_cv_pool_${activeCompany.id || 'default'}`;
  const criteriaStorageKey = `jobia_recruitment_criteria_${activeCompany.id || 'default'}`;

  // 1. CANDIDATES POOL STATE
  const [candidates, setCandidates] = useState<SmartCandidate[]>(() => {
    try {
      const saved = localStorage.getItem(companyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly deduplicate by candidate ID
          const seen = new Set<string>();
          const uniqueList: SmartCandidate[] = [];
          for (const cand of parsed) {
            if (cand && cand.id && !seen.has(cand.id)) {
              seen.add(cand.id);
              uniqueList.push(cand);
            }
          }
          if (uniqueList.length > 0) return uniqueList;
        }
      }
    } catch {}
    // Default to sample candidates for rich experience out-of-the-box
    return SAMPLE_DEMO_CANDIDATES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      const seen = new Set<string>();
      const deduped = candidates.filter(c => {
        if (!c || !c.id || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      localStorage.setItem(companyStorageKey, JSON.stringify(deduped));
    } catch {}
  }, [candidates, companyStorageKey]);

  // 2. CRITERIA STATE
  const [criteria, setCriteria] = useState<RecruitmentCriteria>(() => {
    try {
      const saved = localStorage.getItem(criteriaStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'crit-default',
      targetJobId: 'custom',
      targetJobTitle: 'Frontend React Developer / Proqramçı',
      seniorityLevel: 'Middle',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      preferredSkills: ['Redux', 'REST API', 'Git', 'Docker'],
      minExperienceYears: 3,
      maxExpectedSalary: 2500,
      requiredEducation: 'Bakalavr',
      requiredLanguages: ['İngilis dili (B2)', 'Azərbaycan dili (Ana dili)'],
      preferredLocation: 'Bakı',
      weights: {
        skills: 35,
        experience: 20,
        jobTitleMatch: 15,
        salary: 10,
        education: 10,
        languages: 5,
        location: 5,
      },
      knockout: {
        requireMinExperience: false,
        strictSalaryCap: false,
        requireEducationLevel: false,
        requireAllMandatorySkills: false,
      },
      strictnessMode: 'balanced',
      updatedAt: new Date().toISOString(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(criteriaStorageKey, JSON.stringify(criteria));
    } catch {}
  }, [criteria, criteriaStorageKey]);

  // Active view tab
  const [activeView, setActiveView] = useState<'table' | 'pipeline' | 'analytics'>('table');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'ideal' | 'high' | 'medium'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'salary' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<SmartCandidate | null>(null);
  const [selectedCandidateForOutreach, setSelectedCandidateForOutreach] = useState<SmartCandidate | null>(null);
  const [selectedCandidateForPhysicalCV, setSelectedCandidateForPhysicalCV] = useState<SmartCandidate | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Compute live match scores for all candidates
  const matchResults = useMemo(() => {
    return batchCalculateFit(candidates, criteria);
  }, [candidates, criteria]);

  // Custom position typing state
  const [customPositionName, setCustomPositionName] = useState('');
  const [showCustomPositionInput, setShowCustomPositionInput] = useState(false);

  // Handle Position selection (works for enterprise catalog, active vacancies, and custom titles)
  const handleSelectPosition = (posKey: string, customTitle?: string) => {
    if (posKey === 'custom') {
      setCriteria(prev => ({
        ...prev,
        targetJobId: 'custom',
        targetJobTitle: customTitle || prev.targetJobTitle,
      }));
      return;
    }
    const newCriteria = buildCriteriaForPosition(posKey, customTitle, vacancies);
    setCriteria(newCriteria);
  };

  // Backward compatibility wrapper
  const handleSelectVacancy = (jobId: string) => {
    handleSelectPosition(jobId);
  };

  // Active Enterprise Position Definition
  const activeEnterprisePosition = useMemo(() => {
    return ENTERPRISE_POSITIONS_CATALOG.find(
      p => p.id === criteria.targetJobId || p.title.toLowerCase().trim() === criteria.targetJobTitle.toLowerCase().trim()
    );
  }, [criteria.targetJobId, criteria.targetJobTitle]);

  // Filtered & Sorted candidates
  const processedCandidates = useMemo(() => {
    const seenIds = new Set<string>();
    return candidates
      .filter(c => {
        if (!c || !c.id || seenIds.has(c.id)) return false;
        seenIds.add(c.id);

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.fullName.toLowerCase().includes(q);
          const matchTitle = c.jobTitle.toLowerCase().includes(q);
          const matchSkill = c.skills.some(s => s.toLowerCase().includes(q));
          const matchLoc = c.location.toLowerCase().includes(q);
          if (!matchName && !matchTitle && !matchSkill && !matchLoc) return false;
        }

        // Stage filter
        if (stageFilter !== 'all' && c.pipelineStage !== stageFilter) {
          return false;
        }

        // Score filter
        if (scoreFilter !== 'all') {
          const fit = matchResults.get(c.id);
          const score = fit?.overallScore ?? 0;
          if (scoreFilter === 'ideal' && score < 85) return false;
          if (scoreFilter === 'high' && (score < 70 || score >= 85)) return false;
          if (scoreFilter === 'medium' && (score < 50 || score >= 70)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          const scoreA = matchResults.get(a.id)?.overallScore ?? 0;
          const scoreB = matchResults.get(b.id)?.overallScore ?? 0;
          return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        }
        if (sortBy === 'experience') {
          return sortOrder === 'desc'
            ? b.experienceYears - a.experienceYears
            : a.experienceYears - b.experienceYears;
        }
        if (sortBy === 'salary') {
          return sortOrder === 'desc'
            ? b.expectedSalary - a.expectedSalary
            : a.expectedSalary - b.expectedSalary;
        }
        if (sortBy === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  }, [candidates, matchResults, searchQuery, stageFilter, scoreFilter, sortBy, sortOrder]);

  // Bulk actions handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === processedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedCandidates.map(c => c.id));
    }
  };

  const handleToggleSelectCandidate = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchChangeStage = (newStage: SmartCandidatePipelineStage) => {
    if (selectedIds.length === 0) return;
    setCandidates(prev =>
      prev.map(c => (selectedIds.includes(c.id) ? { ...c, pipelineStage: newStage } : c))
    );
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (safeConfirm(`Seçilmiş ${selectedIds.length} namizədi bazadan silmək istədiyinizə əminsiniz?`)) {
      setCandidates(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    }
  };

  const handleAddCandidates = (newOnes: SmartCandidate[]) => {
    setCandidates(prev => {
      const seen = new Set<string>();
      const cleanPrev: SmartCandidate[] = [];
      for (const c of prev) {
        if (c && c.id && !seen.has(c.id)) {
          seen.add(c.id);
          cleanPrev.push(c);
        }
      }

      const sanitizedNew: SmartCandidate[] = [];
      newOnes.forEach((c, idx) => {
        let finalId = c.id;
        if (!finalId || seen.has(finalId)) {
          finalId = `cand-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(finalId);
        sanitizedNew.push({ ...c, id: finalId });
      });
      return [...sanitizedNew, ...cleanPrev];
    });

    // Automatically display the newly added CV physically on screen!
    if (newOnes.length > 0 && newOnes[0]) {
      setSelectedCandidateForPhysicalCV(newOnes[0]);
    }
  };

  const handleUpdateCandidate = (updated: SmartCandidate) => {
    setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    if (selectedCandidateForDetail?.id === updated.id) {
      setSelectedCandidateForDetail(updated);
    }
  };

  const handleDeleteSingle = (id: string, name: string) => {
    if (safeConfirm(`«${name}» adlı namizədi bazadan silmək istəyirsiniz?`)) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Pipeline Kanban Columns
  const pipelineStages: { id: SmartCandidatePipelineStage; label: string; color: string }[] = [
    { id: 'sourced', label: 'Daxil Olmuş (Sourced)', color: 'bg-slate-100 text-slate-800' },
    { id: 'screened', label: 'Skrininq (Screened)', color: 'bg-blue-100 text-blue-800' },
    { id: 'interview', label: 'Müsahibə (Interview)', color: 'bg-purple-100 text-purple-800' },
    { id: 'shortlist', label: 'Qısa Siyahı (Shortlist)', color: 'bg-amber-100 text-amber-800' },
    { id: 'offer', label: 'Təklif Göndərildi (Offer)', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'hired', label: 'İşə Qəbul Edildi (Hired)', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'archived', label: 'Ehtiyat Baza (Archive)', color: 'bg-slate-200 text-slate-700' },
  ];

  // Key metrics
  const idealMatchesCount = useMemo(() => {
    return Array.from(matchResults.values()).filter(r => r.overallScore >= 85).length;
  }, [matchResults]);

  const avgSalary = useMemo(() => {
    if (candidates.length === 0) return 0;
    const total = candidates.reduce((acc, c) => acc + (c.expectedSalary || 0), 0);
    return Math.round(total / candidates.length);
  }, [candidates]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. TOP HERO HEADER & METRICS BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Ağıllı CV Baza & Rekrutinq Mərkəzi</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    Smart ATS
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Toplu/tək CV idxalı, meyarlar üzrə uyğunluq dərəcəsi və biznes kadr həlləri
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Toplu / Tək CV Əlavə Et</span>
            </button>

            <button
              type="button"
              onClick={() => exportCandidatesToExcel(processedCandidates, `${activeCompany.name}_cv_baza.xlsx`)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Cədvəli Excel formatında yüklə"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel İxrac</span>
            </button>

            <button
              type="button"
              onClick={downloadSampleCSVTemplate}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="CSV cədvəl şablonunu endir"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>CSV Şablonu</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Ümumi Kadr Baza</span>
              <span className="text-lg font-black text-slate-900">{candidates.length} Namizəd</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">İdeal Uyğunluq (85%+)</span>
              <span className="text-lg font-black text-emerald-700">{idealMatchesCount} İstedad</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Müsahibə / Qısa Siyahı</span>
              <span className="text-lg font-black text-purple-700">
                {candidates.filter(c => c.pipelineStage === 'interview' || c.pipelineStage === 'shortlist').length}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Orta Maaş Gözləntisi</span>
              <span className="text-lg font-black text-amber-700">{avgSalary} AZN</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ENTERPRISE POSITION SELECTOR & CRITERIA CONCEPT BAR */}
      <div className="bg-white border border-slate-200/90 text-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                <span>Müəssisə Konsepsiyası Üzrə Aktiv Vəzifə:</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px]">
                  Dinamik Skor Aktivdir
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>«{criteria.targetJobTitle}»</span>
                {activeEnterprisePosition && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {activeEnterprisePosition.department}
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Position Selector Across Company Departments & Custom Roles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-50 rounded-xl p-1 flex items-center gap-2 text-xs border border-slate-200">
              <span className="text-slate-500 font-bold text-[11px] pl-2 hidden sm:inline">Vəzifə seç:</span>
              <select
                value={criteria.targetJobId}
                onChange={e => handleSelectPosition(e.target.value)}
                className="bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-hidden cursor-pointer max-w-[260px] sm:max-w-[320px] truncate shadow-2xs"
              >
                {/* 1. Real Company Vacancies */}
                {vacancies.length > 0 && (
                  <optgroup label="🏢 Şirkətin Aktiv Vakansiyaları">
                    {vacancies.map(v => (
                      <option key={`vac-${v.id}`} value={v.id}>
                        💼 {v.title} ({v.city || 'Bakı'})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. IT & Tech */}
                <optgroup label="💻 İT və Rəqəmsal İnkişaf">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department === 'İT & Rəqəmsal İnkişaf').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.seniorityLevel})
                    </option>
                  ))}
                </optgroup>

                {/* 3. Finance & Accounting */}
                <optgroup label="📊 Maliyyə və Mühasibat">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department === 'Maliyyə və Mühasibat').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                {/* 4. HR */}
                <optgroup label="👥 İnsan Resursları (HR) və Kadrlar">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department === 'İnsan Resursları (HR)').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                {/* 5. Sales & Customer Support */}
                <optgroup label="📈 Satış və Müştəri Xidmətləri">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department === 'Satış və Biznesin İnkişafı').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                {/* 6. Marketing & SMM */}
                <optgroup label="🚀 Marketinq, SMM və Brendinq">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department === 'Marketinq və Brendinq').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                {/* 7. Management & Operations */}
                <optgroup label="⚙️ İdarəetmə, Layihə və Əməliyyatlar">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department.includes('İdarəetmə') || p.department.includes('Hüquq')).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                {/* 8. Logistics, Food & Security */}
                <optgroup label="📦 Logistika, Qida və Təhlükəsizlik">
                  {ENTERPRISE_POSITIONS_CATALOG.filter(p => p.department.includes('Logistika') || p.department.includes('Qida') || p.department.includes('Təhlükəsizlik')).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="⚡ Fərdi Kriteriya">
                  <option value="custom">✍️ Fərdi / Özəl Vəzifə Kriteriyası</option>
                </optgroup>
              </select>
            </div>

            {/* Quick Custom Position Button */}
            <button
              type="button"
              onClick={() => setShowCustomPositionInput(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Siyahıda olmayan fərdi vəzifə yaz"
            >
              <span>+ Fərdi Vəzifə</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCriteriaModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Meyarları Tənzimlə</span>
            </button>
          </div>
        </div>

        {/* Custom Position Quick Input Row */}
        {showCustomPositionInput && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs animate-in fade-in">
            <span className="font-bold text-slate-700">İstənilən vəzifə adını daxil edin:</span>
            <input
              type="text"
              value={customPositionName}
              onChange={e => setCustomPositionName(e.target.value)}
              placeholder="Məs. Baş Hüquqşünas, Mobil Tətbiq Developer, Aşpaz Köməkçisi..."
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 border border-slate-300 text-xs flex-1 min-w-[200px] outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (customPositionName.trim()) {
                  handleSelectPosition('custom', customPositionName.trim());
                  setShowCustomPositionInput(false);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-all shadow-2xs"
            >
              Tətbiq Et & Uyğunluq Hesabla
            </button>
            <button
              type="button"
              onClick={() => setShowCustomPositionInput(false)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
            >
              Ləğv et
            </button>
          </div>
        )}

        {/* Concept Description Banner */}
        {activeEnterprisePosition?.conceptDescription && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-black text-blue-950">Müəssisə Konsepsiyası: </span>
              <span>{activeEnterprisePosition.conceptDescription}</span>
            </div>
          </div>
        )}

        {/* Criteria Summary Badges & Candidate Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium text-[11px]">Tələblər:</span>
            {criteria.seniorityLevel && criteria.seniorityLevel !== 'Any' && (
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                🎖️ {criteria.seniorityLevel}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Min {criteria.minExperienceYears} il təcrübə
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Büdcə: maks {criteria.maxExpectedSalary} AZN
            </span>
            {criteria.requiredSkills.slice(0, 4).map(sk => (
              <span key={sk} className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                ✓ {sk}
              </span>
            ))}
          </div>

          <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-2">
            <span>🎯 «{criteria.targetJobTitle}» üzrə İdeal Namizədlər:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black shadow-2xs">
              {idealMatchesCount} nəfər
            </span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS & VIEW SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cədvəl & Reytinq ({processedCandidates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('pipeline')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'pipeline' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rekrutinq Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'analytics' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analitika</span>
          </button>
        </div>

        {/* Compare button if 2-4 selected */}
        {selectedIds.length >= 2 && selectedIds.length <= 4 && (
          <button
            type="button"
            onClick={() => setIsComparisonModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Scale className="w-4 h-4" />
            <span>{selectedIds.length} Namizədi Müqayisə Et</span>
          </button>
        )}
      </div>

      {/* 4. SEARCH, FILTER & BATCH ACTIONS TOOLBAR (TABLE & PIPELINE) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ad, vəzifə, bacarıq və ya şəhər üzrə axtarış..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={e => setScoreFilter(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">Bütün Skarlar</option>
              <option value="ideal">🌟 İdeal (85%+)</option>
              <option value="high">👍 Yüksək (70-84%)</option>
              <option value="medium">⚠️ Qismən (50-69%)</option>
            </select>

            {/* Pipeline Stage Filter */}
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">Bütün Mərhələlər</option>
              {pipelineStages.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="score">Uyğunluq Skoru (% Match)</option>
              <option value="experience">Təcrübə İli</option>
              <option value="salary">Maaş Gözləntisi</option>
              <option value="date">Əlavə Edilmə Tarixi</option>
            </select>
          </div>
        </div>

        {/* Batch Actions Bar (when candidates are selected) */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{selectedIds.length} namizəd seçildi</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 font-medium">Statusu dəyiş:</span>
              <select
                onChange={e => e.target.value && handleBatchChangeStage(e.target.value as any)}
                defaultValue=""
                className="px-2.5 py-1 border border-blue-300 rounded-lg text-xs bg-white font-bold"
              >
                <option value="" disabled>
                  Mərhələ seçin...
                </option>
                {pipelineStages.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleBatchDelete}
                className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. VIEW A: RANKED TABLE VIEW */}
      {activeView === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {processedCandidates.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  Axtarışa və ya filtrlərə uyğun namizəd tapılmadı
                </h3>
                <p className="text-xs text-slate-500">
                  Yeni CV-lər yükləyə, filtrləri sıfırlaya və ya 1-kliklə 15 nümunə Azərbaycan kadrını bazaya əlavə edə bilərsiniz.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  CV Faylları Yüklə
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStageFilter('all');
                    setScoreFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Filtrləri Sıfırla
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="cursor-pointer text-slate-400 hover:text-slate-700"
                      >
                        {selectedIds.length === processedCandidates.length ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5 min-w-[220px]">Namizəd & Fiziki CV</th>
                    <th className="p-3.5 min-w-[150px]">Vəzifəyə Uyğunluq (% Skor)</th>
                    <th className="p-3.5 min-w-[190px]">Uyğun Ola Biləcək Vəzifələr</th>
                    <th className="p-3.5 min-w-[180px]">Son / Hazırkı İş Yeri</th>
                    <th className="p-3.5 min-w-[120px]">İş Təcrübəsi</th>
                    <th className="p-3.5 min-w-[140px]">Gözlənilən Maaş & Şəhər</th>
                    <th className="p-3.5 min-w-[180px]">Əsas Bacarıqlar</th>
                    <th className="p-3.5 min-w-[160px]">Təhsil & Dillər</th>
                    <th className="p-3.5 min-w-[130px]">Mərhələ (Status)</th>
                    <th className="p-3.5 text-right min-w-[110px]">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedCandidates.map((c, idx) => {
                    const fit = matchResults.get(c.id);
                    const score = fit?.overallScore ?? 70;
                    const isSelected = selectedIds.includes(c.id);

                    let scoreBadge = 'bg-emerald-600 text-white';
                    if (score >= 85) scoreBadge = 'bg-emerald-600 text-white';
                    else if (score >= 70) scoreBadge = 'bg-blue-600 text-white';
                    else if (score >= 50) scoreBadge = 'bg-amber-500 text-white';
                    else scoreBadge = 'bg-rose-500 text-white';

                    const lastExperience = c.workExperiences?.[0];

                    return (
                      <tr
                        key={`${c.id}-${idx}`}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectCandidate(c.id)}
                            className="cursor-pointer text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Column 1: Candidate Name & Physical CV Direct Access */}
                        <td className="p-3.5">
                          <div className="flex items-start gap-2.5">
                            <div
                              onClick={() => setSelectedCandidateForPhysicalCV(c)}
                              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                              title="Fiziki CV-yə Baxmaq üçün klikləyin"
                            >
                              {c.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  onClick={() => setSelectedCandidateForPhysicalCV(c)}
                                  className="font-black text-slate-900 hover:text-blue-600 cursor-pointer truncate text-xs"
                                  title="Fiziki CV Sənədini Ekranda Aç"
                                >
                                  {c.fullName}
                                </span>
                                {c.aiAnalyzed && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-700 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                    AI
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-slate-700 truncate flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{c.jobTitle}</span>
                              </div>
                              
                              {/* Direct Physical CV Trigger Button */}
                              <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCandidateForPhysicalCV(c);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                                  title="Fiziki CV Sənədini Ekranda Aç (PDF / Sənəd rejimi)"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  <span>📄 Fiziki CV-ni Aç</span>
                                  {c.fileDataUrl && <span className="text-[9px] text-emerald-600 font-bold">• PDF</span>}
                                </button>
                              </div>

                              {/* Contact snippet */}
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                                {c.phone && <span>📞 {c.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Compatibility Score for Currently Selected Role */}
                        <td className="p-3.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {fit?.knockoutResult?.disqualified ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                  ⛔ Kənarlaşdırılıb
                                </span>
                              ) : (
                                <>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${scoreBadge}`}>
                                    {score}%
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-800">
                                    {score >= 85 ? 'İdeal' : score >= 70 ? 'Yüksək' : score >= 50 ? 'Qismən' : 'Aşağı'}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  fit?.knockoutResult?.disqualified
                                    ? 'bg-rose-500'
                                    : score >= 85
                                    ? 'bg-emerald-600'
                                    : score >= 70
                                    ? 'bg-blue-600'
                                    : score >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>

                            {fit?.percentileRank && !fit?.knockoutResult?.disqualified && (
                              <div className="text-[10px] font-bold text-indigo-700">
                                Top %{fit.percentileRank} kadr reytinqi
                              </div>
                            )}

                            <div className="text-[10px] text-slate-500 line-clamp-1" title={fit?.recommendation}>
                              {score >= 85 ? 'Kritik tələblər tam ödənilib' : score >= 70 ? 'Əsas tələblərə uyğundur' : 'Müəyyən fərqlər var'}
                            </div>
                          </div>
                        </td>

                        {/* Column 3: Suitable Positions (Uyğun ola biləcək vəzifələr) */}
                        <td className="p-3.5">
                          <div className="space-y-1.5 max-w-[210px]">
                            {c.suitablePositions && c.suitablePositions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {c.suitablePositions.slice(0, 3).map((pos, pIdx) => (
                                  <span
                                    key={`${pos}-${pIdx}`}
                                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold inline-block"
                                    title={pos}
                                  >
                                    💼 {pos}
                                  </span>
                                ))}
                                {c.suitablePositions.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    +{c.suitablePositions.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Əsas vəzifə: {c.jobTitle}
                              </span>
                            )}

                            {c.bestMatchingVacancyTitle && (
                              <div className="text-[10px] text-emerald-700 font-black truncate bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                🎯 Vakansiya: {c.bestMatchingVacancyTitle} ({c.bestMatchScore || 80}%)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Column 4: Last Workplace (Axırıncı iş yeri və şirkət) */}
                        <td className="p-3.5">
                          {lastExperience ? (
                            <div className="space-y-1 max-w-[190px]">
                              <div className="font-black text-slate-900 text-xs flex items-center gap-1 truncate" title={lastExperience.companyName}>
                                <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{lastExperience.companyName}</span>
                              </div>
                              <div className="text-[11px] font-bold text-slate-600 truncate" title={lastExperience.jobTitle}>
                                {lastExperience.jobTitle}
                              </div>
                              <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>
                                  {lastExperience.startDate || '2021'} — {lastExperience.isCurrent ? 'Hazırda çalışır' : lastExperience.endDate || '2024'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              <span className="font-bold text-slate-700 block">{c.jobTitle}</span>
                              <span className="text-[10px] text-slate-400">Ümumi staj: {c.experienceYears} il</span>
                            </div>
                          )}
                        </td>

                        {/* Column 5: Work Experience & Career Level (Nə qədər iş təcrübəsi var) */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className="font-black text-slate-900 text-xs block">
                              {c.experienceYears} il staj
                            </span>
                            {c.careerLevel && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 inline-block">
                                🎖️ {c.careerLevel}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 6: Expected Salary & City */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="font-black text-emerald-700 text-xs block">
                              {c.expectedSalary} {c.currency || 'AZN'}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{c.location}</span>
                            </span>
                          </div>
                        </td>

                        {/* Column 7: Skills (Tech Stack) */}
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[190px]">
                            {c.skills.slice(0, 4).map(sk => {
                              const isMatched = fit?.matchedSkills?.some(m => m.toLowerCase() === sk.toLowerCase());
                              return (
                                <span
                                  key={sk}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isMatched
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {sk}
                                </span>
                              );
                            })}
                            {c.skills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{c.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 8: Education & Languages */}
                        <td className="p-3.5">
                          <div className="space-y-1 max-w-[160px] text-[11px]">
                            <div className="font-bold text-slate-800 truncate flex items-center gap-1" title={c.educationDetails || c.educationLevel}>
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">{c.educationLevel}</span>
                            </div>
                            {c.educationDetails && (
                              <div className="text-[10px] text-slate-500 truncate" title={c.educationDetails}>
                                {c.educationDetails.split('—')[0]}
                              </div>
                            )}
                            {c.languages && c.languages.length > 0 && (
                              <div className="text-[10px] text-indigo-700 truncate font-semibold">
                                🌐 {c.languages.map(l => l.language).slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Column 9: Stage Selector */}
                        <td className="p-3.5">
                          <select
                            value={c.pipelineStage}
                            onChange={e =>
                              handleUpdateCandidate({
                                ...c,
                                pipelineStage: e.target.value as any,
                              })
                            }
                            className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="sourced">Daxil Olub</option>
                            <option value="screened">Skrininq</option>
                            <option value="interview">Müsahibə</option>
                            <option value="shortlist">Qısa Siyahı</option>
                            <option value="offer">İş Təklifi</option>
                            <option value="hired">İşə Qəbul</option>
                            <option value="archived">Ehtiyat</option>
                          </select>
                        </td>

                        {/* Column 10: Actions */}
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForPhysicalCV(c)}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                              title="Fiziki CV Sənədini Ekranda Aç (PDF / Sənəd)"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForDetail(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Detallı Baxış & Qeydlər"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForOutreach(c)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                              title="Müsahibəyə Dəvət Göndər"
                            >
                              <Send className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(c.id, c.fullName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Bazadan Sil"
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
          )}
        </div>
      )}

      {/* 5. VIEW B: RECRUITMENT PIPELINE / KANBAN BOARD */}
      {activeView === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {pipelineStages.map(stage => {
            const stageCandidates = processedCandidates.filter(c => c.pipelineStage === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 space-y-2.5 flex flex-col min-w-[200px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-800 truncate">{stage.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2 flex-1 min-h-[250px]">
                  {stageCandidates.map((c, idx) => {
                    const fit = matchResults.get(c.id);
                    const score = fit?.overallScore ?? 70;
                    return (
                      <div
                        key={`${c.id}-${idx}`}
                        className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs space-y-2 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4
                              onClick={() => setSelectedCandidateForDetail(c)}
                              className="font-bold text-xs text-slate-900 group-hover:text-blue-600 cursor-pointer"
                            >
                              {c.fullName}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">{c.jobTitle}</p>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                              score >= 85
                                ? 'bg-emerald-600 text-white'
                                : score >= 70
                                ? 'bg-blue-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {score}%
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-600 flex justify-between">
                          <span>{c.experienceYears} il təcrübə</span>
                          <span className="font-bold text-emerald-700">{c.expectedSalary} AZN</span>
                        </div>

                        {/* Quick Stage Mover */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidateForPhysicalCV(c)}
                            className="text-slate-600 hover:text-blue-600 font-bold cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>CV Sənədi</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForDetail(c)}
                              className="text-blue-600 font-bold hover:underline cursor-pointer"
                            >
                              Baxış
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateForOutreach(c)}
                              className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Dəvət</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageCandidates.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 italic">
                      Namizəd yoxdur
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VIEW C: TALENT ANALYTICS */}
      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Experience Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Təcrübə Səviyyəsi Üzrə Paylanma</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>0 - 2 il (Junior / Başlanğıc):</span>
                  <span>{candidates.filter(c => c.experienceYears <= 2).length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${(candidates.filter(c => c.experienceYears <= 2).length / (candidates.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>3 - 5 il (Mid / Təcrübəli):</span>
                  <span>{candidates.filter(c => c.experienceYears > 2 && c.experienceYears <= 5).length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${(candidates.filter(c => c.experienceYears > 2 && c.experienceYears <= 5).length / (candidates.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>5+ il (Senior / Aparıcı Mütəxəssis):</span>
                  <span>{candidates.filter(c => c.experienceYears > 5).length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(candidates.filter(c => c.experienceYears > 5).length / (candidates.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Match Score Funnel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Uyğunluq Reytinqi Qrupları</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center font-bold text-emerald-900">
                <span>🌟 İdeal Uyğunluq (85%+):</span>
                <span className="text-sm font-black">{idealMatchesCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center font-bold text-blue-900">
                <span>👍 Yüksək Uyğunluq (70-84%):</span>
                <span className="text-sm font-black">
                  {Array.from(matchResults.values()).filter(r => r.overallScore >= 70 && r.overallScore < 85).length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center font-bold text-amber-900">
                <span>⚠️ Qismən Uyğunluq (50-69%):</span>
                <span className="text-sm font-black">
                  {Array.from(matchResults.values()).filter(r => r.overallScore >= 50 && r.overallScore < 70).length}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Top Sourced Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Ən Çox Rast Gəlinən Bacarıqlar</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(
                new Set(candidates.flatMap(c => c.skills))
              )
                .slice(0, 16)
                .map(sk => (
                  <span
                    key={sk}
                    className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {sk}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD CV (BULK/MANUAL/PASTE) */}
      <UploadCVModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddCandidates={handleAddCandidates}
        vacancies={vacancies}
        targetCriteria={criteria}
      />

      {/* MODAL 2: CRITERIA CONFIG */}
      <CriteriaConfigModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        criteria={criteria}
        onSaveCriteria={setCriteria}
      />

      {/* MODAL 3: CANDIDATE DETAIL */}
      {selectedCandidateForDetail && (
        <CandidateDetailModal
          isOpen={Boolean(selectedCandidateForDetail)}
          onClose={() => setSelectedCandidateForDetail(null)}
          candidate={selectedCandidateForDetail}
          matchResult={matchResults.get(selectedCandidateForDetail.id)}
          company={activeCompany}
          targetJobTitle={criteria.targetJobTitle}
          onUpdateCandidate={handleUpdateCandidate}
          onOpenOutreach={cand => {
            setSelectedCandidateForDetail(null);
            setSelectedCandidateForOutreach(cand);
          }}
        />
      )}

      {/* MODAL 4: OUTREACH GENERATOR */}
      {selectedCandidateForOutreach && (
        <OutreachModal
          isOpen={Boolean(selectedCandidateForOutreach)}
          onClose={() => setSelectedCandidateForOutreach(null)}
          candidate={selectedCandidateForOutreach}
          company={activeCompany}
          targetJobTitle={criteria.targetJobTitle}
        />
      )}

      {/* MODAL 5: COMPARISON MATRIX */}
      <CandidateComparisonMatrixModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        candidates={processedCandidates.filter(c => selectedIds.includes(c.id))}
        matchResults={matchResults}
        targetJobTitle={criteria.targetJobTitle}
        maxBudget={criteria.maxExpectedSalary}
        onOpenOutreach={cand => {
          setIsComparisonModalOpen(false);
          setSelectedCandidateForOutreach(cand);
        }}
      />

      {/* MODAL 6: PHYSICAL CV VIEWER */}
      <PhysicalCVViewerModal
        isOpen={Boolean(selectedCandidateForPhysicalCV)}
        onClose={() => setSelectedCandidateForPhysicalCV(null)}
        candidate={selectedCandidateForPhysicalCV}
        matchResult={selectedCandidateForPhysicalCV ? matchResults.get(selectedCandidateForPhysicalCV.id) : null}
      />
    </div>
  );
};
