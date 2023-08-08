import type { AtpAgentLoginOpts, BskyAgent as BskyAgentT } from "@atproto/api";
import atproto from "@atproto/api";
import type { Imagery } from "./maps.ts";

// @ts-expect-error: atproto oesn't have proper exports, so we have to do this
const { BskyAgent } = atproto;

export type IBsky = {
  postImage: (text: string, image: Imagery) => Promise<void>;
};

export class Bsky implements IBsky {
  constructor(readonly agent: BskyAgentT) {}

  static async login(opts: AtpAgentLoginOpts): Promise<IBsky> {
    const agent: BskyAgentT = new BskyAgent({ service: "https://bsky.social" });
    await agent.login(opts);
    return new Bsky(agent);
  }

  async postImage(text: string, imagery: Imagery): Promise<void> {
    // TODO: implement this
  }
}
