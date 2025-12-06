const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70">
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-800">{message}</p>
    </div>
  </div>
);

export default LoadingOverlay;
