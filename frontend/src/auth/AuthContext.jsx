import { createContext, useContext, useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '../services/firebaseService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('firebaseToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        localStorage.setItem("firebaseToken", idToken);
        setToken(idToken);
      } else {
        localStorage.removeItem("firebaseToken");
        setToken(null);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const verifyStoredToken = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8080/api/auth/verify", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem("firebaseToken");
            setToken(null);
          }
        } catch {
          localStorage.removeItem("firebaseToken");
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyStoredToken();
  }, [token]);

  const login = (firebaseToken, userData) => {
    localStorage.setItem("firebaseToken", firebaseToken);
    setToken(firebaseToken);
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        login,
        logout,
        updateUser,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
