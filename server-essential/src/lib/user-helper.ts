import { CSVUtility } from "./csv-utility";
import { type NewUserRecord } from "@justin-consortium/core";

const loadUsers = async (): Promise<NewUserRecord[]> => {
  const result = await CSVUtility.parseCSVFile('./content/users.csv');
  return result.map((user: any) => {
    const { email: uniqueIdentifier, study_id, ...rest } = user;
    return { uniqueIdentifier, attributes: { study_id, ...rest } };
  });
};
const UserHelper = {
    loadUsers
};

export { UserHelper };