import { listProducts } from "../lib/products";

const inputClass =
  "w-full border border-brand-mahogany/30 bg-brand-ivory px-4 py-3 text-brand-mahogany placeholder:text-brand-mahogany/60";
const labelClass = "font-subheading text-xs font-extrabold uppercase tracking-[0.14em]";
const buttonClass =
  "inline-flex bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony";

export function ContactForm() {
  return (
    <form action="/api/contact" method="post" className="grid gap-4">
      <label className="grid gap-2">
        <span className={labelClass}>Name</span>
        <input className={inputClass} name="name" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Subject</span>
        <input className={inputClass} name="subject" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Message</span>
        <textarea className={inputClass} name="message" rows={5} required />
      </label>
      <button className={buttonClass} type="submit">
        Send message
      </button>
    </form>
  );
}

export function WholesaleInquiryForm() {
  return (
    <form action="/api/wholesale" method="post" className="grid gap-4">
      <label className="grid gap-2">
        <span className={labelClass}>Restaurant or business</span>
        <input className={inputClass} name="restaurantName" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Contact name</span>
        <input className={inputClass} name="contactName" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Phone</span>
        <input className={inputClass} name="phone" />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Estimated weekly volume</span>
        <input className={inputClass} name="weeklyVolume" placeholder="Example: 5-10 lb/week" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Products interested in</span>
        <input className={inputClass} name="productsInterestedIn" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Message</span>
        <textarea className={inputClass} name="message" rows={5} />
      </label>
      <button className={buttonClass} type="submit">
        Request wholesale availability
      </button>
    </form>
  );
}

export function NewsletterForm() {
  return (
    <form action="/api/newsletter" method="post" className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input className={inputClass} name="firstName" placeholder="First name" />
      <input className={inputClass} name="email" type="email" placeholder="Email address" required />
      <button className={buttonClass} type="submit">
        Sign up
      </button>
    </form>
  );
}

export async function AvailabilityInquiryForm() {
  const products = await listProducts();

  return (
    <form action="/api/availability" method="post" className="grid gap-4">
      <label className="grid gap-2">
        <span className={labelClass}>Name</span>
        <input className={inputClass} name="name" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Product</span>
        <select className={inputClass} name="productSlug" required>
          {products.map((product) => (
            <option key={product.slug} value={product.slug}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Preferred fulfillment</span>
        <select className={inputClass} name="preferredFulfillment" required>
          <option value="farm-pickup">Farm pickup</option>
          <option value="farmers-market-pickup">Farmers-market pickup</option>
          <option value="local-delivery">Local delivery</option>
          <option value="restaurant-delivery">Restaurant delivery</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className={labelClass}>Message</span>
        <textarea className={inputClass} name="message" rows={4} />
      </label>
      <button className={buttonClass} type="submit">
        Ask about availability
      </button>
    </form>
  );
}
