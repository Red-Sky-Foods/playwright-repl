import ncp from "copy-paste";
import state from "../state";

const parseSequences = (sequences: string[]) => {
  let str = "";

  sequences.forEach((sequence) => {
    str += `await ${sequence};\n`;
  });

  return str;
};

const copyAction = (scope: any, name: string) => {
  if (!name) {
    console.log(
      "Please provide a name for the recording you want to copy, e.g. .copy login",
    );
    scope.displayPrompt();
    return;
  }

  const recording = state.records.find((record) => record.name === name);

  if (!recording) {
    console.log(`Recording ${name} not found`);
    scope.displayPrompt();
    return;
  }

  ncp.copy(`
// ${name} sequence copied from playwright-repl ${new Date()}
${parseSequences(recording.sequence)}
`);

  scope.displayPrompt();
};

export default copyAction;
