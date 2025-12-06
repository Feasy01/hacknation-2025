import { baseCard } from './styles';

const DataGridToolbar = ({ children }) => (
  <div className={`${baseCard} flex flex-wrap items-center gap-3 px-4 py-3`}>{children}</div>
);

export default DataGridToolbar;
