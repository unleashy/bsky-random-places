import { describe, it, expect } from "vitest";
import { MapsUrl, validateMapsResponse } from "../src/maps.ts";

describe("MapsUrl", () => {
  it("constructs an url", () => {
    const sut = new MapsUrl({
      base: "https://example.com/foobar",
      params: { a: "123", b: "456" }
    });

    expect(sut.toUrl()).toEqual(
      new URL("https://example.com/foobar?a=123&b=456")
    );
  });

  it("lets you add params", () => {
    const sut = new MapsUrl({
      base: "https://example.com/foobar",
      params: { a: "123", b: "456" }
    });

    const result = sut.addParam("another", "one");

    expect(result.toUrl()).toEqual(
      new URL("https://example.com/foobar?a=123&b=456&another=one")
    );
  });

  it("lets you add a signature", () => {
    const sut = new MapsUrl({
      base: "https://example.com/foobar",
      params: { a: "123", b: "456" }
    });

    const result = sut.addSignature("the secret");

    expect(result.toUrl()).toMatchInlineSnapshot(
      '"https://example.com/foobar?a=123&b=456&signature=6cbWHfHaS31PPQR5JkhpP9Ti_TQ"'
    );
  });
});

describe("validateMapsResponse", () => {
  it("expects an image Content-Type body on success", async () => {
    const sut = new Response(null, {
      status: 200,
      headers: { "Content-Type": "image/jpeg" }
    });

    await expect(validateMapsResponse(sut)).resolves;
  });

  it("throws on unsuccessful response", async () => {
    const sut = new Response(null, { status: 404, statusText: "Not Found" });

    await expect(validateMapsResponse(sut)).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      "Google Maps API fetch was not successful.
      URL: 
      Response:
      404 Not Found


      (binary response body)"
    `);
  });

  it("throws on bad content type", async () => {
    const sut = new Response(null, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });

    await expect(validateMapsResponse(sut)).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      "Google Maps API fetch was not successful.
      URL: 
      Response:
      200 
      content-type: text/plain

      "
    `);
  });
});
