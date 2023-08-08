import type { LatLng, IMaps } from "./maps.ts";
import type { IBsky } from "./bsky.ts";

export class Bot {
  constructor(readonly maps: IMaps, readonly bsky: IBsky) {}

  async run() {
    const latLng: LatLng = [65.745886, -37.199233];
    const imagery = await this.maps.getImageryAround(latLng);

    await this.bsky.postImage("", imagery);
  }
}
