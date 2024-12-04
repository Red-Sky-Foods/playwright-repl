import { BrowserType } from "playwright-core";
import { defineConfig } from "@playwright/test";
import createCustomPage from "./createCustomPage";
import { readFileSync, writeFileSync } from "fs";

export type BrowserOptions = {
  url?: string;
  timeout: string;
  headed: boolean;
  file: string;
};

const initializeBrowser = async (
  browserHandle: BrowserType,
  options: BrowserOptions,
  storageState: any,
) => {
  const { headed, timeout } = options;
  const browser = await browserHandle.launch({
    headless: !headed,
    args: ["--window-position=0,0"],
  });
  const context = await browser.newContext({
    storageState,
    baseURL: options.url,
  });

  // ! important, here we create the proxies over the selectors and the methods
  const page = createCustomPage(await context.newPage());
  page.setViewportSize({ width: 1280, height: 1024 });
  page.setDefaultTimeout(parseInt(timeout));

  // whenever sendToPlaywright gets called in the frontend, we will replace the record-comment with the selector + method
  await page.exposeFunction(
    "sendToPlaywright",
    async (selectorAndMethod: string) => {
      if (selectorAndMethod) {
        const currentContent = readFileSync(options.file, "utf-8");
        const replacedContent = currentContent.replace(
          "// record",
          `// await page.${selectorAndMethod}`,
        );
        writeFileSync(options.file, replacedContent);
      }
    },
  );

  if (options.url) {
    await page.goto(options.url);
    defineConfig({
      timeout: 5000,
      use: {
        baseURL: options.url,
      },
    });
  }
  return page;
};

export default initializeBrowser;
