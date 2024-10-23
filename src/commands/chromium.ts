import { chromium, expect } from "@playwright/test";
import options from "../options.ts";
import initializeBrowser from "../initializeBrowser.ts";

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
  scope.context.expect = expect;

  replServer.commands.load.action.apply(replServer, []);

  scope.displayPrompt();
};

export default chromiumAction;
