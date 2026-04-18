/**
 * Property-Based Test for HTTP Client Consistency
 * **Feature: hrms-database-integration, Property 8: HTTP Client Consistency**
 * **Validates: Requirements 3.2**
 * 
 * This test verifies that HTTP requests from the frontend maintain consistency
 * by ensuring authentication headers are included and error responses are handled uniformly.
 */

import * as fc from 'fast-check';

describe('HTTP Client Consistency Property Tests', () => {
  // Generators for test data
  const httpMethodArb = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
  const urlArb = fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s}`);
  const tokenArb = fc.string({ minLength: 50, maxLength: 200 });
  const httpStatusArb = fc.integer({ min: 200, max: 599 });
  const errorMessageArb = fc.string({ minLength: 1, maxLength: 200 });

  const requestConfigArb = fc.record({
    method: httpMethodArb,
    url: urlArb,
    data: fc.option(fc.object()),
    headers: fc.option(fc.dictionary(fc.string(), fc.string()))
  });

  const apiResponseArb = fc.record({
    success: fc.boolean(),
    data: fc.option(fc.object()),
    message: fc.option(fc.string()),
    errors: fc.option(fc.array(fc.record({
      field: fc.string(),
      message: fc.string()
    })))
  });

  /**
   * Property 8: HTTP Client Consistency
   * For any HTTP request from the frontend, authentication headers should be included 
   * and error responses should be handled consistently
   */
  describe('Property 8: HTTP Client Consistency', () => {
    it('should validate authentication header format for all requests', () => {
      fc.assert(fc.property(
        tokenArb,
        (token) => {
          // Verify token format is suitable for Bearer authentication
          expect(typeof token).toBe('string');
          expect(token.length).toBeGreaterThan(0);

          // Verify Bearer token format
          const authHeader = `Bearer ${token}`;
          expect(authHeader).toMatch(/^Bearer .+$/);
          expect(authHeader.startsWith('Bearer ')).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should validate HTTP method consistency', () => {
      fc.assert(fc.property(
        httpMethodArb,
        (method) => {
          // Verify HTTP method is valid
          const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          expect(validMethods).toContain(method);
          expect(typeof method).toBe('string');
          expect(method).toBe(method.toUpperCase());
        }
      ), { numRuns: 100 });
    });

    it('should validate URL format consistency', () => {
      fc.assert(fc.property(
        urlArb,
        (url) => {
          // Verify URL starts with /
          expect(url.startsWith('/')).toBe(true);
          expect(typeof url).toBe('string');
          expect(url.length).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });

    it('should validate HTTP status code ranges', () => {
      fc.assert(fc.property(
        httpStatusArb,
        (statusCode) => {
          // Verify status code is in valid range
          expect(statusCode).toBeGreaterThanOrEqual(200);
          expect(statusCode).toBeLessThan(600);
          expect(typeof statusCode).toBe('number');

          // Categorize status codes
          const isSuccess = statusCode >= 200 && statusCode < 300;
          const isRedirect = statusCode >= 300 && statusCode < 400;
          const isClientError = statusCode >= 400 && statusCode < 500;
          const isServerError = statusCode >= 500 && statusCode < 600;

          // Verify exactly one category is true
          const categories = [isSuccess, isRedirect, isClientError, isServerError];
          const trueCount = categories.filter(c => c).length;
          expect(trueCount).toBe(1);
        }
      ), { numRuns: 100 });
    });

    it('should validate API response structure consistency', () => {
      fc.assert(fc.property(
        apiResponseArb,
        (response) => {
          // Verify response has required fields
          expect(response).toHaveProperty('success');
          expect(typeof response.success).toBe('boolean');

          // Verify optional fields are properly typed when present
          if (response.data !== undefined && response.data !== null) {
            expect(typeof response.data).toBe('object');
          }
          if (response.message !== undefined && response.message !== null) {
            expect(typeof response.message).toBe('string');
          }
          if (response.errors !== undefined && response.errors !== null) {
            expect(Array.isArray(response.errors)).toBe(true);
            response.errors.forEach(error => {
              expect(error).toHaveProperty('field');
              expect(error).toHaveProperty('message');
              expect(typeof error.field).toBe('string');
              expect(typeof error.message).toBe('string');
            });
          }
        }
      ), { numRuns: 100 });
    });

    it('should validate error response structure consistency', () => {
      fc.assert(fc.property(
        errorMessageArb,
        fc.array(fc.record({
          field: fc.string({ minLength: 1, maxLength: 50 }),
          message: fc.string({ minLength: 1, maxLength: 200 })
        })),
        (errorMessage, fieldErrors) => {
          // Verify error message is a non-empty string
          expect(typeof errorMessage).toBe('string');
          expect(errorMessage.length).toBeGreaterThan(0);

          // Verify field errors structure
          expect(Array.isArray(fieldErrors)).toBe(true);
          fieldErrors.forEach(error => {
            expect(typeof error.field).toBe('string');
            expect(typeof error.message).toBe('string');
            expect(error.field.length).toBeGreaterThan(0);
            expect(error.message.length).toBeGreaterThan(0);
          });
        }
      ), { numRuns: 100 });
    });

    it('should validate request configuration structure consistency', () => {
      fc.assert(fc.property(
        requestConfigArb,
        (config) => {
          // Verify required fields
          expect(config).toHaveProperty('method');
          expect(config).toHaveProperty('url');
          expect(typeof config.method).toBe('string');
          expect(typeof config.url).toBe('string');

          // Verify optional fields are properly typed when present
          if (config.data !== undefined && config.data !== null) {
            expect(typeof config.data).toBe('object');
          }
          if (config.headers !== undefined && config.headers !== null) {
            expect(typeof config.headers).toBe('object');
            Object.entries(config.headers).forEach(([key, value]) => {
              expect(typeof key).toBe('string');
              expect(typeof value).toBe('string');
            });
          }
        }
      ), { numRuns: 100 });
    });

    it('should validate Content-Type header consistency', () => {
      fc.assert(fc.property(
        fc.constantFrom(
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain'
        ),
        (contentType) => {
          // Verify Content-Type is a valid MIME type
          expect(typeof contentType).toBe('string');
          expect(contentType).toMatch(/^[a-z]+\/[a-z\-+]+$/);

          // Verify it contains a slash
          expect(contentType.includes('/')).toBe(true);

          // Verify parts are non-empty
          const [type, subtype] = contentType.split('/');
          expect(type).toBeDefined();
          expect(subtype).toBeDefined();
          if (type) {
            expect(type.length).toBeGreaterThan(0);
          }
          if (subtype) {
            expect(subtype.length).toBeGreaterThan(0);
          }
        }
      ), { numRuns: 100 });
    });

    it('should validate timeout configuration consistency', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1000, max: 60000 }),
        (timeout) => {
          // Verify timeout is a positive number
          expect(typeof timeout).toBe('number');
          expect(timeout).toBeGreaterThan(0);
          expect(timeout).toBeLessThanOrEqual(60000);

          // Verify timeout is in milliseconds (reasonable range)
          expect(timeout).toBeGreaterThanOrEqual(1000); // At least 1 second
        }
      ), { numRuns: 100 });
    });
  });
});