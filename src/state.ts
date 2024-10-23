export type Recording = {
  name: string;
  sequence: string[];
};

type DefaultState = {
  isRecording: false | Recording;
  inExpect: boolean;
  records: Recording[];
};

const defaultState: DefaultState = {
  isRecording: false,
  records: [],
  inExpect: false,
};

const state = Object.assign({}, defaultState);

export default state;
