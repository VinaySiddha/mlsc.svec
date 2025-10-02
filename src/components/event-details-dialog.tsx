
'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { format } from "date-fns";
import { CountdownTimer } from "./countdown-timer";
import { EventRegistrationForm } from "./event-registration-form";
  
interface EventDetailsDialogProps {
    event: any;
}

export function EventDetailsDialog({ event }: EventDetailsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                    <DialogDescription>
                        {format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <CountdownTimer deadline={event.date} />
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                    <div className="pt-4">
                        <EventRegistrationForm eventId={event.id} registrationOpen={event.registrationOpen} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
