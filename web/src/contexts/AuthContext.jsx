import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (pb.authStore.isValid) {
          await pb.collection('users').authRefresh({ $autoCancel: false });
          setUser(pb.authStore.model);
        }
      } catch (error) {
        pb.authStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};