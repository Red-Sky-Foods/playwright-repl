import state from "./state.ts";

const recordableMethods = [
  "getByRole",
  "getByLabel",
  "getByPlaceholder",
  "getByText",
  "getByTestId",
  "locator",
];

type ChainedCommand = {
  selectorMethod?: string;
  selectorValue?: string;
  selectorOptions?: any;
  interactiveMethod?: string;
  interactiveMethodArgs?: any;
};

let currentCommandChain: false | ChainedCommand[] = false;

const handleRecordableMethods =
  (target: any, prop: any) =>
  (...args: any[]) => {
    // console.log("intercept selector", prop, ...args);
    const commandForChain = {
      selectorMethod: prop,
      selectorValue: args[0],
      selectorOptions: args[1],
    };
    if (!currentCommandChain) {
      currentCommandChain = [commandForChain];
    } else {
      currentCommandChain.push(commandForChain);
    }
    const element = target[prop](...args);

    return createCustomElement(element);
  };

const createCustomPage = (page: any) => {
  return new Proxy(page, {
    get(target, prop: any) {
      if (recordableMethods.includes(prop)) {
        return handleRecordableMethods(target, prop);
      }
      return target[prop];
    },
  });
};

const recordableInteractiveMethods = ["click", "fill"];

function stringifyToJsObjectString(parsedObj: any) {
  const jsObjectString = JSON.stringify(parsedObj, (key, value) => value, 2)
    // Remove quotes around object keys
    .replace(/"(\w+)"\s*:/g, "$1:")
    // Remove escape characters like backslashes
    .replace(/\\(["\\/])/g, "$1");

  // Step 3: Remove newline characters and extra spaces
  const cleanedString = jsObjectString
    .replace(/\n/g, "") // Remove all newlines
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing whitespace

  return cleanedString;
}

const createCustomElement = (element: any) => {
  return new Proxy(element, {
    get(target, prop: any) {
      if (recordableInteractiveMethods.includes(prop)) {
        return (...args: any[]) => {
          // console.log("intercept interactive method", prop, ...args);

          const commandForChain = {
            interactiveMethod: prop,
            interactiveMethodArgs: args,
          };

          if (currentCommandChain) {
            currentCommandChain.push(commandForChain);
          }

          // this is the moment the current command chain is complete and we can save the commandChain to the current recording
          // console.log(currentCommandChain);
          if (state.isRecording && currentCommandChain) {
            // build up the whole command
            const sequenceCommand = currentCommandChain.reduce(
              // @ts-expect-error TODO: fix
              (acc: string, command: ChainedCommand): string => {
                if (command.selectorMethod) {
                  return (
                    acc +
                    `${command.selectorMethod}('${command.selectorValue}'${command.selectorOptions ? `, ${stringifyToJsObjectString(command.selectorOptions)}` : ""})`
                  );
                } else if (command.interactiveMethod) {
                  return (
                    acc +
                    `.${command.interactiveMethod}(${command.interactiveMethodArgs.length > 0 ? `'${command.interactiveMethodArgs[0]}'` : ""})`
                  );
                }
              },
              "",
            );
            state.isRecording.sequence.push(sequenceCommand);
          }

          // reset command chain for next command
          currentCommandChain = false;

          return target[prop](...args);
        };
      } else if (recordableMethods.includes(prop)) {
        return handleRecordableMethods(target, prop);
      }

      return target[prop];
    },
  });
};

export default createCustomPage;
