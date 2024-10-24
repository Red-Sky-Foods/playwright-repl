import getVisibleElements from "../getVisibleElements";

const clickAction = async (scope: any, argumentsString: string) => {
  const { interactiveElements } = await getVisibleElements(scope.context.page, {
    silent: true,
  });

  const [elementName] = argumentsString.split(" ");

  const item = interactiveElements.find((interactiveElement: any) =>
    interactiveElement.innerText.includes(elementName),
  );

  if (!item) {
    console.log("Element not found");
    scope.displayPrompt();
    return;
  }

  const { selectorMethod, selectorValue } = item;
  const fn = scope.context[selectorMethod];

  if (!fn) {
    console.log("Function not found");
    scope.displayPrompt();
    return;
  }

  const [selector, selectorOptionsRaw] = selectorValue.split(",");
  const options = selectorOptionsRaw
    ? eval(`() => (${selectorOptionsRaw})`)()
    : {};

  try {
    await fn(selector, { ...options }).click();
  } catch (ex) {
    console.error(ex);
  }
  scope.displayPrompt();
};

export default clickAction;
