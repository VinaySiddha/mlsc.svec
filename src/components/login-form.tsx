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
    <div className={cn('flex flex-col gap-6 font-sans', className)} {...props}>
      <div className="bg-[#0E0E10] border-2 border-white/20 shadow-[10px_10px_0px_0px_#FF0055] overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* ── Left: login panel ── */}
          <div className="p-8 md:p-10 flex flex-col justify-center gap-6 bg-[#0E0E10] border-b-2 md:border-b-0 md:border-r-2 border-white/20">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center bg-[#FF0055] border-2 border-black shadow-[3px_3px_0px_0px_#FFFFFF] mb-2">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white stroke-[2.5]" fill="none" stroke="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="inline-block px-3 py-1 bg-[#FF0055] text-white text-[10px] font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_#FFFFFF]">
                [ RESTRICTED ACCESS ]
              </div>
              <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                ADMIN <span className="text-[#FFE600]">CONTROL.</span>
              </h1>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Authorized Personnel Only
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#FFE600] hover:translate-x-[1px] hover:translate-y-[1px] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#FFFFFF] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
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
                {isOAuthLoading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE WITH GOOGLE [→]'}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0E0E10] px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    AUTHORIZATION PROTOCOL
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                {[
                  { step: '01', text: 'Sign in using your institutional or authorized Google account' },
                  { step: '02', text: 'Firebase Security Rules authenticate against authorized admin UID' },
                  { step: '03', text: 'Session elevation granted for portal management and CRUD operations' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3 bg-black border-2 border-white/10 p-2.5">
                    <span className="text-[10px] font-black text-black bg-[#FFE600] px-2 py-0.5 border border-black min-w-[28px] text-center shrink-0">
                      {step}
                    </span>
                    <span className="text-xs text-zinc-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-500">
              Session is encrypted & monitored for audit logging.
            </p>
          </div>

          {/* ── Right: image panel ── */}
          <div className="relative hidden md:flex flex-col justify-between p-10 bg-black">
            <div className="absolute inset-0 z-0">
              <img
                src="/blueday.png"
                alt="MLSC SVEC"
                className="h-full w-full object-cover opacity-25 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-[#FF0055] text-white text-[10px] font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_#FFFFFF] mb-4">
                [ 🔒 CONTROL OPERATIONS ]
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-white font-display font-black text-3xl uppercase italic tracking-tight leading-[0.9]">
                ADMINISTRATIVE<br />
                <span className="text-[#FFE600]">SYSTEM INTERFACE</span>
              </p>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mt-2">
                MLSC SVEC CHAPTER MANAGEMENT ENGINE
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center">
        <a href="/" className="inline-block px-4 py-2 bg-zinc-900 border-2 border-white/20 hover:border-white text-zinc-400 hover:text-white transition-all font-black uppercase tracking-wider text-xs">
          [ ← RETURN TO PUBLIC SITE ]
        </a>
      </p>
    </div>
  );
}
