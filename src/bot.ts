import { type Geographer } from "./geo.ts";
import { type Maps } from "./maps.ts";
import { type SocialService } from "./bluesky.ts";

export async function run(
  geographer: Geographer,
  maps: Maps,
  socialService: SocialService,
): Promise<boolean> {
  let survey = geographer.survey();

  let viewpoint = await maps.getViewpoint(survey.position);
  if (!viewpoint) return false;

  await socialService.post(survey, viewpoint);

  return true;
}
