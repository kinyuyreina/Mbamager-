import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Coins, ShieldAlert, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { authService } from '../services/auth';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val), {
        message: 'Password must include at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get('identifier') || '';
  const resetToken = searchParams.get('token') || '';

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  React.useEffect(() => {
    if (!identifier || !resetToken) {
      setApiError('Recovery authorization context is missing. Please restart the process.');
    }
  }, [identifier, resetToken]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  });

  const passwordValue = watch('password', '');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'No Password', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium Security', color: 'bg-amber-500' };
    return { score, label: 'Strong & Highly Secure', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!identifier || !resetToken) {
      setApiError('Missing context. Please restart password recovery.');
      return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      await authService.resetPassword(identifier, resetToken, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Password reset submit error:', err);
      setApiError(err.message || 'Failed to update password. Authorization may have expired.');
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
            <Lock className="w-4 h-4 text-gold-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Establish New Password</h2>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl my-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-full mb-3">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">Password Renewed!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your new security password is now active. Routing to login gateway...
              </p>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-500 font-medium mb-5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative flex flex-col">
                  <Input
                    label="NEW PASSWORD"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    disabled={isLoading || !resetToken}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || !resetToken}
                    className="absolute right-4 top-[36px] text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  {passwordValue && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold font-mono">
                        <span className="text-slate-500">Security Index:</span>
                        <span className={strength.score <= 2 ? 'text-rose-500' : strength.score <= 4 ? 'text-amber-500' : 'text-emerald-500'}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        <div className={`flex-1 rounded-full h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-800'}`} />
                        <div className={`flex-1 rounded-full h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-800'}`} />
                        <div className={`flex-1 rounded-full h-full transition-all duration-300 ${strength.score >= 5 ? strength.color : 'bg-slate-800'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col">
                  <Input
                    label="CONFIRM NEW PASSWORD"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.confirm_password?.message}
                    disabled={isLoading || !resetToken}
                    {...register('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || !resetToken}
                    className="absolute right-4 top-[36px] text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading} disabled={isLoading || !resetToken}>
                  Renew Secure Password
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link to="/login" className="text-xs text-slate-500 hover:text-gold transition-colors font-semibold">
              Return to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
