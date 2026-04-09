import { type Position } from "geojson";
import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { UrlBuilder } from "./url-builder.ts";

export interface ImagerySize {
  width: number;
  height: number;
}

export interface Imagery {
  image: Blob;
  mime: string;
  size: ImagerySize;
}

export interface Viewpoint {
  position: Position;
  imagery: Imagery;
  address: string | undefined;
}

export interface Maps {
  getViewpoint(position: Position): Promise<Viewpoint | undefined>;
}

const GoogleError = Type.Object({
  status: Type.Union([
    Type.Literal("ZERO_RESULTS"),
    Type.Literal("NOT_FOUND"),
    Type.Literal("OVER_QUERY_LIMIT"),
    Type.Literal("REQUEST_DENIED"),
    Type.Literal("INVALID_REQUEST"),
    Type.Literal("UNKNOWN_ERROR"),
  ]),
});

const MetadataResponse = TypeCompiler.Compile(
  Type.Union([
    Type.Object({
      status: Type.Literal("OK"),
      copyright: Type.String(),
      location: Type.Object({
        lat: Type.Number(),
        lng: Type.Number(),
      }),
      pano_id: Type.String(),
    }),
    GoogleError,
  ]),
);

const AddressResponse = TypeCompiler.Compile(
  Type.Union([
    Type.Object({
      status: Type.Literal("OK"),
      results: Type.Array(
        Type.Object({
          formatted_address: Type.String(),
        }),
      ),
    }),
    GoogleError,
  ]),
);

export class GoogleMaps implements Maps {
  constructor(
    private readonly params: {
      key: string;
      size: `${number}x${number}`;
    } & Record<string, string>,
    private readonly secret: string,
  ) {}

  async getViewpoint(position: Position): Promise<Viewpoint | undefined> {
    let meta = await this.getMetadata(position);
    if (!meta) return;
    if (!meta.copyright.includes("Google")) return;

    let [imagery, address] = await Promise.all([
      this.getImagery(meta.pano),
      this.getAddress(meta.position),
    ]);

    return {
      position: meta.position,
      imagery,
      address,
    };
  }

  private async getMetadata(
    position: Position,
  ): Promise<ImageryMetadata | undefined> {
    let url = new UrlBuilder({
      base: "https://maps.googleapis.com/maps/api/streetview/metadata",
      params: this.params,
    })
      .addParam("location", position.toReversed().join(","))
      .addSignature(this.secret)
      .toUrl();

    let res = await fetch(url);
    if (!res.ok) return;

    let body = await res.json();
    let meta = MetadataResponse.Decode(body);
    if (["ZERO_RESULTS", "NOT_FOUND"].includes(meta.status)) return;
    if (meta.status !== "OK") throw await mapsError(res, body);

    return {
      pano: meta.pano_id,
      copyright: meta.copyright,
      position: [meta.location.lng, meta.location.lat],
    };
  }

  private async getImagery(pano: string): Promise<Imagery> {
    let url = new UrlBuilder({
      base: "https://maps.googleapis.com/maps/api/streetview",
      params: this.params,
    })
      .addParam("pano", pano)
      .addParam("return_error_code", "true")
      .addSignature(this.secret)
      .toUrl();

    let res = await fetch(url);
    let mime = res.headers.get("Content-Type");
    if (!(res.ok && mime)) throw await mapsError(res);

    let size = this.params.size.split("x").map(Number);
    return {
      image: await res.blob(),
      mime,
      size: {
        width: size[0],
        height: size[1],
      },
    };
  }

  private async getAddress(position: Position): Promise<string | undefined> {
    let url = new UrlBuilder({
      base: "https://maps.googleapis.com/maps/api/geocode/json",
      params: { key: this.params.key },
    })
      .addParam("latlng", position.toReversed().join(","))
      .toUrl();

    let res = await fetch(url);
    if (!res.ok) return;

    let body = await res.json();
    let address = AddressResponse.Decode(body);
    if (["ZERO_RESULTS", "NOT_FOUND"].includes(address.status)) return;
    if (address.status !== "OK") throw await mapsError(res, body);

    if (address.results.length === 0) return;
    return address.results[0].formatted_address;
  }
}

interface ImageryMetadata {
  pano: string;
  position: Position;
  copyright: string;
}

async function mapsError(response: Response, body?: unknown): Promise<Error> {
  let headersString = [...response.headers.entries()]
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")
    .trim();

  let responseBody = "(binary response body)";
  if (body === undefined) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (
      contentType.startsWith("text") ||
      contentType.startsWith("application/json")
    ) {
      responseBody = await response.text();
    }
  } else {
    responseBody = JSON.stringify(body) ?? "";
  }

  return new Error(
    `Google Maps API fetch was not successful.\n` +
      `URL: ${response.url}\n` +
      `Response:\n` +
      `${response.status} ${response.statusText}\n` +
      `${headersString}\n\n` +
      responseBody,
  );
}

export class LoggingMaps implements Maps {
  constructor(private readonly impl: Maps) {}

  async getViewpoint(position: Position): Promise<Viewpoint | undefined> {
    console.log(`trying viewpoint ${position.toReversed().join(", ")}`);

    let viewpoint = await this.impl.getViewpoint(position);
    if (!viewpoint) return undefined;

    console.log(`gotcha! ${viewpoint.position.toReversed().join(", ")}`);

    return viewpoint;
  }
}
