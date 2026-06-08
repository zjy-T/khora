"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { playChime } from "@/lib/chime";

// Floating live-support widget. Talks to the KHORA Inventory ops platform's
// public CORS endpoints (the same cross-app pattern as Analytics). Messages a
// customer sends are routed to the agent inbox at /support; agent replies come
// back here via polling. Configure the endpoint with NEXT_PUBLIC_OPS_URL.
//
// Other components (e.g. the Contact page) can open this widget by dispatching
// a `khora:open-support` window event.

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
    closed: "This conversation was resolved. Send a message to reopen it.",
    open: "Chat with us",
    needHelp: "Need help?",
    typing: "typing",
    tabAlert: "💬 New reply — KHORA",
    ratingPrompt: "How was your support experience?",
    ratingCommentPlaceholder: "Add a comment (optional)",
    ratingSubmit: "Submit rating",
    ratingThanks: "Thank you for your feedback.",
    youRated: "You rated this chat",
  },
  zh: {
    title: "在线客服",
    subtitle: "我们通常会在几分钟内回复。",
    greeting: "您好 —— 有什么可以帮您？关于石头、手串或订单都可以咨询我们。",
    placeholder: "输入消息…",
    namePlaceholder: "您的称呼（选填）",
    emailPlaceholder: "邮箱（选填）",
    closed: "该对话已结束，发送消息可重新开启。",
    open: "联系我们",
    needHelp: "需要帮助？",
    typing: "正在输入",
    tabAlert: "💬 新回复 — KHORA",
    ratingPrompt: "您对本次客服体验的评价？",
    ratingCommentPlaceholder: "补充评价（选填）",
    ratingSubmit: "提交评价",
    ratingThanks: "感谢您的反馈。",
    youRated: "您的评价",
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
  const [agentTyping, setAgentTyping] = useState(false);

  // Rating state (collected once a chat is closed).
  const [serverRating, setServerRating] = useState<number | null>(null);
  const [pickRating, setPickRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingDone, setRatingDone] = useState(false);

  const cursor = useRef<string | null>(null); // ISO of newest message seen
  const seen = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const [notify, setNotify] = useState(false); // unseen reply → tab-title flash

  // Merge freshly-fetched messages, de-duping by id and advancing the cursor.
  const ingest = useCallback((incoming: Msg[], initial = false) => {
    if (!incoming.length) return;
    const fresh = incoming.filter((m) => !seen.current.has(m.id));
    if (!fresh.length) return;
    fresh.forEach((m) => seen.current.add(m.id));
    cursor.current = fresh[fresh.length - 1].createdAt;
    setMessages((prev) => [...prev, ...fresh]);

    if (initial) return;
    const agentMsgs = fresh.filter((m) => m.sender === "agent").length;
    if (agentMsgs) {
      // Audible + visual alert for an incoming reply.
      playChime();
      if (!openRef.current) setUnread((u) => u + agentMsgs);
      if (!openRef.current || document.hidden) setNotify(true);
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
      setAgentTyping(!!data.agentTyping);
      if (typeof data.rating === "number") setServerRating(data.rating);
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
    const interval = open ? 3000 : 12000;
    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [open, started, poll]);

  // Open via a global event (e.g. the Contact page "Talk to support" button).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("khora:open-support", handler);
    return () => window.removeEventListener("khora:open-support", handler);
  }, []);

  // Clear badge/notify and scroll to the latest when the panel opens.
  useEffect(() => {
    if (open) {
      setUnread(0);
      setNotify(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, agentTyping]);

  // Flash the browser tab title while there's an unseen reply and the tab is
  // hidden; restore the original title on return.
  useEffect(() => {
    if (!notify) return;
    const original = document.title;
    let on = false;
    const id = setInterval(() => {
      document.title = on ? original : t.tabAlert;
      on = !on;
    }, 1000);
    const onVisible = () => {
      if (!document.hidden) setNotify(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.title = original;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [notify, t.tabAlert]);

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

  const submitRating = useCallback(async () => {
    if (!OPS_URL || !pickRating) return;
    try {
      const res = await fetch(`${OPS_URL}/api/support/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
          sessionId: sessionId(),
          rating: pickRating,
          comment: ratingComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setServerRating(pickRating);
        setRatingDone(true);
      }
    } catch {
      /* ignore — they can retry */
    }
  }, [pickRating, ratingComment]);

  if (!OPS_URL) return null;

  const showRating = status === "closed" && serverRating === null && !ratingDone;
  const ratedValue = serverRating ?? (ratingDone ? pickRating : null);

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3">
        {!open && (
          <span className="hidden md:inline-block rounded-full bg-bone/90 text-obsidian text-xs font-medium px-3.5 py-2 shadow-lg pointer-events-none">
            {t.needHelp}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={t.open}
          className="relative h-16 w-16 rounded-full bg-gold text-[#faf8f4] shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          {/* Pulsing ring to draw the eye (only when closed). */}
          {!open && (
            <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />
          )}
          <span className="relative">
            {open ? <X size={26} /> : <MessageCircle size={26} />}
          </span>
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-bone text-obsidian text-xs font-semibold flex items-center justify-center tabular-nums shadow">
              {unread}
            </span>
          )}
        </button>
      </div>

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
            {agentTyping && <TypingBubble label={t.typing} />}
            {status === "closed" && !showRating && ratedValue === null && (
              <p className="text-[11px] text-mist text-center mt-1">{t.closed}</p>
            )}
          </div>

          {/* Rating prompt once the chat is resolved. */}
          {showRating && (
            <div className="px-4 py-3 border-t border-hairline bg-charcoal/60">
              <p className="text-xs text-mist mb-2">{t.ratingPrompt}</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickRating(i)}
                    aria-label={`${i} star`}
                    className={`text-2xl leading-none transition-colors ${
                      i <= pickRating ? "text-gold" : "text-mist hover:text-gold-soft"
                    }`}
                  >
                    {i <= pickRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <input
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={t.ratingCommentPlaceholder}
                className="w-full bg-charcoal border border-hairline rounded px-3 py-2 text-sm text-bone placeholder:text-mist focus:outline-none focus:border-gold mb-2"
              />
              <button
                type="button"
                onClick={submitRating}
                disabled={!pickRating}
                className="w-full bg-gold text-[#faf8f4] text-sm rounded py-2 disabled:opacity-40 transition-opacity"
              >
                {t.ratingSubmit}
              </button>
            </div>
          )}
          {ratedValue !== null && (
            <div className="px-4 py-3 border-t border-hairline bg-charcoal/60 text-center">
              <p className="text-xs text-mist mb-1">
                {ratingDone ? t.ratingThanks : t.youRated}
              </p>
              <p className="text-gold text-lg leading-none">
                {"★".repeat(ratedValue)}
                <span className="text-mist">{"★".repeat(5 - ratedValue)}</span>
              </p>
            </div>
          )}

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

function TypingBubble({ label }: { label: string }) {
  return (
    <div className="self-start bg-charcoal text-mist rounded-2xl rounded-bl-md border border-hairline px-3.5 py-2.5 flex items-center gap-1.5">
      <span className="text-xs">{label}</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-mist animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
