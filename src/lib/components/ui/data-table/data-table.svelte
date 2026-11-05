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
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating, page as currentPage } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { tick } from 'svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';
	import DataTableButton from './data-table-button.svelte';
	import { camelToTitleCase } from '#lib/utils.js';

	type DataTableProps<TData extends RowData> = {
		class?: string;
		columns: string[];
		data: TData[];
		onRowClick?: (row: TData) => void;
		onAddClick?: () => void;
		totalRows: number;
		page: number;
		pageSize: number;
		filter: string;
		sort: string;
		direction: 'asc' | 'desc';
		route: string;
	};
	type PaginatedRoute =
		| `/(protected)/users?${string}`
		| `/(protected)/products?${string}`
		| `/(protected)/subscriptions?${string}`
		| `/(protected)/staff?${string}`;

	let {
		data,
		columns,
		class: className,
		onRowClick,
		onAddClick,
		totalRows,
		page,
		pageSize,
		filter,
		sort,
		direction,
		route
	}: DataTableProps<TData> = $props();

	let filterInput = $state<HTMLInputElement | null>(null);
	let filterTimer: ReturnType<typeof setTimeout> | undefined;
	const pageCount = $derived(Math.max(1, Math.ceil((totalRows ?? data.length) / pageSize)));
	let showLoading = $state(false);

	$effect(() => {
		if (navigating.to === null) {
			showLoading = false;
			return;
		}

		const timer = setTimeout(() => (showLoading = true), 100);
		return () => clearTimeout(timer);
	});

	async function updateQuery(updates: Record<string, string>) {
		const refocusFilter = 'filter' in updates;
		const selectionStart = filterInput?.selectionStart;
		const selectionEnd = filterInput?.selectionEnd;
		const params = new SvelteURLSearchParams(currentPage.url.searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value) params.set(key, value);
			else if (key === 'sort') params.set(key, 'none');
			else params.delete(key);
		}
		const target = `${route}?${params}` as PaginatedRoute;
		await goto(resolve(target));
		if (!refocusFilter || !filterInput) return;
		await tick();
		filterInput.focus();
		const start = Math.min(selectionStart ?? filterInput.value.length, filterInput.value.length);
		const end = Math.min(selectionEnd ?? start, filterInput.value.length);
		filterInput.setSelectionRange(start, end);
	}

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
				id: col,
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
		manualSorting: true,
		get data() {
			return data;
		},
		columns: cols,
		state: {
			get sorting() {
				return sort ? [{ id: sort, desc: direction === 'desc' }] : [];
			}
		},
		onSortingChange: (updater) => {
			const currentSorting = sort ? [{ id: sort, desc: direction === 'desc' }] : [];
			const next = typeof updater === 'function' ? updater(currentSorting) : updater;
			const nextSort = next[0];
			updateQuery({
				sort: nextSort?.id ?? '',
				direction: nextSort?.desc ? 'desc' : 'asc',
				page: '1'
			});
		}
	});

	function updateFilter(value: string) {
		if (filterTimer) clearTimeout(filterTimer);
		filterTimer = setTimeout(() => {
			updateQuery({ filter: value, page: '1' });
		}, 250);
	}
</script>

<div class={cn('w-fit max-w-full', className)}>
	<div class="flex items-center justify-between py-4">
		<Input
			bind:ref={filterInput}
			placeholder="Filter columns..."
			value={filter}
			oninput={(e) => {
				updateFilter(e.currentTarget.value);
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
	<div class="relative rounded-md border" aria-busy={showLoading}>
		{#if showLoading}
			<div
				class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 text-sm text-muted-foreground backdrop-blur-[1px]"
				role="status"
				aria-live="polite"
			>
				Loading...
			</div>
		{/if}
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
			onclick={() => updateQuery({ page: String(page - 1) })}
			disabled={page <= 1}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => updateQuery({ page: String(page + 1) })}
			disabled={page >= pageCount}
		>
			Next
		</Button>
	</div>
</div>
