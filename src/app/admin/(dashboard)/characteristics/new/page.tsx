
import { CharacteristicForm } from '@/components/admin/characteristics/CharacteristicForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCharacteristicPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <Link href="/admin/characteristics" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition">
                <ArrowLeft className="w-4 h-4" />
                Back to Dictionary
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-6">Create Characteristic</h1>
                <CharacteristicForm initialData={null} onClose={() => {}} onSuccess={() => {}} />
            </div>
        </div>
    );
}
