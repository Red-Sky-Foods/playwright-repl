import state from "../state";
import fs from "fs";

const stopRecordingAction = (scope: any, replServer: any) => {
  if (!state.isRecording) {
    console.log("cannot cut, not recording or no steps recorded");
  } else {
    if (state.isRecording.sequence.length === 0) {
      console.log("no steps recorded, stopping recording");
      state.isRecording = false;
      replServer.setPrompt("playwright> ");
      scope.displayPrompt();

      return;
    }

    state.records.push(state.isRecording);

    if (!fs.existsSync("./recordings")) {
      fs.mkdirSync("./recordings");
    }

    fs.writeFileSync(
      `./recordings/${state.isRecording.name}.playwright.rec`,
      JSON.stringify(state.isRecording.sequence, null, 2),
      {
        encoding: "utf-8",
      },
    );
    state.isRecording = false;
    replServer.setPrompt("playwright> ");
  }
  scope.displayPrompt();
};

export default stopRecordingAction;
