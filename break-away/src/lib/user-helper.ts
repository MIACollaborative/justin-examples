import { CSVUtility } from "./csv-utility";

let userList: { id: string, uniqueIdentifier: string, attributes: Record<string, any> }[] = [];

const loadUsersIntoDatabase = async (): Promise<void> => {
  try {
    const result = await CSVUtility.parseCSVFile('./content/users.csv');
    userList = result.map((user: any) => {
      const { id, uniqueIdentifier, ...attributes } = user;
      return { id, uniqueIdentifier, attributes };
    });

    
    console.log("Users loaded successfully:", userList);
  } catch (error) {
    console.error("Error loading users:", error);
    userList = [];
  }
};
export const UserHelper = {
    loadUsersIntoDatabase
};
