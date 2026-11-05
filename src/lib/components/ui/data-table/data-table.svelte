<script lang="ts" generics="TData extends RowData">
	import {
		type RowData,
		createColumnHelper,
		createTable,
		FlexRender,
		renderComponent
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { features, type DataTableFeatures } from './data-table-features.js';
	import Button from '../button/button.svelte';
	import { cn } from 'cn';
	import { Input } from '../input/index.js';
	import { ChevronDown, Plus } from '@lucide/svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import DataTableButton from './data-table-button.svelte';
	import { camelToTitleCase } from '#lib/utils.js';

	type DataTableProps<TData extends RowData> = {
		class?: string;
		columns: string[];
		data: TData[];
		onRowClick?: (row: TData) => void;
		onAddClick?: () => void;
	};

	let { data, columns, class: className, onRowClick, onAddClick }: DataTableProps<TData> = $props();

	let globalFilter = $state('');
	const columnHelper = createColumnHelper<DataTableFeatures, TData>();
	const cols = columnHelper.columns([
		columnHelper.display({
			id: 'select',
			meta: {
				class: 'mr-4 pr-4',
				className: 'mr-4 pr-4'
			},
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
		// eslint-disable-next-line svelte/no-unused-svelte-ignore
		// svelte-ignore state_referenced_locally
		...columns.map((col) => {
			const label = camelToTitleCase(col);
			const isTimestamp = /At$|Date$|Time$/i.test(col);

			return columnHelper.accessor((row) => row[col as keyof TData], {
				id: label,
				header: ({ column }) => {
					const sorted = column.getIsSorted();
					const onclick = column.getToggleSortingHandler();

					return renderComponent(DataTableButton, {
						label,
						sorted,
						onclick
					});
				},
				...(isTimestamp && {
					cell: ({ getValue }) => {
						const value = getValue();
						if (!value) return '';

						// Handles numbers (epochs), ISO strings, or Date objects
						const dateInput =
							typeof value === 'number' || typeof value === 'string' || value instanceof Date
								? value
								: String(value);
						const date = new Date(
							typeof dateInput === 'number' && dateInput.toString().length === 10
								? dateInput * 1000
								: dateInput
						);

						// Format nicely, e.g., "Nov 2, 2026, 11:15 AM"
						return isNaN(date.getTime())
							? String(value)
							: new Intl.DateTimeFormat('en-US', {
									dateStyle: 'medium',
									timeStyle: 'short'
								}).format(date);
					}
				})
			});
		})
	]);

	const table = createTable({
		features,
		get data() {
			return data;
		},
		columns: cols,
		state: {
			get globalFilter() {
				return globalFilter;
			}
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
		}
	});
	table.setPageSize(12);
</script>

<div class={cn('w-full', className)}>
	<div class="flex items-center justify-between py-4">
		<Input
			placeholder="Filter columns..."
			value={globalFilter}
			onchange={(e) => {
				globalFilter = e.currentTarget.value;
			}}
			oninput={(e) => {
				globalFilter = e.currentTarget.value;
			}}
			class="max-w-sm"
		/>
		<div class="flex items-center gap-2">
			{#if onAddClick}
				<Button size="icon" onclick={onAddClick}><Plus /></Button>
			{/if}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" class="ms-auto">Columns <ChevronDown /></Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-max">
					{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
						<DropdownMenu.CheckboxItem
							class="capitalize"
							bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
						>
							{column.id}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan} class="px-3">
								{#if !header.isPlaceholder}
									<FlexRender {header} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row
						data-state={row.getIsSelected() && 'selected'}
						class={cn(onRowClick && 'cursor-pointer transition-colors hover:bg-muted/50')}
						onclick={() => {
							if (!onRowClick) return;
							onRowClick(row.original);
						}}
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class="px-3"
								onclick={(e: MouseEvent) => {
									if (cell.column.id === 'select') {
										e.stopPropagation();
									}
								}}
							>
								<FlexRender {cell} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length + 1} class="h-24 text-center"
							>No results.</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.previousPage()}
			disabled={!table.getCanPreviousPage()}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.nextPage()}
			disabled={!table.getCanNextPage()}
		>
			Next
		</Button>
	</div>
</div>
