import { createColumnHelper, renderComponent } from '@tanstack/svelte-table';
import type { DataTableFeatures } from './data-table-features.js';
import type { user } from '#lib/server/db/schema.js';
import DataTableButton from './data-table-button.svelte';
import DataTableCheckbox from './data-table-checkbox.svelte';

const columnHelper = createColumnHelper<DataTableFeatures, typeof user.$inferSelect>();

export const columns = columnHelper.columns([
	columnHelper.display({
		id: 'select',
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value: boolean) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	}),
	columnHelper.accessor('id', {
		id: 'ID',
		header: ({ column }) =>
			renderComponent(DataTableButton, {
				label: 'ID',
				sorted: column.getIsSorted(),
				onclick: column.getToggleSortingHandler()
			})
	}),
	columnHelper.accessor('customerId', {
		id: 'Customer ID',
		header: ({ column }) =>
			renderComponent(DataTableButton, {
				label: 'Customer ID',
				sorted: column.getIsSorted(),
				onclick: column.getToggleSortingHandler()
			})
	}),
	columnHelper.accessor('managedBy', {
		id: 'Managed By',
		header: ({ column }) =>
			renderComponent(DataTableButton, {
				label: 'Managed By',
				sorted: column.getIsSorted(),
				onclick: column.getToggleSortingHandler()
			})
	}),
	columnHelper.accessor('createdAt', {
		id: 'Created At',
		header: ({ column }) =>
			renderComponent(DataTableButton, {
				label: 'Created At',
				sorted: column.getIsSorted(),
				onclick: column.getToggleSortingHandler()
			})
	}),
	columnHelper.accessor('updatedAt', {
		id: 'Updated At',
		header: ({ column }) =>
			renderComponent(DataTableButton, {
				label: 'Updated At',
				sorted: column.getIsSorted(),
				onclick: column.getToggleSortingHandler()
			})
	})
]);
