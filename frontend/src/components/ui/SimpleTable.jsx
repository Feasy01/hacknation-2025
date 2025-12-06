import { baseCard } from './styles';

const SimpleTable = ({ columns = [], data = [] }) => (
  <div className={`${baseCard} overflow-hidden`}>
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {data.map((row, rowIndex) => (
          <tr key={row.id || rowIndex}>
            {columns.map((col) => (
              <td key={col.key} className="px-4 py-3 text-sm text-slate-800">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SimpleTable;
