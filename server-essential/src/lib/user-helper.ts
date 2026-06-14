import { CSVUtility } from "./csv-utility";
import { type NewUserRecord } from "@justin-consortium/core";

const loadUsers = async (): Promise<NewUserRecord[]> => {
  const result = await CSVUtility.parseCSVFile('./content/users.csv');
  return result.map((user: any) => {
    const { study_id: uniqueIdentifier, ...attributes } = user;
    return { uniqueIdentifier, attributes };
  });
};
const UserHelper = {
    loadUsers
};

export { UserHelper };