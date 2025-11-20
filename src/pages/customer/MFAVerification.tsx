import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { Footer } from '@/components/customer/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';

const MFAVerification = () => {
  const navigate = useNavigate();
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string>('');

  useEffect(() => {
    checkMFARequired();
  }, []);

  const checkMFARequired = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if MFA is required
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors?.totp && factors.totp.length > 0) {
        const factor = factors.totp[0];
        setFactorId(factor.id);
        
        // Create a challenge
        const { error } = await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

        if (error) {
          toast.error('Failed to create MFA challenge');
          console.error(error);
        }
      } else {
        // No MFA enrolled, proceed to app
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check MFA status');
      navigate('/login');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId,
        code: verifyCode,
      });

      if (error) throw error;

      toast.success('Verification successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
      setVerifyCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verifyCode}
                  onChange={setVerifyCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={verifyCode.length !== 6 || isVerifying}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MFAVerification;
