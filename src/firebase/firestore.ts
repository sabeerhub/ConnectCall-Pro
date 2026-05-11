import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore';
import { db } from './config';

// User Profile Operations
export const createUserProfile = async (uid: string, profile: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    onlineStatus: 'online'
  }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
};

// Meeting Operations
export const createMeeting = async (hostId: string, title?: string, password?: string) => {
  const meetingsRef = collection(db, 'meetings');
  const meetingId = Math.random().toString(36).substring(2, 10).toUpperCase();
  await setDoc(doc(meetingsRef, meetingId), {
    id: meetingId,
    hostId,
    title: title || 'Quick Meeting',
    password: password || null,
    status: 'active',
    createdAt: serverTimestamp(),
    isLocked: !!password
  });
  return meetingId;
};

export const getMeeting = async (meetingId: string) => {
  const meetingRef = doc(db, 'meetings', meetingId);
  const snap = await getDoc(meetingRef);
  return snap.exists() ? snap.data() : null;
};

export const joinMeeting = async (meetingId: string, userId: string, profile: any) => {
  const participantRef = doc(db, 'meetings', meetingId, 'participants', userId);
  await setDoc(participantRef, {
    ...profile,
    joinedAt: serverTimestamp(),
    isMuted: false,
    isVideoOff: false
  });
};

export const getMeetingData = async (meetingId: string) => {
  const docRef = doc(db, 'meetings', meetingId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getUserMeetings = async (userId: string) => {
  const meetingsRef = collection(db, 'meetings');
  const q = query(meetingsRef, where('hostId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const leaveMeeting = async (meetingId: string, userId: string) => {
  // Logic to remove or mark as inactive
};

export const endMeeting = async (meetingId: string) => {
  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    status: 'ended',
    endedAt: serverTimestamp()
  });
};

export const removeParticipant = async (meetingId: string, participantId: string) => {
  // In a real RTC setup, this would trigger a socket event or signal
  // For now, we can update a state or simply rely on the RTC layer if it was fully server-authoritative
  // But here we can at least log the action or update meeting metadata if needed
  console.log(`Removing participant ${participantId} from meeting ${meetingId}`);
};

export const subscribeToMeeting = (meetingId: string, callback: (meeting: any) => void) => {
  const meetingRef = doc(db, 'meetings', meetingId);
  return onSnapshot(meetingRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeToMeetingMessages = (meetingId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, 'meetings', meetingId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

export const sendMessage = async (meetingId: string, message: any) => {
  const messagesRef = collection(db, 'meetings', meetingId, 'messages');
  await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp()
  });
};
