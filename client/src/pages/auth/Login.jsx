import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await login(data.email, data.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                <p className="text-slate-500 mt-2">Log in to manage your projects and team.</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Email address"
                            type="email"
                            className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Password"
                            type="password"
                            className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold transition-all group"
                    isLoading={isLoading}
                >
                    Sign In
                    {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Create an account
                </Link>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400 font-medium">
                    Industry-grade project management for teams that scale.
                </p>
            </div>
        </div>
    );
};

export default Login;
