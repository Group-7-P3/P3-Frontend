export const timeZoneOptions = [
  { value: 'UTC', label: 'UTC' }, // W+0 S+0

  // Europe
  { value: 'Europe/London', label: 'London' }, // W+0 S+1
  { value: 'Europe/Copenhagen', label: 'Central European Time' }, // W+1 S+2
  { value: 'Europe/Athens', label: 'Eastern European Time' }, // W+2 S+3

  // Americas
  { value: 'America/New_York', label: 'US Eastern Time' }, // W-5 S-4
  { value: 'America/Chicago', label: 'US Central Time' }, // W-6 S-5
  { value: 'America/Denver', label: 'US Mountain Time' }, // W-7 S-6
  { value: 'America/Los_Angeles', label: 'US Pacific Time' }, // W-8 S-7
  { value: 'America/Sao_Paulo', label: 'Brazil' }, // W-3 S-3

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai' }, // W+4 S+4
  { value: 'Asia/Karachi', label: 'Pakistan' }, // W+5 S+5
  { value: 'Asia/Kolkata', label: 'India' }, // W+5:30 S+5:30
  { value: 'Asia/Bangkok', label: 'Thailand' }, // W+7 S+7
  { value: 'Asia/Singapore', label: 'Singapore' }, // W+8 S+8
  { value: 'Asia/Tokyo', label: 'Japan' }, // W+9 S+9

  // Oceania
  { value: 'Australia/Sydney', label: 'Australia Eastern Time' }, // W+10 S+11
  { value: 'Pacific/Auckland', label: 'New Zealand' } // W+12 S+13
];