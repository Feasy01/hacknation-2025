import { baseCard } from './styles';

const FormSection = ({ title, description, children }) => (
  <div className={`${baseCard} space-y-3 p-5`}>
    <div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default FormSection;
