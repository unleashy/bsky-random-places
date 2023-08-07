import { type AtpAgentLoginOpts } from "@atproto/api";
import * as t from "typanion";

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
