import FormField from './FormField';
import { inputClasses } from './styles';

const DatePickerField = (props) => (
  <FormField {...props}>
    <input
      type="date"
      className={inputClasses}
      value={props.value || ''}
      onChange={(event) => props.onChange?.(event.target.value)}
    />
  </FormField>
);

export default DatePickerField;
