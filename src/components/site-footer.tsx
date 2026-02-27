import { MLSCLogo } from '@/components/icons';
import { Github, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer
            className="bg-background/80 backdrop-blur-sm border-t border-transparent relative"
            style={{ borderImage: 'linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.3), hsl(262 83% 58% / 0.3), transparent) 1' }}
        >
            <div className="container mx-auto py-10 px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <MLSCLogo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-lg">MLSC SVEC</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Microsoft Learn Student Club at Sri Vasavi Engineering College.
                            Learn. Train. Serve.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                            <Link href="/team" className="hover:text-primary transition-colors">Team</Link>
                            <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex gap-3 mb-4">
                            <a href="https://github.com/mlscsvec" target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="https://www.linkedin.com/company/microsoft-learn-student-club-svec" target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="https://instagram.com/mlsc.svec" target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all">
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</Link>
                            <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Status</a>
                        </div>
                    </div>
                </div>
                <div className="section-divider mt-8 mb-4" />
                <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MLSC SVEC. All rights reserved.</p>
            </div>
        </footer>
    );
}
