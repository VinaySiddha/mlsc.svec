'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

function LoginContent() {
  const { user, loading, signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSigningIn, setIsOAuthSigningIn] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/community';

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(values.email, values.password);
      toast({ title: 'Welcome Back!', description: 'You have signed in successfully.' });
      router.push(redirectTo);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: error?.message || 'Invalid email or password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signUpWithEmail(values.email, values.password, values.displayName);
      toast({ title: 'Account Created!', description: 'Welcome to MLSC SVEC.' });
      router.push(redirectTo);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error?.message || 'Could not create account. Email may already be in use.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsOAuthSigningIn(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'github') await signInWithGithub();
      toast({ title: 'Welcome!', description: 'You have been signed in successfully.' });
      router.push(redirectTo);
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: 'destructive',
          title: 'Sign-in Failed',
          description: error?.message || 'Could not authenticate. Please try again.',
        });
      }
    } finally {
      setIsOAuthSigningIn(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans items-center justify-center p-6">
      <div className="glow-sphere top-[20%] left-[20%] w-[30%] h-[30%] bg-[#FBBC04]/10" />
      <div className="glow-sphere bottom-[20%] right-[20%] w-[30%] h-[30%] bg-[#4285F4]/10" />

      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
              <MLSCLogo className="h-9 w-9 text-white" />
            </div>
          </Link>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {isSignUp ? "Create" : "Welcome"} <br/> 
            <span className="text-[#4285F4]">{isSignUp ? "Account." : "Back."}</span>
          </h1>
          <p className="text-white/40 mt-3 font-semibold uppercase tracking-wider text-[10px]">
            {isSignUp ? "Register to access the hub" : "Sign in to access the hub"}
          </p>
        </div>

        <div className="bento-card border-white/5 bg-[#0e0e0e] p-8 md:p-10">
          {isSignUp ? (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
                <FormField
                  control={signupForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-primary w-full !mt-8 h-12 bg-white text-black font-bold hover:bg-white/90 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 rounded-xl h-12 px-5 text-sm focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-primary w-full !mt-8 h-12 bg-white text-black font-bold hover:bg-white/90 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0e0e0e] px-3 text-white/40 font-bold tracking-widest text-[9px]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isOAuthSigningIn !== null}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl h-12 flex items-center justify-center gap-2"
            >
              {isOAuthSigningIn === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Google
            </Button>
            <Button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isOAuthSigningIn !== null}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl h-12 flex items-center justify-center gap-2"
            >
              {isOAuthSigningIn === 'github' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              )}
              GitHub
            </Button>
          </div>

          <div className="mt-8 text-center text-xs text-white/40">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#4285F4] hover:underline font-bold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/login" className="text-white/30 hover:text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors">
            Admin Login
          </Link>
          <Link href="/" className="text-white/30 hover:text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors">
            Return to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4285F4]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
