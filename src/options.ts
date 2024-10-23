import { program } from "commander";
import { BrowserOptions } from "./initializeBrowser.js";

program.option("--headed");
program.option("--timeout <value>", "Timeout in ms");
program.option("--url <value>", "Load URL");
program.parse();

const opts = program.opts();
const { headed, timeout } = opts;
const DEFAULT_TIMEOUT = 4000;
const options: BrowserOptions = {
  headed,
  timeout: timeout ?? DEFAULT_TIMEOUT,
};

if (opts.url) {
  options["url"] = opts.url;
}

export default options;
