import fs from "node:fs";
import zlib from "node:zlib";
import { json } from "node:stream/consumers";
import { type MultiPolygon, type Polygon, type Position } from "geojson";
import { booleanPointInPolygon, bbox } from "@turf/turf";

export type CountryPolygon = Polygon | MultiPolygon;

export interface CountryData {
  readonly [iso: string]: CountryPolygon;
}

export async function getCountryData(path: string): Promise<CountryData> {
  let cd = await json(
    fs.createReadStream(path).pipe(zlib.createBrotliDecompress()),
  );

  return Object.freeze(cd);
}

export function selectRandomCountry(
  cd: CountryData,
  r: number,
): CountryPolygon {
  let cs = Object.keys(cd);
  let i = Math.floor(denorm(r, 0, cs.length));

  return cd[cs[i]];
}

export function mapToCountry(
  c: CountryPolygon,
  [rlat, rlong]: Position,
): Position | undefined {
  let b = bbox(c);
  let attempt = [denorm(rlat, b[0], b[2]), denorm(rlong, b[1], b[3])];
  return booleanPointInPolygon(attempt, c) ? attempt : undefined;
}

function denorm(r: number, min: number, max: number): number {
  return min + r * (max - min);
}

export function attempt<T>(max: number, f: () => T | undefined): T | undefined {
  for (let i = 0; i < max; i++) {
    let result = f();
    if (result !== undefined) return result;
  }

  return undefined;
}
