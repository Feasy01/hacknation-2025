import FormField from './FormField';
import { inputClasses } from './styles';

const SelectField = (props) => (
  <FormField {...props}>
    <select
      className={inputClasses}
      value={props.value || ''}
      onChange={(event) => props.onChange?.(event.target.value)}
    >
      {(props.options || []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
);

export default SelectField;
