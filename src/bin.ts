import { Bot, getCountryData, LoggingMaps } from "./index.ts";

function requireEnv(key: string): string {
  let value = process.env[key];
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`expected ${key} to be present in environment`);
  }

  return value.trim();
}

let countryData = await getCountryData(
  import.meta.dirname + "/data/countries.json.br",
);

let bot = new Bot(
  new LoggingMaps(
    {
      size: "640x480",
      fov: "60",
      radius: "1000",
      key: requireEnv("BSKY_RANDOM_PLACES_MAPS_KEY"),
    },
    requireEnv("BSKY_RANDOM_PLACES_MAPS_SECRET"),
  ),
  countryData,
);

await bot.run();
