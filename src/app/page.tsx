import { CategoryService } from '@/services/category.service';
import { ProductService } from '@/services/product.service';
import { SearchBar } from '@/components/SearchBar';
import { CategorySlider } from '@/components/CategorySlider';
import { ProductCard } from '@/components/ProductCard';
import { FloatingManagerButton } from '@/components/FloatingManagerButton';
import { FilterWrapper } from '@/components/FilterWrapper';
import { TranslatedText } from '@/components/TranslatedText';
import { ClientOnly } from '@/components/ClientOnly';

export const dynamic = 'force-dynamic';

import { SubCategoryList } from '@/components/SubCategoryList';
import { CurrentCategoryTitle } from '@/components/CurrentCategoryTitle';

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

  // Helper to parse comma-separated params
  const parseArrayParam = (param?: string | string[]) => {
    if (!param) return undefined;
    const str = Array.isArray(param) ? param[0] : param;
    return str.split(',').filter(Boolean);
  };

  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  // Parse technology and color as arrays
  const technology = parseArrayParam(resolvedParams.technology as string);
  const color = parseArrayParam(resolvedParams.color as string);
  const availability = parseArrayParam(resolvedParams.availability as string);

  const price_from = resolvedParams.price_from ? Number(resolvedParams.price_from) : undefined;
  const price_to = resolvedParams.price_to ? Number(resolvedParams.price_to) : undefined;

  // Wifi is boolean-ish 'true'
  const wifi = resolvedParams.wifi === 'true';

  // Find active root to get its children
  const activeRoot = categoryId ? categoryTree.find(c => c.id === categoryId) : undefined;
  const subCategories = activeRoot?.children || [];

  const products = await ProductService.getAll({
    category: categoryId,
    sub: subId,
    search: search,
    technology: technology,
    color: color,
    wifi: wifi ? true : undefined,
    availability: availability,
    price_from,
    price_to,
  });

  // Hydration fix handled by wrapper now

  return (
    <ClientOnly>
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
              <CurrentCategoryTitle
                category={subId ? subCategories.find(s => s.id === subId) : activeRoot}
              />
            </h2>
            {/* Pass inferred category slug. Logic: Use english name lowercased, fallback to printers if needed for testing */}
            <FilterWrapper categorySlug={activeRoot?.name_en.toLowerCase()} />
          </section>

          <section className="px-4 grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-2 text-center py-10 text-[var(--tg-theme-hint-color)]">
                <TranslatedText i18nKey="nothing_found" />
              </div>
            )}
          </section>
        </div>

        <FloatingManagerButton />
      </main>
    </ClientOnly>
  );
}
