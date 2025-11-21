import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  total: number;
  items: any[];
  shipping_address: any;
  payment_method: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  orders: Order[];
  addOrder: (order: { items: any[], shippingAddress: any, paymentMethod: string, total: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          loadOrders();
        }, 0);
      } else {
        setOrders([]);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setOrders(data.map(order => ({
          id: order.id,
          user_id: order.user_id,
          created_at: order.created_at,
          total: Number(order.total),
          items: [],
          shipping_address: {},
          payment_method: '',
          status: order.status as any,
        })));
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Account created successfully! Please check your email.');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Invalid credentials');
        return false;
      }

      toast.success('Logged in successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setOrders([]);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addOrder = async (orderData: { items: any[], shippingAddress: any, paymentMethod: string, total: number }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Use a client-side encryption key (in production, move this to edge function)
      const encryptionKey = 'client-side-encryption-key-2024';
      
      console.log('Starting order encryption...');
      
      // Call the encryption function with correct parameter order
      const { data: encryptedData, error: encryptError } = await supabase
        .rpc('encrypt_order_data', {
          p_encryption_key: encryptionKey,
          p_items: orderData.items,
          p_payment_method: orderData.paymentMethod,
          p_shipping_address: orderData.shippingAddress,
        });

      if (encryptError) {
        console.error('Encryption error:', encryptError);
        throw encryptError;
      }

      if (!encryptedData || encryptedData.length === 0) {
        throw new Error('Encryption returned no data');
      }

      console.log('Encryption successful, inserting order...');

      // Insert the encrypted order - the encrypted data is base64 text
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shipping_address: encryptedData[0].encrypted_shipping,
          payment_method: encryptedData[0].encrypted_payment,
          items: encryptedData[0].encrypted_items,
          total: orderData.total,
          status: 'pending',
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Order inserted successfully');
      await loadOrders();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Error adding order:', error);
      toast.error('Failed to place order: ' + (error.message || 'Unknown error'));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
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
