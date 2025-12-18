import { ProductForm } from '@/components/ProductForm';
import { ProductService } from '@/services/product.service';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await ProductService.getById(Number(id));

    if (!product) notFound();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Edit Product: {product.model}</h2>
            <ProductForm initialData={product} />
        </div>
    );
}
