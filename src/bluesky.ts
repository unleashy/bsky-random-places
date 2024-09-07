import {
  type Agent,
  AtpAgent,
  CredentialSession,
  RichText,
} from "@atproto/api";
import { type Imagery } from "./maps.ts";

export interface LoginOptions {
  service: string;
  identifier: string;
  password: string;
}

export class Bluesky {
  constructor(private readonly agent: Agent) {}

  static async login(options: LoginOptions): Promise<Bluesky> {
    let session = new CredentialSession(new URL(options.service));
    let agent = new AtpAgent(session);
    await agent.login(options);

    return new Bluesky(agent);
  }

  async post(text: string, imagery: Imagery, date: Date): Promise<void> {
    let rt = new RichText({ text });
    await rt.detectFacets(this.agent);

    let { data } = await this.agent.uploadBlob(imagery.image, {
      headers: { "Content-Type": imagery.mime },
    });

    await this.agent.post({
      text: rt.text,
      facets: rt.facets,
      embed: {
        $type: "app.bsky.embed.images",
        images: [{ image: data.blob, alt: "" }],
      },
      createdAt: date.toISOString(),
    });
  }
}
