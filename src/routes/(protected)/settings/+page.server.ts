import { fail, type Actions } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';

export const actions: Actions = {
    verifyPassword: async ({ request }) => {
        const data = await request.formData();
        const password = String(data.get('password') ?? '');

        try {
            await auth.api.verifyPassword({
                body: { password },
                headers: request.headers
            });
            return { success: true};
        } catch {
            return fail(400, { passwordIncorrect: true});
        }
    }
};