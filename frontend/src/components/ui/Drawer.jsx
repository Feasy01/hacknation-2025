const Drawer = ({ open, onClose, title, children, side = 'right', width = '400px' }) => (
  <div className={`${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-50 flex transition-opacity`}>
    <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
    <div
      className={`relative ml-auto flex h-full flex-col bg-white shadow-2xl ${
        side === 'left' ? 'ml-0 mr-auto' : ''
      }`}
      style={{ width }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <button type="button" className="text-sm text-slate-500" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  </div>
);

export default Drawer;
