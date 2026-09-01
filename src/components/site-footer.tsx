import { MLSCLogo } from '@/components/icons';
import Link from 'next/link';

const footerColumns = [
    {
        label: 'Navigate',
        links: [
            { href: '/', label: 'Home' },
            { href: '/docs', label: 'Documentation (SSoT)' },
            { href: '/about', label: 'About' },
            { href: '/team', label: 'Team' },
            { href: '/events', label: 'Events' },
            { href: '/services', label: 'Services Hub' },
            { href: '/blog', label: 'Blog' },
            { href: '/contact', label: 'Contact Us' },
            { href: '/schedule', label: 'Schedule' },
            { href: '/donate', label: 'Donate' },
        ],
    },
    {
        label: 'Join Us',
        links: [
            { href: '/apply', label: 'Apply Now' },
            { href: '/apply?domain=genai', label: 'Generative AI' },
            { href: '/apply?domain=ds', label: 'Data Science' },
            { href: '/apply?domain=cloud', label: 'Cloud & DevOps' },
            { href: '/apply?domain=web', label: 'Web & App Dev' },
            { href: '/apply?domain=design', label: 'Design' },
        ],
    },
    {
        label: 'Community',
        links: [
            { href: '/community', label: 'Community Hub' },
            { href: '/events', label: 'Past Events' },
            { href: '/blog', label: 'Blog & News' },
            { href: '/issue-tracker', label: 'Issue Tracker' },
            { href: '/contribute', label: 'Contribute' },
            { href: '/contributors', label: 'Contributors Circle' },
            { href: '/status', label: 'Site Status' },
        ],
    },
    {
        label: 'Legal',
        links: [
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms-and-conditions', label: 'Terms of Use' },
            { href: '/guidelines', label: 'Guidelines' },
            { href: '/contact', label: 'Contact Us' },
        ],
    },
];

const socialLinks = [
    {
        href: 'https://instagram.com/mlsc.svec',
        label: 'Instagram',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
        ),
    },
    {
        href: 'https://linkedin.com/company/mlscsvec',
        label: 'LinkedIn',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
    {
        href: 'https://github.com/mlscsvec',
        label: 'GitHub',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
        ),
    },
    {
        href: 'https://twitter.com/mlscsvec',
        label: 'Twitter/X',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        ),
    },
];

export function SiteFooter() {
    return (
        <footer className="bg-black border-t border-white/[0.06]">
            <div className="mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-10">

                {/* Main grid — columns left, brand right */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-white/[0.06]">

                    {/* Link columns */}
                    {footerColumns.map((col) => (
                        <div key={col.label}>
                            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-5">
                                {col.label}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        {'external' in link && link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white/50 hover:text-white transition-colors duration-150 leading-none"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-white/50 hover:text-white transition-colors duration-150 leading-none"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Brand column — far right, spans 2 cols on large */}
                    <div className="col-span-2 sm:col-span-1 lg:col-span-2 lg:pl-8 lg:border-l lg:border-white/[0.06]">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.06] border border-white/10">
                                <MLSCLogo className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-base font-bold text-white tracking-tight">
                                MLSC <span className="text-[#4285F4]">SVEC</span>
                            </span>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-[240px]">
                            Microsoft Learn Student Club at Sri Vasavi Engineering College. Building the next generation of tech leaders.
                        </p>
                        {/* Social icons */}
                        <div className="flex items-center gap-2">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                    <p className="text-xs text-white/25">
                        © {new Date().getFullYear()} MLSC SVEC. All rights reserved.
                    </p>
                    <p className="text-xs text-white/25">
                        Made with ❤️ by the MLSC Core Team
                    </p>
                </div>

            </div>

            {/* ── Massive watermark text ── */}
            <div className="w-full overflow-hidden select-none pointer-events-none">
                <p
                    className="text-center font-black uppercase leading-none whitespace-nowrap"
                    style={{
                        fontSize: 'clamp(80px, 18vw, 280px)',
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.03em',
                        lineHeight: '0.85',
                        paddingBottom: '0',
                        marginBottom: '-8px',
                    }}
                >
                    MLSC SVEC
                </p>
            </div>
        </footer>
    );
}
