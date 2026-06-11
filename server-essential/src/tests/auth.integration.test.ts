import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestServer, stopTestServer } from "./helpers/server.js";
import { makeAccessToken } from "./helpers/auth.js";

const DEVICE_ID = "test-device-001";

describe("Auth endpoints", () => {
  let baseUrl: string;
  let server: Awaited<ReturnType<typeof startTestServer>>["server"];

  // No pre-seeding: register creates the user itself
  beforeAll(async () => {
    ({ baseUrl, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  // POST /api/auth/register
  describe("POST /api/auth/register", () => {
    it("registers a new user and returns 200", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "AUTH1", password: "secret123" }),
      });
      expect(res.status).toBe(200);
    });

    it("returns an error when registering the same username twice", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "AUTH1", password: "another123" }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // POST /api/auth/login
  describe("POST /api/auth/login", () => {
    it("returns tokens on successful login", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": DEVICE_ID,
        },
        body: JSON.stringify({ username: "AUTH1", password: "secret123" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.accessToken).toBeTruthy();
      expect(body.data.refreshToken).toBeTruthy();
    });

    it("returns 401 for wrong password", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": DEVICE_ID,
        },
        body: JSON.stringify({ username: "AUTH1", password: "wrongpassword" }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 400 when x-device-id header is missing", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
        },
        body: JSON.stringify({ username: "AUTH1", password: "secret123" }),
      });
      expect(res.status).toBe(400);
    });
  });

  // POST /api/auth/logout
  describe("POST /api/auth/logout", () => {
    it("logs out and returns 204", async () => {
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": "logout-device",
        },
        body: JSON.stringify({ username: "AUTH1", password: "secret123" }),
      });
      const { data } = await loginRes.json();

      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "x-client-type": "native",
          "x-device-id": "logout-device",
          Authorization: `Bearer ${data.accessToken}`,
        },
      });
      expect(res.status).toBe(204);
    });
  });

  // POST /api/auth/refresh
  describe("POST /api/auth/refresh", () => {
    it("issues new tokens with a valid refresh token", async () => {
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": "refresh-device",
        },
        body: JSON.stringify({ username: "AUTH1", password: "secret123" }),
      });
      const { data } = await loginRes.json();

      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": "refresh-device",
        },
        body: JSON.stringify({ refreshToken: data.refreshToken }),
      });
      expect(res.status).toBe(200);
      const refreshBody = await res.json();
      expect(refreshBody.data.accessToken).toBeTruthy();
      expect(refreshBody.data.refreshToken).toBeTruthy();
    });

    it("returns 401 for an invalid refresh token", async () => {
      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          "x-device-id": "refresh-device",
        },
        body: JSON.stringify({ refreshToken: "invalid.token.here" }),
      });
      expect(res.status).toBe(401);
    });
  });

  // POST /api/auth/me
  describe("POST /api/auth/me", () => {
    it("returns the authenticated user", async () => {
      const token = makeAccessToken("AUTH1");
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        method: "POST",
        headers: {
          "x-client-type": "native",
          Authorization: `Bearer ${token}`,
        },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.user.uniqueIdentifier).toBe("AUTH1");
    });

    it("returns 401 when no token is provided", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        method: "POST",
        headers: { "x-client-type": "native" },
      });
      expect(res.status).toBe(401);
    });
  });

  // POST /api/auth/update-password
  describe("POST /api/auth/update-password", () => {
    it("updates the password when the current password is correct", async () => {
      const token = makeAccessToken("AUTH1");
      const res = await fetch(`${baseUrl}/api/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: "AUTH1",
          currentPassword: "secret123",
          newPassword: "newSecret456",
        }),
      });
      expect(res.status).toBe(200);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await fetch(`${baseUrl}/api/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-client-type": "native" },
        body: JSON.stringify({
          username: "AUTH1",
          currentPassword: "secret123",
          newPassword: "newSecret456",
        }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 403 when trying to change another user's password", async () => {
      const token = makeAccessToken("AUTH1");
      const res = await fetch(`${baseUrl}/api/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "native",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: "SOMEONE_ELSE",
          currentPassword: "secret123",
          newPassword: "hacked",
        }),
      });
      expect(res.status).toBe(403);
    });
  });
});
