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
  ArrowRight
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">Peşəkar İcma</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Canlı Əlaqələr
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Azərbaycanın peşəkar mütəxəssisləri və işəgötürənləri ilə birbaşa əlaqə saxlayın, təcrübə mübadiləsi aparın və karyeranızı inkişaf etdirin.
            </p>
          </div>

          {/* User Quick Status CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser?.role === 'candidate' ? (
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuthModal?.('login', 'candidate');
                  else setIsOpenToWorkModalOpen(true);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  currentUser?.openToWork?.isOpen
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                {currentUser?.openToWork?.isOpen ? '🎯 Təkliflərə Açıqsınız' : '+ Təkliflərə Açıq Ol'}
              </button>
            ) : null}

            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-900 block">{acceptedConnectionsCount}</span>
              <span className="text-[10px] text-slate-500 font-medium">Əlaqə</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ad, vəzifə (Mühəndis, HR, Marketoloq), bacarıq və ya şirkət üzrə axtar..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Bütün İştirakçılar' },
              { id: 'open_to_work', label: '🎯 Təkliflərə Açıq' },
              { id: 'hiring', label: '📢 Kadr Axtaranlar' },
              { id: 'my_connections', label: `🤝 Əlaqələrim (${acceptedConnectionsCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
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
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Gələn Bağlantı Dəvətləri ({incomingRequests.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.requesterAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.requesterName)}`}
                    alt={req.requesterName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{req.requesterName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{req.requesterTitle || 'Mütəxəssis'}</div>
                    {req.mutualCount && (
                      <div className="text-[10px] text-slate-400 font-medium">{req.mutualCount} qarşılıqlı əlaqə</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req.id, req.requesterName)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    Qəbul et
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
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
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Peşəkar şəbəkə yüklənir...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Heç bir profil tapılmadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Axtarış meyarlarını dəyişin və ya filtri sıfırlayın.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Filtri təmizlə
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((cand) => {
            const { status } = getConnectionStatus(currentUser?.id || 'guest', cand.id, connections);
            const isOpenToWork = cand.openToWork?.isOpen ?? cand.isOpenToEmployers ?? true;
            const isHiring = Boolean(cand.hiring?.isHiring);
            const candidateEndorsements = endorsementsStore[cand.id] || {};

            return (
              <div
                key={cand.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header Strip */}
                <div className="h-16 bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 relative">
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
                <div className="p-4 pt-0 flex-1 flex flex-col items-center text-center -mt-8">
                  <OpenToWorkBadge
                    name={cand.fullName}
                    avatarUrl={cand.profilePhoto}
                    isOpenToWork={isOpenToWork}
                    isHiring={isHiring}
                    size="lg"
                    className="shadow-sm mb-2.5"
                  />

                  {/* Name & Title */}
                  <div className="w-full">
                    <button
                      onClick={() => setSelectedCandidateForDetail(cand)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{cand.fullName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </button>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 min-h-[32px] px-2 font-medium">
                      {cand.professionalTitle}
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cand.location || 'Bakı'}
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">
                      {cand.connectionsCount || 0}+ əlaqə
                    </span>
                  </div>

                  {/* Top Skills Tags with Endorsement badges */}
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3 w-full">
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
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  {status === 'connected' ? (
                    <button
                      onClick={() => onOpenChatWithUser?.(cand)}
                      className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Mesaj yaz
                    </button>
                  ) : status === 'pending_sent' ? (
                    <button
                      disabled
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Gözləmədə
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectClick(cand)}
                      className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Bağlantı qur
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCandidateForDetail(cand)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
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
