import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MLSC SVEC",
  description: "Read the privacy policy for the Microsoft Learn Student Club SVEC website.",
  openGraph: {
    title: "Privacy Policy — MLSC SVEC",
    url: "https://mlscsvec.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      <main className="flex-1 py-24 md:py-40">
        <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-20">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">Privacy <br/> <span className="text-[#34A853]">Policy.</span></h1>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="bento-card p-10 md:p-16 border-white/5 space-y-12 text-white/70 leading-relaxed text-lg font-medium">
                <section>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-6">1. Introduction.</h3>
                    <p>Welcome to the MLSC SVEC website. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto.</p>
                </section>

                <section>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-6">2. Information We Collect.</h3>
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                    <ul className="list-disc pl-8 mt-6 space-y-4">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, roll number, and phone number, that you voluntarily give to us when you register for an event or submit a hiring application.</li>
                        <li><strong>Application Data:</strong> Information related to your academic and professional profile, such as your resume, CGPA, branch, and domain interests. All application data is stored securely.</li>
                        <li><strong>Visitor Data:</strong> For security and monitoring purposes, we automatically collect the IP address and user agent of every visitor to our website.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-6">3. Content Protection.</h3>
                    <p>To protect our intellectual property and maintain the security of our platform, we have implemented several security measures:</p>
                    <ul className="list-disc pl-8 mt-6 space-y-4">
                        <li><strong>No-Copy Policy:</strong> Text and other content on this website cannot be copied.</li>
                        <li><strong>Right-Click Disabled:</strong> The context menu is disabled sitewide to prevent easy access to content saving options.</li>
                        <li><strong>Monitoring:</strong> We monitor site activity to prevent unauthorized access. Any user found engaging in such activities will have their access and IP address permanently blocked.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-6">4. Contact Us.</h3>
                    <p>If you have questions or comments about this Privacy Policy, please contact us through the channels provided on our main page.</p>
                </section>
            </div>
        </div>
      </main>
    </div>
  );
}
