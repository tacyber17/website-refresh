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

const MFAEnrollment = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize MFA enrollment');
      navigate('/account');
    } finally {
      setIsLoading(false);
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
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.data) {
        const totpFactor = factors.data.totp[0];
        
        if (!totpFactor) {
          throw new Error('No TOTP factor found');
        }

        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: totpFactor.id,
          code: verifyCode,
        });

        if (error) throw error;

        toast.success('MFA enabled successfully!');
        navigate('/account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    navigate('/account');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Enable Two-Factor Authentication</CardTitle>
              </div>
              <CardDescription>
                Protect your account with an authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
                  </p>
                  {qrCode && (
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Or enter this code manually:</h3>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                    {secret}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Verify Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code from your authenticator app:
                  </p>
                  <form onSubmit={handleVerify} className="space-y-4">
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

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={verifyCode.length !== 6 || isVerifying}
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Enable MFA'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MFAEnrollment;
