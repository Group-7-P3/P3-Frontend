export function isValidTimeZone(zone: string): boolean {
    return timeZoneOptions.some((option) => option.value === zone);
}

export const timeZoneOptions = [
  { value: 'UTC', label: 'UTC (UTC+0 all year)' },

  // Europe
  { value: 'Europe/London', label: 'London (Winter UTC+0 · Summer UTC+1)' },
  { value: 'Europe/Copenhagen', label: 'Central European Time (Winter UTC+1 · Summer UTC+2)' },
  { value: 'Europe/Athens', label: 'Eastern European Time (Winter UTC+2 · Summer UTC+3)' },

  // Americas
  { value: 'America/New_York', label: 'US Eastern Time (Winter UTC-5 · Summer UTC-4)' },
  { value: 'America/Chicago', label: 'US Central Time (Winter UTC-6 · Summer UTC-5)' },
  { value: 'America/Denver', label: 'US Mountain Time (Winter UTC-7 · Summer UTC-6)' },
  { value: 'America/Los_Angeles', label: 'US Pacific Time (Winter UTC-8 · Summer UTC-7)' },
  { value: 'America/Sao_Paulo', label: 'Brazil (UTC-3 all year)' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4 all year)' },
  { value: 'Asia/Karachi', label: 'Pakistan (UTC+5 all year)' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30 all year)' },
  { value: 'Asia/Bangkok', label: 'Thailand (UTC+7 all year)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8 all year)' },
  { value: 'Asia/Tokyo', label: 'Japan (UTC+9 all year)' },

  // Oceania
  { value: 'Australia/Sydney', label: 'Australia Eastern Time (Winter UTC+10 · Summer UTC+11)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (Winter UTC+12 · Summer UTC+13)' }
];