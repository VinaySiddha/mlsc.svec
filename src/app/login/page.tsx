
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { MLSCLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Users, Calendar, LogIn, Menu, Send, Group, Book, Code } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/team", label: "Team", icon: Group },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Users },
];

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
          description: "You've been logged in.",
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
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
       <header className="header sticky top-0 z-50 w-full border-b border-white/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Microsoft Learn Student Club
            </span>
          </Link>
          <nav className="navbar hidden lg:flex items-center gap-6 text-sm font-medium">
             {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors">{link.label}</Link>
             ))}
             <a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a>
             <a href="#" className="text-gray-300 hover:text-white transition-colors">Projects</a>
          </nav>
          <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent border-gray-400 hover:bg-white/10">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gray-900/90 border-r-gray-700/50 text-white">
                    <div className="p-4">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <SheetClose key={link.href} asChild>
                                    <Link href={link.href} className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                        <link.icon className="h-5 w-5" /> {link.label}
                                    </Link>
                                </SheetClose>
                            ))}
                             <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Book className="h-5 w-5" /> Blog
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <a href="#" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Code className="h-5 w-5" /> Projects
                                </a>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/apply" className="flex items-center gap-3 text-lg font-semibold p-2 rounded-md hover:bg-white/10">
                                    <Send className="h-5 w-5" /> Apply
                                </Link>
                            </SheetClose>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-gray-300">Enter your credentials to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} className="bg-gray-700/50 border-gray-600 text-white" />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-gray-700/50 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
