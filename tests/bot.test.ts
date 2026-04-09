import { expect, test } from "vitest";
import { type Position } from "geojson";
import {
  type Geographer,
  type Maps,
  type SocialService,
  type Viewpoint,
  run,
  type Survey,
} from "../src";

test("posts an image", async () => {
  let survey: Survey = {
    position: [42, 42],
    countryIso: "XX",
  };
  let viewpoint: Viewpoint = {
    position: [42, 42],
    imagery: {
      image: new Blob([]),
      mime: "image/jpeg",
      size: { width: 100, height: 100 },
    },
    address: "Somewhere",
  };

  let geo = new FakeGeographer(survey);
  let maps = new FakeMaps(viewpoint);
  let social = new FakeSocialService();

  let ok = await run(geo, maps, social);

  expect(ok).toBe(true);
  expect(social.posts).toEqual([[survey, viewpoint]]);
});

test("does not post with no viewpoint", async () => {
  let viewpoint: Viewpoint = {
    position: [42, 42],
    imagery: {
      image: new Blob([]),
      mime: "image/jpeg",
      size: { width: 100, height: 100 },
    },
    address: "Somewhere",
  };

  let geo = new FakeGeographer({ position: [0, 0], countryIso: "" });
  let maps = new FakeMaps(viewpoint);
  let social = new FakeSocialService();

  let ok = await run(geo, maps, social);

  expect(ok).toBe(false);
  expect(social.posts).toEqual([]);
});

class FakeGeographer implements Geographer {
  constructor(readonly fakeSurvey: Survey) {}

  survey(): Survey {
    return this.fakeSurvey;
  }
}

class FakeMaps implements Maps {
  constructor(readonly viewpoint: Viewpoint) {}

  getViewpoint(position: Position): Promise<Viewpoint | undefined> {
    if (
      position[0] === this.viewpoint.position[0] &&
      position[1] === this.viewpoint.position[1]
    ) {
      return Promise.resolve(this.viewpoint);
    } else {
      return Promise.resolve(undefined);
    }
  }
}

class FakeSocialService implements SocialService {
  readonly posts: Array<[Survey, Viewpoint]> = [];

  post(survey: Survey, viewpoint: Viewpoint): Promise<void> {
    this.posts.push([survey, viewpoint]);
    return Promise.resolve();
  }
}
