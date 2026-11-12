import { columnVisibilityFeature, rowSortingFeature, tableFeatures } from '@tanstack/svelte-table';

export const features = tableFeatures({
	columnVisibilityFeature,
	rowSortingFeature
});

export type DataTableFeatures = typeof features;
