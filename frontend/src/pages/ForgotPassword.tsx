import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router';
import { Coins, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { authService } from '../services/auth';

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or Phone Number is required')
    .refine((val) => {
      if (val.includes('@')) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
      }
      return /^\+2376\d{8}$/.test(val);
    }, {
      message: 'Enter a valid email address or Cameroon phone number (+2376XXXXXXXX)',
    }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const normalizedIdentifier = data.identifier.trim();
      await authService.forgotPassword(normalizedIdentifier);
      // Route to verify-otp with identifier in query params for a seamless flow
      navigate(`/verify-otp?identifier=${encodeURIComponent(normalizedIdentifier)}`);
    } catch (err: any) {
      console.error('Forgot password submission error:', err);
      setApiError(err.message || 'Rate limit exceeded or server offline. Please wait 60 seconds.');
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
            <KeyRound className="w-4 h-4 text-gold-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Recover Password</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Enter the email address or Cameroon phone number associated with your premium account. We will dispatch a secure 6-digit recovery code.
          </p>

          {apiError && (
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-500 font-medium mb-5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="RECOVERY IDENTIFIER"
              type="text"
              placeholder="+2376XXXXXXXX or email@example.com"
              error={errors.identifier?.message}
              disabled={isLoading}
              {...register('identifier')}
              helperText="Must be registered on your account"
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} disabled={isLoading}>
              Request Verification Code
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-gold transition-colors font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
