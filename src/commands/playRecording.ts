import state from "../state";
import { sleep } from "../utils/index";

const playRecording = async (scope: any, argumentsString: string) => {
  const [name, parsedTimes] = argumentsString.split(" ");

  const record = state.records.find((record) => record.name === name);
  if (!record) {
    console.log("no such record");
  } else {
    const { sequence } = record;

    const times = parsedTimes ? parseInt(parsedTimes) : 1;

    await scope.context.locator("body", { timeout: 1000 }).click();

    for (let i = 0; i < times; i += 1) {
      for (let step of sequence) {
        try {
          const func = new Function("scope", `with (scope) { ${step} }`);
          await func(scope.context);
          await sleep(150);
        } catch (ex) {
          console.log(ex);
        }
      }
    }
  }
  scope.displayPrompt();
};

export default playRecording;
