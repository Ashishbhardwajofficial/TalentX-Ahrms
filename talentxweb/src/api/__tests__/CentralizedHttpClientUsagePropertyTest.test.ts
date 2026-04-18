/**
 * Property-Based Test for Centralized HTTP Client Usage
 * **Feature: hrms-frontend-complete-integration, Property 8: Centralized HTTP Client Usage**
 * **Validates: Requirements 20.3**
 * 
 * This test verifies that all API client methods use the centralized apiClient instance
 * from axiosClient.ts rather than making direct axios calls.
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Centralized HTTP Client Usage Property Tests', () => {
  /**
   * Property 8: Centralized HTTP Client Usage
   * For all API client methods, HTTP requests should be made through the imported apiClient instance,
   * not directly through axios.
   */
  describe('Property 8: Centralized HTTP Client Usage', () => {
    it('should import apiClient from axiosClient in all API client files', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Verify file imports apiClient from axiosClient
          const hasApiClientImport = /import\s+apiClient\s+from\s+['"]\.\/(axiosClient|axios)['"]/
            .test(fileContent);
          expect(hasApiClientImport).toBe(true);
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should use apiClient methods for HTTP calls in all API client files', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Check for apiClient usage patterns
          const usesApiClient = /apiClient\.(get|post|put|patch|delete)\(/.test(fileContent);

          // Check for direct axios usage (should be avoided except through getAxiosInstance)
          const usesDirectAxios = /\baxios\.(get|post|put|patch|delete)\(/.test(fileContent);

          // If the file uses HTTP methods, verify it uses apiClient or getAxiosInstance
          const hasHttpMethods = /\.(get|post|put|patch|delete)\(/.test(fileContent);

          if (hasHttpMethods) {
            // Should either use apiClient directly or through getAxiosInstance
            const usesGetAxiosInstance = /getAxiosInstance\(\)/.test(fileContent);
            const usesCentralizedClient = usesApiClient || usesGetAxiosInstance;

            expect(usesCentralizedClient).toBe(true);

            // If direct axios is used, it should be through getAxiosInstance()
            if (usesDirectAxios) {
              expect(usesGetAxiosInstance).toBe(true);
            }
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should handle special cases like blob responses through getAxiosInstance', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Check for blob response handling
          const hasBlobResponse = /responseType:\s*['"]blob['"]/.test(fileContent);

          if (hasBlobResponse) {
            // Should use getAxiosInstance() for blob responses
            const usesGetAxiosInstance = /getAxiosInstance\(\)/.test(fileContent);
            expect(usesGetAxiosInstance).toBe(true);
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });

    it('should maintain type safety with generic HTTP methods', () => {
      const apiDir = path.join(__dirname, '..');
      const apiFiles = fs.readdirSync(apiDir).filter(file =>
        file.endsWith('Api.ts') && !file.includes('test') && !file.includes('spec')
      );

      fc.assert(fc.property(
        fc.constantFrom(...apiFiles),
        (fileName) => {
          const filePath = path.join(apiDir, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf-8');

          // Check for generic type usage with apiClient methods
          const genericMethodCalls = fileContent.match(/apiClient\.(get|post|put|patch|delete)<[^>]+>/g);

          if (genericMethodCalls && genericMethodCalls.length > 0) {
            genericMethodCalls.forEach(call => {
              // Verify generic type is specified and not empty
              expect(call).toMatch(/apiClient\.(get|post|put|patch|delete)<.+>/);
              expect(call).not.toMatch(/apiClient\.(get|post|put|patch|delete)<\s*>/);
            });
          }

          // Check for return type annotations on methods
          const methodDeclarations = fileContent.match(/async\s+\w+\([^)]*\):\s*Promise<[^>]+>/g);

          if (methodDeclarations && methodDeclarations.length > 0) {
            methodDeclarations.forEach(declaration => {
              // Verify Promise return type is specified and not empty
              expect(declaration).toMatch(/Promise<.+>/);
              expect(declaration).not.toMatch(/Promise<\s*>/);
            });
          }
        }
      ), { numRuns: Math.min(apiFiles.length, 20) });
    });
  });
});