import FormField from './FormField';
import { inputClasses } from './styles';

const TextField = (props) => (
  <FormField {...props}>
    <input
      type="text"
      className={inputClasses}
      value={props.value || ''}
      onChange={(event) => props.onChange?.(event.target.value)}
      placeholder={props.placeholder}
    />
  </FormField>
);

export default TextField;
