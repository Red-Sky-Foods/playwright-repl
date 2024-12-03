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

    console.log(codeString);

    const func = new Function("context", codeString);

    Object.assign(context, { exportLexicalScope });

    const res = await func(context);
    return res;
  } catch (err: unknown) {
    console.error(err);
  }
};

// type CodeDiffResult = {
//   extractedCode: string;
//   hasContinue: boolean;
// };
// export function extractNewCode(
//   oldCode: string,
//   newCode: string,
// ): CodeDiffResult {
//   // Helper function to normalize line endings and split into lines
//   const normalizeAndSplit = (code: string): string[] =>
//     code.replace(/\r\n/g, "\n").split("\n");

//   // Find the debugger statement position
//   const findDebuggerPos = (lines: string[]): number =>
//     lines.findIndex((line) => line.trim() === "debugger;");

//   const oldLines: string[] = normalizeAndSplit(oldCode);
//   const newLines: string[] = normalizeAndSplit(newCode);

//   const oldDebuggerPos: number = findDebuggerPos(oldLines);
//   const newDebuggerPos: number = findDebuggerPos(newLines);

//   if (oldDebuggerPos === -1 || newDebuggerPos === -1) {
//     throw new Error("Both code versions must contain a debugger; statement");
//   }

//   let diffStart: number = newDebuggerPos;
//   let diffEnd: number = newLines.length;
//   let foundMatch: boolean = false;
//   let hasContinue: boolean = false;
//   let continuePos: number = -1;

//   // Find where the new code starts matching the old code
//   for (let i = newDebuggerPos + 1; i < newLines.length; i++) {
//     const newLine: string = newLines[i].trim();

//     // Check for continue statement
//     if (newLine === "continue;") {
//       hasContinue = true;
//       continuePos = i;
//     }

//     // Look for the first matching line in old code
//     const matchInOld: string | undefined = oldLines
//       .slice(oldDebuggerPos + 1)
//       .find((oldLine) => oldLine.trim() === newLine);

//     if (matchInOld && !hasContinue) {
//       diffEnd = i;
//       foundMatch = true;
//       break;
//     }
//   }

//   // If continue was found, include everything after it until next match with old code
//   if (hasContinue) {
//     for (let i = continuePos + 1; i < newLines.length; i++) {
//       const newLine: string = newLines[i].trim();
//       const matchInOld: string | undefined = oldLines
//         .slice(oldDebuggerPos + 1)
//         .find((oldLine) => oldLine.trim() === newLine);

//       if (matchInOld) {
//         diffEnd = i;
//         break;
//       }
//     }
//   }

//   return {
//     extractedCode: newLines.slice(diffStart, diffEnd).join("\n"),
//     hasContinue,
//   };
// }

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
  // Use a regex to extract everything starting with `page` up to but not including `.click` or `.fill`
  const match = line.match(/(page\..*?)(?=\.(?:click|fill|selectOption))/);
  // Return the matched part or null if no match
  return match ? match[1] : null;
}
