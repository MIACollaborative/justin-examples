import { createLogger } from "@justin-consortium/core";
import { auth } from "../auth.js";
import { CSVUtility } from "./csv-utility.js";

const Log = createLogger({ context: { source: "better-auth-user-helper" } });

type UserRow = {
  study_id: string;
  preferred_name: string;
  email: string;
  [key: string]: unknown;
};

const seedUsers = async (csvPath: string): Promise<void> => {
  const password = process.env.DEMO_USER_PASSWORD;
  if (!password) {
    throw new Error("DEMO_USER_PASSWORD must be set in the environment");
  }

  const rows = (await CSVUtility.parseCSVFile(csvPath)) as UserRow[];

  for (const row of rows) {
    const { email, preferred_name: name } = row;
    try {
      await auth.api.signUpEmail({ body: { email, password, name } });
      Log.info(`Registered better-auth user`, { email });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists") || message.includes("UNIQUE") || message.includes("11000")) {
        Log.info(`better-auth user already exists, skipping`, { email });
      } else {
        Log.error(`Failed to register better-auth user`, { email, err });
        throw err;
      }
    }
  }
};

export const BetterAuthUserHelper = { seedUsers };
