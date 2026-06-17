import { DataManager } from "@justin-consortium/core";

const RESETTABLE_COLLECTIONS = ["account", "session", "user", "users"] as const;

const dropCollections = async (): Promise<void> => {
  const dm = DataManager.getInstance();
  for (const collection of RESETTABLE_COLLECTIONS) {
    await dm.clearCollection(collection);
  }
};

export const DBHelper = { dropCollections };
