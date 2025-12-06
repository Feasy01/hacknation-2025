import Modal from './Modal';

const CommandPalette = ({ open, onClose, commands = [], onRun }) => (
  <Modal open={open} onClose={onClose} title="Command Palette" footer={null}>
    <div className="space-y-2">
      <input
        placeholder="Search commands"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        onChange={(event) => onRun?.(event.target.value)}
      />
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {commands.map((command) => (
          <button
            key={command.id}
            type="button"
            onClick={() => {
              command.onSelect?.();
              onClose?.();
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-slate-100"
          >
            <span className="font-medium">{command.label}</span>
            <span className="text-xs text-slate-500">{command.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  </Modal>
);

export default CommandPalette;
