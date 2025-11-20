import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Order {
  id: string;
  user_id: string;
  items: any[];
  shipping_address: any;
  payment_method: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'session:', !!session);
        setSession(session);
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id);
          // Fetch user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          console.log('Profile fetched:', profile);
          
          if (profile) {
            const userData = {
              id: session.user.id,
              email: profile.email,
              name: profile.full_name || '',
              createdAt: profile.created_at,
            };
            console.log('Setting user:', userData);
            setUser(userData);
            
            // Fetch orders from database
            setTimeout(() => {
              loadOrders(session.user.id);
            }, 0);
          } else {
            console.log('No profile found for user');
          }
        } else {
          console.log('No session, clearing user');
          setUser(null);
          setOrders([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      
      if (session?.user) {
        console.log('Initial fetch profile for user:', session.user.id);
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching profile:', profileError);
            }
            
            console.log('Initial profile fetched:', profile);
            
            if (profile) {
              const userData = {
                id: session.user.id,
                email: profile.email,
                name: profile.full_name || '',
                createdAt: profile.created_at,
              };
              console.log('Setting initial user:', userData);
              setUser(userData);
              
              // Fetch orders from database
              loadOrders(session.user.id);
            }
            console.log('Setting loading to false');
            setLoading(false);
          });
      } else {
        console.log('No initial session, setting loading to false');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data || []) as Order[]);
    } catch (error: any) {
      console.error('Error loading orders:', error);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Account created successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during signup');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.session) {
        // Check if MFA is enabled for this user
        const { data: factors } = await supabase.auth.mfa.listFactors();
        
        if (factors?.totp && factors.totp.length > 0) {
          // MFA is enabled, user needs to verify
          // Don't show success message yet, they'll be redirected to MFA verification
          return true;
        }
        
        toast.success('Logged in successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }

      setUser(null);
      setSession(null);
      setOrders([]);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during logout');
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          items: orderData.items,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          total: orderData.total,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setOrders([data as Order, ...orders]);
        return data.id;
      }

      return null;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!session,
        orders,
        addOrder,
        session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
