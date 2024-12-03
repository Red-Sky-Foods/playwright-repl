import { BrowserType } from "playwright-core";
import { defineConfig } from "@playwright/test";
import createCustomPage from "./createCustomPage";
import { readFileSync, writeFileSync } from "fs";
import { executeSpecContent } from "./utils";

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

  await page.exposeFunction("sendToPlaywright", async (data: any) => {
    const currentContent = readFileSync(options.file, "utf-8");
    const replacedContent = currentContent.replace(
      "// record",
      `// await page.${data} // ${new Date().toString()}`,
    );
    writeFileSync(options.file, replacedContent);
    console.log("Received from UI:", data);
  });

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
