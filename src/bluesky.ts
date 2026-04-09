import { type Agent, AtpAgent, RichText } from "@atproto/api";
import { emojiForCountryIso, type Survey } from "./geo.ts";
import { type Viewpoint } from "./maps.ts";

export interface LoginOptions {
  service: string;
  identifier: string;
  password: string;
}

export interface SocialService {
  post(survey: Survey, viewpoint: Viewpoint): Promise<void>;
}

export class Bluesky implements SocialService {
  constructor(
    private readonly date: Date,
    private readonly agent: Agent,
  ) {}

  static async login(options: LoginOptions): Promise<Bluesky> {
    let agent = new AtpAgent({ service: options.service });
    await agent.login(options);

    return new Bluesky(new Date(), agent);
  }

  async post(
    survey: Survey,
    { position, imagery, address }: Viewpoint,
  ): Promise<void> {
    address ??= "Unknown location";

    let emoji = emojiForCountryIso(survey.countryIso) ?? "🌎";

    let link = `${emoji} ${address}\n🗺️ View on Google Maps`;
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
      createdAt: this.date.toISOString(),
    });
  }
}
