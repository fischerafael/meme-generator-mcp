import { describe, expect, it } from "vitest";
import { decodeTexts, encodeTexts } from "./textsParam";

describe("texts URL param", () => {
  it("round-trips, including pipes, unicode and empty boxes", () => {
    const texts = ["a | b", "", "Olá 😂", "100% & more"];
    expect(decodeTexts(encodeTexts(texts))).toEqual(texts);
    const viaUrl = new URLSearchParams({ t: encodeTexts(texts) }).toString();
    expect(decodeTexts(new URLSearchParams(viaUrl).get("t"))).toEqual(texts);
  });
  it("handles missing param", () => expect(decodeTexts(null)).toEqual([]));
});
