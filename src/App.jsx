import { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import InvoiceBuilder from './components/InvoiceBuilder';
import InvoiceList from './components/InvoiceList';
import StatsSummary from './components/StatsSummary';

const STORAGE_KEY = 'invoices';

export default function App() {
  const [invoices, setInvoices] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  }, [invoices]);

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === selectedId) || null,
    [invoices, selectedId]
  );

  const upsertInvoice = (invoice) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === invoice.id);
      if (exists) return prev.map((i) => (i.id === invoice.id ? invoice : i));
      return [invoice, ...prev];
    });
    setSelectedId(invoice.id);
  };

  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeroCover />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <InvoiceBuilder
                key={selectedInvoice ? selectedInvoice.id : 'new'}
                initialInvoice={selectedInvoice}
                onSave={upsertInvoice}
              />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <StatsSummary invoices={invoices} />
            <InvoiceList
              invoices={invoices}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteInvoice}
            />
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-slate-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Finch Invoice. All rights reserved.</p>
          <p>Built for modern invoicing.</p>
        </div>
      </footer>
    </div>
  );
}
