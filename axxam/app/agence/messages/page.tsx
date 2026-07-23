"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchConversations, fetchMessages, sendMessage } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-storage";
import type { Conversation, Message } from "@/types/messaging";

function AgencyMessagesInner() {
  const params = useSearchParams();
  const initialC = params.get("c");
  const user = getStoredUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialC);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchConversations();
        if (cancelled) return;
        setConversations(res.data);
        setActiveId((prev) => prev || res.data[0]?.id || null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchMessages(activeId);
        if (!cancelled) setMessages(res.data);
      } catch {
        /* ignore */
      }
    };
    void load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [activeId]);

  const active = conversations.find((c) => c.id === activeId);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    setSending(true);
    try {
      const res = await sendMessage(activeId, text.trim());
      setMessages((prev) => [...prev, res.data]);
      setText("");
      const list = await fetchConversations();
      setConversations(list.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Messages</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Agence ↔ clients & propriétaires</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Chargement…</p>
      ) : (
        <div className="grid min-h-[480px] overflow-hidden rounded-2xl border border-[var(--sand)] bg-white shadow-[var(--shadow-soft)] lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-[var(--sand)] lg:border-b-0 lg:border-r">
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-[var(--muted)]">Aucune conversation.</p>
            )}
            {conversations.map((c) => {
              const title =
                user?.id === c.clientId ? c.hostName || "Hôte" : c.clientName || "Client";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`block w-full border-b border-[var(--sand)]/70 px-4 py-3 text-left ${
                    activeId === c.id ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--navy)]">{title}</p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {c.propertyName || "Bien"} · {c.lastMessage || "—"}
                  </p>
                </button>
              );
            })}
          </aside>

          <div className="flex flex-col">
            {active ? (
              <>
                <div className="border-b border-[var(--sand)] px-4 py-3">
                  <p className="font-semibold text-[var(--navy)]">
                    {user?.id === active.clientId ? active.hostName : active.clientName}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{active.propertyName}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m) => {
                    const mine = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            mine
                              ? "bg-[var(--navy)] text-white"
                              : "bg-[var(--surface)] text-[var(--ink)]"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={onSend} className="flex gap-2 border-t border-[var(--sand)] p-3">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Écrire un message…"
                    className="axxam-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="rounded-xl bg-[var(--gold)] px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </form>
              </>
            ) : (
              <p className="m-auto text-sm text-[var(--muted)]">Sélectionnez une conversation</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgenceMessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Chargement…</p>}>
      <AgencyMessagesInner />
    </Suspense>
  );
}
