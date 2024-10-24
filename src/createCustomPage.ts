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

    setTimeout(() => {
      if (!state.inExpect) {
        if (!currentCommandChain) {
          currentCommandChain = [commandForChain];
        } else {
          currentCommandChain.push(commandForChain);
        }
      }

      // if we are chained in an expect, we wan't to skip persisting this command
      if (state.inExpect) {
        currentCommandChain = false;
      }
    }, 1);

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

const recordableInteractiveMethods = [
  "click",
  "fill",
  "focus",
  "hover",
  "press",
  "selectOption",
];
const nestableSelectors = ["first", "last", "nth", "filter"];

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

import { faker } from "@faker-js/faker";

const parseFillContent = (content: string) => {
  if (content.startsWith("`") && content.endsWith(``)) {
    const func = new Function("scope", `with (scope) { return ${content} }`);
    return func({
      faker,
    });
  } else {
    return content;
  }
};

const handleRecordableElementMethods = (target: any, prop: any) => {
  return (...args: any[]) => {
    // console.log("intercept interactive method", prop, ...args);

    const commandForChain = {
      interactiveMethod: prop,
      interactiveMethodArgs: args,
    };

    setTimeout(() => {
      if (currentCommandChain && !state.inExpect) {
        currentCommandChain.push(commandForChain);
      }

      setTimeout(() => {
        // this is the moment the current command chain is complete and we can save the commandChain to the current recording
        // console.log(currentCommandChain);
        if (state.isRecording && currentCommandChain) {
          // build up the whole command
          const sequenceCommand = currentCommandChain.reduce(
            // @ts-expect-error TODO: fix
            (acc: string, command: ChainedCommand): string => {
              if (command.selectorMethod) {
                let pre = "";
                if (acc) {
                  pre = ".";
                }
                return (
                  acc +
                  `${pre}${command.selectorMethod}('${command.selectorValue}'${command.selectorOptions ? `, ${stringifyToJsObjectString(command.selectorOptions)}` : ""})`
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

          // if we are chained in an expect, we wan't to skip persisting this command
          if (!state.inExpect) {
            state.isRecording.sequence.push(sequenceCommand);
          }
        }

        // reset command chain for next command
        currentCommandChain = false;
      }, 1);
    }, 1);

    // this replaces the fill content with variable faker content etc.
    const newArgs = args.map((arg) => {
      if (prop === "fill" && typeof arg === "string") {
        return parseFillContent(arg);
      }
      return arg;
    });

    if (nestableSelectors.includes(prop)) {
      return createCustomElement(target[prop](...newArgs));
    } else {
      return target[prop](...newArgs);
    }
  };
};

const createCustomElement = (element: any) => {
  return new Proxy(element, {
    get(target, prop: any) {
      if (
        recordableInteractiveMethods.includes(prop) ||
        nestableSelectors.includes(prop)
      ) {
        return handleRecordableElementMethods(target, prop);
      } else if (recordableMethods.includes(prop)) {
        return handleRecordableMethods(target, prop);
      }

      return target[prop];
    },
  });
};

export default createCustomPage;
