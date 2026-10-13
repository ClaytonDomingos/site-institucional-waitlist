import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/format";
import { Button, IconButton } from "./buttons";
import { Avatar } from "./display";
import { Spinner } from "./feedback";
import { TONE_VAR, type Tone } from "./tone";

/* ---------------------------------------------------------------------------
   Conversa.

   ChatThread       mensagens em balões (minhas à direita, em preto)
   ChatComposer     campo de escrever com respostas rápidas
   Marker           aviso, divisória ou status no meio da conversa
   MessageScroller  janela colada no fim ("Novas mensagens ↓")

   <MessageScroller height={360}>
     <ChatThread messages={msgs} />
   </MessageScroller>
   <ChatComposer onSend={(t) => setMsgs([...msgs, { id, from: "me", text: t }])} />
--------------------------------------------------------------------------- */

/* ---------------------------------- Chat ---------------------------------- */

export interface ChatMessage {
  id: string;
  from: "me" | "them" | "system";
  text: ReactNode;
  time?: string;
  author?: string;
  avatar?: string;
  /** só para "me": enviado / lido */
  status?: "sent" | "read";
}

export function ChatThread({ messages, className }: { messages: ChatMessage[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {messages.map((m, i) => {
        if (m.from === "system") {
          return <Marker key={m.id}>{m.text}</Marker>;
        }
        const mine = m.from === "me";
        const prev = messages[i - 1];
        const firstOfGroup = !prev || prev.from !== m.from || prev.author !== m.author;
        return (
          <div key={m.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", firstOfGroup && i > 0 && "mt-2")}>
            {!mine && (
              <span className="w-7 shrink-0">{firstOfGroup && m.author && <Avatar name={m.author} src={m.avatar} size={28} />}</span>
            )}
            <div
              className={cn(
                "max-w-[78%] px-3 py-2 text-body",
                mine
                  ? "rounded-[14px] rounded-br-[4px] bg-primary text-primary-fg shadow-xs"
                  : "rounded-[14px] rounded-bl-[4px] bg-surface-2 text-fg shadow-card",
              )}
            >
              {!mine && firstOfGroup && m.author && <p className="mb-0.5 text-caption font-semibold text-fg">{m.author}</p>}
              <div className="whitespace-pre-wrap">{m.text}</div>
              {(m.time || m.status) && (
                <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-caption-2 num", mine ? "text-primary-fg/75" : "text-faint")}>
                  {m.time}
                  {mine && m.status === "read" && <CheckCheck className="size-3.5" />}
                  {mine && m.status === "sent" && <Check className="size-3.5" />}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChatComposer({
  onSend,
  placeholder = "Escreva uma mensagem…",
  onAttach,
  quickReplies,
}: {
  onSend: (text: string) => void;
  placeholder?: string;
  onAttach?: () => void;
  /** respostas rápidas acima do campo */
  quickReplies?: string[];
}) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="space-y-2">
      {quickReplies && quickReplies.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto scroll-none">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(q)}
              className="control shrink-0 rounded-full px-2.5 py-1 text-body-2 text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="field flex items-end gap-2 p-1.5">
        {onAttach && (
          <IconButton label="Anexar" variant="ghost" onClick={onAttach}>
            <Paperclip />
          </IconButton>
        )}
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1.5 outline-none"
        />
        <Button size="sm" variant="primary" icon={<Send />} disabled={!text.trim()} onClick={send} aria-label="Enviar" />
      </div>
      <p className="px-1 text-caption-2 text-faint">Enter envia · Shift+Enter quebra linha</p>
    </div>
  );
}

/* --------------------------------- Marker --------------------------------- */

/**
 * Marcação no meio de uma conversa, fora dos balões.
 *   note       pílula centralizada ("Conversa iniciada pelo WhatsApp")
 *   separator  linha com rótulo ("Hoje", "Mensagens não lidas")
 *   status     linha discreta com spinner/ícone ("Assistente está digitando…")
 *   row        faixa com borda, ícone no tom e ação ("Consulta agendada · Ver")
 */
export function Marker({
  variant = "note",
  children,
  icon,
  tone = "neutral",
  loading,
  action,
  className,
}: {
  variant?: "note" | "separator" | "status" | "row";
  children: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  loading?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const color = tone === "neutral" ? undefined : TONE_VAR[tone];
  if (variant === "separator") {
    return (
      <div role="separator" className={cn("my-2 flex items-center gap-3", className)}>
        <span className="h-px flex-1" style={{ background: color ?? "var(--border)" }} />
        <span className="text-caption font-medium" style={{ color: color ?? "var(--faint)" }}>
          {children}
        </span>
        <span className="h-px flex-1" style={{ background: color ?? "var(--border)" }} />
      </div>
    );
  }
  if (variant === "status") {
    return (
      <div role="status" className={cn("flex items-center gap-2 py-1 text-body-2 text-muted [&_svg]:size-4", className)}>
        {loading ? <Spinner size={14} /> : icon && <span style={{ color }}>{icon}</span>}
        <span>{children}</span>
      </div>
    );
  }
  if (variant === "row") {
    return (
      <div className={cn("tile my-1 flex items-center gap-2.5 px-3 py-2 text-body-2 text-fg", className)}>
        {icon && (
          <span className="shrink-0 [&>svg]:size-4" style={{ color: color ?? "var(--muted)" }}>
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">{children}</span>
        {action}
      </div>
    );
  }
  return (
    <div className={cn("my-2 flex justify-center", className)}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-0.5 text-caption text-muted [&_svg]:size-3.5">
        {icon && <span style={{ color }}>{icon}</span>}
        {children}
      </span>
    </div>
  );
}

/* ---------------------------- Message scroller ---------------------------- */

/**
 * Janela de conversa que fica colada no fim: mensagem nova rola sozinha.
 * Se a pessoa subiu para ler, não puxa — mostra "Novas mensagens ↓".
 */
export function MessageScroller({
  children,
  height,
  maxHeight,
  label = "Mensagens",
  className,
}: {
  children: ReactNode;
  height?: number | string;
  maxHeight?: number | string;
  label?: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(false);

  const toBottom = (smooth = true) => {
    const el = box.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  useLayoutEffect(() => {
    toBottom(false);
  }, []);

  useEffect(() => {
    if (!inner.current) return;
    const ro = new ResizeObserver(() => {
      if (stick.current) toBottom(true);
      else setUnread(true);
    });
    ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={box}
        role="log"
        aria-label={label}
        aria-live="polite"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          stick.current = near;
          setAtBottom(near);
          if (near) setUnread(false);
        }}
        className="overflow-y-auto scroll-thin outline-none"
        style={{ height, maxHeight }}
      >
        <div ref={inner}>{children}</div>
      </div>
      {!atBottom && (
        <button
          type="button"
          onClick={() => toBottom()}
          className={cn(
            "absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full px-3 text-body-2 font-medium shadow-dropdown animate-fade-up",
            unread ? "bg-primary text-primary-fg" : "control text-fg",
          )}
        >
          <ArrowDown className="size-4" />
          {unread ? "Novas mensagens" : "Ir para o fim"}
        </button>
      )}
    </div>
  );
}
