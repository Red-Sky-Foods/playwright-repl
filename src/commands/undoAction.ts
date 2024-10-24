import state from "../state";

const undoAction = (scope: any) => {
  if (!state.isRecording) {
    console.log("not recording");
  } else {
    const poppedSequence = state.isRecording.sequence.pop();

    if (!poppedSequence) {
      console.log("no more steps to remove");
      scope.displayPrompt();
      return;
    }

    console.log(`removed last segment from recording: ${poppedSequence}`);
  }
  scope.displayPrompt();
};

export default undoAction;
