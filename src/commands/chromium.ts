import { chromium, expect } from "@playwright/test";
import options from "../options";
import initializeBrowser from "../initializeBrowser";
import createCustomExpect from "../createCustomExpect";

const chromiumAction = async (scope: any, replServer: any) => {
  scope.clearBufferedCommand();
  const page = await initializeBrowser(chromium, options);

  scope.context.page = page;
  scope.context.locator = page.locator;
  scope.context.getByLabel = page.getByLabel;
  scope.context.getByTestId = page.getByTestId;
  scope.context.getByRole = page.getByRole;
  scope.context.getByPlaceholder = page.getByPlaceholder;
  scope.context.getByText = page.getByText;
  scope.context.expect = createCustomExpect(scope, expect);

  replServer.commands.load.action.apply(replServer, []);

  scope.displayPrompt();
};

export default chromiumAction;
