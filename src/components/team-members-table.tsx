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
            member.name?.toLowerCase().includes(q) ||
            member.email?.toLowerCase().includes(q) ||
            member.role?.toLowerCase().includes(q) ||
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
            <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#FFE600] border-b-2 border-black">
                        <TableRow className="border-b-2 border-black hover:bg-[#FFE600]">
                            <TableHead className="font-black text-black uppercase text-xs">Name & Email</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs">Role</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs">Sub-Domain</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs">Category</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs">Status</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs text-center">LinkedIn</TableHead>
                            <TableHead className="font-black text-black uppercase text-xs text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y-2 divide-black">
                        {membersList.length > 0 ? (
                            membersList.map((member: any) => (
                                <TableRow key={member.id} className="hover:bg-zinc-50 transition-colors">
                                    <TableCell className="py-3.5">
                                        <div className="flex items-center gap-3">
                                            {member.image ? (
                                                <Image src={member.image} alt={member.name} width={40} height={40} className="rounded-full object-cover h-10 w-10 border-2 border-black" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black text-sm">
                                                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-black text-black text-sm">{member.name}</span>
                                                <span className="text-[10px] font-mono font-bold text-zinc-600">{member.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-black text-xs">{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-2 border-black text-black bg-[#4285F4]/20 font-black text-[10px] uppercase rounded-none">
                                            {member.subDomain || 'General'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-black text-black bg-zinc-100 border border-black px-2 py-0.5 uppercase tracking-wider">
                                            {member.categoryName || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-wider ${
                                            member.status === 'active' ? 'bg-[#00FF66] text-black' : 'bg-[#FFE600] text-black'
                                        }`}>
                                            {member.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {member.linkedin ? (
                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-white hover:bg-[#4285F4] hover:text-white text-black shadow-[2px_2px_0px_0px_#000000] transition-colors">
                                                <LinkIcon className="h-4 w-4 stroke-[2.5]" />
                                            </a>
                                        ) : (
                                            <span className="text-zinc-400 font-bold text-xs">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleSendEmail(member)}
                                                disabled={isSendingEmail === member.id}
                                                className="h-8 w-8 rounded-none border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000]"
                                                title={member.status === 'pending' ? 'Resend Onboarding Invitation' : 'Send Profile Update Link'}
                                            >
                                                {isSendingEmail === member.id 
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-black" /> 
                                                    : member.status === 'pending' 
                                                        ? <Send className="h-3.5 w-3.5 text-black stroke-[2.5]" /> 
                                                        : <Mail className="h-3.5 w-3.5 text-black stroke-[2.5]" />
                                                }
                                            </Button>
                                            
                                            <Button asChild variant="outline" size="icon" className="h-8 w-8 rounded-none border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000]">
                                                <Link href={`/admin/team/edit/${member.id}`}>
                                                    <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                                                    <span className="sr-only">Edit Member</span>
                                                </Link>
                                            </Button>

                                            <Button
                                                 variant="destructive"
                                                 size="icon"
                                                 className="h-8 w-8 rounded-none border-2 border-black bg-[#FF0055] hover:bg-[#dd0044] text-white shadow-[2px_2px_0px_0px_#000000]"
                                                 disabled={isDeleting !== null}
                                                 onClick={() => setDeleteMemberId(member.id)}
                                             >
                                                 {isDeleting === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />}
                                                 <span className="sr-only">Delete Member</span>
                                             </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-zinc-500 font-bold uppercase tracking-wider text-xs">
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
        <div className="space-y-6 font-sans text-black">
            {/* Toolbar Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black stroke-[2.5]" />
                    <Input
                        type="text"
                        placeholder="Search by name, email, role, sub-domain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-none bg-white border-2 border-black text-black font-bold placeholder:text-zinc-400 text-xs shadow-[2px_2px_0px_0px_#000000] focus-visible:ring-0"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => handleBulkSend('pending')}
                        disabled={isBulkSending === 'pending' || !hasPending}
                        className="rounded-none px-5 bg-[#FFE600] hover:bg-[#f5dc00] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                    >
                        {isBulkSending === 'pending' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <MailWarning className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />}
                        Mail Pending
                    </Button>
                    <Button
                        onClick={() => handleBulkSend('active')}
                        disabled={isBulkSending === 'active' || !hasActive}
                        className="rounded-none px-5 bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                    >
                        {isBulkSending === 'active' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />}
                        Mail Active
                    </Button>
                </div>
            </div>

            {/* Tabs container */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                <TabsList className="bg-white border-2 border-black p-1 rounded-none w-full md:w-auto overflow-x-auto h-auto flex flex-row items-center gap-1.5 shadow-[3px_3px_0px_0px_#000000]">
                    <TabsTrigger value="all" className="rounded-none px-4 py-2 text-xs font-black uppercase tracking-wider select-none cursor-pointer transition-all data-[state=active]:bg-[#FFE600] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black">
                        All Members ({getCategoryCount('all')})
                    </TabsTrigger>
                    {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="rounded-none px-4 py-2 text-xs font-black uppercase tracking-wider select-none cursor-pointer transition-all data-[state=active]:bg-[#FFE600] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black">
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
