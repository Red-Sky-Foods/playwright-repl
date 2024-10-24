import getVisibleElements from "../getVisibleElements";

const fillAction = async (scope: any, argumentsString: string) => {
  const { interactiveElements } = await getVisibleElements(scope.context.page, {
    silent: true,
  });

  const [elementName] = argumentsString.split(" ");
  const content = argumentsString.split(" ").slice(1).join(" ");

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

  try {
    await fn(selectorValue).fill(content);
  } catch (ex) {
    console.error(ex);
  }
  scope.displayPrompt();
};

export default fillAction;
