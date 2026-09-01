
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from 'date-fns';
import { Button } from "./ui/button";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteEvent } from "@/app/actions";
import { useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";


interface EventsTableProps {
    events: any[];
}

export function EventsTable({ events }: EventsTableProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();


    const handleDeleteConfirm = () => {
        if (!deleteEventId) return;
        const eventId = deleteEventId;
        startTransition(async () => {
            setIsDeleting(true);
            try {
                const result = await deleteEvent(eventId);
                if (result.error) {
                    throw new Error(result.error);
                }
                toast({
                    title: "Event Deleted",
                    description: "The event has been successfully deleted.",
                });
                setDeleteEventId(null);
                router.refresh();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                toast({
                    variant: 'destructive',
                    title: 'Deletion Failed',
                    description: errorMessage,
                });
            } finally {
                setIsDeleting(false);
            }
        });
    };

  return (
    <div className="border-2 border-black overflow-hidden font-sans text-black">
      <Table>
        <TableHeader className="bg-zinc-100 border-b-2 border-black">
          <TableRow>
            <TableHead className="text-black font-black uppercase text-xs">Event Title</TableHead>
            <TableHead className="hidden md:table-cell text-black font-black uppercase text-xs">Event Date</TableHead>
            <TableHead className="text-black font-black uppercase text-xs text-center">Status</TableHead>
            <TableHead className="text-black font-black uppercase text-xs text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-200">
          {events.length > 0 ? (
            events.map((event: any) => (
                <TableRow key={event.id} className="hover:bg-zinc-50">
                  <TableCell className="font-bold text-xs text-black">
                    <span className="font-display font-black uppercase tracking-tight text-sm">{event.title}</span>
                  </TableCell>
                   <TableCell className="text-zinc-600 font-bold text-xs whitespace-nowrap hidden md:table-cell">
                      {format(new Date(event.date), "PPP")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`font-black uppercase tracking-wider text-[10px] px-2.5 py-0.5 border-2 border-black shadow-[1px_1px_0px_0px_#000000] rounded-none ${event.registrationOpen ? 'bg-[#00FF66] text-black' : 'bg-zinc-200 text-zinc-700'}`}>
                        {event.registrationOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="icon" className="h-8 w-8 border-2 border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000000]">
                           <Link href={`/admin/events/${event.id}`}>
                               <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                               <span className="sr-only">View Registrations</span>
                           </Link>
                        </Button>
                         <Button asChild variant="outline" size="icon" className="h-8 w-8 border-2 border-black bg-white hover:bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]">
                           <Link href={`/admin/events/edit/${event.id}`}>
                               <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                               <span className="sr-only">Edit Event</span>
                           </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={isDeleting || isPending}
                            onClick={() => setDeleteEventId(event.id)}
                            className="h-8 w-8 border-2 border-black bg-white hover:bg-[#FF0055] hover:text-white text-black shadow-[2px_2px_0px_0px_#000000]"
                        >
                            {(isDeleting || isPending) && deleteEventId === event.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                            )}
                            <span className="sr-only">Delete Event</span>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        isOpen={deleteEventId !== null}
        onClose={() => setDeleteEventId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event?"
        description="This action cannot be undone. This will permanently delete the event and all of its registration data."
        isLoading={isDeleting || isPending}
      />
    </div>
  );
}
