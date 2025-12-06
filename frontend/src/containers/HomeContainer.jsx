import { useQuery } from '@tanstack/react-query';
import Hero from '~/components/Hero';
import FeatureCard from '~/components/FeatureCard';
import { fetchHealth } from '~/utils/apiClient';

const features = [
  {
    title: 'Frontend ready',
    description: 'React + Tailwind + shadcn-ui scaffolding to build components quickly.',
    icon: '⚡️',
  },
  {
    title: 'Backend friendly',
    description: 'FastAPI project layout with routes, services, and database modules.',
    icon: '🛠️',
  },
  {
    title: 'Data fetching',
    description: 'React Query is pre-wired so you can hydrate UIs with API data fast.',
    icon: '📡',
  },
];

const HomeContainer = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-12">
        <Hero
          title="Monolith bootstrap"
          subtitle="A starter monorepo with a React front-end and FastAPI back-end so you can focus on your product."
          ctaText="Get started"
        />

        <section id="get-started" className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Backend status</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLoading && 'Pinging FastAPI...'}
            {isError && 'Backend is unreachable. Start the API to see the health check here.'}
            {data && `Backend says: ${data.status}`}
          </p>
        </section>
      </div>
    </main>
  );
};

export default HomeContainer;
