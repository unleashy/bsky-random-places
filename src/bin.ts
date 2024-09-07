import fs from "node:fs/promises";
import {
  getCountryData,
  selectRandomCountry,
  mapToCountry,
  fetchStreetView,
} from "./index.ts";

function requireEnv(key: string): string {
  let value = process.env[key];
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`expected ${key} to be present in environment`);
  }

  return value.trim();
}

function attempt<T>(max: number, f: () => T | undefined): T | undefined {
  for (let i = 0; i < max; i++) {
    let result = f();
    if (result !== undefined) return result;
  }

  return undefined;
}

const MAX_ATTEMPTS = 1000;
const MAPS_KEY = requireEnv("BSKY_RANDOM_PLACES_MAPS_KEY");
const MAPS_SECRET = requireEnv("BSKY_RANDOM_PLACES_MAPS_SECRET");

let countryData = await getCountryData(
  import.meta.dirname + "/data/countries.json.br",
);

while (true) {
  let [iso, country] = selectRandomCountry(countryData, Math.random());
  let position = attempt(MAX_ATTEMPTS, () =>
    mapToCountry(country, [Math.random(), Math.random()]),
  );

  if (!position) {
    console.log(`no position for country ${iso}! retrying`);
    continue;
  }

  console.log(`fetching ${position.toReversed().join(", ")}`);
  let imagery = await fetchStreetView(position, {
    urls: {
      imagery: "https://maps.googleapis.com/maps/api/streetview",
      metadata: "https://maps.googleapis.com/maps/api/streetview/metadata",
    },
    params: {
      size: "768x480",
      fov: "60",
      radius: "1000",
    },
    key: MAPS_KEY,
    secret: MAPS_SECRET,
  });

  if (!imagery) {
    console.log("no imagery! retrying");
    continue;
  }

  await fs.writeFile("test.jpg", imagery.image);
  console.log(`done ${iso} at ${imagery.position.toReversed().join(", ")}`);

  break;
}
