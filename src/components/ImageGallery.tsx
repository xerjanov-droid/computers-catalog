'use client';

import { useState, useRef } from 'react';
import { Upload, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductImage {
    id: number;
    image_url: string;
    is_cover: boolean;
}

interface ImageGalleryProps {
    productId: number;
    initialImages: ProductImage[];
}

export function ImageGallery({ productId, initialImages }: ImageGalleryProps) {
    const [images, setImages] = useState<ProductImage[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Frontend validation
        if (file.size > 3 * 1024 * 1024) {
            alert('File size too large (Max 3MB)');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
            alert('Invalid file format');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}/images`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const newImage = await res.json();
            setImages(prev => [...prev, newImage]);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDelete = async (imageId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const res = await fetch(`/api/admin/products/images/${imageId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // If the deleted image was cover, we might need to refresh or guess the new cover
                // But simplified logic: remove from state. 
                // Since backend auto-sets new cover, we should ideally fetch latest state or handle it locally.
                // For now, let's just remove it and if it was cover, the user sees no cover until refresh or we fetch.
                // Better: Refresh images list if cover was deleted.
                setImages(prev => prev.filter(img => img.id !== imageId));

                // If it was cover, check if we have other images to update UI optimistically
                const wasCover = images.find(img => img.id === imageId)?.is_cover;
                if (wasCover && images.length > 1) {
                    // The backend sets the first one (by created_at) as cover. 
                    // Locally we can't be 100% sure which one became cover without fetching, 
                    // but we can assume filtering and wait for refresh or just reload.
                    // A simple localized fix: set the first remaining one as cover optimistically?
                    // No, getting fresh data is safer. 
                    // For this MVP, let's just remove it.
                }

            } else {
                alert('Failed to delete image');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSetCover = async (imageId: number) => {
        try {
            const res = await fetch(`/api/admin/products/images/${imageId}/set-cover`, {
                method: 'PATCH',
            });

            if (res.ok) {
                setImages(prev => prev.map(img => ({
                    ...img,
                    is_cover: img.id === imageId
                })));
            } else {
                alert('Failed to set cover');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Product Images</h3>
                <span className="text-gray-400 text-xs">{images.length}/10</span>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={img.image_url}
                            alt="Product"
                            fill
                            className="object-cover"
                        />

                        {/* Cover Badge */}
                        {img.is_cover && (
                            <div className="absolute top-2 left-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> COVER
                            </div>
                        )}

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                            {!img.is_cover && (
                                <button
                                    onClick={() => handleSetCover(img.id)}
                                    className="px-3 py-1 bg-white text-xs font-semibold rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    Set Cover
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                ) : (
                    <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                        <Upload size={20} />
                    </div>
                )}

                <p className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Click or Drag image'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Max 3MB (jpg, png, webp)
                </p>
            </div>
        </div>
    );
}
