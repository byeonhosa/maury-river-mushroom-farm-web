import {
  createEmailProvider as createSharedEmailProvider,
  type EmailMessage,
  type EmailProvider
} from "@mrmf/shared";

export type { EmailMessage, EmailProvider };

export function createEmailProvider(provider = process.env.EMAIL_PROVIDER ?? "console") {
  return createSharedEmailProvider(provider);
}
