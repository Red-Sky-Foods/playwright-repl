import state from "../state.ts";

const recordAction = (scope: any, name: string, replServer: any) => {
  if (!name) {
    console.log("Please execute .record <name> with a name for the recording");
  } else {
    if (state.isRecording) {
      console.log(
        "Already recording. Please execute .stop to stop recording first.",
      );
    } else {
      state.isRecording = { name, sequence: [] };
      console.log(`Recording started: ${name}`);
      replServer.setPrompt("🔴 playwright> ");
    }
  }

  scope.displayPrompt();
};

export default recordAction;
