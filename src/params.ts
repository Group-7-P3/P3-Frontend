// src/params.ts
import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	demo: (param) => (param === 'demo' ? param : undefined)
});
