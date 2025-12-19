'use server';

import { CharacteristicService } from '@/services/characteristic.service';
import { revalidatePath } from 'next/cache';

export async function createCharacteristic(data: any) {
    try {
        await CharacteristicService.create(data);
        revalidatePath('/admin/characteristics');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateCharacteristic(id: number, data: any) {
    try {
        await CharacteristicService.update(id, data);
        revalidatePath('/admin/characteristics');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
