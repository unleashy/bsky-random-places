import { type AtpAgentLoginOpts } from "@atproto/api";
import * as t from "typanion";
import { MapsOpts } from "./maps.ts";

const isNonBlank = t.cascade(t.isString(), [
  t.hasMinLength(1),
  t.matchesRegExp(/\S/)
]);

export function getLoginOpts(env: Record<string, unknown>): AtpAgentLoginOpts {
  t.assertWithErrors(
    env,
    t.isPartial({ BSKY_IDENTIFIER: isNonBlank, BSKY_PASSWORD: isNonBlank })
  );

  return {
    identifier: env.BSKY_IDENTIFIER.trim(),
    password: env.BSKY_PASSWORD.trim()
  };
}

export function getMapsOpts(env: Record<string, unknown>): MapsOpts {
  t.assertWithErrors(
    env,
    t.isPartial({ MAPS_API_KEY: isNonBlank, MAPS_SIGNING_SECRET: isNonBlank })
  );

  return {
    key: env.MAPS_API_KEY.trim(),
    secret: env.MAPS_SIGNING_SECRET.trim()
  };
}
