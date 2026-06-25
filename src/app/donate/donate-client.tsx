"use client";

import React, { useState } from "react";
import { FundraiseButton } from "@/components/fundraise-button";
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Server, 
  Globe, 
  Award, 
  BookOpen, 
  ChevronDown, 
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useToast } from "@/hooks/use-toast";
import { createCashfreeOrderAction } from "@/app/actions/cashfree-actions";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

interface Tier {
  id: string;
  amount: number;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function DonateClient() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  
  // Form state
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Custom payments state
  const [customPayments, setCustomPayments] = useState<any[]>([]);
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);
  const [selectedCustomPayment, setSelectedCustomPayment] = useState<any | null>(null);

  React.useEffect(() => {
    const fetchCustomPayments = async () => {
      try {
        // Query using only orderBy to avoid requiring a manual Firestore composite index
        const q = query(
          collection(db, "customPayments"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          // Filter active items on the client side
          if (data && data.active === true) {
            list.push({ id: doc.id, ...data });
          }
        });
        setCustomPayments(list);
      } catch (err) {
        console.error("Error fetching active custom payments:", err);
      }
    };
    fetchCustomPayments();
  }, []);

  const handleSelectCustomPayment = (item: any) => {
    setSelectedCustomId(item.id);
    setSelectedCustomPayment(item);
    setIsCustom(false);
    setSelectedAmount(item.amount);
    setCustomAmount("");
  };

  const tiers: Tier[] = [
    {
      id: "server",
      amount: 250,
      name: "Bronze Tier",
      tagline: "Server & Hosting",
      description: "Pays for cloud database operations, API testing, and hosting our community portals for 1 month.",
      icon: <Server className="h-5 w-5" />,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400"
    },
    {
      id: "domain",
      amount: 500,
      name: "Silver Tier",
      tagline: "Domain & API Access",
      description: "Funds domain registration, secure SSL certificates, and transactional email API services for our club projects.",
      icon: <Globe className="h-5 w-5" />,
      color: "from-slate-400/20 to-zinc-500/10 border-slate-400/30 text-slate-300"
    },
    {
      id: "workshop",
      amount: 1000,
      name: "Gold Tier",
      tagline: "Workshop Supplies",
      description: "Sponsors microcontrollers, sensors, cables, stickers, and learning kits for 1 student hands-on hardware workshop.",
      icon: <BookOpen className="h-5 w-5" />,
      color: "from-yellow-500/20 to-amber-600/10 border-yellow-500/30 text-yellow-400"
    },
    {
      id: "hackathon",
      amount: 2500,
      name: "Platinum Tier",
      tagline: "Hackathon Prizes",
      description: "Helps fund developer cash prizes, trophies, and premium learning certificates for our annual student hackathons.",
      icon: <Award className="h-5 w-5" />,
      color: "from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-400"
    }
  ];

  const handleSelectTier = (amount: number) => {
    setIsCustom(false);
    setSelectedAmount(amount);
    setCustomAmount("");
    setSelectedCustomId(null);
    setSelectedCustomPayment(null);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(0);
    setSelectedCustomId(null);
    setSelectedCustomPayment(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const getActiveAmount = (): number => {
    if (isCustom) {
      return parseInt(customAmount) || 0;
    }
    return selectedAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getActiveAmount();
    if (finalAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please select or enter a valid donation amount.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const originUrl = window.location.origin;
      const res = await createCashfreeOrderAction({
        amount: finalAmount,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        originUrl,
        purpose: selectedCustomPayment ? selectedCustomPayment.purpose : undefined,
      });

      if (!res.success || !res.paymentSessionId) {
        throw new Error(res.error || "Failed to initialize checkout.");
      }

      if (res.isMock) {
        // Sandbox / Demo mode fallback
        toast({
          title: "Demo Checkout Initialized",
          description: "Redirecting to simulated checkout terminal...",
        });
        
        setTimeout(() => {
          window.location.href = `/donate/status?order_id=${res.orderId}`;
        }, 1500);
      } else {
        // Real Cashfree checkout redirect
        const cashfree = (window as any).Cashfree({
          mode: res.mode || "sandbox"
        });
        
        cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          redirectTarget: "_self"
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: err.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  const faqs = [
    {
      q: "Where does my donation go?",
      a: "100% of all contributions are directly invested back into our student community. The funds pay for cloud server costs, domain renewals, workshop materials, and prize pools for student hackathons. We maintain a public transparency record of all expenses."
    },
    {
      q: "Is this a real payment portal?",
      a: "No. This is a secure demonstration portal for the Microsoft Learn Student Club SVEC open-source website. No real money will be charged, and card details are processed only locally on your browser for this mockup."
    },
    {
      q: "Can I donate my technical skills instead?",
      a: "Absolutely! We welcome developers, designers, and technical writers to build with us. You can join our developer force by submitting an application on our Contribution Portal."
    },
    {
      q: "Will I receive recognition for my contribution?",
      a: "Yes! All donors (regardless of size) are featured on our website's supporters ledger, receive an exclusive digital donor badge, and are invited to our annual community showcase."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-black min-h-screen py-24 md:py-32 text-white relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl px-6 md:px-8">
        

        {isSuccess ? (
          /* Success Screen */
          <div className="max-w-xl mx-auto border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-md rounded-3xl p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-10 w-10 fill-current" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tight">Contribution Received!</h2>
              <p className="text-emerald-400/90 font-bold text-sm">Thank you, {name || "Generous Supporter"}!</p>
              <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed">
                You have successfully contributed <span className="text-yellow-400 font-bold">${getActiveAmount()}</span> to MLSC SVEC. Your support keeps our servers running and enables our student workshops to thrive.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedAmount(500);
                  setCustomAmount("");
                  setIsCustom(false);
                  setName("");
                  setEmail("");
                  setPhone("");
                }}
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-all"
              >
                Make Another Contribution
              </button>
              <Link
                href="/contribute"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 bg-transparent text-white transition-all"
              >
                Code with Us <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Main Fundraising Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Side: Impact Tiers */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Custom Payment Requests Section */}
              {customPayments.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight italic text-white/90 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" /> Active Payment Requests
                    </h2>
                    <p className="text-white/40 text-xs font-medium">
                      Administrative payment requests set by the club officers (e.g. for domains, server renewals). Select one to pay.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {customPayments.map((item) => {
                      const isActive = selectedCustomId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectCustomPayment(item)}
                          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative group ${
                            isActive
                              ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-transparent shadow-lg shadow-black/40"
                              : "border-white/5 bg-[#050505] hover:border-white/10 hover:bg-[#090909]"
                          }`}
                        >
                          <div className="space-y-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Custom Request
                              </span>
                              <h3 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                                {item.purpose}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <span className="text-2xl font-black uppercase italic tracking-tighter text-emerald-450">
                              ₹{item.amount}
                            </span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isActive ? "border-emerald-400 bg-emerald-500/20 text-emerald-400" : "border-white/10 bg-transparent"
                            }`}>
                              {isActive && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tight italic text-white/90 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" /> Choose Your Impact Tier
                </h2>
                <p className="text-white/40 text-xs font-medium">
                  Select a tier below to see what your contribution funds directly.
                </p>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tiers.map((tier) => {
                  const isActive = !isCustom && selectedAmount === tier.amount;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => handleSelectTier(tier.amount)}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between gap-4 h-52 relative group ${
                        isActive
                          ? `bg-gradient-to-br ${tier.color.split(" ").slice(0, 2).join(" ")} ${tier.color.split(" ")[2]} shadow-lg shadow-black/40`
                          : "border-white/5 bg-[#050505] hover:border-white/10 hover:bg-[#090909]"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg bg-white/5 border border-white/10 text-white/90 group-hover:scale-105 transition-all duration-300`}>
                            {tier.icon}
                          </div>
                          <span className={`text-2xl font-black uppercase italic tracking-tighter ${
                            isActive ? tier.color.split(" ")[3] : "text-white/40 group-hover:text-white/70"
                          }`}>
                            ₹{tier.amount}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">{tier.name}</h3>
                          <p className="text-[10px] text-white/40 font-bold tracking-wide uppercase italic mt-0.5">{tier.tagline}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                        {tier.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount option */}
              <div 
                onClick={handleCustomClick}
                className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between gap-3 relative ${
                  isCustom 
                    ? "border-yellow-400/40 bg-gradient-to-r from-yellow-500/10 to-transparent" 
                    : "border-white/5 bg-[#050505] hover:border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Enter a Custom Amount
                    </h3>
                    <p className="text-[10px] text-white/40 font-medium">
                      Every dollar supports our community projects and developer workshops.
                    </p>
                  </div>
                  {isCustom && (
                    <div className="relative flex items-center max-w-[160px] self-end sm:self-auto">
                      <span className="absolute left-4 text-sm font-bold text-yellow-400">₹</span>
                      <input
                        type="text"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Amount"
                        className="w-full h-10 pl-8 pr-4 rounded-xl bg-black border border-yellow-500/30 text-yellow-400 text-sm font-black tracking-tight focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all placeholder-white/20"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Security info banner */}
              <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-[#050505]">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">Secured Contribution Processing</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1 font-medium">
                    This is a secure 256-bit encrypted demonstration. No real banking details are uploaded or stored. All entries are simulated locally.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Secure Checkout Form */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 space-y-6 shadow-2xl relative">
                {/* Neon glow effect border */}
                <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none -z-10" />

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    <Lock className="h-3.5 w-3.5" /> Secure SSL Terminal
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic text-white/90">
                    Checkout Portal
                  </h3>
                  <p className="text-white/40 text-[11px] font-medium leading-relaxed">
                    Confirm your details to finalize your community support contribution.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Summary of contribution */}
                  <div className="p-4 rounded-xl bg-black border border-white/5 space-y-2">
                    {selectedCustomPayment && (
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">Purpose:</span>
                        <span className="text-xs font-black uppercase text-emerald-450 truncate max-w-[180px]">
                          {selectedCustomPayment.purpose}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                        {selectedCustomPayment ? "Required Amount:" : "Total Donation:"}
                      </span>
                      <span className={`text-xl font-black uppercase tracking-tight italic ${selectedCustomPayment ? "text-emerald-450" : "text-yellow-400"}`}>
                        ₹{getActiveAmount()}
                      </span>
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 text-xs font-semibold tracking-wide text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-white/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                      className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 text-xs font-semibold tracking-wide text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-white/20"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-indigo-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setPhone(value);
                        }
                      }}
                      placeholder="9999999999"
                      className="w-full h-11 px-4 rounded-xl bg-black border border-white/10 text-xs font-semibold tracking-wide text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-white/20"
                    />
                  </div>

                  {/* Custom animated fundraising button styled from Uiverse */}
                  <div className="pt-4 flex justify-center">
                    <FundraiseButton
                      type="submit"
                      disabled={isSubmitting || getActiveAmount() <= 0}
                      playText={isSubmitting ? "Processing" : "Support Now"}
                      nowText={isSubmitting ? "..." : "Confirm"}
                      className="w-full"
                    />
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* FAQs Section */}
        <div className="mt-24 border-t border-white/[0.08] pt-16 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight italic text-white/90">
              Frequently Asked Questions
            </h2>
            <p className="text-white/40 text-xs font-medium">
              Have questions about how contributions are managed? Find answers here.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/5 bg-[#050505] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-[#0a0a0a] transition-all"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/40 transition-transform duration-300 ${
                        isOpen ? "transform rotate-180 text-yellow-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[11px] text-white/55 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-20 border border-white/5 bg-gradient-to-r from-indigo-950/15 to-transparent rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/80">
              Want to Donate Your Skills Instead?
            </h3>
            <p className="text-[10px] text-white/40 font-medium max-w-md leading-relaxed">
              If you are a student, designer, or programmer, you can contribute code, write documentation, or manage our community infrastructure.
            </p>
          </div>
          <Link
            href="/contribute"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all shrink-0"
          >
            Apply to Contribute <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      </div>
    </div>
  );
}
