import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/services/api';

const resetSchema = z
    .object({
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetForm) => {
        try {
            setError('');
            await authAPI.resetPassword({ token, password: data.password });
            setDone(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string; message?: string } } };
            setError(error.response?.data?.error || error.response?.data?.message || 'Reset failed. The link may have expired.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-30" />
            </div>

            <Card className="w-full max-w-md relative glass-card animate-fade-in">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
                    <CardDescription>Choose a strong password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {done ? (
                        <div className="space-y-4 text-center">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Password reset successfully. Redirecting to sign in...
                            </p>
                        </div>
                    ) : !token ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-red-500">
                                No reset token found. Please use the link from your email.
                            </p>
                            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500">
                                <ArrowLeft className="w-4 h-4" /> Request a new link
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                                )}
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
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset password'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
