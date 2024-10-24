# playwright-repl
When writing end-to-end tests with Playwright it is a time-consuming task, to find the right selector for the element you want to interact with. This is where `playwright-repl` comes in, it's a REPL that allows you to interact with a browser and find the right selector for the element you want to interact with.

## Get started
### Installation
```bash
# with npm
npm install -g @redsky/playwright-repl

# with bun
bun add -g @redsky/playwright-repl
```

## Playwright API Support
### Supported selectors
- `locator` - [Playwright API](https://playwright.dev/docs/api/class-locator)
- `getByRole` - [Playwright API](https://playwright.dev/docs/api/class-playwright#playwrightgetbyrole)
- `getByLabel` - [Playwright API](https://playwright.dev/docs/api/class-playwright#playwrightgetbylabel)
- `getByPlaceholder` - [Playwright API](https://playwright.dev/docs/api/class-playwright#playwrightgetbyplaceholder)
- `getByText` - [Playwright API](https://playwright.dev/docs/api/class-playwright#playwrightgetbytext)
- `getByTestId` - [Playwright API](https://playwright.dev/docs/api/class-playwright#playwrightgetbytestid)

As in Playwright, these selectors can also be chained in the REPL: e.g. `getByRole('dialog').getByRole('button')`

### Supported locator filters
- `first` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorfirst)
- `last` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorlast)
- `nth` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatornth)
- `filter` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorfilter)

### Supported locator methods
- `click` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorclick)
- `fill` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorfill)
- `focus` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorfocus)
- `hover` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorhover)
- `press` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorpress)
- `selectOption` - [Playwright API](https://playwright.dev/docs/api/class-locator#locatorselectoption)
