'use client';

import { Product, Characteristic } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImageGallery } from './ImageGallery';
import { 
    AlertTriangle, 
    Save, 
    Package, 
    DollarSign, 
    Globe, 
    Wifi, 
    Printer, 
    Palette,
    FolderTree,
    Settings,
    CheckCircle2,
    Loader2,
    Image as ImageIcon,
    X
} from 'lucide-react';

import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface ProductFormProps {
    initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const { t, language } = useAdminLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);


    // Category state
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedMain, setSelectedMain] = useState<number | undefined>(undefined);

    // Initial load & Reset
    useEffect(() => {
        // Fetch categories
        fetch('/api/categories').then(res => res.json()).then(data => {
            setCategories(data);
        });
    }, []);

    // State for form data
    const [formData, setFormData] = useState<Partial<Product>>({
        status: 'in_stock',
        technology: 'laser',
        currency: 'UZS',
        wifi: false,
        duplex: false,
    });

    // Dynamic Specs State
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [specs, setSpecs] = useState<Record<string, any>>({});

    // Sync specs from initialData to local state
    useEffect(() => {
        if (initialData?.specs) {
            setSpecs(initialData.specs);
        }
    }, [initialData]);

    // Update formData when specs change
    useEffect(() => {
        setFormData(prev => ({ ...prev, specs }));
    }, [specs]);

    // Fetch characteristics when category changes
    useEffect(() => {
        if (formData.category_id) {
            console.log('Fetching chars for:', formData.category_id);
            fetch(`/api/admin/categories/${formData.category_id}/characteristics`)
                .then(res => res.json())
                .then(data => {
                    console.log('Received chars:', data);
                    setCharacteristics(data)
                })
                .catch(err => console.error(err));
        } else {
            setCharacteristics([]);
        }
    }, [formData.category_id]);

    // Form Population from props (TT: 2.1)
    useEffect(() => {
        if (initialData) {
            // Map legacy 'on_order' to 'pre_order' if present
            const safeStatus = (initialData.status as string) === 'on_order' ? 'pre_order' : initialData.status;

            setFormData({
                ...initialData,
                status: safeStatus,
                brand: initialData.brand || '',
                model: initialData.model || '',
                sku: initialData.sku || '',
                title_ru: initialData.title_ru || '',
                title_uz: initialData.title_uz || '',
                title_en: initialData.title_en || '',
                price: initialData.price || 0,
                currency: initialData.currency || 'UZS',
                wifi: initialData.wifi || false,
                duplex: initialData.duplex || false,
                color_print: initialData.color_print || false,
                technology: initialData.technology || 'laser',
                is_price_visible: initialData.is_price_visible ?? true
            });

            // Set main category if present (using the new API fields or falling back)
            if ((initialData as any).main_category_id) {
                setSelectedMain((initialData as any).main_category_id);
            } else if (initialData.category_id && categories.length > 0) {
                // Find parent category from categories list
                const cat = categories.find(c => c.id === initialData.category_id);
                if (cat && cat.parent_id) {
                    setSelectedMain(cat.parent_id);
                } else if (cat && !cat.parent_id) {
                    // It's a main category itself
                    setSelectedMain(initialData.category_id);
                }
            }
        }
    }, [initialData]);
    
    // Set main category when categories are loaded
    useEffect(() => {
        if (initialData && initialData.category_id && categories.length > 0 && !selectedMain) {
            const cat = categories.find(c => c.id === initialData.category_id);
            if (cat && cat.parent_id) {
                setSelectedMain(cat.parent_id);
            } else if (cat && !cat.parent_id) {
                setSelectedMain(initialData.category_id);
            }
        }
    }, [categories, initialData, selectedMain]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSpecChange = (key: string, value: any) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    const generateArtikul = (mainCategoryId: number | undefined, subCategoryId: number | undefined): string => {
        if (!mainCategoryId || !subCategoryId) return '';
        
        // Kategoriya va subkategoriya ma'lumotlarini topish
        const mainCategory = categories.find(c => c.id === mainCategoryId);
        const subCategory = categories.find(c => c.id === subCategoryId);
        
        // Slug yoki ID dan qisqa kod olish
        let mainCode = mainCategory?.slug?.toUpperCase().substring(0, 3) || `C${mainCategoryId}`;
        let subCode = subCategory?.slug?.toUpperCase().substring(0, 3) || `S${subCategoryId}`;
        
        // Timestamp dan oxirgi 4 raqam
        const timestamp = Date.now().toString().slice(-4);
        
        // Format: {mainCode}-{subCode}-{timestamp}
        return `${mainCode}-${subCode}-${timestamp}`;
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCatId = Number(e.target.value);
        if (Object.keys(specs).length > 0) {
            if (!confirm(t('common.confirm_category_change', 'Change category? Technical specifications will be cleared.'))) {
                return;
            }
            setSpecs({});
        }
        
        // Avtomatik Artikul generatsiya qilish (faqat yangi mahsulot uchun)
        if (!initialData && selectedMain && newCatId) {
            const newArtikul = generateArtikul(selectedMain, newCatId);
            setFormData(prev => ({ ...prev, category_id: newCatId, sku: newArtikul }));
        } else {
            setFormData(prev => ({ ...prev, category_id: newCatId }));
        }
    };

    const handleCancel = () => {
        // Filtrlarni saqlab qolish
        const params = new URLSearchParams();
        
        const categoryId = searchParams.get('category_id');
        const subcategoryId = searchParams.get('subcategory_id');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        
        if (categoryId && categoryId !== 'all') {
            params.set('category_id', categoryId);
        }
        if (subcategoryId && subcategoryId !== 'all') {
            params.set('subcategory_id', subcategoryId);
        }
        if (status && status !== 'all') {
            params.set('status', status);
        }
        if (search) {
            params.set('search', search);
        }
        
        const queryString = params.toString();
        const redirectUrl = queryString ? `/admin/products?${queryString}` : '/admin/products';
        
        router.push(redirectUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation (TT: 3)
        if (!formData.brand || !formData.brand.trim()) {
            alert("Brand is required!");
            return;
        }
        if (!formData.model || !formData.model.trim()) {
            alert("Model is required!");
            return;
        }
        if (!formData.title_uz || !formData.title_uz.trim()) {
            alert("Title (UZ) is required!");
            return;
        }

        setLoading(true);

        try {
            const url = initialData
                ? `/api/admin/products/${initialData.id}`
                : '/api/admin/products';

            const res = await fetch(url, {
                method: initialData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                // Saqlashdan keyin filtrlarni saqlab qolish
                const params = new URLSearchParams();
                
                // Kategoriya va subkategoriya filtrlari
                const categoryId = searchParams.get('category_id');
                const subcategoryId = searchParams.get('subcategory_id');
                const status = searchParams.get('status');
                const search = searchParams.get('search');
                
                if (categoryId && categoryId !== 'all') {
                    params.set('category_id', categoryId);
                }
                if (subcategoryId && subcategoryId !== 'all') {
                    params.set('subcategory_id', subcategoryId);
                }
                if (status && status !== 'all') {
                    params.set('status', status);
                }
                if (search) {
                    params.set('search', search);
                }
                
                const queryString = params.toString();
                const redirectUrl = queryString ? `/admin/products?${queryString}` : '/admin/products';
                
                router.push(redirectUrl);
                router.refresh();
            } else {
                alert('Error saving product');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                {/* Product Details Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white">{t('product_form.product_details', 'Product Details')}</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Category Selection - Moved to top */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FolderTree className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-bold text-gray-900">{t('product_form.category', 'Category')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.main_category', 'Main Category')}
                                    </label>
                                    <select
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                        value={selectedMain}
                                        onChange={(e) => {
                                            const newMainId = Number(e.target.value);
                                            setSelectedMain(newMainId);
                                            // Reset sub category va Artikul (yangi mahsulot uchun)
                                            if (!initialData) {
                                                setFormData(prev => ({ ...prev, category_id: undefined, sku: '' }));
                                            } else {
                                                setFormData(prev => ({ ...prev, category_id: undefined }));
                                            }
                                        }}
                                    >
                                        <option value="">{t('filters.select_category', 'Select Main Category...')}</option>
                                        {categories.filter(c => !c.parent_id).map(c => (
                                            <option key={c.id} value={c.id}>{c[`name_${language}` as keyof typeof c] || c.name_ru}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.sub_category', 'Sub Category')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category_id"
                                        required
                                        className={`w-full border-2 p-3 rounded-xl focus:ring-2 outline-none transition-all ${
                                            !selectedMain 
                                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 bg-gray-50 focus:bg-white'
                                        }`}
                                        value={formData.category_id || ''}
                                        onChange={handleCategoryChange}
                                        disabled={!selectedMain}
                                    >
                                        <option value="">{selectedMain ? t('filters.select_subcategory', 'Select Sub Category...') : t('filters.select_main_first', 'Select main category first')}</option>
                                        {categories.filter(c => c.parent_id === selectedMain).map(c => (
                                            <option key={c.id} value={c.id}>{c[`name_${language}` as keyof typeof c] || c.name_ru}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.brand', 'Brand')} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="brand" 
                                        required 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                        value={formData.brand || ''} 
                                        onChange={handleChange}
                                        placeholder="Enter brand name"
                                    />
                                </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('product.model', 'Model')} <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    name="model" 
                                    required 
                                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                    value={formData.model || ''} 
                                    onChange={handleChange}
                                    placeholder="Enter model name"
                                />
                            </div>
                        </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('product_form.sku', 'SKU')} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                name="sku" 
                                required 
                                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                value={formData.sku || ''} 
                                onChange={handleChange}
                                placeholder="Enter SKU"
                            />
                        </div>

                        {/* Localized Titles */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-gray-900">{t('product_form.localized_titles', 'Localized Titles')}</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.title_uz', 'Title (UZ)')} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="title_uz" 
                                        required 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                        value={formData.title_uz || ''} 
                                        onChange={handleChange}
                                        placeholder="Uzbek title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.title_ru', 'Title (RU)')}
                                    </label>
                                    <input 
                                        name="title_ru" 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                        value={formData.title_ru || ''} 
                                        onChange={handleChange}
                                        placeholder="Russian title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.title_en', 'Title (EN)')}
                                    </label>
                                    <input 
                                        name="title_en" 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                        value={formData.title_en || ''} 
                                        onChange={handleChange}
                                        placeholder="English title"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-bold text-gray-900">{t('product_form.pricing', 'Pricing')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('common.price', 'Price')} <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        name="price" 
                                        type="number" 
                                        required 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50 focus:bg-white" 
                                        value={formData.price || 0} 
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('product_form.currency', 'Currency')} <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="currency" 
                                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all bg-gray-50 focus:bg-white font-medium" 
                                        value={formData.currency} 
                                        onChange={handleChange}
                                    >
                                        <option value="UZS">UZS (Uzbekistani Som)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Features Section - Only for Принтеры and МФУ */}
                        {(() => {
                            const selectedCategory = formData.category_id 
                                ? categories.find(c => c.id === formData.category_id)
                                : null;
                            const isPrinterOrMFP = selectedCategory && (
                                selectedCategory.name_ru === 'Принтеры' || 
                                selectedCategory.name_ru === 'МФУ'
                            );
                            
                            if (!isPrinterOrMFP) return null;
                            
                            return (
                                <div className="border-t pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Settings className="w-5 h-5 text-purple-600" />
                                        <h3 className="text-lg font-bold text-gray-900">{t('product_form.features', 'Features')}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                                            <div className="relative">
                                                <input 
                                                    name="wifi" 
                                                    type="checkbox" 
                                                    checked={formData.wifi} 
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wifi className={`w-5 h-5 ${formData.wifi ? 'text-purple-600' : 'text-gray-400'} group-hover:text-purple-500 transition-colors`} />
                                                <span className={`font-medium ${formData.wifi ? 'text-gray-900' : 'text-gray-600'}`}>Wi-Fi</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                                            <div className="relative">
                                                <input 
                                                    name="duplex" 
                                                    type="checkbox" 
                                                    checked={formData.duplex} 
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Printer className={`w-5 h-5 ${formData.duplex ? 'text-purple-600' : 'text-gray-400'} group-hover:text-purple-500 transition-colors`} />
                                                <span className={`font-medium ${formData.duplex ? 'text-gray-900' : 'text-gray-600'}`}>Duplex</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                                            <div className="relative">
                                                <input 
                                                    name="color_print" 
                                                    type="checkbox" 
                                                    checked={formData.color_print} 
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Palette className={`w-5 h-5 ${formData.color_print ? 'text-purple-600' : 'text-gray-400'} group-hover:text-purple-500 transition-colors`} />
                                                <span className={`font-medium ${formData.color_print ? 'text-gray-900' : 'text-gray-600'}`}>Color Print</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </div>

                {/* Technical Specifications */}
                {characteristics.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-white" />
                                    <h3 className="text-xl font-bold text-white">{t('product_form.technical_specs', 'Technical Specifications')}</h3>
                                </div>
                                <span className="text-sm font-semibold text-white bg-white/20 px-3 py-1 rounded-full">
                                    {characteristics.length} {t('product_form.fields', 'fields')}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {characteristics.map(char => (
                                    <div key={char.id} className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        {char[`name_${language}` as keyof Characteristic] || char.name_ru || char.key}
                                            {(char as any).is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {char.type === 'boolean' ? (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={!!specs[char.key]}
                                                        onChange={(e) => handleSpecChange(char.key, e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                                <span className={`text-sm font-medium ${specs[char.key] ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                    {specs[char.key] ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        ) : char.type === 'select' ? (
                                            <select
                                                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                                value={specs[char.key] || ''}
                                                onChange={(e) => handleSpecChange(char.key, e.target.value)}
                                            >
                                                <option value="">Select an option...</option>
                                                {char.options?.map((opt: any) => (
                                                    <option key={opt.id || opt.value} value={opt.value}>
                                                        {opt[`label_${language}`] || opt.label_ru || opt.value}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={char.type === 'number' ? 'number' : 'text'}
                                                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                                value={specs[char.key] || ''}
                                                onChange={(e) => handleSpecChange(char.key, e.target.value)}
                                                placeholder={`Enter ${char.key}...`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            {t('product_form.product_status', 'Product Status')}
                        </label>
                        <select 
                            name="status" 
                            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white font-medium" 
                            value={formData.status} 
                            onChange={handleChange}
                        >
                            <option value="in_stock">{t('statuses.in_stock')}</option>
                            <option value="pre_order">{t('statuses.pre_order')}</option>
                            <option value="showroom">{t('statuses.showroom')}</option>
                            <option value="archived">{t('statuses.archived')}</option>
                        </select>
                    </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex gap-4">
                    <button 
                        type="submit"
                        disabled={loading} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{t('common.saving', 'Saving...')}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{t('product_form.save_product', 'Save')}</span>
                            </>
                        )}
                    </button>
                    <button 
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        <span>{t('common.cancel', 'Cancel')}</span>
                    </button>
                </div>
            </form>

            {/* Right Column: Images */}
            <div className="lg:col-span-1">
                {initialData && initialData.id ? (
                    <div className="sticky top-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-white" />
                                    <h2 className="text-xl font-bold text-white">{t('product_form.product_images', 'Product Images')}</h2>
                                </div>
                            </div>
                        </div>
                        <ImageGallery
                            productId={initialData.id}
                            initialImages={initialData.images || []}
                        />
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
                        <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl inline-block mb-4">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">{t('product_form.save_first', 'Save the product first to upload images')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
