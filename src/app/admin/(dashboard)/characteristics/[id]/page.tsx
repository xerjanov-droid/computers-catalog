
import { CharacteristicForm } from '@/components/admin/characteristics/CharacteristicForm';
import { CharacteristicService } from '@/services/characteristic.service';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: {
        id: string;
    }
}

// Next.js 15+ params are async
export default async function EditCharacteristicPage({ params }: Props) {
    const { id } = await Promise.resolve(params); // Handle promise nature if strict next 15
    const charId = parseInt(id);

    if (isNaN(charId)) notFound();

    const characteristic = await CharacteristicService.getById(charId);

    if (!characteristic) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Link href="/admin/characteristics" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition">
                <ArrowLeft className="w-4 h-4" />
                Back to Dictionary
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-6">Edit Characteristic: {characteristic.name_ru}</h1>
                <CharacteristicForm initialData={characteristic} />
            </div>
        </div>
    );
}
