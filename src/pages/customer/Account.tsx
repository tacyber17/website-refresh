import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { Footer } from '@/components/customer/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, LogOut, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Account = () => {
  const { orders, logout, session } = useAuth();
  const navigate = useNavigate();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoadingMFA, setIsLoadingMFA] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!session) {
      navigate('/login');
      return;
    }

    // Fetch profile
    fetchProfile();
    checkMFAStatus();
  }, [session, navigate]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile');
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.totp && data.totp.length > 0) {
        setMfaEnabled(true);
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setIsLoadingMFA(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleEnableMFA = () => {
    navigate('/mfa-enrollment');
  };

  const handleDisableMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp && factors.totp.length > 0) {
        const factor = factors.totp[0];
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        
        if (error) throw error;
        
        setMfaEnabled(false);
        toast.success('MFA disabled successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable MFA');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Show loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if no profile
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Failed to load profile. Please try refreshing the page.</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate('/login')}>Back to Login</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Account</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`w-5 h-5 ${mfaEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      {mfaEnabled 
                        ? 'MFA is enabled on your account' 
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                </div>
                {!isLoadingMFA && (
                  <Button
                    onClick={mfaEnabled ? handleDisableMFA : handleEnableMFA}
                    variant={mfaEnabled ? 'outline' : 'default'}
                  >
                    {mfaEnabled ? 'Disable' : 'Enable'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History
              </CardTitle>
              <CardDescription>
                {orders.length > 0
                  ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`
                  : 'No orders yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't placed any orders yet.</p>
                  <Button onClick={() => navigate('/shop')} className="mt-4">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Payment: {order.payment_method}</p>
                        <p>
                          Shipping: {order.shipping_address.address},{' '}
                          {order.shipping_address.city}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
