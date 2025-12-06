import FormField from './FormField';
import { inputClasses } from './styles';

const MultiSelectField = (props) => (
  <FormField {...props}>
    <div className={`${inputClasses} flex flex-wrap gap-1`}>
      {(props.options || []).map((option) => {
        const selected = props.value?.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
            onClick={() => {
              const current = new Set(props.value || []);
              current.has(option.value) ? current.delete(option.value) : current.add(option.value);
              props.onChange?.(Array.from(current));
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </FormField>
);

export default MultiSelectField;
