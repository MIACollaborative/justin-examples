import { UserHelper } from "../user-helper";

UserHelper.loadUsers()
    .then(() => {
        console.log("Users loaded successfully.");
    })
    .catch((error) => {
        console.error("Failed to load users:", error);
    });
