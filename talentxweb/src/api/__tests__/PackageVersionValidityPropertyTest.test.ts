/**
 * Property-Based Test for Package Version Validity
 * **Feature: frontend-package-stabilization, Property 1: Package Version Validity**
 * **Validates: Requirements 3.1**
 * 
 * This test verifies that all package versions specified in package.json exist in the npm registry
 * and are installable.
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('Package Version Validity Property Tests', () => {
  /**
   * Property 1: Package Version Validity
   * For any package specified in package.json, that package version should exist in the npm registry
   * and be installable.
   */
  describe('Property 1: Package Version Validity', () => {
    let packageJson: any;

    beforeAll(() => {
      // Read package.json from the project root
      const packageJsonPath = path.join(__dirname, '../../../package.json');
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
    });

    it('should have valid versions for all production dependencies', () => {
      const dependencies = Object.entries(packageJson.dependencies || {});

      if (dependencies.length === 0) {
        return; // Skip if no dependencies
      }

      fc.assert(fc.property(
        fc.constantFrom(...dependencies),
        ([packageName, version]: [string, string]) => {
          // Clean version string (remove ^ ~ etc.)
          const cleanVersion = version.replace(/^[\^~]/, '');

          try {
            // Check if package version exists in npm registry
            const result = execSync(`npm view ${packageName}@${cleanVersion} version`, {
              encoding: 'utf-8',
              timeout: 10000,
              stdio: 'pipe'
            });

            // If command succeeds, the version exists
            expect(result.trim()).toBe(cleanVersion);

            // Verify package name is valid
            expect(packageName).toMatch(/^[@a-z0-9-_./]+$/i);

            // Verify version format is valid
            expect(cleanVersion).toMatch(/^\d+\.\d+\.\d+/);

          } catch (error) {
            // If npm view fails, the version doesn't exist
            throw new Error(`Package ${packageName}@${version} (${cleanVersion}) does not exist in npm registry: ${error}`);
          }
        }
      ), { numRuns: Math.min(dependencies.length, 100) });
    });

    it('should have valid versions for all development dependencies', () => {
      const devDependencies = Object.entries(packageJson.devDependencies || {});

      if (devDependencies.length === 0) {
        return; // Skip if no dev dependencies
      }

      fc.assert(fc.property(
        fc.constantFrom(...devDependencies),
        ([packageName, version]: [string, string]) => {
          // Clean version string (remove ^ ~ etc.)
          const cleanVersion = version.replace(/^[\^~]/, '');

          try {
            // Check if package version exists in npm registry
            const result = execSync(`npm view ${packageName}@${cleanVersion} version`, {
              encoding: 'utf-8',
              timeout: 10000,
              stdio: 'pipe'
            });

            // If command succeeds, the version exists
            expect(result.trim()).toBe(cleanVersion);

            // Verify package name is valid
            expect(packageName).toMatch(/^[@a-z0-9-_./]+$/i);

            // Verify version format is valid
            expect(cleanVersion).toMatch(/^\d+\.\d+\.\d+/);

          } catch (error) {
            // If npm view fails, the version doesn't exist
            throw new Error(`Package ${packageName}@${version} (${cleanVersion}) does not exist in npm registry: ${error}`);
          }
        }
      ), { numRuns: Math.min(devDependencies.length, 100) });
    });

    it('should have package names that exist in npm registry', () => {
      const allDependencies = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      const packageNames = Object.keys(allDependencies);

      if (packageNames.length === 0) {
        return; // Skip if no dependencies
      }

      fc.assert(fc.property(
        fc.constantFrom(...packageNames),
        (packageName: string) => {
          try {
            // Check if package exists in npm registry (get latest version)
            const result = execSync(`npm view ${packageName} version`, {
              encoding: 'utf-8',
              timeout: 10000,
              stdio: 'pipe'
            });

            // If command succeeds, the package exists
            expect(result.trim()).toMatch(/^\d+\.\d+\.\d+/);

            // Verify package name follows npm naming conventions
            expect(packageName).toMatch(/^[@a-z0-9-_./]+$/i);

            // Scoped packages should start with @
            if (packageName.includes('/')) {
              expect(packageName).toMatch(/^@[a-z0-9-_]+\/[a-z0-9-_.]+$/i);
            }

          } catch (error) {
            // If npm view fails, the package doesn't exist
            throw new Error(`Package ${packageName} does not exist in npm registry: ${error}`);
          }
        }
      ), { numRuns: Math.min(packageNames.length, 100) });
    });

    it('should have valid semver format for all version specifications', () => {
      const allDependencies = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      const dependencies = Object.entries(allDependencies);

      if (dependencies.length === 0) {
        return; // Skip if no dependencies
      }

      fc.assert(fc.property(
        fc.constantFrom(...dependencies),
        ([packageName, version]: [string, string]) => {
          // Verify version string format
          expect(version).toBeTruthy();
          expect(typeof version).toBe('string');
          expect(version.length).toBeGreaterThan(0);

          // Clean version for semver check
          const cleanVersion = version.replace(/^[\^~]/, '');

          // Should follow semver pattern (major.minor.patch with optional pre-release/build)
          const semverPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?(?:\+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
          expect(cleanVersion).toMatch(semverPattern);

          // Version range prefixes should be valid
          if (version.startsWith('^') || version.startsWith('~')) {
            expect(version).toMatch(/^[\^~]\d+\.\d+\.\d+/);
          }

          // No invalid characters
          expect(version).not.toMatch(/[<>]/);
          expect(version).not.toMatch(/\s/);
        }
      ), { numRuns: Math.min(dependencies.length, 100) });
    });
  });
});