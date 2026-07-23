"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createAgencyExpense,
  fetchAgencyAccounting,
  fetchAgencyExpenses,
  fetchAgencyStats,
} from "@/lib/api";
import type { AccountingSummary, AgencyExpense } from "@/types/agency-crm";

export default function AgencyAccountingPage() {
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [expenses, setExpenses] = useState<AgencyExpense[]>([]);
  const [series, setSeries] = useState<{ label: string; revenue: number }[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("other");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [acc, exp, stats] = await Promise.all([
        fetchAgencyAccounting(),
        fetchAgencyExpenses(),
        fetchAgencyStats(),
      ]);
      setSummary(acc.data);
      setExpenses(exp.data);
      setSeries(stats.data.revenueSeries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const exportCsv = () => {
    const rows = [
      ["type", "label", "category", "amount", "date"],
      ...expenses.map((e) => ["expense", e.label, e.category, String(e.amount), e.expenseDate]),
    ];
    if (summary) {
      rows.push(["summary", "revenue", "", String(summary.revenue), ""]);
      rows.push(["summary", "expenses", "", String(summary.expenses), ""]);
      rows.push(["summary", "profit", "", String(summary.profit), ""]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axxam-comptabilite-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Comptabilité</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Revenus, dépenses, commissions, bénéfices</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="axxam-btn-dark">
            Export Excel/CSV
          </button>
          <button type="button" onClick={() => window.print()} className="axxam-btn-primary">
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Revenus", summary.revenue],
            ["Dépenses", summary.expenses],
            ["Commissions", summary.commissions],
            ["Bénéfices", summary.profit],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">
                {Number(value).toLocaleString("fr-DZ")} DA
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-lg font-semibold text-[var(--navy)]">Évolution des revenus</h2>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString("fr-DZ")} DA`} />
              <Area type="monotone" dataKey="revenue" stroke="#a65126" fill="#a6512633" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-[var(--sand)] bg-white p-4 sm:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await createAgencyExpense({ label, amount, category });
          setLabel("");
          setAmount(0);
          await load();
        }}
      >
        <input
          className="axxam-input sm:col-span-2"
          placeholder="Libellé dépense"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <select className="axxam-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="commission">Commission</option>
          <option value="tax">Taxes</option>
          <option value="maintenance">Maintenance</option>
          <option value="marketing">Marketing</option>
          <option value="salary">Salaire</option>
          <option value="other">Autre</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            className="axxam-input flex-1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <button type="submit" className="axxam-btn-primary shrink-0">
            +
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[var(--sand)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface)] text-[11px] uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-[var(--sand)]/60">
                <td className="px-4 py-3">{e.expenseDate}</td>
                <td className="px-4 py-3 font-medium text-[var(--navy)]">{e.label}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{e.category}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {e.amount.toLocaleString("fr-DZ")} DA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
