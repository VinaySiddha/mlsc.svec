'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { adminGoogleLoginAction } from '@/app/actions/admin-auth-actions';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setIsOAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await adminGoogleLoginAction(idToken);

      if (response.success) {
        toast({
          title: 'Access Granted',
          description: `Welcome, ${result.user.displayName?.split(' ')[0] || 'Admin'}.`,
        });
        await auth.signOut();
        window.location.href = '/admin';
      } else {
        await auth.signOut();
        throw new Error(response.error || 'Access denied.');
      }
    } catch (error: any) {
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        setIsSubmitting(false);
        setIsOAuthLoading(false);
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* ── Left: login panel ── */}
          <div className="p-8 md:p-10 flex flex-col justify-center gap-6 bg-black">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 mb-2">
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#EA4335" opacity="0.2"/>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="none" stroke="#EA4335" strokeWidth="1.5"/>
                  <path d="M9 12l2 2 4-4" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                Admin <span className="text-[#EA4335]">Control</span>
              </h1>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                Restricted Access Only
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full h-12 bg-white hover:bg-white/90 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg"
              >
                {isOAuthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {isOAuthLoading ? 'Verifying...' : 'Continue with Google'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    How access works
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                {[
                  { step: '01', text: 'Sign in with your Google account' },
                  { step: '02', text: 'Your email is verified against the admin list' },
                  { step: '03', text: 'Access granted based on your assigned role' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#4285F4] bg-[#4285F4]/10 rounded-lg px-2 py-1 min-w-[28px] text-center shrink-0">
                      {step}
                    </span>
                    <span className="text-xs text-white/50">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-white/20">
              By signing in, you agree to our{' '}
              <a href="#" className="underline hover:text-white/50 transition-colors">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-white/50 transition-colors">Privacy Policy</a>.
            </p>
          </div>

          {/* ── Right: image panel ── */}
          <div className="relative hidden md:block">
            <img
              src="/blueday.png"
              alt="MLSC SVEC"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-[#4285F4]/20" />
            {/* Label */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white font-black text-xl uppercase italic tracking-tight leading-tight drop-shadow-lg">
                Microsoft Learn<br />
                <span className="text-[#4285F4]">Student Chapter</span>
              </p>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">SVEC · Admin Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-white/30">
        <a href="/" className="underline-offset-4 hover:text-white/60 transition-colors font-bold uppercase tracking-widest text-[10px]">
          ← Return to Public Site
        </a>
      </p>
    </div>
  );
}
