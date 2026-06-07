export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

type ToastListener = (toast: ToastInfo) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success(message: string) {
    this.show(message, 'success');
  },
  error(message: string) {
    this.show(message, 'error');
  },
  info(message: string) {
    this.show(message, 'info');
  },
  warning(message: string) {
    this.show(message, 'warning');
  },
  show(message: string, type: ToastInfo['type'] = 'info') {
    const info: ToastInfo = { id: `toast-${Date.now()}-${Math.random()}`, message, type };
    listeners.forEach(listen => listen(info));
  },
  subscribe(listen: ToastListener) {
    listeners.add(listen);
    return () => {
      listeners.delete(listen);
    };
  }
};

// Also expose as a global handler for easy legacy migration
if (typeof window !== 'undefined') {
  (window as any).showToast = (msg: string, type: ToastInfo['type'] = 'info') => {
    toast.show(msg, type);
  };
}
