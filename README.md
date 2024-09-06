# bsky-random-places

[Bluesky](https://bsky.app/) bot that posts a random image from Street View at
a predefined schedule.

## Development

You will need to provide the bot’s username, app password, Maps API key and
signing secret through environment variables:

```
BSKY_RANDOM_PLACES_USERNAME
BSKY_RANDOM_PLACES_PASSWORD
BSKY_RANDOM_PLACES_MAPS_KEY
BSKY_RANDOM_PLACES_MAPS_SECRET
```

Then build with `yarn build` and deploy by running the `bin.mjs` file in `dist`.

## Licence

[MIT](LICENSE.txt)

`countries.json.br` sourced from [World Bank](https://datacatalog.worldbank.org/search/dataset/0038272/World-Bank-Official-Boundaries),
and then transformed from Shapefile to Brotli-compressed GeoJSON by me
