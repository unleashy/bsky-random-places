import { type Position } from "geojson";
import { Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { UrlBuilder } from "./url-builder.ts";

export interface ImageryMetadata {
  pano: string;
  position: Position;
  copyright: string;
}

export interface Imagery {
  image: Blob;
  mime: string;
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
      plus_code: Type.Optional(
        Type.Object({
          compound_code: Type.String(),
        }),
      ),
      results: Type.Array(
        Type.Object({
          formatted_address: Type.String(),
        }),
      ),
    }),
    GoogleError,
  ]),
);

export class Maps {
  constructor(
    private readonly params: { key: string } & Record<string, string>,
    private readonly secret: string,
  ) {}

  async tryGetMetadata(
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
    let metadata = MetadataResponse.Decode(body);
    if (["ZERO_RESULTS", "NOT_FOUND"].includes(metadata.status)) return;
    if (metadata.status !== "OK") throw await mapsError(res, body);

    return {
      pano: metadata.pano_id,
      copyright: metadata.copyright,
      position: [metadata.location.lng, metadata.location.lat],
    };
  }

  async getImagery(pano: string): Promise<Imagery> {
    let url = new UrlBuilder({
      base: "https://maps.googleapis.com/maps/api/streetview",
      params: this.params,
    })
      .addParam("pano", pano)
      .addParam("return_error_code", "true")
      .addSignature(this.secret)
      .toUrl();

    let res = await fetch(url);
    if (!res.ok) throw await mapsError(res);

    return {
      image: await res.blob(),
      mime: res.headers.get("Content-Type")!,
    };
  }

  async getAddress(position: Position): Promise<string | undefined> {
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
    return (
      address.results[0].formatted_address ?? address.plus_code?.compound_code
    );
  }
}

export class LoggingMaps extends Maps {
  override async tryGetMetadata(
    position: Position,
  ): Promise<ImageryMetadata | undefined> {
    let result = await super.tryGetMetadata(position);
    if (result === undefined)
      console.log(`no imagery at ${position.toReversed().join(", ")}`);

    return result;
  }

  override getAddress(position: Position): Promise<string | undefined> {
    console.log(`getting address for ${position.toReversed().join(", ")}`);
    return super.getAddress(position);
  }
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
    responseBody = String(body);
  }

  return new Error(
    `Google Maps API fetch was not successful.\n` +
      `URL: ${response.url}\n` +
      `Response:\n` +
      `${response.status} ${response.statusText}\n` +
      `${headersString}\n\n` +
      `${responseBody}`,
  );
}
