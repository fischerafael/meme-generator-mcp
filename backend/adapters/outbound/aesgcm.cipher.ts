import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { UnauthorizedError } from "../../domain/errors.js";
import type { ImgflipCreds } from "../../domain/meme.js";
import type { TokenCipherPort } from "../../ports/token-cipher.port.js";

const IV_BYTES = 12;
const TAG_BYTES = 16;

interface Payload {
  u: string;
  p: string;
  iat: number;
}

/**
 * Token format: `<prefix><base64url(iv[12] | ciphertext | authTag[16])>`, AES-256-GCM.
 * `keys` maps a version prefix (e.g. "mg_v1_") to its 32-byte key; `current` is the one used to seal.
 * Add a second entry (e.g. "mg_v2_") to rotate while still accepting old tokens.
 */
export class AesGcmCipher implements TokenCipherPort {
  private readonly keys: Map<string, Buffer>;

  constructor(
    keys: Record<string, Buffer>,
    private readonly current: string,
    private readonly now: () => number = () => Math.floor(Date.now() / 1000),
  ) {
    this.keys = new Map(Object.entries(keys));
    for (const [prefix, key] of this.keys) {
      if (key.length !== 32) throw new Error(`Key for ${prefix} must be 32 bytes.`);
    }
    if (!this.keys.has(current)) throw new Error("Current prefix has no key.");
  }

  static fromBase64Key(keyB64: string | undefined): AesGcmCipher {
    if (!keyB64) throw new Error("TOKEN_KEY is not set.");
    return new AesGcmCipher({ mg_v1_: Buffer.from(keyB64, "base64") }, "mg_v1_");
  }

  seal(creds: ImgflipCreds): string {
    const key = this.keys.get(this.current)!;
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(Buffer.from(this.current));
    const payload: Payload = { u: creds.username, p: creds.password, iat: this.now() };
    const ct = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
    return this.current + Buffer.concat([iv, ct, cipher.getAuthTag()]).toString("base64url");
  }

  open(token: string): ImgflipCreds {
    if (typeof token !== "string" || !token) throw new UnauthorizedError();
    const prefix = [...this.keys.keys()].find((p) => token.startsWith(p));
    if (!prefix) throw new UnauthorizedError();
    const body = token.slice(prefix.length);
    if (!/^[A-Za-z0-9_-]+$/.test(body)) throw new UnauthorizedError();
    const buf = Buffer.from(body, "base64url");
    if (buf.length <= IV_BYTES + TAG_BYTES) throw new UnauthorizedError();

    try {
      const iv = buf.subarray(0, IV_BYTES);
      const tag = buf.subarray(buf.length - TAG_BYTES);
      const ct = buf.subarray(IV_BYTES, buf.length - TAG_BYTES);
      const decipher = createDecipheriv("aes-256-gcm", this.keys.get(prefix)!, iv);
      decipher.setAAD(Buffer.from(prefix));
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
      const payload = JSON.parse(plain) as Partial<Payload>;
      if (typeof payload.u !== "string" || typeof payload.p !== "string") throw new Error("bad payload");
      return { username: payload.u, password: payload.p };
    } catch {
      throw new UnauthorizedError();
    }
  }
}
