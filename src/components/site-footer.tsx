import { MLSCLogo } from '@/components/icons';
import Link from 'next/link';
import { Sparkles, Terminal, Activity, ArrowUpRight, Github, Linkedin, Instagram, Twitter } from 'lucide-react';

const footerColumns = [
    {
        label: 'Navigate',
        badgeColor: '#FFE600',
        links: [
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About Us' },
            { href: '/team', label: 'Club Team' },
            { href: '/events', label: 'Events & Sprints' },
            { href: '/what-our-alumni-say', label: 'Alumni Voices' },
            { href: '/schedule', label: 'Live Schedule' },
        ],
    },
    {
        label: 'Tech Domains',
        badgeColor: '#4285F4',
        links: [
            { href: '/apply?domain=genai', label: 'Generative AI & LLMs' },
            { href: '/apply?domain=ds', label: 'Data Science & ML' },
            { href: '/apply?domain=cloud', label: 'Cloud & DevOps' },
            { href: '/apply?domain=web', label: 'Web & App Dev' },
            { href: '/apply?domain=media', label: 'Media & Marketing' },
            { href: '/apply?domain=events', label: 'Events & Ops' },
        ],
    },
    {
        label: 'Open Source',
        badgeColor: '#00FF66',
        links: [
            { href: '/contribute', label: 'Contribute Code' },
            { href: '/issue-tracker', label: 'Issue Tracker' },
            { href: '/contributors', label: 'Hall of Fame' },
            { href: '/blog', label: 'Engineering Blog' },
            { href: '/projects', label: 'Shipped Projects' },
        ],
    },
    {
        label: 'Legal & Info',
        badgeColor: '#FF0055',
        links: [
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms-and-conditions', label: 'Terms of Use' },
            { href: '/what-our-alumni-say/submit', label: 'Submit Story' },
            { href: '/apply', label: 'Apply For Cohort' },
        ],
    },
];

const socialLinks = [
    {
        href: 'https://instagram.com/mlsc.svec',
        label: 'Instagram',
        icon: Instagram,
    },
    {
        href: 'https://linkedin.com/company/mlscsvec',
        label: 'LinkedIn',
        icon: Linkedin,
    },
    {
        href: 'https://github.com/mlscsvec',
        label: 'GitHub',
        icon: Github,
    },
    {
        href: 'https://twitter.com/mlscsvec',
        label: 'Twitter/X',
        icon: Twitter,
    },
];

export function SiteFooter() {
    return (
        <footer className="bg-white border-t-4 border-black font-sans relative overflow-hidden">
            {/* Top accent rainbow bar */}
            <div className="w-full h-2 grid grid-cols-4 border-b-2 border-black">
                <div className="bg-[#4285F4]" />
                <div className="bg-[#FF0055]" />
                <div className="bg-[#FFE600]" />
                <div className="bg-[#00FF66]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-12">
                {/* Main grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-12 border-b-4 border-black">

                    {/* Link columns */}
                    {footerColumns.map((col) => (
                        <div key={col.label} className="flex flex-col space-y-4">
                            <div className="inline-flex items-center gap-2">
                                <span 
                                    className="w-3 h-3 border-2 border-black shadow-[1px_1px_0px_0px_#000000]"
                                    style={{ backgroundColor: col.badgeColor }}
                                />
                                <p className="text-xs font-black text-black uppercase tracking-widest font-mono">
                                    {col.label}
                                </p>
                            </div>
                            <ul className="flex flex-col gap-2">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-xs font-bold text-zinc-700 hover:text-black transition-colors leading-relaxed hover:underline underline-offset-4 flex items-center gap-1 group"
                                        >
                                            <span className="text-[10px] text-zinc-400 group-hover:text-black">›</span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Brand column */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2 lg:pl-8 lg:border-l-4 lg:border-black flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="flex items-center justify-center h-10 w-10 bg-[#4285F4] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                                    <MLSCLogo className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <span className="text-lg font-display font-black text-black uppercase italic tracking-tight">
                                        MLSC <span className="text-[#4285F4]">SVEC</span>
                                    </span>
                                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">
                                        CHAPTER 3.0 // 2026-27
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-700 leading-relaxed mb-4 font-semibold">
                                Microsoft Learn Student Club at Sri Vasavi Engineering College. Built by students, recognized globally. Empowering builders to create real software.
                            </p>

                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66] border-2 border-black text-black text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
                                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                SYSTEM STATUS: OPERATIONAL
                            </div>
                        </div>

                        {/* Social icons */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 font-mono">
                                [ CONNECT WITH COMMUNITY ]
                            </p>
                            <div className="flex items-center gap-2">
                                {socialLinks.map((s) => {
                                    const IconComponent = s.icon;
                                    return (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.label}
                                            className="flex items-center justify-center h-9 w-9 bg-white border-2 border-black text-black hover:bg-[#FFE600] shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                                        >
                                            <IconComponent className="h-4 w-4 stroke-[2.5]" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom metadata bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-zinc-600 font-mono">
                    <p className="font-bold">
                        © {new Date().getFullYear()} MLSC SVEC · ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase bg-[#FFE600] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]">
                            BUILT FOR BUILDERS
                        </span>
                        <span className="text-zinc-500 font-bold">
                            LAT: 16.81°N · LON: 81.52°E
                        </span>
                    </div>
                </div>
            </div>

            {/* Massive watermark text */}
            <div className="w-full overflow-hidden select-none pointer-events-none opacity-15">
                <p
                    className="text-center font-display font-black uppercase leading-none whitespace-nowrap"
                    style={{
                        fontSize: 'clamp(60px, 16vw, 240px)',
                        color: 'transparent',
                        WebkitTextStroke: '3px rgba(0,0,0,0.2)',
                        letterSpacing: '-0.04em',
                        lineHeight: '0.85',
                        marginBottom: '-8px',
                    }}
                >
                    MLSC SVEC
                </p>
            </div>
        </footer>
    );
}
