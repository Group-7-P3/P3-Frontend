import { timeZoneOptions } from '#lib/utils/timezones.ts';

export const DB_TIME_ZONE = "Europe/Copenhagen"

export function isValidTimeZone(zone: string): boolean {
    return timeZoneOptions.some((option) => option.value === zone);
}

/* Test cases that should be done:
dbTimeToInstant:
- Winter: 2026-01-15T12:00:00 should equal 2026-01-15T11:00:00
- Summer: 2026-07-15T12:00:00 should equal 2026-07-15T10:00:00

instantToDbTime:
- 2026-01-15T11:00:00 should equal 2026-01-15T12:00:00
- 2026-07-15T10:00:00 should equal 2026-07-15T12:00:00

getOffsetMs
- Copenhagen, 15 Jan 2026 at 12:00 UTC → 3600000
- Copenhagen, 15 Jul 2026 at 12:00 UTC → 7200000
- New York, 15 Jan 2026 at 12:00 UTC → -18000000
- UTC, any moment -> 0
- Copenhagen, 15 Jan 2026 at 12:00:00.750 UTC → 3600000 (the milliseconds shouldn't change the result)

Other
- instantToDbTime(dbTimeToInstant(x)) should equal x
*/

/**
 * Converts a time stored in the database (CPH) into the real moment it refers to (UTC).
 * @param {value} value A date from the database. Its UTC fields hold the CPH clock time.
 * @returns The instant (a Date) at which the CPH clock shows that time
 */
export function dbTimeToInstant(value: Date): Date {
    // The UTC fields hold the CPH clock reading, so read them as one UTC number.
    const clockAsUtcMs = Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds());
    // CPH's offset from UTC at that time (+1 in winter, 2+ in summer).
    const offset = getOffsetMs(clockAsUtcMs, DB_TIME_ZONE);
    // Clock time minues offset gives the real moment. E.g. 12:00 in CPH in winter is 11:00 UTC.
    return new Date(clockAsUtcMs - offset);
}

/**
 * Converts a real moment (UTC) into the CPH clock time that the database stores.
 * @param {value} value The instant to convert, as a Date.
 * @returns A Date whose UTC fields hold the CPH clock time at that instant.
 */
export function instantToDbTime(value: Date): Date {
    const instantMs = value.getTime();
    const offset = getOffsetMs(instantMs, DB_TIME_ZONE);
    // Shift the moment by the CPH offset, so its UTC fields show the CPH clock time.
    return new Date(instantMs + offset);
}

/**
 * Returns how far ahead of UTC a time zone's clock is at a given moment.
 * @param {instantMs} instantMs A moment in time, as milliseconds since 1/1/1970 UTC.
 * @param {zone} zone An IANA time zone name, e.g. 'Europe/Copenhagen'.
 * @returns The offset in milliseconds. Negative if the zone is behind UTC.
 */
function getOffsetMs(instantMs: number, zone: string): number {

    // Asks the browser what the clock in 'zone' shows at this moment.
    // The result is a list of labeled pieces, e.g. { type: 'hour', value: '13'}.
    // 2-digit means that '5' turns to '05'.
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(instantMs));

    // Looks up one piece by its label and returns its value as a number
    const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
    
    // Builds a UTC timestamp from the clock reading in 'zone'.
    // JavaScript counts months from 0, hence the 'get('month')-1'
    const zoneAsUtc = Date.UTC(get('year'), get('month')-1, get('day'), get('hour'), get('minute'), get('second'))

    // Compare the clock reading with the real moment. The difference is the offset.
    // The formatter drops milliseconds, so we drop them from the real moment too.
    return zoneAsUtc - Math.floor(instantMs/1000) * 1000;
}