import { describe, it, expect } from "vitest";
import { sign } from "../src/sign.ts";

describe("sign", () => {
  it("uses base64-encoded HMAC-SHA1 to sign strings", () => {
    expect(
      sign("some message", Buffer.from("it's a secret!").toString("base64url"))
    ).toMatchInlineSnapshot('"iCBwRV9JDKrR-pwBYL3CgzV0PK4"');
  });
});
