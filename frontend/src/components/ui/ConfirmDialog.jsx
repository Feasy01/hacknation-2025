import Modal from './Modal';

const ConfirmDialog = ({ open, title, description, onCancel, onConfirm, confirmLabel = 'Confirm' }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    footer={
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    }
  >
    {description ? <p className="text-sm text-slate-600">{description}</p> : null}
  </Modal>
);

export default ConfirmDialog;
