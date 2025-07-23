import { CSVUtility } from "./csv-utility";

let userList: { id: string, uniqueIdentifier: string, attributes: Record<string, any> }[] = [];

const loadUsers = async (): Promise<typeof userList> => {
  try {
    const result = await CSVUtility.parseCSVFile('./content/users.csv');
    userList = result.map((user: any) => {
      const { id, uniqueIdentifier, ...attributes } = user;
      return { id, uniqueIdentifier, attributes };
    });
    return userList;
  } catch (error) {
    console.error("Error loading users:", error);
    userList = [];
    return userList;
  }
};
export const UserHelper = {
    loadUsers
};
