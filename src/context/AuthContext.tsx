import React, { createContext, useEffect, useState  } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  loading: true,
  logout: async () => {},
  
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    console.log("TOKEN ACTUEL :", token);

   

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);
      setLoading(false);
    };
    loadToken();
  }, []);

 // Déconnexion : supprime le token et notifie le contexte
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
