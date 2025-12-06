import { useState } from 'react';

const ContextMenu = ({ trigger, items = [] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <div
        onContextMenu={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        {trigger}
      </div>
      {open ? (
        <div className="absolute z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-slate-100"
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ContextMenu;
