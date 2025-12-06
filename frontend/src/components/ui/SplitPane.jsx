import { useRef, useState } from 'react';

const SplitPane = ({ left, right, direction = 'horizontal', min = 200, max = 600 }) => {
  const [size, setSize] = useState(280);
  const dragging = useRef(false);

  const handleMove = (event) => {
    if (!dragging.current) return;
    const delta = direction === 'horizontal' ? event.movementX : event.movementY;
    setSize((current) => Math.min(Math.max(current + delta, min), max));
  };

  return (
    <div
      className={`flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        direction === 'horizontal' ? 'flex-row' : 'flex-col'
      }`}
      onMouseMove={handleMove}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
    >
      <div
        className={direction === 'horizontal' ? 'w-[var(--pane-size)]' : 'h-[var(--pane-size)]'}
        style={{ ['--pane-size']: `${size}px`, minWidth: min, minHeight: min }}
      >
        {left}
      </div>
      <div
        className={`flex cursor-col-resize items-center justify-center bg-slate-100 ${
          direction === 'horizontal' ? 'w-[6px]' : 'h-[6px] cursor-row-resize'
        }`}
        onMouseDown={() => (dragging.current = true)}
        role="separator"
        aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      />
      <div className="flex-1">{right}</div>
    </div>
  );
};

export default SplitPane;
