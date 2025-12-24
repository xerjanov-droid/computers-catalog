import { cookies as nextCookies } from 'next/headers';

import { CategoryService } from '@/services/category.service';
import { ProductService } from '@/services/product.service';

import { SearchBar } from '@/components/SearchBar';
import { CategorySlider } from '@/components/CategorySlider';
import { ProductCard } from '@/components/ProductCard';
import { FloatingManagerButton } from '@/components/FloatingManagerButton';
import { FilterWrapper } from '@/components/FilterWrapper';
import { TranslatedText } from '@/components/TranslatedText';
import { ClientOnly } from '@/components/ClientOnly';
import { SubCategoryList } from '@/components/SubCategoryList';
import { CurrentCategoryTitle } from '@/components/CurrentCategoryTitle';
import { SortSelector } from '@/components/SortSelector';
import { TelegramLang } from '@/components/TelegramLang';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  /* ========= LANGUAGE (SERVER) ========= */
  let lang: 'ru' | 'uz' | 'en' = 'uz';

  try {
    const cookieStore = nextCookies();
    const cookieLang = cookieStore.get('active_lang')?.value;
    if (cookieLang && ['ru', 'uz', 'en'].includes(cookieLang)) {
      lang = cookieLang as 'ru' | 'uz' | 'en';
    }
  } catch {
    // ignore
  }

  if (
    typeof searchParams.lang === 'string' &&
    ['ru', 'uz', 'en'].includes(searchParams.lang)
  ) {
    lang = searchParams.lang as 'ru' | 'uz' | 'en';
  }

  /* ========= DATA ========= */
  const categoryTree = await CategoryService.getTree(lang);

  const categoryId = searchParams.category
    ? Number(searchParams.category)
    : undefined;

  const subId = searchParams.sub
    ? Number(searchParams.sub)
    : undefined;

  const parseArray = (v?: string | string[]) => {
    if (!v) return undefined;
    const s = Array.isArray(v) ? v[0] : v;
    return s.split(',').filter(Boolean);
  };

  const products = await ProductService.getAll({
    category: categoryId,
    sub: subId,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    technology: parseArray(searchParams.technology),
    color: parseArray(searchParams.color),
    availability: parseArray(searchParams.availability),
    wifi: searchParams.wifi === 'true' ? true : undefined,
    price_from: searchParams.price_from ? Number(searchParams.price_from) : undefined,
    price_to: searchParams.price_to ? Number(searchParams.price_to) : undefined,
    sort:
      typeof searchParams.sort === 'string'
        ? (searchParams.sort as any)
        : 'popular',
    lang,
  });

  const activeRoot = categoryId
    ? categoryTree.find(c => c.id === categoryId)
    : undefined;

  const subCategories = activeRoot?.children || [];

  const selectedCategory = subId
    ? subCategories.find(s => s.id === subId)
    : activeRoot;

  return (
    <ClientOnly>
      <main className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
        <SearchBar />

        <div className="space-y-2 pb-20">
          <section>
            <CategorySlider categories={categoryTree} />

            {categoryId && (
              <SubCategoryList
                subCategories={subCategories}
                parentId={categoryId}
              />
            )}
          </section>

          <section className="px-5 flex justify-between items-center pt-2 gap-3">
            <h2 className="text-xl font-extrabold text-[#111827] flex-1">
              <CurrentCategoryTitle category={selectedCategory} />
            </h2>

            <div className="flex items-center gap-2">
              <SortSelector />
              <FilterWrapper categorySlug={activeRoot?.slug} />
            </div>
          </section>

          <section className="px-4 grid grid-cols-2 gap-3">
            {products.map(product => (
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
      <TelegramLang />
    </ClientOnly>

  );
}
