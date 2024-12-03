import { table } from "table";
import getVisibleElements from "../getVisibleElements";
import chromiumAction from "./chromium";
import clickAction from "./click";
import expectAction from "./expect";
import fillAction from "./fill";
import { discoverAction } from "./discoverAction";

const loadReplCommands = (replServer: any) => {
  replServer.defineCommand("clear", {
    help: "Clear buffer",
    action() {
      console.clear();
      this.displayPrompt();
    },
  });

  replServer.defineCommand("chromium", {
    help: "Launch a new Chromium browser",
    action() {
      return chromiumAction(this, replServer);
    },
  });

  replServer.defineCommand("fill", {
    help: "Fill an input field",
    action(argumentsString: string) {
      return fillAction(this, argumentsString);
    },
  });

  replServer.defineCommand("click", {
    help: "Click an interactive element",
    action(argumentsString: string) {
      return clickAction(this, argumentsString);
    },
  });

  replServer.defineCommand("visible", {
    help: "Get visible elements",
    async action(type: string) {
      const mapElementsToColumns = (element: any) => [
        element.tagName,
        element.innerText,
        element.suggestedSelector,
      ];
      const { interactiveElements, staticElements } = await getVisibleElements(
        this.context.page,
      );

      if (type.startsWith("json")) {
        console.log("[ tagName, innerText, suggestedSelector ]");
        if (type.includes("interactive")) {
          console.log(
            JSON.stringify(interactiveElements.map(mapElementsToColumns)),
          );
        } else {
          console.log(
            JSON.stringify({
              interactiveElements:
                interactiveElements.map(mapElementsToColumns),
              staticElements: staticElements.map(mapElementsToColumns),
            }),
          );
        }
      } else {
        const columns = ["Element", "Text", "Suggested selector"];

        const interactiveElementsTableData =
          interactiveElements.map(mapElementsToColumns);
        const staticElementsTableData =
          staticElements.map(mapElementsToColumns);

        console.log("");
        console.log("Interactive elements");
        console.log(table([columns, ...interactiveElementsTableData]));

        console.log("Static elements");
        console.log(table([columns, ...staticElementsTableData]));
      }

      this.displayPrompt();
    },
  });

  replServer.defineCommand("expect", {
    help: "Create a custom expect function",
    action(argumentsString: string) {
      return expectAction(this, argumentsString);
    },
  });

  replServer.defineCommand("discover", {
    help: "Discover the app to test",
    action(argumentssString: string) {
      return discoverAction(this, argumentssString);
    },
  });
};

export default loadReplCommands;
