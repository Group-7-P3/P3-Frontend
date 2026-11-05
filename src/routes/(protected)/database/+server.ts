import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

function jsonResponse(data: unknown, status: number) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

type PlanNode = {
	'Node Type'?: string;
	'Actual Rows'?: number;
	'Actual Loops'?: number;
	'Rows Removed by Filter'?: number;
	Plans?: PlanNode[];
};

function isReadOnlyQuery(query: string) {
	return /^\s*(?:\/\*[\s\S]*?\*\/\s*|--[^\n]*\s*)*select\b/i.test(query);
}

function countRowsRead(node: PlanNode): number {
	const isScan = node['Node Type']?.endsWith('Scan') ?? false;
	const rowsProduced = (node['Actual Rows'] ?? 0) * (node['Actual Loops'] ?? 1);
	const rowsRemoved = node['Rows Removed by Filter'] ?? 0;
	const currentNodeRows = isScan ? rowsProduced + rowsRemoved : 0;
	return (
		currentNodeRows + (node.Plans ?? []).reduce((total, child) => total + countRowsRead(child), 0)
	);
}

export const POST: RequestHandler = async ({ locals, request }) => {
	if (locals.user?.role !== 'owner')
		return jsonResponse({ error: 'Only owners can execute SQL queries' }, 403);

	let body: { query?: unknown };
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'The request body must be valid JSON' }, 400);
	}

	if (typeof body.query !== 'string' || !body.query.trim())
		return jsonResponse({ error: 'Enter a SQL query before running it' }, 400);

	try {
		const startedAt = performance.now();
		let rowsRead: number | undefined;
		if (isReadOnlyQuery(body.query)) {
			const explainResult = (await db.execute(
				sql.raw(`EXPLAIN (ANALYZE, FORMAT JSON) ${body.query}`)
			)) as Array<Record<string, unknown>>;
			const plan = explainResult[0]?.['QUERY PLAN'];
			const rootPlan = Array.isArray(plan)
				? (plan[0] as { Plan?: PlanNode } | undefined)?.Plan
				: undefined;
			if (rootPlan) rowsRead = countRowsRead(rootPlan);
		}
		const result = await db.execute(sql.raw(body.query));
		const executionTimeMs = Math.round((performance.now() - startedAt) * 100) / 100;
		return jsonResponse(
			{
				rows: result as unknown[],
				rowCount: result.length,
				rowsRead,
				executionTimeMs
			},
			200
		);
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'The database rejected the query';
		return jsonResponse({ error: message }, 400);
	}
};
