import { describe, it, expect } from "vitest";
import type { IBsky } from "../src/bsky.ts";
import type { LatLng, IMaps, Imagery } from "../src/maps.ts";
import { Bot } from "../src/bot.ts";

class FakeMaps implements IMaps {
  calls: LatLng[] = [];
  result: Imagery = { image: new Uint8Array(128), mime: "image/jpeg" };

  async getImageryAround(latLng: LatLng): Promise<Imagery> {
    this.calls.push(latLng);
    return this.result;
  }
}

class FakeBsky implements IBsky {
  calls: Array<[string, Imagery]> = [];

  async postImage(text: string, imagery: Imagery): Promise<void> {
    this.calls.push([text, imagery]);
  }
}

describe("run", () => {
  it("posts the image from street view", async () => {
    const maps = new FakeMaps();
    const bsky = new FakeBsky();
    const sut = new Bot(maps, bsky);

    await sut.run();

    expect(maps.calls).toEqual([[65.745886, -37.199233]]);
    expect(bsky.calls).toEqual([["", maps.result]]);
  });
});
