import { env } from "node:process";
import { getLoginOpts, getMapsOpts } from "./config.ts";
import { Maps, MapsUrl } from "./maps.ts";
import { Bsky } from "./bsky.ts";
import { Bot } from "./bot.ts";

const mapsOpts = getMapsOpts(env);
const loginOpts = getLoginOpts(env);

const bot = new Bot(
  new Maps(
    new MapsUrl({
      base: "https://maps.googleapis.com/maps/api/streetview",
      params: {
        size: "640x480",
        fov: "70",
        key: mapsOpts.key
      }
    }),
    mapsOpts.secret
  ),
  await Bsky.login(loginOpts)
);

await bot.run();
