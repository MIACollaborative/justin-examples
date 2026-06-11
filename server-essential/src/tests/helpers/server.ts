import { createRequire } from "module";
import { resolve } from "path";
import { JustInServer } from "@just-in/server";
import { configureDB, DBType, UserManager } from "@justin-consortium/core";

const require = createRequire(import.meta.url);
// Use an absolute path to bypass the @just-in/server exports map restriction
const storePath = resolve(
  process.cwd(),
  "node_modules/@just-in/server/dist/infrastructure/endpoint-management/store.js"
);
const { clearEndpoints } = require(storePath) as { clearEndpoints: () => void };

type ServerInstance = ReturnType<typeof JustInServer>;

export async function startTestServer(): Promise<{
  baseUrl: string;
  server: ServerInstance;
}> {
  configureDB({ dbType: DBType.MONGO, uri: process.env.MONGO_URI! });
  const server = JustInServer({});
  await server.start(0);
  const baseUrl = `http://localhost:${server.port()}`;
  return { baseUrl, server };
}

export async function stopTestServer(server: ServerInstance): Promise<void> {
  await UserManager.deleteAllUsers();
  await server.close();
  (server as any).constructor.resetInstance();
  clearEndpoints();
}
