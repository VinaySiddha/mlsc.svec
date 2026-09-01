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
      <div className="w-full bg-white min-h-screen py-32 text-black flex items-center justify-center font-sans">
        <div className="max-w-md mx-auto border-2 border-black bg-white p-8 sm:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#EA4335]">
          <div className="mx-auto w-16 h-16 border-2 border-black bg-[#EA4335] text-white flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
            <XCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">Invalid Order Token</h2>
            <p className="text-zinc-700 text-xs font-bold leading-relaxed">
              No valid order identifier was detected in the active session. If you experienced an issue during checkout, please reach out to support.
            </p>
          </div>
          <div className="pt-4 border-t-2 border-black">
            <Button asChild className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black font-black uppercase tracking-wider text-xs h-11 shadow-[3px_3px_0px_0px_#000000]">
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
    <div className="w-full bg-white min-h-screen py-24 md:py-32 text-black font-sans flex items-center justify-center selection:bg-[#FFE600] selection:text-black">
      <div className="w-full max-w-lg px-4 sm:px-6">
        
        {isPaid && (
          /* SUCCESS STATE */
          <div className="border-2 border-black bg-white p-8 md:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#00FF66]">
            <div className="mx-auto w-16 h-16 border-2 border-black bg-[#00FF66] text-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-black bg-[#FFE600] text-[10px] font-black tracking-widest text-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                <Sparkles className="h-3 w-3" /> {isEvent ? 'Pass Confirmed' : 'Payment Verified'}
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-black mt-2">
                {isEvent ? 'Seat Confirmed!' : 'Contribution Received!'}
              </h2>
              <p className="text-black font-black text-sm">Thank you, {result.customerName || 'Supporter'}!</p>
              <p className="text-zinc-700 text-xs font-bold max-w-sm mx-auto leading-relaxed">
                {isEvent 
                  ? `Your event registration is finalized. An official confirmation pass has been dispatched to your email.`
                  : `Your contribution was successfully processed. Your generosity fuels student hackathons, workshops, and cloud infrastructure.`}
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="border-2 border-black bg-zinc-50 p-5 text-left space-y-3 shadow-[3px_3px_0px_0px_#000000]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-black pb-2 border-b-2 border-black">
                <Receipt className="h-3.5 w-3.5" /> {isEvent ? 'Event Registration Receipt' : 'Donation Tax Receipt'}
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-600 uppercase text-[10px]">{isEvent ? 'Attendee:' : 'Donor:'}</span>
                <span className="text-black">{result.customerName}</span>
              </div>
              {isEvent && (result as any).eventTitle && (
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-600 uppercase text-[10px]">Event Title:</span>
                  <span className="text-black truncate max-w-[200px]">{(result as any).eventTitle}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-600 uppercase text-[10px]">Email:</span>
                <span className="text-black font-mono text-[11px]">{result.customerEmail}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-600 uppercase text-[10px]">Order ID:</span>
                <span className="text-black font-mono text-[10px] bg-zinc-200 px-2 py-0.5 border border-black">{order_id}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t-2 border-black">
                <span className="text-xs font-black uppercase text-zinc-600">Amount Cleared:</span>
                <span className="text-xl font-black text-black font-mono tracking-tight">
                  ₹{result.amount}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row gap-3">
              {isEvent ? (
                <>
                  <Button asChild className="flex-1 bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                    <Link href="/events">Explore Events</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-white text-black hover:bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                    <Link href="/study" className="flex items-center justify-center gap-1.5">
                      Roadmaps <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="flex-1 bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                    <Link href="/donate">Donate Again</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-white text-black hover:bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                    <Link href="/contribute" className="flex items-center justify-center gap-1.5">
                      Contribute <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {isPending && (
          /* PENDING STATE */
          <div className="border-2 border-black bg-white p-8 md:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#FFE600]">
            <div className="mx-auto w-16 h-16 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
              <Clock className="h-9 w-9 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-black bg-zinc-100 text-[10px] font-black tracking-widest text-black uppercase">
                Processing Transaction
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-black mt-2">Awaiting Confirmation</h2>
              <p className="text-zinc-700 text-xs font-bold max-w-sm mx-auto leading-relaxed">
                Payment status is pending bank confirmation. We will update your record automatically once verified by Cashfree.
              </p>
            </div>

            <div className="border-2 border-black bg-zinc-50 p-4 text-left space-y-2 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-600">Order ID:</span>
                <span className="text-black font-mono text-[10px]">{order_id}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-zinc-300">
                <span className="text-xs font-black uppercase text-zinc-600">Amount:</span>
                <span className="text-lg font-black text-black font-mono">
                  ₹{result.amount}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black">
              <Button asChild className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                <Link href="/donate">Return to Hub</Link>
              </Button>
            </div>
          </div>
        )}

        {isFailed && (
          /* FAILED STATE */
          <div className="border-2 border-black bg-white p-8 md:p-10 text-center space-y-6 shadow-[8px_8px_0px_0px_#EA4335]">
            <div className="mx-auto w-16 h-16 border-2 border-black bg-[#EA4335] text-white flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
              <XCircle className="h-9 w-9" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-black bg-[#EA4335]/10 text-[10px] font-black tracking-widest text-[#EA4335] uppercase">
                Payment Failed
              </span>
              <h2 className="text-3xl font-black uppercase italic tracking-tight text-black mt-2">Transaction Declined</h2>
              <p className="text-zinc-700 text-xs font-bold max-w-sm mx-auto leading-relaxed">
                {result.error || 'We could not verify your payment. The transaction may have been cancelled or declined by your financial institution.'}
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black">
              <Button asChild className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-black uppercase text-xs h-12">
                <Link href="/donate">Try Again</Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
