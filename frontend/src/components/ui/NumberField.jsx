import FormField from './FormField';
import { inputClasses } from './styles';

const NumberField = (props) => (
  <FormField {...props}>
    <input
      type="number"
      className={inputClasses}
      value={props.value || ''}
      onChange={(event) => props.onChange?.(event.target.valueAsNumber)}
      min={props.min}
      max={props.max}
      step={props.step}
    />
  </FormField>
);

export default NumberField;
