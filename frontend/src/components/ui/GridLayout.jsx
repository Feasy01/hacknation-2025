const GridLayout = ({ columns = 1, gap = 24, children }) => (
  <div
    className="grid"
    style={{
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    }}
  >
    {children}
  </div>
);

export default GridLayout;
