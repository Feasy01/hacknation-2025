const Alert = ({ title, description, variant = 'info', actions }) => {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${variants[variant] || variants.info}`}>
      <div>
        <p className="font-semibold">{title}</p>
        {description ? <p className="text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
    </div>
  );
};

export default Alert;
