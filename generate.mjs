import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cards, columns, guidedCard, lessons } from "./scenario.mjs";

const [cliRepo = "../orqen", output = "../orqen-gui/assets/tutorial.json", mode] = process.argv.slice(2);
const states = await import(pathToFileURL(resolve(cliRepo, "cli/dist/workflow/states.js")).href);
const source = execFileSync("git", ["-C", cliRepo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const project = JSON.parse(readFileSync(new URL("./project.json", import.meta.url), "utf8"));
const steps = lessons(states);
const mapped = (stage) => columns.filter((column) => column.stages.includes(stage)).length === 1;
let current = cards.find((card) => card.key === guidedCard)?.stage;
if (!current || !cards.every((card) => mapped(card.stage)) || steps[0].select !== true) {
  throw new Error("Invalid tutorial seed");
}
for (const { event } of steps) {
  if (!event) continue;
  if (event.from !== current || !mapped(event.to)) throw new Error(`Invalid tutorial transition from ${current}`);
  current = event.to;
}
if (current !== states.State.CLOSED || steps.at(-1).event) throw new Error("Tutorial must end with a closed request");

const bundle = JSON.stringify({ source, projectUrl: project.url, columns, cards, guidedCard, steps }, null, 2) + "\n";
if (mode === "--check") {
  if (readFileSync(output, "utf8").replaceAll("\r\n", "\n") !== bundle) {
    throw new Error("The GUI tutorial bundle is out of date");
  }
} else {
  writeFileSync(output, bundle);
}
