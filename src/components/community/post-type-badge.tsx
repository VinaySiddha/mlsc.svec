import { MessageSquare, HelpCircle, Megaphone } from 'lucide-react';

const typeConfig = {
  discussion: { label: 'Discussion', icon: MessageSquare, bg: 'bg-[#4285F4]', text: 'text-white' },
  question: { label: 'Question', icon: HelpCircle, bg: 'bg-[#FFE600]', text: 'text-black' },
  announcement: { label: 'Bulletin', icon: Megaphone, bg: 'bg-[#FF0055]', text: 'text-white' },
};

export function PostTypeBadge({ type }: { type: 'discussion' | 'question' | 'announcement' }) {
  const config = typeConfig[type] || typeConfig.discussion;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3 stroke-[2.5]" />
      {config.label}
    </span>
  );
}

