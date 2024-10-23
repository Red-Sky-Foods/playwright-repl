import state from "../state.ts";
import { sleep } from "../utils/index.ts";

const replayRecording = async (scope: any) => {
  if (!state.isRecording) {
    console.log("not recording");
  } else {
    const { sequence } = state.isRecording;
    for (let step of sequence) {
      await scope.context.locator("body", { timeout: 1000 }).click();

      for (let step of sequence) {
        try {
          const func = new Function(`this.${step}`).bind(scope.context);
          await func();
          await sleep(100);
        } catch (ex) {
          console.log(ex);
        }
      }
    }
  }
  scope.displayPrompt();
};

export default replayRecording;
