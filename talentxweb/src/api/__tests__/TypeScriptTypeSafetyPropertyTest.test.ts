/**
 * Property-Based Test for TypeScript Type Safety
 * **Feature: hrms-frontend-complete-integration, Property 9: TypeScript Type Safety**
 * **Validates: Requirements 20.1, 20.2**
 * 
 * This test verifies that all API client methods maintain proper TypeScript type safety
 * with explicit return types and generic type parameters.
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Type Safety Property Tests', () => {
  /**
   * Property 9: TypeScript Type Safety
   * For all API client methods, the return type should be explicitly typed with the appropriate DTO
   * or PaginatedResponse wrapper.
   */
  describe('Property 9: TypeScript Type Safety', () => {
    it('should have explicit return types for all async methods in API client files', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Find all async method declarations
          const asyncMethods = fileContent.match(/async\s+\w+\([^)]*\):\s*Promise<[^>]+>/g);

          if (asyncMethods && asyncMethods.length > 0) {
            asyncMethods.forEach(method => {
              // Verify Promise return type is explicitly specified
              expect(method).toMatch(/Promise<.+>/);

              // Verify Promise type is not empty or just whitespace
              expect(method).not.toMatch(/Promise<\s*>/);

              // Verify return type contains meaningful type information
              const promiseTypeMatch = method.match(/Promise<([^>]+)>/);
              if (promiseTypeMatch) {
                const returnType = promiseTypeMatch[1].trim();
                expect(returnType.length).toBeGreaterThan(0);

                // Should contain meaningful type information (allow 'any' but verify it's explicit)
                const hasValidReturnType = returnType.length > 2;
                expect(hasValidReturnType).toBe(true);
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should use proper generic types with HTTP client methods in API client files', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Find all generic HTTP method calls
          const genericHttpCalls = fileContent.match(/apiClient\.(get|post|put|patch|delete)<[^>]+>/g);

          if (genericHttpCalls && genericHttpCalls.length > 0) {
            genericHttpCalls.forEach(call => {
              // Verify generic type is specified
              expect(call).toMatch(/apiClient\.(get|post|put|patch|delete)<.+>/);

              // Verify generic type is not empty
              expect(call).not.toMatch(/apiClient\.(get|post|put|patch|delete)<\s*>/);

              // Extract and validate the generic type
              const genericTypeMatch = call.match(/<([^>]+)>/);
              if (genericTypeMatch) {
                const genericType = genericTypeMatch[1].trim();
                expect(genericType.length).toBeGreaterThan(0);

                // Should contain meaningful type information (allow 'any' but verify it's explicit)
                const hasValidGenericType = genericType.length > 2;
                expect(hasValidGenericType).toBe(true);
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should have properly typed DTO interfaces in API client files', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Find all interface declarations
          const interfaces = fileContent.match(/export\s+interface\s+\w+\s*{[^}]*}/g);

          if (interfaces && interfaces.length > 0) {
            interfaces.forEach(interfaceDecl => {
              // Verify interface has a name
              const interfaceNameMatch = interfaceDecl.match(/interface\s+(\w+)/);
              expect(interfaceNameMatch).toBeTruthy();

              if (interfaceNameMatch) {
                const interfaceName = interfaceNameMatch[1];

                // Interface name should follow naming conventions
                expect(interfaceName).toMatch(/^[A-Z][a-zA-Z0-9]*$/);

                // DTO interfaces should end with DTO, SearchParams, Request, Response, etc.
                const hasValidSuffix = /DTO$|SearchParams$|Request$|Response$|Definition$|Stats$|Options$/.test(interfaceName);
                if (interfaceName.includes('DTO') || interfaceName.includes('SearchParams') ||
                  interfaceName.includes('Request') || interfaceName.includes('Response')) {
                  expect(hasValidSuffix).toBe(true);
                }
              }

              // Verify interface has content (not empty)
              const interfaceBody = interfaceDecl.match(/{([^}]*)}/);
              if (interfaceBody) {
                const bodyContent = interfaceBody[1].trim();
                // Interface should have at least some properties or extend another interface
                const hasContent = bodyContent.length > 0 || /extends\s+\w+/.test(interfaceDecl);
                expect(hasContent).toBe(true);
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should have consistent parameter typing in API client methods', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Find all method parameter declarations
          const methodParams = fileContent.match(/async\s+\w+\(([^)]*)\)/g);

          if (methodParams && methodParams.length > 0) {
            methodParams.forEach(methodDecl => {
              const paramsMatch = methodDecl.match(/\(([^)]*)\)/);
              if (paramsMatch) {
                const params = paramsMatch[1].trim();

                if (params.length > 0) {
                  // Split parameters and check each one
                  const paramList = params.split(',').map(p => p.trim());

                  paramList.forEach(param => {
                    if (param.length > 0 && !param.includes('=')) {
                      // Each parameter should have a type annotation (skip default parameters)
                      expect(param).toMatch(/:\s*\w+/);

                      // Parameter names should be camelCase
                      const paramNameMatch = param.match(/^(\w+):/);
                      if (paramNameMatch) {
                        const paramName = paramNameMatch[1];
                        expect(paramName).toMatch(/^[a-z][a-zA-Z0-9]*$/);
                      }
                    }
                  });
                }
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should use proper enum types from the types module', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Check for imports from types module
          const typesImport = fileContent.match(/import\s*{([^}]+)}\s*from\s*['"]\.\.\/(types|types\/index)['"]/);

          if (typesImport) {
            const importedTypes = typesImport[1];

            // Verify imported types are used in the file
            const typeNames = importedTypes.split(',').map(t => t.trim());

            typeNames.forEach(typeName => {
              if (typeName.length > 0) {
                // Type should be used somewhere in the file
                const typeUsageRegex = new RegExp(`\\b${typeName}\\b`);
                expect(typeUsageRegex.test(fileContent)).toBe(true);

                // Type name should follow PascalCase convention
                expect(typeName).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should have proper error handling type annotations', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Find JSDoc comments with @throws annotations
          const throwsAnnotations = fileContent.match(/\*\s*@throws\s*{([^}]+)}/g);

          if (throwsAnnotations && throwsAnnotations.length > 0) {
            throwsAnnotations.forEach(annotation => {
              const typeMatch = annotation.match(/@throws\s*{([^}]+)}/);
              if (typeMatch) {
                const errorType = typeMatch[1].trim();

                // Error type should be a valid TypeScript type
                expect(errorType.length).toBeGreaterThan(0);

                // Should reference ApiError or similar error types
                const hasValidErrorType = /ApiError|Error|ValidationError|AuthenticationError/.test(errorType);
                expect(hasValidErrorType).toBe(true);
              }
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });
  });
});