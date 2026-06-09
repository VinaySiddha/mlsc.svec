import type { Metadata } from "next";
import { getNotifications } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";
import { NotificationTicker } from "@/components/notification-ticker";
import { DynamicHero } from "@/components/home/dynamic-hero";
import { HeroScroll } from "@/components/home/hero-scroll";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { MLSCDomainsCarousel } from "@/components/home/mlsc-domains-carousel";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export const metadata: Metadata = {
  title: "MLSC SVEC — Microsoft Learn Student Club",
  description: "The official hub of Microsoft Learn Student Club at Sri Vasavi Engineering College. Explore events, meet the team, and join our community of student innovators.",
  openGraph: {
    title: "MLSC SVEC — Microsoft Learn Student Club",
    description: "The official hub of Microsoft Learn Student Club at Sri Vasavi Engineering College. Explore events, meet the team, and join our community of student innovators.",
    url: "https://mlscsvec.in",
  },
};

export const dynamic = 'force-dynamic';

export default async function Home() {
    const [{ notifications }, homeData] = await Promise.all([
        getNotifications(),
        getHomePageData(),
    ]);

    return (
        <div className="flex flex-col min-h-screen text-white bg-black">
            <main className="flex-1">
                <DynamicHero images={homeData.heroImages} />

                {/* Cinematic scroll reveal */}
                <HeroScroll />

                <section className="py-16 md:py-24 container mx-auto px-6">
                    <ScrollReveal>
                        <div className="mb-2 px-4">
                            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">
                                Explore Our <span className="text-[#4285F4]">Domains.</span>
                            </h3>
                            <p className="text-white/40 font-medium text-sm mt-1">Click any card to learn more.</p>
                        </div>
                    </ScrollReveal>
                    <MLSCDomainsCarousel />
                </section>

                <DynamicGallery images={homeData.galleryImages} />
            </main>
        </div>
    );
}
