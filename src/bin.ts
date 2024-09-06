import {
  getCountryData,
  selectRandomCountry,
  mapToCountry,
  attempt,
} from "./index.ts";

const MAX_ATTEMPTS = 1000;

let countryData = await getCountryData(
  import.meta.dirname + "/data/countries.json.br",
);

let country = selectRandomCountry(countryData, Math.random());
let position = attempt(MAX_ATTEMPTS, () =>
  mapToCountry(country, [Math.random(), Math.random()]),
);
