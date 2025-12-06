import useDisclosure from '~/hooks/useDisclosure';

const PopoverMenu = ({ trigger, items = [] }) => {
  const { isOpen, toggle, close } = useDisclosure(false);
  return (
    <div className="relative inline-flex">
      <div onClick={toggle}>{trigger}</div>
      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              onClick={() => {
                item.onSelect?.();
                close();
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

export default PopoverMenu;
