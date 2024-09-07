import { createHmac } from "node:crypto";
import { type Position } from "geojson";

export interface Imagery {
  image: Uint8Array;
  mime: string;
}

export interface FetchStreetViewOptions {
  url: string;
  key: string;
  secret: string;
  params: Record<string, string>;
}

export async function fetchStreetView(
  pos: Position,
  options: FetchStreetViewOptions,
): Promise<Imagery | undefined> {
  let res = await fetch(buildUrl(pos, options));
  if (!(res.ok && res.headers.get("Content-Type")?.startsWith("image")))
    return undefined;

  return {
    image: new Uint8Array(await res.arrayBuffer()),
    mime: res.headers.get("Content-Type")!,
  };
}

function buildUrl(pos: Position, options: FetchStreetViewOptions) {
  let url = new URL(options.url);

  for (let [key, value] of Object.entries(options.params))
    url.searchParams.set(key, value);
  url.searchParams.set("location", pos.toReversed().join(","));
  url.searchParams.set("return_error_code", "true");
  url.searchParams.set("key", options.key);

  let signature = sign(url.pathname + url.search, options.secret);
  url.searchParams.set("signature", signature);

  return url;
}

function sign(subject: string, secret: string): string {
  return createHmac("sha1", Buffer.from(secret, "base64url"))
    .update(subject)
    .digest("base64url");
}
