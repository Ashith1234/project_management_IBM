import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const { register: registerUser, googleLogin } = useAuth();
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
            const result = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password
            });
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Registration failed. Please try again.');
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
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
                <p className="text-slate-500 mt-2">Join thousands of teams managing projects better.</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Full Name"
                            className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                            error={errors.name?.message}
                            {...register('name')}
                        />
                    </div>
                </div>

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
                </div>

                <div className="space-y-1">
                    <div className="relative">
                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Confirm Password"
                            type="password"
                            className="pl-10 h-11 border-slate-200 focus:ring-indigo-500"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold transition-all group"
                        isLoading={isLoading}
                    >
                        Get Started
                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Sign in here
                </Link>
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        try {
                            const result = await googleLogin(credentialResponse.credential);
                            if (result.success) {
                                navigate('/dashboard');
                            } else {
                                setError(result.error || 'Google sign-in failed. Please try again.');
                            }
                        } catch (err) {
                            setError('Google sign-in failed. Please try again.');
                        }
                    }}
                    onError={() => setError('Google sign-in was unsuccessful')}
                    useOneTap
                    theme="outline"
                    width="100%"
                />
            </div>
        </div>
    );
};

export default Register;
