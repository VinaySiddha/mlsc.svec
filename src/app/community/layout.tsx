import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Link href="/community" className="flex items-center gap-2">
              <MLSCLogo className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Community</h1>
            </Link>
          </div>
          <Button asChild variant="glass" size="sm">
            <Link href="/community/new">New Post</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 container mx-auto max-w-3xl">
        {children}
      </main>
    </div>
  );
}
