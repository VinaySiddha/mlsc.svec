'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { Pencil, Trash2, Loader2, Link as LinkIcon, MailWarning, Send, Mail, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteTeamMember, resendInvitation, sendProfileEditLink, bulkResendInvitations, bulkSendProfileEditLinks } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Image } from "@/components/image";
import { Badge } from "./ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

interface TeamMembersTableProps {
    members: any[];
    hasPending: boolean;
    hasActive: boolean;
}

export function TeamMembersTable({ members, hasPending, hasActive }: TeamMembersTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
    const [isBulkSending, setIsBulkSending] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const { toast } = useToast();
    const router = useRouter();

    const handleDeleteConfirm = async () => {
        if (!deleteMemberId) return;
        const memberId = deleteMemberId;
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
            setDeleteMemberId(null);
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
    };

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
    };

    const handleBulkSend = async (type: 'pending' | 'active') => {
        setIsBulkSending(type);
         try {
            let result;
            let successMessage = "";

            if (type === 'pending') {
                result = await bulkResendInvitations();
                successMessage = `Onboarding invitations sent to ${result.count} pending member(s).`;
            } else { // active
                result = await bulkSendProfileEditLinks();
                successMessage = `Profile edit links sent to ${result.count} active member(s).`;
            }

            if (result.error) {
                throw new Error(result.error);
            }
            toast({
                title: "Bulk Emails Sent!",
                description: successMessage,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: 'destructive',
                title: 'Bulk Email Failed',
                description: errorMessage,
            });
        } finally {
            setIsBulkSending(null);
        }
    };

    const getStatusVariant = (status: string) => {
        return status === 'active' ? 'default' : 'secondary';
    };

    // Filter members based on search query
    const searchedMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;
        const q = searchQuery.toLowerCase();
        return members.filter(member => 
            member.name.toLowerCase().includes(q) ||
            member.email.toLowerCase().includes(q) ||
            member.role.toLowerCase().includes(q) ||
            (member.subDomain && member.subDomain.toLowerCase().includes(q))
        );
    }, [members, searchQuery]);

    // Group members by category and sort them by role hierarchy (President, Lead, Member, etc.)
    const categories = useMemo(() => {
        const cats = new Set<string>();
        members.forEach(m => {
            if (m.categoryName) cats.add(m.categoryName);
        });
        return Array.from(cats).sort();
    }, [members]);

    const getTabMembers = (catName: string) => {
        if (catName === 'all') return searchedMembers;
        return searchedMembers.filter(m => m.categoryName === catName);
    };

    // Count helpers
    const getCategoryCount = (catName: string) => {
        if (catName === 'all') return members.length;
        return members.filter(m => m.categoryName === catName).length;
    };

    const renderTable = (membersList: any[]) => {
        return (
            <div className="border rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-950/20">
                <Table>
                    <TableHeader className="bg-slate-100/50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="font-bold">Name & Email</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold">Sub-Domain</TableHead>
                            <TableHead className="font-bold">Category</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold text-center">LinkedIn</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {membersList.length > 0 ? (
                            membersList.map((member: any) => (
                                <TableRow key={member.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <TableCell className="font-medium py-3.5">
                                        <div className="flex items-center gap-3">
                                            {member.image ? (
                                                <Image src={member.image} alt={member.name} width={40} height={40} className="rounded-full object-cover h-10 w-10 border border-slate-200 dark:border-zinc-800" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200">{member.name}</span>
                                                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-0.5">{member.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-zinc-300">{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/50">
                                            {member.subDomain || 'General'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
                                            {member.categoryName || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(member.status)} className="capitalize font-bold text-[10px] tracking-wider px-2.5 py-0.5">
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {member.linkedin ? (
                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-[#0A66C2] transition-colors">
                                                <LinkIcon className="h-4 w-4" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 dark:text-zinc-600 text-xs">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleSendEmail(member)}
                                                disabled={isSendingEmail === member.id}
                                                className="h-8 w-8 rounded-lg border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400"
                                                title={member.status === 'pending' ? 'Resend Onboarding Invitation' : 'Send Profile Update Link'}
                                            >
                                                {isSendingEmail === member.id 
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> 
                                                    : member.status === 'pending' 
                                                        ? <Send className="h-3.5 w-3.5 text-orange-500" /> 
                                                        : <Mail className="h-3.5 w-3.5 text-[#4285F4]" />
                                                }
                                            </Button>
                                            
                                            <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                                                <Link href={`/admin/team/edit/${member.id}`}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Edit Member</span>
                                                </Link>
                                            </Button>

                                            <Button
                                                 variant="destructive"
                                                 size="icon"
                                                 className="h-8 w-8 rounded-lg"
                                                 disabled={isDeleting !== null}
                                                 onClick={() => setDeleteMemberId(member.id)}
                                             >
                                                 {isDeleting === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                 <span className="sr-only">Delete Member</span>
                                             </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-slate-400 dark:text-zinc-500 font-medium">
                                    No members found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Toolbar Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    <Input
                        type="text"
                        placeholder="Search by name, email, role, sub-domain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#FBBC04]"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleBulkSend('pending')}
                        disabled={isBulkSending === 'pending' || !hasPending}
                        className="rounded-full px-5 border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider"
                    >
                        {isBulkSending === 'pending' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <MailWarning className="mr-2 h-3.5 w-3.5 text-orange-500" />}
                        Mail Pending
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleBulkSend('active')}
                        disabled={isBulkSending === 'active' || !hasActive}
                        className="rounded-full px-5 border-slate-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider"
                    >
                        {isBulkSending === 'active' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-2 h-3.5 w-3.5 text-[#4285F4]" />}
                        Mail Active
                    </Button>
                </div>
            </div>

            {/* Tabs container */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                <TabsList className="bg-slate-100 dark:bg-zinc-950/60 p-1 rounded-xl w-full md:w-auto overflow-x-auto h-auto flex flex-row items-center gap-1">
                    <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-xs font-bold capitalize select-none cursor-pointer transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                        All Members ({getCategoryCount('all')})
                    </TabsTrigger>
                    {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="rounded-lg px-4 py-2 text-xs font-bold capitalize select-none cursor-pointer transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">
                            {cat} ({getCategoryCount(cat)})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all" className="focus-visible:outline-none">
                    {renderTable(getTabMembers('all'))}
                </TabsContent>
                {categories.map(cat => (
                    <TabsContent key={cat} value={cat} className="focus-visible:outline-none">
                        {renderTable(getTabMembers(cat))}
                    </TabsContent>
                ))}
            </Tabs>

            <ConfirmDeleteDialog
                isOpen={deleteMemberId !== null}
                onClose={() => setDeleteMemberId(null)}
                onConfirm={handleDeleteConfirm}
                title="Remove Team Member?"
                description="This action cannot be undone. This will permanently remove the member profile and delete their data from the website team roster."
                isLoading={isDeleting !== null}
            />
        </div>
    );
}
