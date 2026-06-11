import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ContentManager } from "@justin-consortium/core";
import { startTestServer, stopTestServer } from "./helpers/server.js";

const SEED_CONTENTS = [
  { uniqueIdentifier: "msg-gameon", type: "message", value: { text: "Game on!" } },
  { uniqueIdentifier: "msg-gameoff", type: "message", value: { text: "Game off!" } },
  { uniqueIdentifier: "gif-walk-1", type: "gif", value: { url: "https://example.com/walk1.gif" } },
];

describe("Content endpoints", () => {
  let baseUrl: string;
  let server: Awaited<ReturnType<typeof startTestServer>>["server"];
  let seededIds: string[];

  beforeAll(async () => {
    ({ baseUrl, server } = await startTestServer());
    const result = await ContentManager.createContents(SEED_CONTENTS);
    seededIds = (result.successes ?? []).map((r: any) => r.id);
  });

  afterAll(async () => {
    await ContentManager.deleteAllContent();
    await stopTestServer(server);
  });

  // GET /api/content
  describe("GET /api/content", () => {
    it("returns all seeded content records", async () => {
      const res = await fetch(`${baseUrl}/api/content`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(3);
      const slugs = body.data.map((r: any) => r.uniqueIdentifier);
      expect(slugs).toContain("msg-gameon");
      expect(slugs).toContain("gif-walk-1");
    });
  });

  // POST /api/content
  describe("POST /api/content", () => {
    it("creates a single content record and returns 201", async () => {
      const res = await fetch(`${baseUrl}/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueIdentifier: "new-item-1", type: "tip", value: { text: "Hello" } }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.data.uniqueIdentifier).toBe("new-item-1");
      expect(body.data.type).toBe("tip");
    });

    it("returns an error when required fields are missing", async () => {
      const res = await fetch(`${baseUrl}/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { text: "no uid or type" } }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // POST /api/content/batch
  describe("POST /api/content/batch", () => {
    it("bulk-creates an array of content records", async () => {
      const items = [
        { uniqueIdentifier: "batch-a", type: "message", value: { text: "A" } },
        { uniqueIdentifier: "batch-b", type: "message", value: { text: "B" } },
      ];
      const res = await fetch(`${baseUrl}/api/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      expect([201, 207]).toContain(res.status);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);
    });

    it("returns an error when body is not an array", async () => {
      const res = await fetch(`${baseUrl}/api/content/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueIdentifier: "not-array", type: "x" }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // GET /api/content/:contentId
  describe("GET /api/content/:contentId", () => {
    it("returns the content record when found", async () => {
      const id = seededIds[0];
      const res = await fetch(`${baseUrl}/api/content/${id}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.id).toBe(id);
    });

    it("returns 404 for an unknown id", async () => {
      const res = await fetch(`${baseUrl}/api/content/000000000000000000000000`);
      expect(res.status).toBe(404);
    });
  });

  // GET /api/content/slug/:slug
  describe("GET /api/content/slug/:slug", () => {
    it("returns the content record by its uniqueIdentifier", async () => {
      const res = await fetch(`${baseUrl}/api/content/slug/msg-gameoff`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.uniqueIdentifier).toBe("msg-gameoff");
    });

    it("returns 404 for an unknown slug", async () => {
      const res = await fetch(`${baseUrl}/api/content/slug/does-not-exist`);
      expect(res.status).toBe(404);
    });
  });

  // GET /api/content/type/:type
  describe("GET /api/content/type/:type", () => {
    it("returns all records matching the given type", async () => {
      const res = await fetch(`${baseUrl}/api/content/type/message`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
      body.data.forEach((r: any) => expect(r.type).toBe("message"));
    });

    it("returns an empty array for an unknown type", async () => {
      const res = await fetch(`${baseUrl}/api/content/type/nonexistent-type`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  // PATCH /api/content/:contentId
  describe("PATCH /api/content/:contentId", () => {
    it("updates a content record and returns the updated data", async () => {
      const id = seededIds[2]; // gif-walk-1
      const res = await fetch(`${baseUrl}/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { url: "https://example.com/walk2.gif" } }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.value.url).toBe("https://example.com/walk2.gif");
    });

    it("returns 404 for an unknown id", async () => {
      const res = await fetch(`${baseUrl}/api/content/000000000000000000000000`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { text: "ghost" } }),
      });
      expect(res.status).toBe(404);
    });
  });

  // DELETE /api/content/:contentId
  describe("DELETE /api/content/:contentId", () => {
    it("deletes an existing content record and returns 204", async () => {
      const id = seededIds[1]; // msg-gameoff
      const res = await fetch(`${baseUrl}/api/content/${id}`, { method: "DELETE" });
      expect(res.status).toBe(204);
      const check = await fetch(`${baseUrl}/api/content/${id}`);
      expect(check.status).toBe(404);
    });

    it("returns 404 for an unknown id", async () => {
      const res = await fetch(`${baseUrl}/api/content/000000000000000000000000`, { method: "DELETE" });
      expect(res.status).toBe(404);
    });
  });

  // POST /api/content/batch-delete
  describe("POST /api/content/batch-delete", () => {
    it("deletes a batch of content records by id", async () => {
      // Create two records to delete
      const created = await ContentManager.createContents([
        { uniqueIdentifier: "del-batch-x", type: "temp", value: {} },
        { uniqueIdentifier: "del-batch-y", type: "temp", value: {} },
      ]);
      const ids = (created.successes ?? []).map((r: any) => r.id);
      const res = await fetch(`${baseUrl}/api/content/batch-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      expect(res.status).toBe(200);
    });

    it("returns an error when ids is not an array", async () => {
      const res = await fetch(`${baseUrl}/api/content/batch-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: "not-an-array" }),
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // DELETE /api/content
  describe("DELETE /api/content", () => {
    it("deletes all content records", async () => {
      await ContentManager.createContent({ uniqueIdentifier: "delete-all-test", type: "temp", value: {} });
      const res = await fetch(`${baseUrl}/api/content`, { method: "DELETE" });
      expect([200, 204]).toContain(res.status);
      const check = await fetch(`${baseUrl}/api/content`);
      const body = await check.json();
      expect(body.data).toEqual([]);
    });
  });
});
