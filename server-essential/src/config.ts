const MONGO_URI =
  process.env.MONGO_URI ??
  "mongodb://localhost:27017/?replicaSet=rs0";

const DB_NAME = process.env.DB_NAME ?? "server_essential";

export { MONGO_URI, DB_NAME };
