import type { ReactNode } from "react";
import { Table } from "react-bootstrap";

export type TableColumn<T> = {
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  emptyMessage: string;
  getRowKey: (item: T) => string;
  items: T[];
};

export function DataTable<T>({
  columns,
  emptyMessage,
  getRowKey,
  items,
}: DataTableProps<T>) {
  return (
    <Table responsive hover className="mb-0 align-middle">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header} className={column.className} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item) => (
            <tr key={getRowKey(item)}>
              {columns.map((column) => (
                <td key={column.header} className={column.className}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="py-5 text-center text-body-secondary">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
