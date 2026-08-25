'use client';

import { Suspense } from 'react';
import Image from 'next/image';
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
import { checkUsernameAvailable } from '@/lib/user-service';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(15, 'Username must be under 15 characters.')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores are allowed.'),
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
    defaultValues: { displayName: '', username: '', email: '', password: '' },
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
      // Check if username is available first
      const isAvailable = await checkUsernameAvailable(values.username);
      if (!isAvailable) {
        toast({
          variant: 'destructive',
          title: 'Username Taken',
          description: 'This username is already in use. Please choose another one.',
        });
        setIsSubmitting(false);
        return;
      }

      await signUpWithEmail(values.email, values.password, values.displayName, values.username);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 md:p-10 font-sans">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="bg-[#0E0E10] border-2 border-white/20 shadow-[10px_10px_0px_0px_#4285F4] overflow-hidden">
          <div className="grid md:grid-cols-2">

            {/* ── Left: form panel ── */}
            <div className="p-8 md:p-10 flex flex-col justify-center gap-6 bg-[#0E0E10] border-b-2 md:border-b-0 md:border-r-2 border-white/20">
              {/* Logo + heading */}
              <div className="flex flex-col items-center gap-2 text-center">
                <Link href="/" className="inline-block hover:translate-x-[1px] hover:translate-y-[1px] transition-transform mb-1">
                  <div className="inline-flex h-14 w-14 items-center justify-center bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#FFFFFF]">
                    <MLSCLogo className="h-8 w-8 text-black" />
                  </div>
                </Link>
                <div className="inline-block px-3 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_#FFFFFF]">
                  [ SVEC COMMUNITY PORTAL ]
                </div>
                <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                  {isSignUp ? 'CREATE ' : 'USER '}
                  <span className="text-[#FFE600]">{isSignUp ? 'ACCOUNT.' : 'LOGIN.'}</span>
                </h1>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {isSignUp ? 'Join the MLSC developer network' : 'Access your member dashboard'}
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
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="username" 
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                field.onChange(val);
                              }}
                              className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <button 
                      type="submit" 
                      className="w-full h-11 bg-[#00FF66] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      REGISTER ACCOUNT [↗]
                    </button>
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
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-wider text-white">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="bg-black border-2 border-white/20 rounded-none h-11 px-4 text-xs text-white placeholder-zinc-500 focus:border-[#4285F4] focus:shadow-[3px_3px_0px_0px_#4285F4]" />
                          </FormControl>
                          <FormMessage className="text-red-400 text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <button 
                      type="submit" 
                      className="w-full h-11 bg-[#FFE600] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      SIGN IN NOW [→]
                    </button>
                  </form>
                </Form>
              )}

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0E0E10] px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    OR INSTANT AUTH
                  </span>
                </div>
              </div>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isOAuthSigningIn !== null}
                  className="bg-black border-2 border-white/20 hover:border-white text-white h-11 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
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
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={isOAuthSigningIn !== null}
                  className="bg-black border-2 border-white/20 hover:border-white text-white h-11 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {isOAuthSigningIn === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                  )}
                  GitHub
                </button>
              </div>

              {/* Toggle sign in / sign up */}
              <p className="text-center text-xs text-zinc-400">
                {isSignUp ? 'Already registered?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#FFE600] underline font-bold uppercase tracking-wider text-xs ml-1"
                >
                  {isSignUp ? 'Sign In [→]' : 'Create Account [↗]'}
                </button>
              </p>

              {/* Terms */}
              <p className="text-center text-[11px] text-zinc-500 leading-relaxed">
                By accessing, you agree to our{' '}
                <LegalModal type="terms" className="text-zinc-400 underline">
                  Terms
                </LegalModal>{' '}and{' '}
                <LegalModal type="privacy" className="text-zinc-400 underline">
                  Privacy Policy
                </LegalModal>.
              </p>
            </div>

            {/* ── Right: image panel ── */}
            <div className="relative hidden md:flex flex-col justify-between p-10 bg-black">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/mlsc-preview.png"
                  alt="MLSC SVEC"
                  fill
                  sizes="50vw"
                  className="object-cover opacity-30 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-[#00FF66] text-black text-[10px] font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_#FFFFFF] mb-4">
                  [ ⚡ CORE ECOSYSTEM ]
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-white font-display font-black text-3xl uppercase italic tracking-tight leading-[0.9]">
                  SRI VASAVI<br />
                  <span className="text-[#FFE600]">ENGINEERING COLLEGE</span>
                </p>
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mt-2">
                  MICROSOFT LEARN STUDENT CHAPTER · AP, INDIA
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/login" className="px-4 py-2 bg-zinc-900 border-2 border-white/20 hover:border-white text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all">
            [ ADMIN PORTAL ]
          </Link>
          <Link href="/" className="px-4 py-2 bg-[#FFE600] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
            [ PUBLIC HOME ]
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
