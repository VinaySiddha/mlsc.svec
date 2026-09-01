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
import { cn } from '@/lib/utils';

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
  const [selectedGateway, setSelectedGateway] = useState<'cashfree' | 'mlsc_pay' | null>('cashfree');
  const [gatewaySettings, setGatewaySettings] = useState<any>({
    cashfree: { enabled: true, message: 'Secure Online Payments' },
    mlscPay: { enabled: false, message: 'Manual UPI / QR Transfer' }
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
          
          if (res.settings.cashfree.enabled && !res.settings.mlscPay.enabled) {
            setSelectedGateway('cashfree');
          } else if (!res.settings.cashfree.enabled && res.settings.mlscPay.enabled) {
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
    <div className="w-full bg-white min-h-screen py-12 md:py-20 text-black font-sans selection:bg-[#FFE600] selection:text-black flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 md:px-6 space-y-6">
        
        {/* Top Banner */}
        <div className="border-b-2 border-black bg-[#FFE600] text-black px-4 py-2 font-black text-xs uppercase tracking-widest text-center shadow-[3px_3px_0px_0px_#000000]">
          ⚡ Chapter 4 MLSC Checkout & Secure Payment Gateway
        </div>

        {settingsLoading ? (
          <div className="border-2 border-black bg-white p-12 shadow-[8px_8px_0px_0px_#000000] text-center space-y-4">
            <div className="w-8 h-8 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto" />
            <span className="text-xs text-black uppercase tracking-widest font-black block">
              Initializing Gateway Services...
            </span>
          </div>
        ) : (
          <div className="border-2 border-black bg-white shadow-[10px_10px_0px_0px_#000000] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            
            {/* LEFT COLUMN: Merchant & Invoice Summary (Yellow/Black Brutalist Panel) */}
            <div className="md:col-span-5 bg-[#FFE600] text-black p-6 md:p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
              <div className="space-y-6">
                
                {/* Brand Banner */}
                <div className="space-y-2">
                  <div className="h-10 w-10 border-2 border-black bg-white flex items-center justify-center text-black font-black text-lg shadow-[2px_2px_0px_0px_#000000]">
                    M
                  </div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight text-black leading-tight">
                    Microsoft Learn Student Club
                  </h2>
                  <span className="text-[10px] bg-black text-white px-2 py-0.5 font-black uppercase tracking-wider inline-block">
                    SVEC Chapter Checkout
                  </span>
                </div>

                {/* Billing Summary */}
                <div className="border-t-2 border-black pt-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-zinc-800 tracking-wider block">Purpose of Payment</span>
                    <h3 className="font-black text-black uppercase text-sm leading-normal">{queryPurpose}</h3>
                  </div>
                  
                  {name && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-zinc-800 tracking-wider block">Billed To</span>
                      <p className="text-xs text-black font-bold uppercase leading-relaxed font-mono">
                        {name} {queryRollNo && `(${queryRollNo})`} <br />
                        {queryBranch && `${queryBranch} - `}{queryYearOfStudy && `${queryYearOfStudy} Year`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount & Security */}
              <div className="space-y-3 pt-6 border-t-2 border-black mt-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-zinc-800">Total Payable:</span>
                  <span className="text-3xl font-black text-black font-mono">₹{totalAmount}.00</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-black">
                  <Lock className="h-4 w-4" /> 256-Bit SSL Secured Transaction
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Payment Actions Frame */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-white">
              
              {/* STATE A: Selecting Gateway (Cashfree vs. MLSC Pay) */}
              {selectedGateway === null && (
                <div className="space-y-6 my-auto">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider text-black">
                      Select Payment Protocol
                    </h3>
                    <p className="text-xs text-zinc-600 font-bold">
                      Choose an active checkout gateway to finalize your registration.
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 ${gatewaySettings.mlscPay.enabled ? 'sm:grid-cols-2' : ''} gap-4`}>
                    
                    {/* OPTION 1: CASHFREE ONLINE PAYMENTS */}
                    <div 
                      onClick={() => {
                        if (gatewaySettings.cashfree.enabled) {
                          setSelectedGateway('cashfree');
                        }
                      }}
                      className={cn(
                        'border-2 border-black p-4 flex flex-col justify-between text-left transition-all min-h-[160px] shadow-[3px_3px_0px_0px_#000000]',
                        gatewaySettings.cashfree.enabled 
                          ? 'bg-white hover:bg-zinc-50 cursor-pointer active:translate-x-[2px] active:translate-y-[2px]' 
                          : 'bg-zinc-100 opacity-60 cursor-not-allowed'
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 border-2 border-black bg-[#FFE600] text-black shadow-[1px_1px_0px_0px_#000000]">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          {gatewaySettings.cashfree.enabled ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#00FF66] border border-black text-black">
                              Instant Online
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#EA4335] text-white border border-black">
                              Paused
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-black">Online Gateway</h4>
                          <p className="text-[10px] text-zinc-600 font-bold leading-normal mt-1">
                            Cards, UPI Apps (GPay, PhonePe), & Net Banking.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black flex items-center justify-between text-[10px] font-black uppercase">
                        {gatewaySettings.cashfree.enabled ? (
                          <>
                            <span className="text-black">Select Instant Pay</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <span className="text-[#EA4335] text-[9px] font-bold">
                            {gatewaySettings.cashfree.message || 'Offline.'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OPTION 2: MLSC PAY (MANUAL QR & UPI) */}
                    {gatewaySettings.mlscPay.enabled && (
                      <div 
                        onClick={() => {
                          if (gatewaySettings.mlscPay.enabled) {
                            setSelectedGateway('mlsc_pay');
                          }
                        }}
                        className={cn(
                          'border-2 border-black p-4 flex flex-col justify-between text-left transition-all min-h-[160px] shadow-[3px_3px_0px_0px_#000000]',
                          gatewaySettings.mlscPay.enabled 
                            ? 'bg-white hover:bg-zinc-50 cursor-pointer active:translate-x-[2px] active:translate-y-[2px]' 
                            : 'bg-zinc-100 opacity-60 cursor-not-allowed'
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2 border-2 border-black bg-[#4285F4] text-white shadow-[1px_1px_0px_0px_#000000]">
                              <QrCode className="h-4 w-4" />
                            </div>
                            {gatewaySettings.mlscPay.enabled ? (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#FFE600] border border-black text-black">
                                Manual QR
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#EA4335] text-white border border-black">
                                Disabled
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-black">MLSC Pay (QR)</h4>
                            <p className="text-[10px] text-zinc-600 font-bold leading-normal mt-1">
                              Direct bank transfer & UTR confirmation.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black flex items-center justify-between text-[10px] font-black uppercase">
                          {gatewaySettings.mlscPay.enabled ? (
                            <>
                              <span className="text-black">Scan & Submit Ref</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          ) : (
                            <span className="text-[#EA4335] text-[9px] font-bold">
                              {gatewaySettings.mlscPay.message || 'Offline.'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* STATE B: Specific Gateway Forms */}
              {selectedGateway !== null && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (gatewaySettings.cashfree.enabled && gatewaySettings.mlscPay.enabled) {
                            setSelectedGateway(null);
                          }
                        }}
                        disabled={!gatewaySettings.cashfree.enabled || !gatewaySettings.mlscPay.enabled}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider',
                          (gatewaySettings.cashfree.enabled && gatewaySettings.mlscPay.enabled) 
                            ? 'text-black hover:underline cursor-pointer' 
                            : 'text-zinc-400 cursor-not-allowed'
                        )}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Methods
                      </button>
                      <span className="text-[10px] font-black uppercase bg-zinc-100 border border-black px-2 py-0.5">
                        {selectedGateway === 'cashfree' ? 'Cashfree Gateway' : 'MLSC Direct UPI'}
                      </span>
                    </div>

                    <div className="h-0.5 bg-black" />
                  </div>

                  {/* Contents */}
                  <div className="flex-1 flex flex-col justify-center">
                    
                    {/* CASHFREE FORM */}
                    {selectedGateway === 'cashfree' && (
                      <div className="space-y-4 py-2 text-center">
                        <div className="mx-auto w-12 h-12 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000000]">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase text-black">Instant Checkout Gateway</h4>
                          <p className="text-xs text-zinc-600 font-bold max-w-sm mx-auto">
                            You will be transferred to Cashfree's PCI-DSS compliant payment portal to complete this transaction.
                          </p>
                        </div>

                        <div className="border-2 border-black bg-zinc-50 p-3 text-left text-xs font-mono space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                          <div className="flex justify-between">
                            <span className="text-zinc-500 font-sans font-bold">Billed Name:</span>
                            <span className="font-bold text-black">{name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 font-sans font-bold">Email:</span>
                            <span className="font-bold text-black">{email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500 font-sans font-bold">Phone:</span>
                            <span className="font-bold text-black">{phone}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MLSC PAY FORM */}
                    {selectedGateway === 'mlsc_pay' && (
                      <div className="space-y-4 py-2">
                        <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                          
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="relative w-28 h-28 flex items-center justify-center border-2 border-black p-1 bg-white">
                              <img 
                                src="/images/qr.jpeg" 
                                alt="MLSC UPI QR Code" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              <div className="qr-fallback hidden flex flex-col items-center justify-center text-black">
                                <QrCode className="h-12 w-12" />
                                <span className="text-[7px] font-black text-black uppercase mt-1">Scan to Pay</span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase text-zinc-500">Merchant QR</span>
                          </div>

                          <div className="flex-1 space-y-2 text-left">
                            <div>
                              <h4 className="text-xs font-black uppercase text-black">1. Scan & Transfer</h4>
                              <p className="text-[11px] text-zinc-600 font-bold leading-normal">
                                Send exactly <strong className="text-black font-black">₹{totalAmount}.00</strong> using any UPI app.
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase text-zinc-500 block">UPI ID</span>
                              <div className="flex items-center justify-between bg-white border-2 border-black px-2 py-1 text-xs shadow-[1px_1px_0px_0px_#000000]">
                                <span className="font-mono text-black font-black text-[11px]">9849372827@kotakbank</span>
                                <button 
                                  type="button" 
                                  onClick={handleCopyUpi}
                                  className="text-black hover:text-[#4285F4] p-1"
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                            2. Transaction UTR / Ref Number <span className="text-[#EA4335]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            placeholder="Enter 12-digit UTR from your UPI app receipt"
                            className="w-full h-10 px-3 border-2 border-black bg-white text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
                          />
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Summary Breakdown & Actions */}
                  <div className="space-y-3 pt-3 border-t-2 border-black">
                    <div className="border-2 border-black bg-zinc-50 p-3 text-xs space-y-1 font-mono shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex justify-between">
                        <span className="font-sans font-bold text-zinc-600">Base Pass Price:</span>
                        <span className="text-black font-bold">₹{basePrice}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans font-bold text-zinc-600">GST (18%):</span>
                        <span className="text-black font-bold">₹{gstAmount}.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans font-bold text-zinc-600">Handling Fee:</span>
                        <span className="text-black font-bold">₹{convenienceFee}.00</span>
                      </div>
                      <div className="flex justify-between border-t border-black pt-1 font-black text-sm text-black">
                        <span className="font-sans">Total Amount:</span>
                        <span>₹{totalAmount}.00</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitPayment}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#FFE600] hover:bg-[#FFE600]/90 text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCcw className="h-4 w-4 animate-spin" /> Processing Transaction...
                          </>
                        ) : (
                          <>
                            {selectedGateway === 'cashfree' 
                              ? `Pay Online ₹${totalAmount}.00` 
                              : `Submit UTR Reference ₹${totalAmount}.00`} 
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
