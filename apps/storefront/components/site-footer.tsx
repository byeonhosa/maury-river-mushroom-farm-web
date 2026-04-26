import Link from "next/link";

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/shipping-pickup-policy", label: "Shipping / Pickup" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/contact", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-ivory/20 bg-brand-mahogany text-brand-ivory">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-heading text-3xl">The Maury River Mushroom Farm</p>
          <p className="mt-4 max-w-xl text-sm leading-7">
            Gourmet and functional mushrooms grown for local kitchens, curious home
            cooks, and chefs who want harvest-driven ingredients.
          </p>
        </div>
        <div>
          <p className="font-subheading text-sm font-bold uppercase tracking-[0.12em]">
            Visit & Buy
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Farm pickup by announced windows</li>
            <li>Farmers-market pickup when scheduled</li>
            <li>Local delivery when available</li>
            <li>Shipping for shelf-stable goods only</li>
          </ul>
        </div>
        <div>
          <p className="font-subheading text-sm font-bold uppercase tracking-[0.12em]">
            Policies
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline-offset-4 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
