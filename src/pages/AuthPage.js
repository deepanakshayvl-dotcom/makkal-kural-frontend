import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Phone, ArrowLeft, Loader2, Shield } from 'lucide-react';

const AuthPage = () => {
  const { sendOTP, verifyOTP, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState('mobile'); // mobile | otp
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [testOtp, setTestOtp] = useState('');

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      toast.error(language === 'ta' ? 'செல்லுபடியான எண் உள்ளிடவும்' : 'Enter valid 10-digit mobile');
      return;
    }

    setLoading(true);
    try {
      const response = await sendOTP(mobile);
      if (response.success) {
        setTestOtp(response.otp_for_testing); // For testing
        setStep('otp');
        toast.success(language === 'ta' ? 'OTP அனுப்பப்பட்டது' : 'OTP sent successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error(language === 'ta' ? '6 இலக்க OTP உள்ளிடவும்' : 'Enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(mobile, otp);
      if (response.success) {
        toast.success(language === 'ta' ? 'வெற்றிகரமாக உள்நுழைந்தீர்கள்' : 'Login successful');
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 hero-mesh">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            {step === 'mobile' ? (
              <Phone className="w-8 h-8 text-primary" />
            ) : (
              <Shield className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-tamil">
            {language === 'ta' ? 'உள்நுழை' : 'Login'}
          </CardTitle>
          <CardDescription className="font-tamil">
            {step === 'mobile' 
              ? (language === 'ta' ? 'கைபேசி எண் மூலம் உள்நுழையுங்கள்' : 'Login with your mobile number')
              : (language === 'ta' ? 'உங்கள் கைபேசியில் OTP பெற்றிருப்பீர்கள்' : 'Enter the OTP sent to your mobile')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'mobile' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium font-tamil">
                  {t('enterMobile')}
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-lg border border-input text-sm">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="text-lg tracking-wider"
                    data-testid="mobile-input"
                    autoFocus
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full touch-target text-base"
                disabled={loading || mobile.length !== 10}
                data-testid="send-otp-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {t('sendOTP')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => { setStep('mobile'); setOtp(''); }}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t('back')}
              </Button>
              
              <div className="space-y-4">
                <label className="text-sm font-medium font-tamil block text-center">
                  {t('enterOTP')}
                </label>
                
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    data-testid="otp-input"
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <InputOTPSlot key={idx} index={idx} className="w-12 h-14 text-xl" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {testOtp && (
                  <p className="text-xs text-center text-muted-foreground">
                    Test OTP: <code className="bg-muted px-2 py-0.5 rounded">{testOtp}</code>
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full touch-target text-base"
                disabled={loading || otp.length !== 6}
                data-testid="verify-otp-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {t('verifyOTP')}
              </Button>

              <Button 
                type="button" 
                variant="link" 
                className="w-full text-sm"
                onClick={handleSendOTP}
                disabled={loading}
              >
                {language === 'ta' ? 'OTP மீண்டும் அனுப்பு' : 'Resend OTP'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
