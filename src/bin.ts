import { getCountryData } from "./index.ts";

let cd = await getCountryData(import.meta.dirname + "/data/countries.json.br");
