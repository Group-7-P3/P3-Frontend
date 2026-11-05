import {
	columnVisibilityFeature,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures
} from '@tanstack/svelte-table';

export const features = tableFeatures({
	columnVisibilityFeature,
	rowSelectionFeature,
	rowSortingFeature
});

export type DataTableFeatures = typeof features;
