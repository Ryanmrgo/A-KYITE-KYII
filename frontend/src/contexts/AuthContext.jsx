/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeProfile = () => {};
    let active = true;

    const initFirebase = async () => {
      try {
        const { auth: firebaseAuth } = await import("../firebase");
        if (!active) return;

        if (firebaseAuth) {
          const { onAuthStateChanged } = await import("firebase/auth");
          const { onSnapshot, doc } = await import("firebase/firestore");
          const { db } = await import("../firebase");

          unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
            unsubscribeProfile();
            if (user) {
              unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                setCurrentUser({ ...user, profile: docSnap.data() });
                setLoading(false);
              }, (error) => {
                setAuthError(error.message);
                setCurrentUser({ ...user, profile: null });
                setLoading(false);
              });
            } else {
              setCurrentUser(null);
              setLoading(false);
            }
          });
        } else {
          // Firebase not configured - continue without auth
          console.log("Firebase not configured - running in demo mode");
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          console.warn("Firebase initialization skipped:", error.message);
          setLoading(false);
        }
      }
    };

    initFirebase();
    return () => {
      active = false;
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const signup = async (email, password, name) => {
    try {
      const { auth: firebaseAuth } = await import("../firebase");
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const { setDoc, doc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        name,
        createdAt: new Date().toISOString(),
      });
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { auth: firebaseAuth } = await import("../firebase");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      return await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { auth: firebaseAuth } = await import("../firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(firebaseAuth);
    } catch (error) {
      console.warn("Logout error:", error.message);
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    authError,
    isDemoMode: !currentUser && loading === false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
