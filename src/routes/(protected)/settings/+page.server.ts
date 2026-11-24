import { fail, type Actions } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';

import { isValidTimeZone } from '#lib/utils/timezones.ts';

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
    },
    saveCalendar: async ({ request, cookies }) => {
        const data = await request.formData();
        const zone = String(data.get('timezone') ?? '');
        const day = String(data.get('firstday') ?? '');
        const format = String(data.get('dateformat') ?? '');

        if (!isValidTimeZone(zone) || !(day === '0' || day === '1')) {
            return fail(400, { formInvalid: true});
        }

        cookies.set('timezone', zone, {path: '/', maxAge: 60*60*24*365}); //lasts 1 year
        cookies.set('firstday', day, {path: '/', maxAge: 60*60*24*365}); //lasts 1 year
        cookies.set('dateformat', format, {path: '/', maxAge: 60*60*24*365}); //lasts 1 year
        return { success: true};
    }
};