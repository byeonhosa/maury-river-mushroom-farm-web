import { loadEnv } from "@medusajs/framework/utils";
import { notificationSchemaStatements } from "@mrmf/shared";
import path from "node:path";
import pg from "pg";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

export interface NotificationSchemaClient {
  query(statement: string): Promise<unknown>;
}

export async function ensureNotificationSchema(client: NotificationSchemaClient) {
  for (const statement of notificationSchemaStatements) {
    await client.query(statement);
  }
}

export async function runNotificationSchemaSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to create notification schema.");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await ensureNotificationSchema(client);
  } finally {
    await client.end();
  }

  console.log("Notification request schema is ready.");
}

if (require.main === module) {
  void runNotificationSchemaSetup();
}
