import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Coins, ShieldAlert, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { authService } from '../services/auth';

const verifyOtpSchema = z.object({
  code: z
    .string()
    .min(6, 'Verification code must be exactly 6 digits')
    .max(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get('identifier') || '';

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [resendStatus, setResendStatus] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Resend Countdown Timer (60 seconds)
  const [countdown, setCountdown] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: VerifyOtpFormData) => {
    if (!identifier) {
      setApiError('Missing identifier context. Please return to the previous screen.');
      return;
    }
    setIsLoading(true);
    setApiError(null);
    setResendStatus(null);
    try {
      const resp = await authService.verifyOtp(identifier, data.code);
      // Success: navigate to reset-password with identifier and temporary reset token
      navigate(`/reset-password?identifier=${encodeURIComponent(identifier)}&token=${encodeURIComponent(resp.reset_token)}`);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setApiError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier || !canResend) return;
    setIsLoading(true);
    setApiError(null);
    setResendStatus(null);
    try {
      await authService.forgotPassword(identifier);
      setResendStatus('A fresh verification code has been dispatched.');
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      console.error('Resend error:', err);
      setApiError(err.message || 'Failed to resend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.06)_0%,_transparent_65%)] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="p-4 bg-gradient-to-tr from-gold-500 to-gold-400 rounded-3xl shadow-xl shadow-gold-500/20 text-white mb-2">
            <Coins className="w-8 h-8 text-white" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Mbamager</h1>
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest font-mono">
            Premium Financial OS
          </p>
        </div>

        <Card className="shadow-xl shadow-slate-950/20 border-slate-800/80 bg-slate-900/90 p-8 rounded-3xl">
          <div className="flex items-center gap-2.5 mb-6">
            <RefreshCw className="w-4 h-4 text-gold-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Verify Identity</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            We have sent a secure 6-digit confirmation key to{' '}
            <span className="text-slate-200 font-bold font-mono">{identifier || 'your account'}</span>.
            Please enter the code to verify your authorization.
          </p>

          {apiError && (
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-500 font-medium mb-5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {resendStatus && (
            <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400 font-medium mb-5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resendStatus}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="6-DIGIT VERIFICATION CODE"
              type="text"
              placeholder="••••••"
              error={errors.code?.message}
              disabled={isLoading}
              maxLength={6}
              className="text-center tracking-[1.25em] font-mono text-xl"
              {...register('code')}
              helperText="Only numbers are valid"
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} disabled={isLoading}>
              Confirm & Continue
            </Button>
          </form>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
            <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold transition-colors font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Change Identifier
            </Link>

            <button
              onClick={handleResend}
              type="button"
              disabled={!canResend || isLoading}
              className={`text-xs font-semibold transition-colors ${
                canResend
                  ? 'text-gold hover:underline cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
