import { env } from "node:process";
import { getLoginOpts, getMapsOpts } from "./config.ts";
import { Maps } from "./maps.ts";
import { Bsky } from "./bsky.ts";
import { Bot } from "./bot.ts";

const mapsOpts = getMapsOpts(env);
const loginOpts = getLoginOpts(env);

const bot = new Bot(new Maps(mapsOpts), await Bsky.login(loginOpts));

await bot.run();
