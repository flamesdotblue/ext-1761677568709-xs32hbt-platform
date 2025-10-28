import Spline from '@splinetool/react-spline';
import { CreditCard } from 'lucide-react';

export default function HeroCover() {
  return (
    <section className="relative w-full" style={{ height: '60vh' }}>
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/8nsoLg1te84JZcE9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white pointer-events-none" />
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-slate-200 text-slate-700 text-sm mb-4">
            <CreditCard className="w-4 h-4" />
            <span>Fintech-grade invoicing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Create, manage, and track invoices with ease</h1>
          <p className="mt-4 text-slate-600 text-lg">A minimalist, modern invoicing tool inspired by TallyPrime — built for freelancers, agencies, and small businesses.</p>
          <div className="mt-8 flex items-center gap-3">
            <a href="#builder" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition">Create Invoice</a>
            <a href="#list" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-slate-900 font-medium border border-slate-200 hover:bg-slate-50 transition">View Invoices</a>
          </div>
        </div>
      </div>
    </section>
  );
}
