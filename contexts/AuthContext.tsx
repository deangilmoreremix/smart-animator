import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { roleService, UserRole } from '../services/roleService';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const loadUserRole = async (userId?: string) => {
    if (!userId) {
      setUserRole('user');
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    const role = await roleService.getUserRole(userId);
    setUserRole(role);
    setIsAdmin(role === 'admin' || role === 'superadmin');
    setIsSuperAdmin(role === 'superadmin');
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await loadUserRole(session?.user?.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        await loadUserRole(session?.user?.id);
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshRole = async () => {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole('user');
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isSuperAdmin,
    signOut,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
