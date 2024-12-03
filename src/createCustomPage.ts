const recordableMethods = [
  "getByRole",
  "getByLabel",
  "getByPlaceholder",
  "getByText",
  "getByTestId",
  "locator",
];

const handleRecordableMethods =
  (target: any, prop: any) =>
  (...args: any[]) => {
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
