import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

function jsonResponse(data: unknown, status: number) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

export const POST: RequestHandler = async ({ locals, request }) => {
	if (locals.user?.role !== 'owner') {
		return jsonResponse({ error: 'Only owners can execute SQL queries' }, 403);
	}

	let body: { query?: unknown };
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'The request body must be valid JSON' }, 400);
	}

	if (typeof body.query !== 'string' || !body.query.trim()) {
		return jsonResponse({ error: 'Enter a SQL query before running it' }, 400);
	}

	try {
		const result = await db.execute(sql.raw(body.query));
		return jsonResponse({
			rows: result as unknown[],
			rowCount: result.length
		}, 200);
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'The database rejected the query';
		return jsonResponse({ error: message }, 400);
	}
};
