import state, { Recording } from "../state";
import fs from "fs";

const loadRecordings = (scope: any) => {
  const files = fs.readdirSync("./recordings");
  state.records = [];
  if (files.length > 0) {
    // console.log("");
    // console.log("Loaded recordings:");
  }
  files.forEach((file) => {
    const fileContent = JSON.parse(
      fs.readFileSync(`./recordings/${file}`, { encoding: "utf-8" }),
    );
    const name = file.split(".playwright.rec")[0];
    state.records.push({
      name,
      sequence: fileContent,
    });
    // console.log(`${name}`);
  });

  scope.displayPrompt();
};

export default loadRecordings;
