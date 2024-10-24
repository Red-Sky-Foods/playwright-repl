import { BrowserType } from "playwright-core";
import { defineConfig } from "@playwright/test";
import createCustomPage from "./createCustomPage";

export type BrowserOptions = {
  url?: string;
  timeout: string;
  headed: boolean;
};

const initializeBrowser = async (
  browserHandle: BrowserType,
  options: BrowserOptions,
) => {
  const { headed, timeout } = options;
  const browser = await browserHandle.launch({
    headless: !headed,
    args: ["--window-position=0,0"],
  });
  const context = await browser.newContext();

  // ! important, here we create the proxies over the selectors and the methods
  const page = createCustomPage(await context.newPage());

  page.setViewportSize({ width: 1280, height: 1024 });

  page.setDefaultTimeout(parseInt(timeout));
  if (options.url) {
    await page.goto(options.url);
    defineConfig({
      use: {
        baseURL: options.url,
      },
    });
  }
  return page;
};

export default initializeBrowser;
