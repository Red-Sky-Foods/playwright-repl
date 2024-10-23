export type Recording = {
  name: string;
  sequence: string[];
};

type DefaultState = {
  isRecording: false | Recording;
  records: Recording[];
};

const defaultState: DefaultState = {
  isRecording: false,
  records: [],
};

const state = Object.assign({}, defaultState);

export default state;
