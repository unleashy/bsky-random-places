import { describe, it, expect } from "vitest";
import { getLoginOpts, getMapsOpts } from "../src/config.ts";

describe("getLoginOpts", () => {
  it("reformats env object to fit AtpAgentLoginOpts", () => {
    expect(
      getLoginOpts({ BSKY_IDENTIFIER: "foo", BSKY_PASSWORD: "bar" })
    ).toEqual({ identifier: "foo", password: "bar" });
  });

  it("trims whitespace", () => {
    expect(
      getLoginOpts({ BSKY_IDENTIFIER: " bread ", BSKY_PASSWORD: " and eggs " })
    ).toEqual({ identifier: "bread", password: "and eggs" });
  });

  it("allows extraneous properties", () => {
    expect(
      getLoginOpts({
        BSKY_IDENTIFIER: "a",
        BSKY_PASSWORD: "b",
        PATH: "epically:long:string",
        SOMETHING_ELSE: "here"
      })
    ).toEqual({ identifier: "a", password: "b" });
  });

  it("requires 'BSKY_IDENTIFIER' and 'BSKY_PASSWORD'", () => {
    expect(() => getLoginOpts({})).toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .BSKY_IDENTIFIER: Expected a string (got undefined)
      - .BSKY_PASSWORD: Expected a string (got undefined)"
    `);
  });

  it("requires BSKY_IDENTIFIER and BSKY_PASSWORD to be non-blank strings", () => {
    expect(() => getLoginOpts({ BSKY_IDENTIFIER: "", BSKY_PASSWORD: "" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .BSKY_IDENTIFIER: Expected to have a length of at least 1 elements (got 0)
      - .BSKY_PASSWORD: Expected to have a length of at least 1 elements (got 0)"
    `);

    expect(() => getLoginOpts({ BSKY_IDENTIFIER: "  ", BSKY_PASSWORD: " " }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .BSKY_IDENTIFIER: Expected to match the pattern /\\\\S/ (got \\"  \\")
      - .BSKY_PASSWORD: Expected to match the pattern /\\\\S/ (got \\" \\")"
    `);
  });
});

describe("getMapsOpts", () => {
  it("reformats env object to fit MapsOpts", () => {
    expect(
      getMapsOpts({ MAPS_API_KEY: "foo", MAPS_SIGNING_SECRET: "bar" })
    ).toEqual({ key: "foo", secret: "bar" });
  });

  it("trims whitespace", () => {
    expect(
      getMapsOpts({
        MAPS_API_KEY: " bread ",
        MAPS_SIGNING_SECRET: "  and eggs  "
      })
    ).toEqual({ key: "bread", secret: "and eggs" });
  });

  it("allows extraneous properties", () => {
    expect(
      getMapsOpts({
        MAPS_API_KEY: "a",
        MAPS_SIGNING_SECRET: "b",
        PATH: "epically:long:string",
        SOMETHING_ELSE: "here"
      })
    ).toEqual({ key: "a", secret: "b" });
  });

  it("requires 'MAPS_API_KEY' and 'MAPS_SIGNING_SECRET'", () => {
    expect(() => getMapsOpts({})).toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .MAPS_API_KEY: Expected a string (got undefined)
      - .MAPS_SIGNING_SECRET: Expected a string (got undefined)"
    `);
  });

  it("requires MAPS_API_KEY and MAPS_SIGNING_SECRET to be non-blank strings", () => {
    expect(() => getMapsOpts({ MAPS_API_KEY: "", MAPS_SIGNING_SECRET: "" }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .MAPS_API_KEY: Expected to have a length of at least 1 elements (got 0)
      - .MAPS_SIGNING_SECRET: Expected to have a length of at least 1 elements (got 0)"
    `);

    expect(() => getMapsOpts({ MAPS_API_KEY: "  ", MAPS_SIGNING_SECRET: " " }))
      .toThrowErrorMatchingInlineSnapshot(`
      "Type mismatch

      - .MAPS_API_KEY: Expected to match the pattern /\\\\S/ (got \\"  \\")
      - .MAPS_SIGNING_SECRET: Expected to match the pattern /\\\\S/ (got \\" \\")"
    `);
  });
});
