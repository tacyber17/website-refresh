import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  role?: 'admin' | 'seller' | 'buyer';
}

interface Order {
  id: string;
  date: string;
  total: number;
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, phone: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
        setOrders([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      const userRole = roleData?.role as 'admin' | 'seller' | 'buyer' | undefined;

      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: profile.email,
          name: profile.full_name || '',
          phone: supabaseUser.user_metadata?.phone || '',
          createdAt: profile.created_at,
          role: userRole,
        });
        setIsAdmin(userRole === 'admin');
        loadOrders(supabaseUser.id);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadOrders = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(data.map(order => ({
          id: order.id,
          date: order.created_at,
          total: order.total,
          items: order.items as any[],
          shippingAddress: order.shipping_address,
          paymentMethod: order.payment_method,
          status: order.status as any,
        })));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
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

  const login = async (email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Invalid credentials');
        return false;
      }

      if (data.user) {
        // Verify phone matches
        const userPhone = data.user.user_metadata?.phone;
        if (userPhone && userPhone !== phone) {
          await supabase.auth.signOut();
          toast.error('Invalid credentials');
          return false;
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
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setOrders([]);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items: orderData.items,
          shipping_address: orderData.shippingAddress,
          payment_method: orderData.paymentMethod,
          total: orderData.total,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to create order');
        return;
      }

      if (data) {
        const newOrder: Order = {
          id: data.id,
          date: data.created_at,
          total: data.total,
          items: data.items as any[],
          shippingAddress: data.shipping_address,
          paymentMethod: data.payment_method,
          status: data.status as any,
        };

        setOrders([newOrder, ...orders]);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        orders,
        addOrder,
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
