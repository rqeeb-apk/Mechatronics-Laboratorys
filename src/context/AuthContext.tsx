import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppSettings } from '../types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  settings: AppSettings | null;
  isLoading: boolean;
  isOwner: boolean;
  hasActiveSubscription: boolean;
  login: (phone: string, password: string, activationCode?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    phone: string;
    password: string;
    fullName: string;
    university: string;
    studyLevel: string;
    activationCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  activateCode: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mecha_token'));
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const fetchCurrentUser = async (currentToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('mecha_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify token:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchSettings();
      if (token) {
        await fetchCurrentUser(token);
      }
      setIsLoading(false);
    };
    init();
  }, [token]);

  const login = async (phone: string, password: string, activationCode?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, activationCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }
      localStorage.setItem('mecha_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const register = async (regData: {
    phone: string;
    password: string;
    fullName: string;
    university: string;
    studyLevel: string;
    activationCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إنشاء الحساب' };
      }
      localStorage.setItem('mecha_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const activateCode = async (code: string) => {
    if (!user) {
      return { success: false, error: 'يلزم تسجيل الدخول أولاً' };
    }
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تفعيل الكود' };
      }
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء التفعيل' };
    }
  };

  const logout = () => {
    localStorage.removeItem('mecha_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const isOwner = user?.role === 'owner';
  const hasActiveSubscription =
    isOwner || (user?.status === 'active' && new Date(user.subscriptionEndDate) > new Date());

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        settings,
        isLoading,
        isOwner,
        hasActiveSubscription,
        login,
        register,
        activateCode,
        logout,
        refreshUser,
        refreshSettings,
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
