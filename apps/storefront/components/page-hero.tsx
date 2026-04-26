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
    <section className="border-b border-brand-mahogany/15 bg-brand-cream text-brand-mahogany">
      <div className="mrmf-shell py-12 sm:py-16">
        <p className="mrmf-eyebrow">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-heading text-5xl leading-[1.02] sm:text-6xl">
          {title}
        </h1>
        <div className="mt-5 max-w-3xl text-base leading-8">{children}</div>
      </div>
    </section>
  );
}
