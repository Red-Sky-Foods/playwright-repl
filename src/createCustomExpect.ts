import state from "./state";

function createCustomExpect(scope: any, playwrightExpect: any) {
  // Return a Proxy that wraps the `playwrightExpect` function.
  return new Proxy(playwrightExpect, {
    apply(target, thisArg, args) {
      // Call the original `expect` function with the provided arguments.
      const originalExpect: any = Reflect.apply(target, thisArg, args);

      // Wrap the returned object with another Proxy to intercept method calls.
      return new Proxy(originalExpect, {
        get(target, prop, receiver) {
          // Intercept every method call (e.g., `toBe`, `toHaveText`, etc.).
          const originalMethod = Reflect.get(target, prop, receiver);

          if (typeof originalMethod === "function") {
            state.inExpect = true;

            return (...methodArgs: any[]) => {
              // Custom logic before calling the method.
              const startTime = Date.now();

              // Call the original method.
              const result = originalMethod(...methodArgs);

              if (state.isRecording) {
                state.isRecording.sequence.push(
                  `expect(${args[0]}).${String(prop)}(${methodArgs.length > 0 ? `'${methodArgs[0]}'` : ""})`,
                );
              }

              // Handle async methods.
              if (result instanceof Promise) {
                return result.finally(() => {
                  const endTime = Date.now();
                  state.inExpect = false;
                  scope.displayPrompt();
                });
              } else {
                const endTime = Date.now();
                state.inExpect = false;
                scope.displayPrompt();
                return result;
              }
            };
          }

          // If the property is not a function, return it directly.
          return originalMethod;
        },
      });
    },
  });
}

export default createCustomExpect;
