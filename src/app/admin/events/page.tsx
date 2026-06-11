
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                        Manage <span className="text-[#34A853]">Events</span>
                    </h1>
                    <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Create, update, and manage all club events</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" className="rounded-full px-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                        <Link href="/admin/events/new">
                            <PlusCircle className="mr-2 h-4 w-4 text-[#34A853]" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <EventsTable events={events || []} />
            </div>
        </div>
    );
}
