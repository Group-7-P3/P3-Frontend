<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Separator from '#lib/components/ui/separator/separator.svelte';
	import type { ResolvedPathname } from '$app/types';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import Button from './button/button.svelte';
	import { ExternalLink } from '@lucide/svelte';

	interface Props {
		title: string;
		href: ResolvedPathname;
		day: number;
		week: number;
		month: number;
		year: number;
		total: number;
	}

	let { title, href, day, week, month, year, total }: Props = $props();
</script>

<Card.Root class="w-full gap-5">
	<Card.Header class="flex items-center justify-between">
		<Card.Title>{title}</Card.Title>
		<a {href}>
			<Button variant="outline" size="icon-xs">
				<ExternalLink />
			</Button>
		</a>
	</Card.Header>
	<Separator />
	<Card.Content>
		<div class="flex justify-between">
			<Tooltip.Root disableHoverableContent>
				<Tooltip.Trigger
					class="cursor-default text-left underline decoration-dotted underline-offset-4"
				>
					Day
				</Tooltip.Trigger>
				<Tooltip.Content>
					Today ({today(getLocalTimeZone())
						.toDate(getLocalTimeZone())
						.toLocaleDateString(undefined, {
							month: '2-digit',
							day: '2-digit'
						})})
				</Tooltip.Content>
			</Tooltip.Root>
			<span>{day}</span>
		</div>
		<div class="flex justify-between">
			<Tooltip.Root disableHoverableContent>
				<Tooltip.Trigger
					class="cursor-default text-left underline decoration-dotted underline-offset-4"
				>
					Week
				</Tooltip.Trigger>
				<Tooltip.Content>
					Last week ({today(getLocalTimeZone())
						.subtract({ weeks: 1 })
						.toDate(getLocalTimeZone())
						.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })} -
					{today(getLocalTimeZone()).toDate(getLocalTimeZone()).toLocaleDateString(undefined, {
						month: '2-digit',
						day: '2-digit'
					})})
				</Tooltip.Content>
			</Tooltip.Root>
			<span>{week}</span>
		</div>
		<div class="flex justify-between">
			<Tooltip.Root disableHoverableContent>
				<Tooltip.Trigger
					class="cursor-default text-left underline decoration-dotted underline-offset-4"
				>
					Month
				</Tooltip.Trigger>
				<Tooltip.Content>
					Last month ({today(getLocalTimeZone())
						.subtract({ months: 1 })
						.toDate(getLocalTimeZone())
						.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })} - {today(
						getLocalTimeZone()
					)
						.toDate(getLocalTimeZone())
						.toLocaleDateString(undefined, {
							month: '2-digit',
							day: '2-digit'
						})})
				</Tooltip.Content>
			</Tooltip.Root>
			<span>{month}</span>
		</div>
		<div class="flex justify-between">
			<Tooltip.Root disableHoverableContent>
				<Tooltip.Trigger
					class="cursor-default text-left underline decoration-dotted underline-offset-4"
				>
					Year
				</Tooltip.Trigger>
				<Tooltip.Content>
					Last year ({today(getLocalTimeZone())
						.subtract({ years: 1 })
						.toDate(getLocalTimeZone())
						.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' })} -
					{today(getLocalTimeZone()).toDate(getLocalTimeZone()).toLocaleDateString(undefined, {
						month: '2-digit',
						day: '2-digit',
						year: '2-digit'
					})})
				</Tooltip.Content>
			</Tooltip.Root>
			<span>{year}</span>
		</div>
	</Card.Content>
	<Separator />
	<Card.Footer>
		<div class="flex w-full justify-between font-semibold">
			<span>Total</span>
			<span>{total}</span>
		</div>
	</Card.Footer>
</Card.Root>
