'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  QrCode, 
  CreditCard,
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Info, 
  Copy,
  Check,
  RefreshCcw,
  AlertCircle,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { 
  initiateMLSCPaymentAction, 
  getGatewaySettingsAction, 
  submitMLSCManualPaymentAction 
} from '@/app/actions/mlsc-pay-actions';

export function MLSCPayClient() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // 1. Read Query Parameters for Unified Checkout
  const queryType = searchParams.get('type') || 'donation';
  const queryEventId = searchParams.get('eventId') || '';
  const queryAmount = Number(searchParams.get('amount')) || 350;
  const queryPurpose = searchParams.get('purpose') || 'Tech Workshop Pass';
  
  const queryName = searchParams.get('name') || '';
  const queryEmail = searchParams.get('email') || '';
  const queryPhone = searchParams.get('phone') || '';
  
  // Event registration details
  const queryRollNo = searchParams.get('rollNo') || '';
  const queryBranch = searchParams.get('branch') || '';
  const queryYearOfStudy = searchParams.get('yearOfStudy') || '';

  // 2. State Variables
  const [selectedGateway, setSelectedGateway] = useState<'cashfree' | 'mlsc_pay' | null>(null);
  const [gatewaySettings, setGatewaySettings] = useState<any>({
    cashfree: { enabled: true, message: 'Secure Online Payments' },
    mlscPay: { enabled: true, message: 'Manual UPI / QR Transfer' }
  });
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  
  // Form State
  const [name, setName] = useState<string>(queryName);
  const [email, setEmail] = useState<string>(queryEmail);
  const [phone, setPhone] = useState<string>(queryPhone);
  
  // Manual Payment UTR State
  const [utr, setUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 3. Dynamic Fee Calculations
  const basePrice = queryAmount;
  const gstAmount = Math.round(basePrice * 0.18);
  const convenienceFee = 15;
  const totalAmount = basePrice + gstAmount + convenienceFee;

  // Fetch Gateway Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await getGatewaySettingsAction();
        if (res.success && res.settings) {
          setGatewaySettings(res.settings);
          
          // If Cashfree is disabled, default selection to MLSC Pay to save a click
          if (!res.settings.cashfree.enabled) {
            setSelectedGateway('mlsc_pay');
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9849372827@kotakbank');
    setCopiedUpi(true);
    toast({
      title: 'UPI ID Copied',
      description: '9849372827@kotakbank has been copied to your clipboard.',
    });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Submit payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      toast({
        variant: 'destructive',
        title: 'Missing Details',
        description: 'Please complete all customer info fields.',
      });
      return;
    }

    setIsSubmitting(true);

    const registrationData = queryType === 'event' ? {
      name,
      email,
      phone,
      rollNo: queryRollNo,
      branch: queryBranch,
      yearOfStudy: queryYearOfStudy
    } : null;

    if (selectedGateway === 'cashfree') {
      // ── ONLINE CASHFREE REDIRECT ──
      try {
        const originUrl = window.location.origin;
        const initRes = await initiateMLSCPaymentAction({
          amount: totalAmount,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          purpose: queryPurpose,
          originUrl,
          type: queryType as 'donation' | 'event',
          eventId: queryEventId || undefined,
          registrationData
        });

        if (!initRes.success || !initRes.orderId) {
          setIsSubmitting(false);
          toast({
            variant: 'destructive',
            title: 'Payment Initialization Failed',
            description: initRes.error || 'Failed to start transaction.',
          });
          return;
        }

        if (initRes.isMock) {
          setTimeout(() => {
            window.location.href = `/mlsc-pay/status?order_id=${initRes.orderId}`;
          }, 1000);
        } else {
          const cashfree = (window as any).Cashfree({
            mode: initRes.mode || 'production',
          });
          cashfree.checkout({
            paymentSessionId: initRes.paymentSessionId,
            redirectTarget: '_self'
          });
        }
      } catch (err: any) {
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Checkout Error',
          description: err.message || 'Failed to redirect to payment gateway.',
        });
      }
    } else if (selectedGateway === 'mlsc_pay') {
      // ── OFFLINE UPI / QR MANUAL CHECKOUT ──
      if (!utr || utr.trim().length < 6) {
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'Verification Required',
          description: 'Please transfer funds first, then enter the UPI Ref/UTR number to verify.',
        });
        return;
      }

      try {
        const res = await submitMLSCManualPaymentAction({
          amount: totalAmount,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          purpose: queryPurpose,
          utr,
          type: queryType as 'donation' | 'event',
          eventId: queryEventId || undefined,
          registrationData
        });

        if (!res.success) {
          setIsSubmitting(false);
          toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: res.error || 'Failed to log manual payment request.',
          });
          return;
        }

        toast({
          title: 'Submission Received',
          description: 'Your payment reference is submitted. Awaiting admin approval!',
        });

        setTimeout(() => {
          window.location.href = `/mlsc-pay/status?order_id=${res.orderId}`;
        }, 1000);
      } catch (err: any) {
        setIsSubmitting(false);
        toast({
          variant: 'destructive',
          title: 'System Error',
          description: 'An error occurred during transaction logging.',
        });
      }
    } else {
      setIsSubmitting(false);
      toast({
        variant: 'destructive',
        title: 'Select Gateway',
        description: 'Please select a payment option to proceed.',
      });
    }
  };

  return (
    <div className="w-full bg-[#f4f6f8] min-h-screen py-12 md:py-20 text-slate-800 relative flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl px-4 md:px-6">
        
        {settingsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <RefreshCcw className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-4">Loading Secure Checkout...</span>
          </div>
        ) : (
          /* Standalone Razorpay-style White Checkout Card Frame */
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95 duration-300">
            
            {/* LEFT COLUMN: Merchant & Invoice Summary (Navy Panel) */}
            <div className="md:col-span-4 bg-[#0c1a30] text-white p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[520px]">
              <div className="space-y-6">
                {/* Logo and Merchant Name */}
                <div className="space-y-2">
                  <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                    M
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-tight text-white/95 leading-tight">
                    Microsoft Learn Student Club
                  </h2>
                  <span className="text-[9px] text-blue-400 font-extrabold uppercase tracking-wider block">SVEC Chapter</span>
                </div>

                {/* Billing Summary */}
                <div className="border-t border-white/10 pt-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-white/45 font-bold uppercase tracking-wider block">Purpose of Payment</span>
                    <h3 className="font-bold text-white uppercase leading-normal">{queryPurpose}</h3>
                  </div>
                  
                  {name && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/45 font-bold uppercase tracking-wider block">Billed To</span>
                      <p className="text-[10px] text-white/75 leading-relaxed font-semibold uppercase">
                        {name} {queryRollNo && `(${queryRollNo})`} <br />
                        {queryBranch && `${queryBranch} - `}{queryYearOfStudy && `${queryYearOfStudy} Year`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure payment elements & Amount */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-white/45 font-bold uppercase">Amount Due:</span>
                  <span className="text-2xl font-black text-white italic">₹{totalAmount}.00</span>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-white/40 font-bold uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-blue-400" /> 256-Bit SSL Secured
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Payment Actions Frame */}
            <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between min-h-[400px]">
              
              {/* STATE A: Selecting Gateway (Cashfree vs. MLSC Pay) */}
              {selectedGateway === null && (
                <div className="space-y-6 my-auto">
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                      Choose Payment Method
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Select one of the secure options below to complete your payment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* OPTION 1: CASHFREE ONLINE PAYMENTS */}
                    <div 
                      onClick={() => {
                        if (gatewaySettings.cashfree.enabled) {
                          setSelectedGateway('cashfree');
                        }
                      }}
                      className={`relative rounded-xl border p-5 flex flex-col justify-between text-left transition-all duration-300 min-h-[160px]
                        ${gatewaySettings.cashfree.enabled 
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 hover:border-blue-300 hover:shadow-sm cursor-pointer' 
                          : 'border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${gatewaySettings.cashfree.enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                          {gatewaySettings.cashfree.enabled ? (
                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Instant Online
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                              Downtime Paused
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-800">Online Gateway</h4>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium mt-1">
                            Pay securely via Cards, Net Banking, or automated UPI.
                          </p>
                        </div>
                      </div>

                      {/* Downtime explanation or click indicator */}
                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                        {gatewaySettings.cashfree.enabled ? (
                          <>
                            <span className="text-blue-600">Select Instant Pay</span>
                            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                          </>
                        ) : (
                          <span className="text-red-500 text-[8px] leading-tight font-semibold">
                            {gatewaySettings.cashfree.message || 'Offline due to maintenance.'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OPTION 2: MLSC PAY (MANUAL QR & UPI) */}
                    <div 
                      onClick={() => setSelectedGateway('mlsc_pay')}
                      className="relative rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 hover:border-blue-300 hover:shadow-sm cursor-pointer p-5 flex flex-col justify-between text-left transition-all duration-300 min-h-[160px]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <QrCode className="h-5 w-5" />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Manual QR
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-800">MLSC Pay (UPI QR)</h4>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium mt-1">
                            Scan our merchant QR code and submit UTR reference.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                        <span>Scan & Submit Ref</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STATE B: Specific Gateway Forms (with back button) */}
              {selectedGateway !== null && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Form Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        type="button" 
                        onClick={() => {
                          // Only allow going back to selector if Cashfree was actually active
                          if (gatewaySettings.cashfree.enabled) {
                            setSelectedGateway(null);
                          }
                        }}
                        disabled={!gatewaySettings.cashfree.enabled}
                        className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors
                          ${gatewaySettings.cashfree.enabled 
                            ? 'text-slate-400 hover:text-slate-800' 
                            : 'text-slate-300 cursor-not-allowed'}`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Change Payment Method
                      </button>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {selectedGateway === 'cashfree' ? 'Online Gateway' : 'MLSC Pay Offline'}
                      </span>
                    </div>

                    <div className="h-px bg-slate-100" />
                  </div>

                  {/* Form Core Contents */}
                  <div className="flex-1 flex flex-col justify-center">
                    
                    {/* CASHFREE FORM */}
                    {selectedGateway === 'cashfree' && (
                      <div className="space-y-5 py-4 max-w-md mx-auto text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-800">Redirecting to Online Portal</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                            Clicking proceed will open Cashfree's secure processing portal. You can pay instantly using cards, GPay, PhonePe, or netbanking.
                          </p>
                        </div>

                        {/* Customer data check (Visual indicator) */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left text-[10px] space-y-2 text-slate-500">
                          <div className="flex justify-between">
                            <span>Billed Name:</span>
                            <span className="font-bold text-slate-700">{name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email Address:</span>
                            <span className="font-bold text-slate-700">{email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Contact Phone:</span>
                            <span className="font-bold text-slate-700">{phone}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MLSC PAY FORM (Scan QR and enter UTR) */}
                    {selectedGateway === 'mlsc_pay' && (
                      <div className="space-y-5 py-2">
                        <div className="flex flex-col md:flex-row items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                          
                          {/* QR Code Container with Image & Fallback */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className="relative w-32 h-32 flex items-center justify-center border border-slate-200 rounded-xl p-2 bg-white shadow-sm">
                              <img 
                                src="/images/qr.jpeg" 
                                alt="MLSC UPI QR Code" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to SVG if image is not uploaded yet by the user
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              <div className="qr-fallback hidden flex flex-col items-center justify-center text-slate-800">
                                <svg className="w-20 h-20 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="2" y="2" width="6" height="6" />
                                  <rect x="16" y="2" width="6" height="6" />
                                  <rect x="2" y="16" width="6" height="6" />
                                  <path d="M9 5h6v2H9V5zm0 12h6v2H9v-2zm7-7h2v4h-2v-4zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-8-4h2v2H8v-2zm0 4h2v2H8v-2zm4-4h2v2h-2v-2z" fill="currentColor" />
                                </svg>
                                <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest mt-1">Scan to Pay</span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SVEC Merchant QR</span>
                          </div>

                          {/* Instructions & Copyable UPI */}
                          <div className="flex-1 space-y-3 text-left">
                            <div>
                              <h4 className="text-[11px] font-black uppercase text-slate-800">Step 1: Scan & Transfer</h4>
                              <p className="text-[10px] text-slate-400 leading-normal font-medium mt-0.5">
                                Scan the QR code using GPay, PhonePe, Paytm, or GPay and transfer exactly <strong className="text-slate-800 font-bold">₹{totalAmount}</strong>.
                              </p>
                            </div>
                            
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Or transfer to UPI ID:</span>
                              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-[9px] w-full shadow-sm">
                                <span className="font-mono text-slate-700 font-extrabold">9849372827@kotakbank</span>
                                <button 
                                  type="button" 
                                  onClick={handleCopyUpi}
                                  className="text-blue-600 hover:text-blue-800 p-0.5 transition-colors"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* STEP 2: UTR Reference Input */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                            Step 2: Enter Transaction UTR / Ref Number <span className="text-red-500 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            placeholder="Enter the 12-digit UPI UTR number after paying"
                            className="w-full h-11 px-3 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                          />
                          <span className="text-[9px] text-slate-400 font-medium block leading-normal">
                            Note: Admin will verify this credit against our statements. You will receive progress updates by email.
                          </span>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Summary Invoice & Action Buttons */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {/* Fee Details Box */}
                    <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-[10px] space-y-1.5 font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span className="text-slate-700">₹{basePrice}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span className="text-slate-700">₹{gstAmount}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Convenience Fee:</span>
                        <span className="text-slate-700">₹{convenienceFee}.00</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 font-extrabold text-xs">
                        <span className="text-slate-800">Total Bill Amount:</span>
                        <span className="text-blue-600">₹{totalAmount}.00</span>
                      </div>
                    </div>

                    {/* Pay Submit Button */}
                    <form onSubmit={handleSubmitPayment}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCcw className="h-4 w-4 animate-spin" /> Processing Transaction...
                          </>
                        ) : (
                          <>
                            {selectedGateway === 'cashfree' 
                              ? `Pay Online ₹${totalAmount}.00` 
                              : `Submit Payment Reference ₹${totalAmount}.00`} 
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
    </div>
  );
}
