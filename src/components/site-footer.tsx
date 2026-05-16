import { MLSCLogo } from '@/components/icons';
import { Github, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="bg-black border-t border-white/5 py-24">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <MLSCLogo className="h-10 w-10 text-white" />
                            <span className="text-3xl font-black tracking-tighter text-white uppercase">MLSC <span className="text-[#4285F4]">SVEC</span></span>
                        </div>
                        <p className="text-lg text-white/50 font-medium max-w-sm leading-relaxed">
                            Microsoft Learn Student Club • Sri Vasavi Engineering College.
                            Building the future of technology, one line of code at a time.
                        </p>
                        <div className="flex gap-6 mt-10">
                            <a href="https://github.com/mlscsvec" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                                <Github className="h-6 w-6" />
                            </a>
                            <a href="https://linkedin.com/company/mlscsvec" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                                <Linkedin className="h-6 w-6" />
                            </a>
                            <a href="https://instagram.com/mlsc.svec" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                                <Instagram className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-white/30 mb-8">Ecosystem Info</h4>
                        <div className="flex flex-col gap-5 text-sm font-bold text-white/60 uppercase tracking-widest">
                            <Link href="/about" className="hover:text-white transition-colors">Vision</Link>
                            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
                            <Link href="/team" className="hover:text-white transition-colors">Team</Link>
                            <Link href="/blog" className="hover:text-white transition-colors">FAQ</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-white/30 mb-8">Resources</h4>
                        <div className="flex flex-col gap-5 text-sm font-bold text-white/60 uppercase tracking-widest">
                             <a href="https://mlscsvec.openstatus.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Status</a>
                             <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                             <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
                             <Link href="/community" className="hover:text-white transition-colors">Guidelines</Link>
                        </div>
                    </div>
                </div>
                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[0.6rem] text-white/20 font-black uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} MLSC SVEC • ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-12 text-[0.6rem] font-black uppercase tracking-[0.4em] text-white/20">
                        <span>MADE WITH PASSION BY MLSC CORE</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
