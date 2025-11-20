import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  email: string;
  name: string;
  phone: string;
  createdAt: string;
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
  login: (email: string, password: string, phone: string) => boolean;
  signup: (email: string, password: string, name: string, phone: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadOrders(parsedUser.email);
    }
  }, []);

  const loadOrders = (email: string) => {
    const userOrders = localStorage.getItem(`orders_${email}`);
    if (userOrders) {
      setOrders(JSON.parse(userOrders));
    }
  };

  const signup = (email: string, password: string, name: string, phone: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      toast.error('User already exists');
      return false;
    }

    const newUser: User = {
      email,
      name,
      phone,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
    setOrders([]);
    toast.success('Account created successfully!');
    return true;
  };

  const login = (email: string, password: string, phone: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password && u.phone === phone);

    if (!foundUser) {
      toast.error('Invalid credentials');
      return false;
    }

    const user: User = {
      email: foundUser.email,
      name: foundUser.name,
      phone: foundUser.phone,
      createdAt: foundUser.createdAt,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    setUser(user);
    loadOrders(email);
    toast.success('Logged in successfully!');
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setOrders([]);
    toast.success('Logged out successfully');
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    if (!user) return;

    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'pending',
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${user.email}`, JSON.stringify(updatedOrders));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
