'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await loginAction(values);
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: "Welcome back, Admin.",
        });
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error(result.error || 'Invalid credentials.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white font-sans items-center justify-center p-6">
      <div className="glow-sphere top-[20%] left-[20%] w-[30%] h-[30%] bg-[#EA4335]/10" />
      <div className="glow-sphere bottom-[20%] right-[20%] w-[30%] h-[30%] bg-[#4285F4]/10" />

      <div className="w-full max-w-md space-y-12 relative z-10">
        <div className="text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#EA4335]/5 border border-[#EA4335]/10 mb-8">
                <ShieldCheck className="h-10 w-10 text-[#EA4335]" />
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Admin <br/> <span className="text-[#EA4335]">Control.</span></h1>
            <p className="text-white/40 mt-4 font-bold uppercase tracking-widest text-xs">Restricted Access Only</p>
        </div>

        <div className="bento-card border-white/5 bg-[#0A0A0A] p-10 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} className="bg-white/5 border-white/10 rounded-xl h-14 px-6 text-lg focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-white/5 border-white/10 rounded-xl h-14 px-6 text-lg focus:border-[#4285F4] transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-primary w-full !mt-12" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                  Authorize Access
                </Button>
              </form>
            </Form>
        </div>

        <div className="text-center">
            <Link href="/" className="text-white/30 hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-colors">
              Return to Public Site
            </Link>
        </div>
      </div>
    </div>
  );
}
