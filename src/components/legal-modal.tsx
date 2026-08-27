'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type LegalType = 'terms' | 'privacy';

interface LegalModalProps {
  type: LegalType;
  children: React.ReactNode;
  className?: string;
}

const CONTENT = {
  terms: {
    title: 'Terms and Conditions',
    accent: 'text-[#4285F4]',
    sections: [
      {
        heading: '1. Agreement to Terms',
        body: 'By accessing this website, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.',
      },
      {
        heading: '2. Intellectual Property',
        body: 'The Service and its original content, features, and functionality are and will remain the exclusive property of MLSC SVEC. The content on this website is protected by copyright and other intellectual property laws.',
      },
      {
        heading: '3. User Conduct & Site Usage Restrictions',
        body: 'You agree not to use the website in a way that is illegal, fraudulent, or harmful; attempts to harvest or copy any data from the website; or attempts to bypass security features.',
      },
      {
        heading: '4. Termination & Access Restriction',
        body: 'We reserve the right to terminate or suspend your access to our website immediately, without prior notice or liability, for any reason, including if you breach these Terms.',
      },
      {
        heading: '5. Limitation of Liability',
        body: 'In no event shall MLSC SVEC, nor its members, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of the Service.',
      },
      {
        heading: '6. Governing Law',
        body: 'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.',
      },
      {
        heading: '7. Changes to Terms',
        body: 'We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days\' notice prior to any new terms taking effect.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    accent: 'text-[#34A853]',
    sections: [
      {
        heading: '1. Introduction',
        body: 'Welcome to the MLSC SVEC website. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.',
      },
      {
        heading: '2. Information We Collect',
        body: 'We collect personally identifiable information (name, email, roll number) you voluntarily provide when registering or applying. Application data such as your resume, CGPA, and domain interests are stored securely. We also automatically collect IP addresses and user agents for security monitoring.',
      },
      {
        heading: '3. Content Protection',
        body: 'To protect our intellectual property, we have implemented a no-copy policy, disabled right-click context menus, and actively monitor site activity. Users found engaging in unauthorized access will have their IP permanently blocked.',
      },
      {
        heading: '4. Contact Us',
        body: 'If you have questions or comments about this Privacy Policy, please contact us through the channels provided on our main page.',
      },
    ],
  },
};

export function LegalModal({ type, children, className }: LegalModalProps) {
  const [open, setOpen] = useState(false);
  const content = CONTENT[type];

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'underline underline-offset-2 hover:opacity-70 transition-opacity',
          className
        )}
      >
        {children}
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal panel */}
          <div className="relative z-10 w-full max-w-lg max-h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className={cn('text-base font-black uppercase italic tracking-tight text-white')}>
                  {content.title.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className={content.accent}>
                    {content.title.split(' ').slice(-1)[0]}.
                  </span>
                </h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-4 h-8 w-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {content.sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1.5">
                    {section.heading}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
