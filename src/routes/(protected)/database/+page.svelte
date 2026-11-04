<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check, Code, Copy, Play, Redo2, Table2, Undo2 } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	type TableSchema = {
		name: string;
		columns: string[];
	};
	type QueryRow = Record<string, unknown>;
	type QuerySnapshot = {
		value: string;
		start: number;
		end: number;
	};
	type SqlDiagnostic = {
		start: number;
		end: number;
		message: string;
	};

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
	const initialQuery = `SELECT
  u.id,
  u.customer_id,
  s.type,
  s.expires_at
FROM "user" AS u
JOIN subscription AS s ON s.user_id = u.id
WHERE s.expires_at >= CURRENT_DATE
ORDER BY s.expires_at ASC;`;
	let query = $state(initialQuery);
	let queryHistory = $state<QuerySnapshot[]>([
		{ value: initialQuery, start: initialQuery.length, end: initialQuery.length }
	]);
	let queryHistoryIndex = $state(0);
	let diagnostics = $derived(analyzeSql(query));

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
	let queryRowsRead = $state<number | undefined>();
	let queryExecutionTimeMs = $state(0);
	let suggestionPosition = $state({ top: 16, left: 64 });
	let suggestionsOpen = $state(false);
	let selectionBeforeInput = $state<{ start: number; end: number } | undefined>();
	let lineSelectionStart = $state<number | undefined>();
	let dialogOpen = $state(false);
	let querySeverity: 'delete' | 'modify' | false = $state(false);

	/**
	 * These values control the offset of the popover.
	 */
	const suggestionCaretOffset = {
		top: 16,
		left: 40,
		lineHeight: 24,
		characterWidth: 7.8
	};

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

	function analyzeSql(value: string): SqlDiagnostic[] {
		const result: SqlDiagnostic[] = [];
		const parentheses: number[] = [];
		const knownTables = new Set(tables.map((table) => table.name.toLowerCase()));
		const knownKeywords = new Set(keywords.filter((keyword) => !keyword.includes(' ')));
		let index = 0;

		while (index < value.length) {
			if (value.startsWith('--', index)) {
				const lineEnd = value.indexOf('\n', index);
				index = lineEnd === -1 ? value.length : lineEnd + 1;
				continue;
			}

			const character = value[index];
			if (character === "'" || character === '"' || character === '`') {
				const quoteStart = index;
				index += 1;
				let closed = false;
				while (index < value.length) {
					if (value[index] === character) {
						if (value[index + 1] === character) {
							index += 2;
							continue;
						}
						closed = true;
						index += 1;
						break;
					}
					index += 1;
				}
				if (!closed) {
					result.push({ start: quoteStart, end: value.length, message: 'Unclosed quoted value' });
				}
				continue;
			}

			if (character === '(') {
				parentheses.push(index);
			} else if (character === ')') {
				if (parentheses.length === 0) {
					result.push({ start: index, end: index + 1, message: 'Unexpected closing parenthesis' });
				} else {
					parentheses.pop();
				}
			}
			index += 1;
		}

		for (const start of parentheses) {
			result.push({ start, end: start + 1, message: 'Unclosed parenthesis' });
		}

		const firstToken = value.match(/^\s*([A-Za-z_][\w$]*)/);
		if (firstToken && !knownKeywords.has(firstToken[1].toUpperCase())) {
			const start = firstToken.index! + firstToken[0].length - firstToken[1].length;
			const expectedKeyword = firstToken[1].toUpperCase().startsWith('SEL')
				? 'SELECT'
				: 'a SQL statement keyword';
			result.push({
				start,
				end: start + firstToken[1].length,
				message: `Expected ${expectedKeyword}`
			});
		}

		const invalidKeywordPatterns = [
			{ pattern: /\bFRO\b/gi, message: 'Expected FROM' },
			{ pattern: /\bJOI\b/gi, message: 'Expected JOIN' },
			{ pattern: /\bWHER\b/gi, message: 'Expected WHERE' },
			{ pattern: /\bORDER\s+B\b/gi, message: 'Expected ORDER BY' }
		];
		for (const { pattern, message } of invalidKeywordPatterns) {
			for (const match of value.matchAll(pattern)) {
				const start = match.index ?? 0;
				result.push({ start, end: start + match[0].length, message });
			}
		}

		const tableReferencePattern = /\b(?:FROM|JOIN|UPDATE|INTO)\s+([A-Za-z_][\w$]*)/gi;
		for (const match of value.matchAll(tableReferencePattern)) {
			const tableName = match[1];
			if (!tableName || knownTables.has(tableName.toLowerCase())) continue;
			const start = (match.index ?? 0) + match[0].length - tableName.length;
			result.push({
				start,
				end: start + tableName.length,
				message: `Unknown table "${tableName}"`
			});
		}

		const aliases = new SvelteSet<string>();
		const qualifierTables = new SvelteMap<string, TableSchema>();
		const aliasPattern =
			/\b(?:FROM|JOIN)\s+("([^"]+)"|([A-Za-z_][\w$]*))\s+(?:AS\s+)?([A-Za-z_][\w$]*)/gi;
		for (const match of value.matchAll(aliasPattern)) {
			const tableName = (match[2] ?? match[3])?.toLowerCase();
			const alias = match[4]?.toLowerCase();
			const table = tables.find((candidate) => candidate.name.toLowerCase() === tableName);
			if (alias) aliases.add(alias);
			if (table && alias) qualifierTables.set(alias, table);
			if (table) qualifierTables.set(table.name.toLowerCase(), table);
		}

		const qualifiedReferencePattern = /\b([A-Za-z_][\w$]*)\s*\.\s*([A-Za-z_][\w$]*)/g;
		for (const match of value.matchAll(qualifiedReferencePattern)) {
			const qualifier = match[1];
			const column = match[2];
			const table = qualifierTables.get(qualifier.toLowerCase());
			if (table) {
				if (!table.columns.some((candidate) => candidate.toLowerCase() === column.toLowerCase())) {
					const columnStart = (match.index ?? 0) + match[0].lastIndexOf(column);
					result.push({
						start: columnStart,
						end: columnStart + column.length,
						message: `Unknown column "${column}" on "${qualifier}"`
					});
				}
				continue;
			}
			if (knownTables.has(qualifier.toLowerCase()) || aliases.has(qualifier.toLowerCase()))
				continue;
			const start = match.index ?? 0;
			result.push({
				start,
				end: start + qualifier.length,
				message: `Unknown table alias "${qualifier}"`
			});
		}

		const trailingClausePattern =
			/\b(?:SELECT|FROM|WHERE|AND|OR|JOIN|ON|AS|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|SET|VALUES|INTO)\s*$/i;
		const trailingClause = value.match(trailingClausePattern);
		if (trailingClause?.index !== undefined) {
			result.push({
				start: trailingClause.index,
				end: value.length,
				message: 'This clause needs another value'
			});
		}

		const orderDirectionPattern = /\bORDER\s+BY\b[\s\S]*\s([A-Za-z_][\w$]*)\s*;?\s*$/i;
		const orderDirection = value.match(orderDirectionPattern);
		if (
			orderDirection?.index !== undefined &&
			orderDirection[1] &&
			!['ASC', 'DESC'].includes(orderDirection[1].toUpperCase())
		) {
			const start = orderDirection.index + orderDirection[0].lastIndexOf(orderDirection[1]);
			const beforeDirection = value.slice(orderDirection.index, start);
			if (/\S\s+$/.test(beforeDirection)) {
				result.push({
					start,
					end: start + orderDirection[1].length,
					message: 'Expected ASC or DESC'
				});
			}
		}

		return result;
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
			.map((match) => {
				const token = match[0];
				const tokenStart = match.index ?? 0;
				const escaped = escapeHtml(token);
				const diagnostic = diagnostics.find(
					(diagnostic) =>
						diagnostic.start < tokenStart + token.length && diagnostic.end > tokenStart
				);
				const errorClass = diagnostic ? ' sql-error' : '';
				const errorTitle = diagnostic ? ` title="${escapeHtml(diagnostic.message)}"` : '';
				if (/^--/.test(token))
					return `<span class="sql-comment${errorClass}"${errorTitle}>${escaped}</span>`;
				if (/^['"`]/.test(token))
					return `<span class="sql-string${errorClass}"${errorTitle}>${escaped}</span>`;
				if (/^\d/.test(token))
					return `<span class="sql-number${errorClass}"${errorTitle}>${escaped}</span>`;
				if (/^[A-Za-z_]/.test(token) && keywords.some((keyword) => keyword === token.toUpperCase()))
					return `<span class="sql-keyword${errorClass}"${errorTitle}>${escaped}</span>`;
				if (/^[A-Za-z_]/.test(token) && tables.some((table) => table.name === token))
					return `<span class="sql-table${errorClass}"${errorTitle}>${escaped}</span>`;
				return errorClass ? `<span class="sql-error"${errorTitle}>${escaped}</span>` : escaped;
			})
			.join('');
	}

	/**
	 * Updates the suggestions to match what's being written.
	 */
	function updateSuggestions(showAll = false) {
		const cursor = editor?.selectionStart ?? query.length;
		const beforeCursor = query.slice(0, cursor);
		const qualifiedMatch = beforeCursor.match(
			/(?:"([^"]+)"|([A-Za-z_][\w$]*))\.\s*([A-Za-z_][\w$]*)?$/
		);
		const word = qualifiedMatch?.[3] ?? beforeCursor.match(/[A-Za-z_][\w$]*$/)?.[0] ?? '';
		if (!word && !qualifiedMatch && !showAll) {
			suggestions = [];
			closeSuggestions();
			return;
		}

		const qualifier = qualifiedMatch?.[1] ?? qualifiedMatch?.[2];
		let qualifiedTable = qualifier
			? tables.find((table) => table.name.toLowerCase() === qualifier.toLowerCase())
			: undefined;
		if (qualifier && !qualifiedTable) {
			const aliasPattern =
				/\b(?:FROM|JOIN)\s+("([^"]+)"|([A-Za-z_][\w$]*))\s+(?:AS\s+)?([A-Za-z_][\w$]*)/gi;
			for (const match of query.matchAll(aliasPattern)) {
				const tableName = (match[2] ?? match[3])?.toLowerCase();
				const alias = match[4]?.toLowerCase();
				if (alias !== qualifier.toLowerCase()) continue;
				qualifiedTable = tables.find((table) => table.name.toLowerCase() === tableName);
				break;
			}
		}
		if (qualifiedMatch && !qualifiedTable && !showAll) {
			suggestions = [];
			closeSuggestions();
			return;
		}

		updateSuggestionPosition(cursor);
		const lowerWord = word.toLowerCase();
		const qualifiedColumns = qualifiedTable?.columns ?? [];
		const candidateSuggestions = qualifiedTable ? qualifiedColumns : allSuggestions;
		const nextSuggestions = [...new Set(candidateSuggestions)]
			.filter(
				(suggestion) =>
					showAll || (suggestion.toLowerCase().startsWith(lowerWord) && suggestion !== word)
			)
			.slice(0, 8);
		const selectedValue = suggestions[selectedSuggestion];
		suggestions = nextSuggestions;
		selectedSuggestion = selectedValue ? Math.max(0, nextSuggestions.indexOf(selectedValue)) : 0;
		suggestionsOpen = true;
	}

	function captureSelectionBeforeInput() {
		if (!editor) return;
		selectionBeforeInput = { start: editor.selectionStart, end: editor.selectionEnd };
	}

	async function handleInput() {
		recordQueryEdit(selectionBeforeInput);
		selectionBeforeInput = undefined;
		updateSuggestions();
	}

	function recordQueryEdit(previousSelection?: { start: number; end: number }) {
		const snapshot = {
			value: query,
			start: editor?.selectionStart ?? query.length,
			end: editor?.selectionEnd ?? query.length
		};
		const current = queryHistory[queryHistoryIndex];
		if (current?.value === snapshot.value) return;
		if (current && previousSelection) {
			queryHistory[queryHistoryIndex] = { ...current, ...previousSelection };
		}
		queryHistory = [...queryHistory.slice(0, queryHistoryIndex + 1), snapshot];
		queryHistoryIndex += 1;
	}

	/**
	 * Updates the position of the suggestion popover.
	 */
	function updateSuggestionPosition(cursor: number) {
		if (!editor) return;

		const beforeCursor = query.slice(0, cursor);
		const lineIndex = beforeCursor.split('\n').length - 1;
		const column = beforeCursor.length - (beforeCursor.lastIndexOf('\n') + 1);
		const menuHeight = 220;
		const menuWidth = 240;
		const editorRect = editor.getBoundingClientRect();
		const topBelowCaret =
			editorRect.top +
			suggestionCaretOffset.top +
			(lineIndex + 1) * suggestionCaretOffset.lineHeight -
			editor.scrollTop;
		const topAboveCaret =
			editorRect.top +
			suggestionCaretOffset.top +
			lineIndex * suggestionCaretOffset.lineHeight -
			editor.scrollTop -
			menuHeight;
		const preferredTop =
			topBelowCaret + menuHeight <= window.innerHeight - 8 ? topBelowCaret : topAboveCaret;
		const top = Math.min(
			Math.max(preferredTop, 8),
			Math.max(8, window.innerHeight - menuHeight - 8)
		);
		const preferredLeft =
			editorRect.left +
			suggestionCaretOffset.left +
			column * suggestionCaretOffset.characterWidth -
			editor.scrollLeft;
		const left = Math.min(
			Math.max(preferredLeft, 8),
			Math.max(8, window.innerWidth - menuWidth - 8)
		);

		suggestionPosition = { top, left };
	}

	function updateSuggestionPositionFromCaret() {
		if (suggestionsOpen && editor) {
			updateSuggestionPosition(editor.selectionStart);
		}
	}

	function closeSuggestions() {
		suggestionsOpen = false;
	}

	function updateSuggestionsFromCaret(event: KeyboardEvent) {
		if (event.ctrlKey && event.code === 'Space') return;
		if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
			closeSuggestions();
			return;
		}
		if (suggestionsOpen) updateSuggestions();
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
		updateSuggestionPositionFromCaret();
	}

	function getLineAtPosition(clientY: number) {
		if (!lineNumbers) return 0;
		const rect = lineNumbers.getBoundingClientRect();
		const lineCount = query.split('\n').length;
		return Math.min(
			lineCount - 1,
			Math.max(
				0,
				Math.floor(
					(clientY - rect.top + lineNumbers.scrollTop - suggestionCaretOffset.top) /
						suggestionCaretOffset.lineHeight
				)
			)
		);
	}

	function getLineRange(startLine: number, endLine: number) {
		const lines = query.split('\n');
		const firstLine = Math.min(startLine, endLine);
		const lastLine = Math.max(startLine, endLine);
		const start = lines.slice(0, firstLine).join('\n').length + (firstLine > 0 ? 1 : 0);
		const end =
			lines.slice(0, lastLine + 1).join('\n').length + (lastLine < lines.length - 1 ? 1 : 0);
		return { start, end };
	}

	function updateLineSelection(line: number) {
		if (lineSelectionStart === undefined || !editor) return;
		const range = getLineRange(lineSelectionStart, line);
		editor.focus();
		editor.setSelectionRange(range.start, range.end);
		closeSuggestions();
	}

	function startLineSelection(event: MouseEvent, line: number) {
		event.preventDefault();
		lineSelectionStart = line;
		updateLineSelection(line);
	}

	function moveLineSelection(event: MouseEvent) {
		if (lineSelectionStart === undefined) return;
		updateLineSelection(getLineAtPosition(event.clientY));
	}

	function endLineSelection() {
		lineSelectionStart = undefined;
	}

	function handleHighlightedQueryClick(event: MouseEvent) {
		if (!editor) return;
		const target = event.target as HTMLElement;
		const diagnosticElement = target.closest<HTMLElement>('[title]');
		if (diagnosticElement?.title) {
			const diagnostic = diagnostics.find((item) => item.message === diagnosticElement.title);
			if (diagnostic) {
				editor.focus();
				editor.setSelectionRange(diagnostic.start, diagnostic.start);
				closeSuggestions();
				return;
			}
		}
		const editorRect = editor.getBoundingClientRect();
		const editorContentLeft = 64;
		const line = Math.max(
			0,
			Math.floor(
				(event.clientY - editorRect.top + editor.scrollTop - 16) / suggestionCaretOffset.lineHeight
			)
		);
		const column = Math.max(
			0,
			Math.round(
				(event.clientX - editorRect.left + editor.scrollLeft - editorContentLeft) /
					suggestionCaretOffset.characterWidth
			)
		);
		const lines = query.split('\n');
		const cursor = Math.min(
			query.length,
			lines.slice(0, line).join('\n').length +
				(line > 0 ? 1 : 0) +
				Math.min(column, lines[line]?.length ?? 0)
		);
		editor.focus();
		editor.setSelectionRange(cursor, cursor);
		closeSuggestions();
	}

	/**
	 * Run when the user selects a suggestion to add to the query.
	 */
	function chooseSuggestion(suggestion: string) {
		const cursor = editor?.selectionStart ?? query.length;
		const match = query.slice(0, cursor).match(/[A-Za-z_][\w$]*$/);
		const start = match ? cursor - match[0].length : cursor;
		if (!editor) return;
		replaceEditorRange(suggestion, start, cursor, { start: cursor, end: cursor });
		suggestions = [];
		suggestionsOpen = false;
		void tick()
			.then(() => tick())
			.then(() => {
				editor?.focus();
				editor?.setSelectionRange(start + suggestion.length, start + suggestion.length);
			});
	}

	/**
	 * Handles the input when the suggestions-popover is open.\
	 * Arrow-up, arrow-down, tab, enter, and escape.
	 */
	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			if (event.shiftKey) redoQuery();
			else undoQuery();
			return;
		}

		if (
			(event.ctrlKey || event.metaKey) &&
			(event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))
		) {
			event.preventDefault();
			redoQuery();
			return;
		}

		if (event.ctrlKey && event.code === 'Space') {
			event.preventDefault();
			updateSuggestions(true);
			return;
		}

		if (!suggestionsOpen) return;
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

		if ((event.key === 'Tab' || event.key === 'Enter') && suggestions.length > 0) {
			event.preventDefault();
			chooseSuggestion(suggestions[selectedSuggestion]);
			return;
		}

		if (event.key !== 'Escape') return;
		suggestionsOpen = false;
	}

	/**
	 * Inserts text at the cursor position in the textarea.
	 */
	function insertText(value: string) {
		const cursor = editor?.selectionStart ?? query.length;
		if (!editor) return;
		replaceEditorRange(value, cursor, cursor);
		void tick().then(() => {
			editor?.focus();
			editor?.setSelectionRange(cursor + value.length, cursor + value.length);
		});
	}

	function replaceEditorRange(
		value: string,
		start: number,
		end: number,
		undoSelection = { start, end }
	) {
		if (!editor) return;
		updateCurrentSnapshotSelection(undoSelection.start, undoSelection.end);
		query = `${query.slice(0, start)}${value}${query.slice(end)}`;
		const cursor = start + value.length;
		queryHistory = [
			...queryHistory.slice(0, queryHistoryIndex + 1),
			{ value: query, start: cursor, end: cursor }
		];
		queryHistoryIndex += 1;
		void tick()
			.then(() => tick())
			.then(() => {
				editor?.focus();
				editor?.setSelectionRange(cursor, cursor);
			});
	}

	function updateCurrentSnapshotSelection(start: number, end: number) {
		const current = queryHistory[queryHistoryIndex];
		if (!current) return;
		queryHistory[queryHistoryIndex] = { ...current, start, end };
		queryHistory = [...queryHistory];
	}

	/**
	 * Moves through the query editor's history.
	 */
	function undoQuery() {
		if (queryHistoryIndex === 0) return;
		queryHistoryIndex -= 1;
		restoreQuerySnapshot(queryHistory[queryHistoryIndex]);
	}

	function redoQuery() {
		if (queryHistoryIndex >= queryHistory.length - 1) return;
		queryHistoryIndex += 1;
		restoreQuerySnapshot(queryHistory[queryHistoryIndex]);
	}

	function restoreQuerySnapshot(snapshot: QuerySnapshot) {
		query = snapshot.value;
		suggestions = [];
		suggestionsOpen = false;
		void tick().then(() => {
			editor?.focus();
			const start = Math.min(snapshot.start, snapshot.value.length);
			const end = Math.min(snapshot.end, snapshot.value.length);
			editor?.setSelectionRange(start, end);
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
		const deletePattern = new RegExp(`\\b(?:${deleteKeywords.join('|')})\\b`, 'i');
		if (deletePattern.test(query)) return 'delete';

		const modifyPattern = new RegExp(`\\b(?:${modifyKeywords.join('|')})\\b`, 'i');
		if (modifyPattern.test(query)) return 'modify';

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
		queryRowsRead = undefined;
		queryExecutionTimeMs = 0;

		try {
			const response = await fetch('/database', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ query })
			});
			const payload: {
				rows?: QueryRow[];
				rowCount?: number;
				rowsRead?: number;
				executionTimeMs?: number;
				error?: string;
			} = await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'The query could not be executed');

			queryRows = payload.rows ?? [];
			queryRowCount = payload.rowCount ?? queryRows.length;
			queryRowsRead = payload.rowsRead;
			queryExecutionTimeMs = payload.executionTimeMs ?? 0;
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

<svelte:window onmousemove={moveLineSelection} onmouseup={endLineSelection} />

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
						<Button
							variant="outline"
							size="icon-sm"
							title="Undo"
							aria-label="Undo"
							onclick={undoQuery}
						>
							<Undo2 size={14} />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							title="Redo"
							aria-label="Redo"
							onclick={redoQuery}
						>
							<Redo2 size={14} />
						</Button>
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
								class="pointer-events-auto relative z-30 h-full w-12 shrink-0 overflow-hidden border-r border-border bg-muted/50 py-4 text-right text-muted-foreground select-none"
							>
								{#each query.split('\n') as line, index (`line-${index}-${line}`)}
									<div
										class="cursor-default pr-3"
										role="button"
										tabindex="-1"
										aria-label={`Select line ${index + 1}`}
										onmousedown={(event) => startLineSelection(event, index)}
									>
										{index + 1}
									</div>
								{/each}
							</div>
							<!-- The Syntax Highlighted SQL -->
							<pre
								bind:this={highlightedQuery}
								class="sql-code-layer relative z-20 m-0 h-full cursor-text overflow-hidden p-4 whitespace-pre text-foreground"
								aria-hidden="true"
								onclick={handleHighlightedQueryClick}>{@html highlightSql(query)}</pre>
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
							onbeforeinput={captureSelectionBeforeInput}
							oninput={handleInput}
							onkeydown={handleKeydown}
							onkeyup={updateSuggestionsFromCaret}
							onclick={closeSuggestions}
							onscroll={syncEditorScroll}
							onblur={() => setTimeout(() => (suggestionsOpen = false), 120)}></textarea>
					</div>
					<!-- Suggestion Popover -->
					{#if suggestionsOpen}
						<div
							class="fixed z-20 min-w-48 overflow-hidden rounded-md border border-border bg-popover text-xs text-popover-foreground shadow-md"
							style={`top: ${suggestionPosition.top}px; left: ${suggestionPosition.left}px`}
						>
							{#if suggestions.length === 0}
								<div class="px-3 py-2 text-muted-foreground">No suggestions available.</div>
							{:else}
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
							{/if}
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
						<div class="flex items-center gap-3 text-xs text-muted-foreground">
							{#if queryRowsRead !== undefined}
								<span>{queryRowsRead} rows scanned</span>
							{/if}
							<span>{queryExecutionTimeMs.toFixed(2)} ms</span>
						</div>
					{/if}

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
	:global(.sql-error) {
		pointer-events: auto;
		cursor: text;
		text-decoration-line: underline;
		text-decoration-style: wavy;
		text-decoration-color: var(--destructive);
		text-decoration-thickness: 1px;
		text-decoration-skip-ink: none;
		text-underline-offset: 2px;
	}
	.autocomplete-selected {
		background: rgb(51 65 85);
		color: white;
	}
</style>
