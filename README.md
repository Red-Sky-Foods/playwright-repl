# playwright-repl
## REPL-driven E2E test development

When writing end-to-end tests with Playwright, finding the right selector for the element you want to interact with can be time-consuming. This is where playwright-repl comes in. It’s a REPL that allows you to interact with a browser and identify the appropriate selectors for your target elements. Ideally, this accelerates the process of writing end-to-end tests by providing the correct selectors and methods to interact with the elements on the page.

## Get started
### Installation
Automatically install the package globally with npm or bun.
```bash
# with npm
$ npm install -g @redsky/playwright-repl

# with bun
$ bun add -g @redsky/playwright-repl
```
Or manually clone and build on your machine.
```bash
$ git clone https://github.com/Red-Sky-Foods/playwright-repl.git
$ cd playwright-repl
$ bun install
$ bun run build
$ bun run start --headed --url=http://localhost:5173
```

### Usage
Start REPL
```bash
# start REPL
$ bun run start --headed --url=http://localhost:5173
# TODO: add global way to start the REPL from wherever you are
$ ...
```
#### General REPL commands
```bash
# list all available commands
.help

# list all interactive and static elements of the current page
.visible
```

#### Useful helpers
```bash
# Fill a form input with a given value
.fill Email user@host.tld

# Click on a button
.click Continue

# Expect a certain element to be visible
.expect visible Log in
```
These helpers aim to support you by finding the right element. For example, when your Label in the UI is `Email*` and you type `.fill Email`, it will try to locate the correct element for you by utilizing the output of the `.visible` command.

#### Other than that, you can use the Playwright API directly
```js
// get all elements by role
getByRole('button').first().click()
getByRole('dialog').getByRole('button').click()
expect(getByLabel('Email').first()).toBeVisible()
// etc.
```

## Supported Playwright environment
### Supported browsers
- `Chromium` - currently only Chromium is supported/tested with this REPL

### Supported selectors
- [`locator`](https://playwright.dev/docs/api/class-locator)
- [`getByRole`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role)
- [`getByLabel`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-label)
- [`getByPlaceholder`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-placeholder)
- [`getByText`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-text)
- [`getByTestId`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id)

As in Playwright, these selectors can also be chained in the REPL: e.g. `getByRole('dialog').getByRole('button')`

### Supported locator filters
- [`first`](https://playwright.dev/docs/api/class-locator#locator-first)
- [`last`](https://playwright.dev/docs/api/class-locator#locator-last)
- [`nth`](https://playwright.dev/docs/api/class-locator#locator-nth)
- [`filter`](https://playwright.dev/docs/api/class-locator#locator-filter)

### Supported locator methods
- [`click`](https://playwright.dev/docs/api/class-locator#locator-click)
- [`fill`](https://playwright.dev/docs/api/class-locator#locator-fill)
- [`focus`](https://playwright.dev/docs/api/class-locator#locator-focus)
- [`hover`](https://playwright.dev/docs/api/class-locator#locator-hover)
- [`press`](https://playwright.dev/docs/api/class-locator#locator-press)
- [`selectOption`](https://playwright.dev/docs/api/class-locator#locator-select-option)

### Future ideas
This project is still in its early stages, so there are a lot of ideas to improve it:
- [ ] Add support for more browsers
- [ ] Ensure continuous compatibility with Playwright's API
- [ ] Use the REPL as a remote control for a browser by AI, to create end-to-end testing specs automatically
- [ ] Add a way to discover continous developement breaking end-to-end tests and recommend fixes/changes to existing tests
- [ ] Connect with IDE (maybe using Replete?) to evaluate selectors and methods on the fly in the IDE
