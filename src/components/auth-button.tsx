
"use client";

import { useUser, useAuth } from "@/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { Button } from "./ui/button";
import { LogIn, LogOut, User as UserIcon, Loader2, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { createUserProfile } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

export default function AuthButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Not Ready",
            description: "Firebase auth service is not available. Please try again in a moment.",
        });
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      toast({
        title: "Signed In",
        description: `Welcome, ${result.user.displayName}!`,
      });
    } catch (error) {
      // Don't show an error toast if the user simply closes the popup
      if (error instanceof FirebaseError && error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description:
          "Could not sign you in with Google. Please try again.",
      });
    }
  };

  const handleSignOut = async () => {
     if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Not Ready",
            description: "Firebase auth service is not available.",
        });
        return;
    }
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
       console.error("Sign out error:", error);
       toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "Could not sign you out. Please try again.",
      });
    }
  };

  if (isUserLoading) {
    return (
      <Button variant="glass" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="glass" size="sm">
        <LogIn className="mr-2 h-4 w-4" />
        Join Us
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="icon" className="rounded-full">
           <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
            <p className="font-bold">{user.displayName}</p>
            <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/admin">
            <Crown className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
