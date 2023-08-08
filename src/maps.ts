export type LatLng = readonly [number, number];

export type Imagery = {
  image: Uint8Array;
  mime: string;
};

export type IMaps = {
  getImageryAround: (latLng: LatLng) => Promise<Imagery>;
};

export type MapsOpts = { key: string; secret: string };

export class Maps implements IMaps {
  constructor(readonly opts: MapsOpts) {}

  async getImageryAround(latLng: LatLng): Promise<Imagery> {
    // TODO: implement this
    return { image: new Uint8Array(), mime: "completely/wrong" };
  }
}
