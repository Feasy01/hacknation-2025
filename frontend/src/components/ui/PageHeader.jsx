const PageHeader = ({ title, subtitle, breadcrumbs, primaryAction, secondaryAction }) => (
  <div className="space-y-4">
    {breadcrumbs}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  </div>
);

export default PageHeader;
