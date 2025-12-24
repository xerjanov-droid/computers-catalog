'use client';
import { CategoryService } from '@/services/category.service';
import { cookies as nextCookies } from 'next/headers';
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
import { SortSelector } from '@/components/SortSelector';

// ... imports

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;

  // KEY CHANGE: Fetch Tree, not just flat list
  // Server-side language detection: prefer cookie `active_lang`, then query param `lang`, fallback to 'uz'
  let lang: 'ru' | 'uz' | 'en' = 'uz';
  try {
    const cookieStore = await nextCookies();
    const cookieLang = cookieStore.get('active_lang')?.value;
    if (cookieLang && ['ru', 'uz', 'en'].includes(cookieLang)) lang = cookieLang as 'ru' | 'uz' | 'en';
  } catch (e) {
    // ignore
  }
  // allow override via query param (e.g., ?lang=en)
  if (typeof resolvedParams.lang === 'string' && ['ru', 'uz', 'en'].includes(resolvedParams.lang)) {
    lang = resolvedParams.lang as 'ru' | 'uz' | 'en';
  }

  const categoryTree = await CategoryService.getTree(lang);

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

  // Sort parameter
  const sort = typeof resolvedParams.sort === 'string'
    ? resolvedParams.sort as 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'stock' | 'name_asc'
    : 'popular'; // Default to popular

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
    sort: sort,
    lang,
  });

  // Map products to include a single `category_name` selected for the server-rendered language
  const selectedProducts = products.map((p: any) => ({
    ...p,
    category_name: p.category_name || p[`category_name_${lang}`] || p.category_name_en || p.category_name_ru || p.category_name_uz || null
  }));

  // Prepare server-provided display name - use the resolved 'name' field from category
  const selectedCategory = subId ? subCategories.find(s => s.id === subId) : activeRoot;
  const serverDisplayName = selectedCategory?.name || null;

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



          <section className="px-5 flex justify-between items-center pt-2 gap-3">
            <h2 className="text-xl font-extrabold text-[#111827] flex-1">
              <CurrentCategoryTitle
                category={subId ? subCategories.find(s => s.id === subId) : activeRoot}
                // server-provided display name in the selected language
                displayName={serverDisplayName}
              />
            </h2>
            <div className="flex items-center gap-2">
              <SortSelector />
              {/* Pass category slug (language-independent) so filters work for SSR */}
              <FilterWrapper categorySlug={activeRoot?.slug} />
            </div>
          </section>

          <section className="px-4 grid grid-cols-2 gap-3">
            {selectedProducts.map((product) => (
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
import { useEffect, useState } from 'react';

export default function Page() {
  const [lang, setLang] = useState('uz');

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user && user.language_code) {
        setLang(user.language_code);
      }
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      Til: {lang}
    </div>
  );
}
