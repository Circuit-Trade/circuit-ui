import {
	ColumnDef,
	HeaderGroup,
	RowData,
	RowModel,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';

import { sourceCodePro } from '@/constants/fonts';

const TableHeader = <T extends RowData>({
	headerGroups,
}: {
	headerGroups: HeaderGroup<T>[];
}) => {
	return (
		<thead>
			{headerGroups.map((headerGroup) => (
				<tr
					key={headerGroup.id}
					className="bg-gray-900 border-b border-container-border"
				>
					{headerGroup.headers.map((header) => (
						<th key={header.id} className="px-2 py-1 text-left">
							{header.isPlaceholder
								? null
								: flexRender(
										header.column.columnDef.header,
										header.getContext()
								  )}
						</th>
					))}
				</tr>
			))}
		</thead>
	);
};

const TableBody = <T extends RowData>({
	rowModel,
}: {
	rowModel: RowModel<T>;
}) => {
	return (
		<tbody className="border-b divide-y border-container-border divide-container-border">
			{rowModel.rows.map((row) => (
				<tr key={row.id}>
					{row.getVisibleCells().map((cell) => (
						<td key={cell.id} className="p-2">
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</td>
					))}
				</tr>
			))}
		</tbody>
	);
};

export const NumericValue = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={twMerge(
				sourceCodePro.className,
				className,
				'whitespace-nowrap'
			)}
		>
			{children}
		</div>
	);
};

export type TableProps<T> = {
	data: T[];
	columns: ColumnDef<T, any>[];
	className?: string;
};

export function Table<T extends RowData>({
	data,
	columns,
	className,
}: TableProps<T>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div
			className={twMerge(
				'max-w-full overflow-auto border border-container-border thin-scroll',
				className
			)}
		>
			<table className="w-full">
				<TableHeader<T> headerGroups={table.getHeaderGroups()} />
				<TableBody<T> rowModel={table.getRowModel()} />
			</table>
		</div>
	);
}
