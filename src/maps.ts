import { createHmac } from "node:crypto";
import { type Position } from "geojson";
import { round } from "@turf/turf";

export interface Imagery {
  image: Uint8Array;
  mime: string;
  position: Position;
}

export interface FetchStreetViewOptions {
  urls: {
    imagery: string;
    metadata: string;
  };
  key: string;
  secret: string;
  params: Record<string, string>;
}

export async function fetchStreetView(
  pos: Position,
  options: FetchStreetViewOptions,
): Promise<Imagery | undefined> {
  let metaRes = await fetch(buildUrl(options.urls.metadata, pos, options));
  if (!metaRes.ok) return undefined;

  let meta = (await metaRes.json()) as Record<string, unknown>;
  if (meta["status"] !== "OK") return undefined;

  let pano = meta["pano_id"] as string;
  let location = meta["location"] as { lat: number; lng: number };

  let res = await fetch(buildUrl2(options.urls.imagery, pano, options));
  if (!res.ok) throw new Error("bad response from imagery URL");

  return {
    image: new Uint8Array(await res.arrayBuffer()),
    mime: res.headers.get("Content-Type")!,
    position: [location.lng, location.lat].map((it) => round(it, 6)),
  };
}

function buildUrl(
  base: string,
  pos: Position,
  options: FetchStreetViewOptions,
) {
  let url = new URL(base);

  for (let [key, value] of Object.entries(options.params))
    url.searchParams.set(key, value);
  url.searchParams.set("location", pos.toReversed().join(","));
  url.searchParams.set("return_error_code", "true");
  url.searchParams.set("key", options.key);

  let signature = sign(url.pathname + url.search, options.secret);
  url.searchParams.set("signature", signature);

  return url;
}

function buildUrl2(
  base: string,
  pano: string,
  options: FetchStreetViewOptions,
) {
  let url = new URL(base);

  for (let [key, value] of Object.entries(options.params))
    url.searchParams.set(key, value);
  url.searchParams.set("pano", pano);
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
