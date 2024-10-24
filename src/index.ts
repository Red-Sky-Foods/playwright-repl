const repl = require("node:repl");

repl.builtinModules = ["@playwright/test"];

import options from "./options";
import loadReplCommands from "./commands/index";

const replServer = repl.start({
  useColors: true,
  prompt: "playwright> ",
});

loadReplCommands(replServer);

replServer.on("exit", () => {
  process.exit();
});

if (options.url) {
  replServer.commands.chromium.action.apply(replServer, []);
}
