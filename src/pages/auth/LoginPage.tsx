import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI, api } from '@/services/api';
import { MFAChallengeModal } from '@/components/auth/MFAChallengeModal';
import { useAuthStore } from '@/store';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [mfaTempToken, setMfaTempToken] = useState<string | null>(null);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setError('');
            const response = await authAPI.login(data);
            const payload = response.data.data;
            // MFA required: hold the pre-MFA temp token ONLY for the verify
            // call — do NOT store it as a session. Open the challenge modal.
            if (payload?.mfaRequired) {
                const tempToken: string | undefined = payload?.tokens?.accessToken;
                if (!tempToken) {
                    setError('MFA required but no challenge token was issued.');
                    return;
                }
                setMfaTempToken(tempToken);
                return;
            }
            const { user, tenant, tokens } = payload;
            setAuth(user, tenant, tokens);
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Login failed. Please try again.');
        }
    };

    const handleMfaSuccess = async (verifiedTokens: { accessToken: string; refreshToken: string }) => {
        try {
            setError('');
            // Fetch the full profile with the MFA-verified token, then establish the session.
            const profileRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${verifiedTokens.accessToken}` },
            });
            const { user, tenant } = profileRes.data.data;
            setMfaTempToken(null);
            setAuth(user, tenant, verifiedTokens);
            navigate('/dashboard');
        } catch {
            setError('MFA verified but failed to load your profile. Please sign in again.');
            setMfaTempToken(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-30" />
            </div>

            <Card className="w-full max-w-md relative glass-card animate-fade-in">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>Sign in to your CMS dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    className="rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign up free
                        </Link>
                    </p>
                </CardFooter>
            </Card>
            {mfaTempToken && (
                <MFAChallengeModal
                    tempToken={mfaTempToken}
                    onSuccess={handleMfaSuccess}
                    onCancel={() => setMfaTempToken(null)}
                />
            )}
        </div>
    );
}
