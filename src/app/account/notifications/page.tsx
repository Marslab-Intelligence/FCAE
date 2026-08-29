import type { Metadata } from 'next';
import { CheckCircle2, AlertCircle, Info, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Notifications — SID Managed Cloud',
};

const notifications = [
  {
    id: 1,
    icon: AlertCircle,
    title: 'P2 Incident: Database performance degradation',
    body: 'Prod RDS instance showing elevated query times. Our team is investigating.',
    time: '2 hours ago',
    read: false,
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/15',
  },
  {
    id: 2,
    icon: TrendingDown,
    title: 'Cost optimization opportunity detected',
    body: '3 idle EC2 instances found. Terminating could save ~₹8,400/month.',
    time: '1 day ago',
    read: false,
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 border-blue-500/15',
  },
  {
    id: 3,
    icon: CheckCircle2,
    title: 'Monthly security scan complete',
    body: 'All systems scanned. 0 critical findings, 2 low-severity recommendations.',
    time: '3 days ago',
    read: true,
    color: 'text-emerald-400',
    bg: 'glass-card',
  },
  {
    id: 4,
    icon: Info,
    title: 'Your December 2024 report is ready',
    body: 'Cloud spend summary and performance metrics for December 2024 are now available.',
    time: '1 week ago',
    read: true,
    color: 'text-purple-400',
    bg: 'glass-card',
  },
];

export default function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Notifications</h1>
          <p className="text-text-muted mt-1">{unread} unread notification{unread !== 1 && 's'}</p>
        </div>
        <button className="text-sm text-accent hover:text-accent-glow transition-colors font-medium">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={cn('p-5 rounded-2xl border flex items-start gap-4 transition-all', notif.bg, !notif.read && 'ring-1 ring-accent/10')}
          >
            <div className={cn('w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0', notif.color)}>
              <notif.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className={cn('text-sm font-semibold leading-snug', notif.read ? 'text-text-muted' : 'text-text')}>
                  {notif.title}
                </p>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-text-dim mt-1 leading-relaxed">{notif.body}</p>
              <p className="text-xs text-text-dim mt-2">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
