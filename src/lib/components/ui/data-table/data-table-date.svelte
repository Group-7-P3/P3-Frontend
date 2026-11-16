<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	interface Props {
		value: unknown;
	}

	let { value }: Props = $props();

	const dateInput = $derived(
		typeof value === 'number' || typeof value === 'string' || value instanceof Date
			? value
			: String(value)
	);

	const date = $derived(
		new Date(
			typeof dateInput === 'number' && dateInput.toString().length === 10
				? dateInput * 1000
				: dateInput
		)
	);

	const isValid = $derived(!isNaN(date.getTime()));

	const formattedDate = $derived(
		isValid ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date) : String(value)
	);

	const fullTimestamp = $derived(
		isValid
			? new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric',
					timeZoneName: 'short'
				}).format(date)
			: String(value)
	);
</script>

{#if isValid}
	<Tooltip.Root disableHoverableContent>
		<Tooltip.Trigger
			class="cursor-default text-left underline decoration-dotted underline-offset-4"
		>
			{formattedDate}
		</Tooltip.Trigger>
		<Tooltip.Content class="pointer-events-none">
			<p>{fullTimestamp}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	{formattedDate}
{/if}
