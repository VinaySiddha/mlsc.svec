
import { getNotifications } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";
import { NotificationTicker } from "@/components/notification-ticker";
import { DynamicHero } from "@/components/home/dynamic-hero";
import { DynamicAmbassadors } from "@/components/home/dynamic-ambassadors";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { DynamicChapters } from "@/components/home/dynamic-chapters";

export const revalidate = 60;

export default async function Home() {
    const [{ notifications }, homeData] = await Promise.all([
        getNotifications(),
        getHomePageData(),
    ]);

    return (
        <div className="flex flex-col min-h-screen text-foreground bg-transparent">
            <main className="flex-1">
                <NotificationTicker notifications={notifications?.map(n => n.message) || []} />
                <DynamicHero images={homeData.heroImages} />
                <DynamicAmbassadors ambassadors={homeData.ambassadors} />
                <DynamicGallery images={homeData.galleryImages} />
                <DynamicChapters chapters={homeData.chapters} />
            </main>
        </div>
    );
}
