const Hero = ({ title, subtitle, ctaText }) => (
  <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl rounded-3xl p-10 md:p-16">
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium ring-1 ring-inset ring-white/20">
        <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
        Monorepo bootstrap ready
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">{title}</h1>
        <p className="text-lg md:text-xl text-white/80">{subtitle}</p>
      </div>
      <div>
        <a
          className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-5 py-3 text-base font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
          href="#get-started"
        >
          {ctaText}
          <span aria-hidden>→</span>
        </a>
      </div>
    </div>
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
      <div className="absolute h-40 w-40 left-8 top-8 rounded-full bg-emerald-400 blur-3xl" />
      <div className="absolute h-56 w-56 right-10 bottom-6 rounded-full bg-cyan-400 blur-3xl" />
    </div>
  </section>
);

export default Hero;
