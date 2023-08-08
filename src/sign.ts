import { createHmac } from "node:crypto";

export function sign(text: string, secret: string): string {
  return createHmac("sha1", Buffer.from(secret, "base64url"))
    .update(text)
    .digest("base64url");
}
