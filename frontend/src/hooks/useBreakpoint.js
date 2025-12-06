import useMediaQuery from './useMediaQuery';

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
};

const useBreakpoint = (key = 'md') => {
  const query = breakpoints[key] || breakpoints.md;
  return useMediaQuery(query);
};

export default useBreakpoint;
