import { baseCard } from './styles';

const TabbedLayout = ({ tabs = [], activeKey, onChange }) => (
  <div className={`${baseCard} p-4`}>
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            tab.key === activeKey ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div className="pt-4">{tabs.find((tab) => tab.key === activeKey)?.content}</div>
  </div>
);

export default TabbedLayout;
