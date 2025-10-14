"use client";

import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import React from "react";

import { ProductHistory } from "@/types/global";

const ProductsHistoryTable = ({ data }: { data: ProductHistory[] }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<ProductHistory>[] = [
    {
      accessorKey: "product.title",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.product;
        const deletedTitle = row.original.deletedTitle;
        const codeSuffix = product?.code ? ` (${product.code})` : "";
        const label = product?.title
          ? product.title + codeSuffix
          : deletedTitle || "N/A";
        return <div className="capitalize">{label}</div>;
      },
    },
    // {
    //   accessorKey: "editor",
    //   header: "Edited By",
    //   cell: ({ row }) => (
    //     <div className="capitalize">{row.original.editor || "N/A"}</div>
    //   ),
    // },
    {
      accessorKey: "changes",
      header: "Changes",
      cell: ({ row }) => {
        const changes = row.original.changes;
        if (!changes) return "N/A";

        return (
          <div className="space-y-1">
            {Object.entries(changes).map(([field, values]) => (
              <div key={field}>
                <span className="font-medium capitalize">{field}: </span>
                <span className="text-muted-foreground">
                  {values.old} → {values.new}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "categories",
      header: "Category Changes",
      cell: ({ row }) => {
        const added = row.original.categoriesAdded || [];
        const removed = row.original.categoriesRemoved || [];

        return (
          <div className="space-y-1">
            {added.length > 0 && (
              <div>
                <span className="font-medium text-green-600">Added: </span>
                <span className="text-muted-foreground">
                  {added.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
            {removed.length > 0 && (
              <div>
                <span className="font-medium text-red-600">Removed: </span>
                <span className="text-muted-foreground">
                  {removed.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
            {added.length === 0 && removed.length === 0 && "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => {
        const remark = row.original.remark || "";
        const deletedStock =
          typeof row.original.deletedStock === "number"
            ? ` | Stock at deletion: ${row.original.deletedStock}`
            : "";
        const removedCats = (row.original.categoriesRemoved || [])
          .map((c) => c.name)
          .join(", ");
        const removedCatsSuffix = removedCats
          ? ` | Categories: ${removedCats}`
          : "";
        const text =
          (remark || "").concat(deletedStock).concat(removedCatsSuffix) ||
          "N/A";
        return <div className="max-w-72 overflow-hidden truncate">{text}</div>;
      },
    },
    {
      accessorKey: "editedAt",
      header: "Date",
      cell: ({ row }) => (
        <div>{new Date(row.original.editedAt).toLocaleDateString()}</div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {/* <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default ProductsHistoryTable;
