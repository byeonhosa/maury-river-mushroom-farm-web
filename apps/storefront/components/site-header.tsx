import { Menu, ShoppingBasket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/fresh-mushrooms", label: "Fresh" },
  { href: "/recipes-cooking", label: "Recipes" },
  { href: "/markets-pickup", label: "Pickup" },
  { href: "/restaurants-wholesale", label: "Wholesale" },
  { href: "/our-farm", label: "Our Farm" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-mahogany/15 bg-brand-cream/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="The Maury River Mushroom Farm home">
          <Image
            src="/brand/MRMF_PrimaryLogo_Mahogany.png"
            alt="The Maury River Mushroom Farm"
            width={92}
            height={92}
            className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            priority
          />
          <span className="hidden max-w-48 font-heading text-2xl leading-none sm:block">
            Maury River Mushroom Farm
          </span>
        </Link>

        <nav className="hidden items-center gap-5 font-subheading text-sm font-bold uppercase tracking-[0.08em] text-brand-mahogany lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:underline hover:underline-offset-4">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="mrmf-button-primary h-11 px-4"
          >
            <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
            Cart
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-brand-mahogany/30 bg-white text-brand-mahogany lg:hidden"
            aria-label="Menu"
            title="Menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
