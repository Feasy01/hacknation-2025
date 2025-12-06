const FormField = ({ label, description, error, required, children }) => (
  <label className="block space-y-1 text-sm font-medium text-slate-700">
    <div className="flex items-center gap-1">
      <span>{label}</span>
      {required ? <span className="text-red-500">*</span> : null}
    </div>
    {description ? <p className="text-xs font-normal text-slate-500">{description}</p> : null}
    <div className="space-y-1">
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  </label>
);

export default FormField;
