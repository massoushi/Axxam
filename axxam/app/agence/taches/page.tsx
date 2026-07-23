"use client";

import { useEffect, useState } from "react";
import {
  createAgencyAppointment,
  createAgencyTask,
  deleteAgencyAppointment,
  deleteAgencyTask,
  fetchAgencyAppointments,
  fetchAgencyTasks,
  updateAgencyTask,
} from "@/lib/api";
import type { AgencyAppointment, AgencyTask } from "@/types/agency-crm";

export default function AgencyTasksPage() {
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [appts, setAppts] = useState<AgencyAppointment[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [apptTitle, setApptTitle] = useState("");
  const [apptStart, setApptStart] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [t, a] = await Promise.all([fetchAgencyTasks(), fetchAgencyAppointments()]);
      setTasks(t.data);
      setAppts(a.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Tâches & Agenda</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Visites, signatures, relances</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Tâches</h2>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              await createAgencyTask({ title: taskTitle, dueDate: taskDue || null });
              setTaskTitle("");
              setTaskDue("");
              await load();
            }}
          >
            <input
              className="axxam-input flex-1"
              placeholder="Appeler le client..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <input
              type="date"
              className="axxam-input"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
            <button type="submit" className="axxam-btn-primary">
              Ajouter
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--sand)]/70 px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={t.status === "done"}
                  onChange={async () => {
                    await updateAgencyTask(t.id, {
                      status: t.status === "done" ? "todo" : "done",
                    });
                    await load();
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.status === "done" ? "line-through text-[var(--muted)]" : "text-[var(--navy)]"}`}>
                    {t.title}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{t.dueDate || "Sans date"} · {t.priority}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={async () => {
                    await deleteAgencyTask(t.id);
                    await load();
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Rendez-vous</h2>
          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await createAgencyAppointment({
                title: apptTitle,
                kind: "visit",
                startAt: apptStart ? new Date(apptStart).toISOString() : new Date().toISOString(),
              });
              setApptTitle("");
              setApptStart("");
              await load();
            }}
          >
            <input
              className="axxam-input"
              placeholder="Visite appartement F4..."
              value={apptTitle}
              onChange={(e) => setApptTitle(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="axxam-input"
              value={apptStart}
              onChange={(e) => setApptStart(e.target.value)}
              required
            />
            <button type="submit" className="axxam-btn-primary self-start">
              Planifier
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {appts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--sand)]/70 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--navy)]">{a.title}</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {new Date(a.startAt).toLocaleString("fr-FR")} · {a.kind}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={async () => {
                    await deleteAgencyAppointment(a.id);
                    await load();
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
