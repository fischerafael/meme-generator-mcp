import { describe, expect, it } from "vitest";
import { JsonCatalog } from "../backend/adapters/outbound/json.catalog.js";

describe("data/templates-catalog.json", () => {
  const catalog = new JsonCatalog();

  it("is valid and every template has one role per box", async () => {
    const all = await catalog.list();
    expect(all.length).toBeGreaterThanOrEqual(30);
    for (const t of all) {
      expect(t.boxes.map((b) => b.index)).toEqual(Array.from({ length: t.boxCount }, (_, i) => i + 1));
      if (t.example) expect(t.example).toHaveLength(t.boxCount);
    }
    expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
  });

  it("has Scooby with box 3 = the real culprit", async () => {
    const t = await catalog.get("145139900");
    expect(t?.boxes[2]?.role).toMatch(/REAL culprit/);
  });

  it("searches name, usage and roles", async () => {
    expect((await catalog.list("culprit")).map((t) => t.id)).toContain("145139900");
    expect(await catalog.list("drake", 1)).toHaveLength(1);
  });
});
