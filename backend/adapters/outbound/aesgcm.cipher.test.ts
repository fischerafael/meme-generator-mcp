import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "../../domain/errors.js";
import { AesGcmCipher } from "./aesgcm.cipher.js";

const key = randomBytes(32);
const cipher = new AesGcmCipher({ mg_v1_: key }, "mg_v1_");
const creds = { username: "alice", password: "s3cr3t!" };

describe("AesGcmCipher", () => {
  it("round-trips credentials", () => {
    const token = cipher.seal(creds);
    expect(token.startsWith("mg_v1_")).toBe(true);
    expect(token).not.toContain("alice");
    expect(cipher.open(token)).toEqual(creds);
  });

  it("produces different tokens for the same creds (random IV)", () => {
    expect(cipher.seal(creds)).not.toEqual(cipher.seal(creds));
  });

  it("rejects a tampered token", () => {
    const token = cipher.seal(creds);
    const body = Buffer.from(token.slice(6), "base64url");
    body[14] = body[14]! ^ 0xff;
    expect(() => cipher.open("mg_v1_" + body.toString("base64url"))).toThrow(UnauthorizedError);
  });

  it("rejects a wrong prefix", () => {
    const token = cipher.seal(creds);
    expect(() => cipher.open(token.replace("mg_v1_", "mg_v9_"))).toThrow(UnauthorizedError);
    expect(() => cipher.open(token.slice(6))).toThrow(UnauthorizedError);
  });

  it("rejects a token sealed with another key", () => {
    const other = new AesGcmCipher({ mg_v1_: randomBytes(32) }, "mg_v1_");
    expect(() => cipher.open(other.seal(creds))).toThrow(UnauthorizedError);
  });

  it("rejects garbage", () => {
    for (const t of ["", "mg_v1_", "mg_v1_abc", "mg_v1_!!!!", "Bearer x"]) {
      expect(() => cipher.open(t)).toThrow(UnauthorizedError);
    }
  });

  it("accepts v1 and v2 during a key rotation", () => {
    const v2 = randomBytes(32);
    const rotating = new AesGcmCipher({ mg_v1_: key, mg_v2_: v2 }, "mg_v2_");
    expect(rotating.open(cipher.seal(creds))).toEqual(creds);
    const fresh = rotating.seal(creds);
    expect(fresh.startsWith("mg_v2_")).toBe(true);
    expect(rotating.open(fresh)).toEqual(creds);
  });
});
