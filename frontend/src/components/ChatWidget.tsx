import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquareText, Send, X } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";
import { track } from "@/lib/analytics";

const INTRO =
  "I am Avni's digital clone. I handle the small talk so she can focus on writing Python and orchestrating Kubernetes clusters. What do you want to know?";

const API = `${process.env.REACT_APP_BACKEND_URL ?? ""}/api/chat`;

const getSessionId = () => {
  let id = localStorage.getItem("ab-chat-session");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    localStorage.setItem("ab-chat-session", id);
  }
  return id;
};

const SUGGESTIONS = [
  "What did Avni build at Airbus?",
  "What's her tech stack?",
  "Is she open to internships?",
  "Summarize her best projects",
];

const ChatPanel = ({
  sessionId,
  initialMessages,
}: {
  sessionId: string;
  initialMessages: Message[];
}) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: API,
    streamProtocol: "text",
    body: { sessionId },
    initialMessages,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const last = messages[messages.length - 1];
  const showTyping = isLoading && (!last || last.role === "user");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, showTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      data-testid="chat-panel"
      className="flex h-[460px] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background/85 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em]">Avni's Digital Clone</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Live — remembers this conversation
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-accent" data-testid="chat-status-dot" />
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4" data-testid="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid={`chat-message-${msg.role}`}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "self-end rounded-br-sm bg-accent text-accent-foreground"
                : "self-start rounded-bl-sm border border-foreground/10 bg-foreground/5"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {showTyping && (
          <div
            data-testid="chat-typing-indicator"
            className="flex items-center gap-1.5 self-start rounded-2xl rounded-bl-sm border border-foreground/10 bg-foreground/5 px-4 py-3"
          >
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="typing-dot h-1.5 w-1.5 rounded-full bg-accent"
                style={{ animationDelay: `${d * 0.18}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-2" data-testid="chat-suggestions">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              data-testid={`chat-suggestion-${SUGGESTIONS.indexOf(q)}`}
              onClick={() => {
                track("chat_message", { source: "suggestion" });
                append({ role: "user", content: q });
              }}
              className="rounded-full border border-accent/30 px-3 py-1.5 font-mono text-[10px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          track("chat_message");
          handleSubmit(e);
        }}
        className="flex items-center gap-2 border-t border-foreground/10 p-3"
      >        <input
          data-testid="chat-input"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask the clone anything"
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          data-testid="chat-send-button"
          data-magnetic
          disabled={isLoading || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Message[] | null>(null);
  const sessionId = useRef(getSessionId()).current;

  useEffect(() => {
    fetch(`${API}/history?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((d) =>
        setHistory(
          d.messages?.length
            ? d.messages
            : [{ id: "intro", role: "assistant", content: INTRO }],
        ),
      )
      .catch(() => setHistory([{ id: "intro", role: "assistant", content: INTRO }]));
  }, [sessionId]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {open && history && <ChatPanel sessionId={sessionId} initialMessages={history} />}
      </AnimatePresence>

      <button
        data-testid="chat-toggle-button"
        data-magnetic
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </button>
    </div>
  );
};
