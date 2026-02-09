// Notification Bell - Dropdown notification panel in header
import React, { useState } from 'react';
import { Bell, BookOpen, ClipboardList, Megaphone, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'assignment' | 'announcement' | 'grade' | 'member';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'assignment', title: 'New Assignment', description: 'UML Diagram for Library System has been posted in OOSE-3 YR', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 'n2', type: 'announcement', title: 'Announcement', description: 'Lab session tomorrow at 2 PM. Come prepared.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false },
  { id: 'n3', type: 'grade', title: 'Marks Uploaded', description: 'Your grade for Design Patterns has been posted: 95/100', timestamp: new Date(Date.now() - 18000000).toISOString(), read: false },
  { id: 'n4', type: 'member', title: 'New Student', description: 'Nissan has joined Virtualization CCS372', timestamp: new Date(Date.now() - 36000000).toISOString(), read: true },
  { id: 'n5', type: 'assignment', title: 'Due Soon', description: 'Docker Container Lab is due tomorrow', timestamp: new Date(Date.now() - 43200000).toISOString(), read: true },
];

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <ClipboardList className="w-4 h-4 text-primary" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-gc-orange" />;
      case 'grade': return <BookOpen className="w-4 h-4 text-gc-green" />;
      case 'member': return <UserPlus className="w-4 h-4 text-gc-purple" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="gc-btn-icon relative"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-on-surface-variant" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-xl shadow-xl border border-border z-50 animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-google-sans text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-variant/50 transition-colors cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-xs text-on-surface-variant/60 mt-1">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
