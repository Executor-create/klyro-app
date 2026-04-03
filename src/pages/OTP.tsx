import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { InputOTP } from '../components/ui/InputOTP';
import { InputOTPSlot } from '../components/ui/InputOTPSlot';
import { InputOTPGroup } from '../components/ui/InputOTPGroup';
import { verifyOtp } from '../api/auth';
import {
  getItemFromLocalStorage,
  removeItemFromLocalStorage,
  setItemToLocalStorage,
} from '../utils/localStorage';
import { LuGamepad2 } from 'react-icons/lu';
import { MdOutlineShield, MdAccessTime, MdArrowBack } from 'react-icons/md';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeUserId = (location.state as { userId?: string } | null)?.userId;
  const storedUserId = getItemFromLocalStorage('userId');
  const userId = routeUserId ?? storedUserId;

  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isValidVerifyResponse = (response: any): boolean => {
    const hasLoginPayload =
      typeof response.accessToken === 'string' &&
      response.accessToken.length > 0 &&
      typeof response.refreshToken === 'string' &&
      response.refreshToken.length > 0;

    const message =
      typeof response.message === 'string'
        ? response.message.toLowerCase()
        : '';
    return (
      response.success === true ||
      hasLoginPayload ||
      message.includes('verified') ||
      response.statusCode === 200
    );
  };

  const saveAuthentication = (response: any): void => {
    if (typeof response.accessToken === 'string') {
      setItemToLocalStorage('token', response.accessToken);
    }
    if (typeof response.refreshToken === 'string') {
      setItemToLocalStorage('refreshToken', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.trim().replace(/\D/g, '');

    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!userId) {
      setError('User ID is missing. Please restart the flow.');
      navigate('/login');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await verifyOtp({ otp: enteredOtp, userId });
      console.debug('verifyOtp response', response);

      if (isValidVerifyResponse(response)) {
        removeItemFromLocalStorage('userId');
        saveAuthentication(response);
        navigate('/');
      } else {
        setError('Invalid code. Please try again.');
        setOtp('');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setOtp('');
      console.error('OTP verify failed', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setError('');
    setTimeout(() => {
      setTimeLeft(300);
      setIsResending(false);
      setOtp('');
    }, 1000);
  };

  useEffect(() => {
    if (otp.length === 6) {
      const form = document.getElementById('otp-form') as HTMLFormElement;
      form?.requestSubmit();
    }
  }, [otp]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-[#6366f1] to-[#8b5cf6] rounded-2xl mb-4">
            <LuGamepad2 className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Verify Your Account
          </h1>
          <p className="text-muted-foreground text-gray-500">
            We sent a verification code to your email for security.
          </p>
        </div>

        <Card className="p-6 bg-card border-border border-gray-300">
          <form id="otp-form" onSubmit={handleVerify} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <MdOutlineShield size={18} className="text-gray-500" />
                <span className="text-sm text-gray-500">
                  Enter 6-digit code
                </span>
              </div>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError('');
                }}
                disabled={isVerifying || timeLeft === 0}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-14 text-lg bg-secondary border-border"
                  />
                </InputOTPGroup>
              </InputOTP>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MdAccessTime
                size={16}
                className={
                  timeLeft <= 60 ? 'text-red-500' : 'text-muted-foreground'
                }
              />
              <span
                className={
                  timeLeft <= 60 ? 'text-red-500' : 'text-muted-foreground'
                }
              >
                {timeLeft > 0 ? (
                  <>Code expires in {formatTime(timeLeft)}</>
                ) : (
                  <span className="text-red-500">Code expired</span>
                )}
              </span>
            </div>

            <Button
              type="submit"
              className="h-10 w-full rounded-md bg-linear-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white font-bold"
              disabled={otp.length !== 6 || isVerifying || timeLeft === 0}
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-border border-gray-300">
              <p className="text-sm text-muted-foreground mb-2 text-gray-500">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:text-primary hover:bg-primary/10 font-bold text-gray-500"
              >
                {isResending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : timeLeft > 240 ? (
                  `Resend in ${formatTime(300 - timeLeft)}`
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MdArrowBack size={16} />
            Back to Login
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          For security purposes, this code will expire after 5 minutes.
        </p>
      </div>
    </div>
  );
}
