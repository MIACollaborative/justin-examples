import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { UserManager } from "@justin-consortium/core";
import { startTestServer, stopTestServer } from "./helpers/server.js";

const USERS = [
  { uniqueIdentifier: "U1", attributes: { name: "Alice", role: "admin" } },
  { uniqueIdentifier: "U2", attributes: { name: "Bob", role: "participant" } },
];

describe("Users endpoints", () => {
  let baseUrl: string;
  let server: Awaited<ReturnType<typeof startTestServer>>["server"];

  beforeAll(async () => {
    ({ baseUrl, server } = await startTestServer());
    await UserManager.createUsers(USERS);
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  // GET /api/users
  describe("GET /api/users", () => {
    it("returns all seeded users", async () => {
      const res = await fetch(`${baseUrl}/api/users`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      const ids = body.data.map((u: any) => u.uniqueIdentifier);
      expect(ids).toContain("U1");
      expect(ids).toContain("U2");
    });
  });

  // POST /api/users
  describe("POST /api/users", () => {
    it("bulk-creates new users and returns their identifiers", async () => {
      const newUsers = [
        { uniqueIdentifier: "U3", attributes: { name: "Carol" } },
        { uniqueIdentifier: "U4", attributes: { name: "Dave" } },
      ];
      const res = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUsers),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.data).toContain("U3");
      expect(body.data).toContain("U4");
    });

    it("returns an error when the body is not an array", async () => {
      const res = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueIdentifier: "U5", attributes: {} }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // GET /api/users/:uid
  describe("GET /api/users/:userUniqueIdentifier", () => {
    it("returns the user when found", async () => {
      const res = await fetch(`${baseUrl}/api/users/U1`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.uniqueIdentifier).toBe("U1");
    });

    it("returns 404 for an unknown identifier", async () => {
      const res = await fetch(`${baseUrl}/api/users/NOBODY`);
      expect(res.status).toBe(404);
    });
  });

  // PATCH /api/users/:uid
  describe("PATCH /api/users/:userUniqueIdentifier", () => {
    it("updates a user attribute", async () => {
      const res = await fetch(`${baseUrl}/api/users/U2`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Bobby" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.name).toBe("Bobby");
    });

    it("returns 404 for an unknown identifier", async () => {
      const res = await fetch(`${baseUrl}/api/users/NOBODY`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ghost" }),
      });
      expect(res.status).toBe(404);
    });
  });

  // DELETE /api/users/:uid
  describe("DELETE /api/users/:userUniqueIdentifier", () => {
    it("deletes an existing user and returns 204", async () => {
      const res = await fetch(`${baseUrl}/api/users/U1`, { method: "DELETE" });
      expect(res.status).toBe(204);
      const check = await fetch(`${baseUrl}/api/users/U1`);
      expect(check.status).toBe(404);
    });

    it("returns 404 for an unknown identifier", async () => {
      const res = await fetch(`${baseUrl}/api/users/NOBODY`, { method: "DELETE" });
      expect(res.status).toBe(404);
    });
  });
});
