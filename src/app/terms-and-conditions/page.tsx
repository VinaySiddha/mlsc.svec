
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms and Conditions — MLSC SVEC",
  description: "Read the terms and conditions for the Microsoft Learn Student Club SVEC website.",
  openGraph: {
    title: "Terms and Conditions — MLSC SVEC",
    url: "https://mlscsvec.in/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 prose prose-invert max-w-none">
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h3 className="text-xl font-bold">1. Agreement to Terms</h3>
                    <p>By accessing this website, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>

                    <h3 className="text-xl font-bold">2. Intellectual Property</h3>
                    <p>The Service and its original content, features, and functionality are and will remain the exclusive property of MLSC SVEC. The content on this website is protected by copyright and other intellectual property laws.</p>
                    
                    <h3 className="text-xl font-bold">3. User Conduct and Site Usage Restrictions</h3>
                    <p>You agree not to use the website in a way that:</p>
                    <ul>
                        <li>Is illegal, fraudulent, or harmful.</li>
                        <li>Attempts to harvest, collect, or copy any data or content from the website. To enforce this, we have disabled text selection, right-clicking, and other methods of content copying.</li>
                        <li>Attempts to bypass our security features. This includes, but is not limited to, taking screenshots, which we actively deter.</li>
                    </ul>
                    
                    <h3 className="text-xl font-bold">4. Termination and Access Restriction</h3>
                    <p>We reserve the right to terminate or suspend your access to our website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    <p>Any user or automated system found to be engaging in malicious activities, such as repeated attempts to copy content, bypass security, or take screenshots, will be subject to an immediate and permanent IP block.</p>
                    
                    <h3 className="text-xl font-bold">5. Limitation of Liability</h3>
                    <p>In no event shall MLSC SVEC, nor its members, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                    
                    <h3 className="text-xl font-bold">6. Governing Law</h3>
                    <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                    
                    <h3 className="text-xl font-bold">7. Changes to Terms</h3>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
