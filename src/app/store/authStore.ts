import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'user';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const getRoleFromEmail = (email: string): UserRole => {
  if (email === 'admin@chrono.com') return 'admin';
  return 'user';
};

const buildUser = (supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User => {
  const metadataRole = supabaseUser.user_metadata?.role as UserRole | undefined;
  const email = supabaseUser.email ?? '';
  const role = metadataRole || getRoleFromEmail(email);
  const name = (supabaseUser.user_metadata?.full_name as string | undefined) || email.split('@')[0];
  return { id: supabaseUser.id, email, role, name };
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }
      // onAuthStateChange below will set user + loading: false
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      // onAuthStateChange below will clear user + loading: false
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      set({ error: msg, loading: false });
    }
  },

  // Kept for API compatibility; onAuthStateChange handles the actual restore.
  checkAuth: async () => {},
}));

// ─── Auth state listener ──────────────────────────────────────────────────────
// Fires for: INITIAL_SESSION (page load / refresh), SIGNED_IN, SIGNED_OUT,
// TOKEN_REFRESHED.  This is the single source of truth for auth state —
// no manual getSession() call needed.
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    useAuthStore.setState({ user: buildUser(session.user), loading: false, error: null });
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});
