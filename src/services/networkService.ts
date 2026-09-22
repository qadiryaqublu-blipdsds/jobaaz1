import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  User, 
  CandidateProfile, 
  ProfessionalConnection, 
  SkillEndorsement, 
  ProfessionalRecommendation, 
  OpenToWorkPreferences, 
  HiringPreferences,
  ConnectionStatus
} from '../types';
import { sanitizeForFirestore } from './firestoreService';

// -------------------------------------------------------------
// LOCAL STORAGE KEYS & FALLBACKS
// -------------------------------------------------------------
const LS_CONNECTIONS_KEY = 'jobia_network_connections';
const LS_ENDORSEMENTS_KEY = 'jobia_skill_endorsements';
const LS_RECOMMENDATIONS_KEY = 'jobia_recommendations';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// -------------------------------------------------------------
// SEED INITIAL CONNECTIONS & DATA (Real users only, no ghost profiles)
// -------------------------------------------------------------
const INITIAL_DEMO_CONNECTIONS: ProfessionalConnection[] = [];

// -------------------------------------------------------------
// CONNECTION MANAGEMENT
// -------------------------------------------------------------

export async function getUserConnections(userId: string): Promise<ProfessionalConnection[]> {
  let localList = getLocal<ProfessionalConnection[]>(LS_CONNECTIONS_KEY, []);
  
  // Clean up any stale ghost/demo connections from local storage
  if (localList.some((c) => c.id?.startsWith('conn-demo-') || c.requesterId?.startsWith('cand-seed-'))) {
    localList = localList.filter((c) => !c.id?.startsWith('conn-demo-') && !c.requesterId?.startsWith('cand-seed-'));
    setLocal(LS_CONNECTIONS_KEY, localList);
  }

  try {
    const snap = await getDocs(collection(db, 'networkConnections'));
    const firestoreList: ProfessionalConnection[] = [];
    snap.forEach((d) => {
      const data = d.data() as ProfessionalConnection;
      // Skip any legacy demo connections
      if (d.id?.startsWith('conn-demo-') || data.requesterId?.startsWith('cand-seed-')) return;

      if (data && (data.requesterId === userId || data.recipientId === userId || data.recipientId === 'current_user')) {
        firestoreList.push({ ...data, id: d.id });
      }
    });

    if (firestoreList.length > 0) {
      // Merge with local list (avoiding duplicate IDs)
      const map = new Map<string, ProfessionalConnection>();
      localList.forEach((c) => map.set(c.id, c));
      firestoreList.forEach((c) => map.set(c.id, c));
      const merged = Array.from(map.values());
      setLocal(LS_CONNECTIONS_KEY, merged);
      return merged;
    }
  } catch (err) {
    console.warn('Notice: Using local connections storage:', err);
  }

  return localList.filter((c) => c.requesterId === userId || c.recipientId === userId || c.recipientId === 'current_user');
}

export async function sendConnectionRequest(
  requester: User,
  recipient: { id: string; fullName: string; professionalTitle?: string; jobTitle?: string; avatarUrl?: string; profilePhoto?: string }
): Promise<ProfessionalConnection> {
  const connectionId = `conn-${requester.id}-${recipient.id}`;
  const newConn: ProfessionalConnection = {
    id: connectionId,
    requesterId: requester.id,
    requesterName: requester.fullName || requester.email,
    requesterTitle: requester.jobTitle || 'Peşəkar mütəxəssis',
    requesterAvatar: requester.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(requester.fullName || requester.email)}`,
    recipientId: recipient.id,
    recipientName: recipient.fullName,
    recipientTitle: recipient.professionalTitle || recipient.jobTitle || 'Peşəkar mütəxəssis',
    recipientAvatar: recipient.profilePhoto || recipient.avatarUrl,
    status: 'pending',
    mutualCount: Math.floor(Math.random() * 15) + 3,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local
  const current = getLocal<ProfessionalConnection[]>(LS_CONNECTIONS_KEY, INITIAL_DEMO_CONNECTIONS);
  const updated = [newConn, ...current.filter((c) => c.id !== connectionId)];
  setLocal(LS_CONNECTIONS_KEY, updated);

  // 2. Try Firestore
  try {
    await setDoc(doc(db, 'networkConnections', connectionId), sanitizeForFirestore(newConn));
  } catch (err) {
    console.warn('Notice: Saved connection to local storage only:', err);
  }

  return newConn;
}

export async function acceptConnectionRequest(connectionId: string): Promise<void> {
  // Update local
  const current = getLocal<ProfessionalConnection[]>(LS_CONNECTIONS_KEY, INITIAL_DEMO_CONNECTIONS);
  const updated = current.map((c) => 
    c.id === connectionId ? { ...c, status: 'accepted' as ConnectionStatus, updatedAt: new Date().toISOString() } : c
  );
  setLocal(LS_CONNECTIONS_KEY, updated);

  // Update Firestore
  try {
    await updateDoc(doc(db, 'networkConnections', connectionId), {
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notice: Accepted connection in local state:', err);
  }
}

export async function declineConnectionRequest(connectionId: string): Promise<void> {
  // Update local
  const current = getLocal<ProfessionalConnection[]>(LS_CONNECTIONS_KEY, INITIAL_DEMO_CONNECTIONS);
  const updated = current.filter((c) => c.id !== connectionId);
  setLocal(LS_CONNECTIONS_KEY, updated);

  // Update Firestore
  try {
    await deleteDoc(doc(db, 'networkConnections', connectionId));
  } catch (err) {
    console.warn('Notice: Removed connection request:', err);
  }
}

export function getConnectionStatus(
  currentUserId: string,
  targetUserId: string,
  connections: ProfessionalConnection[]
): { status: 'none' | 'pending_sent' | 'pending_received' | 'connected'; connection?: ProfessionalConnection } {
  if (!currentUserId || currentUserId === targetUserId) {
    return { status: 'none' };
  }

  const match = connections.find(
    (c) =>
      (c.requesterId === currentUserId && (c.recipientId === targetUserId || (targetUserId === 'current_user' && c.recipientId === currentUserId))) ||
      ((c.recipientId === currentUserId || c.recipientId === 'current_user') && c.requesterId === targetUserId)
  );

  if (!match) return { status: 'none' };

  if (match.status === 'accepted') {
    return { status: 'connected', connection: match };
  }

  if (match.requesterId === currentUserId) {
    return { status: 'pending_sent', connection: match };
  }

  return { status: 'pending_received', connection: match };
}

// -------------------------------------------------------------
// SKILL ENDORSEMENTS (Təsdiqləmə / +1 Endorse)
// -------------------------------------------------------------

export interface EndorsementsStore {
  [targetUserId: string]: {
    [skillName: string]: {
      count: number;
      endorsers: { id: string; name: string; title?: string }[];
    };
  };
}

const DEFAULT_ENDORSEMENTS: EndorsementsStore = {};

export function getStoredSkillEndorsements(): EndorsementsStore {
  let store = getLocal<EndorsementsStore>(LS_ENDORSEMENTS_KEY, {});
  // Purge any legacy ghost user endorsements
  let modified = false;
  for (const key of Object.keys(store)) {
    if (key.startsWith('cand-seed-') || key.startsWith('user-demo-')) {
      delete store[key];
      modified = true;
    }
  }
  if (modified) {
    setLocal(LS_ENDORSEMENTS_KEY, store);
  }
  return store;
}

export function toggleSkillEndorsementLocal(
  endorser: { id: string; name: string; title?: string },
  targetUserId: string,
  skillName: string
): { endorsed: boolean; newCount: number } {
  const store = getStoredSkillEndorsements();
  if (!store[targetUserId]) {
    store[targetUserId] = {};
  }
  if (!store[targetUserId][skillName]) {
    store[targetUserId][skillName] = { count: 0, endorsers: [] };
  }

  const currentSkill = store[targetUserId][skillName];
  const alreadyIndex = currentSkill.endorsers.findIndex((e) => e.id === endorser.id);

  let endorsed = false;
  if (alreadyIndex >= 0) {
    // Un-endorse
    currentSkill.endorsers.splice(alreadyIndex, 1);
    currentSkill.count = Math.max(0, currentSkill.count - 1);
    endorsed = false;
  } else {
    // Endorse
    currentSkill.endorsers.push({
      id: endorser.id,
      name: endorser.name,
      title: endorser.title,
    });
    currentSkill.count += 1;
    endorsed = true;
  }

  setLocal(LS_ENDORSEMENTS_KEY, store);

  // Background Firestore async update
  try {
    const ref = doc(db, 'skillEndorsements', `${targetUserId}_${encodeURIComponent(skillName)}`);
    setDoc(ref, sanitizeForFirestore({
      targetUserId,
      skillName,
      count: currentSkill.count,
      endorsers: currentSkill.endorsers,
      updatedAt: new Date().toISOString(),
    })).catch(() => {});
  } catch {}

  return { endorsed, newCount: currentSkill.count };
}

// -------------------------------------------------------------
// PROFESSIONAL RECOMMENDATIONS (Tövsiyələr)
// -------------------------------------------------------------

const DEFAULT_RECOMMENDATIONS: ProfessionalRecommendation[] = [];

export function getStoredRecommendations(recipientId?: string): ProfessionalRecommendation[] {
  let list = getLocal<ProfessionalRecommendation[]>(LS_RECOMMENDATIONS_KEY, []);
  if (list.some((r) => r.id?.startsWith('rec-') && (r.recipientId?.startsWith('cand-seed-') || r.authorId?.startsWith('rec-author-')))) {
    list = list.filter((r) => !r.recipientId?.startsWith('cand-seed-') && !r.authorId?.startsWith('rec-author-'));
    setLocal(LS_RECOMMENDATIONS_KEY, list);
  }
  if (!recipientId) return list;
  return list.filter((r) => r.recipientId === recipientId || (recipientId === 'current_user' && r.recipientId === 'current_user'));
}

export async function addProfessionalRecommendation(
  recData: Omit<ProfessionalRecommendation, 'id' | 'createdAt' | 'status'>
): Promise<ProfessionalRecommendation> {
  const newRec: ProfessionalRecommendation = {
    ...recData,
    id: `rec-${Date.now()}`,
    status: 'approved',
    createdAt: new Date().toISOString(),
  };

  const list = getLocal<ProfessionalRecommendation[]>(LS_RECOMMENDATIONS_KEY, []);
  const updated = [newRec, ...list];
  setLocal(LS_RECOMMENDATIONS_KEY, updated);

  try {
    await setDoc(doc(db, 'recommendations', newRec.id), sanitizeForFirestore(newRec));
  } catch (err) {
    console.warn('Notice: Saved recommendation locally:', err);
  }

  return newRec;
}
