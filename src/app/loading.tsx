import { IosLoader } from '@/components/ui/ios-loader';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 backdrop-blur-xl">
        <IosLoader size="lg" color="text-white" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
