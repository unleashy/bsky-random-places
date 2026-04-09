import {
  Bluesky,
  GoogleMaps,
  LoggingMaps,
  RandomGeographer,
  readCountryData,
  run,
} from "./index.ts";

function requireEnv(key: string): string {
  let value = process.env[key];
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`expected ${key} to be present in environment`);
  }

  return value.trim();
}

let geo = new RandomGeographer({
  countryData: await readCountryData(
    import.meta.dirname + "/data/countries.json.br",
  ),
  maxAttempts: 1000,
  excludedCountriesIso: ["IL"],
});

let maps = new LoggingMaps(
  new GoogleMaps(
    {
      size: "640x480",
      fov: "60",
      radius: "1000",
      key: requireEnv("BSKY_RANDOM_PLACES_MAPS_KEY"),
    },
    requireEnv("BSKY_RANDOM_PLACES_MAPS_SECRET"),
  ),
);

let bluesky = await Bluesky.login({
  service: "https://bsky.social",
  identifier: requireEnv("BSKY_RANDOM_PLACES_USERNAME"),
  password: requireEnv("BSKY_RANDOM_PLACES_PASSWORD"),
});

while (!(await run(geo, maps, bluesky))) {}
