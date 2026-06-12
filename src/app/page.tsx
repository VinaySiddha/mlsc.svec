import type { Metadata } from "next";
import Image from "next/image";
import { getNotifications } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";
import { NotificationTicker } from "@/components/notification-ticker";
import { DynamicHero } from "@/components/home/dynamic-hero";
import { HeroScroll } from "@/components/home/hero-scroll";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { MLSCDomainsCarousel } from "@/components/home/mlsc-domains-carousel";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Code2, ArrowUpRight } from "lucide-react";

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

                {/* Dynamic Notification/Ticker if needed, but keeping flow tidy */}
                
                {/* Cinematic scroll reveal */}
                <HeroScroll />

                {/* Trusted By / Partners section
                <section className="py-12 bg-black border-y border-white/5 overflow-hidden">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        <div className="relative w-full h-[60px] max-w-3xl mx-auto hover:scale-[1.01] transition-transform duration-500">
                            <Image
                                src="/moment_screenshot.png"
                                alt="Sponsors & Partners"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="opacity-75 hover:opacity-100 transition-opacity duration-500"
                                priority
                            />
                        </div>
                    </div>
                </section> */}

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

                <Testimonials />

                {/* Contribute CTA Section */}
                <section className="py-20 md:py-28 bg-[#030303] border-t border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(66,133,244,0.02)_100%)] pointer-events-none" />
                    <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 space-y-6">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
                                <Code2 className="h-3.5 w-3.5" /> Open Source Initiative
                            </div>
                        </ScrollReveal>
                        <ScrollReveal>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                                Want to Contribute to <span className="text-[#4285F4]">MLSC SVEC?</span>
                            </h2>
                        </ScrollReveal>
                        <ScrollReveal>
                            <p className="text-white/40 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                                Join our developer force. Help maintain repositories, build portals, optimize databases, and earn digital contribution credentials.
                            </p>
                        </ScrollReveal>
                        <ScrollReveal>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <a 
                                    href="/contribute" 
                                    className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-white/95 text-black font-black px-8 h-12 text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    Contribute Now <ArrowUpRight className="h-4 w-4" />
                                </a>
                                <a 
                                    href="/issue-tracker" 
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-[#0A0A0A] hover:bg-[#111] transition-all px-8 h-12 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-105 active:scale-95"
                                >
                                    View Issue Tracker
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </main>
        </div>
    );
}
