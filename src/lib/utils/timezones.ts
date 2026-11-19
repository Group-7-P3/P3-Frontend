export const timeZoneOptions = [
  { value: 'UTC', label: 'UTC (UTC+0)' }, // W+0 S+0

  // Europe
  { value: 'Europe/London', label: 'London (UTC+0 / UTC+1)' }, // W+0 S+1
  { value: 'Europe/Copenhagen', label: 'Central European Time (UTC+1 / UTC+2)' }, // W+1 S+2
  { value: 'Europe/Athens', label: 'Eastern European Time (UTC+2 / UTC+3)' }, // W+2 S+3

  // Americas
  { value: 'America/New_York', label: 'US Eastern Time (UTC-5 / UTC-4)' }, // W-5 S-4
  { value: 'America/Chicago', label: 'US Central Time (UTC-6 / UTC-5)' }, // W-6 S-5
  { value: 'America/Denver', label: 'US Mountain Time (UTC-7 / UTC-6)' }, // W-7 S-6
  { value: 'America/Los_Angeles', label: 'US Pacific Time (UTC-8 / UTC-7)' }, // W-8 S-7
  { value: 'America/Sao_Paulo', label: 'Brazil (UTC-3)' }, // W-3 S-3

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' }, // W+4 S+4
  { value: 'Asia/Karachi', label: 'Pakistan (UTC+5)' }, // W+5 S+5
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)' }, // W+5:30 S+5:30
  { value: 'Asia/Bangkok', label: 'Thailand (UTC+7)' }, // W+7 S+7
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' }, // W+8 S+8
  { value: 'Asia/Tokyo', label: 'Japan (UTC+9)' }, // W+9 S+9

  // Oceania
  { value: 'Australia/Sydney', label: 'Australia Eastern Time (UTC+10 / UTC+11)' }, // W+10 S+11
  { value: 'Pacific/Auckland', label: 'New Zealand (UTC+12 / UTC+13)' } // W+12 S+13
];