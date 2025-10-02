
// This page is no longer needed as event details are shown in a dialog.
// We can redirect to the main events page.
import { redirect } from 'next/navigation';

export default function EventDetailPage() {
    redirect('/events');
}
