"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchHostBookings,
  fetchMyBookings,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Booking } from "@/types/booking";
import { BOOKING_STATUS_LABELS } from "@/types/booking";
import { formatDayFr } from "@/lib/dates";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  urgent?: boolean;
  server?: boolean;
};

export default function NotificationsBell() {
  const { user, token, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user || !token || authLoading) return;
    setLoading(true);
    try {
      const notifs: NotifItem[] = [];
      let unreadCount = 0;

      try {
        const server = await fetchNotifications();
        server.data.forEach((n) => {
          notifs.push({
            id: n.id,
            title: n.title,
            body: n.body,
            href: n.link || "/",
            urgent: !n.readAt,
            server: true,
          });
          if (!n.readAt) unreadCount += 1;
        });
      } catch {
        /* ignore */
      }

      if (user.role === "client") {
        try {
          const res = await fetchMyBookings();
          (res.data as Booking[]).slice(0, 8).forEach((b) => {
            notifs.push({
              id: `${b.id}-${b.status}`,
              title:
                b.status === "confirmed"
                  ? "Réservation confirmée"
                  : b.status === "cancelled"
                    ? "Réservation annulée"
                    : BOOKING_STATUS_LABELS[b.status] || "Mise à jour",
              body: `${b.propertyName || "Bien"} · ${formatDayFr(b.checkIn)} → ${formatDayFr(b.checkOut)}`,
              href: "/compte/reservations",
              urgent: b.status === "confirmed" || b.status === "cancelled",
            });
          });
        } catch {
          /* ignore */
        }
      }

      if (user.role === "owner" || user.role === "agency") {
        try {
          const res = await fetchHostBookings();
          (res.data as Booking[]).slice(0, 8).forEach((b) => {
            notifs.push({
              id: `${b.id}-${b.status}`,
              title:
                b.status === "pending"
                  ? "Nouvelle demande de réservation"
                  : BOOKING_STATUS_LABELS[b.status],
              body: `${b.propertyName || "Bien"} · ${b.guestFirstName} ${b.guestLastName}`,
              href:
                user.role === "agency"
                  ? "/agence/reservations"
                  : "/proprietaire/reservations",
              urgent: b.status === "pending",
            });
          });
        } catch {
          /* ignore */
        }
      }

      setItems(notifs.slice(0, 30));
      setUnread(unreadCount);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, [user, token, authLoading]);

  useEffect(() => {
    if (authLoading || !user || !token) return;
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, [user, token, authLoading, load]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (authLoading || !user || !token) return null;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        await markAllNotificationsRead();
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, urgent: n.server ? false : n.urgent })));
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => void toggle()}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
        aria-label="Notifications"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[60] w-80 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--navy)]">
              Notifications
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="text-[10px] font-semibold uppercase text-[var(--muted)] hover:text-[var(--navy)]"
            >
              {loading ? "..." : "Actualiser"}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                Aucune notification pour le moment
              </p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => {
                    if (n.server) void markNotificationRead(n.id);
                    setOpen(false);
                  }}
                  className={`block border-b border-black/5 px-4 py-3 hover:bg-[var(--surface)] ${
                    n.urgent ? "bg-amber-50/60" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--navy)]">{n.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{n.body}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
