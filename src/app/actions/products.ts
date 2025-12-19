'use server';

import { ProductService } from '@/services/product.service';
import { revalidatePath } from 'next/cache';

export async function bulkUpdateStatus(ids: number[], status: string) {
    try {
        await ProductService.bulkUpdateStatus(ids, status);
        revalidatePath('/admin/products');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function bulkDeleteProducts(ids: number[]) {
    try {
        await ProductService.bulkDelete(ids);
        revalidatePath('/admin/products');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function duplicateProduct(id: number) {
    try {
        const newProduct = await ProductService.duplicate(id);
        revalidatePath('/admin/products');
        return { success: true, newId: newProduct.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
