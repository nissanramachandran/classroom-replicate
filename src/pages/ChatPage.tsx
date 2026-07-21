import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DemoHeader from '@/components/layout/DemoHeader';
import DemoSidebar from '@/components/layout/DemoSidebar';
import { MOCK_CLASSES } from '@/data/mockData';
import { Loader2, Send, Circle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileLite {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string | null;
  department: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const ChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState<ProfileLite[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contacts (all other profiles)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url, role, department')
        .neq('user_id', user.id)
        .order('full_name', { ascending: true });
      if (!error && data) setContacts(data as ProfileLite[]);
      setLoading(false);
    })();
  }, [user]);

  // Load unread counts
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('recipient_id', user.id)
        .is('read_at', null);
      const map: Record<string, number> = {};
      (data || []).forEach((m: any) => {
        map[m.sender_id] = (map[m.sender_id] || 0) + 1;
      });
      setUnread(map);
    })();
  }, [user]);

  // Presence channel
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('presence:chat', {
      config: { presence: { key: user.id } },
    });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineIds(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Realtime new messages (any conversation)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat_messages:inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id !== user.id && msg.recipient_id !== user.id) return;
          const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          if (otherId === activeId) {
            setMessages((prev) => [...prev, msg]);
          } else if (msg.recipient_id === user.id) {
            setUnread((prev) => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeId]);

  // Load conversation when active changes
  useEffect(() => {
    if (!user || !activeId) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${activeId}),and(sender_id.eq.${activeId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
        .limit(500);
      setMessages((data as Message[]) || []);
      // Mark received as read
      await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', activeId)
        .eq('recipient_id', user.id)
        .is('read_at', null);
      setUnread((prev) => ({ ...prev, [activeId]: 0 }));
    })();
  }, [user, activeId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        (c.full_name || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const activeContact = contacts.find((c) => c.user_id === activeId) || null;

  const handleSend = async () => {
    if (!user || !activeId || !input.trim() || sending) return;
    setSending(true);
    const body = input.trim();
    setInput('');
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: user.id,
      recipient_id: activeId,
      body,
    });
    if (error) {
      toast.error('Failed to send message');
      setInput(body);
    }
    setSending(false);
  };

  const initials = (name: string | null, email: string) => {
    const src = name || email;
    return src
      .split(/[ .@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onCreateClick={() => {}}
        onJoinClick={() => {}}
      />
      <DemoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        classes={MOCK_CLASSES}
      />

      <main className="lg:ml-72 pt-16 h-screen flex">
        {/* Contacts list */}
        <aside className="w-full sm:w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-google-sans text-lg text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search people…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container text-sm border border-transparent focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <p className="p-6 text-sm text-on-surface-variant text-center">No people yet.</p>
            ) : (
              filteredContacts.map((c) => {
                const online = onlineIds.has(c.user_id);
                const u = unread[c.user_id] || 0;
                return (
                  <button
                    key={c.user_id}
                    onClick={() => setActiveId(c.user_id)}
                    className={cn(
                      'w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors',
                      activeId === c.user_id && 'bg-surface-container'
                    )}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                        {initials(c.full_name, c.email)}
                      </div>
                      {online && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-gc-green text-gc-green" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {c.full_name || c.email.split('@')[0]}
                        </p>
                        {u > 0 && (
                          <span className="ml-2 text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {u}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">
                        {c.role ? c.role.toUpperCase() : 'User'}
                        {c.department ? ` · ${c.department}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section className="flex-1 flex-col hidden sm:flex">
          {!activeContact ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">
              Select a person to start chatting
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-border bg-card flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                    {initials(activeContact.full_name, activeContact.email)}
                  </div>
                  {onlineIds.has(activeContact.user_id) && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-gc-green text-gc-green" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {activeContact.full_name || activeContact.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {onlineIds.has(activeContact.user_id) ? 'Online' : 'Offline'}
                    {activeContact.role ? ` · ${activeContact.role}` : ''}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-on-surface-variant py-8">
                    No messages yet. Say hi 👋
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                            mine
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-card border border-border text-foreground rounded-bl-sm'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p
                            className={cn(
                              'text-[10px] mt-1',
                              mine ? 'text-white/70' : 'text-on-surface-variant'
                            )}
                          >
                            {formatTime(m.created_at)}
                            {mine && m.read_at ? ' · Read' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t border-border bg-card flex items-center gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-3 rounded-full bg-surface-container text-sm border border-transparent focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatPage;
