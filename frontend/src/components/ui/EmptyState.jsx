import { baseCard } from './styles';

const EmptyState = ({ icon, title, description, action }) => (
  <div className={`${baseCard} text-center`}>
    <div className="space-y-3 p-8">
      {icon}
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      {action}
    </div>
  </div>
);

export default EmptyState;
