"use client";

import React, { useState } from "react";
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
  Phone,
  HelpCircle,
  Zap,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useToast } from "@/hooks/use-toast";
import { createCashfreeOrderAction } from "@/app/actions/cashfree-actions";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Tier {
  id: string;
  amount: number;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  shadow: string;
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
        const q = query(
          collection(db, "customPayments"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
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
      description: "Funds cloud server operations, Firebase quota, and hosting student tools for 1 month.",
      icon: <Server className="h-5 w-5 text-black" />,
      bg: "bg-amber-100",
      shadow: "shadow-[5px_5px_0px_0px_#000000]"
    },
    {
      id: "domain",
      amount: 500,
      name: "Silver Tier",
      tagline: "Domain & API Access",
      description: "Funds domain registration, security certificates, and transactional email infrastructure.",
      icon: <Globe className="h-5 w-5 text-black" />,
      bg: "bg-[#4285F4]/15",
      shadow: "shadow-[5px_5px_0px_0px_#4285F4]"
    },
    {
      id: "workshop",
      amount: 1000,
      name: "Gold Tier",
      tagline: "Workshop Supplies",
      description: "Sponsors microcontrollers, sensors, stickers, and kits for 1 student hands-on hardware workshop.",
      icon: <BookOpen className="h-5 w-5 text-black" />,
      bg: "bg-[#FFE600]/25",
      shadow: "shadow-[5px_5px_0px_0px_#FFE600]"
    },
    {
      id: "hackathon",
      amount: 2500,
      name: "Platinum Tier",
      tagline: "Hackathon Prizes",
      description: "Helps fund developer cash prizes, trophies, and premium rewards for our annual student hackathons.",
      icon: <Award className="h-5 w-5 text-black" />,
      bg: "bg-[#00FF66]/20",
      shadow: "shadow-[5px_5px_0px_0px_#00FF66]"
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

    if (!name || !email || !phone) {
      toast({
        variant: "destructive",
        title: "Missing Details",
        description: "Please fill in your name, email, and phone number to proceed.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({
        title: "Initializing Payment",
        description: "Connecting to secure Cashfree portal...",
      });

      const purposeText = selectedCustomPayment ? selectedCustomPayment.purpose : 'General Donation';
      const originUrl = window.location.origin;

      const res = await createCashfreeOrderAction({
        amount: finalAmount,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        originUrl,
        purpose: purposeText,
      });

      if (!res.success || !res.paymentSessionId) {
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Checkout Error",
          description: res.error || "Failed to initialize payment order.",
        });
        return;
      }

      const cashfree = (window as any).Cashfree({
        mode: res.mode || 'production',
      });
      
      cashfree.checkout({
        paymentSessionId: res.paymentSessionId,
        redirectTarget: '_self'
      });
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
      q: "Where does my contribution go?",
      a: "100% of all contributions are directly invested back into our student community. Funds pay for cloud servers, domain renewals, hardware kits, and prize pools for hackathons. We maintain public transparency of all club operations."
    },
    {
      q: "Is this a secure payment portal?",
      a: "Yes. All payments are processed securely via our production Cashfree Payments integration. We support UPI, Credit/Debit Cards, and Net Banking with 256-bit encryption."
    },
    {
      q: "Can I donate my technical skills instead?",
      a: "Absolutely! We welcome developers, designers, and technical writers to build with us. You can join our developer force by submitting a contribution on our Contribution Portal."
    },
    {
      q: "Will I receive recognition for my contribution?",
      a: "Yes! All supporters are acknowledged in our community records and receive an official digital contributor receipt."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-white min-h-screen py-16 md:py-24 text-black font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center">
        ⚡ Chapter 4 Student Innovation Fund — Powered by Cashfree Payments
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12 py-10">
        
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-1.5 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-widest text-black">
            <Heart className="h-4 w-4 fill-black" /> [ COMMUNITY FUND // STUDENT INNOVATION ]
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95] text-black">
            Fuel Student <br />
            <span className="text-[#4285F4]">Innovation.</span>
          </h1>
          
          <p className="text-zinc-700 font-bold text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Support the next generation of engineers at MLSC SVEC. Your sponsorship funds cloud infrastructure, hardware workshops, hackathon prizes, and community tooling.
          </p>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="max-w-xl mx-auto border-2 border-black bg-[#00FF66]/20 p-8 sm:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#000000] animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 border-2 border-black bg-[#00FF66] flex items-center justify-center text-black shadow-[3px_3px_0px_0px_#000000]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-black">Contribution Received!</h2>
              <p className="text-black font-black text-base">Thank you, {name || "Generous Supporter"}!</p>
              <p className="text-zinc-800 text-xs sm:text-sm font-bold max-w-md mx-auto leading-relaxed">
                You have successfully contributed <span className="bg-[#FFE600] px-2 py-0.5 border border-black font-black">₹{getActiveAmount()}</span> to MLSC SVEC. Your support keeps our servers running and empowers student developers.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedAmount(500);
                  setCustomAmount("");
                  setIsCustom(false);
                  setName("");
                  setEmail("");
                  setPhone("");
                }}
                className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-11 px-6"
              >
                Make Another Contribution
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white text-black hover:bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-11 px-6"
              >
                <Link href="/contribute">
                  Code with Us <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Main Fundraising Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Impact Tiers (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Custom Payment Requests (if available) */}
              {customPayments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 border-2 border-black bg-[#FFE600]">
                      <Zap className="h-4 w-4 text-black" />
                    </span>
                    <h2 className="text-base font-black uppercase italic tracking-tight text-black">
                      Active Community Invoices
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {customPayments.map((item) => {
                      const isActive = selectedCustomId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectCustomPayment(item)}
                          className={cn(
                            "cursor-pointer border-2 border-black p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                            isActive
                              ? "bg-[#FFE600] shadow-[5px_5px_0px_0px_#000000]"
                              : "bg-white hover:bg-zinc-50 shadow-[3px_3px_0px_0px_#000000]"
                          )}
                        >
                          <div className="space-y-1 max-w-md">
                            <span className="text-[9px] bg-black text-white font-black px-2 py-0.5 uppercase tracking-wider">
                              Special Target
                            </span>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">
                              {item.purpose}
                            </h3>
                            {item.description && (
                              <p className="text-[11px] text-zinc-700 font-semibold leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black uppercase italic font-mono text-black">
                              ₹{item.amount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 border-2 border-black bg-[#4285F4] text-white">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-black uppercase italic tracking-tight text-black">
                    Choose Your Impact Tier
                  </h2>
                </div>
                <p className="text-zinc-600 text-xs font-bold">
                  Select a tier below to sponsor a designated initiative.
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
                      className={cn(
                        "cursor-pointer border-2 border-black p-5 transition-all flex flex-col justify-between gap-3 relative",
                        isActive
                          ? `${tier.bg} shadow-[6px_6px_0px_0px_#000000] ring-2 ring-black`
                          : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000000]"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000]">
                            {tier.icon}
                          </div>
                          <span className="text-2xl font-black uppercase italic font-mono text-black">
                            ₹{tier.amount}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-black">{tier.name}</h3>
                          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-wider mt-0.5">{tier.tagline}</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-700 font-semibold leading-relaxed border-t-2 border-black/20 pt-2">
                        {tier.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Option */}
              <div 
                onClick={handleCustomClick}
                className={cn(
                  "cursor-pointer border-2 border-black p-5 transition-all flex flex-col justify-between gap-3",
                  isCustom 
                    ? "bg-[#FFE600]/30 shadow-[6px_6px_0px_0px_#000000] ring-2 ring-black" 
                    : "bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_#000000]"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#EA4335] fill-[#EA4335]" /> Enter a Custom Amount
                    </h3>
                    <p className="text-[11px] text-zinc-600 font-bold">
                      Any contribution powers our student workshops and open-source infrastructure.
                    </p>
                  </div>
                  {isCustom && (
                    <div className="relative flex items-center max-w-[160px] self-end sm:self-auto">
                      <span className="absolute left-3 text-sm font-black text-black">₹</span>
                      <input
                        type="text"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Amount"
                        className="w-full h-10 pl-8 pr-3 border-2 border-black bg-white text-black text-sm font-black tracking-tight focus:outline-none focus:bg-[#FFE600]/20"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Security info banner */}
              <div className="flex gap-3 items-center p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000]">
                <div className="p-2 border-2 border-black bg-[#00FF66] text-black shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">Secured 256-Bit SSL Processing</h4>
                  <p className="text-[10px] text-zinc-600 font-bold leading-relaxed">
                    Zero card data is stored on our servers. Transactions execute directly via Cashfree's PCI-DSS Level 1 compliant gateway.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Checkout Form (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="border-2 border-black bg-white p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#000000]">
                
                <div className="space-y-1 border-b-2 border-black pb-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                    <Lock className="h-3 w-3" /> Secure Payment Gateway
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-black mt-2">
                    Contribution Desk
                  </h3>
                  <p className="text-zinc-600 text-xs font-bold">
                    Provide donor details to finalize your contribution receipt.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Summary of contribution */}
                  <div className="p-4 border-2 border-black bg-zinc-50 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                    {selectedCustomPayment && (
                      <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Purpose:</span>
                        <span className="text-xs font-black uppercase text-black truncate max-w-[180px]">
                          {selectedCustomPayment.purpose}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-600">
                        {selectedCustomPayment ? "Target Amount:" : "Total Contribution:"}
                      </span>
                      <span className="text-2xl font-black uppercase italic font-mono text-black">
                        ₹{getActiveAmount()}
                      </span>
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-black" /> Donor Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 px-3 border-2 border-black bg-zinc-50 text-xs font-bold text-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-black" /> Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full h-11 px-3 border-2 border-black bg-zinc-50 text-xs font-bold text-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-black" /> Mobile Number
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
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 px-3 border-2 border-black bg-zinc-50 text-xs font-bold text-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || getActiveAmount() <= 0}
                      className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[4px_4px_0px_0px_#000000] font-black uppercase tracking-wider text-xs h-12 active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      {isSubmitting ? "Connecting to Cashfree..." : `Pay ₹${getActiveAmount()} via Cashfree →`}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* FAQs Section */}
        <div className="border-t-2 border-black pt-12 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic text-black">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-600 text-xs font-bold">
              Learn how donor funds are transparently allocated and audited.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000] overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-all font-black text-xs sm:text-sm uppercase tracking-tight"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-black transition-transform duration-200 shrink-0",
                        isOpen && "transform rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t-2 border-black bg-zinc-50">
                      <p className="text-xs text-zinc-700 font-medium leading-relaxed">
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
        <div className="border-2 border-black bg-[#FFE600] p-8 shadow-[6px_6px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-tight text-black">
              Want to Donate Your Developer Skills Instead?
            </h3>
            <p className="text-xs text-zinc-800 font-bold max-w-md leading-relaxed">
              Join the MLSC developer army to build student products, maintain server nodes, and design UI systems.
            </p>
          </div>
          <Button
            asChild
            className="bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[3px_3px_0px_0px_#ffffff] font-black uppercase tracking-wider text-xs h-11 px-6 shrink-0"
          >
            <Link href="/contribute">
              Apply to Contribute <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      </div>
    </div>
  );
}
