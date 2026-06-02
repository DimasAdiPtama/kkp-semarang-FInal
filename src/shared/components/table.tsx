import * as React from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnFiltersState,
} from '@tanstack/react-table';
import { cva } from 'class-variance-authority';

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type TableProps<T extends object> = {
    data: T[];
    columns: ColumnDef<T, any>[];
};

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const tableWrapper = cva('w-full border border-slate-300 rounded-sm bg-white');

const thStyles = cva(
    'px-4 py-2 text-left text-sm font-semibold border-b border-slate-300 cursor-pointer select-none bg-slate-100 text-black',
);

const tdStyles = cva('px-4 py-2 text-sm border-b border-slate-200 text-black');

const inputStyles = cva(
    'w-full border border-slate-300 rounded-sm px-2 py-1 text-xs bg-white text-black focus:outline-none',
);

const globalInputStyles = cva(
    'w-full border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white text-black focus:outline-none',
);

const buttonStyles = cva(
    'px-3 py-1 border border-slate-300 rounded-sm text-sm bg-white text-black disabled:opacity-50',
);

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export function Table<T extends object>({ data, columns }: TableProps<T>) {
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            columnFilters,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="w-full space-y-4">
            {/* Global Search */}
            <input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className={globalInputStyles()}
            />

            {/* Table */}
            <div className={tableWrapper()}>
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <React.Fragment key={headerGroup.id}>
                                {/* Header */}
                                <tr>
                                    {headerGroup.headers.map((header) => {
                                        const isSorted =
                                            header.column.getIsSorted();

                                        return (
                                            <th
                                                key={header.id}
                                                className={thStyles()}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                    </span>
                                                    <span>
                                                        {isSorted === 'asc' &&
                                                            '↑'}
                                                        {isSorted === 'desc' &&
                                                            '↓'}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>

                                {/* Column Filters */}
                                <tr>
                                    {headerGroup.headers.map((header) => {
                                        const column = header.column;

                                        return (
                                            <th
                                                key={header.id}
                                                className="px-4 py-2 border-b border-slate-300 bg-white"
                                            >
                                                {column.getCanFilter() ? (
                                                    <input
                                                        value={
                                                            (column.getFilterValue() ??
                                                                '') as string
                                                        }
                                                        onChange={(e) =>
                                                            column.setFilterValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Filter..."
                                                        className={inputStyles()}
                                                    />
                                                ) : null}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </React.Fragment>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-100">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={tdStyles()}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-6 text-slate-400"
                                >
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-black">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className={buttonStyles()}
                    >
                        Prev
                    </button>

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className={buttonStyles()}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Table;
