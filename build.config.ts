import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/bin.ts"],
  replace: {
    "import.meta.vitest": "undefined",
  },
  sourcemap: true,
  clean: true,
});
