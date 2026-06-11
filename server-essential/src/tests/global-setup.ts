import { config } from "dotenv";
import { MongoMemoryReplSet } from "mongodb-memory-server";

config(); // load .env (RSA keys etc.) before any server instances start

let replSet: MongoMemoryReplSet;

export async function setup() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGO_URI = replSet.getUri();
  process.env.NODE_ENV = "test";
}

export async function teardown() {
  await replSet.stop();
}
