import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/services/api';
import { useState } from 'react';

const forgotSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotForm) => {
        try {
            await authAPI.forgotPassword(data);
        } catch {
            // Always show success to avoid user enumeration
        } finally {
            setSent(true);
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
                    <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
                    <CardDescription>We'll email you a reset link if the account exists</CardDescription>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="space-y-4 text-center">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                If an account exists for that email, a password reset link has been sent.
                                It expires in 1 hour.
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500">
                                <ArrowLeft className="w-4 h-4" /> Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                        Sending...
                                    </>
                                ) : (
                                    'Send reset link'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500">
                                    <ArrowLeft className="w-4 h-4" /> Back to sign in
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
