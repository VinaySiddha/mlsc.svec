'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { adminGoogleLoginAction } from '@/app/actions/admin-auth-actions';
import Link from 'next/link';

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
      <div className="bg-white border-2 border-black shadow-[10px_10px_0px_0px_#000000] overflow-hidden">
        <div className="grid md:grid-cols-2">
          
          {/* ── Left: login panel ── */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center gap-6 bg-white border-b-2 md:border-b-0 md:border-r-2 border-black">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center bg-[#EA4335] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <Lock className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 bg-black text-white">
                  Admin Terminal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-black pt-2">
                ADMIN <span className="bg-[#FFE600] border border-black px-1.5">PORTAL</span>
              </h1>
              <p className="text-xs text-zinc-600 font-bold">
                Restricted access for core club administrators and lead organizers.
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
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
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    AUTHORIZATION PROTOCOL
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {[
                  { step: '01', text: 'Sign in with your authorized Google administrator email' },
                  { step: '02', text: 'Firebase Security verifies against the admin UID whitelist' },
                  { step: '03', text: 'Session elevation granted for operations & database control' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3 bg-zinc-50 border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] font-black text-black bg-[#FFE600] px-2 py-0.5 border border-black min-w-[28px] text-center shrink-0">
                      {step}
                    </span>
                    <span className="text-xs text-zinc-700 font-bold">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-zinc-500 font-bold">
              Access is protected by Firebase IAM & monitored by telemetry audit logs.
            </p>
          </div>

          {/* ── Right: image panel ── */}
          <div className="relative hidden md:flex flex-col justify-between p-10 bg-zinc-100 border-l border-zinc-200">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-[#EA4335] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                [ 🔒 CONTROL OPERATIONS ]
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tight text-black leading-none">
                Administrative<br />
                <span className="text-[#4285F4]">Management</span><br />
                Engine
              </h3>
              <p className="text-xs text-zinc-600 font-bold leading-relaxed">
                Centralized console for managing event tickets, student recruitment, member rosters, quizzes, and financial ledger records.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#00A844]" />
                <span className="text-xs font-black uppercase tracking-wider text-black">Security Standards</span>
              </div>
              <ul className="text-[11px] text-zinc-600 font-bold space-y-1">
                <li>✓ Role-based access control (RBAC)</li>
                <li>✓ Cryptographic session verification</li>
                <li>✓ Audit trail for payment approvals</li>
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                MLSC SVEC Chapter Management Console
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-black hover:bg-zinc-50 text-black transition-all font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#000000]">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Public Site
        </Link>
      </p>
    </div>
  );
}
