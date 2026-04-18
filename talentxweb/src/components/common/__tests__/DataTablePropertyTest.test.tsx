/**
 * **Feature: hrms-database-integration, Property 10: Data Table Functionality**
 * **Validates: Requirements 4.3**
 */

import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import DataTable, { ColumnDefinition } from '../DataTable';

interface TestData {
  id: number;
  name: string;
  email: string;
  age: number;
}

describe('Data Table Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  const createColumns = (): ColumnDefinition<TestData>[] => [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'email', header: 'Email', filterable: true },
    { key: 'age', header: 'Age', sortable: true }
  ];

  test('Property 10: Data table renders correctly with any valid data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            age: fc.integer({ min: 18, max: 100 })
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (testData) => {
          const columns = createColumns();

          const { container } = render(
            <DataTable
              data={testData}
              columns={columns}
            />
          );

          // Check that table is rendered
          const table = container.querySelector('table');
          expect(table).toBeInTheDocument();

          // Check headers are rendered
          const headers = container.querySelectorAll('th');
          expect(headers).toHaveLength(columns.length);

          // Check data rows are rendered
          const dataRows = container.querySelectorAll('tbody tr');
          if (testData.length === 0) {
            expect(dataRows).toHaveLength(1); // "No data" row
            const noDataCell = container.querySelector('td');
            expect(noDataCell?.textContent).toContain('No data');
          } else {
            expect(dataRows).toHaveLength(testData.length);

            // Check that each row has correct number of cells
            dataRows.forEach(row => {
              const cells = row.querySelectorAll('td');
              expect(cells).toHaveLength(columns.length);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Filterable columns render filter inputs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
            age: fc.integer({ min: 18, max: 100 })
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (testData) => {
          const columns = createColumns();

          const { container } = render(
            <DataTable
              data={testData}
              columns={columns}
            />
          );

          // Check that filterable columns have filter inputs
          const filterableColumns = columns.filter(col => col.filterable);
          const filterInputs = container.querySelectorAll('.data-table-filters input');

          expect(filterInputs).toHaveLength(filterableColumns.length);

          // Each filter input should have proper attributes
          filterInputs.forEach((input, index) => {
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder');
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 10: Pagination displays correct information when provided', () => {
    fc.assert(
      fc.property(
        fc.record({
          data: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              email: fc.emailAddress(),
              age: fc.integer({ min: 18, max: 100 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          page: fc.integer({ min: 1, max: 5 }),
          size: fc.integer({ min: 5, max: 25 }),
          total: fc.integer({ min: 1, max: 100 })
        }),
        ({ data, page, size, total }) => {
          const columns = createColumns();

          const { container } = render(
            <DataTable
              data={data}
              columns={columns}
              pagination={{ page, size, total }}
            />
          );

          // Check pagination info is displayed
          const paginationInfo = container.querySelector('.pagination-info');
          expect(paginationInfo).toBeInTheDocument();
          expect(paginationInfo?.textContent).toContain('entries');
          expect(paginationInfo?.textContent).toContain(total.toString());

          // Check pagination controls exist
          const paginationControls = container.querySelector('.pagination-controls');
          expect(paginationControls).toBeInTheDocument();

          // Check page size selector exists
          const pageSizeSelect = container.querySelector('select');
          expect(pageSizeSelect).toBeInTheDocument();

          // Check navigation buttons exist
          const buttons = container.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});