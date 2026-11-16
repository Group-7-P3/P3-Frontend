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
	import * as Select from '$lib/components/ui/select/index.js';
	import { features, type DataTableFeatures } from './data-table-features.js';
	import Button from '../button/button.svelte';
	import { cn } from 'cn';
	import { Input } from '../input/index.js';
	import { ChevronDown, Copy, Plus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating, page as currentPage } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { tick } from 'svelte';
	import DataTableOpenButton from './data-table-open-button.svelte';
	import DataTableButton from './data-table-button.svelte';
	import { camelToTitleCase } from '#lib/utils.js';
	import DataTableDate from './data-table-date.svelte';

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

	let isMounted = $derived(true);
	let filterInput = $state<HTMLInputElement | null>(null);
	// svelte-ignore state_referenced_locally
	let selectedPageSize = $state(String(pageSize));
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
			cell: ({ row }) =>
				renderComponent(DataTableOpenButton, {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					row: row as any,
					onClick: onRowClick as (row: RowData) => void,
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
					cell: ({ getValue }) =>
						renderComponent(DataTableDate, {
							value: getValue()
						})
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
							{camelToTitleCase(column.id)}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
	<div class="relative overflow-hidden rounded-md border" aria-busy={showLoading}>
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
					<Table.Row>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class="group relative px-3 py-2"
								onclick={(e: MouseEvent) => {
									if (cell.column.id === 'select') e.stopPropagation();
								}}
							>
								<div class="flex min-h-8 items-center justify-between gap-2">
									<span class="truncate">
										<FlexRender {cell} />
									</span>

									{#if cell.column.id !== 'select'}
										<Button
											variant="ghost"
											size="icon-xs"
											class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
											onclick={(e) => {
												e.stopPropagation();
												navigator.clipboard.writeText(String(cell.getValue()));
											}}
										>
											<Copy class="h-3 w-3" />
										</Button>
									{/if}
								</div>
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
	<div class="flex items-center justify-between space-x-2 py-4">
		<Select.Root
			type="single"
			bind:value={selectedPageSize}
			onValueChange={() => {
				if (!isMounted) return;
				updateQuery({ size: selectedPageSize });
			}}
		>
			<Select.Trigger size="sm">
				Results: <Select.Value />
			</Select.Trigger>
			<Select.Content align="start">
				<Select.Item value="10">10</Select.Item>
				<Select.Item value="25">25</Select.Item>
				<Select.Item value="50">50</Select.Item>
				<Select.Item value="100">100</Select.Item>
			</Select.Content>
		</Select.Root>
		<div>
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
</div>
