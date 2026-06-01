import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function PaymentSandboxVisualizer() {
  const [provider, setProvider] = useState<string>('');
  const [txRef, setTxRef] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('KES');
  const [listingId, setListingId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Parse query params from current URL
    const params = new URLSearchParams(window.location.search);
    setProvider(params.get('provider') || 'mpesa');
    setTxRef(params.get('tx_ref') || `MOCK-TX-${Date.now()}`);
    setAmount(params.get('amount') || '50000');
    setCurrency(params.get('currency') || 'KES');
    setListingId(params.get('listingId') || '');
  }, []);

  const handleSimulate = async (success: boolean) => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/sandbox/trigger-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          txRef,
          success
        })
      });

      if (response.ok) {
        setStatus(success ? 'success' : 'failed');
        setFeedback(
          success
            ? '🎉 Simulation signal dispatched successfully! The express gateway verified the payload signature and activated the corresponding listing status in-memory.'
            : '❌ Simulated failure/cancellation dispatched. Webhook process was notified that payment failed.'
        );
      } else {
        throw new Error('Sandbox webhook responder returned non-200 state');
      }
    } catch (err: any) {
      setFeedback(`Error transmitting signal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-radial-gradient flex items-center justify-center p-4 selection:bg-brand-gold/30 text-white font-sans">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1920')] bg-cover opacity-5 pointer-events-none mix-blend-color-dodge" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/10 via-[#07090e]/60 to-[#07090e] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg glass-premium border border-white/5 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER SECTION */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-[10px] font-mono tracking-widest text-brand-gold uppercase">
            🛡️ NestList Authority Safe-sandbox
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white uppercase sm:leading-snug mt-1">
            Payment Simulator Gateway
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Validate client webhooks, Daraja STK outputs, and callback response status behaviors securely without actual monetary balances.
          </p>
        </div>

        {/* PAYMENT STATS CARD */}
        <div className="p-4 rounded-2xl bg-brand-card/45 border border-white/5 space-y-3 font-mono text-[11px] text-gray-300">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-gray-500 uppercase text-[9px]">Provider Class</span>
            <span className="text-brand-gold font-bold uppercase">{provider} gateway</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 uppercase text-[9px]">Settlement Amount</span>
            <span className="text-white font-bold">{currency} {parseFloat(amount).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 uppercase text-[9px]">Internal Tx Reference</span>
            <span className="text-brand-blue font-bold truncate max-w-[200px] select-all">{txRef}</span>
          </div>

          {listingId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 uppercase text-[9px]">Target Listing ID</span>
              <span className="text-emerald-400 truncate max-w-[200px] select-all">{listingId}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-gray-500 uppercase text-[9px]">Simulation Status</span>
            {status === 'pending' && (
              <span className="text-amber-400 font-bold animate-pulse uppercase">Awaiting webhook simulation</span>
            )}
            {status === 'success' && (
              <span className="text-emerald-400 font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>
            )}
            {status === 'failed' && (
              <span className="text-red-400 font-bold uppercase flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Discarded</span>
            )}
          </div>
        </div>

        {/* FEEDBACK LOG PANEL */}
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border text-[11px] leading-relaxed relative ${
              status === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-300' 
                : status === 'failed'
                  ? 'bg-red-500/10 border-red-500/15 text-red-300'
                  : 'bg-brand-blue/10 border-brand-blue/15 text-brand-blue-light'
            }`}
          >
            {feedback}
          </motion.div>
        )}

        {/* ACTION CONTROLS */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleSimulate(true)}
            disabled={loading || status !== 'pending'}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Simulate Webhook Success Callback
          </button>

          <button
            onClick={() => handleSimulate(false)}
            disabled={loading || status !== 'pending'}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50 text-red-400 font-bold py-3 px-4 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Simulate Webhook Refusal / Error Callback
          </button>
        </div>

        {/* FOOTER TIPS */}
        <div className="border-t border-white/5 pt-4 text-center space-y-2">
          <p className="text-[10px] text-gray-500 leading-normal">
            Once you trigger a success simulation, the backend server will automatically upgrade the associated listing status back in the main interface from <span className="text-amber-400 font-mono">pending_payment</span> to <span className="text-emerald-400 font-mono">active</span>.
          </p>
          <button 
            onClick={() => window.close()} 
            className="inline-flex items-center gap-1.5 text-[10px] text-brand-blue hover:underline cursor-pointer"
          >
            Go back to main NestList tab <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
