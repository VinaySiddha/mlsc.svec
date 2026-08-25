import { ContributorForm } from "@/components/contributor-form";
import { Terminal, Github, Heart, Star, Code2, Cpu } from "lucide-react";

export const metadata = {
  title: "Contribute to MLSC SVEC — Open Source Portal",
  description: "Want to contribute to Microsoft Learn Student Club Sri Vasavi Engineering College repositories? Submit your request to join the developer force.",
};

export default function ContributePage() {
  return (
    <div className="w-full bg-white min-h-screen py-24 md:py-32 text-black font-sans">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-10 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <Terminal className="h-3.5 w-3.5 stroke-[2.5]" /> [ OPEN SOURCE INITIATIVE ]
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight uppercase italic leading-[0.9] text-black">
              CONTRIBUTION <span className="text-[#4285F4]">PORTAL.</span>
            </h1>
            <p className="text-zinc-700 font-semibold text-sm md:text-base max-w-xl">
              Become a builder for our student community. Help maintain, refactor, and build next-gen portals, event systems, and bot integrations.
            </p>
          </div>
          
          <a
            href="https://github.com/mlscsvec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] text-black px-5 h-12 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0"
          >
            <Github className="h-4 w-4" /> MLSC GITHUB <Star className="h-3 w-3 fill-black text-black" />
          </a>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#4285F4]">
              <div className="inline-block px-2.5 py-1 bg-[#4285F4] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000000] mb-3">
                [ BUILD WITH US ]
              </div>
              <h3 className="text-xl font-display font-black uppercase italic tracking-tight text-black mb-2">
                Why contribute to MLSC?
              </h3>
              <p className="text-zinc-700 text-xs leading-relaxed font-semibold">
                MLSC SVEC maintains custom software for resume parsing, event management, real-time analytics, and community forums. Contributing here gives you verified production experience.
              </p>
            </div>

            {/* Core tracks */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#00FF66]">
                <div className="p-2 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                  <Code2 className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">Production Stack</h4>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed mt-1">
                    Next.js 15 App Router, TypeScript, TailwindCSS v4, Firebase Auth & Firestore, and Cloudflare.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#FFE600]">
                <div className="p-2 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                  <Cpu className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">Incubating Ideas</h4>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed mt-1">
                    Have an idea for a feature, event, or Discord bot? Propose it and lead its technical development.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#FF0055]">
                <div className="p-2 bg-[#FF0055] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                  <Heart className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">Perks & Recognition</h4>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed mt-1">
                    Approved contributors are featured publicly, earn official developer credentials, and recommendation letters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="lg:col-span-7">
            <ContributorForm />
          </div>

        </div>

      </div>
    </div>
  );
}
