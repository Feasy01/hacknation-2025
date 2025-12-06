import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (toast) => setToasts((prev) => [...prev, { id: crypto.randomUUID(), ...toast }]);
  const removeToast = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id));
  const ToastStack = () => (
    <div className="pointer-events-auto fixed bottom-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[240px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg ${
            toast.variant === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{toast.title}</p>
              {toast.description ? <p className="text-slate-600">{toast.description}</p> : null}
            </div>
            <button type="button" className="text-xs text-slate-500" onClick={() => removeToast(toast.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  return { addToast, removeToast, ToastStack };
};

const ToastProvider = ({ children }) => (
  <div className="fixed inset-0 z-50 pointer-events-none" aria-live="polite">
    {children}
  </div>
);

export default ToastProvider;
