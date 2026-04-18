/**
 * **Feature: hrms-database-integration, Property 9: Form Validation Behavior**
 * **Validates: Requirements 4.2**
 */

import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import FormField from '../FormField';

describe('Form Validation Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  test('Property 9: Form validation behavior is consistent', () => {
    fc.assert(
      fc.property(
        fc.record({
          value: fc.string({ minLength: 0, maxLength: 100 }),
          required: fc.boolean(),
          minLength: fc.integer({ min: 0, max: 10 })
        }),
        ({ value, required, minLength }) => {
          const mockOnChange = jest.fn();

          // Determine if this should be an error case
          const shouldHaveError = required && value.trim() === '';
          const errorMessage = shouldHaveError ? 'This field is required' : undefined;

          const props: any = {
            name: "testField",
            label: "Test Field",
            type: "text" as const,
            value: value,
            onChange: mockOnChange,
            required: required,
            ...(errorMessage !== undefined && { error: errorMessage })
          };

          const { container } = render(
            <FormField {...props} />
          );

          const input = container.querySelector('input[name="testField"]');
          expect(input).toBeInTheDocument();
          expect(input).toHaveValue(value);

          // Check error display consistency
          const errorElement = container.querySelector('.form-error');
          if (shouldHaveError) {
            expect(errorElement).toBeInTheDocument();
            expect(errorElement?.textContent).toBeTruthy();
          } else {
            expect(errorElement).not.toBeInTheDocument();
          }

          // Check required indicator
          const requiredIndicator = container.querySelector('.form-required');
          if (required) {
            expect(requiredIndicator).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});