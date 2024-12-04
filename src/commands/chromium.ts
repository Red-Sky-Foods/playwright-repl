import { chromium, expect } from "@playwright/test";
import options from "../options";
import initializeBrowser from "../initializeBrowser";
import createCustomExpect from "../createCustomExpect";
import { faker } from "@faker-js/faker";
import { executeSpecContent, waitUntilDefined } from "../utils";

const chromiumAction = async (scope: any) => {
  scope.clearBufferedCommand();

  let page: any = null;

  const test = () => {};

  test.repl = async (
    _name: string,
    testFn: ({ page }: { page: any }) => void,
  ) => {
    await waitUntilDefined(() => page);
    try {
      return testFn.apply(scope.context, [{ page }]);
    } catch (ex) {
      // did not work
      console.error(`test.repl`);
      console.error(ex);
    }
  };

  test.describe = (name: string, describeFn: () => void) => {
    describeFn();
  };

  test.use = async (obj: any) => {
    if (page) return scope.context;

    page = await initializeBrowser(chromium, options, obj.storageState);

    await page.exposeFunction(
      "getPossibleSelectors",
      async (selectorLine: string) => {
        const result = await executeSpecContent(
          scope.context,
          `await ${selectorLine}`,
        );

        if (result) {
          // ex contains a string with a few playwright selector options, each line starting with 1) ... aka ... and we get the aka part
          const akas = result
            .split("\n")
            .map((line: string) => {
              const aka = line.split(" aka ");
              if (aka[1]) {
                return aka[1]?.trim();
              }
              return false;
            })
            .filter(Boolean);

          return akas;
        } else {
          return [selectorLine];
        }
      },
    );

    scope.context.page = page;
    scope.context.locator = page.locator;
    scope.context.getByLabel = page.getByLabel;
    scope.context.getByTestId = page.getByTestId;
    scope.context.getByRole = page.getByRole;
    scope.context.getByPlaceholder = page.getByPlaceholder;
    scope.context.getByText = page.getByText;
    scope.context.expect = createCustomExpect(scope, expect);
    scope.context.faker = faker;
    scope.context.innerContext = {};
  };

  scope.context.test = test;
  scope.displayPrompt();

  return scope.context;
};

export default chromiumAction;
