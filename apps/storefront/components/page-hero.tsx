export function PageHero({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-brand-mahogany text-brand-ivory">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.18em]">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-heading text-5xl leading-tight sm:text-6xl">{title}</h1>
        <div className="mt-5 max-w-3xl text-base leading-8">{children}</div>
      </div>
    </section>
  );
}
