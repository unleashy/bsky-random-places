import fs from "node:fs/promises";
import { type Maps } from "./maps.ts";
import { type CountryData, mapToCountry, selectRandomCountry } from "./geo.ts";

const MAX_POSITION_ATTEMPTS = 1000;

export class Bot {
  constructor(
    private readonly maps: Maps,
    private readonly countryData: CountryData,
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

      let imagery = await this.maps.getImagery(meta.pano);
      await fs.writeFile("test.jpg", imagery.image.stream());

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
