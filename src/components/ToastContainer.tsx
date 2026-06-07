import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, ToastInfo } from '../utils/toast';
import { CheckCircle, AlertCircle, Info, Flame, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  useEffect(() => {
    const unsub = toast.subscribe((newToast) => {
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4500);
    });

    return unsub;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((item) => {
          let bgColor = 'bg-slate-900/95 border-white/10';
          let iconColor = 'text-blue-400';
          let StatusIcon = Info;

          if (item.type === 'success') {
            bgColor = 'bg-emerald-950/95 border-emerald-500/20';
            iconColor = 'text-emerald-400';
            StatusIcon = CheckCircle;
          } else if (item.type === 'error') {
            bgColor = 'bg-red-950/95 border-red-500/20';
            iconColor = 'text-red-400';
            StatusIcon = AlertCircle;
          } else if (item.type === 'warning') {
            bgColor = 'bg-amber-950/95 border-amber-500/20';
            iconColor = 'text-amber-400';
            StatusIcon = Flame;
          }

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl ${bgColor} text-white`}
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
              }}
            >
              <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed pr-2">
                {item.message}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-white transition-colors shrink-0 p-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
