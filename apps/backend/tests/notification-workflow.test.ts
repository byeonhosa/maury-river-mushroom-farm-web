import { notificationSchemaStatements } from "@mrmf/shared";
import { describe, expect, it, vi } from "vitest";

import { createEmailProvider } from "../src/lib/email-provider";
import { ensureNotificationSchema } from "../src/scripts/notification-schema";

describe("notification persistence and email preview scaffolds", () => {
  it("runs the durable notification schema statements in order", async () => {
    const executedStatements: string[] = [];
    const query = vi.fn(async (statement: string) => {
      executedStatements.push(statement);

      return {
        command: "CREATE",
        rowCount: null,
        oid: 0,
        fields: [],
        rows: []
      };
    });

    await ensureNotificationSchema({ query });

    expect(query).toHaveBeenCalledTimes(notificationSchemaStatements.length);
    expect(executedStatements[0]).toContain("create table if not exists");
    expect(executedStatements.at(-1)).toContain("create index if not exists");
  });

  it("defaults to a console email provider and rejects unknown live providers", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const provider = createEmailProvider("console");

    await provider.send({
      to: "customer@example.com",
      from: "farm@example.com",
      subject: "Availability preview",
      text: "Preview only."
    });

    expect(provider.name).toBe("console");
    expect(log).toHaveBeenCalledWith("Console email provider preview:");
    expect(() => createEmailProvider("resend")).toThrow("Unsupported EMAIL_PROVIDER");

    log.mockRestore();
  });
});
