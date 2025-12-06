const Modal = ({ open, onClose, title, children, footer }) => (
  <div
    className={`${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 transition-opacity`}
  >
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button type="button" className="text-sm text-slate-500" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="p-5">{children}</div>
      {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
    </div>
  </div>
);

export default Modal;
