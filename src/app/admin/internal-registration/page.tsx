import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Sparkles, Send, HelpCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InternalRegistrationForm } from "@/components/internal-registration-form";

export const dynamic = "force-dynamic";

export default async function InternalRegistrationPage() {
  const headersList = await headers();
  const userRole = headersList.get("X-User-Role");

  if (userRole !== "super_admin" && userRole !== "admin") {
    redirect("/admin/applications");
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20">
              <UserPlus className="size-4" />
            </span>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
              Internal <span className="text-[#4285F4]">Registration</span>
            </h1>
          </div>
          <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Manually enroll candidates directly into the Chapter hiring and review pipeline
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider h-10 px-4 self-start sm:self-auto">
          <Link href="/admin/applications" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span>Back to Applications</span>
          </Link>
        </Button>
      </div>

      {/* Stepper Roadmap banner — matching recruitment apply design */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4285F4] mb-6 text-center md:text-left">
          Internal Candidate Onboarding Journey
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
          {[
            { icon: Send, title: "1. Details Input", desc: "Contact, academic & domain preferences", color: "text-[#4285F4] bg-[#4285F4]/10" },
            { icon: UserPlus, title: "2. Profile Creation", desc: "Generates unique Reference ID", color: "text-[#4285F4] bg-[#4285F4]/10" },
            { icon: Sparkles, title: "3. Live Evaluation", desc: "Star rubric scoring by panel", color: "text-[#4285F4] bg-[#4285F4]/10" },
            { icon: UserCheck, title: "4. Status Pipeline", desc: "Eligible for final selection & email", color: "text-[#4285F4] bg-[#4285F4]/10" }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="flex items-center md:items-start gap-4 md:flex-col md:gap-3 group">
                <div className={`flex aspect-square size-11 items-center justify-center rounded-2xl border border-[#4285F4]/20 ${item.color} transition-all duration-300 group-hover:scale-105 shrink-0`}>
                  <IconComponent className="size-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-lg">
        <InternalRegistrationForm />
      </div>
    </div>
  );
}
