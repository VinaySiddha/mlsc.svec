import { Badge } from '@/components/ui/badge';
import { MessageSquare, HelpCircle, Megaphone } from 'lucide-react';

const typeConfig = {
  discussion: { label: 'Discussion', icon: MessageSquare, variant: 'secondary' as const },
  question: { label: 'Question', icon: HelpCircle, variant: 'outline' as const },
  announcement: { label: 'Announcement', icon: Megaphone, variant: 'default' as const },
};

export function PostTypeBadge({ type }: { type: 'discussion' | 'question' | 'announcement' }) {
  const config = typeConfig[type];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
