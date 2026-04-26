export function SectionHeading({
  eyebrow,
  title,
  children,
  dark = false
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={`font-subheading text-xs font-extrabold uppercase tracking-[0.16em] ${
            dark ? "text-brand-ivory" : "text-brand-mahogany"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-2 font-heading text-4xl leading-tight sm:text-5xl ${
          dark ? "text-brand-ivory" : "text-brand-mahogany"
        }`}
      >
        {title}
      </h2>
      {children ? (
        <div className={`mt-4 text-base leading-8 ${dark ? "text-brand-ivory" : "text-brand-mahogany"}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
