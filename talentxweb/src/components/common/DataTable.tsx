import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Download
} from 'lucide-react';
import Button from './Button';

export interface ColumnDefinition<T> {
  key: keyof T | (string & {});
  header: string | React.ReactNode;
  sortable?: boolean | undefined;
  filterable?: boolean | undefined;
  render?: ((value: any, item: T) => React.ReactNode) | undefined;
}

export interface FilterConfig {
  [key: string]: string;
}

export interface PaginationConfig {
  page: number;
  size: number;
  total: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  loading?: boolean;
  pagination?: PaginationConfig | undefined;
  onSort?: ((field: keyof T, direction: 'asc' | 'desc') => void) | undefined;
  onFilter?: ((filters: FilterConfig) => void) | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  onPageSizeChange?: ((size: number) => void) | undefined;
  enableBulkActions?: boolean;
  onBulkAction?: (action: string, selectedItems: T[]) => void;
  bulkActions?: { label: string; value: string; icon?: React.ReactNode; variant?: 'primary' | 'danger' }[];
  onExport?: (selectedOnly: boolean) => void;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  onFilter,
  onPageChange,
  onPageSizeChange,
  enableBulkActions = false,
  onBulkAction,
  bulkActions = [
    { label: 'Export Selected', value: 'export', icon: <Download className="w-4 h-4" /> },
    { label: 'Delete Selected', value: 'delete', icon: <Trash2 className="w-4 h-4" />, variant: 'danger' },
  ],
  onExport
}: DataTableProps<T>) => {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterConfig>({});
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const handleSort = (field: keyof T) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(item => item.id || data.indexOf(item))));
    }
  };

  const toggleSelectItem = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getSelectedItems = () => {
    return data.filter(item => selectedIds.has(item.id || data.indexOf(item)));
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-secondary-900 rounded-2xl shadow-soft border border-secondary-100 dark:border-secondary-800 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-100 dark:border-primary-900/20 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-secondary-500 font-medium animate-pulse">Refining data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-900/50 rounded-2xl shadow-soft border border-secondary-100 dark:border-secondary-800 overflow-hidden backdrop-blur-sm transition-all duration-300">
      {/* Bulk Actions Bar */}
      {enableBulkActions && selectedIds.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 px-6 py-3 border-b border-primary-100 dark:border-primary-900/30 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-primary-500 text-white rounded-full center text-[10px] font-black">
              {selectedIds.size}
            </span>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300 tracking-tight">Items selected</span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map(action => (
              <Button
                key={action.value}
                size="xs"
                variant={action.variant === 'danger' ? 'danger' : 'glass'}
                icon={action.icon}
                onClick={() => onBulkAction?.(action.value, getSelectedItems())}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Actions Area */}
      {(columns.some(col => col.filterable) || onExport) && !selectedIds.size && (
        <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-800/20 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-4 flex-1">
            {columns.filter(col => col.filterable).map(column => (
              <div key={String(column.key)} className="relative group min-w-[200px] flex-1 max-w-sm">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-secondary-800 border-2 border-secondary-100 dark:border-secondary-700 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none dark:text-white"
                  value={filters[String(column.key)] || ''}
                  onChange={(e) => {
                    const newFilters = { ...filters, [String(column.key)]: e.target.value };
                    setFilters(newFilters);
                    onFilter?.(newFilters);
                  }}
                  placeholder={`Search ${column.header}...`}
                />
              </div>
            ))}
          </div>

          {onExport && data.length > 0 && (
            <Button
              variant="glass"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => onExport(false)}
              className="font-black uppercase tracking-widest text-[10px]"
            >
              Strategic Export
            </Button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-50/50 dark:bg-secondary-800/30 border-b border-secondary-100 dark:border-secondary-800">
              {enableBulkActions && (
                <th className="px-6 py-4 w-10">
                  <div className="center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-2 border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={selectedIds.size === data.length && data.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
              )}
              {columns.map(column => (
                <th key={String(column.key)} className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-[0.15em] whitespace-nowrap">
                  {column.sortable ? (
                    <button
                      className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      <span className={`transition-colors ${sortField === column.key ? 'text-primary-600' : 'text-secondary-300 opacity-0 group-hover:opacity-100'}`}>
                        {sortField === column.key ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableBulkActions ? 1 : 0)} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-secondary-50 dark:bg-secondary-800 rounded-full center">
                      <Filter className="w-10 h-10 text-secondary-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-secondary-900 dark:text-white font-bold text-lg">No Results Found</p>
                      <p className="text-secondary-500 text-sm max-w-xs mx-auto">We couldn't find any data matching your criteria. Try adjusting your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isSelected = selectedIds.has(item.id || index);
                return (
                  <tr
                    key={index}
                    className={`transition-all duration-200 group ${isSelected ? 'bg-primary-50/30 dark:bg-primary-900/5' : 'hover:bg-secondary-50/50 dark:hover:bg-secondary-800/20'}`}
                  >
                    {enableBulkActions && (
                      <td className="px-6 py-4 w-10">
                        <div className="center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-2 border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id || index)}
                          />
                        </div>
                      </td>
                    )}
                    {columns.map(column => (
                      <td key={String(column.key)} className="px-6 py-4 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        {column.render
                          ? column.render(item[column.key], item)
                          : (
                            <span className="dark:text-secondary-400">
                              {String(item[column.key] || '')}
                            </span>
                          )
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-5 border-t border-secondary-100 dark:border-secondary-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 dark:bg-transparent">
          <div className="text-[11px] font-bold uppercase tracking-widest text-secondary-500 dark:text-secondary-400">
            Showing <span className="text-secondary-900 dark:text-white">{((pagination.page - 1) * pagination.size) + 1}-{Math.min(pagination.page * pagination.size, pagination.total)}</span> of <span className="text-secondary-900 dark:text-white">{pagination.total}</span> entries
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary-500">Rows:</span>
              <select
                className="text-[11px] font-black bg-secondary-50 dark:bg-secondary-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 py-1.5 pl-3 pr-8 cursor-pointer dark:text-white"
                value={pagination.size}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="glass"
                size="xs"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(1)}
                icon={<ChevronsLeft className="w-3.5 h-3.5" />}
              />
              <Button
                variant="glass"
                size="xs"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              />

              <div className="min-w-[40px] h-8 center bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-lg text-xs font-black shadow-inner-pill dark:text-white">
                {pagination.page}
              </div>

              <Button
                variant="glass"
                size="xs"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                onClick={() => onPageChange?.(pagination.page + 1)}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              />
              <Button
                variant="glass"
                size="xs"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                onClick={() => onPageChange?.(Math.ceil(pagination.total / pagination.size))}
                icon={<ChevronsRight className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;