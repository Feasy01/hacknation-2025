import { baseCard } from './styles';

const PageSection = ({ title, description, actions, children }) => (
  <section className={`${baseCard} p-6`}>
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

export default PageSection;
