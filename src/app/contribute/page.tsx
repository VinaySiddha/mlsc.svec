import { ContributorForm } from "@/components/contributor-form";
import { Terminal, Github, Heart, Star, Code2, Cpu } from "lucide-react";

export const metadata = {
  title: "Contribute to MLSC SVEC — Open Source Portal",
  description: "Want to contribute to Microsoft Learn Student Club Sri Vasavi Engineering College repositories? Submit your request to join the developer force.",
};

export default function ContributePage() {
  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-10 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
              <Terminal className="h-3.5 w-3.5" /> Open Source Initiative
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Contribution <span className="text-[#4285F4]">Portal</span>
            </h1>
            <p className="text-white/40 font-medium text-sm max-w-xl">
              Become a builder for our student community. Help maintain, refactor, and build next-gen portals, event systems, and bot integrations.
            </p>
          </div>
          
          <a
            href="https://github.com/mlscsvec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 bg-[#0A0A0A] hover:bg-[#111] transition-all rounded-xl px-5 h-11 text-xs font-bold uppercase tracking-wider text-white shrink-0 shadow-lg"
          >
            <Github className="h-4 w-4" /> MLSC GitHub <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          </a>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight italic text-white/90">
                Why contribute to MLSC?
              </h3>
              <p className="text-white/50 text-xs leading-relaxed font-medium">
                MLSC SVEC maintains custom software for resume parsing, event management, real-time analytics, and community forums. Contributing here gives you real production experience.
              </p>
            </div>

            {/* Core tracks */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-[#050505]">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Production Stack</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1 font-medium">
                    We use Next.js 15, TypeScript, TailwindCSS, Firebase (Auth/Firestore), and Cloudflare Workers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-[#050505]">
                <div className="p-2 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] shrink-0">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Incubating Ideas</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1 font-medium">
                    Have an idea for a feature, event, or Discord/Telegram bot? Propose it and lead its development!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-[#050505]">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Perks & Recognition</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1 font-medium">
                    Approved contributors are listed publicly, receive specialized developer digital ID cards, and earn recommendation letters.
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
