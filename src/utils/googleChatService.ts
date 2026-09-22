import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { auth } from '../services/firebase';

// Provider with Chat scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.create');
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/chat.messages.create');
provider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');

// In-memory token management
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface GoogleChatSpace {
  name: string; // e.g., 'spaces/AAAAAAAAAAA'
  type: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  displayName?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
  singleUserBotDm?: boolean;
  threaded?: boolean;
}

export interface GoogleChatMessage {
  name: string; // e.g. 'spaces/.../messages/...'
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
  createTime?: string;
  text?: string;
  formattedText?: string;
  cardsV2?: any[];
  thread?: {
    name?: string;
  };
}

/**
 * Initialize auth listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Sign In with Chat Scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Chat icazəsi üçün Access Token alına bilmədi.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Gracefully handle popup closure and cancellations without polluting console.error
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      // User closed popup or cancelled auth
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      const blockedErr = new Error(
        'Brauzer pop-up pəncərənin açılmasını blokladı. Zəhmət olmasa pop-up pəncərələrə icazə verin və ya tətbiqi yeni tabda açın.'
      );
      (blockedErr as any).code = 'auth/popup-blocked';
      throw blockedErr;
    }
    console.error('Google Chat sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogleChat = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/* =========================================================================
   Google Chat REST API Endpoints (with Demo Workspace support)
   ========================================================================= */

const DEMO_SPACES_KEY = 'jobia_demo_google_chat_spaces';
const DEMO_MESSAGES_KEY = 'jobia_demo_google_chat_messages';

const getInitialDemoSpaces = (): GoogleChatSpace[] => [
  {
    name: 'spaces/demo-hr-core',
    type: 'SPACE',
    displayName: '🏢 HR & İstedad İdarəetməsi',
    spaceType: 'SPACE',
    spaceDetails: {
      description: 'Jobia platforması ilə daxil olan namizədlər və müsahibələrin təşkili',
    },
  },
  {
    name: 'spaces/demo-it-recruitment',
    type: 'SPACE',
    displayName: '💻 IT & Proqramlaşdırma Vakansiyaları',
    spaceType: 'SPACE',
    spaceDetails: {
      description: 'Senior Frontend və DevOps namizədlərinin texniki müzakirəsi',
    },
  },
  {
    name: 'spaces/demo-offers-approvals',
    type: 'SPACE',
    displayName: '📑 Təkliflər və Təsdiqlər',
    spaceType: 'SPACE',
    spaceDetails: {
      description: 'Rəsmi Job Offer layihələrinin rəhbərliklə razılaşdırılması',
    },
  },
];

const getInitialDemoMessages = (spaceName: string): GoogleChatMessage[] => {
  return [
    {
      name: `${spaceName}/messages/demo-1`,
      sender: {
        displayName: 'Leyla Məmmədova (HR Director)',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        type: 'HUMAN',
      },
      createTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      text: 'Salam komanda! Bu həftə üzrə Senior React Developer vakansiyasına 12 yeni müraciət daxil olub. Zəhmət olmasa namizədlərin texniki qiymətləndirilməsinə baxın.',
    },
    {
      name: `${spaceName}/messages/demo-2`,
      sender: {
        displayName: 'Kamran Əliyev (Tech Lead)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        type: 'HUMAN',
      },
      createTime: new Date(Date.now() - 3600000).toISOString(),
      text: 'Salam Leyla xanım! İlk 3 namizədin kod portfelini yoxladıq. 1 namizədlə sabah saat 15:00-da texniki müsahibə təyin etməyi məsləhət görürəm.',
    },
    {
      name: `${spaceName}/messages/demo-3`,
      sender: {
        displayName: 'Jobia Bot (Avtomatlaşdırma)',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=jobia-bot',
        type: 'BOT',
      },
      createTime: new Date(Date.now() - 600000).toISOString(),
      text: '🤖 Bildiriş: Jobia portalından yeni "Senior Frontend Developer" vakansiyası paylaşıldı və status "Aktiv" olaraq təsdiqləndi.',
    },
  ];
};

/**
 * List Google Chat Spaces accessible by the authenticated user
 */
export async function listGoogleChatSpaces(token: string): Promise<GoogleChatSpace[]> {
  if (token === 'demo-token') {
    try {
      const stored = localStorage.getItem(DEMO_SPACES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    const initial = getInitialDemoSpaces();
    try {
      localStorage.setItem(DEMO_SPACES_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  }

  const response = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=50', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Google Chat kanallarını yükləmək mümkün olmadı (${response.status})`
    );
  }

  const data = await response.json().catch(() => ({}));
  return data.spaces || [];
}

/**
 * Create a new Google Chat Space (Room)
 */
export async function createGoogleChatSpace(
  token: string,
  displayName: string,
  description?: string
): Promise<GoogleChatSpace> {
  if (token === 'demo-token') {
    const newSpace: GoogleChatSpace = {
      name: `spaces/demo-${Date.now()}`,
      type: 'SPACE',
      displayName: displayName.trim(),
      spaceType: 'SPACE',
      spaceDetails: description ? { description: description.trim() } : undefined,
    };
    try {
      const spaces = await listGoogleChatSpaces('demo-token');
      const updated = [newSpace, ...spaces];
      localStorage.setItem(DEMO_SPACES_KEY, JSON.stringify(updated));
    } catch {}
    return newSpace;
  }

  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceType: 'SPACE',
      displayName: displayName.trim(),
      spaceDetails: description ? { description: description.trim() } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Yeni Google Chat otağı yaratmaq mümkün olmadı (${response.status})`
    );
  }

  return await response.json().catch(() => ({}));
}

/**
 * List messages in a space
 */
export async function listGoogleChatMessages(
  token: string,
  spaceName: string,
  pageSize = 30
): Promise<GoogleChatMessage[]> {
  if (token === 'demo-token') {
    try {
      const stored = localStorage.getItem(`${DEMO_MESSAGES_KEY}_${spaceName}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    const initial = getInitialDemoMessages(spaceName);
    try {
      localStorage.setItem(`${DEMO_MESSAGES_KEY}_${spaceName}`, JSON.stringify(initial));
    } catch {}
    return initial;
  }

  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(
    `https://chat.googleapis.com/v1/${cleanSpaceName}/messages?pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Mesajları yükləmək mümkün olmadı (${response.status})`
    );
  }

  const data = await response.json().catch(() => ({}));
  // Messages are returned in chronological order or reverse; normalize for display
  const messages: GoogleChatMessage[] = data.messages || [];
  return messages.reverse(); // oldest first for standard chat stream
}

/**
 * Send a message into a Google Chat space
 */
export async function sendGoogleChatMessage(
  token: string,
  spaceName: string,
  text: string
): Promise<GoogleChatMessage> {
  if (token === 'demo-token') {
    const newMsg: GoogleChatMessage = {
      name: `${spaceName}/messages/demo-${Date.now()}`,
      sender: {
        displayName: 'Mən (Demo İstifadəçi)',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DemoUser',
        type: 'HUMAN',
      },
      createTime: new Date().toISOString(),
      text: text.trim(),
    };
    try {
      const existing = await listGoogleChatMessages('demo-token', spaceName);
      const updated = [...existing, newMsg];
      localStorage.setItem(`${DEMO_MESSAGES_KEY}_${spaceName}`, JSON.stringify(updated));
    } catch {}
    return newMsg;
  }

  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`https://chat.googleapis.com/v1/${cleanSpaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Mesaj göndərilmədi (${response.status})`
    );
  }

  return await response.json().catch(() => ({}));
}
