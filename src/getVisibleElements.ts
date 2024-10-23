const getVisibleElements = async (page: any, options = { silent: false }) => {
  const elementsByType = await page.evaluate(() => {
    const isInteractive = (element: any) => {
      const interactiveTags = [
        "BUTTON",
        "INPUT",
        "SELECT",
        "TEXTAREA",
        "A",
        "OPTION",
      ];
      return interactiveTags.includes(element.tagName);
    };

    const isVisible = (element: any) => {
      // @ts-expect-error - TS doesn't know about these properties
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    };

    const determineSelectorMethod = (element: any) => {
      // Consider labels with a "for" attribute
      if (
        element.tagName === "LABEL" &&
        element.hasAttribute("for") &&
        element.innerText.trim().length > 0
      ) {
        return ["getByLabel", element.innerText.trim()];
      }

      if (element.tagName === "BUTTON" && element.innerText.trim().length > 0) {
        return ["getByRole", `button, { name: '${element.innerText.trim()}' }`];
      }

      if (element.tagName === "INPUT") {
        const inputType = element.getAttribute("type") || "text";
        if (element.hasAttribute("aria-label")) {
          return ["getByLabel", element.getAttribute("aria-label")];
        }
        if (element.hasAttribute("placeholder")) {
          return ["getByPlaceholder", element.getAttribute("placeholder")];
        }
        if (inputType === "checkbox") {
          return [
            "getByRole",
            `checkbox, { name: '${element.innerText.trim()}' }`,
          ];
        }
        if (inputType === "radio") {
          return [
            "getByRole",
            `radio, { name: '${element.innerText.trim()}' }`,
          ];
        }
        return [
          "getByRole",
          `textbox, { name: '${element.getAttribute("aria-label") || element.innerText.trim()}' }`,
        ];
      }

      if (element.tagName === "TEXTAREA") {
        return [
          "getByRole",
          `textbox, { name: '${element.getAttribute("aria-label") || element.innerText.trim()}' }`,
        ];
      }

      if (element.tagName === "SELECT") {
        return [
          "getByRole",
          `combobox, { name: '${element.getAttribute("aria-label") || element.innerText.trim()}' }`,
        ];
      }

      if (element.tagName === "A" && element.innerText.trim().length > 0) {
        return ["getByRole", `link, { name: '${element.innerText.trim()}' }`];
      }

      if (element.hasAttribute("role")) {
        return [
          "getByRole",
          `${element.getAttribute("role")}, { name: '${element.innerText.trim()}' }`,
        ];
      }

      if (element.hasAttribute("data-testid")) {
        return ["getByTestId", element.getAttribute("data-testid")];
      }

      if (element.innerText && element.innerText.trim().length > 0) {
        return ["getByText", element.innerText.trim()];
      }

      return ["querySelector", element.tagName.toLowerCase()];
    };

    // @ts-expect-error - TS doesn't know about these properties
    const elements = document.querySelectorAll("*");
    const interactiveElements: any[] = [];
    const staticElements: any[] = [];
    const seenInteractiveTexts = new Set();
    const seenStaticTexts = new Set();

    Array.from(elements).forEach((element: any) => {
      if (
        isVisible(element) &&
        element.innerText.trim().length > 0 &&
        !element.innerText.includes("\n")
      ) {
        const [selectorMethod, selectorValue] =
          determineSelectorMethod(element);
        const elementInfo = {
          tagName: element.tagName,
          classes: element.className,
          id: element.id,
          innerText: element.innerText,
          suggestedSelector: `${selectorMethod}('${selectorValue}')`,
          selectorMethod,
          selectorValue,
        };

        if (isInteractive(element) || element.tagName === "LABEL") {
          if (!seenInteractiveTexts.has(element.innerText.trim())) {
            seenInteractiveTexts.add(element.innerText.trim());
            interactiveElements.push(elementInfo);
          }
        } else {
          if (!seenStaticTexts.has(element.innerText.trim())) {
            seenStaticTexts.add(element.innerText.trim());
            staticElements.push(elementInfo);
          }
        }
      }
    });

    return { interactiveElements, staticElements };
  });

  if (!options.silent) {
    console.table(elementsByType.interactiveElements, [
      "tagName",
      "innerText",
      "suggestedSelector",
    ]);
    console.table(elementsByType.staticElements, [
      "tagName",
      "innerText",
      "suggestedSelector",
    ]);
  }

  return elementsByType;
};

export default getVisibleElements;
