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
  // Combine default ambassadors and custom firestore ambassadors, deduplicating by name/id
  const displayAmbassadors = ambassadors && ambassadors.length > 0
    ? [...ambassadors, ...defaultAmbassadors.filter(d => !ambassadors.some(a => a.name.toLowerCase() === d.name.toLowerCase()))]
    : defaultAmbassadors;

  return (
    <section className="py-20 md:py-28 container mx-auto px-6 relative overflow-hidden bg-black">
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#4285F4]/10 blur-[140px] rounded-full pointer-events-none" />

      <ScrollReveal>
        <div className="mb-12 px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#4285F4]">
              Leadership • Ambassadors
            </span>
            <span className="h-px w-12 bg-[#4285F4]/40" />
          </div>

          <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
            Our <span className="text-[#4285F4]">Ambassadors.</span>
          </h3>

          <p className="text-white/40 font-medium text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
            The visionary student leaders driving our community towards technical excellence, innovation, and impactful collaboration.
          </p>
        </div>
      </ScrollReveal>

      <StaggerContainer className={`grid gap-8 mx-auto px-4 ${displayAmbassadors.length <= 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl'}`}>
        {displayAmbassadors.map((person) => (
          <StaggerItem key={person.id}>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] hover:border-[#4285F4]/50 hover:shadow-[0_0_40px_rgba(66,133,244,0.25)] transition-all duration-500">
              <Image
                src={person.photoUrl}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500" />
              
              {/* Text Content Overlaid */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-[#4285F4]/20 border border-[#4285F4]/30 text-[#4285F4] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
                  MLSA Leader
                </span>
                <h4 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white group-hover:text-[#4285F4] transition-colors duration-300 mb-2">
                  {person.name}
                </h4>
                <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                  {person.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
