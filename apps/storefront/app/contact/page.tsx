import { ContactForm } from "../../components/forms";
import { PageHero } from "../../components/page-hero";

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Ask about mushrooms, pickup, or a future order.">
        <p>
          The contact form validates server-side now and can be wired to email delivery once the provider is chosen.
        </p>
      </PageHero>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mrmf-card p-6">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
