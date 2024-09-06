import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "./src/bin.ts",
    {
      builder: "mkdist",
      input: "./src/data",
      outDir: "./dist/data",
    },
  ],
  replace: {
    "import.meta.vitest": "undefined",
  },
  sourcemap: true,
  clean: true,
});
