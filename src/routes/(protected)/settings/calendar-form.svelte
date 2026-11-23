<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { timeZoneOptions } from '#lib/utils/timezones.ts';
	import { Label } from '$lib/components/ui/label/index.js';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/state';

	// Keeps track of whether the form has been saved.
	let calendarSaved = $state(false);

	// Keeps track of the inputs in the form.
	let selectedDateFormat = $state('');
	let selectedFirstDay = $state(page.data.firstDay);

	let selectedTimeZone = $state(page.data.timeZone);
	let selectedLabelTimeZone = $derived(
		timeZoneOptions.find((option) => option.value === selectedTimeZone)?.label ??
			'Select a timezone'
	);

	/**
	 * Runs when the calendar form is submitted.
	 */
	const handleCalendarSubmit: SubmitFunction = ({ cancel }) => {
		calendarSaved = false;

		if (!selectedTimeZone) {
			cancel();
			return;
		}

		// The form's 'action="?/saveCalendar"' does the actual changes

		return async ({ result, update }) => {
			calendarSaved = result.type === 'success' && result.data?.success === true;
			await update();
		};
	};
</script>

<Card.Root class="basis-10/12 px-6">
	<form method="POST" action="?/saveCalendar" use:enhance={handleCalendarSubmit}>
		<Field.Set>
			<Field.Legend class="mb-4">Date and time format</Field.Legend>
			<Field.Group class="grid grid-cols-[2fr_2fr_4fr] gap-x-4 gap-y-4">
				<!-- Date format -->
				<Field.Field>
					<Field.Label for="dateFormat">Date format</Field.Label>
					<RadioGroup.Root name="dateFormat" bind:value={selectedDateFormat}>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="DMY" id="DMY" />
							<Label for="DMY" class="font-normal">Day-Month-Year</Label>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="MDY" id="MDY" />
							<Label for="MDY" class="font-normal">Month-Day-Year</Label>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="YMD" id="YMD" />
							<Label for="YMD" class="font-normal">Year-Month-Day</Label>
						</div>
					</RadioGroup.Root>
				</Field.Field>

				<!-- First day -->
				<Field.Field>
					<Field.Label for="firstDay">First day of the week</Field.Label>
					<RadioGroup.Root name="firstday" bind:value={selectedFirstDay}>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="1" id="monday" />
							<Label for="monday" class="font-normal">Monday</Label>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="0" id="sunday" />
							<Label for="sunday" class="font-normal">Sunday</Label>
						</div>
					</RadioGroup.Root>
				</Field.Field>

				<!-- Timezone -->
				<Field.Field>
					<Field.Label for="timeZone">Timezone</Field.Label>
					<Select.Root type="single" name="timezone" bind:value={selectedTimeZone}>
						<Select.Trigger class="w-full max-w-120">
							{selectedLabelTimeZone}
						</Select.Trigger>
						<Select.Content>
							{#each timeZoneOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<div class="col-span-3 mt-4 flex items-center gap-4">
					<Button type="submit">Apply calendar settings</Button>

					{#if calendarSaved}
						<div class=" text-green-600">Your changes have been applied</div>
					{/if}
				</div>
			</Field.Group>
		</Field.Set>
	</form>
</Card.Root>
