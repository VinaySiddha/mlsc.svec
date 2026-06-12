'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { LegalModal } from '@/components/legal-modal';

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
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Email sign-in failed for: ${values.email}`,
        error,
        "UserLoginPage",
        values.email
      );
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
      const { logClientError } = await import("@/lib/error-logger");
      await logClientError(
        `Email registration failed for: ${values.email}`,
        error,
        "UserLoginPage",
        values.email
      );
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
        const { logClientError } = await import("@/lib/error-logger");
        await logClientError(
          `OAuth sign-in failed with provider: ${provider}`,
          error,
          "UserLoginPage",
          "unknown"
        );
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0 border-0 shadow-2xl">
          <CardContent className="grid p-0 md:grid-cols-2">

            {/* ── Left: form panel ── */}
            <div className="p-8 md:p-10 flex flex-col justify-center gap-6 bg-[#0A0A0A]">
              {/* Logo + heading */}
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href="/" className="inline-block hover:opacity-80 transition-opacity mb-1">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10">
                    <MLSCLogo className="h-8 w-8 text-white" />
                  </div>
                </Link>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                  {isSignUp ? 'Join ' : 'Sign '}
                  <span className="text-[#4285F4]">{isSignUp ? 'Us.' : 'In.'}</span>
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  {isSignUp ? 'Create your MLSC SVEC account' : 'Access your MLSC SVEC account'}
                </p>
              </div>

              {/* Email/password form */}
              {isSignUp ? (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 rounded-xl h-11 px-4 text-sm focus:border-[#4285F4] transition-all" />
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
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 rounded-xl h-11 px-4 text-sm focus:border-[#4285F4] transition-all" />
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
                            <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 rounded-xl h-11 px-4 text-sm focus:border-[#4285F4] transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 bg-white text-black font-bold hover:bg-white/90 rounded-xl mt-2" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 rounded-xl h-11 px-4 text-sm focus:border-[#4285F4] transition-all" />
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
                            <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 rounded-xl h-11 px-4 text-sm focus:border-[#4285F4] transition-all" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 bg-white text-black font-bold hover:bg-white/90 rounded-xl mt-2" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0A0A0A] px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isOAuthSigningIn !== null}
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl h-11 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {isOAuthSigningIn === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Google
                </Button>
                <Button
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={isOAuthSigningIn !== null}
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl h-11 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {isOAuthSigningIn === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                  )}
                  GitHub
                </Button>
              </div>

              {/* Toggle sign in / sign up */}
              <p className="text-center text-xs text-white/40">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#4285F4] hover:underline font-bold"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>

              {/* Terms */}
              <p className="text-center text-[10px] text-white/20 leading-relaxed">
                By signing in, you agree to our{' '}
                <LegalModal type="terms" className="text-white/30 hover:text-white/60">
                  Terms of Service
                </LegalModal>{' '}and{' '}
                <LegalModal type="privacy" className="text-white/30 hover:text-white/60">
                  Privacy Policy
                </LegalModal>.
              </p>
            </div>

            {/* ── Right: image panel ── */}
            <div className="relative hidden md:block min-h-[500px]">
              <img
                src="/mlsc-preview.png"
                alt="MLSC SVEC"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Bottom branding */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-black text-xl uppercase italic tracking-tight leading-tight drop-shadow-lg">
                  Microsoft Learn<br />
                  <span className="text-[#4285F4]">Student Chapter</span>
                </p>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">SVEC · Community Hub</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Bottom links */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <Link href="/login" className="text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors">
            Admin Login
          </Link>
          <span className="text-white/20 text-xs">·</span>
          <Link href="/" className="text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors">
            Public Site
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
