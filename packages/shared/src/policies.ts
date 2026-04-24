export const policyPages = [
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    summary:
      "Explains customer data collection, email signup handling, payment processor use, and future analytics review.",
    requiresLegalReview: true
  },
  {
    title: "Terms and Conditions",
    slug: "terms-and-conditions",
    summary:
      "Defines customer use of the website, product availability limits, order acceptance, and account expectations.",
    requiresLegalReview: true
  },
  {
    title: "Shipping / Pickup Policy",
    slug: "shipping-pickup-policy",
    summary:
      "Clarifies that fresh mushrooms are local-only by default while shelf-stable goods may be shipped.",
    requiresLegalReview: true
  },
  {
    title: "Refund Policy",
    slug: "refund-policy",
    summary:
      "Addresses perishable product limitations, pickup windows, damaged shelf-stable products, and supplement review.",
    requiresLegalReview: true
  }
];

export function getPolicyBySlug(slug: string) {
  return policyPages.find((policy) => policy.slug === slug);
}
