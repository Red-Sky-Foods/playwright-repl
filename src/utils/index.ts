import { readFileSync } from "fs";
import ts from "typescript";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const executeSpecContent = async (
  context: any,
  code: string,
  exportLexicalScope?: (newLexicalScope: any) => void,
) => {
  try {
    const codeString = `with (context) {
      return (
        async () => {
          try { ${code} }
          catch (ex) { return ex.message }
        }
      )()
    }`;

    // console.log("");
    // console.log("---");
    // console.log("executing code with context");
    // console.log(codeString);
    // console.log("---");

    const func = new Function("context", codeString);
    Object.assign(context, { exportLexicalScope });

    const res = await func(context);
    return res;
  } catch (err: unknown) {
    console.error(err);
  }
};

export async function waitUntilDefined<T>(
  getter: () => T | null | undefined,
  timeout: number = 10000, // Default 10 second timeout
  interval: number = 100, // Check every 100ms by default
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const value = getter();

      if (value !== null && value !== undefined) {
        resolve(value);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for value to be defined"));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

export function extractAllDeclaredVariablesAsString(code: string): string {
  const sourceFile = ts.createSourceFile(
    "inline.ts", // Virtual filename (not created on disk)
    code,
    ts.ScriptTarget.Latest, // Language version
    true, // Set parent pointers
  );

  const variables = new Set<string>();

  function visit(node: ts.Node) {
    // Check for variable declarations (let, const, var)
    if (ts.isVariableDeclarationList(node)) {
      node.declarations.forEach((declaration) => {
        if (ts.isIdentifier(declaration.name)) {
          variables.add(declaration.name.text);
        }
      });
    }

    // Check for import declarations
    if (ts.isImportDeclaration(node) && node.importClause) {
      const { namedBindings, name } = node.importClause;

      // Handle default imports (e.g., import x from 'module')
      if (name) {
        variables.add(name.text);
      }

      // Handle named imports (e.g., import { a, b } from 'module')
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        namedBindings.elements.forEach((element) => {
          variables.add(element.name.text);
        });
      }
    }

    // Recurse into child nodes
    ts.forEachChild(node, visit);
  }

  // Start traversing from the root of the AST
  visit(sourceFile);

  // Convert the Set to a formatted string
  return `{ ${Array.from(variables).join(", ")} }`;
}

export function readLineFromFile(input: string): string | null {
  // Split the input string into file path and line number
  const [filePath, lineNumber] = input.split(":").slice(0, 2);

  // Convert line number to a number (and adjust for 0-based index)
  const lineIndex = parseInt(lineNumber, 10) - 1;

  try {
    // Read the file contents
    const fileContents = readFileSync(filePath, "utf-8");

    // Split the contents into lines
    const lines = fileContents.split("\n");

    // Return the desired line if it exists
    return lines[lineIndex] || null;
  } catch (error: any) {
    console.error(`Error reading file: ${error.message}`);
    return null;
  }
}
export function extractPageAction(line: string): string | null {
  const match = line.match(/(page\..*?)(?=\.(?:click|fill|selectOption))/);
  return match ? match[1] : null;
}
