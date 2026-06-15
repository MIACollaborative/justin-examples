import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { UserManager } from "@justin-consortium/core";
import { startTestServer, stopTestServer } from "./helpers/server.js";
import { makeAccessToken } from "./helpers/auth.js";

const TEST_USER = { uniqueIdentifier: "PROT1", attributes: { name: "Protected User" } };
const NAMESPACE = "health";


describe("Protected endpoints", () => {
  let baseUrl: string;
  let server: Awaited<ReturnType<typeof startTestServer>>["server"];
  let token: string;

  beforeAll(async () => {
    ({ baseUrl, server } = await startTestServer());
    await UserManager.createUsers([TEST_USER]);
    token = makeAccessToken("PROT1");
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  // PATCH /api/protected/:uid/:ns
  describe("PATCH /api/protected/:userUniqueIdentifier/:namespace", () => {
    it("sets protected attributes and returns them", async () => {
      const res = await fetch(`${baseUrl}/api/protected/PROT1/${NAMESPACE}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: 70, height: 175 }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toBeDefined();
    });

    it("returns 401 when no token is provided", async () => {
      const res = await fetch(`${baseUrl}/api/protected/PROT1/${NAMESPACE}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-client-type": "native" },
        body: JSON.stringify({ weight: 70 }),
      });
      expect(res.status).toBe(401);
    });
  });

  // GET /api/protected/:uid/:ns
  describe("GET /api/protected/:userUniqueIdentifier/:namespace", () => {
    it("returns the protected attributes for the given names", async () => {
      const res = await fetch(
        `${baseUrl}/api/protected/PROT1/${NAMESPACE}?names=weight&names=height`,
        {
          headers: {
            "x-client-type": "native",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toBeDefined();
    });

    it("returns 401 when no token is provided", async () => {
      const res = await fetch(
        `${baseUrl}/api/protected/PROT1/${NAMESPACE}?names=weight`,
        { headers: { "x-client-type": "native" } }
      );
      expect(res.status).toBe(401);
    });
  });

  // DELETE /api/protected/:uid/:ns
  describe("DELETE /api/protected/:userUniqueIdentifier/:namespace", () => {
    it("deletes the specified protected attributes and returns 204", async () => {
      const res = await fetch(`${baseUrl}/api/protected/PROT1/${NAMESPACE}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ names: ["weight", "height"] }),
      });
      expect(res.status).toBe(204);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await fetch(`${baseUrl}/api/protected/PROT1/${NAMESPACE}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-client-type": "native" },
        body: JSON.stringify({ names: ["weight"] }),
      });
      expect(res.status).toBe(401);
    });
  });
});
