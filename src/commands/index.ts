import getVisibleElements from "../getVisibleElements.ts";
import chromiumAction from "./chromium.ts";
import clickAction from "./click.ts";
import copyAction from "./copyAction.ts";
import expectAction from "./expect.ts";
import fillAction from "./fill.ts";
import listAction from "./list.ts";
import loadRecordings from "./loadRecordings.ts";
import playRecording from "./playRecording.ts";
import recordAction from "./record.ts";
import replayRecording from "./replayRecording.ts";
import stopRecordingAction from "./stopRecording.ts";
import undoAction from "./undoAction.ts";

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
      await getVisibleElements(this.context.page);
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
