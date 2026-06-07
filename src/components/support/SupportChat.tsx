"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

// Floating live-support widget. Talks to the KHORA Inventory ops platform's
// public CORS endpoints (the same cross-app pattern as Analytics). Messages a
// customer sends are routed to the agent inbox at /support; agent replies come
// back here via polling. Configure the endpoint with NEXT_PUBLIC_OPS_URL.

const OPS_URL = process.env.NEXT_PUBLIC_OPS_URL;

type Msg = {
  id: string;
  sender: "customer" | "agent";
  body: string;
  createdAt: string;
};

const COPY = {
  en: {
    title: "Live support",
    subtitle: "We usually reply within a few minutes.",
    greeting:
      "Hello — how can we help you today? Ask us anything about stones, bracelets, or your order.",
    placeholder: "Write a message…",
    namePlaceholder: "Your name (optional)",
    emailPlaceholder: "Email (optional)",
    start: "Start chat",
    closed: "This conversation was closed. Send a message to reopen it.",
    open: "Chat with us",
  },
  zh: {
    title: "在线客服",
    subtitle: "我们通常会在几分钟内回复。",
    greeting: "您好 —— 有什么可以帮您？关于石头、手串或订单都可以咨询我们。",
    placeholder: "输入消息…",
    namePlaceholder: "您的称呼（选填）",
    emailPlaceholder: "邮箱（选填）",
    start: "开始对话",
    closed: "该对话已结束，发送消息可重新开启。",
    open: "联系我们",
  },
} as const;

function sessionId(): string {
  try {
    let id = localStorage.getItem("khora_sid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("khora_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function SupportChat() {
  const { locale } = useI18n();
  const t = COPY[locale] ?? COPY.en;

  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false); // a conversation exists
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);

  const cursor = useRef<string | null>(null); // ISO of newest message seen
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  // Merge freshly-fetched messages, de-duping by id and advancing the cursor.
  const ingest = useCallback((incoming: Msg[], initial = false) => {
    if (!incoming.length) return;
    const fresh = incoming.filter((m) => !seen.current.has(m.id));
    if (!fresh.length) return;
    fresh.forEach((m) => seen.current.add(m.id));
    cursor.current = fresh[fresh.length - 1].createdAt;
    setMessages((prev) => [...prev, ...fresh]);
    // Badge agent replies that arrive while the panel is closed.
    if (!initial && !openRef.current) {
      const agentCount = fresh.filter((m) => m.sender === "agent").length;
      if (agentCount) setUnread((u) => u + agentCount);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!OPS_URL) return;
    const sid = sessionId();
    const after = cursor.current ? `&after=${encodeURIComponent(cursor.current)}` : "";
    try {
      const res = await fetch(`${OPS_URL}/api/support?sessionId=${sid}${after}`, {
        mode: "cors",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.exists) setStarted(true);
      if (data.status) setStatus(data.status);
      ingest((data.messages as Msg[]) ?? [], cursor.current === null);
    } catch {
      /* offline — try again next tick */
    }
  }, [ingest]);

  // Load history once on mount so a returning visitor sees their thread.
  useEffect(() => {
    poll();
  }, [poll]);

  // Poll for new messages: briskly while open, lazily while a thread exists.
  useEffect(() => {
    if (!OPS_URL) return;
    if (!open && !started) return;
    const interval = open ? 4000 : 12000;
    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [open, started, poll]);

  // Clear the badge and scroll to the latest when the panel opens.
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const send = useCallback(async () => {
    const body = input.trim();
    if (!body || !OPS_URL || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`${OPS_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
          sessionId: sessionId(),
          body,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      if (res.ok) {
        setStarted(true);
        setStatus("open");
        await poll(); // pull the just-sent message (and any agent reply)
      } else {
        setInput(body); // restore so the customer can retry
      }
    } catch {
      setInput(body);
    } finally {
      setSending(false);
    }
  }, [input, name, email, sending, poll]);

  if (!OPS_URL) return null;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.open}
        className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full bg-bone text-obsidian shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-gold text-[#faf8f4] text-[11px] font-medium flex items-center justify-center tabular-nums">
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[min(92vw,380px)] h-[min(70vh,560px)] flex flex-col bg-obsidian border border-hairline rounded-lg shadow-2xl overflow-hidden">
          <header className="px-5 py-4 border-b border-hairline bg-charcoal">
            <p className="font-serif text-lg text-bone leading-tight">{t.title}</p>
            <p className="text-xs text-mist mt-0.5">{t.subtitle}</p>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {/* Brand greeting always leads the thread. */}
            <Bubble sender="agent">{t.greeting}</Bubble>
            {messages.map((m) => (
              <Bubble key={m.id} sender={m.sender}>
                {m.body}
              </Bubble>
            ))}
            {status === "closed" && (
              <p className="text-[11px] text-mist text-center mt-1">{t.closed}</p>
            )}
          </div>

          {/* Optional identity, only before the first message. */}
          {!started && (
            <div className="px-4 pt-3 grid grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="bg-charcoal border border-hairline rounded px-3 py-2 text-sm text-bone placeholder:text-mist focus:outline-none focus:border-gold"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="bg-charcoal border border-hairline rounded px-3 py-2 text-sm text-bone placeholder:text-mist focus:outline-none focus:border-gold"
              />
            </div>
          )}

          <div className="p-3 flex items-end gap-2 border-t border-hairline">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={t.placeholder}
              className="flex-1 resize-none bg-charcoal border border-hairline rounded px-3 py-2 text-sm text-bone placeholder:text-mist focus:outline-none focus:border-gold max-h-28"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="h-9 w-9 shrink-0 rounded-full bg-gold text-[#faf8f4] flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({
  sender,
  children,
}: {
  sender: "customer" | "agent";
  children: React.ReactNode;
}) {
  const mine = sender === "customer";
  return (
    <div
      className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
        mine
          ? "self-end bg-bone text-obsidian rounded-br-md"
          : "self-start bg-charcoal text-bone rounded-bl-md border border-hairline"
      }`}
    >
      {children}
    </div>
  );
}
