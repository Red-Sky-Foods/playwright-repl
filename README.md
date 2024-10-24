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

# record a new testing sequence, give it a good name, e.g. login when you want to test a login flow
.record <name>

# stop recording, will create a <name>.playwright.rec in the /recording folder
.stop

# list currently recorded steps during recording
.list

# undo the last recorded step (remove it from the .list)
.undo

# replay the currently recorded steps
.replay

# copy valid javascript code of a specific recorded sequence to the clipboard
.copy <name>
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

#### Repetitive tasks
When you want to test a certain flow multiple times, you can record the flow once and replay it multiple times.
```bash
# execute the recorded flow 5 times
.play createRandomProduct 5
```
It's sometimes crucial to not fill inputs with static data, but with random data. This is why template strings are supported in the `.fill` shortcut and the playwright `.fill()` method.
```bash
# fill Email with a random email address, it's important to use the backticks
.fill Email `user${Math.random()}@host.tld`
# same as
getByLabel('Email*').fill(`user${Math.random()}@host.tld`)
```
You can also use faker to generate random data, it's already included in the REPL.
```bash
.fill Email `${faker.internet.email()}`
```

## Supported Playwright environment
### Supported browsers
- `Chromium` - currently only Chromium is supported/tested with this REPL

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

### Future ideas
This project is still in its early stages, so there are a lot of ideas to improve it:
- [ ] Add support for more browsers
- [ ] Ensure continuous compatibility with Playwright's API
- [ ] Use the REPL as a remote control for a browser by AI, to create end-to-end testing specs automatically
- [ ] Add a way to discover continous developement breaking end-to-end tests and recommend fixes/changes to existing tests
