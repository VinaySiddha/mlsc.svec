import Image from "next/image";
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
        <section className="py-12 md:py-16 bg-transparent">
            <div className="container mx-auto px-4 text-center">
                <ScrollReveal>
                    <h2 className="text-4xl font-bold mb-2">Our <span className="gradient-text">Team</span></h2>
                    <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                        Meet the leaders guiding our community.
                    </p>
                </ScrollReveal>
                <StaggerContainer className={`grid gap-8 mx-auto ${displayAmbassadors.length <= 2 ? 'md:grid-cols-2 lg:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl'}`}>
                    {displayAmbassadors.map((person) => (
                        <StaggerItem key={person.id}>
                            <div className="glass-card-hover p-6 flex flex-col items-center group">
                                <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300">
                                    <Image
                                        src={person.photoUrl}
                                        alt={person.name}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold">{person.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{person.description}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
