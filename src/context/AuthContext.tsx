import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db';
import { applyThemeToDocument, type ThemeKey } from '../styles/themes';
import type { AuthUser } from '../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  currentTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AUTH_USER_KEY = 'ojt_auth_user_session_v1';
const MANUAL_LOGOUT_KEY = 'ojt_user_manually_logged_out_v1';
const THEME_KEY = 'ojt_app_theme_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const isManuallyLoggedOut = localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
    if (isManuallyLoggedOut) return null;

    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AuthUser;
    } catch {
      return null;
    }
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => {
    if (typeof window === 'undefined') return 'sleekDark';
    const saved = localStorage.getItem(THEME_KEY) as ThemeKey;
    return saved && ['sleekDark', 'sunAndSoil', 'deepOcean', 'roseQuartzLight', 'accessibleLight'].includes(saved)
      ? saved
      : 'sleekDark';
  });

  // Auto-restore persistent session on app start unless user explicitly clicked Logout
  useEffect(() => {
    const restorePersistentSession = async () => {
      if (currentUser) return;

      const isManuallyLoggedOut = localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
      if (isManuallyLoggedOut) return;

      // 1. Try restoring from localStorage
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as AuthUser;
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
            return;
          }
        } catch {
          // ignore error
        }
      }

      // 2. Fallback restoration from Dexie IndexedDB (restores session if Webview cleared localStorage)
      try {
        const users = await db.users.toArray();
        if (users.length === 1) {
          const u = users[0];
          const authUser: AuthUser = { id: u.id!, username: u.username, name: u.name };
          setCurrentUser(authUser);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        }
      } catch {
        // ignore error
      }
    };

    restorePersistentSession();
  }, [currentUser]);

  useEffect(() => {
    applyThemeToDocument(currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      localStorage.removeItem(MANUAL_LOGOUT_KEY);
    }
  }, [currentUser]);

  const setTheme = (theme: ThemeKey) => {
    setCurrentTheme(theme);
  };

  const login = async (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    const user = await db.users.where('username').equals(cleanUsername).first();
    if (!user) {
      return { success: false, message: 'User account not found. Please register first.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const authUser: AuthUser = {
      id: user.id!,
      username: user.username,
      name: user.name,
    };

    localStorage.removeItem(MANUAL_LOGOUT_KEY);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setCurrentUser(authUser);
    return { success: true, message: `Welcome back, ${user.name || user.username}!` };
  };

  const register = async (username: string, password: string, name: string) => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      return { success: false, message: 'Username and password are required.' };
    }

    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const existing = await db.users.where('username').equals(cleanUsername).first();
    if (existing) {
      return { success: false, message: 'Username is already registered. Please log in.' };
    }

    const displayName = name.trim() || cleanUsername;
    const userId = await db.users.add({
      username: cleanUsername,
      password,
      name: displayName,
      createdAt: new Date().toISOString(),
    });

    // Initialize default Meta for this user in Dexie DB
    await db.meta.put({
      userId: userId as number,
      name: displayName,
      school: '',
      company: '',
      supervisor: '',
      requiredHours: 486,
      autoBreak: true,
    });

    return { success: true, message: 'Account registered successfully!' };
  };

  const logout = () => {
    localStorage.setItem(MANUAL_LOGOUT_KEY, 'true');
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTheme,
        setTheme,
        login,
        register,
        logout,
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
