import { env } from "node:process";
import type { BskyAgent as BskyAgentT } from "@atproto/api";
import atproto from "@atproto/api";
import { getLoginOpts } from "./config.ts";

// @ts-expect-error: atproto oesn't have proper exports, so we have to do this
const { BskyAgent } = atproto;

const agent: BskyAgentT = new BskyAgent({ service: "https://bsky.social" });
await agent.login(getLoginOpts(env));
