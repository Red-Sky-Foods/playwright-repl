import getVisibleElements from "../getVisibleElements";
import { sleep } from "../utils";

const sanitizeStep = (step: string) => {
  let sanitizedStep = step.replace("page.", "");

  return sanitizedStep;
};

export const discoverAction = async (
  scope: any,
  argumentsString: string,
): Promise<any> => {
  const base64Screenshot = await scope.context.page.screenshot({
    encoding: "base64",
  });
  const [contextId, ...rest] = argumentsString.split(" ");
  const elements = await getVisibleElements(scope.context.page);
  const path = scope.context.page.url();

  const response = await fetch(
    `http://localhost:3000/context/${contextId}/discover`,
    {
      method: "POST",
      body: JSON.stringify({
        screenshot: base64Screenshot.toString("base64"),
        path,
        elements: elements.interactiveElements.map((item: any) => ({
          tagName: item.tagName,
          innerText: item.innerText,
          suggestedSelector: item.suggestedSelector,
        })),
        extra: rest.join(" "),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    const json = await response.json();

    const sequence = json.split("\n");

    // console.log("----");

    for (let step of sequence) {
      const cleanStep = sanitizeStep(step);
      // console.log("will execute", cleanStep);
      const func = new Function(
        "scope",
        `return (async () => {
              with (scope) {
                try {
                  await ${cleanStep}
                  return true;
                } catch (ex) {
                  return ex.message
                }
              }
            })();`,
      );
      const result = await func({
        ...scope.context,
      });

      if (result === true) {
        await sleep(150);
      } else {
        await sleep(500);
        return discoverAction(scope, `${contextId} ${result}`);
      }
    }
    await sleep(500);
    return discoverAction(scope, `${contextId} ${rest.join(" ")}`);
  } else {
    console.error(response);
    scope.displayPrompt();
  }
};
