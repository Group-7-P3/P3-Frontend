<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { enhance, type SubmitFunction } from '$app/forms';

	// Keeps track of whether the form has been submitted.
	let calendarSubmitted = $state(false);

	// Keeps track of the inputs in the form.
	let newFirstDay = $state('');
    let newDateFormat = $state('');

	/**
	 * Resets the calendar form.
	 * Marks the input fields 'not touched'.
	 */
	function resetCalendarForm() {
		calendarSubmitted = false;
	}

	/**
	 * Runs when the calendar form is submitted.
	 */
	const handleCalendarSubmit: SubmitFunction = ({ cancel }) => {
		calendarSubmitted = true;

		if (!newFirstDay || !newDateFormat) {
			cancel();
			return;
		}

        // Actually apply the changes here

		console.log('Selected first day:', newFirstDay);

        console.log('Selected date format:', newDateFormat);

		resetCalendarForm();
	};
</script>

<Card.Root class="basis-6/12 px-6">
	<form method="POST" use:enhance={handleCalendarSubmit}>
		<Field.Set>
			<Field.Legend class="mb-4">Calendar settings</Field.Legend>
			<Field.Group class="grid grid-cols-2 gap-4">
                <!-- First day -->
				<Field.Field>
					<Field.Label for="firstDay">First day of the week</Field.Label>
					<RadioGroup.Root name="firstDay" bind:value={newFirstDay}>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="monday" id="monday" />
							<Label for="monday" class="font-normal">Monday</Label>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="sunday" id="sunday" />
							<Label for="sunday" class="font-normal">Sunday</Label>
						</div>
					</RadioGroup.Root>
				</Field.Field>

                <!-- Date format -->
				<Field.Field>
					<Field.Label for="dateFormat">Date format</Field.Label>
					<RadioGroup.Root name="dateFormat" bind:value={newDateFormat}>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="DMY" id="DMY" />
							<Label for="DMY" class="font-normal">Day-Month-Year (DD-MM-YYYY)</Label>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="MDY" id="MDY" />
							<Label for="MDY" class="font-normal">Month-Day-Year (MM-DD-YYYY)</Label>
						</div>

                        <div class="flex items-center space-x-2">
							<RadioGroup.Item value="YMD" id="YMD" />
							<Label for="YMD" class="font-normal">Year-Month-Day (YYYY-MM-DD)</Label>
						</div>
					</RadioGroup.Root>
				</Field.Field>

				<Button type="submit" class="w-full mt-4">Apply calendar settings</Button>
			</Field.Group>
		</Field.Set>
	</form>
</Card.Root>
