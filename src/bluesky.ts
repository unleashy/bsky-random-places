import { type Agent, AtpAgent, RichText } from "@atproto/api";
import { type Position } from "geojson";
import { type Imagery } from "./maps.ts";

export interface LoginOptions {
  service: string;
  identifier: string;
  password: string;
}

export class Bluesky {
  constructor(private readonly agent: Agent) {}

  static async login(options: LoginOptions): Promise<Bluesky> {
    let agent = new AtpAgent({ service: options.service });
    await agent.login(options);

    return new Bluesky(agent);
  }

  async post(
    address: string,
    position: Position,
    imagery: Imagery,
    date: Date,
  ): Promise<void> {
    let link = `🌎 ${address}\n🗺️ View on Google Maps`;
    let rt = new RichText({
      text: link,
      facets: [],
    });
    rt.facets?.push({
      index: {
        byteStart: rt.unicodeText.utf16IndexToUtf8Index(link.indexOf("🗺️")),
        byteEnd: rt.unicodeText.utf16IndexToUtf8Index(link.length),
      },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: `https://google.com/maps/place/${position.toReversed().join(",")}/data=!3m1!1e3!4m2!3m1!1s0x0:0x0`,
        },
      ],
    });

    let { data } = await this.agent.uploadBlob(imagery.image, {
      headers: { "Content-Type": imagery.mime },
    });

    await this.agent.post({
      text: rt.text,
      facets: rt.facets,
      embed: {
        $type: "app.bsky.embed.images",
        images: [{ image: data.blob, alt: "", aspectRatio: imagery.size }],
      },
      langs: ["en"],
      createdAt: date.toISOString(),
    });
  }
}
