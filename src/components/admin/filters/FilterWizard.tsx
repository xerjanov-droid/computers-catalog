'use client';

import { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { X, ChevronRight, Check } from 'lucide-react';

interface Characteristic {
    id: number;
    key: string;
    name_ru: string;
    name_uz: string;
    name_en: string;
    type: string;
}

interface FilterWizardProps {
    subcategoryId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export function FilterWizard({ subcategoryId, onClose, onSuccess }: FilterWizardProps) {
    const { t, language } = useAdminLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);

    // Form State
    const [sourceType, setSourceType] = useState<'characteristic' | 'custom'>('characteristic');
    const [selectedCharId, setSelectedCharId] = useState<string>('');
    const [customKey, setCustomKey] = useState(''); // for custom source

    const [filterType, setFilterType] = useState<'select' | 'range' | 'checkbox'>('select');

    const [labels, setLabels] = useState({ ru: '', uz: '', en: '' });
    const [settings, setSettings] = useState({
        min: '',
        max: '',
        isMultiselect: false,
        orderIndex: 0
    });

    useEffect(() => {
        // Fetch characteristics
        fetch('/api/admin/characteristics')
            .then(res => res.json())
            .then(data => setCharacteristics(data))
            .catch(err => console.error(err));
    }, []);

    // Auto-fill labels when characteristic is selected
    useEffect(() => {
        if (sourceType === 'characteristic' && selectedCharId) {
            const char = characteristics.find(c => c.id.toString() === selectedCharId);
            if (char) {
                setLabels({
                    ru: char.name_ru,
                    uz: char.name_uz,
                    en: char.name_en
                });
                // Suggest type
                if (char.type === 'number') setFilterType('range');
                else if (char.type === 'boolean') setFilterType('checkbox');
                else setFilterType('select');
            }
        }
    }, [selectedCharId, characteristics, sourceType]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                subcategory_id: subcategoryId,
                characteristic_id: sourceType === 'characteristic' ? parseInt(selectedCharId) : null,
                source_type: sourceType,
                type: filterType,
                label_ru: labels.ru,
                label_uz: labels.uz,
                label_en: labels.en,
                min_value: settings.min ? parseFloat(settings.min) : null,
                max_value: settings.max ? parseFloat(settings.max) : null,
                is_multiselect: settings.isMultiselect,
                order_index: settings.orderIndex
            };

            const res = await fetch('/api/admin/filters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert('Error creating filter');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add New Filter - Step {step}/3</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="font-medium text-lg">Select Source</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSourceType('characteristic')}
                                    className={`p-4 border rounded-xl text-left transition-all ${sourceType === 'characteristic' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-bold">From Characteristic</div>
                                    <div className="text-sm text-gray-500 mt-1">Link to existing spec (RAM, CPU)</div>
                                </button>
                                <button
                                    onClick={() => setSourceType('custom')}
                                    className={`p-4 border rounded-xl text-left transition-all ${sourceType === 'custom' ? 'ring-2 ring-purple-500 border-transparent bg-purple-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-bold">Custom</div>
                                    <div className="text-sm text-gray-500 mt-1">Price, Brand, Availability</div>
                                </button>
                            </div>

                            {sourceType === 'characteristic' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Choose Characteristic</label>
                                    <select
                                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedCharId}
                                        onChange={(e) => setSelectedCharId(e.target.value)}
                                        size={5}
                                    >
                                        <option value="" disabled>-- Select --</option>
                                        {characteristics.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name_ru} ({c.key})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4">
                                        Custom filters are not linked to generic specs. Use this for Price ranges or manual filtering logic.
                                    </div>
                                    <label className="block text-sm font-medium mb-2">System Key (unique)</label>
                                    <input
                                        className="w-full p-3 border rounded-xl"
                                        placeholder="e.g. price_range"
                                        value={customKey}
                                        onChange={(e) => setCustomKey(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="font-medium text-lg">Filter UI Type</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'select', label: 'Dropdown / Select', desc: 'List of options' },
                                    { id: 'range', label: 'Range Slider', desc: 'Min / Max values' },
                                    { id: 'checkbox', label: 'Checkbox', desc: 'On / Off' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFilterType(type.id as any)}
                                        className={`p-4 border rounded-xl text-left transition-all ${filterType === type.id ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="font-bold">{type.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="font-medium text-lg">Configuration</h3>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (RU)</label>
                                    <input className="w-full p-2 border rounded-lg" value={labels.ru} onChange={e => setLabels({ ...labels, ru: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (UZ)</label>
                                    <input className="w-full p-2 border rounded-lg" value={labels.uz} onChange={e => setLabels({ ...labels, uz: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label (EN)</label>
                                    <input className="w-full p-2 border rounded-lg" value={labels.en} onChange={e => setLabels({ ...labels, en: e.target.value })} />
                                </div>
                            </div>

                            {filterType === 'range' && (
                                <div className="p-4 bg-gray-50 rounded-xl space-y-4 border">
                                    <h4 className="font-bold text-sm">Range Settings</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm mb-1">Min Value (Optional)</label>
                                            <input type="number" className="w-full p-2 border rounded" placeholder="0" value={settings.min} onChange={e => setSettings({ ...settings, min: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">Max Value (Optional)</label>
                                            <input type="number" className="w-full p-2 border rounded" placeholder="10000" value={settings.max} onChange={e => setSettings({ ...settings, max: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filterType === 'select' && (
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded"
                                            checked={settings.isMultiselect}
                                            onChange={e => setSettings({ ...settings, isMultiselect: e.target.checked })}
                                        />
                                        <span className="font-medium">Allow Multi-select</span>
                                    </label>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Order Priority</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border rounded-xl"
                                    value={settings.orderIndex}
                                    onChange={e => setSettings({ ...settings, orderIndex: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex items-center justify-between bg-gray-50">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(prev => prev - 1)}
                            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && sourceType === 'characteristic' && !selectedCharId) return alert('Select a characteristic');
                                setStep(prev => prev + 1);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200"
                        >
                            {loading ? 'Saving...' : 'Create Filter'} <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
