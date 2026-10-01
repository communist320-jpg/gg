import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, githubProvider, db } from './firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  setTestRole: (role: UserRole) => void;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            setRole(data.role || 'customer');
          } else {
            // New user registration
            const defaultRole: UserRole = user.email === 'communist320@gmail.com' ? 'admin' : 'business_owner';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'AOCSF Member',
              role: defaultRole,
              avatarUrl: user.photoURL || undefined,
              isEmailVerified: user.emailVerified,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setRole(defaultRole);
          }
        } catch (err: any) {
          console.warn('Error fetching user profile:', err);
          // Fallback profile
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'AOCSF Member',
            role: user.email === 'communist320@gmail.com' ? 'admin' : 'business_owner',
            isEmailVerified: user.emailVerified,
            createdAt: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
          setRole(fallbackProfile.role);
        }
      } else {
        setUserProfile(null);
        setRole('customer');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err: any) {
      console.error('GitHub Sign In Error:', err);
      setError(err.message || 'GitHub Sign-in failed. Please verify credentials.');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message || 'Email login failed.');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, userRole: UserRole) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const user = res.user;
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: name,
        role: userRole,
        isEmailVerified: user.emailVerified,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setRole(userRole);
      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn('Email verification send error:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Account creation failed.');
      throw err;
    }
  };

  const reloadUser = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      setCurrentUser({ ...updated } as FirebaseUser);
      if (updated.emailVerified && userProfile) {
        setUserProfile({ ...userProfile, isEmailVerified: true });
        updateDoc(doc(db, 'users', updated.uid), { isEmailVerified: true }).catch(() => {});
      }
      return updated.emailVerified;
    }
    return false;
  };

  const signOut = async () => {
    setError(null);
    await firebaseSignOut(auth);
    setUserProfile(null);
    setRole('customer');
  };

  const sendVerificationEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const setTestRole = (newRole: UserRole) => {
    setRole(newRole);
    if (userProfile) {
      setUserProfile({ ...userProfile, role: newRole });
      if (currentUser) {
        updateDoc(doc(db, 'users', currentUser.uid), { role: newRole }).catch(() => {});
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        loading,
        error,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        setTestRole,
        sendVerificationEmail,
        reloadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
