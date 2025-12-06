const Footer = ({ links = [], version }) => (
  <footer className="border-t border-slate-200 bg-white/70 py-6">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        {links.map((link) => (
          <a key={link.label} href={link.href} className="hover:text-slate-900">
            {link.label}
          </a>
        ))}
      </div>
      {version ? <span className="text-xs text-slate-500">Version {version}</span> : null}
    </div>
  </footer>
);

export default Footer;
