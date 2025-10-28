import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Printer } from 'lucide-react';

const emptyInvoice = () => ({
  id: `inv_${Date.now()}`,
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  status: 'Draft',
  client: { name: '', email: '', address: '' },
  items: [{ id: 1, description: '', qty: 1, price: 0 }],
  taxRate: 0,
  discount: 0,
  notes: '',
});

export default function InvoiceBuilder({ initialInvoice, onSave }) {
  const [invoice, setInvoice] = useState(initialInvoice || emptyInvoice());

  useEffect(() => {
    if (initialInvoice) setInvoice(initialInvoice);
  }, [initialInvoice]);

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
    const discountVal = Math.min(Number(invoice.discount || 0), subtotal);
    const taxedBase = Math.max(subtotal - discountVal, 0);
    const tax = (Number(invoice.taxRate || 0) / 100) * taxedBase;
    const total = taxedBase + tax;
    return { subtotal, discountVal, tax, total };
  }, [invoice]);

  const setClient = (k, v) => setInvoice((p) => ({ ...p, client: { ...p.client, [k]: v } }));
  const setField = (k, v) => setInvoice((p) => ({ ...p, [k]: v }));
  const setItem = (id, k, v) => setInvoice((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));
  const addItem = () => setInvoice((p) => ({ ...p, items: [...p.items, { id: Date.now(), description: '', qty: 1, price: 0 }] }));
  const removeItem = (id) => setInvoice((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));

  const handleSave = () => {
    const sanitized = {
      ...invoice,
      client: {
        name: invoice.client.name.trim(),
        email: invoice.client.email.trim(),
        address: invoice.client.address.trim(),
      },
      items: invoice.items.filter((it) => it.description.trim() !== '' || Number(it.qty) > 0 || Number(it.price) > 0),
      status: 'Saved',
    };
    onSave(sanitized);
  };

  const printInvoice = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = invoice.items
      .map(
        (it) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${it.description}</td>
            <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;">${it.qty}</td>
            <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;">${Number(it.price).toFixed(2)}</td>
            <td style="padding:8px;text-align:right;border-bottom:1px solid #e5e7eb;">${(Number(it.qty) * Number(it.price)).toFixed(2)}</td>
          </tr>`
      )
      .join('');
    const html = `
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;color:#0f172a;">
          <div style="max-width:800px;margin:40px auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
              <div>
                <div style="font-size:24px;font-weight:700;">Invoice</div>
                <div style="color:#334155;margin-top:4px;">ID: ${invoice.id}</div>
              </div>
              <div style="text-align:right;color:#334155;">
                <div>Date: ${invoice.date}</div>
                <div>Due: ${invoice.dueDate}</div>
              </div>
            </div>
            <div style="display:flex;gap:24px;margin-bottom:24px;">
              <div style="flex:1">
                <div style="font-weight:600;margin-bottom:4px;">Bill To</div>
                <div>${invoice.client.name || '-'}</div>
                <div>${invoice.client.email || ''}</div>
                <div style="white-space:pre-wrap">${invoice.client.address || ''}</div>
              </div>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;">Description</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid #e5e7eb;">Qty</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid #e5e7eb;">Price</th>
                  <th style="text-align:right;padding:8px;border-bottom:1px solid #e5e7eb;">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div style="margin-top:16px;display:flex;justify-content:flex-end;">
              <div style="min-width:260px;color:#334155;">
                <div style="display:flex;justify-content:space-between;padding:6px 0;">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;">
                  <span>Discount</span>
                  <span>-${totals.discountVal.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;">
                  <span>Tax (${Number(invoice.taxRate)}%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:700;border-top:1px solid #e5e7eb;margin-top:8px;">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            ${invoice.notes ? `<div style="margin-top:16px;color:#334155;white-space:pre-wrap;">Notes: ${invoice.notes}</div>` : ''}
          </div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>`;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div id="builder">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Invoice Builder</h2>
          <p className="text-slate-500 text-sm">Create a new invoice or edit a selected one.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={printInvoice} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Invoice ID</label>
            <input value={invoice.id} onChange={(e) => setField('id', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input type="date" value={invoice.date} onChange={(e) => setField('date', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input type="date" value={invoice.dueDate} onChange={(e) => setField('dueDate', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Client Name</label>
            <input value={invoice.client.name} onChange={(e) => setClient('name', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Client Email</label>
              <input type="email" value={invoice.client.email} onChange={(e) => setClient('email', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select value={invoice.status} onChange={(e) => setField('status', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                <option>Draft</option>
                <option>Saved</option>
                <option>Sent</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Client Address</label>
            <textarea rows={3} value={invoice.client.address} onChange={(e) => setClient('address', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition text-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-t border-slate-200">
                  <td className="py-2 pr-2">
                    <input
                      value={it.description}
                      onChange={(e) => setItem(it.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={it.qty}
                      onChange={(e) => setItem(it.id, 'qty', Number(e.target.value))}
                      className="w-24 text-right rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.price}
                      onChange={(e) => setItem(it.id, 'price', Number(e.target.value))}
                      className="w-28 text-right rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right align-middle">
                    {(Number(it.qty || 0) * Number(it.price || 0)).toFixed(2)}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Notes</label>
          <textarea rows={4} value={invoice.notes} onChange={(e) => setField('notes', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="Payment terms, bank details, or additional information" />
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 h-fit">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Discount</span>
              <input type="number" min={0} step="0.01" value={invoice.discount} onChange={(e) => setField('discount', Number(e.target.value))} className="w-28 text-right rounded-lg border border-slate-200 px-2 py-1.5 bg-white" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Tax %</span>
              <input type="number" min={0} step="0.01" value={invoice.taxRate} onChange={(e) => setField('taxRate', Number(e.target.value))} className="w-28 text-right rounded-lg border border-slate-200 px-2 py-1.5 bg-white" />
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
