const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="h-12 rounded-lg bg-slate-200/70" />
    ))}
  </div>
);

export default SkeletonList;
