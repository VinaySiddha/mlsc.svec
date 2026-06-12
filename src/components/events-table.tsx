
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Registrations</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length > 0 ? (
            events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                        {event.title}
                  </TableCell>
                   <TableCell className="text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {format(new Date(event.date), "PPP")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.registrationOpen ? 'default' : 'secondary'}>
                        {event.registrationOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="icon">
                           <Link href={`/admin/events/${event.id}`}>
                               <Eye className="h-4 w-4" />
                               <span className="sr-only">View Registrations</span>
                           </Link>
                        </Button>
                         <Button asChild variant="outline" size="icon">
                           <Link href={`/admin/events/edit/${event.id}`}>
                               <Pencil className="h-4 w-4" />
                               <span className="sr-only">Edit Event</span>
                           </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            disabled={isDeleting || isPending}
                            onClick={() => setDeleteEventId(event.id)}
                        >
                            {(isDeleting || isPending) && deleteEventId === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
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
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
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
