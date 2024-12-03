import { chromium, expect } from "@playwright/test";
import options from "../options";
import initializeBrowser from "../initializeBrowser";
import createCustomExpect from "../createCustomExpect";
import { faker } from "@faker-js/faker";
import { waitUntilDefined } from "../utils";

const chromiumAction = async (scope: any, replServer: any) => {
  scope.clearBufferedCommand();

  let page: any = null;

  const test = () => {};

  test.repl = async (
    name: string,
    testFn: ({ page }: { page: any }) => void,
  ) => {
    await waitUntilDefined(() => page);
    try {
      await testFn.apply(scope.context, [{ page }]);
    } catch (ex) {
      // did not work
      console.log(3, ex);
    }
  };

  test.describe = (name: string, testFn: () => void) => {
    console.log("");
    console.log("DESCRIBE", { name });
    testFn();
  };

  test.use = async (obj: any) => {
    console.log("USE", obj);
    page = await initializeBrowser(chromium, options, obj.storageState);

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
