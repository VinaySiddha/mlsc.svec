
import { getEvents } from "@/app/actions";
import { EventsTable } from "@/components/events-table";
import { MLSCLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

// Make this page dynamic to prevent build-time Firestore access errors
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const headersList = await headers();
    const userRole = headersList.get('X-User-Role');

    if (userRole !== 'super_admin' && userRole !== 'event_admin') {
        redirect('/admin');
    }

    const { events, error } = await getEvents();

    if (error) {
        return <div>Error loading events: {error}</div>
    }

    return (
        <div className="space-y-6 font-sans text-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#00FF66] border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                        <PlusCircle className="h-7 w-7 text-black stroke-[2.5]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-black uppercase font-display">
                            Manage <span className="text-[#34A853]">Events</span>
                        </h1>
                        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-0.5">Create, update, and manage all club events</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild className="bg-[#FFE600] hover:bg-[#FFE600]/90 text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] px-6 h-11">
                        <Link href="/admin/events/new">
                            <PlusCircle className="mr-2 h-4 w-4 stroke-[3]" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_#000000]">
                <EventsTable events={events || []} />
            </div>
        </div>
    );
}
