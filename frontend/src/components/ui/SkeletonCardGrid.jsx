import { baseCard } from './styles';

const SkeletonCardGrid = ({ count = 6 }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`${baseCard} h-32 animate-pulse bg-slate-200/70`} />
    ))}
  </div>
);

export default SkeletonCardGrid;
