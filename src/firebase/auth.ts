import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailLink,
  isSignInWithEmailLink,
  sendSignInLinkToEmail
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const sendMagicLink = async (email: string) => {
  const actionCodeSettings = {
    url: window.location.origin + '/auth/verify',
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const verifyMagicLink = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    if (email) {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
    }
  }
};
