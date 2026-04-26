export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
}

export interface EmailProvider {
  name: string;
  previewOnly: boolean;
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  name = "console";
  previewOnly = true;

  async send(message: EmailMessage) {
    console.log("Console email provider preview:");
    console.log(`To: ${message.to}`);
    console.log(`From: ${message.from}`);
    console.log(`Subject: ${message.subject}`);
    console.log(message.text);
  }
}

export function createEmailProvider(provider = "console"): EmailProvider {
  if (provider === "console") {
    return new ConsoleEmailProvider();
  }

  throw new Error(
    `Unsupported EMAIL_PROVIDER "${provider}". Configure production providers only after secrets, unsubscribe handling, and owner approval are ready.`
  );
}
