import { type CountryData, mapToCountry, selectRandomCountry } from "./geo.ts";
import { type Maps } from "./maps.ts";
import { type Bluesky } from "./bluesky.ts";

const MAX_POSITION_ATTEMPTS = 1000;

export class Bot {
  constructor(
    private readonly countryData: CountryData,
    private readonly maps: Maps,
    private readonly bluesky: Bluesky,
  ) {}

  async run(): Promise<void> {
    while (true) {
      let country = selectRandomCountry(this.countryData, Math.random());
      let position = attempt(MAX_POSITION_ATTEMPTS, () =>
        mapToCountry(country, [Math.random(), Math.random()]),
      );

      if (!position) continue;

      let meta = await this.maps.tryGetMetadata(position);
      if (!meta) continue;
      if (!meta.copyright.includes("Google")) continue;

      let [imagery, address] = await Promise.all([
        this.maps.getImagery(meta.pano),
        this.maps.getAddress(meta.position),
      ]);

      await this.bluesky.post(
        address ?? "Unknown location",
        imagery,
        new Date(),
      );

      break;
    }
  }
}

function attempt<T>(max: number, f: () => T | undefined): T | undefined {
  for (let i = 0; i < max; i++) {
    let result = f();
    if (result !== undefined) return result;
  }

  return undefined;
}
