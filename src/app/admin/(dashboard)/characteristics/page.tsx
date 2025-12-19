
import { CharacteristicService } from '@/services/characteristic.service';
import { CharacteristicsTable } from '@/components/admin/characteristics/CharacteristicsTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CharacteristicsPage() {
    const characteristics = await CharacteristicService.getAll();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Characteristics Dictionary</h1>
                    <p className="text-gray-500">Manage all possible product specifications</p>
                </div>
                <Link
                    href="/admin/characteristics/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Characteristic
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <CharacteristicsTable initialData={characteristics} />
            </div>
        </div>
    );
}
