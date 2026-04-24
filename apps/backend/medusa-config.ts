import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV ?? "development", process.cwd());

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/mrmf";

export default defineConfig({
  projectConfig: {
    databaseUrl,
    http: {
      storeCors: process.env.MEDUSA_STORE_CORS ?? "http://localhost:3000",
      adminCors: process.env.MEDUSA_ADMIN_CORS ?? "http://localhost:9000,http://localhost:3000",
      authCors: process.env.MEDUSA_AUTH_CORS ?? "http://localhost:9000,http://localhost:3000",
      jwtSecret: process.env.JWT_SECRET ?? "development-jwt-secret-change-me",
      cookieSecret: process.env.COOKIE_SECRET ?? "development-cookie-secret-change-me"
    }
  },
  admin: {
    disable: process.env.MEDUSA_ADMIN_DISABLED === "true"
  }
});
