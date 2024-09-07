import { createHmac } from "node:crypto";

export interface UrlBuilderOpts {
  base: string;
  params: Record<string, string>;
}

export class UrlBuilder {
  private readonly base: string;
  private readonly params: Record<string, string>;

  constructor({ base, params }: UrlBuilderOpts) {
    this.base = base;
    this.params = params;
  }

  addParam(key: string, value: string): UrlBuilder {
    return new UrlBuilder({
      base: this.base,
      params: { ...this.params, [key]: value },
    });
  }

  addSignature(secret: string): UrlBuilder {
    const url = this.toUrl();
    const subject = url.pathname + url.search;
    const signature = sign(subject, secret);
    return this.addParam("signature", signature);
  }

  toUrl(): URL {
    const result = new URL(this.base);
    for (const [key, value] of Object.entries(this.params))
      result.searchParams.set(key, value);
    return result;
  }
}

function sign(subject: string, secret: string): string {
  return createHmac("sha1", Buffer.from(secret, "base64url"))
    .update(subject)
    .digest("base64url");
}
