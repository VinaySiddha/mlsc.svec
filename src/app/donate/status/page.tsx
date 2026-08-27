import React from 'react';
import Link from 'next/link';
import { verifyCashfreeOrderAction } from '@/app/actions/cashfree-actions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowRight, Heart, Sparkles, Receipt } from 'lucide-react';

interface Props {
  searchParams: Promise<{
    order_id?: string;
  }>;
}

export default async function DonateStatusPage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  if (!order_id) {
    return (
      <div className="w-full bg-black min-h-screen py-32 text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/20 to-black pointer-events-none" />
        <div className="max-w-md mx-auto border border-red-500/30 bg-red-950/5 backdrop-blur-md rounded-3xl p-10 text-center space-y-6 shadow-2xl relative z-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
            <XCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Invalid Order Reference</h2>
            <p className="text-white/55 text-xs leading-relaxed">
              No order identifier was found in the session. If you believe this is an error, please reach out to our community support.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <Button asChild className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-11">
              <Link href="/donate">Back to Donations</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const result = (await verifyCashfreeOrderAction(order_id)) as any;

  const isEvent = order_id.startsWith('order_event_');
  const isPaid = result.success && result.status === 'PAID';
  const isPending = result.success && result.status === 'PENDING';
  const isFailed = !result.success || result.status === 'FAILED';

  return (
    <div className="w-full bg-black min-h-screen py-32 text-white relative overflow-hidden flex items-center justify-center">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {isPaid && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      )}

      <div className="w-full max-w-lg px-6 relative z-10">
        
        {isPaid && (
          /* SUCCESS STATE */
          <div className="border border-emerald-500/20 bg-emerald-950/[0.03] backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-9 w-9 fill-current" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                <Sparkles className="h-3 w-3 fill-emerald-400" /> {isEvent ? 'Pass Confirmed' : 'Transaction Verified'}
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mt-3">
                {isEvent ? 'Seat Confirmed!' : 'Contribution Received!'}
              </h2>
              <p className="text-emerald-400/90 font-bold text-sm">Thank you, {result.customerName || 'Supporter'}!</p>
              <p className="text-white/50 text-xs max-w-sm mx-auto leading-relaxed">
                {isEvent 
                  ? `Your event pass has been successfully generated. We have emailed the official ticket details to your registered address.`
                  : `Your payment was successfully processed. Your generous support fuels student hackathons, workshop supplies, and cloud hosting for the community.`}
              </p>
            </div>

            {/* Receipt details */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left space-y-3 font-sans">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/30 pb-2 border-b border-white/5">
                <Receipt className="h-3.5 w-3.5" /> {isEvent ? 'Event Ticket Details' : 'Contribution Receipt'}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-medium">{isEvent ? 'Attendee Name:' : 'Donor Name:'}</span>
                <span className="text-white font-semibold">{result.customerName}</span>
              </div>
              {isEvent && (result as any).eventTitle && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 font-medium">Event Name:</span>
                  <span className="text-[#34A853] font-black truncate max-w-[220px]">{(result as any).eventTitle}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-medium">Registered Email:</span>
                <span className="text-white font-mono">{result.customerEmail}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-medium">Ticket ID:</span>
                <span className="text-white font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded">{order_id}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-white/5">
                <span className="text-xs text-white/40 font-medium">Amount Cleared:</span>
                <span className="text-lg font-black text-yellow-400 tracking-tight italic">
                  ₹{result.amount}
                </span>
              </div>
              {result.isMock && (
                <div className="text-center pt-2 text-[9px] font-extrabold text-yellow-500/70 uppercase tracking-widest bg-yellow-500/5 rounded-lg py-1 border border-yellow-500/10">
                  Sandbox Simulation Mode
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              {isEvent ? (
                <>
                  <Button asChild className="flex-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-12">
                    <Link href="/events">Explore Events</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 rounded-xl border-white/10 hover:border-white/20 bg-transparent text-white font-bold uppercase tracking-wider text-xs h-12">
                    <Link href="/study" className="flex items-center justify-center gap-1.5">
                      View Roadmap <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="flex-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-12">
                    <Link href="/donate">Donate Again</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 rounded-xl border-white/10 hover:border-white/20 bg-transparent text-white font-bold uppercase tracking-wider text-xs h-12">
                    <Link href="/contribute" className="flex items-center justify-center gap-1.5">
                      Code with Us <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {isPending && (
          /* PENDING/PROCESSING STATE */
          <div className="border border-yellow-500/20 bg-yellow-950/[0.03] backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 animate-pulse">
              <Clock className="h-9 w-9" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-[9px] font-black tracking-widest text-yellow-400 uppercase">
                Processing Payment
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mt-3">Awaiting Verification</h2>
              <p className="text-white/50 text-xs max-w-sm mx-auto leading-relaxed">
                The payment status is currently pending or awaiting bank clearance. We will update the status as soon as we receive confirmation from Cashfree.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left space-y-3 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-white/40 font-medium">Order ID:</span>
                <span className="text-white font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded">{order_id}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-white/5">
                <span className="text-xs text-white/40 font-medium">Amount:</span>
                <span className="text-lg font-black text-yellow-400 tracking-tight italic">
                  ₹{result.amount}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button asChild className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-12">
                <Link href="/donate">Return to Hub</Link>
              </Button>
            </div>
          </div>
        )}

        {isFailed && (
          /* FAILED STATE */
          <div className="border border-red-500/20 bg-red-950/[0.03] backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
              <XCircle className="h-9 w-9" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-[9px] font-black tracking-widest text-red-400 uppercase">
                Verification Failed
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mt-3">Payment Unsuccessful</h2>
              <p className="text-white/50 text-xs max-w-sm mx-auto leading-relaxed">
                {result.error || 'We could not verify your donation payment. The transaction may have been cancelled or declined by the bank.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button asChild className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-12">
                <Link href="/donate">Try Again</Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
