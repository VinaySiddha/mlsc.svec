
import { getAnalyticsData } from "@/app/actions";
import { AdminDashboardAnalytics } from "@/components/admin-dashboard-analytics";

export async function AdminAnalyticsSection({ panelDomain }: { panelDomain?: string }) {
    const analyticsData = await getAnalyticsData(panelDomain);

    if ('error' in analyticsData) {
        return <div>Error loading analytics: {analyticsData.error}</div>;
    }

    return <AdminDashboardAnalytics data={analyticsData as any} />;
}
