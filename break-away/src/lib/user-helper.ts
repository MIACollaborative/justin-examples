import { CSVUtility } from "./csv-utility";
import { Log } from "@just-in/core";

let userList: { uniqueIdentifier: string, initialAttributes: Record<string, any> }[] = [];

const loadUsers = async (): Promise<typeof userList> => {
  try {
    const result = await CSVUtility.parseCSVFile('./content/users.csv');
    userList = result.map((user: any) => {
      const { study_id: uniqueIdentifier, ...attributes } = user;
      return { uniqueIdentifier, initialAttributes: attributes };
    });
    return userList;
  } catch (error) {
    Log.error("Error loading users:", error);
    userList = [];
    return userList;
  }
};
export const UserHelper = {
    loadUsers
};
