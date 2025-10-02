"use client";

import { useUser } from "@/firebase";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileForm } from "@/components/user-profile-form";

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to home
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (userError) {
      return (
          <div className="flex h-screen w-full items-center justify-center p-4">
              <Card className="glass-card">
                  <CardHeader>
                      <CardTitle>Authentication Error</CardTitle>
                      <CardDescription>{userError.message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild>
                          <Link href="/">Go to Home</Link>
                      </Button>
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MLSCLogo className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Profile
            </h1>
          </div>
          <Button asChild variant="glass">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-2xl space-y-8">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-4">
                 <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={user.photoURL!} alt={user.displayName!} />
                  <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <UserProfileForm userId={user.uid} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
