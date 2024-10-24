# playwright-repl
When writing end-to-end tests with Playwright it is a time-consuming task, to find the right selector for the element you want to interact with. This is where `playwright-repl` comes in, it's a REPL that allows you to interact with a browser and find the right selector for the element you want to interact with.
Ideally this accelerates the process of writing end-to-end tests, by providing you with the right selectors and methods to interact with the elements on the page.

## Get started
### Installation
```bash
# with npm
npm install -g @redsky/playwright-repl

# with bun
bun add -g @redsky/playwright-repl
```

### Usage
#### General REPL commands
```bash
# start REPL
playwright-repl --headed --url http://localhost:5173

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
```

#### Useful helpers to write selectors and methods quicker
```bash
# Fill a form input with a given value
.fill Email user@host.tld

# Click on a button
.click Continue

# Expect a certain element to be visible
.expect visible Log in
```
These helpers aim to be supportive by finding the right element, e.g. when your Label in the UI is `Email*` and you type `.fill Email` it will try to find the right element for you, by making use of the output of the `.visible` command.

#### Other than that, you can use the Playwright API directly
```bash
# get all elements by role
getByRole('button').first().click()
getByRole('dialog').getByRole('button').click()
expect(getByLabel('Email').first()).toBeVisible()
# etc.
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
