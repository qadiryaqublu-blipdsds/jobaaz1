import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Users, 
  UserPlus, 
  Check, 
  Clock, 
  Sparkles, 
  Briefcase, 
  Building2, 
  MapPin, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Award,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  Grid
} from 'lucide-react';
import { CandidateProfile, User, ProfessionalConnection } from '../../types';
import { OpenToWorkBadge } from './OpenToWorkBadge';
import { OpenToWorkModal } from './OpenToWorkModal';
import { ProfessionalProfileModal } from './ProfessionalProfileModal';
import { 
  getUserConnections, 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  declineConnectionRequest,
  getConnectionStatus,
  getStoredSkillEndorsements
} from '../../services/networkService';
import { getPublicCandidateProfiles } from '../../services/firestoreService';
import { SectionBottomLogo } from '../common/SectionBottomLogo';

interface ProfessionalNetworkViewProps {
  currentUser: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: 'candidate' | 'business') => void;
  onOpenChatWithUser?: (userOrCandidate: any) => void;
  onUpdateCurrentUser?: (user: User) => void;
  onShowToast?: (msg: string) => void;
}

export const ProfessionalNetworkView: React.FC<ProfessionalNetworkViewProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenChatWithUser,
  onUpdateCurrentUser,
  onShowToast,
}) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open_to_work' | 'hiring' | 'my_connections'>('all');

  // Modals
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<CandidateProfile | null>(null);
  const [isOpenToWorkModalOpen, setIsOpenToWorkModalOpen] = useState(false);

  // View mode: 'compact' (Şüşə-Şəbəkə, max people visible) vs 'standard'
  const [viewDensity, setViewDensity] = useState<'compact' | 'standard'>('compact');

  // Skill endorsements store for card preview
  const [endorsementsStore, setEndorsementsStore] = useState(() => getStoredSkillEndorsements());

  // Load public candidates & connections
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [loadedCandidates, loadedConnections] = await Promise.all([
          getPublicCandidateProfiles(),
          getUserConnections(currentUser?.id || 'guest')
        ]);
        if (isMounted) {
          setCandidates(loadedCandidates);
          setConnections(loadedConnections);
        }
      } catch (err) {
        console.error('Error loading network:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  // Incoming pending requests directed to current user
  const incomingRequests = useMemo(() => {
    return connections.filter(
      (c) => c.status === 'pending' && (c.recipientId === currentUser?.id || c.recipientId === 'current_user')
    );
  }, [connections, currentUser?.id]);

  // Connection count for current user
  const acceptedConnectionsCount = useMemo(() => {
    return connections.filter((c) => c.status === 'accepted').length;
  }, [connections]);

  // Filtered list of professionals
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      // Exclude self if logged in
      if (currentUser && (cand.id === currentUser.id || cand.userId === currentUser.id)) {
        return false;
      }

      // Filter by type
      if (activeFilter === 'open_to_work') {
        const isOpen = cand.openToWork?.isOpen ?? cand.isOpenToEmployers ?? true;
        if (!isOpen) return false;
      } else if (activeFilter === 'hiring') {
        if (!cand.hiring?.isHiring) return false;
      } else if (activeFilter === 'my_connections') {
        const status = getConnectionStatus(currentUser?.id || 'guest', cand.id, connections);
        if (status.status !== 'connected') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = cand.fullName.toLowerCase().includes(q);
        const titleMatch = (cand.professionalTitle || '').toLowerCase().includes(q);
        const locationMatch = (cand.location || '').toLowerCase().includes(q);
        const skillsMatch = (cand.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !titleMatch && !locationMatch && !skillsMatch) return false;
      }

      return true;
    });
  }, [candidates, currentUser, activeFilter, searchQuery, connections]);

  // Actions
  const handleConnectClick = async (targetCandidate: CandidateProfile) => {
    if (!currentUser) {
      onOpenAuthModal?.('login', 'candidate');
      return;
    }

    const { status } = getConnectionStatus(currentUser.id, targetCandidate.id, connections);
    if (status === 'connected' || status === 'pending_sent') return;

    try {
      const newConn = await sendConnectionRequest(currentUser, targetCandidate);
      setConnections((prev) => [newConn, ...prev.filter((c) => c.id !== newConn.id)]);
      onShowToast?.(`${targetCandidate.fullName} mütəxəssisinə bağlantı sorğusu göndərildi!`);
    } catch (err) {
      console.error('Connection request error:', err);
    }
  };

  const handleAcceptRequest = async (connId: string, requesterName: string) => {
    await acceptConnectionRequest(connId);
    setConnections((prev) =>
      prev.map((c) => (c.id === connId ? { ...c, status: 'accepted' as const } : c))
    );
    onShowToast?.(`${requesterName} ilə uğurla əlaqə quruldu! Artıq 1-ci dərəcəli bağlantısınız.`);
  };

  const handleDeclineRequest = async (connId: string) => {
    await declineConnectionRequest(connId);
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  const handleSaveOpenToWork = async (prefs: any) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      openToWork: prefs,
      isOpenToEmployers: prefs.isOpen,
    };
    onUpdateCurrentUser?.(updated);
    onShowToast?.(
      prefs.isOpen
        ? '"Təkliflərə Açıq" statusunuz aktivləşdirildi! Profilinizdə xüsusi nişan əks olunacaq.'
        : '"Təkliflərə Açıq" statusu deaktiv edildi.'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-5 py-4 space-y-3.5 animate-in fade-in duration-200">
      
      {/* Top Banner & Header - Sleek Glassmorphism */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200/85 p-3.5 sm:p-4.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Peşəkar Şəbəkə</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" /> Şüşə-Şəbəkə Vitrini
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({filteredCandidates.length} aktiv mütəxəssis)
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Mütəxəssislər və işəgötürənlərlə canlı əlaqə saxlayın, təcrübə mübadiləsi aparın və karyeranızı inkişaf etdirin.
            </p>
          </div>

          {/* Quick Actions & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {currentUser?.role === 'candidate' ? (
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuthModal?.('login', 'candidate');
                  else setIsOpenToWorkModalOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  currentUser?.openToWork?.isOpen
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{currentUser?.openToWork?.isOpen ? '🎯 Təkliflərə Açıq' : '+ Təkliflərə Açıq Ol'}</span>
              </button>
            ) : null}

            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 leading-none">{acceptedConnectionsCount}</span>
              <span className="text-[9.5px] text-slate-500 font-medium ml-1">əlaqə</span>
            </div>

            {/* Density Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewDensity('compact')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewDensity === 'compact'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kompakt Şüşə-Şəbəkə (çoxlu profil pəncərədə)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kompakt</span>
              </button>
              <button
                type="button"
                onClick={() => setViewDensity('standard')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewDensity === 'standard'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Geniş Mənzərə"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Geniş</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100/90 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ad, vəzifə, bacarıq və ya şirkət üzrə axtar..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
            {[
              { id: 'all', label: 'Bütün İştirakçılar' },
              { id: 'open_to_work', label: '🎯 Təkliflərə Açıq' },
              { id: 'hiring', label: '📢 Kadr Axtaranlar' },
              { id: 'my_connections', label: `🤝 Əlaqələrim (${acceptedConnectionsCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incoming Connection Invitations Banner */}
      {incomingRequests.length > 0 && (
        <div className="bg-amber-50/80 backdrop-blur-xs border border-amber-200/90 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Gələn Bağlantı Dəvətləri ({incomingRequests.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={req.requesterAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.requesterName)}`}
                    alt={req.requesterName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{req.requesterName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{req.requesterTitle || 'Mütəxəssis'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req.id, req.requesterName)}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer shadow-2xs"
                  >
                    Qəbul et
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                  >
                    İmtina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Professionals */}
      {isLoading ? (
        <div className="py-16 text-center space-y-2.5">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Şüşə-şəbəkə yüklənir...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-700">Heç bir profil tapılmadı</h3>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Axtarış meyarlarını dəyişin və ya filtri sıfırlayın.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Filtri təmizlə
          </button>
        </div>
      ) : viewDensity === 'compact' ? (
        /* COMPACT GLASS GRID (ŞÜŞƏ-ŞƏBƏKƏ - Maximum Candidates in Viewport) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
          {filteredCandidates.map((cand) => {
            const { status } = getConnectionStatus(currentUser?.id || 'guest', cand.id, connections);
            const isOpenToWork = cand.openToWork?.isOpen ?? cand.isOpenToEmployers ?? true;
            const isHiring = Boolean(cand.hiring?.isHiring);
            const candidateEndorsements = endorsementsStore[cand.id] || {};

            return (
              <div
                key={cand.id}
                className="bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Compact Top Glass Accent Stripe */}
                <div className="h-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border-b border-slate-100/80 px-2 flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-500 font-medium flex items-center gap-0.5 truncate max-w-[70px]">
                    <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                    <span className="truncate">{cand.location || 'Bakı'}</span>
                  </span>
                  {isOpenToWork ? (
                    <span className="px-1.5 py-0.2 text-[8px] font-black bg-emerald-100/90 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Açıq
                    </span>
                  ) : isHiring ? (
                    <span className="px-1.5 py-0.2 text-[8px] font-black bg-purple-100/90 text-purple-800 border border-purple-200 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                      Kadr
                    </span>
                  ) : (
                    <span className="text-[8.5px] text-slate-400 font-medium">Jobia</span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-2 pt-1.5 flex-1 flex flex-col items-center text-center">
                  <OpenToWorkBadge
                    name={cand.fullName}
                    avatarUrl={cand.profilePhoto}
                    isOpenToWork={isOpenToWork}
                    isHiring={isHiring}
                    size="sm"
                    showBadgePill={false}
                    className="mb-1"
                  />

                  {/* Name */}
                  <button
                    onClick={() => setSelectedCandidateForDetail(cand)}
                    className="text-[11.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-0.5 max-w-full truncate cursor-pointer leading-snug"
                    title={cand.fullName}
                  >
                    <span className="truncate">{cand.fullName}</span>
                    <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                  </button>

                  {/* Title */}
                  <p
                    className="text-[10px] text-slate-500 line-clamp-1 font-medium w-full truncate mt-0.5"
                    title={cand.professionalTitle}
                  >
                    {cand.professionalTitle || 'Mütəxəssis'}
                  </p>

                  {/* Connection Count */}
                  <div className="text-[9.5px] text-blue-600 font-semibold mt-1">
                    {cand.connectionsCount || 0}+ əlaqə
                  </div>

                  {/* Top 2 Skills */}
                  <div className="flex flex-wrap justify-center gap-1 mt-1.5 w-full">
                    {(cand.skills || []).slice(0, 2).map((skill) => {
                      const count = candidateEndorsements[skill]?.count || 0;
                      return (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 rounded text-[8.5px] font-medium bg-slate-100/90 text-slate-600 border border-slate-200/60 truncate max-w-[76px]"
                          title={skill}
                        >
                          {skill} {count > 0 && <span className="text-blue-600 font-bold">+{count}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-1 px-1.5 bg-slate-50/80 backdrop-blur-xs border-t border-slate-100 flex items-center gap-1">
                  {status === 'connected' ? (
                    <button
                      onClick={() => onOpenChatWithUser?.(cand)}
                      className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Mesaj</span>
                    </button>
                  ) : status === 'pending_sent' ? (
                    <button
                      disabled
                      className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1 opacity-80 cursor-not-allowed"
                    >
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Gözləyir</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectClick(cand)}
                      className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Bağlan</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCandidateForDetail(cand)}
                    className="p-1 px-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="Ətraflı profil və bacarıqların təsdiqi"
                  >
                    Profil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STANDARD VIEW (Geniş 3-4 Sütun) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCandidates.map((cand) => {
            const { status } = getConnectionStatus(currentUser?.id || 'guest', cand.id, connections);
            const isOpenToWork = cand.openToWork?.isOpen ?? cand.isOpenToEmployers ?? true;
            const isHiring = Boolean(cand.hiring?.isHiring);
            const candidateEndorsements = endorsementsStore[cand.id] || {};

            return (
              <div
                key={cand.id}
                className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header Strip */}
                <div className="h-14 bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 relative">
                  {isOpenToWork && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md">
                      🎯 Təkliflərə Açıq
                    </span>
                  )}
                  {isHiring && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 rounded-md">
                      📢 Kadr Axtarır
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 pt-0 flex-1 flex flex-col items-center text-center -mt-7">
                  <OpenToWorkBadge
                    name={cand.fullName}
                    avatarUrl={cand.profilePhoto}
                    isOpenToWork={isOpenToWork}
                    isHiring={isHiring}
                    size="md"
                    showBadgePill={false}
                    className="shadow-sm mb-2"
                  />

                  {/* Name & Title */}
                  <div className="w-full">
                    <button
                      onClick={() => setSelectedCandidateForDetail(cand)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="truncate">{cand.fullName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </button>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 min-h-[30px] px-1 font-medium">
                      {cand.professionalTitle}
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center justify-center gap-2 text-[10.5px] text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cand.location || 'Bakı'}
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">
                      {cand.connectionsCount || 0}+ əlaqə
                    </span>
                  </div>

                  {/* Top Skills Tags */}
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2.5 w-full">
                    {(cand.skills || []).slice(0, 3).map((skill) => {
                      const count = candidateEndorsements[skill]?.count || 0;
                      return (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200"
                        >
                          {skill} {count > 0 && <span className="text-blue-600 font-bold">+{count}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  {status === 'connected' ? (
                    <button
                      onClick={() => onOpenChatWithUser?.(cand)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Mesaj yaz
                    </button>
                  ) : status === 'pending_sent' ? (
                    <button
                      disabled
                      className="flex-1 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Gözləmədə
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectClick(cand)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Bağlantı qur
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCandidateForDetail(cand)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="Ətraflı profil və bacarıqların təsdiqi"
                  >
                    Profil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section Bottom Logo */}
      <SectionBottomLogo size="sm" />

      {/* Detail Modal */}
      {selectedCandidateForDetail && (
        <ProfessionalProfileModal
          isOpen={Boolean(selectedCandidateForDetail)}
          onClose={() => setSelectedCandidateForDetail(null)}
          candidate={selectedCandidateForDetail}
          currentUser={currentUser}
          connectionStatus={
            getConnectionStatus(currentUser?.id || 'guest', selectedCandidateForDetail.id, connections).status
          }
          onConnect={handleConnectClick}
          onOpenChat={(cand) => {
            setSelectedCandidateForDetail(null);
            onOpenChatWithUser?.(cand);
          }}
          onRequireAuth={() => onOpenAuthModal?.('login', 'candidate')}
        />
      )}

      {/* OpenToWork Modal */}
      {isOpenToWorkModalOpen && (
        <OpenToWorkModal
          isOpen={isOpenToWorkModalOpen}
          onClose={() => setIsOpenToWorkModalOpen(false)}
          currentUser={currentUser}
          onSavePreferences={handleSaveOpenToWork}
        />
      )}
    </div>
  );
};
