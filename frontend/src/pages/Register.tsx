import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router';
import { Coins, UserPlus, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

// Registration schema with strict validation supporting phone-only, email-only, or both
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    phone_number: z
      .string()
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val), {
        message: 'Password must include at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to register',
    }),
  })
  .refine((data) => (data.phone_number && data.phone_number.trim() !== '') || (data.email && data.email.trim() !== ''), {
    message: 'At least one of Phone Number or Email is required',
    path: ['phone_number'],
  })
  .refine((data) => {
    const phone = data.phone_number?.trim();
    if (phone && phone !== '') {
      return /^\+2376\d{8}$/.test(phone);
    }
    return true;
  }, {
    message: 'Phone number must start with +2376 followed by exactly 8 digits (e.g., +237677123456)',
    path: ['phone_number'],
  })
  .refine((data) => {
    const mail = data.email?.trim();
    if (mail && mail !== '') {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail);
    }
    return true;
  }, {
    message: 'Invalid email address format',
    path: ['email'],
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerAction, isAuthenticated, error: storeError, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Prevent authenticated users from accessing /register
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      phone_number: '',
      email: '',
      password: '',
      confirm_password: '',
      accept_terms: undefined,
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

  // Clear any store errors on mount
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);
    clearError();
    try {
      const phone = data.phone_number?.trim() || null;
      const mail = data.email?.trim() || null;

      // Register and automatically log in (chain handled in authStore)
      await registerAction(data.username, phone, data.password, mail);
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setApiError(err.message || 'Registration failed. User identifier already registered.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, render nothing while redirecting
  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      {/* Soft luxury gold background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.06)_0%,_transparent_65%)] pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Brand logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="p-4 bg-gradient-to-tr from-gold-500 to-gold-400 rounded-3xl shadow-xl shadow-gold-500/20 text-white mb-2">
            <Coins className="w-8 h-8 text-white" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Mbamager</h1>
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest font-mono">
            Premium Financial OS
          </p>
        </div>

        {/* Card containing register form */}
        <Card className="shadow-xl shadow-slate-950/20 border-slate-800/80 bg-slate-900/90 p-8 rounded-3xl">
          <div className="flex items-center gap-2.5 mb-6">
            <UserPlus className="w-4 h-4 text-gold-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Create Secure Account</h2>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl my-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-full mb-3">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">Account Established!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Credentials verified. Activating session and redirecting to Dashboard operating hub...
              </p>
            </div>
          ) : (
            <>
              {(apiError || storeError) && (
                <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-500 font-medium mb-5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiError || storeError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="USERNAME"
                  type="text"
                  placeholder="e.g. Abigaile"
                  error={errors.username?.message}
                  disabled={isLoading}
                  {...register('username')}
                />

                <Input
                  label="EMAIL ADDRESS (OPTIONAL)"
                  type="email"
                  placeholder="e.g. user@example.com"
                  error={errors.email?.message}
                  disabled={isLoading}
                  {...register('email')}
                  helperText="Use to recover your account"
                />

                <Input
                  label="PHONE NUMBER (OPTIONAL)"
                  type="text"
                  placeholder="e.g. +237699999999"
                  error={errors.phone_number?.message}
                  disabled={isLoading}
                  {...register('phone_number')}
                  helperText="Format: +2376 followed by 8 digits"
                />

                <div className="relative flex flex-col">
                  <Input
                    label="PASSWORD"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    disabled={isLoading}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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
                    label="CONFIRM PASSWORD"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.confirm_password?.message}
                    disabled={isLoading}
                    {...register('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-[36px] text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-500 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      disabled={isLoading}
                      className="mt-0.5 rounded border-slate-800 bg-slate-950 text-gold-500 focus:ring-gold-500 focus:ring-offset-slate-950 w-4 h-4 cursor-pointer accent-gold-500"
                      {...register('accept_terms')}
                    />
                    <span className="leading-tight">
                      I understand and agree to the{' '}
                      <span className="text-gold hover:underline">Terms of Service</span> and{' '}
                      <span className="text-gold hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.accept_terms && (
                    <p className="text-[10px] font-mono text-rose-500 font-semibold mt-1">
                      {errors.accept_terms.message}
                    </p>
                  )}
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading} disabled={isLoading}>
                  Establish Secure Credentials
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="text-gold hover:underline font-bold">
                    Access Portal
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
