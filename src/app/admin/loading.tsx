import { IosLoader } from '@/components/ui/ios-loader';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-3 backdrop-blur-xl">
        <IosLoader size="lg" color="text-[#4285F4]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 animate-pulse">
          Loading Admin Module...
        </span>
      </div>
    </div>
  );
}
