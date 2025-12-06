import FormField from './FormField';

const CheckboxField = (props) => (
  <FormField {...props}>
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
        checked={props.checked || false}
        onChange={(event) => props.onChange?.(event.target.checked)}
      />
      {props.checkboxLabel}
    </label>
  </FormField>
);

export default CheckboxField;
