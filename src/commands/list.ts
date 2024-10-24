import state from "../state";

const listAction = (scope: any) => {
  if (!state.isRecording) {
    console.log("not recording");
  } else {
    state.isRecording.sequence.forEach((step: any) => {
      console.log(step);
    });
  }
  scope.displayPrompt();
};

export default listAction;
