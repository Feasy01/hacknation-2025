const FormActions = ({ onCancel, submitLabel = 'Save', cancelLabel = 'Cancel' }) => (
  <div className="flex items-center justify-end gap-3 pt-2">
    <button
      type="button"
      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      onClick={onCancel}
    >
      {cancelLabel}
    </button>
    <button
      type="submit"
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
    >
      {submitLabel}
    </button>
  </div>
);

export default FormActions;
