import { Suspense } from 'react';
import { CategoryService } from '@/services/category.service';
import { ProductService } from '@/services/product.service';
import { SearchBar } from '@/components/SearchBar';
import { CategorySlider } from '@/components/CategorySlider';
import { ProductCard } from '@/components/ProductCard';
import { FloatingManagerButton } from '@/components/FloatingManagerButton';
import { Filters } from '@/components/Filters';

export const dynamic = 'force-dynamic';

import { SubCategoryList } from '@/components/SubCategoryList';

// ... imports

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;

  // KEY CHANGE: Fetch Tree, not just flat list
  const categoryTree = await CategoryService.getTree();

  const categoryId = resolvedParams.category ? Number(resolvedParams.category) : undefined;
  const subId = resolvedParams.sub ? Number(resolvedParams.sub) : undefined;

  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const technology = typeof resolvedParams.technology === 'string' ? resolvedParams.technology : undefined;

  // Find active root to get its children
  const activeRoot = categoryId ? categoryTree.find(c => c.id === categoryId) : undefined;
  const subCategories = activeRoot?.children || [];

  const products = await ProductService.getAll({
    category: categoryId,
    sub: subId,
    search: search,
    technology: technology,
  });

  return (
    <main className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
      <SearchBar />

      <div className="space-y-2 pb-20">
        <section>
          {/* Main Categories */}
          <CategorySlider categories={categoryTree} />

          {/* Sub Categories (if Main selected) */}
          {categoryId && (
            <SubCategoryList subCategories={subCategories} parentId={categoryId} />
          )}
        </section>

        <section className="px-5 flex justify-between items-center pt-2">
          <h2 className="text-xl font-extrabold text-[#111827]">
            {subId
              ? subCategories.find(s => s.id === subId)?.name_ru
              : (activeRoot ? activeRoot.name_ru : 'Популярное')}
          </h2>
          <Filters />
        </section>

        <section className="px-4 grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-2 text-center py-10 text-[var(--tg-theme-hint-color)]">
              Ничего не найдено 😔
            </div>
          )}
        </section>
      </div>

      <FloatingManagerButton />
    </main>
  );
}
