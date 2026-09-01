import Link from 'next/link';
import { 
  ArrowLeft, 
  Compass, 
  Home, 
  Sparkles, 
  Calendar, 
  Users, 
  Send, 
  Search, 
  BookOpen, 
  LifeBuoy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '404: Page Not Found — MLSC SVEC',
  description: 'The requested page could not be found on the MLSC SVEC portal.',
};

export default function NotFound() {
  const quickLinks = [
    {
      title: 'Home Base',
      desc: 'Return to the main portal homepage',
      href: '/',
      icon: Home,
      color: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20 hover:border-[#4285F4]/50',
    },
    {
      title: 'Apply for Team',
      desc: 'Join the premier technical student club',
      href: '/apply',
      icon: Send,
      color: 'text-[#34A853] bg-[#34A853]/10 border-[#34A853]/20 hover:border-[#34A853]/50',
    },
    {
      title: 'Events & Workshops',
      desc: 'Browse hackathons & tech sessions',
      href: '/events',
      icon: Calendar,
      color: 'text-[#FBBC05] bg-[#FBBC05]/10 border-[#FBBC05]/20 hover:border-[#FBBC05]/50',
    },
    {
      title: 'Meet the Team',
      desc: 'Explore leads, coordinators & alumni',
      href: '/team',
      icon: Users,
      color: 'text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20 hover:border-[#EA4335]/50',
    },
    {
      title: 'Blogs & Guides',
      desc: 'Tech writeups, roadmaps and stories',
      href: '/blog',
      icon: BookOpen,
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 hover:border-cyan-400/50',
    },
    {
      title: 'Track Application',
      desc: 'Check your recruitment status',
      href: '/track',
      icon: Search,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:border-purple-400/50',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans relative overflow-hidden selection:bg-[#4285F4] selection:text-white">
      {/* Dynamic Background Mesh & Layered Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-[#4285F4]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-[#EA4335]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-[#34A853]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="container mx-auto px-6 pt-8 pb-4 relative z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Safety
        </Link>
      </header>

      {/* Hero Visual Area */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-12">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          {/* Creative Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-[#EA4335] animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white/70">
              HTTP 404 · Signal Lost in Cyberspace
            </span>
          </div>

          {/* Large Creative 404 Typography */}
          <div className="relative select-none my-4">
            <h1 className="text-8xl sm:text-9xl md:text-[13rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/10 drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]">
              4<span className="text-[#4285F4]">0</span>4
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Compass className="h-32 w-32 md:h-48 md:w-48 text-[#4285F4]/10 animate-[spin_20s_linear_infinite]" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Page Node Not Found.
            </h2>
            <p className="text-white/40 text-sm sm:text-base font-medium leading-relaxed">
              The coordinates you requested lead to an uncharted digital sector or the node has been relocated.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild variant="glass" className="h-12 px-8 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/20 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              <Link href="/contact" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[#FBBC05]" />
                Report an Issue
              </Link>
            </Button>
          </div>

          {/* Quick Access Matrix / Popular Destinations */}
          <div className="pt-12 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#4285F4]" />
                Popular Orbit Destinations
              </h3>
              <span className="text-[10px] font-mono text-white/30 uppercase">
                Direct Teleport
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {quickLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-md flex items-start gap-3.5"
                  >
                    <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#4285F4] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Subtle Footer Tag */}
      <footer className="container mx-auto px-6 py-6 text-center text-[10px] font-mono text-white/20 relative z-10">
        MLSC SVEC NODE ROUTING SUBSYSTEM · STATUS 404
      </footer>
    </div>
  );
}
