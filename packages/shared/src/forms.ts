import { z } from "zod";

const requiredText = z.string().trim().min(2).max(500);
const optionalMessage = z.string().trim().max(2000).optional().or(z.literal(""));

export const contactFormSchema = z.object({
  name: requiredText,
  email: z.string().trim().email(),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(2000)
});

export const wholesaleInquirySchema = z.object({
  restaurantName: requiredText,
  contactName: requiredText,
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(40).optional().or(z.literal("")),
  weeklyVolume: z.string().trim().min(2).max(120),
  productsInterestedIn: z.string().trim().min(2).max(500),
  message: optionalMessage
});

export const newsletterSignupSchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().max(80).optional().or(z.literal(""))
});

export const availabilityInquirySchema = z.object({
  name: requiredText,
  email: z.string().trim().email(),
  productSlug: z.string().trim().min(2).max(120),
  preferredFulfillment: z.enum([
    "farm-pickup",
    "farmers-market-pickup",
    "local-delivery",
    "restaurant-delivery"
  ]),
  message: optionalMessage
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type WholesaleInquiryInput = z.infer<typeof wholesaleInquirySchema>;
export type NewsletterSignupInput = z.infer<typeof newsletterSignupSchema>;
export type AvailabilityInquiryInput = z.infer<typeof availabilityInquirySchema>;
