import { useEffect } from 'react';

const Page = ({ title, seoTitle, maxWidth = '64rem', children }) => {
  useEffect(() => {
    if (seoTitle || title) {
      document.title = seoTitle || title;
    }
  }, [seoTitle, title]);

  return (
    <div
      className="mx-auto w-full space-y-6 px-4 py-8 lg:px-0"
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
};

export default Page;
