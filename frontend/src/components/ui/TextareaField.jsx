import FormField from './FormField';
import { inputClasses } from './styles';

const TextareaField = (props) => (
  <FormField {...props}>
    <textarea
      className={`${inputClasses} min-h-[120px]`}
      value={props.value || ''}
      onChange={(event) => props.onChange?.(event.target.value)}
      placeholder={props.placeholder}
    />
  </FormField>
);

export default TextareaField;
