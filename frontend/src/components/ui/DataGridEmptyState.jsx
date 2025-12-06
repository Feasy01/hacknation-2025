import { baseCard } from './styles';

const DataGridEmptyState = ({ title = 'No data', description }) => (
  <div className={`${baseCard} text-center text-sm text-slate-600`}>
    <div className="p-6">
      <p className="font-semibold text-slate-900">{title}</p>
      {description ? <p className="text-slate-600">{description}</p> : null}
    </div>
  </div>
);

export default DataGridEmptyState;
