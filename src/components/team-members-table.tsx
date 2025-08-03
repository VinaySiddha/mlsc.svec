
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { Pencil, Trash2, Loader2, Link as LinkIcon, MailWarning, Send, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteTeamMember, resendInvitation, sendProfileEditLink } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Image } from "@/components/image";
import { Badge } from "./ui/badge";

interface TeamMembersTableProps {
    members: any[];
}

export function TeamMembersTable({ members }: TeamMembersTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (memberId: string) => {
        setIsDeleting(memberId);
        try {
            const result = await deleteTeamMember(memberId);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({
                title: "Member Deleted",
                description: "The team member has been successfully deleted.",
            });
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: errorMessage,
            });
        } finally {
            setIsDeleting(null);
        }
    }

    const handleSendEmail = async (member: any) => {
        setIsSendingEmail(member.id);
        try {
            let result;
            let successMessage = "";

            if (member.status === 'pending') {
                result = await resendInvitation(member.id);
                successMessage = "The onboarding invitation has been sent to the member's email.";
            } else { // active
                result = await sendProfileEditLink(member.id);
                successMessage = "The profile edit link has been sent to the member's email.";
            }

            if (result.error) {
                throw new Error(result.error);
            }
            toast({
                title: "Email Sent!",
                description: successMessage,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: 'destructive',
                title: 'Failed to Send Email',
                description: errorMessage,
            });
        } finally {
            setIsSendingEmail(null);
        }
    }


    const getStatusVariant = (status: string) => {
        return status === 'active' ? 'default' : 'secondary';
    }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sub-Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>LinkedIn</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                         {member.image ? (
                            <Image src={member.image} alt={member.name} width={40} height={40} className="rounded-full object-cover" />
                         ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <MailWarning className="h-5 w-5"/>
                            </div>
                         )}
                         <div>
                            <span>{member.name}</span>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                         </div>
                      </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.subDomain}</TableCell>
                   <TableCell>
                      <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                  </TableCell>
                  <TableCell>
                      {member.linkedin ? (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            <LinkIcon className="h-4 w-4" />
                        </a>
                      ) : (
                         <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSendEmail(member)}
                            disabled={isSendingEmail === member.id}
                            title={member.status === 'pending' ? 'Resend Invitation Email' : 'Send Edit Link Email'}
                        >
                            {isSendingEmail === member.id 
                                ? <Loader2 className="h-4 w-4 animate-spin" /> 
                                : member.status === 'pending' 
                                    ? <Send className="h-4 w-4" /> 
                                    : <Mail className="h-4 w-4" />
                            }
                        </Button>
                        
                         <Button asChild variant="outline" size="icon">
                           <Link href={`/admin/team/edit/${member.id}`}>
                               <Pencil className="h-4 w-4" />
                               <span className="sr-only">Edit Member</span>
                           </Link>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isDeleting === member.id}>
                                    {isDeleting === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    <span className="sr-only">Delete Member</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the team member.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(member.id)} disabled={!!isDeleting}>
                                    {isDeleting ? "Deleting..." : "Continue"}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No team members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
