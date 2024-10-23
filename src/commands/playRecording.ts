import state from "../state.ts";
import { sleep } from "../utils/index.ts";

const playRecording = async (scope: any, name: string) => {
  const record = state.records.find((record) => record.name === name);
  if (!record) {
    console.log("no such record");
  } else {
    const { sequence } = record;
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

export default playRecording;
