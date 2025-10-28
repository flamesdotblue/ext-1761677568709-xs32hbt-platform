import { useMemo } from 'react';
import { DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export default function StatsSummary({ invoices }) {
  const stats = useMemo(() => {
    const count = invoices.length;
    let total = 0;
    let paid = 0;
    for (const inv of invoices) {
      const subtotal = inv.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
      const discountVal = Math.min(Number(inv.discount || 0), subtotal);
      const taxedBase = Math.max(subtotal - discountVal, 0);
      const tax = (Number(inv.taxRate || 0) / 100) * taxedBase;
      const sum = taxedBase + tax;
      total += sum;
      if (inv.status === 'Paid') paid += sum;
    }
    return { count, total, paid };
  }, [invoices]);

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Stat icon={FileText} label="Invoices" value={stats.count} />
      <Stat icon={DollarSign} label="Total Billed" value={stats.total.toFixed(2)} />
      <Stat icon={CheckCircle2} label="Paid" value={stats.paid.toFixed(2)} />
    </div>
  );
}
