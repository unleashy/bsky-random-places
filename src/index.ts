import fs from "node:fs";
import zlib from "node:zlib";
import { json } from "node:stream/consumers";
import { type MultiPolygon, type Polygon } from "geojson";

export interface CountryData {
  [iso: string]: Polygon | MultiPolygon;
}

export function getCountryData(path: string): Promise<CountryData> {
  return json(
    fs.createReadStream(path).pipe(zlib.createBrotliDecompress()),
  ) as Promise<CountryData>;
}
