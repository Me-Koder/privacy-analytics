// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (!isDemoMode) {
      // Check active sessions only if not in demo mode
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Supabase connection error:', error);
          setLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, [isDemoMode]);

  const demoLogin = () => {
    setIsDemoMode(true);
    setUser({
      id: 'demo-user',
      email: 'demo@example.com',
      user_metadata: {
        name: 'Demo User'
      }
    });
    setLoading(false);
  };

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => {
      if (isDemoMode) {
        setIsDemoMode(false);
        setUser(null);
        return Promise.resolve();
      }
      return supabase.auth.signOut();
    },
    demoLogin,
    user,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

