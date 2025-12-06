import FormField from './FormField';

const RadioGroupField = ({ options = [], ...props }) => (
  <FormField {...props}>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name={props.name}
            value={option.value}
            checked={props.value === option.value}
            onChange={() => props.onChange?.(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  </FormField>
);

export default RadioGroupField;
