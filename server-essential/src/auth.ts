import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins/bearer";
import { MongoClient } from "mongodb";
import { MONGO_URI, DB_NAME } from "./config.js";

const client = new MongoClient(MONGO_URI);

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to at least 32 characters");
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db(DB_NAME)),
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  secret,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "http://localhost:3000,http://localhost:3002").split(","),
  plugins: [
    // React Native clients send Authorization: Bearer <token> instead of cookies,
    // so the CSRF origin check can stay active for web clients.
    bearer(),
  ],
});