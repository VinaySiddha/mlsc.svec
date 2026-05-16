import type { Metadata } from "next";
import { getNotifications } from "@/app/actions";
import { getHomePageData } from "@/app/home-actions";
import { NotificationTicker } from "@/components/notification-ticker";
import { DynamicHero } from "@/components/home/dynamic-hero";
import { DynamicGallery } from "@/components/home/dynamic-gallery";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Code, Users, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/image";

export const metadata: Metadata = {
  title: "MLSC SVEC — Microsoft Learn Student Club",
  description: "The official hub of Microsoft Learn Student Club at Sri Vasavi Engineering College. Explore events, meet the team, and join our community of student innovators.",
  openGraph: {
    title: "MLSC SVEC — Microsoft Learn Student Club",
    description: "The official hub of Microsoft Learn Student Club at Sri Vasavi Engineering College. Explore events, meet the team, and join our community of student innovators.",
    url: "https://mlscsvec.in",
  },
};

export const revalidate = 60;

export default async function Home() {
    const [{ notifications }, homeData] = await Promise.all([
        getNotifications(),
        getHomePageData(),
    ]);

    return (
        <div className="flex flex-col min-h-screen text-white bg-black">
            <main className="flex-1">
                <DynamicHero images={homeData.heroImages} />
                
                <section className="py-24 md:py-40 container mx-auto px-6">
                    <ScrollReveal>
                        <div className="mb-20">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">Innovate <br/> <span className="text-[#4285F4]">With Us.</span></h2>
                            <p className="text-xl text-white/50 max-w-xl font-medium tracking-tight">Explore the massive opportunities waiting for you at MLSC SVEC.</p>
                        </div>
                    </ScrollReveal>

                    <div className="bento-grid">
                        {/* Highlights */}
                        <div className="bento-card md:col-span-2 md:row-span-2 group">
                            <div className="absolute top-0 right-0 p-8">
                                <Code className="h-10 w-10 text-[#4285F4]" />
                            </div>
                            <div className="mt-auto">
                                <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">Advanced <br/> Workshops.</h3>
                                <p className="text-white/50 font-medium leading-relaxed">Dive deep into GenAI, Cloud, and Web Development with hands-on sessions from industry experts.</p>
                            </div>
                        </div>

                        <div className="bento-card md:col-span-2 group border-[#34A853]/20 bg-[#34A853]/5">
                             <div className="absolute top-0 right-0 p-8">
                                <Users className="h-8 w-8 text-[#34A853]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 uppercase italic">Networking.</h3>
                            <p className="text-white/50 font-medium text-sm">Connect with 500+ developers, mentors, and club leaders from across the region.</p>
                        </div>

                        <div className="bento-card md:col-span-2 group border-[#FBBC04]/20 bg-[#FBBC04]/5">
                            <div className="absolute top-0 right-0 p-8">
                                <Rocket className="h-8 w-8 text-[#FBBC04]" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 uppercase italic">Launchpad.</h3>
                            <p className="text-white/50 font-medium text-sm">Present your projects and get the chance to win exclusive Microsoft swags and credits.</p>
                        </div>

                        {/* Leaders / Chapters replacement */}
                        <div className="bento-card md:col-span-4 group overflow-hidden h-[30rem] md:h-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 p-12 flex flex-col justify-end">
                                <h3 className="text-5xl font-black tracking-tighter mb-4 uppercase italic">Our <span className="text-[#EA4335]">Community.</span></h3>
                                <p className="text-white/50 font-medium max-w-lg">Meet the leaders and pioneers who are building the most active developer community at SVEC.</p>
                                <Button variant="link" className="text-[#EA4335] p-0 font-black uppercase tracking-[0.2em] mt-6 w-fit hover:no-underline group">
                                    Meet the Team <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                                </Button>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-end pr-6 md:pr-12 opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="grid grid-cols-2 gap-3 md:gap-4 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                                    {homeData.ambassadors.slice(0, 4).map((person, i) => (
                                        <div key={i} className="relative w-24 h-32 md:w-32 md:h-44 rounded-xl md:rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/10 shadow-2xl bg-[#0A0A0A]">
                                             <Image
                                                src={person.photoUrl}
                                                alt={person.name}
                                                fill
                                                sizes="(max-width: 768px) 100px, 150px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <DynamicGallery images={homeData.galleryImages} />
            </main>
        </div>
    );
}
