import { Image } from "@/components/image";
import type { Ambassador } from "@/app/home-actions";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-container";

const defaultAmbassadors: Ambassador[] = [
    {
        id: "default1",
        name: "Chandu Neelam",
        description: "Our pioneering MLSA leader, with exceptional leadership and technical prowess.",
        photoUrl: "/a1.jpg"
    },
    {
        id: "default2",
        name: "Akash Pydipala",
        description: "A passionate advocate for technology and community building.",
        photoUrl: "/a2.jpg"
    }
];

export function DynamicAmbassadors({ ambassadors = [] }: { ambassadors?: Ambassador[] }) {
    const displayAmbassadors = [...defaultAmbassadors, ...ambassadors];

    return (
        <section className="relative py-24 md:py-32 bg-background overflow-hidden">
            <div className="glow-accent top-[20%] right-[-10%] w-[30%] h-[30%] opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                <ScrollReveal>
                    <div className="text-center mb-20">
                        <h2 className="section-header">Our <span className="text-primary">Leaders.</span></h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                            The visionary minds driving the club towards new horizons of technology and community.
                        </p>
                    </div>
                </ScrollReveal>
                <StaggerContainer className={`grid gap-12 mx-auto ${displayAmbassadors.length <= 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl'}`}>
                    {displayAmbassadors.map((person) => (
                        <StaggerItem key={person.id}>
                            <div className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border border-white/5 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(66,133,244,0.2)] transition-all duration-500">
                                <Image
                                    src={person.photoUrl}
                                    alt={person.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-110"
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                                
                                {/* Text Content Overlaid */}
                                <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-left">
                                    <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">MLSA Leader</p>
                                    <h3 className="text-4xl font-black tracking-tighter text-white group-hover:text-primary transition-colors duration-300 mb-4">{person.name}</h3>
                                    <p className="text-white/60 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
                                        {person.description}
                                    </p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
