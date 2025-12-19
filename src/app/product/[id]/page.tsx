
import { ProductService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import { ProductPageContent } from '@/components/ProductPageContent';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await ProductService.getById(Number(id));

    if (!product) {
        notFound();
    }

    return <ProductPageContent product={product} />;
}
