import type { PageServerLoad, Actions } from './$types';

const mockProducts = [
    { serialNumber: '10170', status: 'Active', type: 'Pad Pro+', userId: 'DK-1080' },
    { serialNumber: '38491', status: 'Inactive', type: 'Pad Home', userId: 'DE-0789' }
]

export const load: PageServerLoad = async ({ params }) => {
    const foundProduct = mockProducts.find(p => p.serialNumber === params.serialNumber);
    
    const product = foundProduct ?? {
        serialNumber: params.serialNumber,
        status: 'Inactive',
        type: 'Unknown',
        userId: 'DK-0000'
    }

    return {
        product
    }
}
/*
export const actions: Actions = {
    default: async ({ request, params }) => {
        await request.formData()


    }
};
*/