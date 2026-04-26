export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  name = "console";

  async send(message: EmailMessage) {
    console.log("Console email provider preview:");
    console.log(`To: ${message.to}`);
    console.log(`From: ${message.from}`);
    console.log(`Subject: ${message.subject}`);
    console.log(message.text);
  }
}

export function createEmailProvider(provider = process.env.EMAIL_PROVIDER ?? "console") {
  if (provider === "console") {
    return new ConsoleEmailProvider();
  }

  throw new Error(
    `Unsupported EMAIL_PROVIDER "${provider}". Configure production providers only after secrets, unsubscribe handling, and owner approval are ready.`
  );
}
