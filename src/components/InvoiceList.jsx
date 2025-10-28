import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';

function formatCurrency(n) {
  return Number(n || 0).toFixed(2);
}

export default function InvoiceList({ invoices, selectedId, onSelect, onDelete }) {
  const sorted = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices]);

  return (
    <div id="list" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Invoices</h3>
        <span className="text-xs text-slate-500">{sorted.length} total</span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">No invoices yet. Create your first one to see it here.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {sorted.map((inv) => {
            const subtotal = inv.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
            const discountVal = Math.min(Number(inv.discount || 0), subtotal);
            const taxedBase = Math.max(subtotal - discountVal, 0);
            const tax = (Number(inv.taxRate || 0) / 100) * taxedBase;
            const total = taxedBase + tax;
            const active = selectedId === inv.id;
            return (
              <li key={inv.id} className={`py-3 flex items-center gap-3 ${active ? 'bg-slate-50 rounded-xl px-3' : ''}`}>
                <button onClick={() => onSelect(inv.id)} className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{inv.client.name || 'Untitled Client'}</div>
                      <div className="text-xs text-slate-500">{inv.id} • {inv.date} • Status: {inv.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(total)}</div>
                      <div className="text-xs text-slate-500">Due {inv.dueDate}</div>
                    </div>
                  </div>
                </button>
                <button onClick={() => onDelete(inv.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
