import { useCallback } from 'react';

const useQueryParams = () => {
  const setParams = useCallback((params) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState({}, '', url.toString());
  }, []);

  return { setParams };
};

export default useQueryParams;
