import { table } from "table";
import getVisibleElements from "../getVisibleElements";
import chromiumAction from "./chromium";
import clickAction from "./click";
import copyAction from "./copyAction";
import expectAction from "./expect";
import fillAction from "./fill";
import listAction from "./list";
import loadRecordings from "./loadRecordings";
import playRecording from "./playRecording";
import recordAction from "./record";
import replayRecording from "./replayRecording";
import stopRecordingAction from "./stopRecording";
import undoAction from "./undoAction";

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

  replServer.defineCommand("record", {
    help: "Record a sequence of actions",
    action(name: string) {
      return recordAction(this, name, replServer);
    },
  });

  replServer.defineCommand("stop", {
    help: "Stop recording",
    action() {
      return stopRecordingAction(this, replServer);
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
    async action() {
      const mapElementsToColumns = (element: any) => [
        element.tagName,
        element.innerText,
        element.suggestedSelector,
      ];
      const { interactiveElements, staticElements } = await getVisibleElements(
        this.context.page,
      );

      const columns = ["Element", "Text", "Suggested selector"];

      const interactiveElementsTableData =
        interactiveElements.map(mapElementsToColumns);
      const staticElementsTableData = staticElements.map(mapElementsToColumns);

      console.log("");
      console.log("Interactive elements");
      console.log(table([columns, ...interactiveElementsTableData]));

      console.log("Static elements");
      console.log(table([columns, ...staticElementsTableData]));

      this.displayPrompt();
    },
  });

  replServer.defineCommand("load", {
    help: "Load all recordings from the /recordings folder, so that you can .play them.",
    async action() {
      return loadRecordings(this);
    },
  });

  replServer.defineCommand("play", {
    help: "Play a recording",
    action(name: string) {
      return playRecording(this, name);
    },
  });

  replServer.defineCommand("undo", {
    help: "Undo the last action",
    action() {
      return undoAction(this);
    },
  });

  replServer.defineCommand("list", {
    help: "Show segments in current recording",
    action() {
      return listAction(this);
    },
  });

  replServer.defineCommand("replay", {
    help: "Replay the current recording up to the current state",
    action() {
      return replayRecording(this);
    },
  });

  replServer.defineCommand("copy", {
    help: "Copy the steps of a recording into e2e test format",
    action(name: string) {
      return copyAction(this, name);
    },
  });

  replServer.defineCommand("expect", {
    help: "Create a custom expect function",
    action(argumentsString: string) {
      return expectAction(this, argumentsString);
    },
  });
};

export default loadReplCommands;
