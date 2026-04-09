import { expect, test, describe } from "vitest";
import { emojiForCountryIso } from "../src";

describe("emojiForCountryIso", () => {
  test("returns correct emoji", () => {
    expect(emojiForCountryIso("BR")).toEqual("🇧🇷");
    expect(emojiForCountryIso("CQ")).toEqual("🇨🇶");
  });

  test("returns undefined for invalid country iso", () => {
    expect(emojiForCountryIso("XX")).toBeUndefined();
    expect(emojiForCountryIso("br")).toBeUndefined();
    expect(emojiForCountryIso("1234")).toBeUndefined();
  });
});
