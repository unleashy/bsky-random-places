import { sign } from "./sign.ts";

export type LatLng = readonly [number, number];

export type Imagery = {
  image: Uint8Array;
  mime: string;
};

export type IMaps = {
  getImageryAround: (latLng: LatLng) => Promise<Imagery>;
};

export type MapsOpts = { key: string; secret: string };

export type MapsUrlOpts = {
  base: string;
  params: Record<string, string>;
};

export class MapsUrl {
  private readonly base: string;
  private readonly params: Record<string, string>;

  constructor({ base, params }: MapsUrlOpts) {
    this.base = base;
    this.params = params;
  }

  addParam(key: string, value: string): MapsUrl {
    return new MapsUrl({
      base: this.base,
      params: { ...this.params, [key]: value }
    });
  }

  addSignature(secret: string): MapsUrl {
    const url = this.toUrl();
    const subject = url.pathname + url.search;
    const signature = sign(subject, secret);
    return this.addParam("signature", signature);
  }

  toUrl(): URL {
    const result = new URL(this.base);
    for (const [key, value] of Object.entries(this.params)) {
      result.searchParams.set(key, value);
    }
    return result;
  }
}

export async function validateMapsResponse(response: Response): Promise<void> {
  if (
    response.ok &&
    response.headers.get("Content-Type")?.startsWith("image")
  ) {
    return;
  }

  let headersString = "";
  response.headers.forEach((v, k) => (headersString += `${k}: ${v}\n`));
  headersString = headersString.trim();

  let responseBody = "(binary response body)";
  const contentType = response.headers.get("Content-Type") ?? "";
  if (
    contentType.startsWith("text") ||
    contentType.startsWith("application/json")
  ) {
    responseBody = await response.text();
  }

  throw new Error(
    `Google Maps API fetch was not successful.\n` +
      `URL: ${response.url}\n` +
      `Response:\n` +
      `${response.status} ${response.statusText}\n` +
      `${headersString}\n\n` +
      `${responseBody}`
  );
}

export class Maps implements IMaps {
  constructor(readonly url: MapsUrl, readonly secret: string) {}

  async getImageryAround(latLng: LatLng): Promise<Imagery> {
    const url = this.url
      .addParam("location", latLng.join(","))
      .addParam("return_error_code", "true")
      .addSignature(this.secret)
      .toUrl();

    const response = await fetch(url);
    await validateMapsResponse(response);
    return {
      image: new Uint8Array(await response.arrayBuffer()),
      mime: response.headers.get("Content-Type")!
    };
  }
}
