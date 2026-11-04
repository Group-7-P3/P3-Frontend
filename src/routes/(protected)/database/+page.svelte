<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check, Code, Copy, Play, Table2 } from '@lucide/svelte';
	import { tick } from 'svelte';

	type TableSchema = {
		name: string;
		columns: string[];
	};
	type QueryRow = Record<string, unknown>;

	/**
	 * All tables in the database and their attributes.\
	 * Used for highlighting and intellisense.
	 */
	const tables: TableSchema[] = [
		{ name: 'user', columns: ['id', 'customer_id', 'managed_by', 'created_at', 'updated_at'] },
		{
			name: 'staff',
			columns: [
				'id',
				'name',
				'email',
				'email_verified',
				'image',
				'role',
				'group',
				'created_at',
				'updated_at'
			]
		},
		{ name: 'product', columns: ['serial_number', 'status', 'created_at', 'updated_at'] },
		{
			name: 'subscription',
			columns: [
				'license_key',
				'user_id',
				'type',
				'max_devices',
				'created_at',
				'updated_at',
				'expires_at',
				'auto_renew'
			]
		},
		{ name: 'subscription_to_product', columns: ['license_key', 'serial_number'] }
	];

	/**
	 * All keywords.\
	 * Used for highlighting and intellisense.
	 */
	const keywords = [
		'SELECT',
		'FROM',
		'WHERE',
		'AND',
		'OR',
		'ORDER BY',
		'GROUP BY',
		'HAVING',
		'JOIN',
		'LEFT JOIN',
		'RIGHT JOIN',
		'INNER JOIN',
		'ON',
		'AS',
		'LIMIT',
		'OFFSET',
		'INSERT',
		'VALUES',
		'UPDATE',
		'SET',
		'INTO',
		'DELETE',
		'CREATE',
		'FROM',
		'TABLE',
		'NULL',
		'TRUE',
		'FALSE',
		'ASC',
		'DESC',
		'CURRENT_DATE',
		'TRUNCATE',
		'DROP',
		'MERGE',
		'ALTER',
		'COPY',
		'RENAME',
		'COMMENT',
		'GRANT',
		'REVOKE'
	];

	/**
	 * Delete keywords.\
	 * Used to decide whether a query is dangerous.
	 */
	const deleteKeywords = ['DELETE', 'TRUNCATE', 'DROP'];

	/**
	 * Modify keywords.\
	 * Used to decide whether a query is dangerous.
	 */
	const modifyKeywords = [
		'UPDATE',
		'INSERT',
		'MERGE',
		'ALTER',
		'CREATE',
		'COPY',
		'RENAME',
		'COMMENT',
		'GRANT',
		'REVOKE'
	];

	/**
	 * The current query, which also holds the default value.
	 */
	let query = $state(`SELECT
  u.id,
  u.customer_id,
  s.type,
  s.expires_at
FROM "user" AS u
JOIN subscription AS s ON s.user_id = u.id
WHERE s.expires_at >= CURRENT_DATE
ORDER BY s.expires_at ASC;`);

	let editor = $state<HTMLTextAreaElement>();
	let lineNumbers = $state<HTMLDivElement>();
	let highlightedQuery = $state<HTMLElement>();
	let suggestions = $state<string[]>([]);
	let selectedSuggestion = $state(0);
	let copied = $state(false);
	let queryStatus = $state<'idle' | 'running' | 'success' | 'error'>('idle');
	let queryError = $state('');
	let queryRows = $state<QueryRow[]>([]);
	let queryRowCount = $state(0);
	let suggestionPosition = $state({ top: 16, left: 64 });
	let dialogOpen = $state(false);
	let querySeverity: 'delete' | 'modify' | false = $state(false);

	/**
	 * An array containing all possible suggestions.
	 */
	const allSuggestions = [
		...keywords,
		...tables.flatMap((table) => [table.name, ...table.columns])
	];

	function escapeHtml(value: string) {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function escapeRegex(value: string) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * SQL syntax highlighting, returned in HTML.
	 */
	function highlightSql(value: string) {
		const multiWordKeywords = keywords
			.filter((keyword) => keyword.includes(' '))
			.sort((left, right) => right.length - left.length)
			.map((keyword) => escapeRegex(keyword).replace(/\\ /g, '\\s+'))
			.join('|');
		const tokenPattern = new RegExp(
			`(--[^\\n]*|'(?:''|[^'])*'|"(?:""|[^"])*"|\\x60[^\\x60]*\\x60|\\b(?:${multiWordKeywords})\\b|\\b\\d+(?:\\.\\d+)?\\b|[A-Za-z_][\\w$]*|\\s+|.)`,
			'g'
		);
		return Array.from(value.matchAll(tokenPattern))
			.map(([token]) => {
				const escaped = escapeHtml(token);
				if (/^--/.test(token)) return `<span class="sql-comment">${escaped}</span>`;
				if (/^['"`]/.test(token)) return `<span class="sql-string">${escaped}</span>`;
				if (/^\d/.test(token)) return `<span class="sql-number">${escaped}</span>`;
				if (/^[A-Za-z_]/.test(token) && keywords.some((keyword) => keyword === token.toUpperCase()))
					return `<span class="sql-keyword">${escaped}</span>`;
				if (/^[A-Za-z_]/.test(token) && tables.some((table) => table.name === token))
					return `<span class="sql-table">${escaped}</span>`;
				return escaped;
			})
			.join('');
	}

	/**
	 * Updates the suggestions to match what's being written.
	 */
	function updateSuggestions() {
		const cursor = editor?.selectionStart ?? query.length;
		const word = query.slice(0, cursor).match(/[A-Za-z_][\w$]*$/)?.[0] ?? '';
		if (!word) {
			suggestions = [];
			return;
		}

		updateSuggestionPosition(cursor);
		const lowerWord = word.toLowerCase();
		const nextSuggestions = allSuggestions
			.filter((suggestion) => suggestion.toLowerCase().startsWith(lowerWord) && suggestion !== word)
			.slice(0, 8);
		const selectedValue = suggestions[selectedSuggestion];
		suggestions = nextSuggestions;
		selectedSuggestion = selectedValue ? Math.max(0, nextSuggestions.indexOf(selectedValue)) : 0;
	}

	/**
	 * Updates the position of the suggestion popover.
	 */
	function updateSuggestionPosition(cursor: number) {
		if (!editor) return;

		const beforeCursor = query.slice(0, cursor);
		const lineIndex = beforeCursor.split('\n').length - 1;
		const column = beforeCursor.length - (beforeCursor.lastIndexOf('\n') + 1);
		const lineHeight = 24;
		const characterWidth = 7.8;
		const editorPadding = 16;
		const gutterWidth = 48;
		const menuHeight = 220;
		const topBelowCaret = editorPadding + (lineIndex + 1) * lineHeight - editor.scrollTop;
		const topAboveCaret = editorPadding + lineIndex * lineHeight - editor.scrollTop - menuHeight;
		const top =
			topBelowCaret + menuHeight > editor.clientHeight
				? Math.max(editorPadding, topAboveCaret)
				: topBelowCaret;
		const left = Math.min(
			Math.max(
				gutterWidth + editorPadding + column * characterWidth - editor.scrollLeft,
				gutterWidth
			),
			Math.max(gutterWidth, editor.clientWidth - 240)
		);

		suggestionPosition = { top, left };
	}

	/**
	 * Syncs the scroll between the textarea and the text-element which holds the HTML formatted query.
	 */
	function syncEditorScroll(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		if (lineNumbers) {
			lineNumbers.scrollTop = target.scrollTop;
			lineNumbers.scrollLeft = target.scrollLeft;
		}
		if (highlightedQuery) {
			highlightedQuery.scrollTop = target.scrollTop;
			highlightedQuery.scrollLeft = target.scrollLeft;
		}
	}

	/**
	 * Run when the user selects a suggestion to add to the query.
	 */
	function chooseSuggestion(suggestion: string) {
		const cursor = editor?.selectionStart ?? query.length;
		const match = query.slice(0, cursor).match(/[A-Za-z_][\w$]*$/);
		const start = match ? cursor - match[0].length : cursor;
		query = `${query.slice(0, start)}${suggestion}${query.slice(cursor)}`;
		suggestions = [];
		void tick().then(() => {
			editor?.focus();
			editor?.setSelectionRange(start + suggestion.length, start + suggestion.length);
		});
	}

	/**
	 * Handles the input when the suggestions-popover is open.\
	 * Arrow-up, arrow-down, tab, enter, and escape.
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (!suggestions.length) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedSuggestion = selectedSuggestion + 1 < suggestions.length ? selectedSuggestion + 1 : 0;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedSuggestion =
				selectedSuggestion - 1 >= 0 ? selectedSuggestion - 1 : suggestions.length - 1;
			return;
		}

		if (event.key === 'Tab' || event.key === 'Enter') {
			event.preventDefault();
			chooseSuggestion(suggestions[selectedSuggestion]);
			return;
		}

		if (event.key !== 'Escape') return;
		suggestions = [];
	}

	/**
	 * Inserts text at the cursor position in the textarea.
	 */
	function insertText(value: string) {
		const cursor = editor?.selectionStart ?? query.length;
		query = `${query.slice(0, cursor)}${value}${query.slice(cursor)}`;
		void tick().then(() => {
			editor?.focus();
			editor?.setSelectionRange(cursor + value.length, cursor + value.length);
		});
	}

	/**
	 * Copies the query to the clipboard.
	 */
	async function copyQuery() {
		await navigator.clipboard.writeText(query);
		copied = true;
		setTimeout(() => (copied = false), 1600);
	}

	function getDangerousQuery(): 'delete' | 'modify' | false {
		for (const dkw of deleteKeywords) {
			if (query.indexOf(dkw) === -1) continue;
			return 'delete';
		}

		for (const mkw of modifyKeywords) {
			if (query.indexOf(mkw) === -1) continue;
			return 'modify';
		}

		return false;
	}

	/**
	 * Shows dialog if query is unsafe, and then runs the query if the user confirms.
	 */
	async function runQuery() {
		querySeverity = getDangerousQuery();
		console.log(querySeverity);

		switch (querySeverity) {
			case 'modify':
				dialogOpen = true;
				return;
			case 'delete':
				dialogOpen = true;
				return;
		}

		forceRunQuery();
	}

	/**
	 * Runs the query without safety.
	 */
	async function forceRunQuery() {
		queryStatus = 'running';
		queryError = '';
		queryRows = [];
		queryRowCount = 0;

		try {
			const response = await fetch('/database', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ query })
			});
			const payload: { rows?: QueryRow[]; rowCount?: number; error?: string } =
				await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'The query could not be executed');

			queryRows = payload.rows ?? [];
			queryRowCount = payload.rowCount ?? queryRows.length;
			queryStatus = 'success';
		} catch (cause) {
			queryError = cause instanceof Error ? cause.message : 'The query could not be executed';
			queryStatus = 'error';
		}
	}

	/**
	 * Format cells based on type.
	 */
	function formatCell(value: unknown) {
		if (value === null || value === undefined) return 'NULL';
		if (value instanceof Date) return value.toLocaleString();
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}

	/**
	 * The columns in the query table based on the results.
	 */
	function resultColumns() {
		return queryRows.length ? Object.keys(queryRows[0]) : [];
	}
</script>

<svelte:head>
	<title>Database</title>
</svelte:head>

<div class="flex w-full flex-1 flex-col gap-4">
	<div class="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
		<div class="flex max-h-191 flex-col gap-4">
			<!-- The SQL Editor Card -->
			<Card.Root class="gap-0 p-0">
				<Card.Header class="flex flex-wrap items-center justify-between gap-3 border-b p-4!">
					<div class="flex items-center gap-2 text-sm font-medium">
						<Code size={17} class="text-primary" />
						Query
					</div>
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" onclick={copyQuery}>
							{#if copied}<Check size={14} /> Copied{:else}<Copy size={14} /> Copy{/if}
						</Button>
						<Button disabled={queryStatus === 'running'} onclick={runQuery}>
							{#if queryStatus === 'running'}
								<span
									class="size-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
								></span>
								Running...
							{:else}
								<Play size={14} /> Run query
							{/if}
						</Button>
					</div>
				</Card.Header>

				<div class="relative min-h-0 flex-1">
					<div
						class="sql-editor relative h-full min-h-0 overflow-hidden bg-muted/30 font-mono text-[13px] leading-6"
					>
						<div class="pointer-events-none absolute inset-0 flex overflow-hidden">
							<!-- Line Numbers -->
							<div
								bind:this={lineNumbers}
								class="h-full w-12 shrink-0 overflow-hidden border-r border-border bg-muted/50 py-4 text-right text-muted-foreground select-none"
							>
								{#each query.split('\n') as line, index (`line-${index}-${line}`)}
									<div class="pr-3">{index + 1}</div>
								{/each}
							</div>
							<!-- The Syntax Highlighted SQL -->
							<pre
								bind:this={highlightedQuery}
								class="sql-code-layer m-0 h-full overflow-hidden p-4 whitespace-pre text-foreground"
								aria-hidden="true">
                {@html highlightSql(query)}
              </pre>
						</div>
						<!-- The SQL Textarea -->
						<textarea
							bind:this={editor}
							bind:value={query}
							class="sql-code-layer relative z-10 h-full min-h-64 w-full flex-1 resize-none overflow-auto rounded-none border-none bg-transparent py-4 pr-4 pl-16 whitespace-pre text-transparent caret-foreground outline-none select-text selection:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring/50"
							spellcheck="false"
							data-gramm="false"
							data-grammarly="false"
							wrap="off"
							aria-label="SQL query editor"
							oninput={updateSuggestions}
							onkeydown={handleKeydown}
							onscroll={syncEditorScroll}
							onblur={() => setTimeout(() => (suggestions = []), 120)}></textarea>
					</div>
					<!-- Suggestion Popover -->
					{#if suggestions.length}
						<div
							class="absolute z-20 min-w-48 overflow-hidden rounded-md border border-border bg-popover text-xs text-popover-foreground shadow-md"
							style={`top: ${suggestionPosition.top}px; left: ${suggestionPosition.left}px`}
						>
							{#each suggestions as suggestion, index (`suggestion-${index}-${suggestion}`)}
								<button
									class:autocomplete-selected={index === selectedSuggestion}
									class="block w-full px-3 py-1.5 text-left hover:bg-muted"
									onmousedown={(event) => event.preventDefault()}
									onclick={() => chooseSuggestion(suggestion)}
								>
									{suggestion}
								</button>
							{/each}
							<div class="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
								Enter to select · Esc to close
							</div>
						</div>
					{/if}
				</div>
				<div
					class="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground"
				>
					<span>PostgreSQL</span>
					<span>{query.length} characters</span>
				</div>
			</Card.Root>

			<!-- Resulting Query Table/Error Card -->
			<Card.Root size="sm" class="flex-1 gap-0 pb-0">
				<Card.Header class="flex items-center justify-between border-b">
					<div>
						<Card.Title>Query results</Card.Title>
						{#if queryStatus === 'success'}
							<Card.Description>
								{queryRowCount}
								{queryRowCount === 1 ? 'row' : 'rows'} returned
							</Card.Description>
						{:else if queryStatus === 'idle'}
							<Card.Description>Run a query to see its response here.</Card.Description>
						{/if}
					</div>
					{#if queryStatus === 'success'}
						<span
							class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
							>Completed</span
						>
					{:else if queryStatus === 'error'}
						<span
							class="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
							>Failed</span
						>
					{/if}
				</Card.Header>

				{#if queryStatus === 'error'}
					<div
						class="m-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
					>
						{queryError}
					</div>
				{:else if queryStatus === 'success' && queryRows.length > 0}
					<div class="overflow-auto">
						<Table.Root>
							<Table.Header class="sticky top-0 bg-muted/95 text-xs text-muted-foreground">
								<Table.Row>
									{#each resultColumns() as column (column)}
										<Table.Head class="px-4 py-3">{column}</Table.Head>
									{/each}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each queryRows as row, rowIndex (rowIndex)}
									<Table.Row>
										{#each resultColumns() as column (column)}
											<Table.Cell
												class="max-w-80 truncate px-4 py-3 font-mono text-xs whitespace-nowrap"
												title={formatCell(row[column])}
											>
												{formatCell(row[column])}
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{:else if queryStatus === 'success'}
					<div class="p-8 text-center text-sm text-muted-foreground">
						Query completed successfully but returned no rows.
					</div>
				{:else if queryStatus === 'idle'}
					<div class="p-8 text-center text-sm text-muted-foreground">Nothing here to show.</div>
				{/if}
			</Card.Root>
		</div>

		<!-- The Helping Database Schema -->
		<Card.Root size="sm" class="h-fit">
			<Card.Header class="border-b">
				<Card.Title>Database schema</Card.Title>
				<Card.Description>Click a table or column to add it to the query.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-1">
				{#each tables as table (table.name)}
					<div class="rounded-md border border-transparent hover:border-border hover:bg-muted/40">
						<Button
							variant="ghost"
							class="h-auto w-full justify-start px-2 py-2 text-left"
							onclick={() => insertText(table.name)}
						>
							<Table2 size={15} class="text-muted-foreground" />
							{table.name}
						</Button>
						<div class="grid grid-cols-2 gap-x-2 px-2 pb-2">
							{#each table.columns as column, index (`${table.name}-${index}-${column}`)}
								<Button
									variant="ghost"
									size="xs"
									class="h-auto w-full justify-start truncate px-1.5 py-0.5 text-left text-xs text-muted-foreground"
									title={`Add ${column}`}
									onclick={() => insertText(column)}
								>
									{column}
								</Button>
							{/each}
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>

<!-- The Dangerous Query Dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Dangerous Query!</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently {querySeverity} the database. Are you sure
				you want to continue?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="destructive"
				onclick={() => {
					forceRunQuery();
					dialogOpen = false;
				}}>Confirm</Button
			>
			<Button onclick={() => (dialogOpen = false)}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	.sql-editor {
		--sql-keyword: oklch(0.55 0.2 300);
		--sql-string: oklch(0.48 0.16 145);
		--sql-number: oklch(0.58 0.16 75);
		--sql-comment: var(--muted-foreground);
		--sql-table: oklch(0.48 0.14 210);
	}

	.sql-code-layer {
		box-sizing: border-box;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 13px;
		font-variant-ligatures: none;
		line-height: 1.5rem;
		letter-spacing: 0;
		tab-size: 4;
	}

	:global(.dark) .sql-editor {
		--sql-keyword: oklch(0.78 0.16 305);
		--sql-string: oklch(0.78 0.16 145);
		--sql-number: oklch(0.82 0.15 85);
		--sql-table: oklch(0.78 0.13 210);
	}

	:global(.sql-keyword) {
		color: var(--sql-keyword);
		font-weight: 600;
	}
	:global(.sql-string) {
		color: var(--sql-string);
	}
	:global(.sql-number) {
		color: var(--sql-number);
	}
	:global(.sql-comment) {
		color: var(--sql-comment);
		font-style: italic;
	}
	:global(.sql-table) {
		color: var(--sql-table);
	}
	.autocomplete-selected {
		background: rgb(51 65 85);
		color: white;
	}
</style>
