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
	import { toast } from 'svelte-sonner';
	import { features, type DataTableFeatures } from './data-table-features.js';
	import Button from '../button/button.svelte';
	import { cn } from 'cn';
	import { Input } from '../input/index.js';
	import { ChevronDown, Copy, Plus, Funnel, ChevronRight, ChevronLeft } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating, page as currentPage } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import DataTableButton from './data-table-button.svelte';
	import { camelToTitleCase, isTimestamp } from '#lib/utils.js';
	import DataTableOpenButton from './data-table-open-button.svelte';
	import DataTableDate from './data-table-date.svelte';
	import { page as thisPage } from '$app/state';

	type PaginatedBase =
		| '/(protected)/[[demo=demo]]/users'
		| '/(protected)/[[demo=demo]]/products'
		| '/(protected)/[[demo=demo]]/subscriptions'
		| '/(protected)/[[demo=demo]]/staff';
	type PaginatedRoute =
		| `/(protected)/[[demo=demo]]/users?${string}`
		| `/(protected)/[[demo=demo]]/products?${string}`
		| `/(protected)/[[demo=demo]]/subscriptions?${string}`
		| `/(protected)/[[demo=demo]]/staff?${string}`;

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
		route: PaginatedBase;
	};

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
	const maxButtons = 5;
	let btnCount = $derived(Math.min(maxButtons, pageCount));

	$effect(() => {
		if (navigating.to === null) {
			showLoading = false;
			return;
		}

		const timer = setTimeout(() => (showLoading = true), 100);
		return () => clearTimeout(timer);
	});

	async function updateQuery(updates: Record<string, string>) {
		const params = new SvelteURLSearchParams(currentPage.url.searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value) params.set(key, value);
			else if (key === 'sort') params.set(key, 'none');
			else params.delete(key);
		}
		const target = `${route}?${params}` as PaginatedRoute;
		await goto(resolve(target, { demo: thisPage.data.demo }), { reset: false });
	}

	const columnHelper = createColumnHelper<DataTableFeatures, TData>();
	const cols = columnHelper.columns([
		columnHelper.display({
			id: 'open',
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
		// svelte-ignore state_referenced_locally
		...columns.map((col) => {
			const label = camelToTitleCase(col);
			const isTime = isTimestamp(col);

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
				...(isTime && {
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
		<div class="flex items-center gap-2">
			<Input
				bind:ref={filterInput}
				placeholder="Filter columns..."
				value={filter}
				oninput={(e) => {
					updateFilter(e.currentTarget.value);
					updateFilter(e.currentTarget.value);
				}}
				class="max-w-sm"
			/>
			<Button size="icon" variant="secondary"><Funnel /></Button>
			{#if onAddClick}
				<Button onclick={onAddClick}><Plus /> Create Staff</Button>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<Select.Root
				type="single"
				bind:value={selectedPageSize}
				onValueChange={() => {
					if (!isMounted) return;
					updateQuery({ size: selectedPageSize });
				}}
			>
				<Select.Trigger>
					<span class="text-muted-foreground">Results:</span>
					<Select.Value />
				</Select.Trigger>
				<Select.Content align="start">
					<Select.Item value="10">10</Select.Item>
					<Select.Item value="25">25</Select.Item>
					<Select.Item value="50">50</Select.Item>
					<Select.Item value="100">100</Select.Item>
				</Select.Content>
			</Select.Root>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" class="ms-auto">
							Columns <ChevronDown class="text-muted-foreground" />
						</Button>
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
									<span class="flex items-center gap-2 truncate">
										<FlexRender {cell} />
										{#if cell.column.id !== 'open'}
											<Button
												variant="ghost"
												size="icon-xs"
												class="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												onclick={async (e) => {
													e.stopPropagation();
													try {
														const value = String(cell.getValue());
														const isTime = isTimestamp(cell.column.id);

														await navigator.clipboard.writeText(
															isTime
																? new Intl.DateTimeFormat(undefined, {
																		dateStyle: 'medium'
																	}).format(new Date(value))
																: value
														);
														toast.success('Successfully copied to clipboard.');
													} catch {
														toast.error('Failed to copy to clipboard! Check browser permissions.');
													}
												}}
											>
												<Copy class="h-3 w-3" />
											</Button>
										{/if}
									</span>
								</div>
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length + 1} class="h-24 text-center">
							No results.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-center space-x-2 py-4">
		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				onclick={() => updateQuery({ page: String(page - 1) })}
				disabled={page <= 1}
			>
				<ChevronLeft />
			</Button>
			{#each { length: btnCount }, i (i)}
				{@const p =
					page <= Math.floor(btnCount / 2)
						? i + 1
						: page >= pageCount - Math.floor(btnCount / 2)
							? pageCount + i - btnCount + 1
							: page + i - Math.floor(btnCount / 2)}
				<Button
					size="icon-sm"
					variant={page === p ? 'default' : 'outline'}
					onclick={() => updateQuery({ page: String(p) })}
				>
					{p}
				</Button>
			{/each}
			<Button
				variant="outline"
				size="icon-sm"
				onclick={() => updateQuery({ page: String(page + 1) })}
				disabled={page >= pageCount}
			>
				<ChevronRight />
			</Button>
		</div>
	</div>
</div>
