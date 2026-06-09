import { CSVUtility } from "./csv-utility";
import { createLogger, type NewUserRecord } from "@justin-consortium/core";

const Log = createLogger({ context: { source: "user-helper" } });

const loadUsers = async (): Promise<NewUserRecord[]> => {
  let userList: NewUserRecord[] = [];
  try {
    const result = await CSVUtility.parseCSVFile('./content/users.csv');
    userList = result.map((user: any) => {
      const { study_id: uniqueIdentifier, ...attributes } = user;
      return { uniqueIdentifier, attributes };
    });
    return userList;
  } catch (error) {
    Log.error("Error loading users:", error);
    userList = [];
    return userList;
  }
};
const UserHelper = {
    loadUsers
};

export { UserHelper };