import { program } from "commander";
import { BrowserOptions } from "./initializeBrowser.js";

program.option("--headed");
program.option("--timeout <value>", "Timeout in ms");
program.option("--url <value>", "Load URL");
program.option("--file <value>", "Load spec file");
program.parse();

const opts = program.opts();
const { headed, timeout, file } = opts;
const DEFAULT_TIMEOUT = 500;
const options: any = {
  headed,
  timeout: timeout ?? DEFAULT_TIMEOUT,
  file,
};

if (opts.url) {
  options["url"] = opts.url;
}

export default options;
