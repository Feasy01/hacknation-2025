import FormField from './FormField';

const SwitchField = (props) => (
  <FormField {...props}>
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        props.checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
      onClick={() => props.onChange?.(!props.checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          props.checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </FormField>
);

export default SwitchField;
