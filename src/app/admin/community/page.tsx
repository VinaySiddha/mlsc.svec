import { getFlaggedPosts } from '@/app/community-actions';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MLSCLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { ModerationTable } from './moderation-table';

export default async function AdminCommunityPage() {
  const headersList = await headers();
  const userRole = headersList.get('X-User-Role');

  if (userRole !== 'super_admin') {
    redirect('/admin');
  }

  const { posts } = await getFlaggedPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <MLSCLogo className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Community Moderation</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 container mx-auto space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Flagged Posts
            </CardTitle>
            <CardDescription>
              Review reported community posts. Dismiss false reports or delete offending content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModerationTable posts={posts} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
