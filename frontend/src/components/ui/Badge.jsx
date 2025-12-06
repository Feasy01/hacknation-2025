const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
