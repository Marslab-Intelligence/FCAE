'use client';

import { useState } from 'react';
import {
  CreditCard, Plus, CheckCircle2, AlertCircle,
  ArrowUpRight, Lock, HelpCircle, ChevronRight, ChevronLeft, Sparkles,
  ShieldCheck, Info, Download, RefreshCw, Landmark
} from 'lucide-react';

interface Transaction {
  date: string;
  desc: string;
  amount: string;
  status: 'Success' | 'Pending' | 'Failed';
  refId: string;
}

interface CloudService {
  name: string;
  cost: string;
  status: 'Active' | 'Pending Dues' | 'Suspended';
  billingCycle: string;
  nextPaymentDate: string;
  autoPay: boolean;
}

export default function PaymentsPage() {
  // Onboarding Guided Tour State
  const [tourStep, setTourStep] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'methods' | 'pay' | 'monitor'>('monitor');

  // Interactive Payment Form State
  const [selectedService, setSelectedService] = useState('Assure (16/6) Plan — Monthly Subscription');
  const [paymentAmount, setPaymentAmount] = useState('76,700');
  const [cardNumber, setCardNumber] = useState('4821 9901 2341 8821');
  const [expiry, setExpiry] = useState('09/2028');
  const [cvv, setCvv] = useState('***');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic Transaction List State
  const [transactions, setTransactions] = useState<Transaction[]>([
    { date: 'Jul 1, 2026', desc: 'Assure (16/6) Plan — Monthly Subscription', amount: '₹76,700', status: 'Success', refId: 'TXN-99104-A' },
    { date: 'Jun 1, 2026', desc: 'Assure (16/6) Plan — Monthly Subscription', amount: '₹76,700', status: 'Success', refId: 'TXN-98211-B' },
    { date: 'May 1, 2026', desc: 'FinOps Optimization Add-On', amount: '₹17,700', status: 'Success', refId: 'TXN-97305-C' },
  ]);

  // Cloud Services Monitoring list
  const [services, setServices] = useState<CloudService[]>([
    { name: 'Assure Plan (16/6 Live Management)', cost: '₹76,700', status: 'Active', billingCycle: 'Monthly', nextPaymentDate: 'Aug 01, 2026', autoPay: true },
    { name: 'Aurora DB Read-Replica Cluster Add-on', cost: '₹17,700', status: 'Active', billingCycle: 'Monthly', nextPaymentDate: 'Aug 01, 2026', autoPay: true },
    { name: 'Corporate VPN Firewall Endpoint', cost: '₹8,500', status: 'Pending Dues', billingCycle: 'Monthly', nextPaymentDate: 'Jul 25, 2026', autoPay: false },
    { name: 'S3 Cold Tier Data Archival System', cost: '₹3,200', status: 'Active', billingCycle: 'Monthly', nextPaymentDate: 'Aug 01, 2026', autoPay: true },
  ]);

  // Handle manual payment submission
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Add paid transaction to logs
      const newTx: Transaction = {
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        desc: selectedService,
        amount: `₹${parseFloat(paymentAmount.replace(/,/g, '')).toLocaleString('en-IN')}`,
        status: 'Success',
        refId: `TXN-${Math.floor(10000 + Math.random() * 90000)}-D`
      };
      
      setTransactions([newTx, ...transactions]);

      // Resolve pending dues in service list if VPN was paid
      if (selectedService.includes('VPN') || selectedService.includes('Firewall')) {
        setServices(services.map(s => s.name.includes('VPN') ? { ...s, status: 'Active', autoPay: true } : s));
      }
    }, 2000);
  };

  const handleToggleAutoPay = (index: number) => {
    setServices(services.map((s, i) => i === index ? { ...s, autoPay: !s.autoPay } : s));
  };

  return (
    <div className="relative space-y-8 pb-16">
      
      {/* ── INTERACTIVE ONBOARDING GUIDE OVERLAY (SELF-DRIVEN TOUR) ── */}
      {tourStep !== null && (
        <div className="relative p-6 rounded-3xl border border-accent/30 bg-[#0e0e1a]/95 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-30">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setTourStep(null)}
              className="text-xs text-text-dim hover:text-text hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-all"
            >
              Skip Tutorial
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0 animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-3 pr-20">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/25 text-[10px] font-bold text-accent">GUIDED WALKTHROUGH</span>
                <span className="text-xs text-text-dim">Step {tourStep} of 4</span>
              </div>
              
              {tourStep === 1 && (
                <>
                  <h3 className="font-display font-bold text-lg text-text">Welcome to your Cloud Payments Suite 💳</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    This self-driven dashboard helps you monitor all active services, pay outstanding cloud invoices, and manage secure automated billing. Let&apos;s get you comfortable with how to manage it.
                  </p>
                </>
              )}

              {tourStep === 2 && (
                <>
                  <h3 className="font-display font-bold text-lg text-text">Service Health & Costs Monitor 📈</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Under the <strong>Services Monitor</strong> tab, you can view the active status of each infrastructure component (e.g. compute replicas, cold archival), check their monthly cost, and toggle the <strong>Auto-Billing</strong> switch to avoid manual payments.
                  </p>
                </>
              )}

              {tourStep === 3 && (
                <>
                  <h3 className="font-display font-bold text-lg text-text">How to Make a Manual Secure Payment 🔒</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    If auto-billing is disabled or you have outstanding dues (marked as <span className="text-amber-400 font-semibold">Pending Dues</span>), click the <strong>Make a Payment</strong> tab. Select your service, configure your card Details, and complete transaction directly using secure 256-bit encryption.
                  </p>
                </>
              )}

              {tourStep === 4 && (
                <>
                  <h3 className="font-display font-bold text-lg text-text">Tracking Transaction Invoices 🧾</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Every successful payment instantly adds a record with unique references to the <strong>Recent Transactions</strong> log below. You can download compliance/GST invoices immediately.
                  </p>
                </>
              )}

              <div className="flex items-center gap-3 pt-2">
                {tourStep > 1 && (
                  <button
                    onClick={() => setTourStep(tourStep - 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-text-muted hover:text-text hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (tourStep === 4) {
                      setTourStep(null);
                    } else {
                      setTourStep(tourStep + 1);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-glow transition-all"
                >
                  {tourStep === 4 ? 'Got it!' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title & Interactive Tutorial Help Trigger */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Payments & Cloud Services</h1>
          <p className="text-text-muted text-sm mt-1">Monitor service billing quotas, process payments, and access invoice logs.</p>
        </div>
        <button
          onClick={() => setTourStep(1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-all text-sm font-medium text-accent"
        >
          <HelpCircle className="w-4 h-4" /> Start Guided Walkthrough
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 gap-6">
        {([
          { id: 'monitor', label: 'Services Monitor' },
          { id: 'pay', label: 'Make a Payment' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'monitor' && tourStep === 1) setTourStep(2);
              if (tab.id === 'pay' && tourStep === 2) setTourStep(3);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT ── SERVICES MONITOR */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <div className="rounded-3xl glass-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-text">Cloud Infrastructure Services</h2>
                <p className="text-xs text-text-muted mt-0.5">Toggle auto-debit to automate subscription renewals</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Billing Currency: INR (₹)
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {services.map((service, index) => (
                <div key={index} className="p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-white/2 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-70">
                    <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                      service.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      service.status === 'Pending Dues' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {service.status === 'Active' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text text-base flex items-center gap-2">
                        {service.name}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          service.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {service.status}
                        </span>
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        Next Billing Date: <strong className="text-text">{service.nextPaymentDate}</strong> ({service.billingCycle})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-text">{service.cost}</p>
                      <p className="text-[10px] text-text-dim uppercase tracking-wider">Per Month</p>
                    </div>

                    <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-text-muted">Auto-Billing</span>
                        <p className="text-[10px] text-text-dim mt-0.5">{service.autoPay ? 'Card charged automatically' : 'Requires manual pay'}</p>
                      </div>
                      <button
                        onClick={() => handleToggleAutoPay(index)}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors relative duration-200 ${
                          service.autoPay ? 'bg-accent' : 'bg-white/10'
                        }`}
                        title="Toggle Auto Pay"
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                          service.autoPay ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {service.status === 'Pending Dues' && (
                      <button
                        onClick={() => {
                          setSelectedService(service.name);
                          setPaymentAmount(service.cost.replace('₹', ''));
                          setActiveTab('pay');
                          if (tourStep === 2) setTourStep(3);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all shrink-0"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT ── MAKE A PAYMENT FORM */}
      {activeTab === 'pay' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Payment Form Panel */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-text">Secure 256-Bit Gateway</h2>
                <p className="text-xs text-text-muted">Fill details below to authorize immediate payment</p>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-text">Payment Completed Successfully!</h3>
                  <p className="text-sm text-text-muted mt-1">Your transaction has been processed. An invoice has been updated in billing logs.</p>
                </div>
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setActiveTab('monitor');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold text-text transition-all"
                >
                  Return to Monitor
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                
                {/* Select Service */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Select Cloud Service to Pay</label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      const servObj = services.find(s => s.name.startsWith(e.target.value.split(' ')[0]));
                      if (servObj) setPaymentAmount(servObj.cost.replace('₹', ''));
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none transition-all"
                    required
                  >
                    {services.map((s, idx) => (
                      <option key={idx} value={s.name} className="bg-slate-950 text-text">
                        {s.name} ({s.cost})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount Box */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm text-text-muted font-bold">₹</span>
                      <input
                        type="text"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none font-semibold transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Card Reference Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Billing Code / Tax ID</label>
                    <input
                      type="text"
                      defaultValue="GSTIN-33AABCM8210P1Z"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Card Number Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Credit Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 w-4.5 h-4.5 text-text-muted" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4821 9901 2341 8821"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Expiration Date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none font-mono transition-all"
                      required
                    />
                  </div>

                  {/* Security CVV */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Security CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="***"
                      maxLength={3}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-text focus:border-accent outline-none font-mono transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 hover:from-accent-glow hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing Payment Gateway...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Authorize Secure Payment of ₹{parseFloat(paymentAmount.replace(/,/g, '') || '0').toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Secure Payment Instruction Panel */}
          <div className="p-6 rounded-3xl glass-card space-y-6 self-start">
            <h3 className="font-display font-semibold text-base text-text flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-accent" /> Payment Policy Details
            </h3>
            <ul className="text-xs text-text-muted space-y-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span>We support all major international Credit/Debit cards & Corporate bank accounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span>To comply with Indian tax regulations, GSTIN details are collected and reported automatically on tax invoices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span>Refunds are calculated pro-rata on compute termination requests and credited directly to the card.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* TAB CONTENT ── PAYMENT METHODS */}
      {activeTab === 'methods' && (
        <div className="p-6 rounded-3xl glass-card space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-text">Linked Accounts & Cards</h2>
              <p className="text-xs text-text-muted mt-0.5">Manage credit cards and corporate banking setups</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-semibold text-text">
              <Plus className="w-3.5 h-3.5" /> Add Payment Method
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Visa Card */}
            <div className="p-5 rounded-2xl bg-linear-to-r from-purple-900/40 via-purple-600/20 to-accent/20 border border-purple-500/30 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-accent">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-text text-base">Corporate Visa ending in 4821</p>
                  <p className="text-xs text-text-muted mt-0.5">Expires 09/2028</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    DEFAULT BILLING CARD
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Transfer Setup */}
            <div className="p-5 rounded-2xl bg-white/3 border border-white/8 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-text-dim">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-text text-base">State Bank Corporate ECS</p>
                  <p className="text-xs text-text-muted mt-0.5">Account ending in 7701</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/5 text-text-dim text-[10px] font-bold border border-white/10">
                    BACKUP MANDATE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION HISTORY LOG ── */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-text">Recent Transactions & Invoices</h2>
            <p className="text-xs text-text-muted mt-0.5">Audit transaction hashes and download compliance receipts</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-text-dim hover:text-text transition-all">
            View Full billing archive <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-white/8">
          {transactions.map((tx, idx) => (
            <div key={idx} className="py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/2 transition-colors">
              <div>
                <p className="font-semibold text-sm text-text">{tx.desc}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-dim">{tx.date}</span>
                  <span className="text-[10px] font-mono text-accent">{tx.refId}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-display font-bold text-sm text-text">{tx.amount}</p>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SUCCESSFUL
                  </p>
                </div>
                <button
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-text hover:bg-white/8 transition-all"
                  title="Download GST Invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
