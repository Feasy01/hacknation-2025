import { baseCard } from './styles';

const Card = ({ title, description, children, actions }) => (
  <div className={`${baseCard} p-5`}>
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions}
    </div>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

export default Card;
