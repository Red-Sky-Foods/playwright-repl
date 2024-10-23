import getVisibleElements from "../getVisibleElements.ts";

const asserterMap: Record<string, string | any> = {
  visible: "toBeVisible",
  invisible: ["toHaveCount", 0],
};

const expectAction = async (scope: any, argumentsString: string) => {
  const { interactiveElements, staticElements } = await getVisibleElements(
    scope.context.page,
    {
      silent: true,
    },
  );

  const [asserter] = argumentsString.split(" ");
  const elementName = argumentsString.split(" ").slice(1).join(" ");

  const item = [...interactiveElements, ...staticElements].find(
    (element: any) => element.innerText.includes(elementName),
  );

  if (!item) {
    console.log("Element not found");
    scope.displayPrompt();
    return;
  }

  const { selectorMethod, selectorValue } = item;

  const [selector, selectorOptionsRaw] = selectorValue.split(",");
  const options = selectorOptionsRaw
    ? eval(`() => (${selectorOptionsRaw})`)()
    : {};

  const expect = scope.context.expect;
  const selectorFn = scope.context[selectorMethod];

  const assertFn = asserterMap[asserter];

  try {
    if (typeof assertFn !== "string") {
      await expect(selectorFn(selector, { ...options }))[assertFn[0]](
        assertFn[1],
      );
    } else {
      await expect(selectorFn(selector, { ...options }))[assertFn]();
    }
  } catch (ex) {
    console.error(ex);
  }
  scope.displayPrompt();
};

export default expectAction;
