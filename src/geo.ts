import fs from "node:fs";
import zlib from "node:zlib";
import { json } from "node:stream/consumers";
import {
  type BBox,
  type MultiPolygon,
  type Polygon,
  type Position,
} from "geojson";
import { booleanPointInPolygon, bbox, round } from "@turf/turf";

export type CountryPolygon = Polygon | MultiPolygon;

export interface CountryData {
  readonly [iso: string]: CountryPolygon;
}

export async function readCountryData(path: string): Promise<CountryData> {
  return Object.freeze(
    await json(fs.createReadStream(path).pipe(zlib.createBrotliDecompress())),
  );
}

export interface Survey {
  position: Position;
  countryIso: string;
}

export function emojiForCountryIso(countryIso: string): string | undefined {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  if (!/^[A-Z][A-Z]$/.test(countryIso)) return undefined;

  const ASCII_START = "A".codePointAt(0)!;
  const FLAG_START = "🇦".codePointAt(0)!;

  let first = countryIso.codePointAt(0)! - ASCII_START;
  let second = countryIso.codePointAt(1)! - ASCII_START;

  let flag = String.fromCodePoint(FLAG_START + first, FLAG_START + second);

  return /^\p{RGI_Emoji_Flag_Sequence}$/v.test(flag) ? flag : undefined;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

export interface Geographer {
  survey(): Survey;
}

export interface RandomGeographerOptions {
  countryData: CountryData;
  maxAttempts: number;
  excludedCountriesIso: string[];
}

export class RandomGeographer implements Geographer {
  private readonly countryData: CountryData;
  private readonly maxAttempts: number;
  private readonly excludedCountriesIso: string[];

  constructor({
    countryData,
    maxAttempts,
    excludedCountriesIso,
  }: RandomGeographerOptions) {
    this.maxAttempts = maxAttempts;
    this.countryData = countryData;
    this.excludedCountriesIso = excludedCountriesIso;
  }

  survey(): Survey {
    while (true) {
      let countryIso = sampleKey(this.countryData);
      if (this.excludedCountriesIso.includes(countryIso)) {
        continue;
      }

      let country = this.countryData[countryIso];

      let position = randomPositionInPolygon(country, this.maxAttempts);
      if (position) return { position, countryIso };
    }
  }
}

function sampleKey<K extends string>(obj: Record<K, unknown>): K {
  let keys = Object.keys(obj);
  let sample = Math.floor(random(0, keys.length));
  return keys[sample] as K;
}

function randomPositionInPolygon(
  c: CountryPolygon,
  maxAttempts: number,
): Position | undefined {
  let b = bbox(c);

  return attempt(maxAttempts, () => {
    let p = randomPositionInBBox(b);
    return booleanPointInPolygon(p, c)
      ? p.map((it) => round(it, 6))
      : undefined;
  });
}

function randomPositionInBBox(bbox: BBox): Position {
  return [random(bbox[0], bbox[2]), random(bbox[1], bbox[3])];
}

function attempt<T>(max: number, f: () => T | undefined): T | undefined {
  for (let i = 0; i < max; i++) {
    let result = f();
    if (result !== undefined) return result;
  }

  return undefined;
}

function random(min: number, max: number): number {
  return denormalise(Math.random(), min, max);
}

function denormalise(r: number, min: number, max: number): number {
  return min + r * (max - min);
}
