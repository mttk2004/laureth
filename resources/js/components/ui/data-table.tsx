import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    label: string;
    render?: (item: T) => ReactNode;
  }[];
  actions?: (item: T) => ReactNode;
  pagination?: {
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    to: number;
    total: number;
  };
  className?: string;
  emptyState?: ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  actions,
  pagination,
  className,
  emptyState = <div className="text-center py-6 text-gray-500">Không có dữ liệu</div>,
}: DataTableProps<T>) {
  const getCellContent = (item: T, key: keyof T | string): string => {
    const value = item[key as keyof T];
    if (value === null || value === undefined) return '';
    return String(value);
  }

  return (
    <div className={cn("bg-background rounded-lg shadow overflow-hidden border border-border", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(item) : getCellContent(item, column.key)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>{emptyState}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 bg-muted/20 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Hiển thị từ <span className="font-medium">{pagination.from}</span> đến{' '}
              <span className="font-medium">{pagination.to}</span> của{' '}
              <span className="font-medium">{pagination.total}</span> mục
            </div>
            {pagination.links.length > 3 && (
              <div className="flex space-x-1">
                {pagination.links.map((link, i) => {
                  // Skip "prev" and "next" labels
                  if (i === 0 || i === pagination.links.length - 1) {
                    return null;
                  }

                  return (
                    <Link
                      key={i}
                      href={link.url || ''}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        link.active
                          ? 'z-10 bg-[#06f] text-white'
                          : 'bg-background text-muted-foreground hover:bg-muted'
                      } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                      preserveScroll
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
