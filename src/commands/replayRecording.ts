import state from "../state";
import { sleep } from "../utils/index";

const replayRecording = async (scope: any) => {
  if (!state.isRecording) {
    console.log("not recording");
  } else {
    const { sequence } = state.isRecording;
    await scope.context.locator("body", { timeout: 1000 }).click();

    for (let step of sequence) {
      try {
        const func = new Function("scope", `with (scope) { ${step} }`);
        await func(scope.context);
        await sleep(100);
      } catch (ex) {
        console.log(ex);
      }
    }
  }
  scope.displayPrompt();
};

export default replayRecording;
