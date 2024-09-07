import fs from "node:fs";
import zlib from "node:zlib";
import { json } from "node:stream/consumers";
import { type MultiPolygon, type Polygon, type Position } from "geojson";
import { booleanPointInPolygon, bbox, round } from "@turf/turf";

export type CountryPolygon = Polygon | MultiPolygon;

export interface CountryData {
  readonly [iso: string]: CountryPolygon;
}

export async function getCountryData(path: string): Promise<CountryData> {
  return Object.freeze(
    await json(fs.createReadStream(path).pipe(zlib.createBrotliDecompress())),
  );
}

export function selectRandomCountry(
  cd: CountryData,
  r: number,
): CountryPolygon {
  let cs = Object.keys(cd);
  let i = Math.floor(denorm(r, 0, cs.length));
  let c = cs[i];

  return cd[c];
}

export function mapToCountry(
  c: CountryPolygon,
  [rlong, rlat]: Position,
): Position | undefined {
  let b = bbox(c);
  let attempt = [denorm(rlong, b[0], b[2]), denorm(rlat, b[1], b[3])];
  return booleanPointInPolygon(attempt, c)
    ? attempt.map((it) => round(it, 6))
    : undefined;
}

function denorm(r: number, min: number, max: number): number {
  return min + r * (max - min);
}
